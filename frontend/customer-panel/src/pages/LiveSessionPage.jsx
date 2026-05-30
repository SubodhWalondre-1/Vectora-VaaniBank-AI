/*
   VaaniBank AI — Live Session Page
   Union Bank of India | Team Vectora
   URL: /session/:token
   Two sections: Service Select → Live Conversation
   */

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Volume2,
  Clock,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
} from "lucide-react";
import toast from "react-hot-toast";

import { SERVICES, BRAND, APP_NAME, API_BASE_URL } from "../constants";
import { useCustomerApp } from "../context/AppContext";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAudio } from "../hooks/useAudio";
import { transcribeAudio, getCollectedInfo, getPublicSettings } from "../services/api";
import { DEMO_SCRIPT, DEMO_AI_RESPONSES } from "../demoData";
import DocumentChecklist from "../components/DocumentChecklist";
import ServiceSelectionGrid from "../components/ServiceSelectionGrid";
import ConversationBubble from "../components/ConversationBubble";
import MicControl from "../components/MicControl";

// Animation Variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.06 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};
const messageVariants = {
  initial: { opacity: 0, x: -20, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
  exit: { opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } },
};

const inlineKeyframes = `
  @keyframes loader-spin { to { transform: rotate(360deg); } }
  @keyframes live-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes mic-pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(232, 35, 26, 0.5); }
    70% { box-shadow: 0 0 0 24px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }
  @keyframes wave-bar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
`;

const SERVICE_EMOJIS = {
  account_opening: "🏦",
  loan_enquiry: "💰",
  kyc_update: "📋",
  card_services: "💳",
  balance_enquiry: "📊",
  fixed_deposit: "🎙️",
};

