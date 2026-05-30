/*
   VaaniBank AI — Customer Panel WebSocket Hook
   Union Bank of India | Team Vectora
   */

import { useRef, useCallback, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { WS_BASE_URL } from "../constants";
import useCustomerStore from "../context/AppContext";

const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second

export function useWebSocket() {
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const lastTokenRef = useRef(null);
  const intentionalCloseRef = useRef(false);
  const pendingStaffTextRef = useRef(null); // text from staff_message (pre-TTS)
  const staffMsgFallbackRef = useRef(null); // timeout handle for TTS-fail fallback
  const isFallbackFiredRef = useRef(false); // flags if fallback timer fired before audio_ready arrived

  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // Store actions
  const setStaffMessage = useCustomerStore((s) => s.setStaffMessage);
  const setStatus = useCustomerStore((s) => s.setStatus);
  const endSessionStore = useCustomerStore((s) => s.endSession);

  // Cleanup helper
  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // Audio playback is handled exclusively by LiveSessionPage via the store.

  // Navigation callback ref
  const navigateRef = useRef(null);

  const setNavigate = useCallback((navigateFn) => {
    navigateRef.current = navigateFn;
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback(
    (event) => {
      let parsed;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        console.warn("[WS] Failed to parse message:", event.data);
        return;
      }

      const { type, data } = parsed;

      if (import.meta.env.DEV) {
        console.log(
          `%c[WS] ← ${type}`,
          "color: #7C3AED; font-weight: bold;",
          data,
        );
      }

      switch (type) {
        case "session_connected": {
          setStatus("active");
          toast.success("Connected to staff", { icon: "🏦", duration: 3000 });
          break;
        }

        case "staff_typing": {
          // Immediate indicator: staff clicked respond, TTS is generating
          useCustomerStore.getState().setStaffTyping(true);
          // Safety: auto-clear if audio_ready never arrives (TTS failure)
          setTimeout(() => {
            useCustomerStore.getState().setStaffTyping(false);
          }, 15000);
          break;
        }

        case "audio_ready": {
          // Cancel the TTS-fail fallback timer — audio arrived in time
          if (staffMsgFallbackRef.current) {
            clearTimeout(staffMsgFallbackRef.current);
            staffMsgFallbackRef.current = null;
          }
          pendingStaffTextRef.current = null;
          useCustomerStore.getState().setStaffTyping(false);

          if (data?.staff_response || data?.text) {
            const textContent = data.staff_response || data.text;
            if (isFallbackFiredRef.current) {
              // Fallback timer already fired and created the bubble, so just update its audio URL
              useCustomerStore.getState().updateLastMessageAudio(data.audio_url || null);
              isFallbackFiredRef.current = false;
            } else {
              // setStaffMessage called ONCE here — with text + audio URL
              setStaffMessage(
                textContent,
                data.audio_url || null,
              );
            }
          }
          break;
        }

        case "staff_message": {
          // Store text but do NOT call setStaffMessage yet.
          // audio_ready will call it with the audio URL (avoids double staffMessageSeq increment).
          // If TTS fails and audio_ready never arrives, the fallback timer shows text-only.
          if (data?.text) {
            pendingStaffTextRef.current = data.text;
            isFallbackFiredRef.current = false; // Reset fallback fired state
            if (staffMsgFallbackRef.current)
              clearTimeout(staffMsgFallbackRef.current);
            staffMsgFallbackRef.current = setTimeout(() => {
              if (pendingStaffTextRef.current) {
                isFallbackFiredRef.current = true;
                setStaffMessage(pendingStaffTextRef.current, null);
                pendingStaffTextRef.current = null;
              }
              staffMsgFallbackRef.current = null;
            }, 15000); // Extended timeout to 15 seconds to give plenty of time for slower regional TTS
          }
          break;
        }

        case "all_info_collected": {
          // Auto-trigger when backend detects all info + docs collected
          // Just show celebration UI/toast, do NOT duplicate fallback timer/bubble logic.
          // The standalone 'staff_message' + 'audio_ready' events sent by the backend handle the bubble.
          
          // Fire a custom DOM event so LiveSessionPage can show celebration UI
          window.dispatchEvent(
            new CustomEvent("vaani_all_info_collected", { detail: data }),
          );
          toast.success(
            data?.text?.slice(0, 80) || "\u2705 Sari jankari collect ho gayi!",
            { duration: 6000, icon: "\uD83C\uDF89" },
          );
          break;
        }

        case "transcription_ready": {
          // Staff sees transcription; customer sees acknowledgement
          if (data?.text_translated) {
            toast("Staff received your message", {
              icon: "✅",
              duration: 2000,
            });
          }
          window.dispatchEvent(
            new CustomEvent("vaani_transcription_ready", { detail: data }),
          );
          break;
        }

        case "step_updated": {
          // Process step updates — informational for customer
          if (import.meta.env.DEV) {
            console.log("[WS] Step updated:", data);
          }
          break;
        }

        case "input_request": {
          // Staff speech contained a keyword — show input popup on customer panel
          window.dispatchEvent(
            new CustomEvent("vaani_input_request", { detail: data }),
          );
          break;
        }

        case "intent_notification": {
          // Backend detected intent — inform the customer
          window.dispatchEvent(
            new CustomEvent("vaani_intent_notification", { detail: data }),
          );
          break;
        }

        case "input_acknowledged": {
          // Backend confirmed that input was received
          window.dispatchEvent(
            new CustomEvent("vaani_input_acknowledged", { detail: data }),
          );
          break;
        }

        case "document_checklist": {
          // DRV — backend sent localized document checklist for this intent
          useCustomerStore.getState().setDocChecklist(data);
          window.dispatchEvent(
            new CustomEvent("vaani_document_checklist", { detail: data }),
          );
          break;
        }

        case "saral_form_trigger": {
          // Staff triggered "Send to Form Verification" from InfoBoard/ProcessPanel
          // IMPORTANT: Do NOT navigate immediately.
          // The backend already sent staff_message + audio_ready BEFORE this event.
          // We wait here so the customer can read/hear the Hindi message in the chat
          // bubble on LiveSessionPage before being taken to /saral-form.
          //
          // Delay = audio duration sent by backend (tts_sleep) + small buffer.
          // We use 8 seconds as a safe default — backend sleeps min(tts_duration, 7s)
          // so the message is visible for at least 1 second before form opens.
          const saralNavDelay = data?.nav_delay_ms || 8000;
          toast.success("📝 Please review and sign your form.", {
            duration: saralNavDelay,
          });
          setTimeout(() => {
            if (navigateRef.current) {
              navigateRef.current("/saral-form", {
                state: {
                  tokenNumber: data?.token_number || "",
                  sessionId: data?.session_id || null,
                  collectedData: data?.collected_data || {},
                  intent: data?.intent || "general",
                  langCode: data?.language_code || "hi",
                },
              });
            }
          }, saralNavDelay);
          break;
        }

        case "session_ended": {
          if (window.vaani_end_fallback_timer) {
            clearTimeout(window.vaani_end_fallback_timer);
            window.vaani_end_fallback_timer = null;
          }
          endSessionStore();
          toast.success("Session complete! Thank you.", {
            icon: "✅",
            duration: 3000,
          });

          // Navigate directly to summary — SaralForm is only shown when
          // staff explicitly clicks "Send to Form Verification" (saral_form_trigger).
          if (navigateRef.current) {
            const sid = data?.session_id || "";
            navigateRef.current(sid ? `/summary/${sid}` : "/summary");
          }
          break;
        }

        case "error": {
          const errorMsg = data?.message || data?.detail || "An error occurred";
          toast.error(errorMsg, { duration: 4000 });
          console.error("[WS] Server error:", data);
          window.dispatchEvent(
            new CustomEvent("vaani_error", { detail: data }),
          );
          break;
        }

        case "pong": {
          // heartbeat response, no action needed
          break;
        }

        default: {
          if (import.meta.env.DEV) {
            console.log(`[WS] Unhandled event: ${type}`, data);
          }
          break;
        }
      }
    },
    [setStaffMessage, setStatus, endSessionStore],
  );

  // Ref-based forwarders to break circular dependency
  const connectInternalRef = useRef(null);
  const attemptReconnectRef = useRef(null);

  // Reconnect with exponential backoff
  const attemptReconnect = useCallback((tokenNumber) => {
    if (retriesRef.current >= MAX_RETRIES) {
      setConnectionStatus("error");
      toast.error("Connection lost. Please refresh the page.", {
        duration: 5000,
      });
      return;
    }

    const delay = BASE_DELAY * Math.pow(2, retriesRef.current);
    retriesRef.current += 1;

    if (import.meta.env.DEV) {
      console.log(
        `[WS] Reconnecting in ${delay}ms (attempt ${retriesRef.current}/${MAX_RETRIES})`,
      );
    }

    setConnectionStatus("connecting");

    reconnectTimerRef.current = setTimeout(() => {
      connectInternalRef.current?.(tokenNumber);
    }, delay);
  }, []);

  // Internal connect
  const connectInternal = useCallback(
    (tokenNumber) => {
      cleanup();

      // Close existing connection
      if (wsRef.current) {
        intentionalCloseRef.current = true;
        wsRef.current.close(1000, "Switching connection");
        wsRef.current = null;
      }

      intentionalCloseRef.current = false;
      const wsUrl = `${WS_BASE_URL}/ws/${tokenNumber}?role=customer`;

      if (import.meta.env.DEV) {
        console.log(
          `%c[WS] Connecting → ${wsUrl}`,
          "color: #D97706; font-weight: bold;",
        );
      }

      setConnectionStatus("connecting");

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (import.meta.env.DEV) {
          console.log(
            "%c[WS] ✓ Connected",
            "color: #16A34A; font-weight: bold;",
          );
        }
        setConnectionStatus("connected");
        retriesRef.current = 0;
        intentionalCloseRef.current = false;

        // Start ping/pong heartbeat every 30s
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping", data: {} }));
          }
        }, 30000);
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error("[WS] Error:", error);
        setConnectionStatus("error");
      };

      ws.onclose = (event) => {
        cleanup();

        if (import.meta.env.DEV) {
          console.log(
            `%c[WS] ✗ Disconnected (code: ${event.code})`,
            "color: #DC2626; font-weight: bold;",
          );
        }

        // Custom close codes from server — permanent rejections, don't retry
        if (event.code === 4004) {
          toast.error("Session not found", { duration: 5000 });
          setConnectionStatus("error");
          return;
        }
        if (event.code === 4003) {
          toast.error("Session is no longer active", { duration: 5000 });
          setConnectionStatus("error");
          return;
        }
        if (event.code === 4001) {
          toast.error("Unauthorized connection", { duration: 5000 });
          setConnectionStatus("error");
          return;
        }

        if (!intentionalCloseRef.current && event.code !== 1000) {
          attemptReconnectRef.current?.(tokenNumber);
        } else {
          setConnectionStatus("disconnected");
        }
      };

      wsRef.current = ws;
    },
    [handleMessage, cleanup],
  );

  // Sync refs after each render
  useEffect(() => {
    connectInternalRef.current = connectInternal;
    attemptReconnectRef.current = attemptReconnect;
  });

  // Public: connect
  const connect = useCallback(
    (tokenNumber, role = "customer") => {
      // Don't reconnect if already connected to the same token
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        tokenNumber === lastTokenRef.current
      ) {
        if (import.meta.env.DEV) {
          console.log("[WS] Already connected to", tokenNumber);
        }
        return;
      }

      lastTokenRef.current = tokenNumber;
      retriesRef.current = 0;
      intentionalCloseRef.current = false;
      connectInternal(tokenNumber);
    },
    [connectInternal],
  );

  // Public: disconnect
  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    cleanup();
    retriesRef.current = 0;

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, "Client disconnect");
      }
      wsRef.current = null;
    }

    setConnectionStatus("disconnected");
  }, [cleanup]);

  // Public: sendMessage
  const sendMessage = useCallback((eventType, data = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[WS] Cannot send — not connected");
      return false;
    }

    const message = JSON.stringify({ type: eventType, data });

    if (import.meta.env.DEV) {
      console.log(
        `%c[WS] → ${eventType}`,
        "color: #2563EB; font-weight: bold;",
        data,
      );
    }

    wsRef.current.send(message);
    return true;
  }, []);

  // Public: sendBinary (raw ArrayBuffer for PCM audio streaming)
  const sendBinary = useCallback((arrayBuffer) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    wsRef.current.send(arrayBuffer);
    return true;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      cleanup();
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmount");
        wsRef.current = null;
      }
      if (staffMsgFallbackRef.current) {
        clearTimeout(staffMsgFallbackRef.current);
        staffMsgFallbackRef.current = null;
      }
      if (window.vaani_end_fallback_timer) {
        clearTimeout(window.vaani_end_fallback_timer);
        window.vaani_end_fallback_timer = null;
      }
      pendingStaffTextRef.current = null;
      isFallbackFiredRef.current = false;
    };
  }, [cleanup]);

  return {
    connect,
    disconnect,
    sendMessage,
    sendBinary,
    setNavigate,
    connectionStatus,
    isConnected: connectionStatus === "connected",
  };
}

export default useWebSocket;
