import { useState, useEffect } from "react";

// ─── RBI Compliance Data ────────────────────────────────────────────────────
const COMPLIANCE_MAP = {
  account_opening: {
    formRef: "A-101 (AOF)",
    checks: [
      { id: "ao1", label: "Aadhaar-based eKYC completed (OTP / Biometric)", mandatory: true,  stepNum: 3 },
      { id: "ao2", label: "PAN verified via NSDL/CDSL",                      mandatory: true,  stepNum: 4 },
      { id: "ao3", label: "Original documents seen + self-attested copy taken", mandatory: true, stepNum: 2 },
      { id: "ao4", label: "Initial deposit collected (min ₹500)",            mandatory: false, stepNum: 5 },
      { id: "ao5", label: "AOF (Form A-101) scanned & uploaded to CBS",       mandatory: true,  stepNum: 6 },
      { id: "ao6", label: "Nominee details recorded",                         mandatory: false, stepNum: 7 },
      { id: "ao7", label: "Net banking / debit card activation informed",     mandatory: false, stepNum: 7 },
    ],
  },
  loan_enquiry: {
    formRef: "LA-201 (Loan Application)",
    checks: [
      { id: "le1", label: "CIBIL score checked (min 700)",                   mandatory: true,  stepNum: 2 },
      { id: "le2", label: "EMI-to-income ratio verified (≤50%)",             mandatory: true,  stepNum: 3 },
      { id: "le3", label: "Processing fee & charges disclosed to customer",  mandatory: true,  stepNum: 4 },
      { id: "le4", label: "PMAY subsidy eligibility checked (if home loan)", mandatory: false, stepNum: 5 },
      { id: "le5", label: "All loan documents collected & verified",         mandatory: true,  stepNum: 5 },
      { id: "le6", label: "Application forwarded to Loan Processing Officer",mandatory: true,  stepNum: 6 },
    ],
  },
  kyc_update: {
    formRef: "KYC-07 / DA1 / DA2 / DA3",
    checks: [
      { id: "ku1", label: "Identity verified via Aadhaar OTP or Biometric",  mandatory: true,  stepNum: 2 },
      { id: "ku2", label: "Supporting documents collected (original seen)",  mandatory: true,  stepNum: 3 },
      { id: "ku3", label: "CBS / Finacle updated and saved",                  mandatory: true,  stepNum: 4 },
      { id: "ku4", label: "Acknowledgement slip given to customer",           mandatory: true,  stepNum: 5 },
      { id: "ku5", label: "Nominee form used: DA1 (add) / DA2 (change) / DA3 (cancel)", mandatory: false, stepNum: 3 },
      { id: "ku6", label: "Re-KYC schedule noted (Low:10yr / Med:8yr / High:2yr)", mandatory: true, stepNum: 1 },
    ],
  },
  card_services: {
    formRef: "CS-301 (Card Application)",
    checks: [
      { id: "cs1", label: "Customer identity verified (DOB + last 4 card digits)", mandatory: true, stepNum: 2 },
      { id: "cs2", label: "Card blocked in CBS if block request",             mandatory: true,  stepNum: 3 },
      { id: "cs3", label: "Card application form filled + thumb impression", mandatory: true,  stepNum: 4 },
      { id: "cs4", label: "Delivery timeline (7–10 days) informed",          mandatory: false, stepNum: 5 },
      { id: "cs5", label: "International usage — separate RBI form if needed",mandatory: true, stepNum: 4 },
    ],
  },
  balance_enquiry: {
    formRef: "BE-401 (Balance Verification Log)",
    checks: [
      { id: "be1", label: "Identity verified before sharing balance (Aadhaar/OTP)", mandatory: true, stepNum: 1 },
      { id: "be2", label: "Balance NOT shared with third party without written auth", mandatory: true, stepNum: 1 },
      { id: "be3", label: "Self-service channels communicated to customer",   mandatory: false, stepNum: 3 },
    ],
  },
  fixed_deposit: {
    formRef: "FD-501 (FD Account Opening)",
    checks: [
      { id: "fd1", label: "PAN collected (else TDS at 20%)",                 mandatory: true,  stepNum: 3 },
      { id: "fd2", label: "Form 15G / 15H taken if applicable",              mandatory: false, stepNum: 3 },
      { id: "fd3", label: "Cash limit checked (max ₹49,999 in cash)",        mandatory: true,  stepNum: 4 },
      { id: "fd4", label: "Nominee details recorded",                         mandatory: true,  stepNum: 3 },
      { id: "fd5", label: "FD receipt generated and given to customer",       mandatory: true,  stepNum: 5 },
    ],
  },
  general: {
    formRef: "GQ-601 (General Query Log)",
    checks: [
      { id: "gq1", label: "Written complaint taken if grievance",            mandatory: false, stepNum: 2 },
      { id: "gq2", label: "Reference number given to customer",              mandatory: true,  stepNum: 2 },
      { id: "gq3", label: "Escalation to Branch Manager if unresolved",      mandatory: false, stepNum: 3 },
      { id: "gq4", label: "Resolution within 30 days (RBI mandate)",         mandatory: true,  stepNum: 3 },
    ],
  },
};