//  LIVE SESSION PAGE
export default function LiveSessionPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Store
  const tokenNumber = useCustomerApp((s) => s.tokenNumber);
  const sessionId = useCustomerApp((s) => s.sessionId);
  const customerLanguage = useCustomerApp((s) => s.customerLanguage);
  const customerLanguageCode = useCustomerApp((s) => s.customerLanguageCode);
  const staffMessageSeq = useCustomerApp((s) => s.staffMessageSeq);
  const chatHistory = useCustomerApp((s) => s.chatHistory);
  const isAudioUnlocked = useCustomerApp((s) => s.isAudioUnlocked);
  const unlockAudioStore = useCustomerApp((s) => s.unlockAudio);
  const addCustomerMessage = useCustomerApp((s) => s.addCustomerMessage);
  const endSessionStore = useCustomerApp((s) => s.endSession);
  const setDocChecklist = useCustomerApp((s) => s.setDocChecklist);
  const theme = useCustomerApp((s) => s.theme);
  const toggleTheme = useCustomerApp((s) => s.toggleTheme);
  const entryMethod = useCustomerApp((s) => s.entryMethod);
  const staffTyping = useCustomerApp((s) => s.staffTyping);
  const selectedService = useCustomerApp((s) => s.selectedService);
  const setSelectedServiceStore = useCustomerApp((s) => s.setSelectedService);

  // QR scan customer = microphone mode (Tap to Listen)
  // Walk-in customer  = speaker mode (Staff speaks, customer listens)
  const isQrCustomer = entryMethod === "qr_scan";

  // Hooks
  const {
    connect,
    disconnect,
    sendMessage,
    sendBinary,
    setNavigate,
    connectionStatus,
    isConnected,
  } = useWebSocket();
  const {
    startRecording,
    stopRecording,
    playAudio,
    unlockAudio,
    isRecording,
    audioLevel,
    error: audioError,
  } = useAudio();

  // Local State
  const [showConversation, setShowConversation] = useState(
    chatHistory.length > 0 || !!selectedService,
  );
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [messages, setMessages] = useState(chatHistory);
  const [demoIndex, setDemoIndex] = useState(0);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoModeFromServer, setDemoModeFromServer] = useState(false);

  // Fetch public system settings on mount
  useEffect(() => {
    getPublicSettings()
      .then((data) => {
        setDemoModeFromServer(!!data?.demo_mode);
      })
      .catch((err) => {
        console.error("Failed to load public settings:", err);
      });
  }, []);

  // Sync messages from store chatHistory
  useEffect(() => {
    setMessages(chatHistory);
  }, [chatHistory]);

  const lastProcessedSeqRef = useRef(staffMessageSeq);

  // Smart Input Popup state
  const [inputRequest, setInputRequest] = useState(null); // { field_type, field_label, field_label_customer, request_id }
  const [inputValue, setInputValue] = useState("");
  const [inputSubmitting, setInputSubmitting] = useState(false);
  const [inputDone, setInputDone] = useState(false);

  // All info collected banner state
  const [showAllCollectedBanner, setShowAllCollectedBanner] = useState(false);
  const [allCollectedText, setAllCollectedText] = useState("");

  const conversationRef = useRef(null);
  const timerRef = useRef(null);
  const demoIntervalRef = useRef(null);
  const pendingStaffMsgIdRef = useRef(null);

  const displayToken = tokenNumber || token || "N/A";
  const sessionToken = token || tokenNumber;

  // Connect WebSocket
  useEffect(() => {
    if (token) {
      setNavigate(navigate);
      connect(token, "customer");
    }
    return () => {
      disconnect();
    };
  }, [token]);

  // Session timer
  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => setSessionTimer((p) => p + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConnected]);

  // Restore checklist on mount/refresh
  useEffect(() => {
    if (sessionId) {
      getCollectedInfo(sessionId)
        .then((data) => {
          if (data?.doc_readiness) {
            setDocChecklist(data.doc_readiness);
            window.dispatchEvent(
              new CustomEvent("vaani_document_checklist", {
                detail: data.doc_readiness,
              }),
            );
          }
        })
        .catch(() => {});
    }
  }, [sessionId, setDocChecklist]);

  // Unlock Web Audio context on first user interaction
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      unlockAudioStore();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [unlockAudio, unlockAudioStore]);

  // Staff message → show in chat + play audio
  useEffect(() => {
    // Only process if it's a NEW message sequence
    if (
      staffMessageSeq === 0 ||
      staffMessageSeq <= lastProcessedSeqRef.current
    ) {
      return;
    }

    lastProcessedSeqRef.current = staffMessageSeq;
    const { staffMessage, audioUrl } = useCustomerApp.getState();
    if (!staffMessage) return;

    // Auto-show conversation view if still on service select screen
    setShowConversation(true);

    const fullAudioUrl = audioUrl
      ? audioUrl.startsWith("http")
        ? audioUrl
        : `${API_BASE_URL}${audioUrl}`
      : null;

    if (fullAudioUrl && isAudioUnlocked) {
      setIsPlayingAudio(true);
      playAudio(fullAudioUrl)
        .catch(() => {})
        .finally(() => setIsPlayingAudio(false));
    }
  }, [staffMessageSeq, isAudioUnlocked]);

  // Listen for transcription ready (from useWebSocket)
  useEffect(() => {
    const handleTranscription = (e) => {
      const { text_original, text_translated } = e.detail;
      const textToShow = text_original || text_translated;
      if (textToShow) {
        // Use the original language text (e.g., Marathi) if available, fallback to translation
        addCustomerMessage(textToShow);
      }
      setIsTranscribing(false);
    };
    const handleError = () => {
      setIsTranscribing(false);
    };
    window.addEventListener("vaani_transcription_ready", handleTranscription);
    window.addEventListener("vaani_error", handleError);
    return () => {
      window.removeEventListener(
        "vaani_transcription_ready",
        handleTranscription,
      );
      window.removeEventListener("vaani_error", handleError);
    };
  }, [addCustomerMessage]);

  // Transcription timeout safety (revert to mic after 5s if stuck)
  useEffect(() => {
    let timeoutId;
    if (isTranscribing) {
      timeoutId = setTimeout(() => {
        console.warn(
          "[Mic] Transcription timed out after 5s. Reverting to mic.",
        );
        setIsTranscribing(false);
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isTranscribing]);

  // Auto-scroll
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  // Service Select
  const handleServiceSelect = useCallback(
    (service) => {
      unlockAudio();
      setSelectedServiceStore(service);
      sendMessage("customer_service_selected", {
        service_id: service.id,
        service_name: service.labels?.en || service.id,
      });
      setTimeout(() => setShowConversation(true), 400);
    },
    [sendMessage, unlockAudio, setSelectedServiceStore],
  );

  //  TAP-TO-LISTEN  (tap once = start, tap again = stop+send)
  //  Also works as hold-to-speak on desktop (mousedown/mouseup)

  // Internal: start mic
  const _startMic = useCallback(async () => {
    if (isRecording || isTranscribing) return;
    try {
      sendMessage("start_speaking", {
        lang_code: customerLanguageCode || "hi",
        session_id: sessionId,
      });
      await startRecording((chunk) => {
        sendBinary(chunk.buffer);
      });
    } catch (err) {
      console.error("[Mic] startRecording failed:", err);
      toast.error("Microphone access denied. Allow mic in browser settings.", {
        duration: 4000,
      });
    }
  }, [
    startRecording,
    isRecording,
    isTranscribing,
    sendMessage,
    sendBinary,
    customerLanguageCode,
    sessionId,
  ]);

  // Internal: stop mic + transcribe
  const _stopMic = useCallback(async () => {
    if (!isRecording || isTranscribing) return;

    try {
      await stopRecording();
      sendMessage("stop_speaking", {});
    } catch (err) {
      console.error("[Mic] stopRecording failed:", err);
      toast.error("Recording failed. Please try again.");
      return;
    }

    setIsTranscribing(true);
  }, [isRecording, isTranscribing, stopRecording, sendMessage]);

  // End Session
  // NOTE: Do NOT navigate here manually. The WS "session_ended" event
  // from the backend carries collected_data + intent and navigates to
  // /summary automatically via useWebSocket.js handler.
  // We added a safety fallback timer to ensure that even if the network fails,
  // the session navigates after 2.5 seconds.
  const handleEndSession = useCallback(() => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);

    const sent = sendMessage("end_session", { generate_summary: true });
    setShowEndModal(false);

    if (!sent) {
      // Offline/Demo mode fallback
      endSessionStore();
      navigate(sessionId ? `/summary/${sessionId}` : "/summary");
    } else {
      // Online mode: Set a safety fallback timer.
      // If we don't receive "session_ended" WS event within 2.5s, force navigation.
      const fallbackTimer = setTimeout(() => {
        console.warn(
          "[Session] End session WS confirmation timed out. Forcing fallback navigation.",
        );
        endSessionStore();
        navigate(sessionId ? `/summary/${sessionId}` : "/summary");
      }, 2500);

      window.vaani_end_fallback_timer = fallbackTimer;
    }
  }, [sendMessage, endSessionStore, navigate, sessionId]);

  // Demo Mode
  const startDemo = useCallback(() => {
    if (isDemoRunning) {
      clearInterval(demoIntervalRef.current);
      setIsDemoRunning(false);
      return;
    }
    setIsDemoRunning(true);
    let idx = 0;
    setDemoIndex(0);

    const fireDemo = () => {
      if (idx >= DEMO_SCRIPT.length) {
        clearInterval(demoIntervalRef.current);
        setIsDemoRunning(false);
        toast.success("Demo complete!", { icon: "🎬", duration: 2000 });
        return;
      }
      const script = DEMO_SCRIPT[idx];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "customer",
          text: script.customerText,
          timestamp: new Date(),
          pending: false,
        },
      ]);
      sendMessage("demo_customer_message", { ...script, sessionToken });
      idx += 1;
      setDemoIndex(idx);
    };
    fireDemo();
    demoIntervalRef.current = setInterval(fireDemo, 4000);
  }, [isDemoRunning, sendMessage, sessionToken]);

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, []);

  // Smart Input Popup — WS event listener
  useEffect(() => {
    const onInputRequest = (e) => {
      setInputRequest(e.detail);
      setInputValue("");
      setInputDone(false);
    };
    const onInputAck = () => {
      setInputDone(true);
      setTimeout(() => {
        setInputRequest(null);
        setInputDone(false);
      }, 2000);
    };
    window.addEventListener("vaani_input_request", onInputRequest);
    window.addEventListener("vaani_input_acknowledged", onInputAck);
    return () => {
      window.removeEventListener("vaani_input_request", onInputRequest);
      window.removeEventListener("vaani_input_acknowledged", onInputAck);
    };
  }, []);

  // Intent Notification Popup — for intents like balance enquiry
  const [intentNotif, setIntentNotif] = useState(null); // { intent, title, message, message_en, icon }

  useEffect(() => {
    const INTENT_ICONS = {
      balance_enquiry: "📊",
      account_opening: "🏦",
      loan_enquiry: "💰",
      kyc_update: "📋",
      card_services: "💳",
      fixed_deposit: "📦",
    };
    const LANG_MSGS = {
      balance_enquiry: {
        hi: "📊 आपका बैलेंस चेक हो रहा है। कृपया ठोडा इंतजार करें।",
        ta: "📊 உஙகள் இருப்பு சரிபார்க்கப்படுகிறது. கொஞ்சம் நிறுத்துஙகள்.",
        mr: "📊 तुमचे शिल्लक तपासले जात आहे। कृपया थांबा.",
        default: "📊 Your balance is being checked. Please wait.",
      },
    };

    const onIntentNotif = (e) => {
      const detail = e.detail;
      const intent = detail?.intent ?? "";
      const langCode = customerLanguageCode?.split("-")[0] ?? "hi";
      const msgs = LANG_MSGS[intent];
      const localMsg = msgs
        ? (msgs[langCode] ?? msgs.default)
        : (detail?.message ?? "");

      setIntentNotif({
        intent,
        title: detail?.title ?? intent,
        message: localMsg,
        icon: INTENT_ICONS[intent] ?? "🏦",
      });

      // Auto-dismiss after 5 seconds
      setTimeout(() => setIntentNotif(null), 5000);
    };

    window.addEventListener("vaani_intent_notification", onIntentNotif);
    return () =>
      window.removeEventListener("vaani_intent_notification", onIntentNotif);
  }, [customerLanguageCode]);

  const getServiceLabel = (service) =>
    service.labels?.[customerLanguageCode] || service.labels?.en || service.id;

  // Smart Input Popup submit
  const handleInputSubmit = useCallback(() => {
    if (!inputRequest || !inputValue.trim() || inputSubmitting) return;
    setInputSubmitting(true);
    sendMessage("input_submitted", {
      field_type: inputRequest.field_type,
      field_label: inputRequest.field_label,
      value: inputValue.trim(),
      request_id: inputRequest.request_id,
    });
    // Acknowledge locally if backend doesn’t respond within 3s
    const fallback = setTimeout(() => {
      setInputDone(true);
      setTimeout(() => {
        setInputRequest(null);
        setInputDone(false);
      }, 2000);
    }, 3000);
    const onAck = () => {
      clearTimeout(fallback);
    };
    window.addEventListener("vaani_input_acknowledged", onAck, { once: true });
    setInputSubmitting(false);
  }, [inputRequest, inputValue, inputSubmitting, sendMessage]);

  const LANG_LABELS = {
    hi: {
      help: "आज हम आपकी कैसे मदद कर सकते हैं?",
      mic: "माइक बटन दबाकर अपनी भाषा में बोलें",
    },
    mr: {
      help: "आज आम्ही तुम्हाला कशी मदत करू शकतो?",
      mic: "माइक बटण दाबून आपल्या भाषेत बोला",
    },
    ta: {
      help: "இன்று நாங்கள் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
      mic: "மைக் பட்டனை அழுத்தி உங்கள் மொழியில் பேசுங்கள்",
    },
    te: {
      help: "ఈరోజు మేము మీకు ఎలా సహాయం చేయగలం?",
      mic: "మైక్ బటన్ నొక్కి మీ భాషలో మాట్లాడండి",
    },
    bn: {
      help: "আজ আমরা আপনাকে কিভাবে সাহায্য করতে পারি?",
      mic: "মাইক বোতাম ধরে আপনার ভাষায় কথা বলুন",
    },
    kn: {
      help: "ಇಂದು ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
      mic: "ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ",
    },
    or: {
      help: "ଆଜି ଆମେ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବା?",
      mic: "ମାଇକ ବଟନ ଧରି ଆପଣଙ୍କ ଭାଷାରେ କଥା ହୁଅନ୍ତୁ",
    },
    pa: {
      help: "ਅੱਜ ਅਸੀਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ?",
      mic: "ਮਾਈਕ ਬਟਨ ਦਬਾ ਕੇ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲੋ",
    },
    gu: {
      help: "આજે અમે તમારી કેવી રીતે મદદ કરી શકીએ?",
      mic: "માઇક બટન દબાવીને તમારી ભાષામાં બોલો",
    },
    ml: {
      help: "ഇന്ന് ഞങ്ങൾ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
      mic: "മൈക്ക് ബട്ടൺ അമർത്തി നിങ്ങളുടെ ഭാഷയിൽ സംസാരിക്കുക",
    },
  };
  const langLabel = LANG_LABELS[customerLanguageCode] || LANG_LABELS["hi"];

  //  RENDER
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={styles.page}
    >
      <style>{inlineKeyframes}</style>
      <div style={styles.container}>
        {/* STATUS BAR */}
        <motion.div variants={itemVariants} style={styles.statusBar}>
          <div style={styles.statusLeft}>
            <div style={styles.liveBadge}>
              <div
                style={{
                  ...styles.liveDot,
                  backgroundColor: isConnected ? "#22C55E" : "#EF4444",
                }}
              />
              <span style={styles.liveText}>
                {isConnected
                  ? "LIVE"
                  : connectionStatus === "connecting"
                    ? "CONNECTING"
                    : "OFFLINE"}
              </span>
            </div>
            <div style={styles.tokenBadge}>
              <span style={styles.tokenText}>#{displayToken}</span>
            </div>
          </div>
          <div style={styles.statusRight}>
            <div style={styles.timerBadge}>
              <Clock size={14} color="var(--text-muted)" />
              <span style={styles.timerText}>{formatTime(sessionTimer)}</span>
            </div>
            <motion.div
              style={styles.themeToggle}
              whileTap={{ scale: 0.85 }}
              onClick={toggleTheme}
              role="button"
            >
              {theme === "light" ? (
                <Moon size={16} color="var(--text-secondary)" />
              ) : (
                <Sun size={16} color="#F59E0B" />
              )}
            </motion.div>
            <motion.div
              style={styles.endBtn}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEndModal(true)}
            >
              <LogOut size={16} color={BRAND.red} />
            </motion.div>
          </div>
        </motion.div>

        {/* CONNECTED BAR */}
        <AnimatePresence>
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.connectedBar}
            >
              <CheckCircle2 size={14} color="#22C55E" />
              <span style={styles.connectedText}>Connected to Staff ✅</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 1 — SERVICE SELECT */}
        <AnimatePresence mode="wait">
          {!showConversation && (
            <ServiceSelectionGrid
              customerLanguage={customerLanguage}
              langLabel={langLabel}
              selectedService={selectedService}
              handleServiceSelect={handleServiceSelect}
              setSelectedService={setSelectedServiceStore}
              setShowConversation={setShowConversation}
              styles={styles}
            />
          )}
        </AnimatePresence>

        {/* SECTION 2 — LIVE CONVERSATION */}
        <AnimatePresence mode="wait">
          {showConversation && (
            <motion.div
              key="conversation-section"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={styles.conversationSection}
            >
              {selectedService && (
                <motion.div
                  variants={itemVariants}
                  style={styles.activeServiceBadge}
                >
                  <span style={styles.activeServiceEmoji}>
                    {SERVICE_EMOJIS[selectedService.id] || "🏦"}
                  </span>
                  <span style={styles.activeServiceText}>
                    {selectedService.labels?.en || "Live Help"}
                  </span>
                </motion.div>
              )}

              {/* Messages */}
              <div ref={conversationRef} style={styles.messagesArea}>
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={styles.welcomeCard}
                  >
                    <div style={styles.welcomeIcon}>🏦</div>
                    <p style={styles.welcomeTitle}>Staff is ready to help!</p>
                    {isQrCustomer ? (
                      <>
                        <p style={styles.welcomeText}>
                          Tap the mic and speak in your language.
                        </p>
                        <p style={styles.welcomeTextLang}>{langLabel.mic}</p>
                      </>
                    ) : (
                      <>
                        <p style={styles.welcomeText}>
                          Staff will speak to you. Please listen.
                        </p>
                        <p style={styles.welcomeTextLang}>{langLabel.help}</p>
                      </>
                    )}
                  </motion.div>
                )}
                {messages.map((msg) => (
                  <ConversationBubble
                    key={msg.id}
                    msg={msg}
                    isPlayingAudio={isPlayingAudio}
                    isLastStaffMsg={
                      msg.id ===
                      messages.filter((m) => m.type === "staff").pop()?.id
                    }
                    styles={styles}
                  />
                ))}

                {/* ── Staff Typing Indicator ── */}
                {staffTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      ...styles.messageBubble,
                      ...styles.staffBubble,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      paddingTop: 10,
                      paddingBottom: 10,
                    }}
                  >
                    <span style={{ ...styles.msgSender, color: BRAND.blue }}>
                      🏦 Staff
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.4, 1, 0.4],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: BRAND.blue,
                          }}
                        />
                      ))}
                      <span
                        style={{
                          fontSize: 12,
                          color: BRAND.blue,
                          marginLeft: 6,
                          fontWeight: 500,
                        }}
                      >
                        Responding...
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ── DOCUMENT READINESS CHECKLIST ── */}
              <DocumentChecklist
                sendMessage={sendMessage}
                languageCode={customerLanguageCode}
              />

              {/* ── TAP TO LISTEN AREA — only for QR customers ── */}
              {isQrCustomer && (
                <MicControl
                  isRecording={isRecording}
                  isTranscribing={isTranscribing}
                  audioError={audioError}
                  audioLevel={audioLevel}
                  onStartMic={_startMic}
                  onStopMic={_stopMic}
                  unlockAudio={unlockAudio}
                  styles={styles}
                />
              )}

              {/* ── WALK-IN: Staff speaks, customer listens indicator ── */}
              {!isQrCustomer && (
                <div style={styles.listenOnlyBar}>
                  <Volume2 size={18} color={BRAND.blue} />
                  <span style={styles.listenOnlyText}>
                    Staff is speaking to you — please listen
                  </span>
                  {isPlayingAudio && (
                    <div style={styles.audioWave}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          style={{
                            ...styles.waveBar,
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* END SESSION MODAL */}
        <AnimatePresence>
          {showEndModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.modalOverlay}
              onClick={() => setShowEndModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                style={styles.modalCard}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.modalIconWrap}>
                  <AlertTriangle
                    size={36}
                    color={BRAND.red}
                    strokeWidth={1.5}
                  />
                </div>
                <h3 style={styles.modalTitle}>End Session?</h3>
                <p style={styles.modalText}>
                  Your conversation summary will be generated after ending.
                </p>
                <div style={styles.modalActions}>
                  <motion.div
                    style={styles.modalCancelBtn}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEndModal(false)}
                  >
                    <span style={styles.modalCancelText}>Cancel</span>
                  </motion.div>
                  <motion.div
                    style={styles.modalEndBtn}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEndSession}
                  >
                    <LogOut size={16} color="#fff" />
                    <span style={styles.modalEndText}>End Session</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SMART INPUT POPUP MODAL */}
        <AnimatePresence>
          {inputRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.modalOverlay}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 28 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 28 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                style={styles.inputPopupCard}
              >
                {inputDone ? (
                  <>
                    <div style={styles.inputDoneIcon}>✅</div>
                    <p style={styles.inputDoneText}>
                      धन्यवाद! जानकारी सुरक्षित रूप से भेजी गई।
                    </p>
                    <p style={styles.inputDoneSubtext}>
                      Information received securely 🔒
                    </p>
                  </>
                ) : (
                  <>
                    <div style={styles.inputPopupHeader}>
                      <div style={styles.inputPopupIcon}>📝</div>
                      <div>
                        <p style={styles.inputPopupTitle}>
                          {inputRequest.field_label}
                        </p>
                        <p style={styles.inputPopupSubtitle}>
                          {inputRequest.field_label_customer}
                        </p>
                      </div>
                    </div>
                    <p style={styles.inputPopupHint}>
                      Staff has requested this — please type below
                    </p>
                    <input
                      autoFocus
                      type={inputRequest.field_type === "dob" ? "text" : "text"}
                      placeholder={
                        inputRequest.field_type === "aadhaar"
                          ? "1234 5678 9012"
                          : inputRequest.field_type === "pan"
                            ? "ABCDE1234F"
                            : inputRequest.field_type === "dob"
                              ? "DD/MM/YYYY"
                              : inputRequest.field_type === "phone"
                                ? "9XXXXXXXXX"
                                : inputRequest.field_type === "ifsc"
                                  ? "UBIN0XXXXXX"
                                  : "Enter here..."
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleInputSubmit();
                      }}
                      style={styles.inputPopupField}
                    />
                    <p style={styles.inputPopupSecurity}>
                      🔒 Encrypted • Staff will see masked value only
                    </p>
                    <div style={styles.inputPopupActions}>
                      <motion.div
                        style={styles.inputPopupCancelBtn}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setInputRequest(null)}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                          }}
                        >
                          Cancel
                        </span>
                      </motion.div>
                      <motion.div
                        style={{
                          ...styles.inputPopupSubmitBtn,
                          opacity: inputValue.trim() ? 1 : 0.5,
                        }}
                        whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
                        onClick={handleInputSubmit}
                      >
                        {inputSubmitting ? (
                          <Loader2
                            size={16}
                            color="#fff"
                            style={{
                              animation: "loader-spin 0.8s linear infinite",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            Send Securely 🔒
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INTENT NOTIFICATION POPUP — balance enquiry, etc. */}
        <AnimatePresence>
          {intentNotif && (
            <motion.div
              key="intent-notif"
              initial={{ opacity: 0, y: -60, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{
                position: "fixed",
                top: 72,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 200,
                width: "calc(100% - 32px)",
                maxWidth: 420,
                padding: "14px 18px",
                borderRadius: 16,
                backgroundColor: "var(--card-bg)",
                border: `2px solid ${BRAND.blue}33`,
                boxShadow: `0 8px 32px rgba(0,48,135,0.18)`,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "rgba(0,48,135,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {intentNotif.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: BRAND.blue,
                  }}
                >
                  {intentNotif.title}
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.4,
                  }}
                >
                  {intentNotif.message}
                </p>
              </div>
              <motion.div
                whileTap={{ scale: 0.85 }}
                onClick={() => setIntentNotif(null)}
                style={{
                  padding: 6,
                  cursor: "pointer",
                  fontSize: 16,
                  color: "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                ✕
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DEMO BUTTON */}
        {showConversation && demoModeFromServer && (
          <div style={styles.demoFloatingWrap}>
            <AnimatePresence>
              {isDemoRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.8 }}
                  style={styles.demoBadge}
                >
                  Demo ({demoIndex}/{DEMO_SCRIPT.length})
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              style={{
                ...styles.demoBtn,
                backgroundColor: isDemoRunning ? "#DC2626" : BRAND.red,
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={startDemo}
              role="button"
            >
              <span style={styles.demoBtnText}>
                {isDemoRunning ? "⏹ Stop" : "🎬 Demo"}
              </span>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

//  STYLES
const styles = {
  page: {
    width: "100%",
    height: "100dvh",
    backgroundColor: "var(--body-bg)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    overflow: "hidden",
  },
  container: {
    width: "100%",
    maxWidth: 480,
    height: "100dvh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "var(--card-bg)",
    borderBottom: "1px solid var(--card-border)",
    flexShrink: 0,
    zIndex: 10,
  },
  statusLeft: { display: "flex", alignItems: "center", gap: 10 },
  statusRight: { display: "flex", alignItems: "center", gap: 8 },
  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 20,
    backgroundColor: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.2)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    animation: "live-blink 1.5s ease-in-out infinite",
  },
  liveText: {
    fontSize: 11,
    fontWeight: 700,
    color: "#22C55E",
    letterSpacing: 1,
  },
  tokenBadge: {
    padding: "4px 10px",
    borderRadius: 8,
    backgroundColor: "var(--badge-bg)",
  },
  tokenText: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    fontFamily: "'Inter', monospace",
  },
  timerBadge: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 8px",
    borderRadius: 8,
    backgroundColor: "var(--badge-bg)",
  },
  timerText: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    fontFamily: "'Inter', monospace",
  },
  themeToggle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--badge-bg)",
    border: "1px solid var(--card-border)",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  endBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--error-bg)",
    border: `1px solid ${BRAND.red}22`,
    cursor: "pointer",
  },
  connectedBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "6px 16px",
    backgroundColor: "rgba(34,197,94,0.06)",
    borderBottom: "1px solid var(--card-border)",
    flexShrink: 0,
  },
  connectedText: { fontSize: 12, fontWeight: 500, color: "#22C55E" },
  serviceSection: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  miniHeader: { display: "flex", alignItems: "center", gap: 12 },
  miniLogoImg: { height: 40, width: "auto", objectFit: "contain" },
  miniSubtext: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--text-muted)",
    margin: 0,
  },
  serviceTitleWrap: { textAlign: "center" },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  serviceTitleLang: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-secondary)",
    margin: "4px 0 0",
  },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
  },
  serviceCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "18px 12px",
    borderRadius: 16,
    border: "2px solid var(--card-border)",
    backgroundColor: "var(--card-bg)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    minHeight: 110,
    textAlign: "center",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  },
  serviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-primary)",
    lineHeight: 1.3,
  },
  serviceLabelEn: {
    fontSize: 10,
    fontWeight: 500,
    color: "var(--text-muted)",
    lineHeight: 1.2,
  },
  skipBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 20px",
    borderRadius: 14,
    backgroundColor: BRAND.blue,
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    boxShadow: "0 2px 12px rgba(0,48,135,0.2)",
  },
  skipBtnText: { fontSize: 14, fontWeight: 600, color: "#fff" },
  conversationSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  activeServiceBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 16px",
    backgroundColor: "var(--info-bg)",
    borderBottom: "1px solid var(--card-border)",
    flexShrink: 0,
  },
  activeServiceEmoji: { fontSize: 16 },
  activeServiceText: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  welcomeCard: {
    textAlign: "center",
    padding: "32px 20px",
    borderRadius: 16,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  welcomeIcon: { fontSize: 36, lineHeight: 1 },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  welcomeText: {
    fontSize: 13,
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.5,
  },
  welcomeTextLang: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-muted)",
    margin: 0,
    fontStyle: "italic",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: "12px 16px",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    position: "relative",
  },
  staffBubble: {
    alignSelf: "flex-start",
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    borderBottomLeftRadius: 4,
    color: "var(--text-primary)",
  },
  customerBubble: {
    alignSelf: "flex-end",
    backgroundColor: BRAND.blue,
    borderBottomRightRadius: 4,
    color: "#ffffff",
  },
  pendingBubble: { opacity: 0.7 },
  msgSender: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  msgText: {
    fontSize: 15,
    fontWeight: 400,
    color: "inherit",
    margin: 0,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  msgTime: {
    fontSize: 9,
    fontWeight: 500,
    opacity: 0.6,
    alignSelf: "flex-end",
    marginTop: 2,
  },
  playingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    padding: "4px 8px",
    borderRadius: 8,
    backgroundColor: "rgba(0,48,135,0.06)",
  },
  playingText: { fontSize: 11, fontWeight: 500, color: BRAND.blue },
  audioWave: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    height: 16,
    marginLeft: 4,
  },
  waveBar: {
    width: 3,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND.blue,
    animation: "wave-bar 0.8s ease-in-out infinite",
  },
  pendingLoader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  pendingText: { fontSize: 11, fontWeight: 500, color: "var(--text-muted)" },
  speakArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: "16px 16px 24px",
    backgroundColor: "var(--card-bg)",
    borderTop: "1px solid var(--card-border)",
    flexShrink: 0,
  },
  audioErrorText: {
    fontSize: 12,
    fontWeight: 500,
    color: BRAND.red,
    margin: 0,
    textAlign: "center",
  },
  waveformWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
  },
  audioWaveLarge: { display: "flex", alignItems: "center", gap: 4, height: 28 },
  waveBarLarge: {
    width: 4,
    height: 6,
    borderRadius: 2,
    backgroundColor: BRAND.red,
    animation: "wave-bar 0.7s ease-in-out infinite",
  },
  recordingLabel: { fontSize: 13, fontWeight: 600, color: BRAND.red },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    backgroundColor: BRAND.blueDark,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    boxShadow: "0 4px 24px rgba(0,26,82,0.3)",
    transition: "all 0.2s ease",
    position: "relative",
    zIndex: 2,
  },
  micButtonRecording: {
    backgroundColor: BRAND.red,
    boxShadow:
      "0 0 0 6px rgba(232,35,26,0.15), 0 4px 24px rgba(232,35,26,0.35)",
    animation: "mic-pulse-ring 1.2s ease-out infinite",
  },
  micButtonTranscribing: {
    backgroundColor: "var(--text-muted)",
    cursor: "wait",
    boxShadow: "none",
  },
  micLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-secondary)",
    margin: 0,
    textAlign: "center",
  },
  audioLevelWrap: {
    width: "60%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "var(--confidence-bar-bg)",
    overflow: "hidden",
    transformOrigin: "center",
  },
  audioLevelFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: BRAND.red,
    transition: "width 0.1s ease",
  },
  listenOnlyBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 20px",
    backgroundColor: "var(--card-bg)",
    borderTop: "1px solid var(--card-border)",
    flexShrink: 0,
  },
  listenOnlyText: { fontSize: 13, fontWeight: 600, color: BRAND.blue },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "var(--overlay)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 100,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    padding: "28px 24px",
    borderRadius: 20,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    textAlign: "center",
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    backgroundColor: "var(--error-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  modalText: {
    fontSize: 13,
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.5,
  },
  modalActions: { display: "flex", gap: 10, width: "100%", marginTop: 4 },
  modalCancelBtn: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 12,
    backgroundColor: "var(--badge-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  modalEndBtn: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 12,
    backgroundColor: BRAND.red,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 2px 12px rgba(232,35,26,0.2)",
  },
  modalEndText: { fontSize: 14, fontWeight: 600, color: "#fff" },
  demoFloatingWrap: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  demoBadge: {
    padding: "4px 10px",
    borderRadius: 8,
    backgroundColor: "#F59E0B",
    fontSize: 10,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: 0.5,
    boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
  },
  demoBtn: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 4px 20px rgba(232,35,26,0.4)",
    WebkitTapHighlightColor: "transparent",
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1,
    textAlign: "center",
  },

  // Smart Input Popup styles
  inputPopupCard: {
    width: "100%",
    maxWidth: 360,
    padding: "28px 24px",
    borderRadius: 20,
    backgroundColor: "var(--card-bg)",
    border: "2px solid rgba(0,48,135,0.18)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  inputPopupHeader: { display: "flex", alignItems: "center", gap: 14 },
  inputPopupIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(0,48,135,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    flexShrink: 0,
  },
  inputPopupTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  inputPopupSubtitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-secondary)",
    margin: "3px 0 0",
  },
  inputPopupHint: {
    fontSize: 12,
    color: "var(--text-muted)",
    margin: 0,
    lineHeight: 1.5,
  },
  inputPopupField: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "2px solid rgba(0,48,135,0.2)",
    backgroundColor: "var(--body-bg)",
    color: "var(--text-primary)",
    fontSize: 16,
    fontWeight: 600,
    outline: "none",
    fontFamily: "'Inter', monospace",
    letterSpacing: 1,
    boxSizing: "border-box",
  },
  inputPopupSecurity: {
    fontSize: 11,
    color: "var(--text-muted)",
    margin: 0,
    textAlign: "center",
  },
  inputPopupActions: { display: "flex", gap: 10 },
  inputPopupCancelBtn: {
    flex: 1,
    padding: "13px",
    borderRadius: 12,
    backgroundColor: "var(--badge-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
  },
  inputPopupSubmitBtn: {
    flex: 2,
    padding: "13px",
    borderRadius: 12,
    backgroundColor: BRAND.blue,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 2px 12px rgba(0,48,135,0.25)",
  },
  inputDoneIcon: { fontSize: 42, textAlign: "center" },
  inputDoneText: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text-primary)",
    textAlign: "center",
    margin: 0,
  },
  inputDoneSubtext: {
    fontSize: 13,
    color: "var(--text-muted)",
    textAlign: "center",
    margin: 0,
  },
};
