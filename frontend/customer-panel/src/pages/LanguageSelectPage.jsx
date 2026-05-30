/*
   VaaniBank AI — Language Select Page
   Union Bank of India | Team Vectora
   First screen after QR scan: /?branch=NGP-CVL-01
   */

import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Mic, Loader2, ArrowRight, Volume2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  LANGUAGES,
  BRAND,
  APP_NAME,
  BANK_NAME,
  API_BASE_URL,
} from "../constants";
import { useCustomerApp } from "../context/AppContext";
import { createSession } from "../services/api";
import { useAudio } from "../hooks/useAudio";

// Animation Variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, staggerChildren: 0.06 },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const langCardVariants = {
  initial: { opacity: 0, y: 16, scale: 0.92 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 350, damping: 22 },
  },
};

const selectedBounce = {
  scale: [1, 1.08, 1],
  transition: { duration: 0.35, ease: "easeInOut" },
};

// Inline Keyframes (needed for Loader2 spinner)
const spinnerKeyframes = `
  @keyframes loader-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes voice-ripple {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.5); opacity: 0; }
  }
`;

//  LANGUAGE SELECT PAGE

export default function LanguageSelectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const branchCode = searchParams.get("branch");
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });

  // Store
  const setLanguage = useCustomerApp((s) => s.setLanguage);
  const setSession = useCustomerApp((s) => s.setSession);
  const theme = useCustomerApp((s) => s.theme);
  const toggleTheme = useCustomerApp((s) => s.toggleTheme);

  // Local state
  const [selectedLang, setSelectedLang] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLang, setDetectedLang] = useState(null);
  const [hoveredLang, setHoveredLang] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const syncMobileState = (event) => setIsMobileView(event.matches);
    setIsMobileView(mediaQuery.matches);
    mediaQuery.addEventListener("change", syncMobileState);
    return () => mediaQuery.removeEventListener("change", syncMobileState);
  }, []);

  // Audio hook for voice language detect
  const {
    startRecording,
    stopRecording,
    isRecording,
    audioLevel,
    unlockAudio,
  } = useAudio();

  // Select language by tap
  const handleSelectLanguage = useCallback(
    (lang) => {
      setSelectedLang(lang);
      setDetectedLang(null);
      unlockAudio();
    },
    [unlockAudio],
  );

  // Voice detect: hold-to-record
  const handleVoiceStart = useCallback(async () => {
    setIsDetecting(true);
    setDetectedLang(null);
    try {
      await startRecording();
    } catch {
      setIsDetecting(false);
      toast.error("Microphone access denied");
    }
  }, [startRecording]);

  const handleVoiceStop = useCallback(async () => {
    try {
      const blob = await stopRecording();
      if (!blob) {
        setIsDetecting(false);
        return;
      }

      // Send audio to detect-language API
      const formData = new FormData();
      formData.append("audio", blob, "sample.webm");

      const response = await fetch(`${API_BASE_URL}/stt/detect-language`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const detectedCode =
          data.language_code || data.detected_language || null;

        if (detectedCode) {
          const matchedLang = LANGUAGES.find((l) => l.code === detectedCode);
          if (matchedLang) {
            setSelectedLang(matchedLang);
            setDetectedLang(matchedLang);
            toast.success(
              `Detected: ${matchedLang.native} (${matchedLang.name})`,
              {
                icon: "🎯",
                duration: 3000,
              },
            );
          } else {
            toast.error("Could not match detected language", {
              duration: 3000,
            });
          }
        } else {
          toast.error("Could not detect language. Please select manually.", {
            duration: 3000,
          });
        }
      } else {
        toast.error("Language detection failed. Please select manually.", {
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("[VoiceDetect] Error:", err);
      toast.error("Language detection failed. Please select manually.", {
        duration: 3000,
      });
    } finally {
      setIsDetecting(false);
    }
  }, [stopRecording]);

  // Continue → create session
  const handleContinue = useCallback(async () => {
    if (!selectedLang || !branchCode) return;

    unlockAudio();
    setIsCreating(true);
    try {
      const session = await createSession(
        branchCode,
        selectedLang.name,
        selectedLang.code,
      );
      console.log("RAW SESSION RESPONSE:", JSON.stringify(session));

      const tokenNumber = session.token_number || session.tokenNumber;
      const sessionId = session.session_id || session.id;

      setLanguage(selectedLang.name, selectedLang.code);
      setSession(tokenNumber, sessionId, branchCode, "qr_scan");

      toast.success(`Token: ${tokenNumber}`, { icon: "🎫", duration: 3000 });
      navigate(`/waiting/${tokenNumber}`);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to create session. Please try again.";
      toast.error(message, { duration: 4000 });
    } finally {
      setIsCreating(false);
    }
  }, [
    selectedLang,
    branchCode,
    navigate,
    setLanguage,
    setSession,
    unlockAudio,
  ]);

  //  ERROR STATE — No branch param
  if (!branchCode) {
    return (
      <div style={styles.errorContainer}>
        <style>{spinnerKeyframes}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          style={styles.qrCard}
        >
          {/* ── Header Branding ───────────────── */}
          <div style={styles.qrHeader}>
            <img
              src="/website_logo.png"
              alt="VaaniBank AI Logo"
              style={styles.qrLogoImg}
            />
          </div>

          {/* ── QR Code Image ────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={styles.qrImageWrap}
          >
            <img
              src="/qr-code.png"
              alt="Scan QR Code to start VaaniBank AI session"
              style={styles.qrImage}
            />
          </motion.div>

          {/* ── Instructions ─────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            style={styles.qrInstructions}
          >
            <h2 style={styles.qrTitle}>Scan to Begin</h2>
            <p style={styles.qrText}>
              Scan this QR code at the bank branch counter to start your
              session.
            </p>
            <p style={styles.qrSubtext}>
              अपना सत्र शुरू करने के लिए बैंक शाखा काउंटर पर इस QR कोड को स्कैन
              करें।
            </p>
          </motion.div>

          {/* ── Decorative Pulse Ring ─────────── */}
          <div style={styles.qrPulseRing} />

          {/* ── Footer ───────────────────────── */}
          <div style={styles.qrFooter}>
            <div style={styles.errorDivider} />
            <p style={styles.errorFooter}>
              Union Bank of India | RBI Compliant
            </p>
            <p
              style={{
                ...styles.errorFooter,
                marginTop: 4,
                fontSize: 10,
                opacity: 0.6,
              }}
            >
              वाणी जो हर भाषा जाने
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  //  MAIN RENDER
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        ...styles.page,
        ...(isMobileView ? styles.pageMobile : {}),
      }}
    >
      <style>{spinnerKeyframes}</style>
      <div
        style={{
          ...styles.container,
          ...(isMobileView ? styles.containerMobile : {}),
        }}
      >
        {/* ── Theme Toggle (top right) ───────── */}
        <motion.div
          style={styles.themeToggle}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.08 }}
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

        {/* ── Logo + Branding ────────────────── */}
        <motion.div
          variants={itemVariants}
          style={{
            ...styles.header,
            ...(isMobileView ? styles.headerMobile : {}),
          }}
        >
          <div style={styles.logoContainer}>
            <img
              src="/website_logo.png"
              alt="VaaniBank AI Logo"
              style={{
                ...styles.headerLogoImg,
                ...(isMobileView ? styles.headerLogoImgMobile : {}),
              }}
            />
          </div>
        </motion.div>

        {/* ── Section Title ──────────────────── */}
        <motion.div
          variants={itemVariants}
          style={{
            ...styles.sectionTitle,
            ...(isMobileView ? styles.sectionTitleMobile : {}),
          }}
        >
          <p
            style={{
              ...styles.titleEn,
              ...(isMobileView ? styles.titleEnMobile : {}),
            }}
          >
            Select Your Language
          </p>
          <p
            style={{
              ...styles.titleHi,
              ...(isMobileView ? styles.titleHiMobile : {}),
            }}
          >
            अपनी भाषा चुनें
          </p>
        </motion.div>

        {/* ── Language Grid (2 × 5) ──────────── */}
        <motion.div
          variants={itemVariants}
          style={{
            ...styles.grid,
            ...(isMobileView ? styles.gridMobile : {}),
          }}
        >
          {LANGUAGES.map((lang, index) => {
            const isSelected = selectedLang?.code === lang.code;
            const isDetected = detectedLang?.code === lang.code;
            const isHovered = hoveredLang === lang.code;

            return (
              <motion.div
                key={lang.code}
                variants={langCardVariants}
                whileTap={{ scale: 0.94 }}
                animate={isSelected ? selectedBounce : {}}
                onClick={() => handleSelectLanguage(lang)}
                onMouseEnter={() => setHoveredLang(lang.code)}
                onMouseLeave={() => setHoveredLang(null)}
                style={{
                  ...styles.langCard,
                  ...(isMobileView ? styles.langCardMobile : {}),
                  ...(isSelected ? styles.langCardSelected : {}),
                  ...(isHovered && !isSelected ? styles.langCardHover : {}),
                }}
              >
                {/* Flag */}
                <span style={styles.langFlag}>{lang.flag}</span>

                {/* Native name */}
                <span
                  style={{
                    ...styles.langNative,
                    ...(isMobileView ? styles.langNativeMobile : {}),
                    ...(isSelected ? styles.langTextWhite : {}),
                  }}
                >
                  {lang.native}
                </span>

                {/* English name */}
                <span
                  style={{
                    ...styles.langEnglish,
                    ...(isMobileView ? styles.langEnglishMobile : {}),
                    ...(isSelected ? styles.langEnglishSelected : {}),
                  }}
                >
                  {lang.name}
                </span>

                {/* Detected badge */}
                {isDetected && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={styles.detectedBadge}
                  >
                    🎯 Detected
                  </motion.span>
                )}

                {/* Selected checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={styles.checkmark}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Voice Select Button ────────────── */}
        <motion.div
          variants={itemVariants}
          style={{
            ...styles.voiceSection,
            ...(isMobileView ? styles.voiceSectionMobile : {}),
          }}
        >
          <motion.div
            style={{
              ...styles.voiceBtn,
              ...(isMobileView ? styles.voiceBtnMobile : {}),
              ...(isRecording ? styles.voiceBtnRecording : {}),
            }}
            whileTap={{ scale: 0.95 }}
            onTouchStart={handleVoiceStart}
            onTouchEnd={handleVoiceStop}
            onMouseDown={handleVoiceStart}
            onMouseUp={handleVoiceStop}
            onMouseLeave={() => {
              if (isRecording) handleVoiceStop();
            }}
            role="button"
            aria-label="Hold to detect language by voice"
          >
            {/* Recording ripple effect */}
            {isRecording && (
              <div style={styles.voiceRipple}>
                <div style={styles.rippleCircle} />
                <div
                  style={{ ...styles.rippleCircle, animationDelay: "0.4s" }}
                />
              </div>
            )}

            {isDetecting && !isRecording ? (
              <Loader2
                size={22}
                color="#fff"
                style={{ animation: "loader-spin 0.8s linear infinite" }}
              />
            ) : (
              <Mic
                size={22}
                color="#fff"
                style={isRecording ? { position: "relative", zIndex: 2 } : {}}
              />
            )}
            <span
              style={{
                ...styles.voiceBtnText,
                ...(isMobileView ? styles.voiceBtnTextMobile : {}),
              }}
            >
              {isRecording
                ? "Listening... Release to detect"
                : isDetecting
                  ? "Detecting language..."
                  : "🎙️ Tap & Say Your Language"}
            </span>
          </motion.div>

          {/* Audio level indicator */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 8 }}
                exit={{ opacity: 0, height: 0 }}
                style={styles.audioLevelContainer}
              >
                <motion.div
                  animate={{ width: `${Math.max(5, audioLevel)}%` }}
                  transition={{ duration: 0.1 }}
                  style={styles.audioLevelBar}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Detected language confirmation */}
          <AnimatePresence>
            {detectedLang && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                style={styles.detectedConfirm}
              >
                <Volume2 size={16} color={BRAND.blue} />
                <span style={styles.detectedConfirmText}>
                  Detected: <strong>{detectedLang.native}</strong> (
                  {detectedLang.name})
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Continue Button ─────────────────── */}
        <motion.div variants={itemVariants}>
          <motion.div
            style={{
              ...styles.continueBtn,
              ...(isMobileView ? styles.continueBtnMobile : {}),
              ...(selectedLang && !isCreating
                ? {}
                : styles.continueBtnDisabled),
            }}
            whileTap={selectedLang && !isCreating ? { scale: 0.97 } : {}}
            whileHover={
              selectedLang && !isCreating
                ? {
                    scale: 1.01,
                    boxShadow: `0 6px 24px rgba(232, 35, 26, 0.35)`,
                  }
                : {}
            }
            onClick={selectedLang && !isCreating ? handleContinue : undefined}
            role="button"
            aria-label={
              selectedLang
                ? `Continue in ${selectedLang.name}`
                : "Select a language first"
            }
            aria-disabled={!selectedLang || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2
                  size={20}
                  color="#fff"
                  style={{ animation: "loader-spin 0.8s linear infinite" }}
                />
                <span style={styles.continueBtnText}>Creating Session...</span>
              </>
            ) : (
              <>
                <span
                  style={{
                    ...styles.continueBtnText,
                    ...(isMobileView ? styles.continueBtnTextMobile : {}),
                  }}
                >
                  {selectedLang
                    ? `Continue in ${selectedLang.native}`
                    : "Select a Language to Continue"}
                </span>
                <ArrowRight size={20} color="#fff" />
              </>
            )}
          </motion.div>
        </motion.div>

        {/* ── Footer ─────────────────────────── */}
        <motion.div
          variants={itemVariants}
          style={{
            ...styles.footer,
            ...(isMobileView ? styles.footerMobile : {}),
          }}
        >
          <div style={styles.footerDivider} />
          <p style={styles.footerText}>Union Bank of India | RBI Compliant</p>
          <p style={styles.footerBranch}>Branch: {branchCode}</p>


        </motion.div>
      </div>
    </motion.div>
  );
}

