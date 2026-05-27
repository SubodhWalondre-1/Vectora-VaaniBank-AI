/* ============================================
   VaaniBank AI — WebSocket Hook
   Union Bank of India | Team Vectora
   ============================================ */

import { useRef, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { WS_BASE_URL } from "../constants";
import useAppStore from "../context/AppContext";

const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second

const LANG_CODE_MAP = {
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  kn: "kn-IN",
  or: "or-IN",
  pa: "pa-IN",
  gu: "gu-IN",
  ml: "ml-IN",
  en: "en-IN",
};

function normalizeLangCode(code) {
  if (!code) return "hi-IN";
  const short = code.split("-")[0].toLowerCase();
  return LANG_CODE_MAP[short] || code;
}

export function useWebSocket() {
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const intentionalCloseRef = useRef(false);
  const lastExchangeIdRef = useRef(null);
  const lastStaffHindiTextRef = useRef(null); // Hindi text tracker for audio_ready update

  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isPeerConnected, setIsPeerConnected] = useState(false);

  // ── Store actions ─────────────────────────
  const addExchange = useAppStore((s) => s.addExchange);
  const updateSuggestion = useAppStore((s) => s.updateSuggestion);
  const updateProcessStep = useAppStore((s) => s.updateProcessStep);
  const updateSentiment = useAppStore((s) => s.updateSentiment);
  const updateIntent = useAppStore((s) => s.updateIntent);
  const updateSession = useAppStore((s) => s.updateSession);
  const showPIIAlert = useAppStore((s) => s.showPIIAlert);
  const setListening = useAppStore((s) => s.setListening);
  const setProcessing = useAppStore((s) => s.setProcessing);
  const updateInfoBoard = useAppStore((s) => s.updateInfoBoard);
  const endSessionStore = useAppStore((s) => s.endSession);
  const resetSession = useAppStore((s) => s.resetSession);
  const loadProcessSteps = useAppStore((s) => s.loadProcessSteps);
  const navigate = useNavigate();
  // Note: customerSelectedIntent and activeSession are read via
  // useAppStore.getState() inside handleMessage to avoid stale closures

  // ── Cleanup helper ────────────────────────
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

  // ── navigate ref — prevent stale closure ────
  const navigateRef = useRef(null);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  // ── Customer-ended flag — stops polling after customer exits ────
  const customerEndedRef = useRef(false);

  const handleMessage = useCallback(
    (event) => {
      // ── Outer try/catch: a malformed/unexpected event must NEVER crash React ──
      let parsed;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        console.warn("[WS] Failed to parse message:", event.data);
        return;
      }

      try {
        const { type, data } = parsed;

        if (data?.is_demo) {
          window.dispatchEvent(
            new CustomEvent("demo_event_received", { detail: parsed }),
          );
        }

        // Broadcast every WS event so page-level components can react
        window.dispatchEvent(new CustomEvent("ws_event", { detail: parsed }));

        if (import.meta.env.DEV) {
          console.log(
            `%c[WS] ← ${type}`,
            "color: #7C3AED; font-weight: bold;",
            data,
          );
        }

        switch (type) {
          case "session_connected": {
            // If peer_joined is present, it means the other party was already there or just joined
            // If not, we check customer_connected (for staff role) or staff_connected (for customer role)
            const peerAlreadyThere =
              data?.peer_joined || data?.customer_connected;

            if (peerAlreadyThere) {
              setIsPeerConnected(true);
              // Dismiss any lingering disconnect toast
              toast.dismiss("peer-disconnected");
              toast.success("Customer has joined the session.", {
                duration: 3000,
                id: "peer-connected",
              });
            }

            if (data?.session) {
              updateSession(data.session);
            }
            break;
          }

          case "customer_speaking": {
            // Reset liveTranscript to a non-empty placeholder so the ghost card
            // renders instantly when customer starts speaking — before the first
            // partial STT result arrives (~600ms later).
            useAppStore.setState({ liveTranscript: "…" });
            setListening(true);
            setProcessing(false);
            break;
          }

          case "transcription_partial": {
            useAppStore.setState({ liveTranscript: data.text });
            break;
          }

          case "transcription_ready": {
            useAppStore.setState({ liveTranscript: null });
            setListening(false);
            setProcessing(true);

            const originalText =
              data.text_original || data.text_translated || "";
            const translatedText =
              data.text_translated || data.text_original || "";

            if (data.exchange_id) {
              lastExchangeIdRef.current = data.exchange_id;
            }

            // Duplicate prevention — only block genuine replays with matching text,
            // or exact exchange_id match. Do NOT block on missing exchange_id alone
            // (first exchange from stop_speaking pipeline may not carry it yet).
            const { exchanges } = useAppStore.getState();
            const isDuplicate = exchanges.some((ex) => {
              // Hard match: same exchange_id from DB
              if (data.exchange_id && ex.exchange_id === data.exchange_id)
                return true;
              // Replay match: backend replay flag + identical text
              if (
                data.is_replay &&
                ex.direction === "customer_to_staff" &&
                ex.text_original === originalText &&
                originalText.length > 0
              ) {
                return true;
              }
              return false;
            });

            if (isDuplicate) {
              if (import.meta.env.DEV) {
                console.log("[WS] Skipping duplicate replay:", originalText);
              }
              break;
            }

            // Stable key: prefer exchange_id, fallback to timestamp-based uid
            const stableKey = data.exchange_id
              ? `ex-db-${data.exchange_id}`
              : `ex-ws-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

            const exchange = {
              id: stableKey, // used as React key — always unique
              exchange_id: data.exchange_id,
              text_original: originalText,
              text_translated: translatedText,
              confidence: data.confidence,
              sentiment: data.sentiment,
              intent: data.intent,
              pii_detected: data.pii_detected,
              direction: "customer_to_staff",
              is_replay: data.is_replay || false,
              timestamp: new Date().toISOString(),
            };

            addExchange(exchange);

            if (data.sentiment) {
              updateSentiment(data.sentiment);
            }

            if (data.intent && data.intent !== "general") {
              // Read directly from store to avoid stale closure
              const { customerSelectedIntent: csi, activeSession: as_ } =
                useAppStore.getState();
              if (!csi) {
                updateIntent(data.intent);
                const custLang = as_?.customer_language_code || "hi";
                loadProcessSteps(data.intent, custLang);
              }
            }

            break;
          }

          case "ai_suggestion_ready": {
            setProcessing(false);

            // ── Duplicate-suggestion guard ──────────────────────────────────────
            // Only block if BOTH Hindi AND customer-lang text are identical AND
            // it is the exact same exchange (same exchange_id from backend).
            // This prevents false-positive blocks when a NEW customer message
            // triggers a suggestion that looks similar to the previous one.
            const currentSuggestion = useAppStore.getState().aiSuggestion;
            const isSameHindi =
              currentSuggestion?.suggested_hindi === data.suggested_hindi;
            const isSameLang =
              currentSuggestion?.suggested_customer_lang ===
              data.suggested_customer_lang;
            const isSameExchange =
              data.exchange_id &&
              currentSuggestion?.exchange_id === data.exchange_id;

            if (
              isSameHindi &&
              isSameLang &&
              isSameExchange &&
              currentSuggestion
            ) {
              toast(
                "🔁 Same suggestion as before — customer se aur detail maango",
                { id: "same-suggestion-toast", duration: 3500, icon: null },
              );
              break;
            }
            // ───────────────────────────────────────────────────────────────────

            updateSuggestion({
              suggested_hindi: data.suggested_hindi,
              suggested_customer_lang: data.suggested_customer_lang,
              intent: data.intent,
              process_triggered: data.process_triggered,
              intent_confidence:
                data.intent_confidence ?? data.intentConfidence ?? 0,
              exchange_id: data.exchange_id ?? null,
            });

            if (data.process_triggered) {
              toast("AI detected a banking process", {
                icon: "🏦",
                duration: 3000,
              });
            }

            break;
          }

          case "staff_message": {
            const { text, language_code, is_saral_intro } = data;
            const session = useAppStore.getState().activeSession;
            const custLangName =
              session?.customer_language || "Customer Language";

            addExchange({
              id: `sm-${Date.now()}`,
              direction: "staff_to_customer",
              staff_response_final: text,
              staff_original_text: text,
              staff_response_translated: text,
              staff_translated_text: text,
              customer_lang_code: normalizeLangCode(language_code),
              customer_lang_name: custLangName,
              staff_lang_name: "System",
              staff_used_suggestion: false,
              timestamp: new Date().toISOString(),
              is_saral_intro: is_saral_intro || false,
            });
            break;
          }

          case "audio_ready": {
            // Always clear the processing/listening flags — audio is ready, pipeline is done.
            // This fixes the stuck "Transcription + Translation in progress" indicator
            // that appears after staff speaks to customer via sendStaffApproved/sendStaffEdited.
            setProcessing(false);
            setListening(false);
            if (data?.staff_response || data?.text) {
              const translatedText = data.staff_response || data.text;
              useAppStore.setState((state) => {
                const exchanges = [...state.exchanges];
                // Update last staff_to_customer exchange — always overwrite with backend text
                for (let i = exchanges.length - 1; i >= 0; i--) {
                  if (exchanges[i].direction === "staff_to_customer") {
                    exchanges[i] = {
                      ...exchanges[i],
                      staff_response_translated: translatedText,
                      staff_translated_text: translatedText,
                    };
                    break;
                  }
                }
                return { exchanges };
              });
            }
            break;
          }

          case "step_updated": {
            updateProcessStep({
              current_step: data.current_step,
              total_steps: data.total_steps,
              progress_percentage: data.progress_percentage,
              step_status: data.step_status,
            });
            break;
          }

          case "pii_detected": {
            showPIIAlert(data.pii_type || "unknown");
            toast.error(
              `⚠️ PII Detected: ${data.pii_type?.toUpperCase() || "Sensitive Data"} — Auto-masked`,
              { duration: 4000, icon: "🔒" },
            );
            break;
          }

          case "input_received": {
            // Customer sent input_submitted — show masked value toast on staff panel
            const fieldLabel = data.field_label || data.field_type || "Field";
            const maskedVal = data.masked_value || "****";
            toast.success(`🔒 ${fieldLabel}: ${maskedVal}`, {
              duration: 5000,
              icon: "✅",
            });
            // Add entry to conversation so staff can see it
            addExchange({
              direction: "customer_to_staff",
              text_original: `[${fieldLabel} submitted]`,
              text_translated: `${fieldLabel}: ${maskedVal}`,
              sentiment: "calm",
              intent: "input_submission",
              pii_detected: true,
              timestamp: new Date().toISOString(),
              is_input_submission: true,
            });
            break;
          }

          case "customer_service_selected": {
            const serviceName =
              data?.service_name || data?.service_id || "General";
            const serviceId = data?.service_id || "general";

            toast(`Customer selected: ${serviceName}`, {
              icon: "🏦",
              duration: 4000,
            });

            if (serviceId && serviceId !== "general") {
              updateIntent(serviceId, { isCustomerSelected: true });
              const custLang =
                useAppStore.getState().activeSession?.customer_language_code ||
                "hi";
              loadProcessSteps(serviceId, custLang);
            }

            addExchange({
              direction: "customer_to_staff",
              text_original: `Service selected: ${serviceName}`,
              text_translated: `Service selected: ${serviceName}`,
              sentiment: "calm",
              intent: serviceId,
              pii_detected: false,
              timestamp: new Date().toISOString(),
            });

            if (import.meta.env.DEV) {
              console.log("[WS] Customer service selected:", data);
            }
            break;
          }

          case "session_ended": {
            // Customer has exited the session — reset staff panel
            toast.success("Customer ne session khatam kar diya", {
              icon: "🔔",
              duration: 3000,
            });
            setListening(false);
            setProcessing(false);

            // Use ref to avoid stale closure
            // Stop polling first by resetting store, then navigate
            setTimeout(() => {
              // endSession API call skip — session already ended by customer
              // Direct reset — skip endSession API call since customer already ended
              customerEndedRef.current = true;
              useAppStore.getState().resetSession();
              navigateRef.current?.("/");
            }, 1500);
            break;
          }

          case "peer_status": {
            if (data?.code === "peer_disconnected") {
              setIsPeerConnected(false);
              toast.dismiss("peer-connected");
              toast("Customer disconnected — waiting for reconnect...", {
                icon: "⚠️",
                duration: 4000,
                id: "peer-disconnected",
              });
            } else if (data?.code === "peer_connected") {
              setIsPeerConnected(true);
              toast.dismiss("peer-disconnected");
              toast.success("Customer has joined the session.", {
                duration: 2500,
                id: "peer-connected",
              });
            }
            break;
          }

          case "error": {
            if (data?.code === "peer_disconnected") {
              setIsPeerConnected(false);
              toast.dismiss("peer-connected");
              console.warn(
                "[WS] Peer disconnected (legacy error event) — staying on page",
              );
              toast("Customer disconnected — waiting for reconnect...", {
                icon: "⚠️",
                duration: 4000,
                id: "peer-disconnected",
              });
              break;
            }
            const errorMsg =
              data?.message || data?.detail || "An error occurred";
            toast.error(errorMsg, { duration: 4000 });
            console.error("[WS] Server error:", data);
            break;
          }

          case "pong": {
            break;
          }

          case "PROCESS_UPDATE": {
            // Dynamic process panel update from intent_engine
            const rawIntent = (data.intent || "GENERAL").toLowerCase();
            const INTENT_KEY_MAP = {
              home_loan: "home_loan",
              personal_loan: "personal_loan",
              education_loan: "education_loan",
              vehicle_loan: "vehicle_loan",
              fixed_deposit: "fixed_deposit",
              account_opening: "account_opening",
              cibil_info: "cibil_info",
              general: "general",
            };
            const mappedIntent = INTENT_KEY_MAP[rawIntent] || rawIntent;
            updateIntent(mappedIntent);
            // Broadcast to ProcessPanel so it can render JSON-sourced steps
            window.dispatchEvent(
              new CustomEvent("process_update", {
                detail: {
                  intent: mappedIntent,
                  process_data: data.process_data,
                  staff_message: data.staff_message,
                  detected_language: data.detected_language,
                  key_entities: data.key_entities,
                  key_info: data.key_info,
                  product_name: data.product_name,
                  tts_voice: data.tts_voice,
                },
              }),
            );
            if (data.staff_message) {
              toast(`🏦 ${data.staff_message}`, { duration: 4000, icon: "📋" });
            }
            break;
          }

          case "info_board_update": {
            // Conversation Intelligence — auto-extracted customer data
            updateInfoBoard({
              collected_info: data.collected_info || {},
              completion_percent: data.completion_percent || 0,
              next_question_hindi: data.next_question_hindi || "",
              next_question_customer_lang:
                data.next_question_customer_lang || "",
              auto_step_completed: data.auto_step_completed || null,
              exchange_number: data.exchange_number || 0,
              conversation_stage: data.conversation_stage || "collecting",
              intent: data.intent || null,
            });

            // Auto-advance process step if AI detected completion
            if (data.auto_step_completed) {
              toast(`✅ Step completed: ${data.auto_step_completed}`, {
                icon: "🤖",
                duration: 3000,
              });
            }
            break;
          }

          case "navigator_update": {
            // Smart Navigator — deterministic phase + next question from backend engine
            useAppStore.getState().updateNavigator(data);
            break;
          }

          case "doc_readiness_update": {
            // DRV — merge with existing confirmed docs so customer taps persist
            const prevDrv = useAppStore.getState().docReadiness;
            let merged = data;

            if (prevDrv && prevDrv.docs && data.docs) {
              // Build a set of doc IDs already confirmed (customer taps or prior backend)
              const prevConfirmed = new Set(
                prevDrv.docs.filter((d) => d.confirmed).map((d) => d.id),
              );

              // Merge: a doc is confirmed if backend says so OR it was already confirmed
              const mergedDocs = data.docs.map((d) => ({
                ...d,
                confirmed: d.confirmed || prevConfirmed.has(d.id),
              }));

              // Recalculate score based on merged confirmed status
              const total = mergedDocs.length;
              const confirmed = mergedDocs.filter((d) => d.confirmed).length;
              const score =
                total > 0 ? Math.round((confirmed / total) * 100) : 0;

              merged = {
                ...data,
                docs: mergedDocs,
                total,
                confirmed,
                score,
              };
            }
            useAppStore.getState().updateDocReadiness(merged);
            break;
          }

          case "document_confirmed": {
            // Customer tapped a document checkbox on their phone
            const prev = useAppStore.getState().docReadiness;
            if (prev && prev.docs) {
              const updatedDocs = prev.docs.map((d) =>
                d.id === data.doc_id ? { ...d, confirmed: data.confirmed } : d,
              );
              const confirmed = updatedDocs.filter((d) => d.confirmed).length;
              useAppStore.getState().updateDocReadiness({
                ...prev,
                docs: updatedDocs,
                confirmed,
                score: Math.round(
                  (confirmed / Math.max(updatedDocs.length, 1)) * 100,
                ),
              });
            }
            if (data.confirmed) {
              toast(`✅ ${data.doc_label || data.doc_id}`, {
                icon: "📎",
                duration: 2500,
              });
            }
            break;
          }

          case "form_signed": {
            const { form_ref, form_name, token_number, signature_url } = data;

            toast.success(
              `📝 ${form_name || form_ref} signed — Token ${token_number}`,
              { duration: 8000, icon: "✅" },
            );

            window.dispatchEvent(
              new CustomEvent("vaani_form_signed", { detail: data }),
            );

            break;
          }

          default: {
            if (import.meta.env.DEV) {
              console.log(`[WS] Unhandled event: ${type}`, data);
            }
            break;
          }
        }
      } catch (handlerError) {
        console.error(
          "[WS] Error handling message (swallowed):",
          handlerError,
          parsed,
        );
      }
    },
    [
      addExchange,
      updateSuggestion,
      updateProcessStep,
      updateSentiment,
      updateIntent,
      updateSession,
      showPIIAlert,
      setListening,
      setProcessing,
      loadProcessSteps,
      updateInfoBoard,
    ],
  );

  // ── Reconnect with exponential backoff ────
  const attemptReconnect = useCallback((tokenNumber, role, jwtToken) => {
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
      connectInternal(tokenNumber, role, jwtToken);
    }, delay);
  }, []);

  // ── Internal connect ──────────────────────
  const connectInternal = useCallback(
    (tokenNumber, role, jwtToken) => {
      if (wsRef.current) {
        intentionalCloseRef.current = true;
        wsRef.current.close();
        wsRef.current = null;
      }

      const wsUrl = `${WS_BASE_URL}/ws/${tokenNumber}?role=${role}&token=${jwtToken}`;

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

        const isNormalClose = event.code === 1000 || event.code === 1005;
        if (!intentionalCloseRef.current && !isNormalClose) {
          attemptReconnect(tokenNumber, role, jwtToken);
        } else {
          setConnectionStatus("disconnected");
        }
      };

      wsRef.current = ws;
    },
    [handleMessage, cleanup, attemptReconnect],
  );

  // ── Public: connect ───────────────────────
  const connect = useCallback(
    (tokenNumber, role = "staff", jwtToken) => {
      customerEndedRef.current = false;
      retriesRef.current = 0;
      intentionalCloseRef.current = false;
      connectInternal(tokenNumber, role, jwtToken);
    },
    [connectInternal],
  );

  // ── Public: disconnect ────────────────────
  const disconnect = useCallback(() => {
    customerEndedRef.current = false;
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

  // ── Public: sendMessage ───────────────────
  const sendMessage = useCallback((eventType, data = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[WS] Cannot send — not connected");
      toast.error("Not connected to server");
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

  // ── Public: sendStaffApproved ─────────────
  // FIX: Always reads customer language from activeSession — never hardcodes 'hi'
  // FIX: Passes step_id so backend can look up translated text from DB
  const sendStaffApproved = useCallback(
    (
      response_text,
      use_suggestion = true,
      target_language_code = null,
      step_id = null,
      translated_text = null,
    ) => {
      const rawLangCode =
        target_language_code ??
        useAppStore.getState().activeSession?.customer_language_code ??
        "hi";
      const langCode = normalizeLangCode(rawLangCode);
      const sessionId = useAppStore.getState().activeSession?.id ?? null;

      const sent = sendMessage("staff_approved_response", {
        response_text,
        use_suggestion,
        target_language_code: langCode,
        session_id: sessionId,
        exchange_id: lastExchangeIdRef.current ?? null,
        step_id: step_id ?? null,
        translated_text: translated_text ?? null,
      });

      if (sent) {
        lastStaffHindiTextRef.current = response_text;
        const session = useAppStore.getState().activeSession;
        const custLangCode =
          langCode ??
          normalizeLangCode(session?.customer_language_code) ??
          "hi-IN";
        const custLangName = session?.customer_language ?? "Customer Language";
        addExchange({
          direction: "staff_to_customer",
          staff_response_final: response_text,
          staff_original_text: response_text,
          staff_response_translated: translated_text ?? null, // use provided if available
          staff_translated_text: translated_text ?? null,
          customer_lang_code: custLangCode,
          customer_lang_name: custLangName,
          staff_lang_name: "Hindi",
          staff_used_suggestion: use_suggestion,
          timestamp: new Date().toISOString(),
        });
        // NOTE: Do NOT call setProcessing(true) here.
        // isProcessing is only for the customer STT→LLM pipeline.
        // Staff-speak has its own staffProcessing flag in BottomBar.
        // Setting it here would block the customer mic after staff responds.
      }

      return sent;
    },
    [sendMessage, addExchange, setProcessing],
  );

  // ── Public: sendStaffEdited ───────────
  // FIX: Always reads customer language from activeSession — never hardcodes 'hi'
  const sendStaffEdited = useCallback(
    (response_text, target_language_code = null, step_id = null) => {
      const rawLangCode =
        target_language_code ??
        useAppStore.getState().activeSession?.customer_language_code ??
        "hi";
      const langCode = normalizeLangCode(rawLangCode);
      const sessionId = useAppStore.getState().activeSession?.id ?? null;

      const sent = sendMessage("staff_edited_response", {
        response_text,
        target_language_code: langCode,
        session_id: sessionId,
        exchange_id: lastExchangeIdRef.current ?? null,
        step_id: step_id ?? null,
      });

      if (sent) {
        lastStaffHindiTextRef.current = response_text;
        const session = useAppStore.getState().activeSession;
        const custLangCode =
          langCode ??
          normalizeLangCode(session?.customer_language_code) ??
          "hi-IN";
        const custLangName = session?.customer_language ?? "Customer Language";
        addExchange({
          direction: "staff_to_customer",
          staff_response_final: response_text,
          staff_original_text: response_text,
          staff_response_translated: null,
          staff_translated_text: null,
          customer_lang_code: custLangCode,
          customer_lang_name: custLangName,
          staff_lang_name: "Hindi",
          staff_used_suggestion: false,
          timestamp: new Date().toISOString(),
        });
        // NOTE: Do NOT call setProcessing(true) here.
        // isProcessing is only for the customer STT→LLM pipeline.
        // Staff-speak has its own staffProcessing flag in BottomBar.
      }

      return sent;
    },
    [sendMessage, addExchange, setProcessing],
  );

  // ── Public: sendStepCompleted ─────────────
  const sendStepCompleted = useCallback(
    (step_id) => {
      return sendMessage("step_completed", { step_id });
    },
    [sendMessage],
  );

  // ── Public: sendEndSession ────────────────
  const sendEndSession = useCallback(() => {
    const sent = sendMessage("end_session", {});
    if (sent) {
      setListening(false);
      setProcessing(false);
    }
    return sent;
  }, [sendMessage, setListening, setProcessing]);

  // ── Public: sendEscalateToManager ────────
  const sendEscalateToManager = useCallback(
    (reason = "Staff escalation") => {
      const state = useAppStore.getState();
      const sessionId = state.activeSession?.id ?? null;
      const tokenNo = state.activeSession?.token_number ?? null;
      const intent = state.currentIntent ?? "general";
      const sent = sendMessage("escalate_to_manager", {
        session_id: sessionId,
        token_number: tokenNo,
        intent,
        reason,
      });
      if (sent)
        toast("🚨 Branch Manager notified", { icon: "🚨", duration: 4000 });
      return sent;
    },
    [sendMessage],
  );

  // ── Public: sendForceNext ─────────────────
  // CLIENT-SIDE ONLY — no WS message sent (backend doesn't support this event).
  // Advances navigatorState locally: removes currentFieldKey from missing[],
  // promotes it to collected[] with value '—', recalculates fill_percent,
  // and sets next_question to the next missing field.
  const sendForceNext = useCallback(
    (currentFieldKey = null) => {
      const nav = useAppStore.getState().navigatorState;
      if (!nav) return false;

      const missing = Array.isArray(nav.missing) ? [...nav.missing] : [];
      const collected = Array.isArray(nav.collected) ? [...nav.collected] : [];

      // Find the field to skip — use currentFieldKey or the current next_question
      const skipKey = currentFieldKey ?? nav.next_question?.key ?? null;
      const skipIndex = skipKey
        ? missing.findIndex((f) => f.key === skipKey)
        : 0;
      const skipField = skipIndex >= 0 ? missing[skipIndex] : missing[0];

      if (!skipField) return false;

      // Move it to collected with a placeholder value
      const newMissing = missing.filter(
        (_, i) => i !== (skipIndex >= 0 ? skipIndex : 0),
      );
      const newCollected = [...collected, { ...skipField, value: "—" }];

      // Recalculate fill_percent
      const total = newCollected.length + newMissing.length;
      const fillPct =
        total > 0 ? Math.round((newCollected.length / total) * 100) : 0;

      // Next question = first of the remaining missing fields
      const nextField = newMissing[0] ?? null;

      useAppStore.getState().updateNavigator({
        ...nav,
        collected: newCollected,
        missing: newMissing,
        fill_percent: fillPct,
        filled_fields: newCollected.length,
        next_question: nextField
          ? {
              key: nextField.key,
              label: nextField.label,
              question_hi: nextField.question_hi,
            }
          : null,
        all_complete: newMissing.length === 0,
      });

      // Also patch infoBoard so the two panels stay in sync
      const infoBoard = useAppStore.getState().infoBoard;
      if (infoBoard?.collected_info) {
        useAppStore.getState().updateInfoBoard({
          ...infoBoard,
          collected_info: { ...infoBoard.collected_info, [skipField.key]: "—" },
        });
      }

      return true;
    },
    [], // no dependencies — reads store directly
  );

  // ── Public: sendEditField ─────────────────
  // CLIENT-SIDE ONLY — patches navigatorState and infoBoard locally.
  // Moves the field from missing[] → collected[] with the corrected value,
  // OR updates an existing collected[] entry.
  // Also recalculates next_question and fill_percent.
  const sendEditField = useCallback(
    (fieldKey, correctedValue) => {
      const nav = useAppStore.getState().navigatorState;
      if (!nav) return false;

      const missing = Array.isArray(nav.missing) ? [...nav.missing] : [];
      const collected = Array.isArray(nav.collected) ? [...nav.collected] : [];

      const missingIdx = missing.findIndex((f) => f.key === fieldKey);
      const collectedIdx = collected.findIndex((f) => f.key === fieldKey);

      let newMissing = missing;
      let newCollected = collected;

      if (collectedIdx >= 0) {
        // Already collected — just update the value
        newCollected = collected.map((f) =>
          f.key === fieldKey ? { ...f, value: correctedValue } : f,
        );
      } else if (missingIdx >= 0) {
        // Was missing — promote to collected
        const field = missing[missingIdx];
        newMissing = missing.filter((_, i) => i !== missingIdx);
        newCollected = [...collected, { ...field, value: correctedValue }];
      } else {
        // Unknown field — just optimistically patch infoBoard
        const infoBoard = useAppStore.getState().infoBoard;
        if (infoBoard?.collected_info) {
          useAppStore.getState().updateInfoBoard({
            ...infoBoard,
            collected_info: {
              ...infoBoard.collected_info,
              [fieldKey]: correctedValue,
            },
          });
        }
        return true;
      }

      const total = newCollected.length + newMissing.length;
      const fillPct =
        total > 0 ? Math.round((newCollected.length / total) * 100) : 0;
      const nextField = newMissing[0] ?? null;

      useAppStore.getState().updateNavigator({
        ...nav,
        collected: newCollected,
        missing: newMissing,
        fill_percent: fillPct,
        filled_fields: newCollected.length,
        next_question: nextField
          ? {
              key: nextField.key,
              label: nextField.label,
              question_hi: nextField.question_hi,
            }
          : nav.next_question,
        all_complete: newMissing.length === 0,
      });

      // Keep infoBoard in sync
      const infoBoard = useAppStore.getState().infoBoard;
      if (infoBoard?.collected_info) {
        useAppStore.getState().updateInfoBoard({
          ...infoBoard,
          collected_info: {
            ...infoBoard.collected_info,
            [fieldKey]: correctedValue,
          },
        });
      }

      return true;
    },
    [], // no dependencies — reads store directly
  );

  // ── Public: sendUndoNext ──────────────────
  // CLIENT-SIDE ONLY — moves the last collected field back to the front of missing[].
  const sendUndoNext = useCallback(
    (previousFieldKey = null) => {
      const nav = useAppStore.getState().navigatorState;
      if (!nav) return false;

      const missing = Array.isArray(nav.missing) ? [...nav.missing] : [];
      const collected = Array.isArray(nav.collected) ? [...nav.collected] : [];

      // Find the field to move back — use previousFieldKey or last collected
      const undoIdx = previousFieldKey
        ? collected.findIndex((f) => f.key === previousFieldKey)
        : collected.length - 1;

      if (undoIdx < 0 || collected.length === 0) return false;

      const undoField = collected[undoIdx];
      const newCollected = collected.filter((_, i) => i !== undoIdx);
      // Put it back at the front of missing so it becomes next_question
      const newMissing = [undoField, ...missing];

      const total = newCollected.length + newMissing.length;
      const fillPct =
        total > 0 ? Math.round((newCollected.length / total) * 100) : 0;

      useAppStore.getState().updateNavigator({
        ...nav,
        collected: newCollected,
        missing: newMissing,
        fill_percent: fillPct,
        filled_fields: newCollected.length,
        next_question: {
          key: undoField.key,
          label: undoField.label,
          question_hi: undoField.question_hi,
        },
        all_complete: false,
      });

      // Patch infoBoard — remove the value so it shows as missing
      const infoBoard = useAppStore.getState().infoBoard;
      if (infoBoard?.collected_info) {
        const updated = { ...infoBoard.collected_info };
        delete updated[undoField.key];
        useAppStore
          .getState()
          .updateInfoBoard({ ...infoBoard, collected_info: updated });
      }

      return true;
    },
    [], // no dependencies — reads store directly
  );

  // ── Cleanup on unmount ────────────────────
  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      cleanup();
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmount");
        wsRef.current = null;
      }
    };
  }, [cleanup]);

  return {
    connect,
    disconnect,
    sendMessage,
    sendStaffApproved,
    sendStaffEdited,
    sendStepCompleted,
    sendEndSession,
    sendEscalateToManager,
    sendForceNext,
    sendEditField,
    sendUndoNext,
    connectionStatus,
    isConnected: connectionStatus === "connected",
    isPeerConnected,
    customerEndedRef, // polling guard for DashboardPage
  };
}

export default useWebSocket;
