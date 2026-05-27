/* ============================================
   VaaniBank AI — Document Readiness Checklist
   Union Bank of India | Team Vectora

   Floating card component that shows on customer's
   phone when backend sends document_checklist WS event.
   ============================================ */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, FileCheck2 } from "lucide-react";
import { BRAND } from "../constants";
import { useCustomerApp } from "../context/AppContext";

// ── Localized header labels ─────────────────
const HEADERS = {
  hi: {
    title: "आवश्यक दस्तावेज़",
    required: "आवश्यक",
    optional: "वैकल्पिक",
    ready: "तैयार",
  },
  mr: {
    title: "आवश्यक कागदपत्रे",
    required: "आवश्यक",
    optional: "पर्यायी",
    ready: "तयार",
  },
  ta: {
    title: "தேவையான ஆவணங்கள்",
    required: "அவசியம்",
    optional: "விருப்பம்",
    ready: "தயார்",
  },
  te: {
    title: "అవసరమైన పత్రాలు",
    required: "అవసరం",
    optional: "ఐచ్ఛికం",
    ready: "సిద్ధం",
  },
  bn: {
    title: "প্রয়োজনীয় নথি",
    required: "আবশ্যক",
    optional: "ঐচ্ছিক",
    ready: "প্রস্তুত",
  },
  kn: {
    title: "ಅಗತ್ಯ ದಾಖಲೆಗಳು",
    required: "ಅಗತ್ಯ",
    optional: "ಐಚ್ಛಿಕ",
    ready: "ಸಿದ್ಧ",
  },
  or: {
    title: "ଆବଶ୍ୟକ ଦଲିଲ",
    required: "ଆବଶ୍ୟକ",
    optional: "ଇଚ୍ଛାଧୀନ",
    ready: "ପ୍ରସ୍ତୁତ",
  },
  pa: {
    title: "ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼",
    required: "ਲੋੜੀਂਦਾ",
    optional: "ਵਿਕਲਪਿਕ",
    ready: "ਤਿਆਰ",
  },
  gu: {
    title: "જરૂરી દસ્તાવેજો",
    required: "જરૂરી",
    optional: "વૈકલ્પિક",
    ready: "તૈયાર",
  },
  ml: {
    title: "ആവശ്യമായ രേഖകൾ",
    required: "ആവശ്യമാണ്",
    optional: "ഓപ്ഷണൽ",
    ready: "തയ്യാർ",
  },
  en: {
    title: "Required Documents",
    required: "Required",
    optional: "Optional",
    ready: "Ready",
  },
};