//  STYLES (Inline JS Object — mobile-first)

const styles = {
  // Page & Container
  page: {
    width: "100%",
    height: "100dvh",
    backgroundColor: "var(--body-bg)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "16px 16px env(safe-area-inset-bottom, 16px)",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    transition: "background-color 0.3s ease",
  },
  pageMobile: {
    padding: "10px 10px calc(env(safe-area-inset-bottom, 0px) + 12px)",
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
  containerMobile: {
    gap: 14,
    maxWidth: 430,
    paddingBottom: 20,
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
    transition: "background-color 0.2s ease, border-color 0.2s ease",
  },

  // Header / Logo
  header: {
    textAlign: "center",
    paddingTop: 8,
  },
  headerMobile: {
    paddingTop: 2,
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerLogoImg: {
    height: 100,
    width: "auto",
    objectFit: "contain",
  },
  headerLogoImgMobile: {
    height: 78,
  },
  bankName: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-secondary)",
    margin: "0 0 4px 0",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  appNameRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 800,
    background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueMid} 50%, ${BRAND.red} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: -0.5,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  tagline: {
    fontSize: 12,
    fontWeight: 700,
    color: BRAND.red,
    margin: "8px 0 0 0",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  taglineHindi: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-muted)",
    margin: "2px 0 0 0",
    fontStyle: "italic",
  },

  // Section Title
  sectionTitle: {
    textAlign: "center",
    padding: "4px 0",
  },
  sectionTitleMobile: {
    padding: "2px 0",
  },
  titleEn: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    lineHeight: 1.3,
  },
  titleHi: {
    fontSize: 15,
    fontWeight: 500,
    color: "var(--text-secondary)",
    margin: "2px 0 0 0",
  },
  titleEnMobile: {
    fontSize: 16,
  },
  titleHiMobile: {
    fontSize: 13,
  },

  // Language Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
  },
  gridMobile: {
    gap: 8,
  },
  langCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 72,
    padding: "14px 8px",
    borderRadius: 14,
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--card-border)",
    backgroundColor: "var(--card-bg)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  },
  langCardMobile: {
    minHeight: 64,
    padding: "10px 6px",
    borderRadius: 12,
  },
  langCardHover: {
    borderColor: BRAND.red,
    transform: "translateY(-2px)",
    boxShadow: `0 4px 16px rgba(232, 35, 26, 0.15)`,
  },
  langCardSelected: {
    borderColor: BRAND.red,
    backgroundColor: BRAND.red,
    boxShadow: `0 4px 20px rgba(232, 35, 26, 0.35)`,
  },
  langFlag: {
    fontSize: 22,
    lineHeight: 1,
  },
  langNative: {
    fontSize: 17,
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1.2,
  },
  langNativeMobile: {
    fontSize: 15,
  },
  langTextWhite: {
    color: "#ffffff",
  },
  langEnglish: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-muted)",
    lineHeight: 1.2,
  },
  langEnglishMobile: {
    fontSize: 10,
  },
  langEnglishSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  detectedBadge: {
    position: "absolute",
    top: 4,
    right: 6,
    fontSize: 9,
    fontWeight: 600,
    color: "#fff",
    backgroundColor: BRAND.blue,
    padding: "2px 6px",
    borderRadius: 6,
    lineHeight: 1.3,
    letterSpacing: 0.3,
  },
  checkmark: {
    position: "absolute",
    top: 4,
    left: 6,
    fontSize: 12,
    fontWeight: 800,
    color: "#ffffff",
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Voice Select
  voiceSection: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  voiceSectionMobile: {
    gap: 6,
  },
  voiceBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "16px 20px",
    borderRadius: 14,
    backgroundColor: BRAND.blue,
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    transition: "all 0.2s ease",
    boxShadow: `0 2px 12px rgba(0, 48, 135, 0.25)`,
    position: "relative",
    overflow: "hidden",
    minHeight: 56,
  },
  voiceBtnMobile: {
    minHeight: 50,
    padding: "13px 14px",
    gap: 8,
  },
  voiceBtnRecording: {
    backgroundColor: BRAND.red,
    boxShadow: `0 0 0 4px rgba(232, 35, 26, 0.2), 0 4px 20px rgba(232, 35, 26, 0.35)`,
  },
  voiceRipple: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  rippleCircle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)",
    animation: "voice-ripple 1.5s ease-out infinite",
  },
  voiceBtnText: {
    fontSize: 14,
    fontWeight: 600,
    color: "#ffffff",
    lineHeight: 1.3,
    position: "relative",
    zIndex: 2,
  },
  voiceBtnTextMobile: {
    fontSize: 13,
  },
  audioLevelContainer: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "var(--confidence-bar-bg)",
    overflow: "hidden",
  },
  audioLevelBar: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: BRAND.red,
    transition: "width 0.1s ease",
  },
  detectedConfirm: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    backgroundColor: "var(--info-bg)",
    border: `1px solid ${BRAND.blue}22`,
    overflow: "hidden",
  },
  detectedConfirmText: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-primary)",
    lineHeight: 1.3,
  },

  // Continue Button
  continueBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "16px 24px",
    borderRadius: 14,
    backgroundImage: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.redDark} 100%)`,
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    boxShadow: `0 4px 20px rgba(232, 35, 26, 0.28)`,
    transition: "all 0.2s ease",
    minHeight: 56,
  },
  continueBtnMobile: {
    minHeight: 50,
    padding: "13px 16px",
    gap: 8,
  },
  continueBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
    boxShadow: "none",
    filter: "grayscale(0.3)",
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.3,
  },
  continueBtnTextMobile: {
    fontSize: 14,
  },

  // Footer
  footer: {
    textAlign: "center",
    marginTop: 4,
  },
  footerMobile: {
    marginTop: 0,
    paddingBottom: 6,
  },
  footerDivider: {
    width: 60,
    height: 2,
    borderRadius: 1,
    backgroundColor: "var(--divider)",
    margin: "0 auto 12px",
  },
  footerText: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-muted)",
    margin: 0,
    letterSpacing: 0.5,
  },
  footerBranch: {
    fontSize: 10,
    fontWeight: 500,
    color: "var(--text-muted)",
    margin: "4px 0 0 0",
    opacity: 0.7,
  },

  // Error State
  errorContainer: {
    width: "100%",
    height: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "var(--body-bg)",
  },
  errorCard: {
    maxWidth: 400,
    textAlign: "center",
    padding: "36px 28px",
    borderRadius: 20,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
  },
  errorIconWrap: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    backgroundColor: "var(--error-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  errorText: {
    fontSize: 14,
    fontWeight: 400,
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.6,
  },
  errorSubtext: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-muted)",
    margin: 0,
    lineHeight: 1.5,
    fontStyle: "italic",
  },
  errorDivider: {
    width: 40,
    height: 2,
    borderRadius: 1,
    backgroundColor: "var(--divider)",
    marginTop: 4,
  },
  errorFooter: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-muted)",
    margin: 0,
    letterSpacing: 0.3,
  },

  // QR Code Display Screen
  qrCard: {
    width: "100%",
    maxWidth: 420,
    textAlign: "center",
    padding: "32px 24px 28px",
    borderRadius: 24,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    boxShadow:
      "0 8px 40px rgba(0, 48, 135, 0.12), 0 2px 12px rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    position: "relative",
    overflow: "hidden",
  },
  qrHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  qrLogoImg: {
    height: 56,
    width: "auto",
    objectFit: "contain",
  },
  qrImageWrap: {
    width: 240,
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    border: `3px solid ${BRAND.blue}`,
    boxShadow: `0 4px 24px rgba(0, 48, 135, 0.15)`,
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  qrImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: 12,
  },
  qrInstructions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  qrTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  qrText: {
    fontSize: 14,
    fontWeight: 400,
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.5,
    maxWidth: 300,
  },
  qrSubtext: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-muted)",
    margin: 0,
    lineHeight: 1.5,
    fontStyle: "italic",
    maxWidth: 300,
  },
  qrPulseRing: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${BRAND.blue}08 0%, ${BRAND.blue}03 50%, transparent 70%)`,
    pointerEvents: "none",
  },
  qrFooter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
};
