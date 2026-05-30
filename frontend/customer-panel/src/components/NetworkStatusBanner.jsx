import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [hasRecovered, setHasRecovered] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setHasRecovered(true);
      setShowBanner(true);
      
      // Auto-hide online confirmation after 3.5 seconds
      const timer = setTimeout(() => {
        setShowBanner(false);
        setHasRecovered(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasRecovered(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check: if already offline on load, show banner immediately
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ x: "-50%", y: -60, opacity: 0 }}
          animate={{ x: "-50%", y: 0, opacity: 1 }}
          exit={{ x: "-50%", y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          style={{
            ...styles.banner,
            backgroundColor: hasRecovered
              ? "rgba(16, 185, 129, 0.95)" // Green back online
              : "rgba(239, 68, 68, 0.95)", // Red offline
            borderColor: hasRecovered ? "#10B981" : "#EF4444",
          }}
        >
          <div style={styles.content}>
            {hasRecovered ? (
              <Wifi size={18} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <WifiOff size={18} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <div style={styles.textWrap}>
              <span style={styles.text}>
                {hasRecovered
                  ? "Connection Restored — Synced"
                  : "Connection Lost — Retrying"}
              </span>
              <span style={styles.subtext}>
                {hasRecovered
                  ? "कनेक्शन बहाल हो गया है"
                  : "कनेक्शन टूट गया — नेटवर्क की जाँच करें"}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  banner: {
    position: "fixed",
    top: 16,
    left: "50%",
    width: "calc(100% - 32px)",
    maxWidth: 420,
    zIndex: 9999,
    padding: "10px 16px",
    borderRadius: 16,
    border: "1px solid",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  textWrap: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: "1.2",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  subtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    fontWeight: 500,
    marginTop: 2,
    fontStyle: "italic",
    lineHeight: "1.1",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
};
