import { motion } from "framer-motion";
import {
  UserPlus,
  Landmark,
  ShieldCheck,
  CreditCard,
  Wallet,
  PiggyBank,
  Mic,
} from "lucide-react";
import { SERVICES } from "../constants";

// Icon Map
const ICON_MAP = { UserPlus, Landmark, ShieldCheck, CreditCard, Wallet, PiggyBank };

const SERVICE_EMOJIS = {
  account_opening: "🏦",
  loan_enquiry: "💰",
  kyc_update: "📋",
  card_services: "💳",
  balance_enquiry: "📊",
  fixed_deposit: "🎙️",
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function ServiceSelectionGrid({
  customerLanguage,
  langLabel,
  selectedService,
  handleServiceSelect,
  setSelectedService,
  setShowConversation,
  styles,
}) {
  const getServiceLabel = (service) =>
    service.labels?.[selectedService?.labels ? Object.keys(selectedService.labels)[0] : "en"] ||
    service.labels?.en ||
    service.id;

  return (
    <div style={styles.serviceSection}>
      <motion.div variants={itemVariants} style={styles.miniHeader}>
        <img src="/website_logo.png" alt="VaaniBank AI" style={styles.miniLogoImg} />
        <p style={styles.miniSubtext}>{customerLanguage || "Hindi"} Session</p>
      </motion.div>
      <motion.div variants={itemVariants} style={styles.serviceTitleWrap}>
        <p style={styles.serviceTitle}>How can we help you?</p>
        <p style={styles.serviceTitleLang}>{langLabel.help}</p>
      </motion.div>
      <motion.div variants={itemVariants} style={styles.serviceGrid}>
        {SERVICES.map((service) => {
          const IconComponent = ICON_MAP[service.icon];
          const isSelected = selectedService?.id === service.id;
          return (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleServiceSelect(service)}
              style={{
                ...styles.serviceCard,
                ...(isSelected ? { borderColor: service.color, backgroundColor: service.bgColor } : {}),
              }}
            >
              <div style={{ ...styles.serviceIconWrap, backgroundColor: service.bgColor }}>
                {IconComponent ? (
                  <IconComponent size={24} color={service.color} strokeWidth={1.8} />
                ) : (
                  <span style={{ fontSize: 24 }}>{SERVICE_EMOJIS[service.id] || "🏦"}</span>
                )}
              </div>
              <span style={styles.serviceLabel}>
                {service.labels?.[selectedService?.labels ? Object.keys(selectedService.labels)[0] : "en"] ||
                  service.labels?.en ||
                  service.id}
              </span>
              <span style={styles.serviceLabelEn}>{service.labels?.en}</span>
            </motion.div>
          );
        })}
      </motion.div>
      <motion.div
        variants={itemVariants}
        style={styles.skipBtn}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          setSelectedService({ id: "general", labels: { en: "Live Help" } });
          setShowConversation(true);
        }}
      >
        <Mic size={18} color="#fff" />
        <span style={styles.skipBtnText}>Skip — Go to Live Help</span>
      </motion.div>
    </div>
  );
}
