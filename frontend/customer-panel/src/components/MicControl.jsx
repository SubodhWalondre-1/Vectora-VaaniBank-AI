import { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";

export default function MicControl({
  isRecording,
  isTranscribing,
  audioError,
  audioLevel,
  onStartMic,
  onStopMic,
  unlockAudio,
  styles,
}) {
  const touchActiveRef = useRef(false);
  const micButtonElementRef = useRef(null);

  // Refs to prevent stale closure inside manual event listeners
  const isRecordingRef = useRef(isRecording);
  const isTranscribingRef = useRef(isTranscribing);
  const onStartMicRef = useRef(onStartMic);
  const onStopMicRef = useRef(onStopMic);
  const unlockAudioRef = useRef(unlockAudio);

  // Sync refs on every render
  isRecordingRef.current = isRecording;
  isTranscribingRef.current = isTranscribing;
  onStartMicRef.current = onStartMic;
  onStopMicRef.current = onStopMic;
  unlockAudioRef.current = unlockAudio;

  // Touch start (mobile tap-toggle)
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    unlockAudioRef.current();
    touchActiveRef.current = true;
    if (isTranscribingRef.current) return;
    
    if (isRecordingRef.current) {
      onStopMicRef.current();
    } else {
      onStartMicRef.current();
    }
  }, []);

  // Touch end (mobile tap-toggle no-op)
  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    touchActiveRef.current = false;
  }, []);

  // Touch events manual passive listener wrapper to prevent console error
  const micButtonRef = useCallback((node) => {
    if (micButtonElementRef.current) {
      const prevNode = micButtonElementRef.current;
      if (prevNode._onTouchStart) {
        prevNode.removeEventListener("touchstart", prevNode._onTouchStart);
      }
      if (prevNode._onTouchEnd) {
        prevNode.removeEventListener("touchend", prevNode._onTouchEnd);
      }
      delete prevNode._onTouchStart;
      delete prevNode._onTouchEnd;
    }

    micButtonElementRef.current = node;

    if (node) {
      const onTouchStart = (e) => {
        handleTouchStart(e);
      };
      const onTouchEnd = (e) => {
        handleTouchEnd(e);
      };

      node.addEventListener("touchstart", onTouchStart, { passive: false });
      node.addEventListener("touchend", onTouchEnd, { passive: false });

      node._onTouchStart = onTouchStart;
      node._onTouchEnd = onTouchEnd;
    }
  }, [handleTouchStart, handleTouchEnd]);

  // Mouse down (desktop tap-toggle)
  const handleMouseDown = useCallback((e) => {
    if (touchActiveRef.current) return; // already handled by touch
    unlockAudioRef.current();
    if (isTranscribingRef.current) return;

    if (isRecordingRef.current) {
      onStopMicRef.current();
    } else {
      onStartMicRef.current();
    }
  }, []);

  // Mouse up / Mouse leave (no-op for tap-to-talk)
  const handleMouseUp = useCallback((e) => {
    // No-op to allow tap-to-speak and tap-to-close behavior
  }, []);

  const handleMouseLeave = useCallback(() => {
    // No-op to allow tap-to-speak and tap-to-close behavior
  }, []);

  return (
    <div style={styles.speakArea}>
      {audioError && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.audioErrorText}>
          {audioError}
        </motion.p>
      )}

      {/* Waveform */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 32 }}
            exit={{ opacity: 0, height: 0 }}
            style={styles.waveformWrap}
          >
            <div style={styles.audioWaveLarge}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{ ...styles.waveBarLarge, animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
            <span style={styles.recordingLabel}>Listening... Tap to send</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MIC BUTTON — Tap to start, Tap again to stop+send */}
      <motion.div
        ref={micButtonRef}
        style={{
          ...styles.micButton,
          ...(isRecording ? styles.micButtonRecording : {}),
          ...(isTranscribing ? styles.micButtonTranscribing : {}),
        }}
        whileTap={!isTranscribing ? { scale: 0.92 } : {}}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        role="button"
        aria-label={isRecording ? "Tap to stop" : "Tap to speak"}
      >
        {isTranscribing ? (
          <Loader2
            size={32}
            color="#fff"
            style={{ animation: "loader-spin 0.8s linear infinite" }}
          />
        ) : isRecording ? (
          <MicOff size={32} color="#fff" />
        ) : (
          <Mic size={32} color="#fff" />
        )}
      </motion.div>

      {/* Label */}
      <p style={styles.micLabel}>
        {isTranscribing ? "Processing..." : isRecording ? "Tap to Stop" : "Tap to Speak"}
      </p>

      {/* Audio level bar */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            style={styles.audioLevelWrap}
          >
            <div style={{ ...styles.audioLevelFill, width: `${Math.max(5, audioLevel)}%` }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
