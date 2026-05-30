import {
  useCallback,
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useApp } from "../../context/AppContext";
import { processAPI, sessionAPI } from "../../services/api";
import { getIntentData } from "../../bankingKnowledge";

// Import extracted tab components statically
import {
  StepsTab,
  InfoTab,
} from "./process-tabs";

// Lazy-loaded heavy tab components

const ProfileTab = lazy(() => import("./process-tabs/ProfileTab"));
const SendTab = lazy(() => import("./process-tabs/SendTab"));


// Lightweight fallback for lazy tab loading
const TabLoader = () => (
  <div
    style={{
      textAlign: "center",
      padding: "24px 0",
      color: "var(--text-secondary, #64748b)",
      fontSize: 12,
    }}
  >
    Loading…
  </div>
);

// Backend intent → Frontend key normaliser
const BACKEND_TO_FRONTEND_INTENT = {
  HOME_LOAN: "loan_enquiry",
  PERSONAL_LOAN: "loan_enquiry",
  EDUCATION_LOAN: "loan_enquiry",
  VEHICLE_LOAN: "loan_enquiry",
  FIXED_DEPOSIT: "fixed_deposit",
  ACCOUNT_OPENING: "account_opening",
  CIBIL_INFO: "general",
  GENERAL: "general",
  home_loan: "loan_enquiry",
  personal_loan: "loan_enquiry",
  education_loan: "loan_enquiry",
  vehicle_loan: "loan_enquiry",
  fixed_deposit: "fixed_deposit",
  account_opening: "account_opening",
  cibil_info: "general",
  general: "general",
};

const LOAN_SUBLABEL = {
  HOME_LOAN: "Home Loan",
  PERSONAL_LOAN: "Personal Loan",
  EDUCATION_LOAN: "Education Loan",
  VEHICLE_LOAN: "Vehicle Loan",
};

function normaliseIntentKey(raw) {
  if (!raw) return "general";
  return (
    BACKEND_TO_FRONTEND_INTENT[raw] ||
    BACKEND_TO_FRONTEND_INTENT[raw.toUpperCase()] ||
    raw.toLowerCase() ||
    "general"
  );
}

const INTENT_CONFIG = {
  account_opening: {
    label: "Account Opening",
    color: "var(--accent-blue, #0C447C)",
    bg: "rgba(12,68,124,0.15)",
  },
  loan_enquiry: {
    label: "Loan Enquiry",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.10)",
  },
  kyc_update: {
    label: "KYC Update",
    color: "#d97706",
    bg: "rgba(217,119,6,0.10)",
  },
  card_services: {
    label: "Card Services",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.10)",
  },
  balance_enquiry: {
    label: "Balance Enquiry",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.10)",
  },
  fixed_deposit: {
    label: "Fixed Deposit",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.10)",
  },
  general: { label: "General", color: "#64748b", bg: "rgba(100,116,139,0.10)" },
};

const TABS = [
  { id: "info", label: "Key Info" },
  { id: "steps", label: "Steps" },
  { id: "profile", label: "Profile" },
  { id: "send", label: "📨 Send" },
];

