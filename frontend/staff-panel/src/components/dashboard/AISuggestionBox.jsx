import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useApp } from "../../context/AppContext";
import { sessionAPI, aiAPI } from "../../services/api";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";

// Intent Badge
const INTENT_LABELS = {
  account_opening: {
    label: "Account Opening",
    color: "#1a4db5",
    bg: "rgba(26,77,181,0.10)",
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

// Balance Enquiry Profile Modal
function BalanceEnquiryModal({ isOpen, onClose, profile, loading }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🏦 Customer — Balance Enquiry"
      size="md"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Spinner />
          <p
            className="text-sm"
            style={{ color: "var(--text-muted, #64748b)" }}
          >
            Customer profile load ho rahi hai…
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header banner */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(0,48,135,0.07)",
              border: "1.5px solid rgba(0,48,135,0.15)",
            }}
          >
            <span style={{ fontSize: "2rem" }}>🏦</span>
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--blue, #003087)" }}
              >
                Balance Enquiry Request
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--text-muted, #64748b)" }}
              >
                Customer ne apna balance check karne ki request ki hai
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[
              {
                label: "Token Number",
                value: profile?.token_number,
                icon: "🎫",
              },
              {
                label: "Account Number",
                value: profile?.account_number ?? "❌ Captured nahi hua",
                icon: "📄",
              },
              {
                label: "Customer Language",
                value: profile?.customer_language,
                icon: "🌐",
              },
              { label: "Branch", value: profile?.branch_name, icon: "🏦" },
              { label: "Branch Code", value: profile?.branch_code, icon: "📋" },
              {
                label: "Session Started",
                value: profile?.started_at
                  ? new Date(profile.started_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—",
                icon: "⏰",
              },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm"
                style={{
                  background: "var(--body-bg, #F4F6F9)",
                  border: "1px solid var(--border-color, rgba(0,48,135,0.08))",
                }}
              >
                <span
                  className="flex items-center gap-2 font-medium"
                  style={{ color: "var(--text-muted, #64748b)" }}
                >
                  <span>{icon}</span>
                  {label}
                </span>
                <span
                  className="font-semibold text-right"
                  style={{
                    color:
                      label === "Account Number" && !profile?.account_number
                        ? "#dc2626"
                        : "var(--text-primary)",
                    maxWidth: "55%",
                    wordBreak: "break-all",
                  }}
                >
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <p
              className="text-xs"
              style={{ color: "var(--text-muted, #94a3b8)" }}
            >
              ⚠️ Core banking se balance verify karo
            </p>
            <Button variant="primary" onClick={onClose}>
              ✔️ Balance Check Kar Liya
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// Edit Modal
function EditModal({ isOpen, suggestion, onSave, onClose }) {
  const [text, setText] = useState(suggestion ?? "");
  useEffect(() => {
    if (isOpen) setText(suggestion ?? "");
  }, [isOpen, suggestion]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit AI Response" size="md">
      <div className="flex flex-col gap-4">
        <p className="text-xs" style={{ color: "var(--text-muted, #64748b)" }}>
          Edit the AI-suggested Hindi response before sending to customer.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all duration-150"
          style={{
            background: "var(--body-bg, #F4F6F9)",
            border: "1.5px solid var(--border-color, rgba(0,48,135,0.15))",
            color: "var(--text-primary)",
            fontFamily: "inherit",
          }}
          onFocus={(e) =>
            (e.target.style.border = "1.5px solid var(--blue, #003087)")
          }
          onBlur={(e) =>
            (e.target.style.border =
              "1.5px solid var(--border-color, rgba(0,48,135,0.15))")
          }
          placeholder="Type the staff response in Hindi…"
        />

        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs"
            style={{ color: "var(--text-muted, #94a3b8)" }}
          >
            {text.length} chars
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => text.trim() && onSave(text.trim())}
              disabled={!text.trim()}
            >
              Send Edited Response
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// AISuggestionBox
export default function AISuggestionBox({
  sendStaffApproved: propSendApproved,
  sendStaffEdited: propSendEdited,
  sendMessage,
}) {
  const activeSession = useApp((s) => s.activeSession);
  const aiSuggestion = useApp((s) => s.aiSuggestion);
  const clearSuggestion = useApp((s) => s.clearSuggestion);
  const staffLanguage = useApp((s) => s.staffLanguage);

  const [showEdit, setShowEdit] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(null); // "use" | "edit" | "regen"
  const [isExpanded, setIsExpanded] = useState(true);

  const isProcessing = useApp((s) => s.isProcessing);

  // Balance Enquiry Profile Popup state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const profileFetchedRef = useRef(false); // fetch CBS profile only once per session

  const suggestedHindi =
    aiSuggestion?.suggested_hindi ??
    aiSuggestion?.suggested_response_hindi ??
    "";

  const suggestedCustomerLang =
    aiSuggestion?.suggested_customer_lang ??
    aiSuggestion?.suggested_response_customer_lang ??
    "";

  // English translation for suggestion
  const [englishSuggestion, setEnglishSuggestion] = useState(null);
  const [translatingSuggestion, setTranslatingSuggestion] = useState(false);
  const suggestionFetchedRef = useRef("");

  useEffect(() => {
    if (staffLanguage !== "en" || !suggestedHindi) {
      return;
    }
    if (suggestionFetchedRef.current === suggestedHindi) return;
    
    suggestionFetchedRef.current = suggestedHindi;
    setTranslatingSuggestion(true);
    
    aiAPI
      .translateToEnglish(suggestedHindi)
      .then((eng) => setEnglishSuggestion(eng))
      .catch(() => setEnglishSuggestion(suggestedHindi)) // fallback: show Hindi
      .finally(() => setTranslatingSuggestion(false));
  }, [staffLanguage, suggestedHindi]);

  const intentConfidenceRaw =
    aiSuggestion?.intent_confidence ?? aiSuggestion?.intentConfidence ?? 0;

  const targetLanguageCode =
    activeSession?.customer_language_code ??
    aiSuggestion?.target_language_code ??
    "hi";

  const tokenNumber = activeSession?.token_number ?? null;

  // Auto-expand whenever a new suggestion is received
  useEffect(() => {
    if (suggestedHindi) {
      setIsExpanded(true);
    }
  }, [suggestedHindi]);

  // Clear stale persisted suggestion when a new session starts
  // (aiSuggestion is persisted in Zustand — without this, old session's
  //  suggestion shows at the start of every new session)
  const prevSessionIdRef = useRef(null);
  useEffect(() => {
    const currentId = activeSession?.id ?? null;
    if (
      prevSessionIdRef.current !== null &&
      prevSessionIdRef.current !== currentId
    ) {
      // Session changed — clear stale suggestion
      clearSuggestion();
    }
    prevSessionIdRef.current = currentId;
  }, [activeSession?.id, clearSuggestion]);

  // On balance enquiry detection — show animated toast first, then modal after 1.5s
  useEffect(() => {
    const intent = aiSuggestion?.intent ?? aiSuggestion?.detected_intent ?? "";
    const sessionId = activeSession?.id;

    if (
      intent === "balance_enquiry" &&
      sessionId &&
      !profileFetchedRef.current
    ) {
      profileFetchedRef.current = true;

      // Step 1: Eye-catching branded toast — customer ne balance maanga
      toast(
        () => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>🏦</span>
            <div>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  color: "#003087",
                }}
              >
                Balance Enquiry Detected!
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#475569",
                  marginTop: "2px",
                }}
              >
                Customer ka balance check karna hai — profile load ho rahi hai…
              </div>
            </div>
          </div>
        ),
        {
          duration: 3000,
          icon: null,
          style: {
            border: "2px solid rgba(0,48,135,0.25)",
            borderRadius: "14px",
            background: "#EEF3FF",
            padding: "12px 16px",
            boxShadow: "0 8px 24px rgba(0,48,135,0.18)",
          },
        },
      );

      // Step 2: 1.5s baad profile modal + API call
      setProfileLoading(true);
      setTimeout(() => {
        setShowProfileModal(true);
        sessionAPI
          .getCustomerProfile(sessionId)
          .then((data) => setCustomerProfile(data))
          .catch(() => setCustomerProfile(null))
          .finally(() => setProfileLoading(false));
      }, 1500);
    }

    // Reset everything when a new session starts
    if (!sessionId) {
      profileFetchedRef.current = false;
      setCustomerProfile(null);
      setShowProfileModal(false);
    }
  }, [aiSuggestion?.intent, aiSuggestion?.detected_intent, activeSession?.id]);

  // Send Hindi text to backend — backend handles translation via TTS pipeline.
  // staff_response_final = Hindi (shown in Staff box)
  // staff_response_translated = customer lang (filled by audio_ready event)
  const sendStaffApproved = useCallback(
    async (hindiText, useSuggestionFlag, translatedText = null) => {
      if (!hindiText?.trim()) return;
      if (!tokenNumber) return;

      if (useSuggestionFlag) {
        propSendApproved(
          hindiText,
          true,
          targetLanguageCode,
          null,
          translatedText,
        );
      } else {
        propSendEdited(hindiText, targetLanguageCode);
      }
    },
    [tokenNumber, targetLanguageCode, propSendApproved, propSendEdited],
  );
  const handleUse = useCallback(async () => {
    try {
      setLoadingBtn("use");
      await sendStaffApproved(suggestedHindi, true, suggestedCustomerLang);
    } catch (err) {
      toast.error(err?.message ?? "Failed to send suggestion");
    } finally {
      setLoadingBtn(null);
    }
  }, [sendStaffApproved, suggestedHindi, suggestedCustomerLang]);

  const handleSaveEdit = useCallback(
    async (editedHindi) => {
      try {
        setLoadingBtn("edit");
        await sendStaffApproved(editedHindi, false);
      } catch (err) {
        toast.error(err?.message ?? "Failed to send edited response");
      } finally {
        setLoadingBtn(null);
        setShowEdit(false);
      }
    },
    [sendStaffApproved],
  );

  const handleRegenerate = useCallback(() => {
    if (!activeSession?.id) return;
    try {
      setLoadingBtn("regen");
      const sent = sendMessage("regenerate_suggestion", {
        session_id: activeSession.id,
      });
      if (sent) {
        // Clear current while waiting for new one via WS
        clearSuggestion();
        toast("Regenerating suggestion...", { icon: "🔁", duration: 2000 });
      }
    } catch (err) {
      toast.error("Failed to request new suggestion");
    } finally {
      setLoadingBtn(null);
    }
  }, [activeSession?.id, sendMessage, clearSuggestion]);

  if (!activeSession) return null;

  // If customer spoke but AI suggestion not yet arrived — show processing state
  if (!aiSuggestion) {
    if (!isProcessing) return null; // idle: no session activity yet
    return (
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          background: "var(--card-bg)",
          border: "1.5px solid rgba(0,48,135,0.14)",
          boxShadow: "0 4px 20px rgba(0,48,135,0.08)",
        }}
      >
        <span className="text-base">💡</span>
        <span
          className="text-xs font-bold"
          style={{ color: "var(--blue, #003087)" }}
        >
          AI Suggestion:
        </span>
        <div className="flex items-center gap-2 ml-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "var(--blue, #003087)",
                animation: `vaani-bounce 1s ease-in-out ${i * 0.18}s infinite`,
                opacity: 0.5,
              }}
            />
          ))}
          <span
            className="text-xs"
            style={{ color: "var(--text-muted, #94a3b8)", marginLeft: 4 }}
          >
            Generating...
          </span>
        </div>
        <style>{`@keyframes vaani-bounce { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-4px);opacity:1} }`}</style>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="ai-suggestion-box"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--card-bg)",
            border: "1.5px solid rgba(0,48,135,0.14)",
            boxShadow: "0 4px 20px rgba(0,48,135,0.08)",
          }}
        >
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-black/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <span
                className="text-xs font-bold"
                style={{ color: "var(--blue, #003087)" }}
              >
                AI Suggestion:
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const raw = intentConfidenceRaw ?? 0;
                const pct = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
                if (pct > 0 && pct < 50) {
                  return (
                    <span
                      title={`Low confidence score: ${pct}%`}
                      className="text-xs font-semibold px-2.5 py-1 rounded-md animate-pulse"
                      style={{
                        backgroundColor: "rgba(220, 38, 38, 0.1)",
                        color: "#dc2626",
                      }}
                    >
                      ⚠️ Low Confidence ({pct}%)
                    </span>
                  );
                }
                return null;
              })()}
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--blue, #003087)" }}
                animate={{ rotate: isExpanded ? 0 : 180 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="collapsible-suggestion-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {/* Hindi/English suggestion based on staffLanguage */}
                  <div
                    className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: "rgba(0,48,135,0.05)",
                      border: "1px solid rgba(0,48,135,0.10)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold mb-1.5"
                      style={{ color: "var(--blue, #003087)" }}
                    >
                      {staffLanguage === "en" ? "Suggestion (English)" : "Suggestion (Hindi)"}
                    </p>
                    <p style={{ color: "var(--text-primary)" }}>
                      {staffLanguage === "en" ? (
                        translatingSuggestion ? (
                          <span style={{ color: "var(--text-muted, #94a3b8)", fontStyle: "italic" }}>
                            Translating…
                          </span>
                        ) : (
                          englishSuggestion || suggestedHindi || "—"
                        )
                      ) : (
                        suggestedHindi || "—"
                      )}
                    </p>
                  </div>

                  {/* Customer language suggestion */}
                  <div
                    className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: "rgba(232,35,26,0.04)",
                      border: "1px solid rgba(232,35,26,0.10)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold mb-1.5"
                      style={{ color: "var(--red, #E8231A)" }}
                    >
                      {activeSession.customer_language || "Customer Language"}{" "}
                      (Translated)
                    </p>
                    <p style={{ color: "var(--text-primary)" }}>
                      {suggestedCustomerLang || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    {/* Use Suggested Response */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUse}
                      disabled={!!loadingBtn}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                      style={{
                        background:
                          loadingBtn === "use"
                            ? "rgba(22,163,74,0.18)"
                            : "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        cursor: loadingBtn ? "not-allowed" : "pointer",
                        boxShadow: "0 2px 8px rgba(22,163,74,0.25)",
                      }}
                    >
                      {loadingBtn === "use" ? (
                        <Spinner size="xs" />
                      ) : (
                        <span>✅</span>
                      )}
                      Use Suggested Response
                    </motion.button>

                    {/* Edit Suggestion Link */}
                    <button
                      onClick={() => setShowEdit(true)}
                      disabled={!!loadingBtn}
                      className="mx-auto text-xs font-semibold hover:underline bg-transparent border-none py-1 flex items-center gap-1 cursor-pointer"
                      style={{
                        color: "var(--blue, #003087)",
                        border: "none",
                        background: "transparent",
                      }}
                    >
                      <span>✏️</span> Edit Suggestion
                    </button>

                    {/* Get Different Suggestion — clears current so next WS event shows fresh */}
                    <button
                      onClick={handleRegenerate}
                      disabled={!!loadingBtn}
                      className="mx-auto text-xs font-semibold hover:underline bg-transparent border-none py-1 flex items-center gap-1 cursor-pointer"
                      style={{
                        color: "var(--text-muted, #94a3b8)",
                        border: "none",
                        background: "transparent",
                      }}
                    >
                      {loadingBtn === "regen" ? (
                        <Spinner size="xs" />
                      ) : (
                        <span>🔁</span>
                      )}
                      Get Different Suggestion
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Balance Enquiry Customer Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <BalanceEnquiryModal
            key="balance-profile-modal"
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            profile={customerProfile}
            loading={profileLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEdit && (
          <EditModal
            key="edit-modal"
            isOpen={showEdit}
            suggestion={suggestedHindi}
            onSave={handleSaveEdit}
            onClose={() => setShowEdit(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