// ─── Tab: RBI Compliance Checklist ───────────────────────────────────────────
export default function ComplianceTab({ intentKey, completedCount, keyEntities }) {
  const compData = COMPLIANCE_MAP[intentKey] ?? COMPLIANCE_MAP["general"];
  const checks   = compData.checks;

  // Manual override ticks (staff can tick manually too)
  const [manualTicked, setManualTicked] = useState({});

  // Reset on intent change
  useEffect(() => { setManualTicked({}); }, [intentKey]);

  // Auto-tick: if step N is completed, auto-tick checks whose stepNum <= completedCount
  const isAutoTicked = (check) => check.stepNum <= completedCount;
  const isTicked     = (check) => isAutoTicked(check) || !!manualTicked[check.id];

  const toggleManual = (id) =>
    setManualTicked((prev) => ({ ...prev, [id]: !prev[id] }));

  const mandatory = checks.filter((c) => c.mandatory);
  const optional  = checks.filter((c) => !c.mandatory);
  const mandatoryDone = mandatory.filter(isTicked).length;
  const totalDone     = checks.filter(isTicked).length;

  // AML detector — keyEntities.amount > 10,00,000
  const amount = parseFloat(String(keyEntities?.amount ?? "0").replace(/[^0-9.]/g, ""));
  const amlAlert = amount >= 1000000;

  const checkRow = (check, i, arr) => {
    const ticked = isTicked(check);
    const auto   = isAutoTicked(check);
    return (
      <div
        key={check.id}
        style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "6px 0",
          borderBottom: i < arr.length - 1 ? "0.5px solid rgba(0,0,0,0.07)" : "none",
          opacity: ticked ? 0.75 : 1,
        }}
      >
        {/* Checkbox */}
        <button
          onClick={() => !auto && toggleManual(check.id)}
          title={auto ? "Auto-ticked from Steps" : "Click to tick manually"}
          style={{
            width: 18, height: 18, marginTop: 2, flexShrink: 0, borderRadius: 4,
            border: ticked ? "none" : check.mandatory
              ? "1.5px solid #A32D2D"
              : "1.5px solid rgba(0,0,0,0.2)",
            background: ticked ? (auto ? "#16a34a" : "#0C447C") : "transparent",
            cursor: auto ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
        >
          {ticked && (
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Label */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 11, lineHeight: 1.4,
            color: ticked ? "var(--color-text-secondary)" : "var(--color-text-primary)",
            textDecoration: ticked ? "line-through" : "none",
          }}>
            {check.label}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 2, flexWrap: "wrap" }}>
            {check.mandatory && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "1px 5px",
                background: "#FCEBEB", color: "#A32D2D", borderRadius: 4,
              }}>RBI Mandatory</span>
            )}
            {auto && ticked && (
              <span style={{
                fontSize: 9, fontWeight: 600, padding: "1px 5px",
                background: "#EAF3DE", color: "#3B6D11", borderRadius: 4,
              }}>✓ Auto</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">

      {/* AML Banner */}
      {amlAlert && (
        <div style={{
          background: "#FCEBEB", border: "1.5px solid #F09595",
          borderRadius: 8, padding: "8px 10px",
          display: "flex", alignItems: "flex-start", gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#A32D2D" }}>AML Alert — Amount ≥ ₹10 Lakh</div>
            <div style={{ fontSize: 10, color: "#A32D2D", lineHeight: 1.4, marginTop: 2 }}>
              Transaction above ₹10L detected. Mandatory CTR/STR filing required
              under PMLA 2002. Verify source of funds before proceeding.
            </div>
          </div>
        </div>
      )}

      {/* Progress header */}
      <div style={{
        background: mandatoryDone === mandatory.length && mandatory.length > 0
          ? "#EAF3DE" : "var(--color-background-secondary, #f8fafc)",
        borderRadius: 8, padding: "8px 10px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        transition: "background 0.3s",
      }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: mandatoryDone === mandatory.length && mandatory.length > 0
              ? "#3B6D11" : "var(--color-text-primary)",
          }}>
            {mandatoryDone === mandatory.length && mandatory.length > 0
              ? "✅ All RBI mandatory checks done"
              : `${mandatoryDone}/${mandatory.length} mandatory checks`}
          </div>
          <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 1 }}>
            Form Ref: <strong>{compData.formRef}</strong>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0C447C" }}>
            {totalDone}/{checks.length}
          </div>
          <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>total done</div>
        </div>
      </div>

      {/* Mandatory checks */}
      {mandatory.length > 0 && (
        <div style={{
          background: "var(--color-background-secondary, #f8fafc)",
          borderRadius: 10, padding: "8px 10px",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "#A32D2D",
            textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6,
          }}>⚠️ RBI Mandatory</div>
          {mandatory.map((c, i) => checkRow(c, i, mandatory))}
        </div>
      )}

      {/* Optional checks */}
      {optional.length > 0 && (
        <div style={{
          background: "var(--color-background-secondary, #f8fafc)",
          borderRadius: 10, padding: "8px 10px",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)",
            textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6,
          }}>Optional / Best Practice</div>
          {optional.map((c, i) => checkRow(c, i, optional))}
        </div>
      )}

    </div>
  );
}
