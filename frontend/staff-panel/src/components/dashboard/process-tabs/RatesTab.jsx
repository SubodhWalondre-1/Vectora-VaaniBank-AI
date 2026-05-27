import { useState, useEffect } from "react";

// ─── Tab: Rates & EMI Calculator ────────────────────────────────────────────
export default function RatesTab({ intentKey, keyEntities }) {
  // ── EMI Calculator state ──
  const [amount,  setAmount]  = useState("");
  const [tenure,  setTenure]  = useState("");
  const [rate,    setRate]    = useState("");
  const [emi,     setEmi]     = useState(null);

  // Auto-fill from keyEntities (AI detected from conversation)
  useEffect(() => {
    if (!keyEntities) return;
    if (keyEntities.amount  && !amount)  setAmount(String(keyEntities.amount).replace(/[^0-9.]/g, ""));
    if (keyEntities.tenure  && !tenure)  setTenure(String(keyEntities.tenure).replace(/[^0-9.]/g, ""));
    if (keyEntities.rate    && !rate)    setRate(String(keyEntities.rate).replace(/[^0-9.]/g, ""));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyEntities]);

  const calcEmi = () => {
    const P = parseFloat(amount);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure);
    if (!P || !r || !n || P <= 0 || r <= 0 || n <= 0) { setEmi(null); return; }
    const val = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi(Math.round(val));
  };

  // FD rates table
  const FD_RATES = [
    { tenure: "7–14 days",          general: "3.00%",  senior: "3.50%" },
    { tenure: "46–90 days",         general: "4.50%",  senior: "5.00%" },
    { tenure: "91–179 days",        general: "5.50%",  senior: "6.00%" },
    { tenure: "180–364 days",       general: "6.50%",  senior: "7.00%" },
    { tenure: "1 year",             general: "6.80%",  senior: "7.30%" },
    { tenure: "2–3 years",          general: "7.00%",  senior: "7.50%" },
    { tenure: "5yr Tax Saver (80C)",general: "6.70%",  senior: "7.20%" },
    { tenure: "Samridhi (400 days)",general: "7.40%",  senior: "7.90%" },
    { tenure: "Dhan Vriddhi (333d)",general: "7.25%",  senior: "7.75%" },
  ];

  // Loan interest rates
  const LOAN_RATES = [
    { type: "Home Loan",        rate: "8.35%–9.85%" },
    { type: "Personal Loan",    rate: "10.50%–14.75%" },
    { type: "Car Loan",         rate: "8.80%–10.25%" },
    { type: "Education Loan",   rate: "8.15%–11.15%" },
    { type: "Gold Loan",        rate: "8.75%–10.50%" },
    { type: "Mudra (Tarun)",    rate: "10%–12% (up to ₹10L)" },
    { type: "Kisan Credit Card",rate: "7% (subsidised)" },
  ];

  // Govt schemes
  const GOVT_SCHEMES = [
    { name: "PM Jan Dhan",   icon: "🏦", desc: "Zero-balance account, RuPay card, ₹2L accident cover" },
    { name: "Mudra Loan",    icon: "💼", desc: "Up to ₹10L for micro/small enterprise — Shishu/Kishor/Tarun" },
    { name: "PMAY Subsidy",  icon: "🏠", desc: "Up to ₹2.67L interest subsidy for EWS/LIG home buyers" },
    { name: "Kisan Credit",  icon: "🌾", desc: "7% p.a. crop loan up to ₹3L — interest subvention scheme" },
    { name: "Stand Up India",icon: "🚀", desc: "₹10L–₹1Cr for SC/ST/Women entrepreneurs" },
  ];

  // Highlight FD row if tenure detected in keyEntities
  const detectedTenure = keyEntities?.tenure ? String(keyEntities.tenure) : null;
  const highlightFdRow = (rowTenure) => {
    if (!detectedTenure) return false;
    const months = parseFloat(detectedTenure);
    if (isNaN(months)) return false;
    if (months <= 14/30  && rowTenure.includes("7–14"))   return true;
    if (months >= 1.5 && months <= 3   && rowTenure.includes("46–90")) return true;
    if (months >= 3   && months <= 6   && rowTenure.includes("91–"))   return true;
    if (months >= 6   && months < 12   && rowTenure.includes("180–"))  return true;
    if (months >= 12  && months < 24   && rowTenure.includes("1 year"))return true;
    if (months >= 24  && months <= 36  && rowTenure.includes("2–3"))   return true;
    return false;
  };

  const inputStyle = {
    width: "100%", padding: "6px 10px",
    fontSize: 12, borderRadius: 7,
    border: "1px solid var(--color-border-secondary, rgba(0,0,0,0.15))",
    background: "var(--color-background-primary, #fff)",
    color: "var(--color-text-primary, #0f172a)",
    outline: "none",
  };

  const showFdRates   = ["fixed_deposit", "general"].includes(intentKey);
  const showLoanRates = ["loan_enquiry",  "general"].includes(intentKey);

  return (
    <div className="flex flex-col gap-4">

      {/* ── EMI Calculator ── */}
      <div style={{
        background: "var(--color-background-secondary, #f8fafc)",
        borderRadius: 10, padding: "10px 12px",
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)",
          textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>🧮 EMI Calculator</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 3 }}>Amount (₹)</div>
            <input type="number" placeholder="e.g. 500000" value={amount}
              onChange={(e) => setAmount(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 3 }}>Tenure (months)</div>
            <input type="number" placeholder="e.g. 60" value={tenure}
              onChange={(e) => setTenure(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 3 }}>Rate (% p.a.)</div>
            <input type="number" placeholder="e.g. 8.5" value={rate}
              onChange={(e) => setRate(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <button onClick={calcEmi} style={{
          width: "100%", padding: "6px 0",
          background: "#0C447C", color: "#fff",
          border: "none", borderRadius: 7,
          fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>Calculate EMI</button>

        {emi !== null && (
          <div style={{
            marginTop: 8, textAlign: "center",
            background: "#E6F1FB", borderRadius: 8, padding: "8px 0",
          }}>
            <div style={{ fontSize: 10, color: "#0C447C", fontWeight: 600 }}>Monthly EMI</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0C447C", fontFamily: "monospace" }}>
              ₹{emi.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 10, color: "#64748b" }}>
              Total: ₹{(emi * parseFloat(tenure)).toLocaleString("en-IN")} &nbsp;|
              &nbsp;Interest: ₹{(emi * parseFloat(tenure) - parseFloat(amount)).toLocaleString("en-IN")}
            </div>
          </div>
        )}

        {keyEntities && (keyEntities.amount || keyEntities.tenure || keyEntities.rate) && (
          <div style={{ marginTop: 6, fontSize: 10, color: "#0891b2", fontWeight: 500 }}>
            🔍 Auto-filled from conversation
          </div>
        )}
      </div>

      {/* ── FD Rates Table ── */}
      {showFdRates && (
        <div style={{
          background: "var(--color-background-secondary, #f8fafc)",
          borderRadius: 10, padding: "10px 12px",
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)",
            textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>📈 FD Rates (2025)</div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr",
            fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)",
            borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 4, marginBottom: 4 }}>
            <span style={{ minWidth: 80 }}>Tenure</span>
            <span style={{ textAlign: "right" }}>General</span>
            <span style={{ textAlign: "right" }}>Senior</span>
          </div>
          {FD_RATES.map((row, i) => {
            const isHL = highlightFdRow(row.tenure);
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "auto 1fr 1fr",
                fontSize: 11, padding: "3px 0",
                background: isHL ? "rgba(8,145,178,0.10)" : "transparent",
                borderRadius: isHL ? 5 : 0,
                borderBottom: i < FD_RATES.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
              }}>
                <span style={{ minWidth: 80, color: "var(--color-text-secondary)",
                  fontWeight: isHL ? 700 : 400 }}>{row.tenure}</span>
                <span style={{ textAlign: "right", color: "var(--color-text-primary)",
                  fontWeight: isHL ? 700 : 500 }}>{row.general}</span>
                <span style={{ textAlign: "right", color: "#0F6E56",
                  fontWeight: isHL ? 700 : 500 }}>{row.senior}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Loan Rates ── */}
      {showLoanRates && (
        <div style={{
          background: "var(--color-background-secondary, #f8fafc)",
          borderRadius: 10, padding: "10px 12px",
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)",
            textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>💰 Loan Rates (2025)</div>
          {LOAN_RATES.map((row, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 11, padding: "3px 0",
              borderBottom: i < LOAN_RATES.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
            }}>
              <span style={{ color: "var(--color-text-secondary)" }}>{row.type}</span>
              <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{row.rate}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Govt Schemes ── */}
      <div style={{
        background: "var(--color-background-secondary, #f8fafc)",
        borderRadius: 10, padding: "10px 12px",
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)",
          textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>🇮🇳 Govt Schemes</div>
        {GOVT_SCHEMES.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0",
            borderBottom: i < GOVT_SCHEMES.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-primary)" }}>{s.name}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
