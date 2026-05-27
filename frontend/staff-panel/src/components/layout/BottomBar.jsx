/* ============================================
   VaaniBank AI — BottomBar Component
   Union Bank of India | Team Vectora
   ============================================ */

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Play,
  Square,
  FileDown,
  MessageSquare,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAudio } from "../../hooks/useAudio";
import { aiAPI } from "../../services/api";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import toast from "react-hot-toast";

// ── Language map: customer language name → Sarvam codes ──────
const LANG_CODE_MAP = {
  Malayalam: { code: "ml-IN", speaker: "meera" },
  Tamil: { code: "ta-IN", speaker: "anushka" },
  Telugu: { code: "te-IN", speaker: "anushka" },
  Kannada: { code: "kn-IN", speaker: "anushka" },
  Bengali: { code: "bn-IN", speaker: "anushka" },
  Gujarati: { code: "gu-IN", speaker: "anushka" },
  Punjabi: { code: "pa-IN", speaker: "anushka" },
  Odia: { code: "or-IN", speaker: "anushka" },
  Marathi: { code: "mr-IN", speaker: "anushka" },
  Hindi: { code: "hi-IN", speaker: "meera" },
  English: { code: "en-IN", speaker: "meera" },
};

// ── Staff language → Sarvam STT language code ────────────────
const STAFF_LANG_STT = {
  Hindi: "hi-IN",
  English: "en-IN",
  Marathi: "mr-IN",
};

// ── Preferred MIME types for MediaRecorder ───────────────────
const MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function getSupportedMime() {
  return MIME_TYPES.find((m) => MediaRecorder.isTypeSupported(m)) || "";
}

function getConfidenceColor(confidence) {
  if (confidence >= 80) return "#16A34A";
  if (confidence >= 50) return "#D97706";
  return "#DC2626";
}

// ── PII Keyword Detection Config ──────────────────────────────
// When staff speaks via "Speak to Customer" and STT detects
// these keywords, an input popup appears on the customer panel.
const INPUT_KEYWORDS = [
  {
    patterns: [
      "aadhaar",
      "aadhar",
      "आधार",
      "aadhaar number",
      "aadhar number",
      "aadhar card",
      "aadhaar card",
      "adhar",
    ],
    field_type: "aadhaar",
    field_label: "Aadhaar Number",
    field_label_customer: "आधार कार्ड नंबर दर्ज करें",
  },
  {
    patterns: ["pan", "pan card", "pan number", "पैन", "permanent account"],
    field_type: "pan",
    field_label: "PAN Number",
    field_label_customer: "PAN कार्ड नंबर दर्ज करें",
  },
  {
    patterns: [
      "date of birth",
      "dob",
      "जन्म तिथि",
      "janm tithi",
      "birthday",
      "birth date",
      "janam tithi",
    ],
    field_type: "dob",
    field_label: "Date of Birth",
    field_label_customer: "जन्म तिथि दर्ज करें (DD/MM/YYYY)",
  },
  {
    patterns: [
      "mobile",
      "phone",
      "mobile number",
      "phone number",
      "फोन",
      "मोबाइल",
      "contact number",
      "mobile no",
    ],
    field_type: "phone",
    field_label: "Mobile Number",
    field_label_customer: "मोबाइल नंबर दर्ज करें",
  },
  {
    patterns: ["ifsc", "ifsc code", "bank code", "branch code"],
    field_type: "ifsc",
    field_label: "IFSC Code",
    field_label_customer: "IFSC कोड दर्ज करें",
  },
  {
    patterns: [
      "account number",
      "account no",
      "खाता संख्या",
      "khata number",
      "account num",
      "a/c number",
    ],
    field_type: "account_number",
    field_label: "Account Number",
    field_label_customer: "खाता नंबर दर्ज करें",
  },
];

/**
 * Detects if staff speech contains a PII keyword.
 * Returns the matched INPUT_KEYWORDS entry or null.
 */
function detectInputKeyword(text) {
  const lower = (text || "").toLowerCase();
  return (
    INPUT_KEYWORDS.find(({ patterns }) =>
      patterns.some((p) => lower.includes(p)),
    ) || null
  );
}

