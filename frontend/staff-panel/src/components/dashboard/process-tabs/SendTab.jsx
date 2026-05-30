import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Input field configurations
const INPUT_FIELDS = [
  {
    field_type: "aadhaar",
    field_label: "Aadhaar Number",
    field_label_customer: "आधार नंबर दर्ज करें",
    icon: "📛",
    color: "#0C447C",
    bg: "#E6F1FB",
    hint: "12-digit Aadhaar",
  },
  {
    field_type: "account_number",
    field_label: "Account Number",
    field_label_customer: "खाता नंबर दर्ज करें",
    icon: "🏦",
    color: "#0f6e56",
    bg: "#EAF3DE",
    hint: "Bank account number",
  },
  {
    field_type: "pan",
    field_label: "PAN Number",
    field_label_customer: "PAN नंबर दर्ज करें",
    icon: "📄",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.10)",
    hint: "ABCDE1234F format",
  },
  {
    field_type: "phone",
    field_label: "Mobile Number",
    field_label_customer: "मोबाइल नंबर दर्ज करें",
    icon: "📱",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.10)",
    hint: "10-digit mobile",
  },
  {
    field_type: "dob",
    field_label: "Date of Birth",
    field_label_customer: "जन्म तिथि दर्ज करें (DD/MM/YYYY)",
    icon: "📅",
    color: "#d97706",
    bg: "rgba(217,119,6,0.10)",
    hint: "DD/MM/YYYY",
  },
  {
    field_type: "ifsc",
    field_label: "IFSC Code",
    field_label_customer: "IFSC कोड दर्ज करें",
    icon: "🏦",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.10)",
    hint: "e.g. UBIN0XXXXXX",
  },
];

// Tab: Send Input Request
export default function SendTab({ activeSession, sendMessage }) {
  const sessionId = activeSession?.id ?? activeSession?.session_id ?? null;
  const [sent, setSent] = useState(null); // field_type of last sent
  const [cooldown, setCooldown] = useState({}); // { field_type: true }

  const handleSend = (field) => {
    if (!sessionId) { toast.error("No active session"); return; }
    if (cooldown[field.field_type]) return;

    const requestId = Math.random().toString(36).slice(2, 10);
    sendMessage("trigger_input_request", {
      field_type: field.field_type,
      field_label: field.field_label,
      field_label_customer: field.field_label_customer,
      request_id: requestId,
    });

    setSent(field.field_type);
    setCooldown((p) => ({ ...p, [field.field_type]: true }));
    toast.success(`${field.field_label} request sent to customer ✅`, {
      icon: "📨", duration: 2500,
    });
    // Reset cooldown after 5s so staff can resend if customer dismissed
    setTimeout(() => {
      setCooldown((p) => ({ ...p, [field.field_type]: false }));
      setSent((prev) => prev === field.field_type ? null : prev);
    }, 5000);
  };

  if (!sessionId) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0",
        color: "var(--color-text-secondary, #64748b)", fontSize: 13 }}>
        No active session
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Header info */}
      <div style={{
        background: "#E6F1FB", borderRadius: 8, padding: "8px 11px",
        fontSize: 11, color: "#0C447C", lineHeight: 1.5,
      }}>
        <strong>📨 One-click PII Request</strong><br/>
        Click a button below → an input popup will appear directly on the customer's screen.
        Request Aadhaar / Account / PAN etc. without saying it out loud.
      </div>

      {/* Input field buttons */}
      {INPUT_FIELDS.map((field) => {
        const isSent = cooldown[field.field_type];
        return (
          <motion.button
            key={field.field_type}
            onClick={() => handleSend(field)}
            disabled={isSent}
            whileTap={!isSent ? { scale: 0.97 } : {}}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              width: "100%", padding: "11px 14px",
              borderRadius: 12, border: "none",
              background: isSent ? "#EAF3DE" : field.bg,
              cursor: isSent ? "default" : "pointer",
              transition: "all 0.2s",
              textAlign: "left",
            }}
          >
            {/* Icon circle */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: isSent ? "rgba(22,163,74,0.15)" : "rgba(255,255,255,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              {isSent ? "✅" : field.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: isSent ? "#3B6D11" : field.color,
              }}>
                {isSent ? "Sent! Customer popup is open" : field.field_label}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 500, marginTop: 1,
                color: isSent ? "#3B6D11" : "var(--color-text-secondary, #64748b)",
              }}>
                {isSent ? "Resend enabled in 5s" : field.hint}
              </div>
            </div>

            {/* Arrow / sent */}
            <div style={{
              fontSize: 16, flexShrink: 0,
              color: isSent ? "#3B6D11" : field.color,
              opacity: 0.7,
            }}>
              {isSent ? "✓" : "→"}
            </div>
          </motion.button>
        );
      })}

      {/* Security note */}
      <div style={{
        marginTop: 2,
        fontSize: 10, color: "var(--color-text-secondary)", textAlign: "center",
        lineHeight: 1.5,
      }}>
        🔒 Customer input is end-to-end masked —
        staff panel will only see the last 4 digits
      </div>

    </div>
  );
}
