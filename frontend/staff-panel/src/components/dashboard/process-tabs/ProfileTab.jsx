import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { sessionAPI } from "../../../services/api";

// ── Helper: Profile row ─────────────────────────────────────────────────────
function PRow({ label, value, mono = false, highlight = false, small = false }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      padding: "4px 0",
      borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.07))",
    }}>
      <span style={{ fontSize: small ? 10 : 11, color: "var(--color-text-secondary)", flexShrink: 0, marginRight: 8 }}>{label}</span>
      <span style={{
        fontSize: small ? 10 : 11, fontWeight: 600, textAlign: "right",
        color: highlight ? "#A32D2D" : "var(--color-text-primary)",
        fontFamily: mono ? "monospace" : "inherit",
        wordBreak: "break-all",
      }}>{value}</span>
    </div>
  );
}

function SectionHeader({ title, icon }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: "var(--color-text-secondary)",
      textTransform: "uppercase", letterSpacing: "0.5px",
      marginBottom: 6, display: "flex", alignItems: "center", gap: 5,
    }}>
      {icon && <span>{icon}</span>}{title}
    </div>
  );
}

// ─── Tab: Customer Profile ───────────────────────────────────────────────────
export default function ProfileTab({ sessionId, activeSession }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const fetchedRef = useRef(false);

  const doFetch = async (showToast = false) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const data = await sessionAPI.getCustomerProfile(sessionId);
      setProfile(data);
      setLastUpdated(new Date());
      if (showToast) toast.success("Profile refreshed from CBS", { icon: "🏦", duration: 2000 });
    } catch {
      if (showToast) toast.error("CBS fetch failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (!sessionId || fetchedRef.current) return;
    fetchedRef.current = true;
    doFetch();
  }, [sessionId]);

  // Reset on session change
  useEffect(() => {
    fetchedRef.current = false;
    setProfile(null);
    setLastUpdated(null);
  }, [sessionId]);

  // Auto-refresh when customer submits PII via popup
  useEffect(() => {
    const handler = (e) => {
      const { type } = e.detail || {};
      if (type === "input_received") {
        setTimeout(() => doFetch(), 600); // small delay so DB write completes
      }
    };
    window.addEventListener("ws_event", handler);
    return () => window.removeEventListener("ws_event", handler);
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0",
        color: "var(--color-text-secondary, #64748b)", fontSize: 13 }}>
        No active session
      </div>
    );
  }

  const kycStatus = profile?.kyc_status ?? "Unknown";
  const kycColor  = kycStatus === "Complete" ? "#0F6E56" : kycStatus === "Pending" ? "#854F0B" : kycStatus === "Expired" ? "#A32D2D" : "#64748b";
  const kycBg     = kycStatus === "Complete" ? "#EAF3DE" : kycStatus === "Pending" ? "#FAEEDA" : kycStatus === "Expired" ? "#FCEBEB" : "#F1EFE8";
  const cbsLinked = profile?.cbs_linked ?? false;
  const riskColor = profile?.risk_category === "Low" ? "#0F6E56" : profile?.risk_category === "Medium" ? "#854F0B" : "#A32D2D";
  const riskBg    = profile?.risk_category === "Low" ? "#EAF3DE" : profile?.risk_category === "Medium" ? "#FAEEDA" : "#FCEBEB";

  return (
    <div className="flex flex-col gap-3">

      {/* ── CBS Status Banner ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: cbsLinked ? "#EAF3DE" : "#F1EFE8",
        borderRadius: 8, padding: "6px 10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>{cbsLinked ? "✅" : "⏳"}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700,
              color: cbsLinked ? "#0F6E56" : "#64748b" }}>
              {cbsLinked ? "CBS Linked" : "Waiting for customer data"}
            </div>
            {lastUpdated && (
              <div style={{ fontSize: 9, color: "#64748b" }}>
                Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => doFetch(true)}
          disabled={loading}
          style={{
            padding: "4px 10px", borderRadius: 6, border: "none",
            background: "rgba(255,255,255,0.7)", color: "#0C447C",
            fontSize: 11, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "..." : "🔄 Refresh"}
        </button>
      </div>

      {loading && !profile && (
        <div style={{ textAlign: "center", color: "var(--color-text-secondary)",
          fontSize: 12, padding: "20px 0" }}>
          Fetching from CBS...
        </div>
      )}

      {!loading && !profile && (
        <div style={{ textAlign: "center", padding: "20px 0",
          color: "var(--color-text-secondary)", fontSize: 12, lineHeight: 1.7 }}>
          Customer ne abhi koi data submit nahi kiya.<br/>
          <span style={{ color: "#0C447C", fontWeight: 600 }}>Send tab</span> se Account Number ya Aadhaar maango.
        </div>
      )}

      {profile && (
        <>
          {/* ── Customer Identity ── */}
          <div style={{ background: "var(--color-background-secondary, #f8fafc)",
            borderRadius: 10, padding: "10px 12px" }}>
            <SectionHeader title="Customer Identity" icon="👤" />

            {/* Name + CIF hero */}
            {profile.full_name && (
              <div style={{
                background: "#003087", borderRadius: 8, padding: "10px 12px",
                marginBottom: 8, display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: "#fff", fontWeight: 700, flexShrink: 0,
                }}>
                  {profile.full_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{profile.full_name}</div>
                  {profile.customer_id && (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontFamily: "monospace" }}>
                      CIF: {profile.customer_id}
                    </div>
                  )}
                </div>
              </div>
            )}

            <PRow label="Date of Birth" value={profile.dob} />
            <PRow label="Age" value={profile.age ? `${profile.age} years` : null} />
            <PRow label="Gender" value={profile.gender} />
            <PRow label="Occupation" value={profile.occupation} />
            <PRow label="Mobile" value={profile.mobile_number} mono />
            <PRow label="Email" value={profile.email} small />
            <PRow label="PAN" value={profile.pan} mono />
            <PRow label="Aadhaar" value={profile.aadhaar_masked} mono />
          </div>

          {/* ── Address ── */}
          {profile.address && (
            <div style={{ background: "var(--color-background-secondary, #f8fafc)",
              borderRadius: 10, padding: "10px 12px" }}>
              <SectionHeader title="Address" icon="📍" />
              <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.6 }}>
                {profile.address}
              </div>
            </div>
          )}

          {/* ── Account Details ── */}
          <div style={{ background: "var(--color-background-secondary, #f8fafc)",
            borderRadius: 10, padding: "10px 12px" }}>
            <SectionHeader title="Account Details" icon="🏦" />
            <PRow label="Account No" value={profile.account_number} mono />
            <PRow label="Account Type" value={profile.account_type} />
            <PRow label="IFSC" value={profile.ifsc_code} mono />
            <PRow label="Opened On" value={profile.account_opened} />
            <PRow label="Last Txn" value={profile.last_txn_date} />
          </div>

          {/* ── Balance ── */}
          <div style={{
            background: "linear-gradient(135deg, #003087 0%, #0C447C 100%)",
            borderRadius: 10, padding: "12px 14px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)",
                fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Available Balance</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff",
                fontFamily: "monospace", marginTop: 2 }}>
                {profile.balance ?? "—"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>Branch</div>
              <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, maxWidth: 120,
                textAlign: "right", lineHeight: 1.3 }}>
                {profile.city ?? "—"}
              </div>
            </div>
          </div>

          {/* ── KYC Status ── */}
          <div style={{ background: kycBg, borderRadius: 10, padding: "10px 12px",
            border: kycStatus === "Expired" ? "1.5px solid #F09595" : "none" }}>
            <SectionHeader title="KYC Status" icon="✅" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: kycColor }}>{kycStatus}</div>
                {profile.kyc_mode && (
                  <div style={{ fontSize: 10, color: kycColor, marginTop: 2 }}>Mode: {profile.kyc_mode}</div>
                )}
              </div>
              {profile.kyc_expiry_date && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: kycColor }}>Expiry</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: kycColor }}>{profile.kyc_expiry_date}</div>
                </div>
              )}
            </div>
            {kycStatus === "Expired" && (
              <div style={{ marginTop: 8, fontSize: 10, color: "#A32D2D", fontWeight: 600,
                background: "rgba(163,45,45,0.08)", borderRadius: 6, padding: "5px 8px" }}>
                ⚠️ KYC expired — Re-KYC initiate karo pehle
              </div>
            )}
            {kycStatus === "Pending" && (
              <div style={{ marginTop: 8, fontSize: 10, color: "#854F0B", fontWeight: 600,
                background: "rgba(133,79,11,0.08)", borderRadius: 6, padding: "5px 8px" }}>
                🔶 KYC pending — documents collect karo
              </div>
            )}
          </div>

          {/* ── Linked Products ── */}
          <div style={{ background: "var(--color-background-secondary, #f8fafc)",
            borderRadius: 10, padding: "10px 12px" }}>
            <SectionHeader title="Linked Products" icon="🔗" />
            {profile.linked_accounts && (
              <div style={{ fontSize: 11, padding: "3px 0", color: "var(--color-text-primary)" }}>
                🏦 {profile.linked_accounts}
              </div>
            )}
            {profile.active_loans ? (
              <div style={{ fontSize: 11, padding: "3px 0", color: "var(--color-text-primary)" }}>
                💰 {profile.active_loans}
              </div>
            ) : (
              <div style={{ fontSize: 11, padding: "3px 0", color: "var(--color-text-secondary)" }}>💰 No active loans</div>
            )}
            {profile.active_fds ? (
              <div style={{ fontSize: 11, padding: "3px 0", color: "var(--color-text-primary)", display: "flex", gap: 5, alignItems: "center" }}>
                📈 {profile.active_fds}
                {profile.fd_maturing_soon && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px",
                    background: "#FAEEDA", color: "#854F0B", borderRadius: 4 }}>⏳ Maturing soon</span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 11, padding: "3px 0", color: "var(--color-text-secondary)" }}>📈 No FDs</div>
            )}
            {profile.debit_card && (
              <div style={{ fontSize: 11, padding: "3px 0", color: "var(--color-text-primary)" }}>💳 {profile.debit_card}</div>
            )}
            {profile.net_banking && (
              <div style={{ fontSize: 11, padding: "3px 0", color: "var(--color-text-primary)" }}>🌐 Net Banking: {profile.net_banking}</div>
            )}
            {profile.pmjdy_account && (
              <div style={{ fontSize: 10, padding: "3px 0", fontWeight: 600,
                color: "#0C447C", background: "#E6F1FB", borderRadius: 5, marginTop: 4, paddingLeft: 6 }}>
                🏛️ PM Jan Dhan Account
              </div>
            )}
          </div>

          {/* ── Nominee ── */}
          {profile.nominee_name && (
            <div style={{ background: "var(--color-background-secondary, #f8fafc)",
              borderRadius: 10, padding: "10px 12px" }}>
              <SectionHeader title="Nominee" icon="👨‍👩‍👧" />
              <PRow label="Name" value={profile.nominee_name} />
              <PRow label="Relation" value={profile.nominee_relation} />
            </div>
          )}

          {/* ── Risk & CIBIL ── */}
          <div style={{ background: "var(--color-background-secondary, #f8fafc)",
            borderRadius: 10, padding: "10px 12px" }}>
            <SectionHeader title="Risk & Credit" icon="📊" />
            {profile.risk_category && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Risk Category</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px",
                  background: riskBg, color: riskColor, borderRadius: 6 }}>
                  {profile.risk_category} Risk
                </span>
              </div>
            )}
            {profile.cibil_score && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>CIBIL Score</span>
                <span style={{
                  fontSize: 14, fontWeight: 800,
                  color: profile.cibil_score >= 750 ? "#0F6E56" : profile.cibil_score >= 650 ? "#854F0B" : "#A32D2D",
                }}>
                  {profile.cibil_score}
                  <span style={{ fontSize: 10, fontWeight: 400, color: "var(--color-text-secondary)", marginLeft: 4 }}>/900</span>
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