export default function BottomBar({
  lastAudioUrl,
  sttConfidence,
  onExportPDF,
  exportingPDF,
  sendMessage,
}) {
  const activeSession = useApp((s) => s.activeSession);
  const sessionStatus = useApp((s) => s.sessionStatus);
  const isProcessing = useApp((s) => s.isProcessing);
  const setListening = useApp((s) => s.setListening);
  const setProcessing = useApp((s) => s.setProcessing);
  const addExchange = useApp((s) => s.addExchange);
  // AI hint: next question from InfoBoard
  const nextQuestionHint = useApp(
    (s) => s.infoBoard?.next_question_hindi || "",
  );

  const {
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    isRecording,
    isPlaying,
    audioLevel,
    recordingDuration,
    error: audioError,
  } = useAudio();

  const [saving, setSaving] = useState(false);

  // ── Staff-speak state ─────────────────────────────────────
  const [staffRecording, setStaffRecording] = useState(false);
  const [staffProcessing, setStaffProcessing] = useState(false);
  const [staffOriginalText, setStaffOriginalText] = useState("");
  const [staffTranslated, setStaffTranslated] = useState("");
  const staffMediaRef = useRef(null);
  const staffStreamRef = useRef(null);
  const staffChunksRef = useRef([]);
  // Watchdog: auto-resets isProcessing if backend never responds
  const processingTimeoutRef = useRef(null);
  const PROCESSING_TIMEOUT_MS = 20_000;

  const isActive = sessionStatus === "active";
  const isOffline = activeSession?.offline_mode || false;

  // ── Force-reset stuck processing state (escape hatch) ────
  const resetProcessingState = useCallback(() => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    setProcessing(false);
    setListening(false);
  }, [setProcessing, setListening]);

  // ── Clear watchdog when AI pipeline completes via WS ─────
  // Also handles the WS-path stuck state:
  // transcription_ready sets isProcessing=true via WS.
  // If ai_suggestion_ready never fires (backend timeout/error),
  // the mic stays disabled forever. This watchdog prevents that.
  const wsProcessingTimerRef = useRef(null);
  const WS_PROCESSING_TIMEOUT_MS = 25_000;

  useEffect(() => {
    const onWsEvent = (e) => {
      const { type } = e.detail || {};

      // ── REST-path watchdog: clear on completion ──
      if (
        type === "ai_suggestion_ready" ||
        type === "session_ended" ||
        type === "error"
      ) {
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
          processingTimeoutRef.current = null;
        }
      }

      // ── WS-path watchdog: start timer when transcription begins ──
      if (type === "transcription_ready") {
        // Clear any previous WS watchdog
        if (wsProcessingTimerRef.current) {
          clearTimeout(wsProcessingTimerRef.current);
        }
        // Start a fresh watchdog — if ai_suggestion_ready never arrives, force reset
        wsProcessingTimerRef.current = setTimeout(() => {
          wsProcessingTimerRef.current = null;
          setProcessing(false);
          setListening(false);
          toast("Response timed out — tap to try again.", {
            icon: "⚠️",
            duration: 3000,
          });
        }, WS_PROCESSING_TIMEOUT_MS);
      }

      // ── WS-path watchdog: clear when AI response arrives ──
      if (
        type === "ai_suggestion_ready" ||
        type === "audio_ready" ||
        type === "session_ended" ||
        type === "error"
      ) {
        if (wsProcessingTimerRef.current) {
          clearTimeout(wsProcessingTimerRef.current);
          wsProcessingTimerRef.current = null;
        }
        // Explicitly clear processing on success paths too
        if (type === "ai_suggestion_ready" || type === "audio_ready") {
          setProcessing(false);
        }
      }
    };

    window.addEventListener("ws_event", onWsEvent);
    return () => {
      window.removeEventListener("ws_event", onWsEvent);
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      if (wsProcessingTimerRef.current) {
        clearTimeout(wsProcessingTimerRef.current);
        wsProcessingTimerRef.current = null;
      }
    };
  }, [setProcessing, setListening]);
  const confidence = sttConfidence ?? 0;
  const confidenceColor = getConfidenceColor(confidence);

  // ── Customer language derived values ─────────────────────
  const customerLangName = activeSession?.customer_language || "Hindi";
  const customerLangInfo =
    LANG_CODE_MAP[customerLangName] || LANG_CODE_MAP["Hindi"];

  // Staff's language (fallback Hindi)
  const staffLangName = activeSession?.staff_language || "Hindi";
  const staffSttCode = STAFF_LANG_STT[staffLangName] || "hi-IN";

  // ── Customer Mic Toggle (listens to customer) ─────────────
  const handleMicToggle = useCallback(async () => {
    if (isRecording) {
      const blob = await stopRecording();
      setListening(false);

      if (blob && blob.size > 500 && activeSession) {
        // Start watchdog — unblocks button if backend never sends ai_suggestion_ready
        if (processingTimeoutRef.current)
          clearTimeout(processingTimeoutRef.current);
        setProcessing(true);
        processingTimeoutRef.current = setTimeout(() => {
          processingTimeoutRef.current = null;
          setProcessing(false);
          toast("Processing timed out — please try again.", {
            icon: "⚠️",
            duration: 3500,
          });
        }, PROCESSING_TIMEOUT_MS);
        try {
          const result = await aiAPI.transcribeAudio(
            blob,
            activeSession.customer_language_code,
            activeSession.id,
            (activeSession.total_exchanges || 0) + 1,
            activeSession.token_number,
          );
          if (result) toast.success("Audio transcribed successfully");
        } catch {
          toast.error("Transcription failed. Please try again.");
        } finally {
          // Clear watchdog — REST path resolved (WS may still set processing=true briefly)
          if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
            processingTimeoutRef.current = null;
          }
          setProcessing(false);
        }
      } else if (blob && blob.size <= 500) {
        toast("Hold longer to record", { icon: "🎙️", duration: 2000 });
      }
    } else {
      try {
        await startRecording();
        setListening(true);
      } catch (err) {
        setListening(false);
        if (
          err?.name === "NotAllowedError" ||
          err?.message?.includes("denied")
        ) {
          toast.error(
            "Microphone permission denied. Allow mic access in browser settings.",
            { duration: 4000 },
          );
        } else if (err?.name === "NotFoundError") {
          toast.error("No microphone found. Please connect a microphone.", {
            duration: 4000,
          });
        } else if (err?.name === "NotReadableError") {
          toast.error(
            "Microphone is in use by another app. Close it and retry.",
            { duration: 4000 },
          );
        } else {
          toast.error("Could not access microphone. Please try again.", {
            duration: 3000,
          });
        }
      }
    }
  }, [
    isRecording,
    stopRecording,
    startRecording,
    activeSession,
    setProcessing,
    setListening,
  ]);

  // ── Play / Stop AI response audio ────────────────────────
  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      stopAudio();
    } else if (lastAudioUrl) {
      playAudio(lastAudioUrl);
    }
  }, [isPlaying, lastAudioUrl, playAudio, stopAudio]);

  // ── Staff Mic: Record → STT → Translate → TTS → Play ─────
  // Staff speaks in Hindi/Marathi → customer hears in their own language
  const handleStaffMicToggle = useCallback(async () => {
    if (!isActive) return;

    // ── STOP recording ──
    if (staffRecording) {
      try {
        if (
          staffMediaRef.current &&
          staffMediaRef.current.state !== "inactive"
        ) {
          staffMediaRef.current.stop();
        }
        if (staffStreamRef.current) {
          staffStreamRef.current.getTracks().forEach((t) => t.stop());
          staffStreamRef.current = null;
        }
      } catch (e) {
        console.warn("[StaffMic] stop error:", e);
      }
      setStaffRecording(false);
      return;
    }

    // ── START recording ──
    setStaffOriginalText("");
    setStaffTranslated("");

    // Same fallback chain as useAudio — sampleRate:16000 exact fails on Windows
    async function getStaffStream() {
      const preferred = {
        audio: {
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 16000 },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      };
      try {
        return await navigator.mediaDevices.getUserMedia(preferred);
      } catch (e) {
        const retry = [
          "OverconstrainedError",
          "ConstraintNotSatisfiedError",
          "NotSupportedError",
          "NotReadableError",
        ];
        if (retry.includes(e.name))
          return await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
        throw e;
      }
    }

    let stream;
    try {
      stream = await getStaffStream();
    } catch (err) {
      console.error("[StaffMic] getUserMedia failed:", err);
      if (err.name === "NotAllowedError") {
        toast.error(
          "Microphone permission denied. Allow mic access in browser settings.",
          { duration: 4000 },
        );
      } else if (err.name === "NotFoundError") {
        toast.error("No microphone found. Please connect a microphone.", {
          duration: 4000,
        });
      } else if (err.name === "NotReadableError") {
        toast.error(
          "Microphone is in use by another app. Close it and retry.",
          { duration: 4000 },
        );
      } else {
        toast.error("Could not access microphone. Please try again.", {
          duration: 3000,
        });
      }
      return;
    }

    staffStreamRef.current = stream;
    staffChunksRef.current = [];

    const mime = getSupportedMime();
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
    staffMediaRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) staffChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      // Stop stream tracks
      if (staffStreamRef.current) {
        staffStreamRef.current.getTracks().forEach((t) => t.stop());
        staffStreamRef.current = null;
      }

      const finalMime = recorder.mimeType || "audio/webm";
      const audioBlob = new Blob(staffChunksRef.current, { type: finalMime });
      staffChunksRef.current = [];

      if (audioBlob.size < 500) {
        toast("Hold longer to record", { icon: "🎤", duration: 2000 });
        return;
      }

      setStaffProcessing(true);
      const tid = toast.loading("Translating to " + customerLangName + "…");

      try {
        // 1. STT — transcribe staff's voice (staff-only endpoint, no DB/WS/LLM)
        const sttResult = await aiAPI.staffTranscribeAudio(
          audioBlob,
          staffSttCode,
        );
        const originalText = sttResult?.transcript || "";
        if (!originalText) throw new Error("STT returned empty transcript");
        setStaffOriginalText(originalText);

        // Staff-speak path does not go through backend LLM pipeline, so
        // input_request (customer popup) was never triggered.
        // FIX: Detect keywords in frontend STT text and send via WS to backend
        // → backend forwards to customer panel.
        const detectedKw = detectInputKeyword(originalText);
        if (detectedKw && sendMessage && activeSession?.token_number) {
          const requestId = `staff-kw-${Date.now()}`;
          sendMessage("trigger_input_request", {
            token_number: activeSession.token_number,
            field_type: detectedKw.field_type,
            field_label: detectedKw.field_label,
            field_label_customer: detectedKw.field_label_customer,
            request_id: requestId,
          });
          // ── Fallback: if backend does not handle trigger_input_request
          // (legacy backend version) directly broadcast to customer panel
          // via vaani_input_request custom event (same-origin only).
          // This works when both panels are in the same browser window (dev).
          // In production, the backend route is the primary path.
          try {
            // Customer panel is on same origin — use BroadcastChannel
            const bc = new BroadcastChannel("vaani_input_request_channel");
            bc.postMessage({
              field_type: detectedKw.field_type,
              field_label: detectedKw.field_label,
              field_label_customer: detectedKw.field_label_customer,
              request_id: requestId,
            });
            bc.close();
          } catch {
            // BroadcastChannel not supported — silently skip, WS path is primary
          }
        }
        // ─────────────────────────────────────────────────────────────────

        // 2. Translate to customer's language
        const translateResult = await aiAPI.translateStaffResponse(
          originalText,
          customerLangInfo.code,
          "banking",
        );
        const translatedText =
          translateResult?.translated_text ||
          translateResult?.translation ||
          originalText;
        setStaffTranslated(translatedText);

        // 3. TTS — speak in customer's language
        // Pass token_number so backend broadcasts audio_ready to customer WS
        const ttsResult = await aiAPI.generateTTS(
          translatedText,
          customerLangInfo.code,
          activeSession?.id,
          activeSession?.token_number, // ← this triggers WS broadcast to customer
        );

        const audioUrl = ttsResult?.audio_url
          ? ttsResult.audio_url
          : ttsResult?.audio_filename
            ? aiAPI.getAudioUrl(ttsResult.audio_filename)
            : null;

        // if (audioUrl) {
        //   await playAudio(audioUrl);
        // } else if (ttsResult?.audio_base64) {
        //   const bytes = atob(ttsResult.audio_base64);
        //   const arr   = new Uint8Array(bytes.length);
        //   for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        //   const blobWav = new Blob([arr], { type: 'audio/wav' });
        //   const url2    = URL.createObjectURL(blobWav);
        //   await playAudio(url2);
        //   setTimeout(() => URL.revokeObjectURL(url2), 10000);
        // }

        // NOTE: No staff_approved_response WS call needed here.
        // aiAPI.generateTTS() above already passes token_number to the /tts/generate endpoint,
        // which broadcasts staff_message + audio_ready to the customer panel.
        // Sending staff_approved_response here would cause duplicate translate → TTS → audio.

        toast.success("Spoken to customer in " + customerLangName, {
          id: tid,
          duration: 3000,
        });

        // ── Add to ConversationPanel as staff_to_customer exchange ──
        addExchange({
          id: `staff-${Date.now()}`,
          direction: "staff_to_customer",
          exchange_number: (activeSession?.total_exchanges || 0) + 1,
          staff_lang_name: staffLangName,
          staff_original_text: originalText,
          customer_lang_name: customerLangName,
          staff_translated_text: translatedText,
          created_at: new Date().toISOString(),
          sentiment: "calm",
        });
      } catch (err) {
        console.error("[StaffMic] pipeline error:", err);
        toast.error(
          "Translation failed: " + (err?.message || "Please try again"),
          { id: tid, duration: 4000 },
        );
      } finally {
        setStaffProcessing(false);
      }
    };

    recorder.start(250);
    setStaffRecording(true);
    toast("Speak in " + staffLangName + "…", { icon: "🎤", duration: 2000 });
  }, [
    isActive,
    staffRecording,
    activeSession,
    customerLangName,
    customerLangInfo,
    staffSttCode,
    staffLangName,
    playAudio,
    addExchange,
    sendMessage,
  ]);

  // ── Save exchange ─────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      toast.success("Exchange saved");
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  }, []);

  // ── Format recording duration mm:ss ──────────────────────
  const formatDuration = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <footer
      className="flex items-center justify-between h-[72px] px-5 shrink-0 z-20 select-none"
      style={{
        backgroundColor: "var(--topbar-bg)",
        borderTop: "1px solid var(--topbar-border)",
      }}
    >
      {/* ── Left: Warning/Alerts ───────────────── */}
      <div className="flex items-center gap-3 min-w-[260px]">
        {isActive && (
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400 select-none opacity-80">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Space</kbd>
            <span>Record</span>
            <span className="text-slate-600">|</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Enter</kbd>
            <span>Send</span>
            <span className="text-slate-600">|</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Esc</kbd>
            <span>Stop</span>
          </div>
        )}
        {confidence > 0 && confidence < 50 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold animate-pulse"
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              color: "#DC2626",
              border: "1px solid rgba(220, 38, 38, 0.2)",
            }}
            title={`Low speech recognition accuracy: ${confidence}%`}
          >
            <span className="text-xs">⚠️</span>
            <span>Low Confidence ({confidence}%)</span>
          </div>
        )}
      </div>

      {/* ── Center: Customer Mic Button ─────────────────── */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <AnimatePresence>
            {isRecording && (
              <>
                <motion.div
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: "var(--accent-red)" }}
                />
                <motion.div
                  initial={{ scale: 1, opacity: 0.2 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.3,
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: "var(--accent-red)" }}
                />
              </>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleMicToggle}
            disabled={!isActive || isProcessing}
            whileHover={isActive && !isProcessing ? { scale: 1.08 } : {}}
            whileTap={isActive && !isProcessing ? { scale: 0.95 } : {}}
            className={[
              "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
              !isActive || isProcessing
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer",
            ].join(" ")}
            style={{
              background: isRecording
                ? "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)"
                : "linear-gradient(135deg, #001a52 0%, #003087 100%)",
              boxShadow: isRecording
                ? "0 4px 20px rgba(220,38,38,0.4)"
                : "0 4px 14px rgba(0,48,135,0.3)",
            }}
          >
            {isRecording ? (
              <MicOff size={20} className="text-white" />
            ) : (
              <Mic size={20} className="text-white" />
            )}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.span
            key={isRecording ? "rec" : isProcessing ? "proc" : "idle"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[10px] font-semibold"
            style={{
              color: isRecording
                ? "var(--accent-red)"
                : isProcessing
                  ? "var(--warning)"
                  : "var(--text-muted)",
            }}
          >
            {isRecording ? (
              `Recording ${formatDuration(recordingDuration)}`
            ) : isProcessing ? (
              <span
                title="Click to cancel if stuck"
                style={{
                  cursor: "pointer",
                  textDecoration: "underline dotted",
                }}
                onClick={resetProcessingState}
              >
                Processing…
              </span>
            ) : (
              "Tap to Listen"
            )}
          </motion.span>
        </AnimatePresence>

        {isRecording && (
          <div className="audio-wave" style={{ height: 16 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="audio-wave__bar"
                animate={{
                  height: Math.max(
                    3,
                    (audioLevel / 100) * 16 * (0.5 + Math.random() * 0.5),
                  ),
                }}
                transition={{ duration: 0.1 }}
                style={{ width: 2.5, backgroundColor: "var(--accent-red)" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── AI Hint: next question near mic ──────────────── */}
      {nextQuestionHint && !isRecording && !isProcessing && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg max-w-[220px]"
            style={{
              backgroundColor: "rgba(234, 179, 8, 0.08)",
              border: "1px solid rgba(234, 179, 8, 0.2)",
            }}
            title={nextQuestionHint}
          >
            <span style={{ fontSize: 11, flexShrink: 0 }}>💡</span>
            <span
              className="text-[10px] font-medium leading-tight"
              style={{
                color: "#a16207",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {nextQuestionHint}
            </span>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Right: Staff Speak + Actions ────────────────── */}
      <div className="flex items-center gap-2 min-w-[260px] justify-end">
        {/* Staff-Speak: Staff Hindi/Marathi → Customer language TTS */}
        <div className="flex flex-col items-end gap-0.5">
          <motion.button
            onClick={handleStaffMicToggle}
            disabled={!isActive || staffProcessing}
            whileHover={isActive && !staffProcessing ? { scale: 1.05 } : {}}
            whileTap={isActive && !staffProcessing ? { scale: 0.95 } : {}}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              !isActive || staffProcessing
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer",
            ].join(" ")}
            style={{
              background: staffRecording
                ? "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)"
                : staffProcessing
                  ? "rgba(217,119,6,0.12)"
                  : "rgba(37,99,235,0.09)",
              color: staffRecording
                ? "#fff"
                : staffProcessing
                  ? "#D97706"
                  : "#2563EB",
              border: staffRecording
                ? "1px solid #DC2626"
                : staffProcessing
                  ? "1px solid rgba(217,119,6,0.5)"
                  : "1px solid rgba(37,99,235,0.25)",
            }}
          >
            {staffProcessing ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Translating…
              </>
            ) : staffRecording ? (
              <>
                <MicOff size={12} />
                Stop
              </>
            ) : (
              <>
                <MessageSquare size={12} />
                Speak to Customer
              </>
            )}
          </motion.button>

          {/* Show original + translated text */}
          <AnimatePresence>
            {(staffOriginalText || staffTranslated) && (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ maxWidth: 210 }}
                className="text-right"
              >
                {staffOriginalText && (
                  <div
                    className="text-[9px] truncate"
                    style={{ color: "var(--text-muted)" }}
                    title={staffOriginalText}
                  >
                    🗣 {staffOriginalText}
                  </div>
                )}
                {staffTranslated && (
                  <div
                    className="text-[9px] truncate font-semibold"
                    style={{ color: "#16A34A" }}
                    title={staffTranslated}
                  >
                    🌐 {staffTranslated}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Play AI Response */}
        <Button
          variant="ghost"
          size="sm"
          icon={isPlaying ? Square : Play}
          onClick={handlePlayToggle}
          disabled={!lastAudioUrl}
        >
          {isPlaying ? "Stop" : "Play Response"}
        </Button>

        {/* Export PDF */}
        <Button
          variant="primary"
          size="sm"
          icon={FileDown}
          onClick={onExportPDF}
          loading={exportingPDF}
          disabled={!isActive || exportingPDF}
        >
          {exportingPDF ? "Generating…" : "Export PDF"}
        </Button>
      </div>

      {/* Audio error banner (mic permission denied etc.) */}
      {audioError && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg"
            style={{ backgroundColor: "#DC2626" }}
          >
            {audioError}
          </motion.div>
        </div>
      )}
    </footer>
  );
}
