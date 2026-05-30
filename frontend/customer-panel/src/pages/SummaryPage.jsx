/*
   VaaniBank AI — Summary Page
   Union Bank of India | Team Vectora
   URL: /summary/:session_id
   Final customer screen — bilingual summary +
   PDF download + Rating
   */

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Download,
  Star,
  Sun,
  Moon,
  Loader2,
  FileText,
  Clock,
  MapPin,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

import { BRAND, APP_NAME, BANK_NAME } from "../constants";
import { useCustomerApp } from "../context/AppContext";
import { getSessionSummary, getPDFUrl, downloadPDFBlob } from "../services/api";

// Animation Variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.12 } },
};

const sectionVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
};

const starBounce = {
  scale: [1, 1.4, 1],
  transition: { duration: 0.3, ease: "easeInOut" },
};

// Checkmark draw animation path
const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeInOut", delay: 0.2 },
  },
};

const circleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

// Inline Keyframes
const inlineKeyframes = `
  @keyframes loader-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes confetti-fall {
    0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(30px) rotate(360deg); opacity: 0; }
  }
`;

//  SUMMARY PAGE

export default function SummaryPage() {
  const { session_id } = useParams();
  const navigate = useNavigate();

  // Store
  const tokenNumber = useCustomerApp((s) => s.tokenNumber);
  const customerLanguage = useCustomerApp((s) => s.customerLanguage);
  const customerLanguageCode = useCustomerApp((s) => s.customerLanguageCode);
  const theme = useCustomerApp((s) => s.theme);
  const toggleTheme = useCustomerApp((s) => s.toggleTheme);
  const resetSession = useCustomerApp((s) => s.resetSession);
  const branchCode = useCustomerApp((s) => s.branchCode);

  // Local State
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [isPdfPolling, setIsPdfPolling] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const pollingRef = useRef(null);
  const retryTimerRef = useRef(null);

  // Fetch summary on mount — retry until ready
  useEffect(() => {
    if (!session_id) return;

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 5; // 5 × 2s = 10 seconds
    const RETRY_DELAY = 2000;

    const tryFetch = async () => {
      try {
        const data = await getSessionSummary(session_id);
        if (cancelled) return;
        setSummary(data);
        setPdfReady(data.pdf_generated === true);
        setIsLoading(false);
        if (!data.pdf_generated) setIsPdfPolling(true);


      } catch (err) {
        if (cancelled) return;
        attempts += 1;
        if (attempts < MAX_ATTEMPTS) {
          retryTimerRef.current = setTimeout(tryFetch, RETRY_DELAY);
        } else {
          setLoadError(
            err.response?.data?.detail ||
              "Failed to load summary. It may still be generating.",
          );
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    setLoadError(null);
    tryFetch();

    return () => {
      cancelled = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [session_id, retryCount]);

  // Poll for PDF readiness
  useEffect(() => {
    if (!isPdfPolling || !session_id || pdfReady) return;

    pollingRef.current = setInterval(async () => {
      try {
        const data = await getSessionSummary(session_id);
        setSummary(data);
        if (data.pdf_generated) {
          setPdfReady(true);
          setIsPdfPolling(false);
          toast.success("PDF is ready for download!", {
            icon: "📄",
            duration: 3000,
          });
        }
      } catch {
        // Keep polling silently on error
      }
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isPdfPolling, session_id, pdfReady]);

  // Cleanup polling + retry on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // Download PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!summary?.id || !session_id) return;

    try {
      // Download PDF via backend proxy (avoids CORS issues with R2)
      const blob = await downloadPDFBlob(session_id);
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `VaaniBank_Summary_${tokenNumber || summary.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      toast.success("PDF downloaded successfully!", {
        icon: "📄",
        duration: 2000,
      });
    } catch (err) {
      console.error("[SummaryPage] PDF download error:", err);
      toast.error("Failed to download PDF. Please try again.");
    }
  }, [summary, session_id, tokenNumber]);



  // Submit Rating
  const handleSubmitRating = useCallback(async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID;
    const toastId = toast.loading("Sending feedback...");
    setIsSubmittingFeedback(true);

    if (!FORMSPREE_ID) {
      console.warn("[SummaryPage] VITE_FORMSPREE_ID is not configured. Simulating feedback success.");
      setTimeout(() => {
        toast.success("Thank you for your feedback!", {
          id: toastId,
          icon: "⭐",
          duration: 3000,
        });
        setRatingSubmitted(true);
        setIsSubmittingFeedback(false);
        const currentBranch = branchCode;
        setTimeout(() => {
          resetSession();
          if (currentBranch) {
            navigate(`/?branch=${currentBranch}`, { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 2500);
      }, 800);
      return;
    }

    try {
      const displayLang = summary?.customer_language || customerLanguage || "Customer Language";
      const payload = {
        rating: rating,
        comment: comment,
        tokenNumber: tokenNumber || `Session #${session_id}`,
        sessionId: session_id,
        branchCode: branchCode || "N/A",
        customerLanguage: displayLang,
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Thank you for your feedback!", {
          id: toastId,
          icon: "⭐",
          duration: 3000,
        });
      } else {
        console.error("[SummaryPage] Formspree error:", response.statusText);
        // Fallback: still show thank you and proceed
        toast.success("Thank you for your feedback!", {
          id: toastId,
          icon: "⭐",
          duration: 3000,
        });
      }
      setRatingSubmitted(true);
    } catch (error) {
      console.error("[SummaryPage] Formspree submission failed:", error);
      // Fallback: still show thank you and proceed
      toast.success("Thank you for your feedback!", {
        id: toastId,
        icon: "⭐",
        duration: 3000,
      });
      setRatingSubmitted(true);
    } finally {
      setIsSubmittingFeedback(false);

      const currentBranch = branchCode;
      setTimeout(() => {
        resetSession();
        if (currentBranch) {
          navigate(`/?branch=${currentBranch}`, { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 2500);
    }
  }, [
    rating,
    comment,
    tokenNumber,
    session_id,
    branchCode,
    summary,
    customerLanguage,
    navigate,
    resetSession,
  ]);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  //  LOADING STATE
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <style>{inlineKeyframes}</style>
        <Loader2
          size={40}
          color={BRAND.blue}
          style={{ animation: "loader-spin 0.8s linear infinite" }}
        />
        <p style={styles.loadingText}>Preparing your summary...</p>
        <p style={styles.loadingSubtext}>
          सारांश तैयार हो रहा है, कृपया प्रतीक्षा करें...
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px 0" }}>
          This may take up to 10 seconds
        </p>


      </div>
    );
  }

  //  ERROR STATE
  if (loadError && !summary) {
    return (
      <div style={styles.loadingContainer}>
        <style>{inlineKeyframes}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.errorCard}
        >
          <FileText size={40} color={BRAND.red} strokeWidth={1.5} />
          <h3 style={styles.errorTitle}>Summary Not Ready</h3>
          <p style={styles.errorText}>{loadError}</p>
          
          <div style={styles.buttonRow}>
            <motion.div
              style={styles.retryBtn}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setRetryCount((prev) => prev + 1);
              }}
            >
              <span style={styles.retryBtnText}>Retry</span>
            </motion.div>
            
            <motion.div
              style={styles.exitBtn}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const currentBranch = branchCode;
                resetSession();
                if (currentBranch) {
                  navigate(`/?branch=${currentBranch}`, { replace: true });
                } else {
                  navigate("/", { replace: true });
                }
              }}
            >
              <span style={styles.exitBtnText}>Exit</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Extract summary data
  const summaryHindi = summary?.summary_hindi || [];
  const summaryCustomer = summary?.summary_customer_lang || [];
  const keyPointsHindi = summary?.key_points_hindi || [];
  const keyPointsCustomer = summary?.key_points_customer || [];
  const nextStepsHindi = summary?.next_steps_hindi || [];
  const nextStepsCustomer = summary?.next_steps_customer || [];
  const displayLanguage =
    summary?.customer_language || customerLanguage || "Customer Language";
  const displayToken = tokenNumber || `Session #${session_id}`;

  //  MAIN RENDER
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      style={styles.page}
    >
      <style>{inlineKeyframes}</style>
      <div style={styles.container}>
        {/* ── Theme Toggle (top right) ───────── */}
        <motion.div
          style={styles.themeToggle}
          whileTap={{ scale: 0.85 }}
          onClick={toggleTheme}
          role="button"
          aria-label="Toggle dark mode"
        >
          {theme === "light" ? (
            <Moon size={18} color="var(--text-secondary)" />
          ) : (
            <Sun size={18} color="#F59E0B" />
          )}
        </motion.div>

        {/* ═══════════════════════════════════════
            SUCCESS HEADER — Animated Checkmark
            ═══════════════════════════════════════ */}
        <motion.div variants={sectionVariants} style={styles.successHeader}>
          {/* Animated green checkmark circle */}
          <motion.div style={styles.checkCircleOuter}>
            <motion.svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              style={{ display: "block" }}
            >
              {/* Circle background */}
              <motion.circle
                cx="36"
                cy="36"
                r="33"
                fill="none"
                stroke="#22C55E"
                strokeWidth="3"
                variants={circleVariants}
                initial="hidden"
                animate="visible"
              />
              {/* Filled circle */}
              <motion.circle
                cx="36"
                cy="36"
                r="30"
                fill="rgba(34, 197, 94, 0.1)"
                variants={circleVariants}
                initial="hidden"
                animate="visible"
              />
              {/* Checkmark path */}
              <motion.path
                d="M22 36 L32 46 L50 28"
                fill="none"
                stroke="#22C55E"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={checkVariants}
                initial="hidden"
                animate="visible"
              />
            </motion.svg>
          </motion.div>

          <h1 style={styles.successTitle}>Session Complete</h1>
          <div style={styles.tokenBadge}>
            <span style={styles.tokenText}>#{displayToken}</span>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════
            BILINGUAL SUMMARY CARD
            ═══════════════════════════════════════ */}
        <motion.div variants={sectionVariants} style={styles.summaryCard}>
          {/* Card Header */}
          <div style={styles.summaryCardHeader}>
            <FileText size={18} color={BRAND.blue} />
            <span style={styles.summaryCardTitle}>Bilingual Summary</span>
          </div>

          {/* Summary Text */}
          {(summaryHindi.length > 0 || summaryCustomer.length > 0) && (
            <div style={styles.bilingualSection}>
              <div style={styles.bilingualRow}>
                <div style={styles.bilingualCol}>
                  <span style={styles.langLabel}>हिंदी</span>
                  {summaryHindi.map((line, i) => (
                    <p key={`sh-${i}`} style={styles.summaryLine}>
                      {line}
                    </p>
                  ))}
                </div>
                <div style={styles.bilingualDivider} />
                <div style={styles.bilingualCol}>
                  <span style={styles.langLabel}>{displayLanguage}</span>
                  {summaryCustomer.map((line, i) => (
                    <p key={`sc-${i}`} style={styles.summaryLine}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Key Points */}
          {(keyPointsHindi.length > 0 || keyPointsCustomer.length > 0) && (
            <div style={styles.bilingualSection}>
              <p style={styles.sectionLabel}>📌 Key Points</p>
              <div style={styles.bilingualRow}>
                <div style={styles.bilingualCol}>
                  <span style={styles.langLabelSmall}>हिंदी</span>
                  <ul style={styles.bulletList}>
                    {keyPointsHindi.map((pt, i) => (
                      <li key={`kh-${i}`} style={styles.bulletItem}>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={styles.bilingualDivider} />
                <div style={styles.bilingualCol}>
                  <span style={styles.langLabelSmall}>{displayLanguage}</span>
                  <ul style={styles.bulletList}>
                    {keyPointsCustomer.map((pt, i) => (
                      <li key={`kc-${i}`} style={styles.bulletItem}>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          {(nextStepsHindi.length > 0 || nextStepsCustomer.length > 0) && (
            <div style={styles.bilingualSection}>
              <p style={styles.sectionLabel}>📋 Next Steps</p>
              <div style={styles.bilingualRow}>
                <div style={styles.bilingualCol}>
                  <span style={styles.langLabelSmall}>हिंदी</span>
                  <ol style={styles.numberedList}>
                    {nextStepsHindi.map((step, i) => (
                      <li key={`nh-${i}`} style={styles.numberedItem}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <div style={styles.bilingualDivider} />
                <div style={styles.bilingualCol}>
                  <span style={styles.langLabelSmall}>{displayLanguage}</span>
                  <ol style={styles.numberedList}>
                    {nextStepsCustomer.map((step, i) => (
                      <li key={`nc-${i}`} style={styles.numberedItem}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {summaryHindi.length === 0 &&
            summaryCustomer.length === 0 &&
            keyPointsHindi.length === 0 &&
            nextStepsHindi.length === 0 && (
              <div style={styles.emptySummary}>
                <p style={styles.emptySummaryText}>
                  Summary is being generated... Please wait.
                </p>
                <Loader2
                  size={20}
                  color="var(--text-muted)"
                  style={{ animation: "loader-spin 0.8s linear infinite" }}
                />
              </div>
            )}

          {/* Date + Time footer */}
          <div style={styles.summaryFooter}>
            <div style={styles.summaryFooterItem}>
              <Clock size={13} color="var(--text-muted)" />
              <span style={styles.summaryFooterText}>
                {formatDate(summary?.generated_at)}{" "}
                {formatTime(summary?.generated_at)}
              </span>
            </div>
            <div style={styles.summaryFooterItem}>
              <MapPin size={13} color="var(--text-muted)" />
              <span style={styles.summaryFooterText}>{BANK_NAME}</span>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════
            ACTION BUTTONS
            ═══════════════════════════════════════ */}
        <motion.div variants={sectionVariants} style={styles.actionsSection}>
          {/* Download PDF */}
          <motion.div
            style={{
              ...styles.pdfBtn,
              ...(pdfReady ? {} : styles.pdfBtnDisabled),
            }}
            whileTap={pdfReady ? { scale: 0.97 } : {}}
            onClick={pdfReady ? handleDownloadPDF : undefined}
          >
            {!pdfReady ? (
              <>
                <Loader2
                  size={20}
                  color="#fff"
                  style={{ animation: "loader-spin 0.8s linear infinite" }}
                />
                <span style={styles.pdfBtnText}>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={20} color="#fff" />
                <span style={styles.pdfBtnText}>📥 Download PDF</span>
              </>
            )}
          </motion.div>


        </motion.div>

        {/* ═══════════════════════════════════════
            RATING SECTION
            ═══════════════════════════════════════ */}
        <motion.div variants={sectionVariants} style={styles.ratingSection}>
          {!ratingSubmitted ? (
            <>
              <p style={styles.ratingTitle}>Rate your experience</p>
              <p style={styles.ratingSubtitle}>अपना अनुभव रेट करें</p>

              {/* Stars */}
              <div style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= (hoverRating || rating);
                  return (
                    <motion.div
                      key={starVal}
                      whileTap={!isSubmittingFeedback ? starBounce : {}}
                      onClick={!isSubmittingFeedback ? () => setRating(starVal) : undefined}
                      onMouseEnter={!isSubmittingFeedback ? () => setHoverRating(starVal) : undefined}
                      onMouseLeave={!isSubmittingFeedback ? () => setHoverRating(0) : undefined}
                      style={{
                        ...styles.starWrap,
                        cursor: isSubmittingFeedback ? "not-allowed" : "pointer",
                      }}
                    >
                      <Star
                        size={36}
                        color={isFilled ? "#F59E0B" : "var(--card-border)"}
                        fill={isFilled ? "#F59E0B" : "none"}
                        strokeWidth={1.5}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Comment */}
              <textarea
                placeholder="Any feedback? (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                style={styles.commentInput}
                disabled={isSubmittingFeedback}
              />

              {/* Submit */}
              <motion.div
                style={{
                  ...styles.submitRatingBtn,
                  ...(rating > 0 && !isSubmittingFeedback ? {} : styles.submitRatingBtnDisabled),
                }}
                whileTap={rating > 0 && !isSubmittingFeedback ? { scale: 0.97 } : {}}
                onClick={rating > 0 && !isSubmittingFeedback ? handleSubmitRating : undefined}
              >
                <span style={styles.submitRatingText}>
                  {isSubmittingFeedback ? "Submitting..." : "Submit Rating"}
                </span>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.ratingDone}
            >
              <span style={styles.ratingDoneEmoji}>🎉</span>
              <p style={styles.ratingDoneText}>Thank you for your feedback!</p>
              <div style={styles.ratingDoneStars}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <Star
                    key={v}
                    size={24}
                    color={v <= rating ? "#F59E0B" : "var(--card-border)"}
                    fill={v <= rating ? "#F59E0B" : "none"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════
            FOOTER
            ═══════════════════════════════════════ */}
        <motion.div variants={sectionVariants} style={styles.footer}>
          <div style={styles.footerDivider} />

          {/* Logo */}
          <div style={styles.footerLogoWrap}>
            <img
              src="/website_logo.png"
              alt="VaaniBank AI Logo"
              style={styles.footerLogoImg}
            />
          </div>

          <p style={styles.footerThankYou}>
            Thank you for banking with {BANK_NAME}
          </p>
          <p style={styles.footerThankYouHi}>
            {BANK_NAME} के साथ बैंकिंग करने के लिए धन्यवाद
          </p>

          <div style={styles.footerBadges}>
            <div style={styles.footerBadge}>
              <Shield size={12} color="var(--text-muted)" />
              <span style={styles.footerBadgeText}>RBI Compliant</span>
            </div>
            <div style={styles.footerBadgeSep} />
            <div style={styles.footerBadge}>
              <Shield size={12} color="var(--text-muted)" />
              <span style={styles.footerBadgeText}>ISO 27001</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

//  STYLES (Inline JS — mobile-first)

const styles = {
  // Page
  page: {
    width: "100%",
    height: "100dvh",
    backgroundColor: "var(--body-bg)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "16px",
    overflowY: "auto",
    overflowX: "hidden",
    transition: "background-color 0.3s ease",
    boxSizing: "border-box",
  },
  container: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    paddingBottom: 32,
    position: "relative",
  },

  // Theme Toggle
  themeToggle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    cursor: "pointer",
    zIndex: 10,
    boxShadow: "var(--card-shadow)",
  },

  // Loading / Error
  loadingContainer: {
    width: "100%",
    height: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "var(--body-bg)",
    padding: 24,
  },

  loadingText: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: 0,
  },
  loadingSubtext: {
    fontSize: 14,
    fontWeight: 400,
    color: "var(--text-muted)",
    margin: 0,
    fontStyle: "italic",
  },
  errorCard: {
    maxWidth: 360,
    textAlign: "center",
    padding: "32px 24px",
    borderRadius: 20,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  errorText: {
    fontSize: 13,
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.5,
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    marginTop: 8,
    width: "100%",
    justifyContent: "center",
  },
  retryBtn: {
    padding: "10px 24px",
    borderRadius: 10,
    backgroundColor: BRAND.blue,
    cursor: "pointer",
    flex: 1,
    maxWidth: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  exitBtn: {
    padding: "10px 24px",
    borderRadius: 10,
    backgroundColor: "transparent",
    border: "1px solid var(--card-border)",
    cursor: "pointer",
    flex: 1,
    maxWidth: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
  },
  exitBtnText: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-secondary)",
  },

  // Success Header
  successHeader: {
    textAlign: "center",
    paddingTop: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  checkCircleOuter: {
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "var(--text-primary)",
    margin: 0,
    letterSpacing: -0.3,
  },
  tokenBadge: {
    padding: "6px 16px",
    borderRadius: 20,
    backgroundColor: "var(--badge-bg)",
    border: "1px solid var(--card-border)",
  },
  tokenText: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-secondary)",
    fontFamily: "'Inter', monospace",
  },

  // Summary Card
  summaryCard: {
    borderRadius: 16,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    overflow: "hidden",
  },
  summaryCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 16px",
    borderBottom: "1px solid var(--card-border)",
    backgroundColor: "rgba(0, 48, 135, 0.03)",
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--text-primary)",
  },

  // Bilingual Layout
  bilingualSection: {
    padding: "14px 16px",
    borderBottom: "1px solid var(--divider)",
  },
  bilingualRow: {
    display: "flex",
    gap: 0,
  },
  bilingualCol: {
    flex: 1,
    paddingLeft: 2,
    paddingRight: 2,
  },
  bilingualDivider: {
    width: 1,
    backgroundColor: "var(--divider)",
    margin: "0 10px",
    flexShrink: 0,
  },
  langLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: BRAND.blue,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    display: "block",
    marginBottom: 6,
  },
  langLabelSmall: {
    fontSize: 10,
    fontWeight: 600,
    color: "var(--text-muted)",
    display: "block",
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: "0 0 10px 0",
  },
  summaryLine: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-secondary)",
    margin: "0 0 4px 0",
    lineHeight: 1.5,
  },
  bulletList: {
    margin: 0,
    paddingLeft: 16,
    listStyleType: "disc",
  },
  bulletItem: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.5,
    marginBottom: 3,
  },
  numberedList: {
    margin: 0,
    paddingLeft: 16,
    listStyleType: "decimal",
  },
  numberedItem: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.5,
    marginBottom: 3,
  },
  emptySummary: {
    padding: "24px 16px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  emptySummaryText: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-muted)",
    margin: 0,
  },
  summaryFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  summaryFooterItem: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  summaryFooterText: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-muted)",
  },

  // Action Buttons
  actionsSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  pdfBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "14px 20px",
    borderRadius: 14,
    backgroundColor: BRAND.blue,
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    boxShadow: `0 2px 12px rgba(0, 48, 135, 0.2)`,
    transition: "all 0.2s ease",
    minHeight: 52,
  },
  pdfBtnDisabled: {
    opacity: 0.6,
    cursor: "wait",
  },
  pdfBtnText: {
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
  },

  // Rating Section
  ratingSection: {
    padding: "20px",
    borderRadius: 16,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    textAlign: "center",
  },
  ratingTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  ratingSubtitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-muted)",
    margin: "2px 0 16px",
    fontStyle: "italic",
  },
  starsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  starWrap: {
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    padding: 4,
  },
  commentInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--input-border)",
    backgroundColor: "var(--input-bg)",
    fontSize: 14,
    fontWeight: 400,
    color: "var(--text-primary)",
    fontFamily: "'Inter', system-ui, sans-serif",
    resize: "vertical",
    outline: "none",
    marginBottom: 12,
    boxSizing: "border-box",
    minHeight: 70,
  },
  submitRatingBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    borderRadius: 12,
    backgroundImage: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.redDark} 100%)`,
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    boxShadow: `0 2px 12px rgba(232, 35, 26, 0.2)`,
  },
  submitRatingBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  submitRatingText: {
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
  },
  ratingDone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "12px 0",
  },
  ratingDoneEmoji: {
    fontSize: 36,
  },
  ratingDoneText: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: 0,
  },
  ratingDoneStars: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  // Footer
  footer: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  footerDivider: {
    width: 60,
    height: 2,
    borderRadius: 1,
    backgroundColor: "var(--divider)",
    marginBottom: 8,
  },
  footerLogoWrap: {
    display: "flex",
    justifyContent: "center",
  },
  footerLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueDark})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    boxShadow: `0 2px 12px rgba(0, 48, 135, 0.2)`,
  },
  footerLogoImg: {
    height: 56,
    width: "auto",
    objectFit: "contain",
  },
  footerThankYou: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.4,
  },
  footerThankYouHi: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-muted)",
    margin: 0,
    fontStyle: "italic",
  },
  footerBadges: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  footerBadge: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  footerBadgeText: {
    fontSize: 10,
    fontWeight: 500,
    color: "var(--text-muted)",
    letterSpacing: 0.3,
  },
  footerBadgeSep: {
    width: 1,
    height: 12,
    backgroundColor: "var(--divider)",
  },

};

