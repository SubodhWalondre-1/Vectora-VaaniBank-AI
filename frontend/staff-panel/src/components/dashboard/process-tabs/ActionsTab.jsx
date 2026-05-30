import { useState } from "react";
import toast from "react-hot-toast";

// Tab: Quick Actions
export default function ActionsTab({ activeSession, sendMessage }) {
  const sessionId  = activeSession?.id ?? activeSession?.session_id ?? null;
  const tokenNo    = activeSession?.token_number ?? "—";
  const intent     = activeSession?.intent_detected ?? "general";
  const mobile     = activeSession?.customer_mobile ?? null;

  const [escalating,  setEscalating]  = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [printed,     setPrinted]     = useState(false);

  const handleWhatsApp = () => {
    if (!sessionId) { toast.error("No active session"); return; }
    sendMessage("send_whatsapp_summary", {
      session_id: sessionId,
      token_number: tokenNo,
      mobile_number: mobile,
      intent,
    });
    setWhatsappSent(true);
    toast.success(mobile ? `WhatsApp summary sent to ${mobile}` : "WhatsApp summary dispatched", {
      icon: "📱", duration: 3000,
    });
    setTimeout(() => setWhatsappSent(false), 6000);
  };

  const handleEscalate = () => {
    if (!sessionId) { toast.error("No active session"); return; }
    setEscalating(true);
    sendMessage("escalate_to_manager", {
      session_id: sessionId,
      token_number: tokenNo,
      intent,
      reason: "Staff escalation via Quick Actions",
    });
    toast("Escalation sent to Branch Manager", { icon: "🚨", duration: 4000 });
    setTimeout(() => setEscalating(false), 5000);
  };

  const handlePrint = () => {
    setPrinted(true);
    // Inject a minimal print-only summary into the DOM, trigger window.print, then remove
    const existing = document.getElementById("vb-print-summary");
    if (existing) existing.remove();

    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const el = document.createElement("div");
    el.id = "vb-print-summary";
    el.innerHTML = `
      <style>
        @media print {
          body > *:not(#vb-print-summary) { display: none !important; }
          #vb-print-summary { display: block !important; font-family: Arial, sans-serif;
            font-size: 13px; padding: 24px; color: #000; }
          #vb-print-summary h2 { font-size: 16px; margin-bottom: 8px; }
          #vb-print-summary table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          #vb-print-summary td { padding: 5px 8px; border: 1px solid #ccc; }
          #vb-print-summary .label { font-weight: bold; width: 40%; }
        }
        @media screen { #vb-print-summary { display: none; } }
      </style>
      <h2>🏦 VaaniBank AI — Session Summary Slip</h2>
      <p style="font-size:11px;color:#555;">Union Bank of India | Team Vectora | ${now}</p>
      <table>
        <tr><td class="label">Token Number</td><td>${tokenNo}</td></tr>
        <tr><td class="label">Session ID</td><td>${sessionId ?? "—"}</td></tr>
        <tr><td class="label">Service Intent</td><td>${intent}</td></tr>
        <tr><td class="label">Customer Mobile</td><td>${mobile ?? "Not captured"}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:11px;color:#888;">Printed by staff panel — for internal record only.</p>
    `;
    document.body.appendChild(el);
    window.print();
    setTimeout(() => { el.remove(); setPrinted(false); }, 3000);
    toast.success("Print dialog opened", { icon: "🖨️", duration: 2000 });
  };

  const btnBase = {
    width: "100%", padding: "11px 14px", borderRadius: 10, border: "none",
    display: "flex", alignItems: "center", gap: 10,
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    transition: "opacity 0.2s, transform 0.1s",
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

      {/* Section header */}
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)",
        textTransform: "uppercase", letterSpacing: "0.5px" }}>Session Actions</div>

      {/* WhatsApp Summary */}
      <button
        onClick={handleWhatsApp}
        disabled={whatsappSent}
        style={{ ...btnBase,
          background: whatsappSent ? "#EAF3DE" : "#25D366",
          color: whatsappSent ? "#3B6D11" : "#fff",
          opacity: whatsappSent ? 0.8 : 1,
        }}
      >
        <span style={{ fontSize: 18 }}>📱</span>
        <div style={{ textAlign: "left" }}>
          <div>{whatsappSent ? "Summary Sent!" : "Send Summary to Customer"}</div>
          <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>
            {mobile ? `WhatsApp → ${mobile}` : "Via WhatsApp (number from CBS)"}
          </div>
        </div>
      </button>

      {/* Escalate to Manager */}
      <button
        onClick={handleEscalate}
        disabled={escalating}
        style={{ ...btnBase,
          background: escalating ? "#FAEEDA" : "#FCEBEB",
          color: escalating ? "#854F0B" : "#A32D2D",
        }}
      >
        <span style={{ fontSize: 18 }}>🚨</span>
        <div style={{ textAlign: "left" }}>
          <div>{escalating ? "Escalating..." : "Escalate to Branch Manager"}</div>
          <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>
            Sends WS alert + logs escalation in CBS
          </div>
        </div>
      </button>

      {/* Print Summary Slip */}
      <button
        onClick={handlePrint}
        disabled={printed}
        style={{ ...btnBase,
          background: "var(--color-background-secondary, #f8fafc)",
          color: "var(--color-text-primary, #0f172a)",
          border: "1px solid var(--color-border-secondary, rgba(0,0,0,0.12))",
        }}
      >
        <span style={{ fontSize: 18 }}>🖨️</span>
        <div style={{ textAlign: "left" }}>
          <div>{printed ? "Opening print dialog..." : "Print Summary Slip"}</div>
          <div style={{ fontSize: 10, fontWeight: 400, color: "var(--color-text-secondary)" }}>
            Token, Session ID, Intent — for counter record
          </div>
        </div>
      </button>

      {/* Info note */}
      <div style={{
        marginTop: 4,
        background: "var(--color-background-secondary, #f8fafc)",
        borderRadius: 8, padding: "8px 10px",
        fontSize: 10, color: "var(--color-text-secondary)", lineHeight: 1.5,
      }}>
        <strong style={{ color: "var(--color-text-primary)" }}>Session:</strong> #{tokenNo}
        &nbsp;·&nbsp;<strong style={{ color: "var(--color-text-primary)" }}>ID:</strong> {sessionId?.toString().slice(0,8)}…
        &nbsp;·&nbsp;<strong style={{ color: "var(--color-text-primary)" }}>Intent:</strong> {intent}
      </div>

    </div>
  );
}