// Waiting State
function WaitingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center justify-center rounded-full"
        style={{
          width: 48,
          height: 48,
          background: "rgba(0,48,135,0.06)",
          border: "1.5px dashed rgba(0,48,135,0.20)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
            stroke="rgba(0,48,135,0.35)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
      <p
        className="text-sm font-semibold text-center"
        style={{ color: "var(--text-primary, #0f172a)" }}
      >
        Waiting for intent detection...
      </p>
    </div>
  );
}
// ProcessPanel
export default function ProcessPanel({
  isDemoActive: propIsDemo,
  sendMessage,
  sendStaffApproved,
  sendForceNext,
  sendEditField,
  sendUndoNext,
}) {
  const activeSession = useApp((s) => s.activeSession);
  const processSteps = useApp((s) => s.processSteps);
  const currentStep = useApp((s) => s.currentStep);
  const currentIntent = useApp((s) => s.currentIntent);
  const staffLanguage = useApp((s) => s.staffLanguage);
  const infoBoard = useApp((s) => s.infoBoard);
  const docReadiness = useApp((s) => s.docReadiness);

  const [activeTab, setActiveTab] = useState("info");
  const [internalDemoActive, setInternalDemoActive] = useState(false);
  const [demoActiveStep, setDemoActiveStep] = useState(null);
  const [demoCompletedCount, setDemoCompletedCount] = useState(null);
  const [localCompletedCount, setLocalCompletedCount] = useState(null);

  // Dynamic process from intent_engine (PROCESS_UPDATE)
  const [dynamicProcess, setDynamicProcess] = useState(null); // full process_data from JSON
  const [staffMessage, setStaffMessage] = useState(null); // Hindi guidance for staff
  const [detectedLang, setDetectedLang] = useState(null); // e.g. "ta"
  const [keyEntities, setKeyEntities] = useState(null); // amount, tenure, etc.
  const [dynamicKeyInfo, setDynamicKeyInfo] = useState(null); // key_info from backend

  const isDemoActive = propIsDemo || internalDemoActive;
  // rawIntent = backend value e.g. "HOME_LOAN"; intentKey = normalised frontend key
  const rawIntent =
    currentIntent ?? activeSession?.intent_detected ?? "GENERAL";
  const intentKey = normaliseIntentKey(rawIntent);
  // Loan sub-type label override (e.g. "Home Loan" instead of generic "Loan Enquiry")
  const loanSubLabel = LOAN_SUBLABEL[rawIntent] ?? null;

  // Ref so useEffects below can read globalCompleted without a TDZ error
  // (globalCompleted is derived later in render, so we sync it via ref each render)
  const globalCompletedRef = useRef(0);

  const tabBarElementRef = useRef(null);
  const tabBarRef = useCallback((node) => {
    if (tabBarElementRef.current) {
      const prevNode = tabBarElementRef.current;
      if (prevNode._onWheel) {
        prevNode.removeEventListener("wheel", prevNode._onWheel);
      }
      delete prevNode._onWheel;
    }

    tabBarElementRef.current = node;

    if (node) {
      const onWheel = (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          node.scrollLeft += e.deltaY;
        }
      };

      node.addEventListener("wheel", onWheel, { passive: false });
      node._onWheel = onWheel;
    }
  }, []);

  // Listen to process_update custom event (fired by useWebSocket.js)
  useEffect(() => {
    const handleProcessUpdate = (e) => {
      const d = e.detail || {};
      if (d.process_data) {
        setDynamicProcess(d.process_data);
        setLocalCompletedCount(null); // reset progress on new intent
      }
      if (d.staff_message) setStaffMessage(d.staff_message);
      if (d.detected_language) setDetectedLang(d.detected_language);
      if (d.key_entities) setKeyEntities(d.key_entities);
      if (d.key_info) setDynamicKeyInfo(d.key_info);
    };
    window.addEventListener("process_update", handleProcessUpdate);
    return () =>
      window.removeEventListener("process_update", handleProcessUpdate);
  }, []);

  // P2: Auto-step advancement from AI-detected completion
  useEffect(() => {
    const handleAutoStep = (e) => {
      const { type, data } = e.detail || {};

      // info_board_update with auto_step_completed → advance locally
      if (type === "info_board_update" && data?.auto_step_completed) {
        setLocalCompletedCount((prev) => {
          // Use the ref so we always read the latest globalCompleted without a TDZ
          const base = prev !== null ? prev : globalCompletedRef.current;
          return Math.min(base + 1, globalCompletedRef.current + 10);
        });
      }

      // step_updated from backend auto-step → sync progress
      if (type === "step_updated" && typeof data?.current_step === "number") {
        setLocalCompletedCount(data.current_step);
      }
    };
    window.addEventListener("ws_event", handleAutoStep);
    return () => window.removeEventListener("ws_event", handleAutoStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleWs = (e) => {
      const { type, data } = e.detail || {};
      if (data?.is_demo) setInternalDemoActive(true);
      if (type === "ai_suggestion_ready" && data?.current_step) {
        setDemoActiveStep(data.current_step);
        setTimeout(() => setDemoCompletedCount(data.current_step - 1), 800);
      }
    };
    window.addEventListener("demo_event_received", handleWs);
    return () => window.removeEventListener("demo_event_received", handleWs);
  }, []);

  // Reset local counter when intent changes (new service selected)
  useEffect(() => {
    setLocalCompletedCount(null);
  }, [intentKey]);

  const intentCfg = INTENT_CONFIG[intentKey] ?? INTENT_CONFIG["general"];
  const langCode = activeSession?.customer_language_code ?? "hi";

  // Knowledge data from bankingKnowledge.js
  const kbData = getIntentData(intentKey);

  // Steps: priority → dynamicProcess (intent_engine JSON) → WS DB steps → KB fallback
  // ⚠️ For 'general' intent: always use bankingKnowledge.js steps.
  //    Backend sends generic exploratory steps for GENERAL which are not real UBI steps.
  // For specific intents: dynamic backend steps take priority (more accurate).
  const fallbackSteps = kbData.steps.map((s, i) => ({
    id: `kb_${i}`,
    step_text_hindi: s.textHindi,
    textHindi: s.textHindi,
    textEnglish: s.textEnglish,
    step_text: s.textHindi,
    speak_to_customer: s.speakToCustomer,
    speakToCustomer: s.speakToCustomer,
    speakLabel: s.speakLabel,
    isRBIMandatory: s.isRBIMandatory,
    docHint: s.docHint,
  }));
  const dynamicSteps = dynamicProcess
    ? dynamicProcess.process_steps || dynamicProcess.general_process_steps || []
    : null;
  // For 'general' intent always use bankingKnowledge steps (backend sends generic non-UBI steps)
  const useKBSteps = intentKey === "general";
  const processStepsLocal =
    !useKBSteps && dynamicSteps && dynamicSteps.length > 0
      ? dynamicSteps
      : !useKBSteps &&
          processSteps?.length > 0 &&
          processSteps.length >= fallbackSteps.length
        ? processSteps
        : fallbackSteps;

  const totalCount = processStepsLocal.length;
  const globalCompleted = Math.max(
    0,
    Math.min(typeof currentStep === "number" ? currentStep : 0, totalCount),
  );
  // Keep ref in sync so the ws_event useEffect can read the latest value
  globalCompletedRef.current = globalCompleted;
  // Priority: demo > local (KB fallback advance) > WS/Zustand global
  const completedCount =
    demoCompletedCount !== null
      ? demoCompletedCount
      : localCompletedCount !== null
        ? localCompletedCount
        : globalCompleted;
  const stepLabel =
    demoActiveStep !== null
      ? demoActiveStep
      : completedCount < totalCount
        ? completedCount + 1
        : totalCount;
  const progressPct =
    totalCount > 0 ? Math.round((stepLabel / totalCount) * 100) : 0;

  // Handlers
  const handleComplete = useCallback(
    async (step, localIndex) => {
      const sessionId = activeSession?.id ?? activeSession?.session_id ?? null;
      const isFallbackId =
        typeof step.id === "string" && isNaN(Number(step.id));

      if (isFallbackId) {
        // KB fallback step — no real step_id, advance locally
        setLocalCompletedCount((prev) => {
          const base = prev !== null ? prev : globalCompleted;
          return Math.min(base + 1, totalCount);
        });
        return;
      }

      if (!sessionId || !step?.id) return;
      try {
        await processAPI.completeStep(sessionId, step.id);
        // Also advance locally so UI responds instantly (WS update will sync after)
        setLocalCompletedCount((prev) => {
          const base = prev !== null ? prev : globalCompleted;
          return Math.min(base + 1, totalCount);
        });
      } catch (err) {
        toast.error(err?.message ?? "Could not mark step complete");
      }
    },
    [activeSession?.id, globalCompleted, totalCount],
  );

  const handleSpeak = useCallback(
    async (step) => {
      const sessionId = activeSession?.id ?? activeSession?.session_id ?? null;
      if (!sessionId) return;

      // Normalize short BCP-47 code → full code that Sarvam TTS expects
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
      const shortCode = (langCode || "hi").split("-")[0];
      const fullLangCode = LANG_CODE_MAP[shortCode] ?? `${shortCode}-IN`;

      const LANG_FIELD_MAP = {
        hi: "hindi",
        mr: "marathi",
        ta: "tamil",
        te: "telugu",
        bn: "bengali",
        kn: "kannada",
        or: "odia",
        pa: "punjabi",
        gu: "gujarati",
        ml: "malayalam",
      };
      const langField = LANG_FIELD_MAP[shortCode] || "hindi";

      // Always send Hindi source text — backend translates to customer language
      // Supports DB format (step_text_hindi) AND JSON format (title + detail + staff_action)
      const text =
        step?.step_text_hindi ||
        step?.textHindi ||
        step?.[`step_text_${langField}`] ||
        step?.step_text_customer ||
        step?.step_text ||
        step?.title ||
        "";
      if (!text) {
        toast.error("No text available for this step");
        return;
      }

      // Find the index of this step in processStepsLocal to pass to handleComplete
      const stepIndex = processStepsLocal.findIndex(
        (s) => (s.id ?? s.num) === (step.id ?? step.num),
      );
      await handleComplete(step, stepIndex);
      try {
        sendMessage("staff_approved_response", {
          response_text: text,
          target_language_code: fullLangCode, // "gu-IN" not just "gu"
          session_id: sessionId,
          step_id: step?.id ?? null,
          use_suggestion: false,
        });
        toast.success(`Sent to customer in ${fullLangCode}`, {
          icon: "🔊",
          duration: 2000,
        });
      } catch (err) {
        toast.error(err?.message ?? "Failed to send to customer");
      }
    },
    [
      activeSession?.id,
      langCode,
      sendMessage,
      handleComplete,
      processStepsLocal,
    ],
  );

  // Render
  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden"
      style={{
        width: "100%",
        flex: "1 1 0",
        minHeight: 0,
        background: "var(--card-bg, #fff)",
        border: "0.5px solid var(--card-border, rgba(0,0,0,0.10))",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* DEMO badge */}
      {isDemoActive && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            background: "#f97316",
            color: "white",
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: "bold",
            letterSpacing: 0.5,
            zIndex: 10,
          }}
        >
          DEMO
        </div>
      )}

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ padding: "14px 16px 0" }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-primary, #0f172a)" }}
        >
          Process steps
        </span>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: intentCfg.bg, color: intentCfg.color }}
        >
          {loanSubLabel ?? intentCfg.label}
        </span>
      </div>

      {/* ── Tab bar ── */}
      <div
        ref={tabBarRef}
        className="flex overflow-x-auto shrink-0"
        style={{
          padding: "10px 16px 0",
          gap: 6,
          borderBottom: "0.5px solid var(--divider, rgba(0,0,0,0.10))",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          cursor: "grab",
        }}
        onMouseDown={(e) => {
          const el = e.currentTarget;
          el.style.cursor = "grabbing";
          el.style.userSelect = "none";
          const startX = e.pageX - el.offsetLeft;
          const scrollLeft = el.scrollLeft;
          const onMove = (ev) => {
            const x = ev.pageX - el.offsetLeft;
            el.scrollLeft = scrollLeft - (x - startX);
          };
          const onUp = () => {
            el.style.cursor = "grab";
            el.style.userSelect = "";
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="shrink-0 text-xs font-medium transition-all duration-150"
              style={{
                whiteSpace: "nowrap",
                padding: "7px 12px",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                border: isActive
                  ? "0.5px solid var(--divider, rgba(0,0,0,0.10))"
                  : "0.5px solid transparent",
                borderBottom: isActive
                  ? "0.5px solid var(--card-bg, #fff)"
                  : "0.5px solid transparent",
                background: isActive ? "var(--card-bg, #fff)" : "transparent",
                color: isActive
                  ? "var(--accent-blue, #185FA5)"
                  : "var(--text-secondary, #64748b)",
                position: "relative",
                top: isActive ? "0.5px" : "0",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{
          padding: "14px 16px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.15) transparent",
        }}
      >
        <AnimatePresence mode="wait">
          {processStepsLocal.length === 0 && activeTab === "steps" ? (
            <WaitingState key="waiting" />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "steps" && (
                <StepsTab
                  steps={processStepsLocal}
                  completedCount={completedCount}
                  stepLabel={stepLabel}
                  langCode={langCode}
                  staffLanguage={staffLanguage}
                  onComplete={handleComplete}
                  onSpeak={handleSpeak}
                />
              )}


              {activeTab === "info" && (
                <InfoTab
                  info={[
                    // Dynamic key_info from PROCESS_UPDATE (if available)
                    ...(dynamicKeyInfo && Object.keys(dynamicKeyInfo).length > 0
                      ? [
                          {
                            blockTitle: "Live Info (AI Detected)",
                            rows: Object.entries(dynamicKeyInfo).map(
                              ([k, v]) => ({ key: k, value: v }),
                            ),
                          },
                        ]
                      : []),
                    ...kbData.info,
                  ]}
                  infoBoard={infoBoard}
                  docReadiness={docReadiness}
                  sendStaffApproved={sendStaffApproved}
                  sendMessage={sendMessage}
                  sendForceNext={sendForceNext}
                  sendEditField={sendEditField}
                  sendUndoNext={sendUndoNext}
                />
              )}

              {/* P2 F-HIGH-3: Lazy-loaded tabs wrapped in Suspense */}
              <Suspense fallback={<TabLoader />}>
                {activeTab === "profile" && (
                  <ProfileTab
                    sessionId={
                      activeSession?.id ?? activeSession?.session_id ?? null
                    }
                    activeSession={activeSession}
                  />
                )}


                {activeTab === "send" && (
                  <SendTab
                    activeSession={activeSession}
                    sendMessage={sendMessage}
                  />
                )}
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer — progress bar ── */}
      <div
        className="shrink-0"
        style={{
          borderTop: "0.5px solid var(--divider, rgba(0,0,0,0.10))",
          padding: "11px 16px",
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-xs"
            style={{ color: "var(--text-secondary, #64748b)" }}
          >
            Step {stepLabel} of {totalCount}
            {intentCfg?.label ? ` — ${intentCfg.label}` : ""}
          </span>
          <span className="text-xs font-medium" style={{ color: "#A32D2D" }}>
            {progressPct}%
          </span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            height: 4,
            background: "var(--body-bg, #f1f5f9)",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="h-full rounded-full"
            style={{ background: "#E8231A" }}
          />
        </div>
      </div>
    </div>
  );
}
