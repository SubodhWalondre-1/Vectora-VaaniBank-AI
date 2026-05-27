import { motion } from "framer-motion";
import { Volume2, Loader2 } from "lucide-react";
import { BRAND } from "../constants";

const messageVariants = {
  initial: { opacity: 0, x: -20, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } },
  exit: { opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } },
};

export default function ConversationBubble({
  msg,
  isPlayingAudio,
  isLastStaffMsg,
  styles,
}) {
  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        ...styles.messageBubble,
        ...(msg.type === "staff" ? styles.staffBubble : styles.customerBubble),
        ...(msg.pending ? styles.pendingBubble : {}),
      }}
    >
      <span style={{ ...styles.msgSender, color: msg.type === "staff" ? BRAND.blue : BRAND.red }}>
        {msg.type === "staff" ? "🏦 Staff" : "🎤 You"}
      </span>
      <p style={styles.msgText}>{msg.text}</p>
      {msg.type === "staff" && msg.audioUrl && isPlayingAudio && isLastStaffMsg && (
        <div style={styles.playingIndicator}>
          <Volume2 size={14} color={BRAND.blue} />
          <span style={styles.playingText}>🔊 Playing...</span>
          <div style={styles.audioWave}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ ...styles.waveBar, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
      {msg.pending && (
        <div style={styles.pendingLoader}>
          <Loader2
            size={14}
            color="var(--text-muted)"
            style={{ animation: "loader-spin 0.8s linear infinite" }}
          />
          <span style={styles.pendingText}>Processing...</span>
        </div>
      )}
      <span style={styles.msgTime}>
        {(() => {
          try {
            const date = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          } catch (e) {
            return "";
          }
        })()}
      </span>
    </motion.div>
  );
}
