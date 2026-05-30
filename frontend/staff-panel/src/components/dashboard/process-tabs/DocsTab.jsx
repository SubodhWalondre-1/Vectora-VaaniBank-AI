import { useState, useEffect } from "react";
import { useApp } from "../../../context/AppContext";

export default function DocsTab({ docs = [], intentKey, docReadiness, isExploring, sendStaffApproved }) {
  const staffLanguage = useApp((s) => s.staffLanguage);
  // collected state — per doc checkbox
  const [collected, setCollected] = useState(() => docs.map(() => false));
  // PII highlighted doc labels (from WS pii_detected event)
  const [piiHighlighted, setPiiHighlighted] = useState([]);

  // Reset when intent changes (new service)
  useEffect(() => {
    setCollected(docs.map(() => false));
    setPiiHighlighted([]);
  }, [intentKey, docs]);

  // PII auto-highlight — listen to ws_event broadcast
  useEffect(() => {
    const handleWsEvent = (e) => {
      const { type, data } = e.detail || {};
      if (type !== "pii_detected") return;
      const piiType = (data?.pii_type || "").toLowerCase();

      // Map PII type → which doc label to highlight
      const PII_DOC_MAP = {
        aadhaar:        ["Aadhaar Card", "Updated Aadhaar Card", "Identity Verification"],
        pan:            ["PAN Card"],
        account_number: ["Identity Verification", "Passbook"],
        phone:          ["Identity Verification"],
        dob:            ["Photo ID Proof", "Identity Verification"],
      };
      const labels = PII_DOC_MAP[piiType] || [];
      if (labels.length) {
        setPiiHighlighted((prev) => [...new Set([...prev, ...labels])]);
        // Auto-clear highlight after 8 seconds
        setTimeout(() => {
          setPiiHighlighted((prev) => prev.filter((l) => !labels.includes(l)));
        }, 8000);
      }
    };
    window.addEventListener("ws_event", handleWsEvent);
    return () => window.removeEventListener("ws_event", handleWsEvent);
  }, []);

  const handleAsk = (labelEn) => {
    if (sendStaffApproved) {
      sendStaffApproved(`क्या आपके पास ${labelEn} है?`, false);
    }
  };

  const toggle = (i) =>
    setCollected((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const collectedCount = collected.filter(Boolean).length;

  if (isExploring) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-slate-400">
        <span className="text-xl mb-1">📎</span>
        <span>Documents: Will appear when application starts</span>
      </div>
    );
  }

  if (docReadiness && docReadiness.docs && docReadiness.docs.length > 0) {
    return (
      <div className="flex flex-col">
        {/* Progress bar and summary */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Document Readiness ({docReadiness.confirmed}/{docReadiness.total})
          </span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {docReadiness.score}%
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${docReadiness.score}%`,
              backgroundColor: docReadiness.score >= 80 ? '#22c55e' : docReadiness.score >= 40 ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>

        {/* Live dynamic checklist */}
        <div className="space-y-2">
          {docReadiness.docs.map((doc) => {
            const isConfirmed = doc.confirmed;
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2.5 rounded-xl transition-all duration-200"
                style={{
                  border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.06))",
                  backgroundColor: isConfirmed
                    ? "rgba(34, 197, 94, 0.05)"
                    : "rgba(245, 158, 11, 0.05)",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm shrink-0">
                    {isConfirmed ? '✅' : '❌'}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {doc.label_en}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {isConfirmed ? 'Confirmed' : 'Pending'}
                      </span>
                      {doc.required && (
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-1 rounded font-sans">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isConfirmed && sendStaffApproved && (
                  <button
                    onClick={() => handleAsk(doc.label_en)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={staffLanguage === "en" ? `Ask: "Do you have ${doc.label_en}?"` : `Ask: "क्या आपके पास ${doc.label_en} है?"`}
                  >
                    🎤
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {docReadiness.score < 50 && docReadiness.missing?.length > 0 && (
          <div className="mt-4 p-2.5 rounded-xl text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-200/50 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>{docReadiness.missing.length} required document(s) still unconfirmed</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Progress counter */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 10,
          padding: "6px 10px",
          background: collectedCount === docs.length ? "#EAF3DE" : "var(--color-background-secondary, #f8fafc)",
          borderRadius: 8,
          transition: "background 0.3s",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600,
          color: collectedCount === docs.length ? "#3B6D11" : "var(--color-text-secondary, #64748b)" }}>
          {collectedCount === docs.length && collectedCount > 0 
            ? (staffLanguage === "en" ? "✅ All documents collected!" : "✅ Sab documents collected!") 
            : `Documents collected`}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700,
          color: collectedCount === docs.length ? "#3B6D11" : "#0C447C" }}>
          {collectedCount} / {docs.length}
        </span>
      </div>

      {docs.map((doc, i) => {
        const isCollected   = collected[i];
        const isPiiDetected = piiHighlighted.includes(doc.label);

        return (
          <div
            key={i}
            className="flex items-start gap-2.5 py-2.5"
            style={{
              borderBottom: i < docs.length - 1
                ? "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.08))"
                : "none",
              background: isPiiDetected
                ? "rgba(8,145,178,0.06)"
                : isCollected
                ? "rgba(22,163,74,0.04)"
                : "transparent",
              borderRadius: 8,
              padding: "8px 6px",
              transition: "background 0.3s",
            }}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggle(i)}
              style={{
                width: 20, height: 20, marginTop: 2, flexShrink: 0,
                borderRadius: 6,
                border: isCollected ? "none" : "1.5px solid var(--color-border-secondary, rgba(0,0,0,0.2))",
                background: isCollected ? "#16a34a" : "transparent",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
              }}
            >
              {isCollected && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Icon */}
            <div
              className="flex items-center justify-center rounded-lg shrink-0"
              style={{
                width: 28, height: 28, fontSize: 14,
                background: isPiiDetected ? "rgba(8,145,178,0.12)" : "var(--color-background-secondary, #f8fafc)",
                transition: "background 0.3s",
              }}
            >
              {doc.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium"
                style={{
                  color: isCollected ? "var(--color-text-secondary, #64748b)" : "var(--color-text-primary, #0f172a)",
                  textDecoration: isCollected ? "line-through" : "none",
                }}
              >
                {doc.label}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary, #64748b)" }}>
                {doc.sub}
              </div>
              <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                <span
                  className="inline-block text-xs font-medium px-1.5 py-0.5 rounded"
                  style={
                    doc.required
                      ? { background: "#E6F1FB", color: "#0C447C" }
                      : { background: "#F1EFE8", color: "#5F5E5A" }
                  }
                >
                  {doc.tagLabel}
                </span>
                {isPiiDetected && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "1px 6px",
                    background: "rgba(8,145,178,0.15)", color: "#0891b2",
                    borderRadius: 6, animation: "pulse 1s ease-in-out 3",
                  }}>
                    🔍 PII Detected
                  </span>
                )}
                {isCollected && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "1px 6px",
                    background: "#EAF3DE", color: "#3B6D11", borderRadius: 6,
                  }}>
                    ✓ Received
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
