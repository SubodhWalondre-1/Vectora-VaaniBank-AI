import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useApp } from "../../context/AppContext";
import { aiAPI, summaryAPI } from "../../services/api";
import { API_BASE_URL } from "../../constants";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import { useAudio } from "../../hooks/useAudio";

// ─── WhatsApp Phone Modal ─────────────────────────────────────────────────────
function WhatsAppModal({ isOpen, summaryId, summary, onClose, onSuccess }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const isValid = /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));

  const handleSend = () => {
    setError("");
    try {
      const cleanPhone = phone.replace(/\s/g, "");
      // Build a formatted summary message
      const keyHindi = summary?.key_points_hindi ?? [];
      const keyCust = summary?.key_points_customer ?? [];
      const nextHindi = summary?.next_steps_hindi ?? [];
      const nextCust = summary?.next_steps_customer ?? [];
      const custLang = summary?.customer_language ?? "Customer Language";

      let msg = `🏦 *VaaniBank AI — Session Summary*\n\n`;
      if (keyHindi.length > 0 || keyCust.length > 0) {
        msg += `📌 *Key Points (Hindi):*\n`;
        keyHindi.forEach((p, i) => {
          msg += `  ${i + 1}. ${p}\n`;
        });
        msg += `\n📌 *Key Points (${custLang}):*\n`;
        keyCust.forEach((p, i) => {
          msg += `  ${i + 1}. ${p}\n`;
        });
        msg += `\n`;
      }
      if (nextHindi.length > 0 || nextCust.length > 0) {
        msg += `📋 *Next Steps (Hindi):*\n`;
        nextHindi.forEach((p, i) => {
          msg += `  ${i + 1}. ${p}\n`;
        });
        msg += `\n📋 *Next Steps (${custLang}):*\n`;
        nextCust.forEach((p, i) => {
          msg += `  ${i + 1}. ${p}\n`;
        });
        msg += `\n`;
      }
      msg += `_Powered by VaaniBank AI — Union Bank of India_`;

      const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message ?? "Failed to open WhatsApp. Try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send via WhatsApp"
      size="md"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm" style={{ color: "var(--text-muted, #64748b)" }}>
          Enter the customer's 10-digit mobile number to send the bilingual
          summary.
        </p>

        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Mobile Number
          </label>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-2.5 rounded-xl text-sm font-medium shrink-0"
              style={{
                background: "var(--body-bg, #F4F6F9)",
                border: "1.5px solid var(--border-color, rgba(0,48,135,0.15))",
                color: "var(--text-muted, #64748b)",
              }}
            >
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="9876543210"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
              style={{
                background: "var(--body-bg, #F4F6F9)",
                border: "1.5px solid var(--border-color, rgba(0,48,135,0.15))",
                color: "var(--text-primary)",
              }}
              onFocus={(e) =>
                (e.target.style.border = "1.5px solid var(--blue, #003087)")
              }
              onBlur={(e) =>
                (e.target.style.border =
                  "1.5px solid var(--border-color, rgba(0,48,135,0.15))")
              }
            />
          </div>
          {error && (
            <p className="text-xs" style={{ color: "#dc2626" }}>
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <button
            onClick={handleSend}
            disabled={!isValid}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: isValid ? "#25D366" : "rgba(37,211,102,0.25)",
              color: "white",
              cursor: isValid ? "pointer" : "not-allowed",
              border: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            Send Summary
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Summary Table Row ────────────────────────────────────────────────────────
function SummaryRow({ hindi, customer, isHeader }) {
  return (
    <div className="grid gap-px" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div
        className="px-3 py-2 text-sm"
        style={{
          background: isHeader ? "rgba(0,48,135,0.08)" : "rgba(0,48,135,0.03)",
          color: isHeader ? "var(--blue, #003087)" : "var(--text-primary)",
          fontWeight: isHeader ? 700 : 400,
          borderRight: "1px solid var(--border-color, rgba(0,48,135,0.08))",
        }}
      >
        {hindi}
      </div>
      <div
        className="px-3 py-2 text-sm"
        style={{
          background: isHeader
            ? "rgba(232,35,26,0.06)"
            : "rgba(232,35,26,0.02)",
          color: isHeader ? "var(--red, #E8231A)" : "var(--text-primary)",
          fontWeight: isHeader ? 700 : 400,
        }}
      >
        {customer}
      </div>
    </div>
  );
}

// ─── Expanded Summary Content ─────────────────────────────────────────────────
function SummaryContent({
  summary,
  customerLang,
  onPlayResponse,
  onSaveExchange,
  onExportPDF,
  onWhatsApp,
  loadingPDF,
  loadingWA,
}) {
  const keyHindi = summary?.key_points_hindi ?? [];
  const keyCust = summary?.key_points_customer ?? [];
  const nextHindi = summary?.next_steps_hindi ?? [];
  const nextCust = summary?.next_steps_customer ?? [];

  const maxKey = Math.max(keyHindi.length, keyCust.length, 1);
  const maxNext = Math.max(nextHindi.length, nextCust.length, 1);

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 pt-2">
      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border-color, rgba(0,48,135,0.10))" }}
      >
        {/* Column headers */}
        <SummaryRow
          hindi="हिंदी"
          customer={customerLang ?? "Customer"}
          isHeader
        />

        {/* Key points section */}
        {maxKey > 0 && (
          <>
            <div
              className="px-3 py-1.5"
              style={{
                background: "rgba(0,48,135,0.05)",
                borderTop: "1px solid var(--border-color, rgba(0,48,135,0.08))",
              }}
            >
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted, #64748b)" }}
              >
                Key Points
              </span>
            </div>
            {Array.from({ length: maxKey }).map((_, i) => (
              <div
                key={`kp-${i}`}
                style={{
                  borderTop:
                    "1px solid var(--border-color, rgba(0,48,135,0.06))",
                }}
              >
                <SummaryRow
                  hindi={keyHindi[i] ?? "—"}
                  customer={keyCust[i] ?? "—"}
                />
              </div>
            ))}
          </>
        )}

        {/* Next steps section */}
        {maxNext > 0 && (
          <>
            <div
              className="px-3 py-1.5"
              style={{
                background: "rgba(232,35,26,0.04)",
                borderTop: "1px solid var(--border-color, rgba(0,48,135,0.08))",
              }}
            >
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted, #64748b)" }}
              >
                Next Steps
              </span>
            </div>
            {Array.from({ length: maxNext }).map((_, i) => (
              <div
                key={`ns-${i}`}
                style={{
                  borderTop:
                    "1px solid var(--border-color, rgba(0,48,135,0.06))",
                }}
              >
                <SummaryRow
                  hindi={nextHindi[i] ?? "—"}
                  customer={nextCust[i] ?? "—"}
                />
              </div>
            ))}
          </>
        )}

        {/* Empty state inside table */}
        {maxKey === 1 &&
          keyHindi.length === 0 &&
          maxNext === 1 &&
          nextHindi.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p
                className="text-sm"
                style={{ color: "var(--text-muted, #94a3b8)" }}
              >
                Summary will appear after session ends
              </p>
            </div>
          )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* WhatsApp */}
        <button
          onClick={onWhatsApp}
          disabled={loadingWA || !summary}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
          style={{
            background: loadingWA ? "rgba(37,211,102,0.20)" : "#25D366",
            color: "white",
            border: "none",
            cursor: loadingWA ? "not-allowed" : "pointer",
            opacity: !summary ? 0.6 : 1,
          }}
        >
          {loadingWA ? <Spinner size="sm" color="white" /> : <span>📱</span>}
          WhatsApp
        </button>
      </div>
    </div>
  );
}

// ─── BilingualSummary ─────────────────────────────────────────────────────────
export default function BilingualSummary() {
  const activeSession = useApp((s) => s.activeSession);
  const exchanges = useApp((s) => s.exchanges);

  const [expanded, setExpanded] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingWA, setLoadingWA] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showWAModal, setShowWAModal] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [lastSummaryExchangeCount, setLastSummaryExchangeCount] = useState(0);

  const exchangeCount = activeSession
    ? Array.isArray(exchanges)
      ? exchanges.length
      : 0
    : 0;
  const customerLang = activeSession?.customer_language ?? "Customer Language";
  const summaryId = summary?.id ?? null;

  const sessionId = activeSession?.id ?? activeSession?.session_id ?? null;

  useEffect(() => {
    setExpanded(false);
    setSummary(null);
    setShowWAModal(false);
    setLastSummaryExchangeCount(0);
  }, [activeSession?.token_number]);

  // Generate summary then fetch it
  const ensureSummary = useCallback(async () => {
    if (summary) return summary;
    if (!sessionId) return null;

    setGenerating(true);
    try {
      const generated = await summaryAPI.generateSummary(sessionId);
      setSummary(generated ?? null);
      setLastSummaryExchangeCount(exchangeCount);
      return generated ?? null;
    } catch (err) {
      toast.error(err?.message ?? "Summary generation failed");
      return null;
    } finally {
      setGenerating(false);
    }
  }, [exchangeCount, sessionId, summary]);

  // Live update: regenerate summary when new exchanges arrive while expanded.
  useEffect(() => {
    if (!expanded || !sessionId) return;
    if (exchangeCount <= 0) return;
    if (exchangeCount === lastSummaryExchangeCount) return;
    if (generating) return;

    const t = window.setTimeout(async () => {
      try {
        setGenerating(true);
        const generated = await summaryAPI.generateSummary(sessionId);
        setSummary(generated ?? null);
        setLastSummaryExchangeCount(exchangeCount);
      } catch (err) {
        toast.error(err?.message ?? "Summary regeneration failed");
      } finally {
        setGenerating(false);
      }
    }, 900);

    return () => window.clearTimeout(t);
  }, [
    expanded,
    exchangeCount,
    generating,
    lastSummaryExchangeCount,
    sessionId,
  ]);

  const { playAudio } = useAudio();

  // Export PDF
  const handleExportPDF = useCallback(async () => {
    if (!sessionId) {
      toast.error("No active session");
      return;
    }

    setLoadingPDF(true);
    try {
      // Try fetching existing summary first, then generate if not found
      let summaryData;
      try {
        summaryData = await summaryAPI.getSessionSummary(sessionId);
      } catch {
        // No existing summary — generate one
        summaryData = await summaryAPI.generateSummary(sessionId);
      }

      if (!summaryData?.id) throw new Error("No summary id returned");
      setSummary(summaryData);

      // If PDF is not yet generated (background task still running), poll for it
      // Increased to 40 attempts (60s) to allow for slower LLM summary generation
      let attempts = 0;
      while (!summaryData.pdf_generated && attempts < 40) {
        await new Promise((r) => setTimeout(r, 1500)); // wait 1.5s
        summaryData = await summaryAPI.getSessionSummary(sessionId);
        attempts++;
      }

      if (!summaryData.pdf_generated) {
        throw new Error(
          "PDF is taking longer than expected. Please try again in a few seconds.",
        );
      }

      // Download PDF via backend proxy (avoids CORS issues with R2)
      const blob = await summaryAPI.downloadPDFBlob(sessionId);
      const fileName = `VaaniBank_Summary_${activeSession?.token_number ?? "session"}.pdf`;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error("[BilingualSummary] PDF export error:", err);
      toast.error(err?.message ?? "PDF export failed");
    } finally {
      setLoadingPDF(false);
    }
  }, [activeSession?.token_number, sessionId]);

  // Open WhatsApp modal (generate summary first if needed)
  const handleWhatsApp = useCallback(async () => {
    if (!sessionId) {
      toast.error("No active session");
      return;
    }

    if (!summary) {
      setLoadingWA(true);
      try {
        await ensureSummary();
      } finally {
        setLoadingWA(false);
      }
    }
    setShowWAModal(true);
  }, [ensureSummary, sessionId, summary]);

  const handleWASent = useCallback(() => {
    toast.success("WhatsApp summary sent successfully! ✅");
  }, []);

  const handlePlayResponse = useCallback(async () => {
    if (playing) return;
    if (!activeSession || !sessionId) {
      toast.error("No active session");
      return;
    }

    if (!Array.isArray(exchanges) || exchanges.length === 0) {
      toast.error("No exchanges yet");
      return;
    }

    const lastStaffExchange = [...exchanges]
      .reverse()
      .find(
        (e) =>
          e?.direction === "staff_to_customer" ||
          e?.staff_response_final ||
          e?.staff_response_translated,
      );

    const responseText =
      lastStaffExchange?.customer_text_original ??
      lastStaffExchange?.customer_text ??
      lastStaffExchange?.customer_text_translated ??
      lastStaffExchange?.staff_response_translated ??
      lastStaffExchange?.staff_response_final ??
      "";

    if (!responseText.trim()) {
      toast.error("No staff response found to play");
      return;
    }

    try {
      setPlaying(true);
      const tts = await aiAPI.generateTTS(
        responseText,
        activeSession?.customer_language_code ?? "hi",
        sessionId,
      );
      const audioUrl = tts?.audio_url;
      if (!audioUrl) throw new Error("No audio_url returned");

      const fullUrl = audioUrl.startsWith("http")
        ? audioUrl
        : `${API_BASE_URL}${audioUrl}`;
      await playAudio(fullUrl);
    } catch (err) {
      toast.error(err?.message ?? "Failed to play response");
    } finally {
      setPlaying(false);
    }
  }, [API_BASE_URL, activeSession, exchanges, playing, playAudio, sessionId]);

  const handleSaveExchange = useCallback(() => {
    if (!activeSession) {
      toast.error("No active session");
      return;
    }

    if (!Array.isArray(exchanges) || exchanges.length === 0) {
      toast.error("No exchanges yet");
      return;
    }

    const lastStaffExchange = [...exchanges]
      .reverse()
      .find(
        (e) =>
          e?.direction === "staff_to_customer" ||
          e?.staff_response_final ||
          e?.staff_response_translated,
      );

    if (!lastStaffExchange) {
      toast.error("No staff response found to save");
      return;
    }

    const key = `vaanibank_saved_exchanges_${
      activeSession?.token_number ?? activeSession?.id ?? "session"
    }`;

    let prev = [];
    try {
      prev = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      prev = [];
    }

    const next = [
      { savedAt: new Date().toISOString(), exchange: lastStaffExchange },
      ...(Array.isArray(prev) ? prev : []),
    ].slice(0, 20);

    localStorage.setItem(key, JSON.stringify(next));
    toast.success("Exchange saved");
  }, [activeSession, exchanges]);

  // Toggle expand — generate summary on first expand if session active
  const handleToggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && sessionId && !summary && !generating) {
      await ensureSummary();
    }
  };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border-color, rgba(0,48,135,0.10))",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        {/* Collapsed header — always visible */}
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between px-5 py-3 transition-all duration-150"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              📋 Bilingual Summary — {exchangeCount} exchanges
            </span>
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted, #94a3b8)"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.div>
        </button>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="summary-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  borderTop:
                    "1px solid var(--border-color, rgba(0,48,135,0.08))",
                }}
              >
                <SummaryContent
                  summary={summary}
                  customerLang={customerLang}
                  onPlayResponse={handlePlayResponse}
                  onSaveExchange={handleSaveExchange}
                  onExportPDF={handleExportPDF}
                  onWhatsApp={handleWhatsApp}
                  loadingPDF={loadingPDF}
                  loadingWA={loadingWA}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WhatsApp modal */}
      <AnimatePresence>
        {showWAModal && summaryId && (
          <WhatsAppModal
            key="wa-modal"
            isOpen={showWAModal}
            summaryId={summaryId}
            summary={summary}
            onClose={() => setShowWAModal(false)}
            onSuccess={handleWASent}
          />
        )}
      </AnimatePresence>
    </>
  );
}
