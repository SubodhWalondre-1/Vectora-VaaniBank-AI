/* ============================================
   VaaniBank AI — Dashboard Page (Full Layout)
   Union Bank of India | Team Vectora
   ============================================ */

import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useAppStore, { useApp } from "../context/AppContext";
import {
  getActiveSessions,
  getCollectedInfo,
  summaryAPI,
  sessionAPI,
} from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { API_BASE_URL } from "../constants";

// Layout components
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import BottomBar from "../components/layout/BottomBar";

// Dashboard components
import ConversationPanel from "../components/dashboard/ConversationPanel";
import AISuggestionBox from "../components/dashboard/AISuggestionBox";
import ProcessPanel from "../components/dashboard/ProcessPanel";
import BilingualSummary from "../components/dashboard/BilingualSummary";

// ── Error Boundary ─────────────────────────────
// Prevents white-screen crashes — shows recovery UI instead
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      "[DashboardErrorBoundary] Caught render error:",
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center h-screen w-screen gap-4"
          style={{
            backgroundColor: "var(--body-bg, #0f172a)",
            color: "var(--text-primary, #f1f5f9)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "rgba(220, 38, 38, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            ⚠️
          </div>
          <p className="text-lg font-semibold" style={{ color: "#ef4444" }}>
            Session connection lost
          </p>
          <p
            className="text-sm"
            style={{
              color: "var(--text-muted, #94a3b8)",
              maxWidth: 320,
              textAlign: "center",
            }}
          >
            An unexpected error occurred in the dashboard. Your session data is
            safe.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#003087" }}
          >
            Reconnect
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre
              className="mt-4 text-xs p-3 rounded-lg max-w-lg overflow-auto"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#f87171",
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

function DashboardPageInner() {
  const staff = useApp((s) => s.staff);
  const aiSuggestion = useApp((s) => s.aiSuggestion);
  const activeSession = useApp((s) => s.activeSession);
  const sessionStatus = useApp((s) => s.sessionStatus);
  const endSession = useApp((s) => s.endSession);
  const resetSession = useApp((s) => s.resetSession);

  const {
    connect,
    disconnect,
    sendMessage,
    sendStaffApproved,
    sendStaffEdited,
    sendForceNext,
    sendEditField,
    sendUndoNext,
    isConnected,
    isPeerConnected,
    customerEndedRef,
    connectionStatus,
  } = useWebSocket();

  const connectedTokenRef = useRef(null);
  const pollRef = useRef(null);
  const [booting, setBooting] = useState(false);
  const [lastAudioUrl, setLastAudioUrl] = useState(null);
  const [sttConfidence, setSttConfidence] = useState(0);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]); // waiting sessions
  const [formSignedNotif, setFormSignedNotif] = useState(null); // SaralForm signed notification
  const notifiedTokensRef = useRef(new Set()); // avoid duplicate notifications
  const rejectedTokensRef = useRef(new Set()); // prevent rejected sessions from re-notifying

  const handleExportPDF = useCallback(async () => {
    const sessionId = activeSession?.id;
    if (!sessionId) {
      toast.error("No active session to export");
      return;
    }

    setExportingPDF(true);
    try {
      // Try fetching existing summary first, then generate if not found
      let summary;
      try {
        summary = await summaryAPI.getSessionSummary(sessionId);
      } catch {
        // No existing summary — generate one
        summary = await summaryAPI.generateSummary(sessionId);
      }

      if (!summary?.id) {
        throw new Error("Could not generate session summary");
      }

      // If PDF is not yet generated (background task still running), poll for it
      // Increased to 40 attempts (60s) to allow for slower LLM summary generation
      let attempts = 0;
      while (!summary.pdf_generated && attempts < 40) {
        await new Promise((r) => setTimeout(r, 1500)); // wait 1.5s
        summary = await summaryAPI.getSessionSummary(sessionId);
        attempts++;
      }

      if (!summary.pdf_generated) {
        throw new Error(
          "PDF is taking longer than expected. Please try again in a few seconds.",
        );
      }

      // Download PDF via backend proxy (avoids CORS issues with R2)
      const blob = await summaryAPI.downloadPDFBlob(sessionId);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `VaaniBank_Summary_${activeSession?.token_number ?? "session"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      toast.success("PDF downloaded successfully! 📄");
    } catch (err) {
      console.error("[Dashboard] PDF export error:", err);
      toast.error(
        err?.response?.data?.detail || err?.message || "PDF export failed",
      );
    } finally {
      setExportingPDF(false);
    }
  }, [activeSession]);

  // ── Safety net: catch session_ended via ws_event broadcast too ────
  // (in case useWebSocket handler fails)
  useEffect(() => {
    const handleWsEvent = (e) => {
      const event = e.detail;
      if (!event) return;

      if (event.type === "audio_ready") {
        setLastAudioUrl(event.data?.audio_url ?? null);
      }
      if (event.type === "transcription_ready") {
        setSttConfidence(Math.round((event.data?.confidence ?? 0) * 100));
      }
      if (event.type === "pdf_ready") {
        console.log("[Dashboard] PDF ready WS event received:", event.data);
        toast.success("Bilingual PDF is now ready for download! 📄", {
          id: "pdf-ready",
        });
      }
      if (event.type === "session_ended") {
        // Customer ended the session — handle here if WS hook didn't catch it
        if (customerEndedRef && !customerEndedRef.current) {
          customerEndedRef.current = true;
          // Reset session state and keep polling active for next customer
          connectedTokenRef.current = null;
          useAppStore.setState({
            activeSession: null,
            sessionStatus: "idle",
            exchanges: [],
            currentSentiment: "calm",
            currentIntent: null,
            customerSelectedIntent: false,
            processSteps: [],
            currentStep: 0,
            totalSteps: 0,
            progressPercent: 0,
            aiSuggestion: null,
            isListening: false,
            isProcessing: false,
            piiAlert: null,
          });
        }
      }
    };
    window.addEventListener("ws_event", handleWsEvent);
    return () => window.removeEventListener("ws_event", handleWsEvent);
  }, [customerEndedRef]);

  // ── Helper: connect WS safely — single source of truth ──
  // All connect calls go through this so we never double-connect
  const connectWS = useCallback(
    (tokenNumber, jwtToken) => {
      if (connectedTokenRef.current === tokenNumber) return; // already connected
      if (connectedTokenRef.current) {
        try {
          disconnect();
        } catch {
          /* no-op */
        }
      }
      connectedTokenRef.current = tokenNumber;
      connect(tokenNumber, "staff", jwtToken);
    },
    [connect, disconnect],
  );

  const handleRetryWS = useCallback(() => {
    const tokenNumber = activeSession?.token_number;
    const jwtToken = localStorage.getItem("vaanibank_token");
    if (!tokenNumber || !jwtToken) {
      toast.error("No active session to reconnect");
      return;
    }
    toast.loading("Reconnecting...", { id: "reconnect-ws", duration: 2000 });
    connectedTokenRef.current = null;
    connectWS(tokenNumber, jwtToken);
  }, [activeSession, connectWS]);

  const isInputLike = useCallback((el) => {
    // Block shortcuts if any modal/overlay with .fixed.inset-0.z-50 is active
    if (document.querySelector(".fixed.inset-0.z-50")) return true;
    if (!el) return false;
    const tag = (el.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (el.isContentEditable) return true;
    return false;
  }, []);

  const clickMicButton = useCallback(() => {
    const micBtn = document.querySelector(
      "footer button.w-12.h-12.rounded-full",
    );
    if (!micBtn || micBtn.disabled) return false;
    micBtn.click();
    return true;
  }, []);

  const isRecordingByUiLabel = useCallback(() => {
    const footer = document.querySelector("footer");
    if (!footer) return false;
    const spans = footer.querySelectorAll("span");
    for (const s of spans) {
      const t = (s.textContent || "").trim();
      if (t.startsWith("Recording")) return true;
    }
    return false;
  }, []);

  const stopRecording = useCallback(() => {
    if (!isRecordingByUiLabel()) return false;
    return clickMicButton();
  }, [clickMicButton, isRecordingByUiLabel]);

  const useAiSuggestionViaClick = useCallback(() => {
    if (!aiSuggestion) return false;
    const buttons = Array.from(document.querySelectorAll("button"));
    const useBtn = buttons.find((b) =>
      (b.textContent || "").trim().includes("Use This"),
    );
    if (!useBtn || useBtn.disabled) return false;
    useBtn.click();
    return true;
  }, [aiSuggestion]);

  const initFromActiveSession = useCallback((sessionObj) => {
    const rawStatus = sessionObj?.status;
    const isCurrentlyActive = rawStatus === "active" || rawStatus === "waiting";

    useAppStore.setState({
      activeSession: sessionObj,
      sessionStatus: isCurrentlyActive ? "active" : "idle",
      // NOTE: do NOT reset exchanges here — restoreExchanges() fills them from DB
      currentSentiment: "calm",
      currentIntent: null,
      processSteps: [],
      currentStep: 0,
      totalSteps: 0,
      progressPercent: 0,
      // NOTE: do NOT reset aiSuggestion — the persisted store may hold the last one
      isListening: false,
      isProcessing: false,
      piiAlert: null,
    });
  }, []);

  // ── Helper: restore full exchange history from DB after page reload ──
  const restoreExchanges = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      const data = await sessionAPI.getSessionExchanges(sessionId);
      const list = data?.exchanges;
      if (Array.isArray(list) && list.length > 0) {
        useAppStore.setState({ exchanges: list });
      }
    } catch {
      // Non-fatal — live WS events will fill the list going forward
    }
  }, []);

  // ── Helper: restore InfoBoard from persisted collected_data ──
  const restoreInfoBoard = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      const data = await getCollectedInfo(sessionId);
      if (data?.collected_info && Object.keys(data.collected_info).length > 0) {
        useAppStore.getState().updateInfoBoard({
          collected_info: data.collected_info,
          completion_percent: data.completion_percent || 0,
          next_question_hindi: "",
          next_question_customer_lang: "",
          conversation_stage: data.conversation_stage || "ready_to_apply",
        });

        // Also try to restore intent and steps if detected
        if (data.intent_detected) {
          useAppStore.setState({ currentIntent: data.intent_detected });
          try {
            const stepsData = await processAPI.getProcessSteps(
              data.intent_detected,
            );
            if (stepsData) {
              useAppStore.setState({ processSteps: stepsData });
            }
          } catch (e) {
            console.warn(
              "Failed to restore steps for intent:",
              data.intent_detected,
            );
          }
        }

        // Restore Document Readiness (DRV)
        if (data.doc_readiness) {
          useAppStore.getState().updateDocReadiness(data.doc_readiness);
        }
      }
    } catch {
      // Non-fatal — InfoBoard will populate on next LLM exchange
    }
  }, []);

  // ── Helper: fetch latest active session and connect WS ──
  const fetchAndConnect = useCallback(
    async (isInitial = false) => {
      // Always allow polling to find new waiting/active sessions
      const jwtToken = localStorage.getItem("vaanibank_token");
      if (!staff || !jwtToken) {
        if (isInitial) setBooting(false);
        return;
      }

      try {
        const sessions = await getActiveSessions();
        const list = Array.isArray(sessions) ? sessions : [];

        // Prefer the MOST RECENTLY CREATED active/waiting session
        // (customer-created sessions via QR scan appear here too)
        const sorted = [...list].sort((a, b) => {
          const da = new Date(a?.created_at || 0);
          const db = new Date(b?.created_at || 0);
          return db - da; // newest first
        });

        const chosen =
          sorted.find((s) => s?.status === "active") ||
          sorted.find((s) => s?.status === "waiting") ||
          sorted[0] ||
          null;

        if (!chosen) {
          if (isInitial) {
            resetSession();
            setBooting(false);
          }
          return;
        }

        const shouldConnect =
          chosen?.status === "active" && chosen?.token_number; // ← ONLY active sessions auto-connect

        // Waiting sessions → show notification instead of auto-connecting
        const waitingSessions = list.filter((s) => {
          if (s?.status !== "waiting" || !s?.token_number) return false;
          if (rejectedTokensRef.current.has(s.token_number)) return false;

          // 1. Filter out sessions created more than 2 hours ago (stale/expired/previous tokens)
          const createdAt = s?.created_at ? new Date(s.created_at) : null;
          const isRecent = createdAt
            ? Math.abs(new Date() - createdAt) < 2 * 3600 * 1000
            : true;
          if (!isRecent) return false;

          // 2. Exclude manually created teller sessions where staff_id matches current logged-in teller (own walk-ins)
          const isOwnManualSession =
            s?.staff_id &&
            staff?.id &&
            String(s.staff_id) === String(staff?.id);
          if (isOwnManualSession) return false;

          return true;
        });

        waitingSessions.forEach((s) => {
          if (!notifiedTokensRef.current.has(s.token_number)) {
            notifiedTokensRef.current.add(s.token_number);
            setPendingApprovals((prev) => {
              const already = prev.find(
                (p) => p.token_number === s.token_number,
              );
              if (already) return prev;
              return [
                {
                  id: Date.now() + Math.random(),
                  token_number: s.token_number,
                  session_id: s.id || s.session_id,
                  customer_language: s.customer_language || "Unknown",
                  customer_language_code: s.customer_language_code || "hi",
                  created_at: s.created_at,
                  branch_code: s.branch_code,
                },
                ...prev,
              ];
            });
          }
        });

        // ── Always reset session state on initial load to prevent stale data ──
        // The auto-reconnect useEffect may have already set connectedTokenRef
        // from rehydrated activeSession. We still need initFromActiveSession
        // to clear exchanges and guarantee a clean slate.
        if (isInitial) {
          initFromActiveSession(chosen);
          restoreExchanges(chosen.id || chosen.session_id);
          restoreInfoBoard(chosen.id || chosen.session_id);
        }

        // Only reconnect WS if the token has changed (avoid duplicate connects)
        if (
          shouldConnect &&
          connectedTokenRef.current !== chosen.token_number
        ) {
          if (!isInitial) {
            // Non-initial (polling) — reset session state here
            initFromActiveSession(chosen);
            restoreExchanges(chosen.id || chosen.session_id);
            restoreInfoBoard(chosen.id || chosen.session_id);
          }
          connectWS(chosen.token_number, jwtToken);

          // Notify staff when a new session is auto-detected (not on initial load)
          if (!isInitial) {
            toast.success(`New customer connected: ${chosen.token_number}`, {
              icon: "🔔",
              duration: 5000,
            });
          }

          if (import.meta.env.DEV) {
            console.log(
              `%c[Dashboard] Connected WS to session: ${chosen.token_number}`,
              "color: #16A34A; font-weight: bold;",
            );
          }
        }
      } catch (err) {
        if (isInitial) {
          toast.error(err?.message ?? "Failed to restore active session");
          resetSession();
        }
      } finally {
        if (isInitial) setBooting(false);
      }
    },
    [
      staff,
      connectWS,
      initFromActiveSession,
      resetSession,
      restoreExchanges,
      restoreInfoBoard,
    ],
  );

  // On mount: check active sessions and connect WS
  useEffect(() => {
    let cancelled = false;
    if (!cancelled) fetchAndConnect(true);
    return () => {
      cancelled = true;
    };
  }, [fetchAndConnect]);

  // ── Poll for new sessions every 3 seconds ──
  // Fast polling catches customer-created sessions (QR scan) almost instantly
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchAndConnect(false);
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchAndConnect]);

  // ── Auto-reconnect WS when activeSession.token_number changes ──
  // connectWS guard ensures no duplicate connection
  useEffect(() => {
    const token = activeSession?.token_number;
    const jwtToken = localStorage.getItem("vaanibank_token");
    if (!token || !jwtToken) return;
    connectWS(token, jwtToken);
  }, [activeSession?.token_number, connectWS]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        disconnect();
      } catch {
        // no-op
      }
      connectedTokenRef.current = null;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [disconnect]);

  // Listen for SaralForm signed event from staff WS hook
  useEffect(() => {
    const onFormSigned = (e) => setFormSignedNotif(e.detail);
    window.addEventListener("vaani_form_signed", onFormSigned);
    return () => window.removeEventListener("vaani_form_signed", onFormSigned);
  }, []);

  // ── Accept: staff connects WS → session activates ──────
  const handleApprove = useCallback(
    (approval) => {
      const { token_number, session_id } = approval;
      const jwtToken = localStorage.getItem("vaanibank_token");
      if (!token_number || !jwtToken) return;

      useAppStore.setState({
        activeSession: {
          id: session_id,
          token_number,
          status: "active",
          customer_language: approval.customer_language,
          customer_language_code: approval.customer_language_code,
          branch_code: approval.branch_code,
        },
        sessionStatus: "active",
        exchanges: [],
        currentSentiment: "calm",
        currentIntent: null,
        processSteps: [],
        currentStep: 0,
        totalSteps: 0,
        progressPercent: 0,
        aiSuggestion: null,
        isListening: false,
        isProcessing: false,
        piiAlert: null,
      });

      connectWS(token_number, jwtToken);
      setPendingApprovals((prev) => prev.filter((p) => p.id !== approval.id));
      toast.success(`Customer #${token_number} accepted!`, {
        icon: "✅",
        duration: 3000,
      });
    },
    [connectWS],
  );

  // ── Reject: end session via API ────────────────────
  const handleReject = useCallback(async (approval) => {
    const { session_id, token_number } = approval;
    try {
      if (token_number) {
        rejectedTokensRef.current.add(token_number);
      }
      if (session_id) {
        await sessionAPI.endSession(session_id, "rejected");
      }
    } catch {
      // Silent — even if API fails, remove from UI
    } finally {
      // Remove from notified set so if customer retries it can re-notify
      if (token_number) {
        notifiedTokensRef.current.delete(token_number);
      }
      setPendingApprovals((prev) => prev.filter((p) => p.id !== approval.id));
      toast(`Customer #${token_number} declined`, {
        icon: "❌",
        duration: 3000,
      });
    }
  }, []);

  const handleEndSession = useCallback(async () => {
    try {
      await endSession("completed");
    } catch (err) {
      toast.error(err?.message ?? "Failed to end session");
    } finally {
      try {
        disconnect();
      } catch {
        // no-op
      }
      connectedTokenRef.current = null;
      resetSession();
    }
  }, [disconnect, endSession, resetSession]);

  // Keyboard shortcuts:
  // - Space: toggle recording
  // - Escape: stop recording
  // - Enter: use AI suggestion
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.repeat) return;
      if (isInputLike(e.target)) return;

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        clickMicButton();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        stopRecording();
        return;
      }

      if (e.key === "Enter") {
        if (!aiSuggestion) return;
        e.preventDefault();
        useAiSuggestionViaClick();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    aiSuggestion,
    clickMicButton,
    isInputLike,
    stopRecording,
    useAiSuggestionViaClick,
  ]);

  // Avoid layout jank during initial restore
  if (booting && !activeSession) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center"
        style={{
          backgroundColor: "var(--body-bg)",
          color: "var(--text-primary)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 9999,
            border: "3px solid var(--card-border)",
            borderTopColor: "var(--accent-blue)",
            animation: "loader-spin 0.8s linear infinite",
          }}
        />
        <style>{`
          @keyframes loader-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: "var(--body-bg)" }}
    >
      {/* ── Sidebar ─────────────────────────────── */}
      <Sidebar />

      {/* ── Center + Right content ──────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TOP */}
        <TopBar
          onEndSession={handleEndSession}
          sendMessage={sendMessage}
          pendingApprovals={pendingApprovals}
          onApprove={handleApprove}
          onReject={handleReject}
          connectionStatus={connectionStatus}
          onRetryWS={handleRetryWS}
        />

        {/* MIDDLE */}
        <div className="flex flex-1 min-h-0 gap-3 p-3">
          {/* CENTER: Conversation + AI suggestion */}
          <div className="flex flex-col flex-1 min-w-0 gap-3">
            {/* SaralForm signed notification banner */}
            {formSignedNotif && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  backgroundColor: "rgba(22,163,74,0.06)",
                  border: "2px solid rgba(22,163,74,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: "rgba(22,163,74,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  ✅
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#16A34A",
                    }}
                  >
                    Form Signed!
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {formSignedNotif.form_name || formSignedNotif.form_ref}
                  </p>
                  <p
                    style={{
                      margin: "1px 0 0",
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    Token: {formSignedNotif.token_number}
                  </p>
                </div>
                {formSignedNotif.signature_url && (
                  <a
                    href={`${API_BASE_URL}/forms/signature/${formSignedNotif.token_number}`}
                    target="_blank"
                    rel="noreferrer"
                    download
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      backgroundColor: "#16A34A",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: "none",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    📥 Signature
                  </a>
                )}
                <div
                  style={{
                    cursor: "pointer",
                    padding: 6,
                    color: "var(--text-muted)",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                  onClick={() => setFormSignedNotif(null)}
                >
                  ✕
                </div>
              </div>
            )}
            <div className="flex-1 min-h-0">
              <ConversationPanel />
            </div>
            <AISuggestionBox
              sendStaffApproved={sendStaffApproved}
              sendStaffEdited={sendStaffEdited}
              sendMessage={sendMessage}
            />
          </div>

          {/* RIGHT: ProcessPanel — side column, only when session is active */}
          {activeSession && (
            <div
              style={{
                width: 350,
                minWidth: 350,
                maxWidth: 350,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <ProcessPanel
                sendMessage={sendMessage}
                sendStaffApproved={sendStaffApproved}
                sendForceNext={sendForceNext}
                sendEditField={sendEditField}
                sendUndoNext={sendUndoNext}
              />
            </div>
          )}
        </div>

        {/* BOTTOM */}
        {sessionStatus !== "active" && <BilingualSummary />}
        <BottomBar
          lastAudioUrl={lastAudioUrl}
          sttConfidence={sttConfidence}
          onExportPDF={handleExportPDF}
          exportingPDF={exportingPDF}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}

// ── Default export: wrapped in ErrorBoundary ────
export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardPageInner />
    </DashboardErrorBoundary>
  );
}
