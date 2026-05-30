import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Users, Globe, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { analyticsAPI, aiAPI } from "../../services/api";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import { LANGUAGES } from "../../constants";
import { fmtDuration } from "../../utils/managerUtils.jsx";

// PII Alert Banner
function PIIAlert({ onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [onHide]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
      style={{
        background: "rgba(234,179,8,0.15)",
        border: "1px solid rgba(234,179,8,0.4)",
        color: "#ca8a04",
      }}
    >
      <span>🔒</span>
      <span>Aadhaar masked automatically</span>
    </motion.div>
  );
}

// Sentiment Config
const SENTIMENT_CONFIG = {
  calm: { label: "Calm", color: "#16a34a", bg: "rgba(22,163,74,0.12)" },
  frustrated: {
    label: "Frustrated",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.12)",
  },
  confused: { label: "Confused", color: "#d97706", bg: "rgba(217,119,6,0.12)" },
  urgent: { label: "Urgent", color: "#7c3aed", bg: "rgba(124,58,237,0.12)" },
};

// Staff-to-Customer Card
function StaffSpeakCard({ exchange, exchangeIndex, staffLanguage }) {
  const theme = useApp((s) => s.theme);
  const isDark = theme === "dark";
  const exchangeNumber =
    exchange.exchange_number ?? exchange.exchangeNumber ?? exchangeIndex + 1;
  const timeRaw = exchange.created_at ?? exchange.timestamp ?? null;
  const timeStr = timeRaw
    ? new Date(timeRaw).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const textHindi =
    exchange.staff_original_text ||
    exchange.staff_response_final ||
    exchange.staff_response_suggested ||
    "";

  // English translation — lazy load when staffLanguage switches to 'en'
  const [englishText, setEnglishText] = useState(null); // null = not fetched yet
  const [translating, setTranslating] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (staffLanguage !== "en" || !textHindi || fetchedRef.current) return;
    fetchedRef.current = true;
    setTranslating(true);
    aiAPI
      .translateToEnglish(textHindi)
      .then((eng) => setEnglishText(eng))
      .catch(() => setEnglishText(textHindi)) // fallback: show Hindi
      .finally(() => setTranslating(false));
  }, [staffLanguage, textHindi]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="self-end max-w-[80%] md:max-w-[70%] rounded-2xl rounded-tr-sm p-3.5 flex flex-col gap-2.5 relative"
      style={{
        background: isDark ? "#0b3c33" : "#d9fdd3",
        border: isDark
          ? "1px solid rgba(11, 60, 51, 0.4)"
          : "1px solid rgba(22, 163, 74, 0.12)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        alignSelf: "flex-end",
      }}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            background: isDark
              ? "rgba(74,222,128,0.15)"
              : "rgba(22,163,74,0.12)",
            color: isDark ? "#4ade80" : "#16a34a",
          }}
        >
          #{exchangeNumber} Staff
        </span>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{
            background: isDark
              ? "rgba(74,222,128,0.1)"
              : "rgba(22,163,74,0.08)",
            color: isDark ? "#4ade80" : "#16a34a",
            border: isDark
              ? "1px solid rgba(74,222,128,0.2)"
              : "1px solid rgba(22,163,74,0.15)",
          }}
        >
          🌐 Spoken
        </span>
      </div>

      {/* Staff original (Hindi or English translation) */}
      <div
        className="text-sm p-3 rounded-xl border transition-all duration-150"
        style={{
          background: isDark ? "rgba(22, 163, 74, 0.12)" : "#ffffff",
          borderColor: isDark
            ? "rgba(22, 163, 74, 0.25)"
            : "rgba(22, 163, 74, 0.15)",
          borderLeft: "4px solid #16a34a",
          boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <p
          className="text-[11.5px] font-bold mb-1"
          style={{ color: isDark ? "#4ade80" : "#16a34a" }}
        >
          {staffLanguage === "en"
            ? "English (Translated)"
            : `Original (${exchange.staff_lang_name || "Hindi"})`}
        </p>
        <p
          style={{ color: isDark ? "#e2e8f0" : "#1f2937", lineHeight: "1.45" }}
        >
          {staffLanguage === "en" ? (
            translating ? (
              <span style={{ color: "var(--text-muted, #94a3b8)", fontStyle: "italic" }}>
                Translating…
              </span>
            ) : (
              englishText || textHindi || "—"
            )
          ) : (
            textHindi || "—"
          )}
        </p>
      </div>

      {/* Translated to customer language */}
      <div
        className="text-sm p-3 rounded-xl border transition-all duration-150"
        style={{
          background: isDark ? "rgba(37, 99, 235, 0.12)" : "#ffffff",
          borderColor: isDark
            ? "rgba(37, 99, 235, 0.25)"
            : "rgba(37, 99, 235, 0.15)",
          borderLeft: "4px solid #2563eb",
          boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <p
          className="text-[11.5px] font-bold mb-1"
          style={{ color: isDark ? "#60a5fa" : "#2563eb" }}
        >
          {exchange.customer_lang_name || "Customer Language"} (Spoken)
        </p>
        <p
          style={{ color: isDark ? "#e2e8f0" : "#1f2937", lineHeight: "1.45" }}
        >
          {(() => {
            const translated =
              exchange.staff_translated_text ||
              exchange.staff_response_translated;
            if (translated) return translated;
            return (
              <span style={{ color: "#94a3b8", fontStyle: "italic" }}>···</span>
            );
          })()}
        </p>
      </div>

      {/* Footer / Time / Ticks */}
      <div className="flex items-center justify-end gap-1 mt-0.5 shrink-0">
        {timeStr && (
          <span
            className="text-[10px]"
            style={{ color: isDark ? "#94a3b8" : "#64748b" }}
          >
            {timeStr}
          </span>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: "#53bdeb" }}
        >
          <path
            d="M2 12L7 17L17 7M12 12L17 17L22 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}

// Customer-to-Staff Card
function CustomerCard({ exchange, exchangeIndex, offlineMode, staffLanguage }) {
  const theme = useApp((s) => s.theme);
  const isDark = theme === "dark";

  const piiDetected = Boolean(exchange.pii_detected);
  const piiMaskedText =
    exchange.pii_masked_text ?? exchange.masked_text ?? null;

  const textOriginal =
    exchange.customer_text_original ??
    exchange.text_original ??
    exchange.staff_response_translated ??
    "";

  const textHindi =
    exchange.customer_text_translated ??
    exchange.text_translated ??
    exchange.staff_response_final ??
    "";

  // English translation — lazy load when staffLanguage switches to 'en'
  const [englishText, setEnglishText] = useState(null); // null = not fetched yet
  const [translating, setTranslating] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (staffLanguage !== "en" || !textHindi || fetchedRef.current) return;
    fetchedRef.current = true;
    setTranslating(true);
    aiAPI
      .translateToEnglish(textHindi)
      .then((eng) => setEnglishText(eng))
      .catch(() => setEnglishText(textHindi)) // fallback: show Hindi
      .finally(() => setTranslating(false));
  }, [staffLanguage, textHindi]);

  const timeRaw =
    exchange.created_at ?? exchange.timestamp ?? exchange.createdAt ?? null;
  const timeStr = timeRaw
    ? new Date(timeRaw).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const confidenceRaw =
    exchange.stt_confidence ??
    exchange.confidence ??
    exchange.sttConfidence ??
    null;
  const confidencePct =
    confidenceRaw == null
      ? null
      : Number(confidenceRaw) <= 1
        ? Math.round(Number(confidenceRaw) * 100)
        : Math.round(Number(confidenceRaw));

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="self-start max-w-[80%] md:max-w-[70%] rounded-2xl rounded-tl-sm p-3.5 flex flex-col gap-2.5 relative"
      style={{
        background: isDark ? "var(--card-bg, #1c2333)" : "#ffffff",
        border: isDark
          ? "1px solid var(--card-border)"
          : "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        alignSelf: "flex-start",
      }}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {offlineMode && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold"
              style={{
                background: "rgba(100,116,139,0.12)",
                color: "#475569",
              }}
            >
              🖥 Local
            </span>
          )}
          {confidencePct != null && !Number.isNaN(confidencePct) && (
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted, #94a3b8)" }}
            >
              {confidencePct}%
            </span>
          )}
        </div>
      </div>

      {/* Customer text original */}
      <div
        className="text-sm p-3 rounded-xl border transition-all duration-150"
        style={{
          background: isDark ? "rgba(0, 48, 135, 0.15)" : "#ffffff",
          borderColor: isDark
            ? "rgba(0, 48, 135, 0.3)"
            : "rgba(0, 48, 135, 0.15)",
          borderLeft: "4px solid var(--accent-blue, #003087)",
          boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <p
          className="text-[11.5px] font-bold mb-1"
          style={{ color: isDark ? "#60a5fa" : "var(--blue, #003087)" }}
        >
          Customer ({exchange.customer_lang_name || "Original"})
        </p>
        <p
          style={{ color: "var(--text-primary, #1f2937)", lineHeight: "1.45" }}
        >
          {piiDetected
            ? (piiMaskedText ?? textOriginal ?? "—")
            : textOriginal || "—"}
        </p>
      </div>

      {/* Translated text */}
      <div
        className="text-sm p-3 rounded-xl border transition-all duration-150"
        style={{
          background: isDark ? "rgba(232, 35, 26, 0.15)" : "#ffffff",
          borderColor: isDark
            ? "rgba(232, 35, 26, 0.3)"
            : "rgba(232, 35, 26, 0.15)",
          borderLeft: "4px solid var(--accent-red, #E8231A)",
          boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <p
          className="text-[11.5px] font-bold mb-1"
          style={{ color: isDark ? "#ff4d45" : "var(--red, #E8231A)" }}
        >
          {staffLanguage === "en"
            ? "English (Translated)"
            : "Hindi (Translated — Staff View)"}
        </p>
        <p
          style={{ color: "var(--text-primary, #1f2937)", lineHeight: "1.45" }}
        >
          {staffLanguage === "en" ? (
            translating ? (
              <span
                style={{
                  color: "var(--text-muted, #94a3b8)",
                  fontStyle: "italic",
                }}
              >
                Translating…
              </span>
            ) : (
              englishText || textHindi || "—"
            )
          ) : (
            textHindi || "—"
          )}
        </p>
      </div>

      {/* Footer / Time */}
      {timeStr && (
        <div className="flex justify-end mt-0.5 shrink-0">
          <span
            className="text-[10px]"
            style={{ color: "var(--text-muted, #94a3b8)" }}
          >
            {timeStr}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// Exchange Card Router
function ExchangeCard({ exchange, exchangeIndex, offlineMode, staffLanguage }) {
  if (exchange.direction === "staff_to_customer") {
    return (
      <StaffSpeakCard
        exchange={exchange}
        exchangeIndex={exchangeIndex}
        staffLanguage={staffLanguage}
      />
    );
  }
  return (
    <CustomerCard
      exchange={exchange}
      exchangeIndex={exchangeIndex}
      offlineMode={offlineMode}
      staffLanguage={staffLanguage}
    />
  );
}

// Idle Stats Card
function StatsCard({ label, value, sub, icon: Icon, color }) {
  const theme = useApp((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <div
      className="rounded-2xl px-6 py-5 flex flex-col gap-3 flex-1 min-w-[140px] transition-all duration-300 hover:translate-y-[-4px]"
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
        border: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,48,135,0.08)",
        boxShadow: isDark
          ? "none"
          : "0 10px 25px -5px rgba(0,48,135,0.05), 0 8px 10px -6px rgba(0,48,135,0.05)",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: color ? `${color}15` : "rgba(0,48,135,0.08)",
            color: color || "var(--blue, #003087)",
          }}
        >
          {Icon && <Icon size={20} />}
        </div>
        {sub && (
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{
              background: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.04)",
              color: "var(--text-muted)",
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <div>
        <p
          className="text-xs font-semibold mb-1"
          style={{ color: "var(--text-muted, #64748b)" }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// Walk-in Language Select Modal
function WalkInModal({ isOpen, onClose, onConfirm, loading }) {
  const [selectedLang, setSelectedLang] = useState(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Walk-in Customer"
      size="md"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm" style={{ color: "var(--text-muted, #64748b)" }}>
          Select the customer's preferred language to begin the session.
        </p>

        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
          {LANGUAGES.map((lang) => {
            const active = selectedLang?.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang)}
                className="flex flex-col items-start px-3 py-3 rounded-lg text-left transition-all duration-150"
                style={{
                  background: active
                    ? "rgba(0,48,135,0.10)"
                    : "var(--body-bg, #F4F6F9)",
                  border: active
                    ? "2px solid var(--blue, #003087)"
                    : "2px solid transparent",
                }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {lang.native}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted, #94a3b8)" }}
                >
                  {lang.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => selectedLang && onConfirm(selectedLang)}
            disabled={!selectedLang || loading}
          >
            {loading ? <Spinner size="sm" /> : "Start Session"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Idle State
function IdleState({ analytics, onWalkIn }) {
  const staff = useApp((s) => s.staff);
  const theme = useApp((s) => s.theme);
  const isDark = theme === "dark";

  const sessions = analytics?.total_sessions ?? 0;
  const completed = analytics?.completed_sessions ?? 0;
  const rawDuration = fmtDuration(analytics?.avg_duration_seconds);
  const avgDuration = rawDuration === "—" ? "0s" : rawDuration;
  const langs = analytics?.languages_used ?? {};

  const firstName = staff?.full_name?.split(" ")[0] || "there";

  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col h-full overflow-y-auto custom-scrollbar"
    >
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10 py-12 px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.15, 0.08, 0.15],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-8 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, #003087 0%, transparent 70%)",
              }}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center cursor-pointer overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #003087 0%, #001a52 100%)",
                boxShadow: "0 20px 40px -12px rgba(0,48,135,0.45)",
              }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg
                width="36"
                height="36"
                fill="none"
                viewBox="0 0 24 24"
                className="relative z-20"
              >
                <path
                  d="M12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z"
                  fill="white"
                />
                <path
                  d="M6 11a6 6 0 0 0 12 0M12 18v3M9 21h6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          </div>

          <div className="text-center space-y-2">
            <h2
              className="text-4xl font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Good day, {firstName}!
            </h2>
            <p
              className="text-lg font-medium opacity-60"
              style={{ color: "var(--text-primary)" }}
            >
              Ready to help our customers today?
            </p>
          </div>
        </div>

        {/* Quick Action */}
        <button
          onClick={onWalkIn}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl transition-all duration-300 hover:shadow-red-500/25 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #E8231A 0%, #c11b14 100%)",
            boxShadow: "0 15px 30px -10px rgba(232,35,26,0.4)",
          }}
        >
          <span>New Walk-in Customer</span>
          <ArrowRight
            size={20}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>

        {/* Stats Grid */}
        <div className="w-full max-w-4xl mt-4 px-4 pb-12">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3
              className="text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--text-muted)" }}
            >
              Your Impact Today
            </h3>
            <div className="h-px flex-1 mx-4 bg-current opacity-10" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              label="Sessions"
              value={sessions || "0"}
              icon={Users}
              color="#003087"
            />
            <StatsCard
              label="Avg Duration"
              value={avgDuration}
              icon={Clock}
              color="#d97706"
              sub="Time"
            />
            <StatsCard
              label="Resolution"
              value={sessions ? `${completed}/${sessions}` : "0/0"}
              icon={CheckCircle2}
              color="#16a34a"
              sub="Live"
            />
            <StatsCard
              label="Rating"
              value="4.9"
              icon={CheckCircle2}
              color="#7c3aed"
              sub="Avg"
            />
          </div>

          {/* Languages Scrollable Column Chart */}
          <div
            className="rounded-2xl p-6 mb-8"
            style={{
              background: "var(--card-bg, #ffffff)",
              border: "1px solid var(--border-color, rgba(0,48,135,0.08))",
              boxShadow: "0 10px 25px -5px rgba(0,48,135,0.05)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(124, 58, 237, 0.1)",
                    color: "#7c3aed",
                  }}
                >
                  <Globe size={18} />
                </div>
                <h4
                  className="font-bold text-sm uppercase tracking-wider"
                  style={{ color: "var(--text-primary)" }}
                >
                  Language Distribution
                </h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-slate-100 text-slate-500">
                Top 10 Languages
              </span>
            </div>

            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex items-end gap-6 min-w-max px-2 h-40">
                {(() => {
                  // Pre-calculate merged counts to get correct maxCount
                  const mergedLangs = LANGUAGES.map((l) => ({
                    ...l,
                    count: (langs[l.code] ?? 0) + (langs[l.name] ?? 0),
                  }));
                  const maxCount = Math.max(
                    ...mergedLangs.map((l) => l.count),
                    1,
                  );

                  return mergedLangs.map((lang) => {
                    const heightPercent = Math.max(
                      (lang.count / maxCount) * 100,
                      5,
                    ); // min 5% height

                    return (
                      <div
                        key={lang.code}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <div className="relative w-12 flex flex-col items-center justify-end h-32">
                          {/* Tooltip */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap z-20">
                            {lang.count} Sessions
                          </div>

                          {/* Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            className="w-full rounded-t-lg relative overflow-hidden"
                            style={{
                              background:
                                "linear-gradient(to top, #7c3aed, #a78bfa)",
                              boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
                            }}
                          >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        </div>

                        <div className="flex flex-col items-center">
                          <span
                            className="text-xs font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {lang.name}
                          </span>
                          <span className="text-[10px] opacity-50 font-medium">
                            {lang.code.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts for Staff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
              style={{ background: "var(--card-bg, #ffffff)" }}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div>
                <h5 className="font-bold text-sm">Customer Directory</h5>
                <p className="text-xs text-slate-500">
                  Quickly find past interactions
                </p>
              </div>
            </div>
            <div
              className="p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
              style={{ background: "var(--card-bg, #ffffff)" }}
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h5 className="font-bold text-sm">Staff Guidelines</h5>
                <p className="text-xs text-slate-500">
                  Banking protocols & best practices
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Customer Speaking Indicator
function CustomerSpeakingIndicator({ isListening, isProcessing }) {
  if (!isListening && !isProcessing) return null;

  const isSTT = isProcessing && !isListening;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="self-start flex items-center gap-3 px-4 py-2.5 rounded-xl rounded-tl-sm"
      style={{
        background: isSTT ? "rgba(0,48,135,0.06)" : "rgba(22,163,74,0.08)",
        border: isSTT
          ? "1px solid rgba(0,48,135,0.15)"
          : "1px solid rgba(22,163,74,0.25)",
        alignSelf: "flex-start",
      }}
    >
      {/* Animated mic / spinner icon */}
      {isListening ? (
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ scaleY: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut",
              }}
              style={{
                width: 3,
                height: 16,
                borderRadius: 2,
                background: "#16a34a",
                transformOrigin: "center",
              }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2.5px solid rgba(0,48,135,0.25)",
            borderTopColor: "#003087",
            flexShrink: 0,
            animation: "vaani-spin 0.75s linear infinite",
          }}
        />
      )}

      <div className="flex flex-col">
        <span
          className="text-xs font-semibold"
          style={{ color: isSTT ? "#003087" : "#16a34a" }}
        >
          {isListening
            ? "Customer is speaking…"
            : "Transcription + Translation in progress…"}
        </span>
        <span
          className="text-xs"
          style={{ color: "var(--text-muted, #94a3b8)" }}
        >
          {isListening
            ? "Awaiting audio input"
            : "Sarvam STT → Groq LLM processing"}
        </span>
      </div>
    </motion.div>
  );
}

// Live Ghost Card (Real-time customer speech streaming)
function LiveGhostCard({ text }) {
  if (!text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.99 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="self-start max-w-[80%] md:max-w-[70%] rounded-2xl rounded-tl-sm p-3.5 flex flex-col gap-2.5 relative"
      style={{
        background: "rgba(0, 48, 135, 0.03)",
        border: "1px dashed rgba(0, 48, 135, 0.25)",
        backdropFilter: "blur(4px)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        alignSelf: "flex-start",
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: "#16a34a",
              boxShadow: "0 0 0 4px rgba(22,163,74,0.2)",
              animation: "vaani-pulse 1.5s infinite",
            }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "#16a34a" }}
          >
            Real-time Streaming
          </span>
        </div>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
          style={{
            background: "rgba(0, 48, 135, 0.08)",
            color: "#003087",
            border: "1px solid rgba(0, 48, 135, 0.12)",
          }}
        >
          ✦ Live Speech
        </span>
      </div>

      <div className="text-sm">
        <p
          className="text-[11px] font-bold mb-0.5"
          style={{ color: "var(--text-muted, #64748b)" }}
        >
          {text === "\u2026"
            ? "Customer is speaking…"
            : "Customer Speaking (Transcribing...)"}
        </p>
        <p
          style={{
            color: "var(--text-primary)",
            fontSize: "0.95rem",
            lineHeight: "1.4",
            fontWeight: "500",
          }}
          className="italic"
        >
          {text === "\u2026" ? (
            // Placeholder before first partial arrives — show animated dots only
            <span
              style={{
                color: "var(--text-muted, #94a3b8)",
                fontStyle: "normal",
                letterSpacing: "0.1em",
              }}
            >
              &#8226;&#8226;&#8226;
            </span>
          ) : (
            <>
              {text}
              <span
                className="inline-block ml-1 w-1.5 h-4 align-middle"
                style={{
                  backgroundColor: "var(--blue, #003087)",
                  animation: "vaani-blink 1s step-end infinite",
                }}
              />
            </>
          )}
        </p>
      </div>
    </motion.div>
  );
}

// Active Session State
function ActiveState({
  exchanges,
  offlineMode,
  isListening,
  isProcessing,
  staffLanguage,
  liveTranscript,
}) {
  const theme = useApp((s) => s.theme);
  const isDark = theme === "dark";
  const bottomRef = useRef(null);
  const [showPiiBanner, setShowPiiBanner] = useState(false);
  const prevLen = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [exchanges.length, isListening, isProcessing, liveTranscript]);

  useEffect(() => {
    if (exchanges.length <= prevLen.current) return;
    prevLen.current = exchanges.length;
    const latest = exchanges[exchanges.length - 1];
    if (latest?.pii_detected) setShowPiiBanner(true);
  }, [exchanges]);

  const hidePii = useCallback(() => setShowPiiBanner(false), []);

  return (
    <motion.div
      key="active"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      <div className="px-4 pt-3 shrink-0">
        <AnimatePresence>
          {showPiiBanner && <PIIAlert key="pii" onHide={hidePii} />}
        </AnimatePresence>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
        style={{
          backgroundColor: isDark ? "var(--body-bg, #0F1117)" : "#ffffff",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${isDark ? "%23ffffff" : "%23cbd5e1"}' fill-opacity='${isDark ? "0.015" : "0.22"}' fill-rule='evenodd'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm1-61c3.16 0 5.6 2.24 5.6 5.6s-2.24 5.6-5.6 5.6-5.6-2.24-5.6-5.6 2.24-5.6 5.6-5.6zm29 0c3.16 0 5.6 2.24 5.6 5.6s-2.24 5.6-5.6 5.6-5.6-2.24-5.6-5.6 2.24-5.6 5.6-5.6zM9 57c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm58 21c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM46 51c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zM26 11c.552 0 1-.448 1-1V6c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm6 30c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zM20 70h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0-20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zM50 10h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0 20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm20 30h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0 20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zM3 13h4c.552 0 1-.448 1-1s-.448-1-1-1H3c-.552 0-1 .448-1 1s.448 1 1 1zm0 20h4c.552 0 1-.448 1-1s-.448-1-1-1H3c-.552 0-1 .448-1 1s.448 1 1 1zM28 88c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0-20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zM68 88c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0-20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zM48 68h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0-20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zM72 48h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0-20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zM18 90h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0-20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zM11 9c.552 0 1-.448 1-1V4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm40 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0-20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0-20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0-20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zM28 28c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0-20c.552 0 1-.448 1-1V3c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm40 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0-20c.552 0 1-.448 1-1V3c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zM8 68H4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0-20H4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm60 20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0-20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zM8 12H4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0 20H4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm60 0h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0-20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm-32 8h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0 20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm-8 8h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0 20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm16-28c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm-8-8c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm32-12c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm-8-8c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm-8-8h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0 20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm-8-8h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0 20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm-8-8c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm-8-8c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm0 20c.552 0 1-.448 1-1v-4c0-.552-.448-1-1-1s-1 .448-1 1v4c0 .552.448 1 1 1zm-8-8h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0 20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm-8-8h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1zm0 20h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1s-.448-1-1-1z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundAttachment: "local",
        }}
      >
        {exchanges.length === 0 &&
          !isListening &&
          !isProcessing &&
          !liveTranscript && (
            <div
              className="flex flex-col items-center justify-center h-full gap-3"
              style={{ opacity: 0.5 }}
            >
              <Spinner />
              <p
                className="text-sm"
                style={{ color: "var(--text-muted, #64748b)" }}
              >
                Waiting for customer to speak…
              </p>
            </div>
          )}

        <AnimatePresence initial={false}>
          {exchanges.map((ex, idx) => (
            <ExchangeCard
              key={
                ex.id ??
                (ex.exchange_id ? `ex-db-${ex.exchange_id}` : `ex-${idx}`)
              }
              exchange={ex}
              exchangeIndex={idx}
              offlineMode={offlineMode}
              staffLanguage={staffLanguage}
            />
          ))}
        </AnimatePresence>

        {/* Live ghost text bubble */}
        <AnimatePresence>
          {liveTranscript && (
            <LiveGhostCard key="live-ghost-card" text={liveTranscript} />
          )}
        </AnimatePresence>

        {/* Live indicator — always at bottom after exchanges */}
        <AnimatePresence>
          {(isListening || isProcessing) && (
            <CustomerSpeakingIndicator
              key="speaking-indicator"
              isListening={isListening}
              isProcessing={isProcessing}
            />
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </motion.div>
  );
}

// ConversationPanel (root export)
export default function ConversationPanel() {
  const activeSession = useApp((s) => s.activeSession);
  const exchanges = useApp((s) => s.exchanges);
  const staff = useApp((s) => s.staff);
  const createSession = useApp((s) => s.createSession);
  const isListening = useApp((s) => s.isListening);
  const isProcessing = useApp((s) => s.isProcessing);
  const staffLanguage = useApp((s) => s.staffLanguage ?? "hi");
  const liveTranscript = useApp((s) => s.liveTranscript);

  const [showWalkIn, setShowWalkIn] = useState(false);
  const [creating, setCreating] = useState(false);
  const [analyticsToday, setAnalyticsToday] = useState(null);
  const [isDemoActive, setIsDemoActive] = useState(false);

  useEffect(() => {
    const handleDemo = () => setIsDemoActive(true);
    window.addEventListener("demo_event_received", handleDemo);
    return () => window.removeEventListener("demo_event_received", handleDemo);
  }, []);

  const offlineMode = Boolean(activeSession?.offline_mode);
  const safeExchanges = Array.isArray(exchanges) ? exchanges : [];

  const refreshAnalytics = useCallback(async () => {
    if (!staff?.branch_id) return;
    try {
      const a = await analyticsAPI.getBranchAnalyticsToday(staff.branch_id);
      setAnalyticsToday(a);
    } catch {
      setAnalyticsToday(null);
    }
  }, [staff?.branch_id]);

  useEffect(() => {
    if (!activeSession) refreshAnalytics();
  }, [activeSession, refreshAnalytics]);

  const handleWalkInConfirm = async (lang) => {
    setCreating(true);
    try {
      await createSession({
        branch_code: staff?.branch_code ?? "",
        customer_language: lang.name,
        customer_language_code: lang.code,
        entry_method: "walk_in",
      });
      setShowWalkIn(false);
    } catch (err) {
      toast.error(
        `Failed to create session: ${err?.message ?? "Unknown error"}`,
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: "var(--body-bg, #F4F6F9)",
        border: "1px solid var(--border-color, rgba(0,48,135,0.08))",
      }}
    >
      <AnimatePresence>
        {isDemoActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold w-full"
            style={{
              background: "#FCD34D",
              color: "#1F2937",
              borderBottom: "1px solid #FBBF24",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "#EF4444",
                boxShadow: "0 0 0 0 rgba(239,68,68,0.7)",
                animation: "vaani-pulse 2s infinite",
              }}
            />
            🎬 Demo Mode Active — Live API simulation
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {activeSession ? (
            <ActiveState
              key="active"
              exchanges={safeExchanges}
              offlineMode={offlineMode}
              isListening={isListening}
              isProcessing={isProcessing}
              staffLanguage={staffLanguage}
              liveTranscript={liveTranscript}
            />
          ) : (
            <IdleState
              key="idle"
              analytics={analyticsToday}
              onWalkIn={() => setShowWalkIn(true)}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showWalkIn && (
          <WalkInModal
            key="walkin"
            isOpen={showWalkIn}
            onClose={() => setShowWalkIn(false)}
            onConfirm={handleWalkInConfirm}
            loading={creating}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes vaani-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes vaani-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes vaani-blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