export default function DocumentChecklist({ sendMessage, languageCode }) {
  const storeDocChecklist = useCustomerApp((s) => s.docChecklist);

  const [checklist, setChecklist] = useState([]); // [{id, label, label_en, required, tag, confirmed}]
  const [intent, setIntent] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Track doc IDs that customer manually tapped ✓ — survives re-renders
  const localConfirmedRef = useRef(new Set());

  const lang = (languageCode || "hi").split("-")[0];
  const labels = HEADERS[lang] || HEADERS.en;

  // ── Sync with store (mount/refresh) ───────
  useEffect(() => {
    if (storeDocChecklist?.checklist?.length > 0) {
      const merged = storeDocChecklist.checklist.map((doc) => ({
        ...doc,
        confirmed: doc.confirmed || localConfirmedRef.current.has(doc.id),
      }));
      setChecklist(merged);
      setIntent(storeDocChecklist.intent || "");
      setVisible(true);
    }
  }, [storeDocChecklist]);

  // ── Listen for WS events — MERGE with local confirmations ──
  useEffect(() => {
    const onChecklist = (e) => {
      const data = e.detail;
      if (data?.checklist?.length > 0) {
        // Merge: a doc is confirmed if backend says so OR customer tapped it
        const merged = data.checklist.map((doc) => ({
          ...doc,
          confirmed: doc.confirmed || localConfirmedRef.current.has(doc.id),
        }));
        setChecklist(merged);
        setIntent(data.intent || "");
        setVisible(true);
        // Don't reset collapsed — keep user's preference
      }
    };
    window.addEventListener("vaani_document_checklist", onChecklist);
    return () =>
      window.removeEventListener("vaani_document_checklist", onChecklist);
  }, []);

  // ── Tap to toggle a document ──────────────
  const handleToggle = useCallback(
    (docId, docLabel, currentState) => {
      const newState = !currentState;

      // Track in ref so future WS updates don't reset it
      if (newState) {
        localConfirmedRef.current.add(docId);
      } else {
        localConfirmedRef.current.delete(docId);
      }

      // Update local state immediately
      setChecklist((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, confirmed: newState } : d)),
      );

      // Notify backend via WS
      sendMessage("document_confirmed", {
        doc_id: docId,
        doc_label: docLabel,
        confirmed: newState,
      });
    },
    [sendMessage],
  );

  // ── Derived counts ────────────────────────
  const total = checklist.length;
  const confirmed = checklist.filter((d) => d.confirmed).length;
  const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  if (!visible || total === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        style={styles.wrapper}
      >
        {/* ── Header (always visible) ──────── */}
        <motion.div
          style={styles.header}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCollapsed((p) => !p)}
        >
          <div style={styles.headerLeft}>
            <div style={styles.iconWrap}>
              <FileCheck2 size={18} color={BRAND.blue} strokeWidth={2} />
            </div>
            <div>
              <p style={styles.headerTitle}>{labels.title}</p>
              <p style={styles.headerSub}>
                {confirmed}/{total} {labels.ready} • {pct}%
              </p>
            </div>
          </div>
          <div style={styles.headerRight}>
            {/* Mini progress ring */}
            <svg width={28} height={28} style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx={14}
                cy={14}
                r={11}
                stroke="var(--card-border)"
                strokeWidth={3}
                fill="none"
              />
              <circle
                cx={14}
                cy={14}
                r={11}
                stroke={
                  pct >= 80 ? "#22C55E" : pct >= 40 ? "#F59E0B" : BRAND.red
                }
                strokeWidth={3}
                fill="none"
                strokeDasharray={69.1}
                strokeDashoffset={69.1 - (69.1 * pct) / 100}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            {collapsed ? (
              <ChevronDown size={18} color="var(--text-muted)" />
            ) : (
              <ChevronUp size={18} color="var(--text-muted)" />
            )}
          </div>
        </motion.div>

        {/* ── Document list (collapsible) ──── */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={styles.listWrap}
            >
              {checklist.map((doc, idx) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{
                    ...styles.docRow,
                    ...(doc.confirmed ? styles.docRowConfirmed : {}),
                  }}
                  onClick={() =>
                    handleToggle(doc.id, doc.label_en, doc.confirmed)
                  }
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      ...styles.checkbox,
                      ...(doc.confirmed ? styles.checkboxChecked : {}),
                    }}
                  >
                    {doc.confirmed && <span style={styles.checkmark}>✓</span>}
                  </div>

                  {/* Label */}
                  <div style={styles.docInfo}>
                    <p
                      style={{
                        ...styles.docLabel,
                        ...(doc.confirmed ? styles.docLabelDone : {}),
                      }}
                    >
                      {doc.label}
                    </p>
                    {doc.tag && (
                      <span
                        style={{
                          ...styles.docTag,
                          ...(doc.required
                            ? styles.docTagRequired
                            : styles.docTagOptional),
                        }}
                      >
                        {doc.required ? labels.required : labels.optional}
                        {doc.tag !== "Required" && doc.tag !== "Optional"
                          ? ` • ${doc.tag}`
                          : ""}
                      </span>
                    )}
                  </div>

                  {/* Status icon */}
                  {doc.confirmed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={styles.doneEmoji}
                    >
                      ✅
                    </motion.span>
                  )}
                </motion.div>
              ))}

              {/* Progress bar */}
              <div style={styles.progressWrap}>
                <div style={styles.progressTrack}>
                  <motion.div
                    style={{
                      ...styles.progressFill,
                      backgroundColor:
                        pct >= 80
                          ? "#22C55E"
                          : pct >= 40
                            ? "#F59E0B"
                            : BRAND.red,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span style={styles.progressText}>{pct}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════
const styles = {
  wrapper: {
    margin: "0 12px",
    borderRadius: 16,
    backgroundColor: "var(--card-bg)",
    border: `2px solid ${BRAND.blue}22`,
    boxShadow: "0 4px 20px rgba(0,48,135,0.08)",
    overflow: "hidden",
    flexShrink: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,48,135,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1.3,
  },
  headerSub: {
    margin: "2px 0 0",
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-muted)",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  listWrap: {
    overflow: "hidden",
    borderTop: "1px solid var(--card-border)",
  },
  docRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderBottom: "1px solid var(--card-border)",
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    transition: "background-color 0.15s ease",
  },
  docRowConfirmed: {
    backgroundColor: "rgba(34,197,94,0.04)",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: "2px solid var(--card-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s ease",
  },
  checkboxChecked: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  checkmark: {
    fontSize: 13,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1,
  },
  docInfo: {
    flex: 1,
    minWidth: 0,
  },
  docLabel: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    lineHeight: 1.3,
  },
  docLabelDone: {
    textDecoration: "line-through",
    opacity: 0.6,
  },
  docTag: {
    display: "inline-block",
    marginTop: 2,
    padding: "1px 6px",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  docTagRequired: {
    backgroundColor: "rgba(232,35,26,0.08)",
    color: BRAND.red,
  },
  docTagOptional: {
    backgroundColor: "rgba(245,158,11,0.08)",
    color: "#D97706",
  },
  doneEmoji: {
    fontSize: 16,
    flexShrink: 0,
  },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "var(--card-border)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.5s ease, background-color 0.3s ease",
  },
  progressText: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted)",
    minWidth: 30,
    textAlign: "right",
  },
};
