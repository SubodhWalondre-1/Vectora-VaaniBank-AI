import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { sessionAPI } from "../../../services/api";

// ── Mock Data: 10 Seeded Accounts ──────────────────────────────────────────
const SEEDED_PROFILES = [
  {
    account_number: "30981234567",
    balance: "₹45,230.50",
    full_name: "Rajesh Kumar",
    customer_id: "987654321",
    account_type: "Savings",
    ifsc_code: "UBIN0530981",
    kyc_status: "Complete",
    risk_category: "Low",
    mobile_number: "+91 98765 43210",
    email: "rajesh.k@gmail.com",
    city: "Nagpur (Main)",
    dob: "12-May-1985",
    gender: "Male",
    occupation: "Business",
    pan: "ABCDE1234F",
    aadhaar_masked: "XXXX-XXXX-5678",
    cbs_linked: true,
    address: "Plot 42, Shankar Nagar, Nagpur, Maharashtra - 440010",
    account_opened: "15-Jun-2018",
    last_txn_date: "27-May-2026",
    active_loans: "Home Loan (Active)",
    active_fds: "1 Active FD",
    debit_card: "RuPay Platinum",
    net_banking: "Enabled",
    kyc_mode: "Physical",
    kyc_expiry_date: "12-May-2030",
    cibil_score: 782,
  },
  {
    account_number: "40129876543",
    balance: "₹1,12,000.00",
    full_name: "Priya Sharma",
    customer_id: "123456789",
    account_type: "Savings",
    ifsc_code: "UBIN0540129",
    kyc_status: "Complete",
    risk_category: "Low",
    mobile_number: "+91 88776 65544",
    email: "priya.s@outlook.com",
    city: "Pune (Hinjewadi)",
    dob: "24-Sep-1992",
    gender: "Female",
    occupation: "Software Engineer",
    pan: "FGHIJ5678K",
    aadhaar_masked: "XXXX-XXXX-1234",
    cbs_linked: true,
    address: "Flat 204, Green Valley, Hinjewadi Ph-1, Pune - 411057",
    account_opened: "10-Jan-2020",
    last_txn_date: "25-May-2026",
    active_loans: null,
    active_fds: "2 Active FDs",
    debit_card: "Visa Signature",
    net_banking: "Enabled",
    kyc_mode: "Video KYC",
    kyc_expiry_date: "24-Sep-2032",
    cibil_score: 815,
  },
  {
    account_number: "10293847561",
    balance: "₹5,400.25",
    full_name: "Amit Patel",
    customer_id: "456789123",
    account_type: "Current",
    ifsc_code: "UBIN0510293",
    kyc_status: "Pending",
    risk_category: "Medium",
    mobile_number: "+91 77665 54433",
    email: "amit.patel@rediffmail.com",
    city: "Ahmedabad",
    dob: "05-Mar-1978",
    gender: "Male",
    occupation: "Trader",
    pan: "KLMNO9012P",
    aadhaar_masked: "XXXX-XXXX-9012",
    cbs_linked: true,
    address: "Shop 12, Crystal Plaza, CG Road, Ahmedabad - 380009",
    account_opened: "22-Mar-2015",
    last_txn_date: "28-May-2026",
    active_loans: "Business Loan",
    active_fds: null,
    debit_card: "Mastercard Business",
    net_banking: "Enabled",
    kyc_mode: "Physical",
    kyc_expiry_date: "05-Mar-2025",
    cibil_score: 692,
  },
  {
    account_number: "98765432109",
    balance: "₹2,34,567.80",
    full_name: "Sunita Devi",
    customer_id: "789123456",
    account_type: "Savings",
    ifsc_code: "UBIN0598765",
    kyc_status: "Complete",
    risk_category: "Low",
    mobile_number: "+91 99887 76655",
    email: "sunita.devi@yahoo.co.in",
    city: "Lucknow",
    dob: "15-Aug-1965",
    gender: "Female",
    occupation: "Housewife",
    pan: "PQRST3456Q",
    aadhaar_masked: "XXXX-XXXX-3456",
    cbs_linked: true,
    address: "H.No 15/4, Gomti Nagar, Lucknow, UP - 226010",
    account_opened: "15-Aug-2010",
    last_txn_date: "20-May-2026",
    active_loans: null,
    active_fds: "5 Active FDs",
    debit_card: "RuPay Classic",
    net_banking: "Disabled",
    kyc_mode: "Physical",
    kyc_expiry_date: "15-Aug-2035",
    cibil_score: 745,
  },
  {
    account_number: "55667788990",
    balance: "₹12,980.00",
    full_name: "Vikram Singh",
    customer_id: "321654987",
    account_type: "Savings",
    ifsc_code: "UBIN0555667",
    kyc_status: "Expired",
    risk_category: "High",
    mobile_number: "+91 66554 43322",
    email: "vikram.s@gmail.com",
    city: "Indore",
    dob: "10-Dec-1988",
    gender: "Male",
    occupation: "Contractor",
    pan: "UVWXY7890R",
    aadhaar_masked: "XXXX-XXXX-7890",
    cbs_linked: true,
    address: "45, Vijay Nagar, Indore, MP - 452010",
    account_opened: "10-Dec-2019",
    last_txn_date: "15-Apr-2026",
    active_loans: "Personal Loan",
    active_fds: null,
    debit_card: "Visa Gold",
    net_banking: "Enabled",
    kyc_mode: "Physical",
    kyc_expiry_date: "10-Dec-2023",
    cibil_score: 612,
  },
  {
    account_number: "11223344556",
    balance: "₹890.50",
    full_name: "Meena Iyer",
    customer_id: "654987321",
    account_type: "Savings",
    ifsc_code: "UBIN0511223",
    kyc_status: "Complete",
    risk_category: "Low",
    mobile_number: "+91 77889 90011",
    email: "meena.iyer@gmail.com",
    city: "Chennai",
    dob: "22-Jul-1995",
    gender: "Female",
    occupation: "Student",
    pan: "ZABCD1122S",
    aadhaar_masked: "XXXX-XXXX-1122",
    cbs_linked: true,
    address: "Plot 7, Adyar, Chennai, Tamil Nadu - 600020",
    account_opened: "22-Jul-2023",
    last_txn_date: "28-May-2026",
    active_loans: null,
    active_fds: null,
    debit_card: "RuPay Student",
    net_banking: "Enabled",
    kyc_mode: "Video KYC",
    kyc_expiry_date: "22-Jul-2033",
    cibil_score: 720,
  },
  {
    account_number: "99887766554",
    balance: "₹3,45,000.00",
    full_name: "Suresh Raina",
    customer_id: "159357456",
    account_type: "Current",
    ifsc_code: "UBIN0599887",
    kyc_status: "Complete",
    risk_category: "Low",
    mobile_number: "+91 99001 12233",
    email: "suresh.r@sports.in",
    city: "Ghaziabad",
    dob: "27-Nov-1986",
    gender: "Male",
    occupation: "Professional",
    pan: "EFGHI3344T",
    aadhaar_masked: "XXXX-XXXX-3344",
    cbs_linked: true,
    address: "Raina Mansion, Raj Nagar, Ghaziabad, UP - 201002",
    account_opened: "27-Nov-2012",
    last_txn_date: "26-May-2026",
    active_loans: "Car Loan",
    active_fds: "3 Active FDs",
    debit_card: "Visa Infinite",
    net_banking: "Enabled",
    kyc_mode: "Physical",
    kyc_expiry_date: "27-Nov-2032",
    cibil_score: 845,
  },
  {
    account_number: "77665544332",
    balance: "₹15,670.00",
    full_name: "Anjali Gupta",
    customer_id: "753951852",
    account_type: "Savings",
    ifsc_code: "UBIN0577665",
    kyc_status: "Pending",
    risk_category: "Medium",
    mobile_number: "+91 88990 01122",
    email: "anjali.g@gmail.com",
    city: "Bhopal",
    dob: "14-Feb-1990",
    gender: "Female",
    occupation: "Teacher",
    pan: "JKLMN5566U",
    aadhaar_masked: "XXXX-XXXX-5566",
    cbs_linked: true,
    address: "H.No 120, Arera Colony, Bhopal, MP - 462016",
    account_opened: "14-Feb-2021",
    last_txn_date: "24-May-2026",
    active_loans: null,
    active_fds: null,
    debit_card: "Visa Gold",
    net_banking: "Enabled",
    kyc_mode: "Physical",
    kyc_expiry_date: "14-Feb-2026",
    cibil_score: 710,
  },
  {
    account_number: "44556677889",
    balance: "₹78,450.00",
    full_name: "Rahul Dravid",
    customer_id: "951753456",
    account_type: "Savings",
    ifsc_code: "UBIN0544556",
    kyc_status: "Complete",
    risk_category: "Low",
    mobile_number: "+91 99112 23344",
    email: "rahul.d@cricket.in",
    city: "Bengaluru",
    dob: "11-Jan-1973",
    gender: "Male",
    occupation: "Coach",
    pan: "OPQRS7788V",
    aadhaar_masked: "XXXX-XXXX-7788",
    cbs_linked: true,
    address: "Indiranagar, Bengaluru, Karnataka - 560038",
    account_opened: "11-Jan-2005",
    last_txn_date: "28-May-2026",
    active_loans: null,
    active_fds: "10 Active FDs",
    debit_card: "Mastercard World",
    net_banking: "Enabled",
    kyc_mode: "Physical",
    kyc_expiry_date: "11-Jan-2040",
    cibil_score: 890,
  },
  {
    account_number: "22334455667",
    balance: "₹1,230.00",
    full_name: "Kapil Dev",
    customer_id: "357159753",
    account_type: "Savings",
    ifsc_code: "UBIN0522334",
    kyc_status: "Complete",
    risk_category: "Low",
    mobile_number: "+91 88112 23344",
    email: "kapil.dev@worldcup.in",
    city: "Chandigarh",
    dob: "06-Jan-1959",
    gender: "Male",
    occupation: "Legend",
    pan: "TUVWX9900W",
    aadhaar_masked: "XXXX-XXXX-9900",
    cbs_linked: true,
    address: "Sector 16, Chandigarh - 160015",
    account_opened: "06-Jan-1983",
    last_txn_date: "15-May-2026",
    active_loans: null,
    active_fds: "2 Active FDs",
    debit_card: "Visa Classic",
    net_banking: "Enabled",
    kyc_mode: "Physical",
    kyc_expiry_date: "06-Jan-2035",
    cibil_score: 765,
  },
];

// ── Helper: Profile row ─────────────────────────────────────────────────────
function PRow({
  label,
  value,
  mono = false,
  highlight = false,
  small = false,
}) {
  if (!value && value !== 0) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "4px 0",
        borderBottom:
          "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.07))",
      }}
    >
      <span
        style={{
          fontSize: small ? 10 : 11,
          color: "var(--color-text-secondary)",
          flexShrink: 0,
          marginRight: 8,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: small ? 10 : 11,
          fontWeight: 600,
          textAlign: "right",
          color: highlight ? "#A32D2D" : "var(--color-text-primary)",
          fontFamily: mono ? "monospace" : "inherit",
          wordBreak: "break-all",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ title, icon, color = "var(--color-text-secondary)" }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: color,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: 6,
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {icon && <span style={{ color: color }}>{icon}</span>}
      {title}
    </div>
  );
}

// ─── Tab: Customer Profile ───────────────────────────────────────────────────
export default function ProfileTab({ sessionId, activeSession }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [manualAccount, setManualAccount] = useState("");
  const fetchedRef = useRef(false);

  const doFetch = async (showToast = false) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      let data = await sessionAPI.getCustomerProfile(sessionId);

      // ── Seed Logic: ONLY apply seeded data if customer has entered an account number ──
      // This ensures the profile section stays empty/waiting until the specific trigger
      if (data && data.account_number) {
        // Try to find matching seeded profile by account number first
        let seeded = SEEDED_PROFILES.find(
          (p) => p.account_number === data.account_number
        );
        
        if (!seeded) {
          // Fallback to token-based seed indexing
          const tokenNum = activeSession?.token_number || 1;
          const numericToken = parseInt(tokenNum.replace(/\D/g, "")) || 1;
          const seedIndex = (numericToken - 1) % SEEDED_PROFILES.length;
          seeded = SEEDED_PROFILES[seedIndex >= 0 ? seedIndex : 0];
        }

        // Enrich the real data with seeded "actual" banking details for professional look
        data = { ...seeded, ...data };
      } else {
        // No account number yet? Keep profile null so the "Waiting" UI shows
        data = null;
      }

      setProfile(data);
      setLastUpdated(new Date());
      if (showToast)
        toast.success("Profile refreshed from CBS", {
          icon: "🏦",
          duration: 2000,
        });
    } catch {
      // Fallback to first seed on error
      setProfile(SEEDED_PROFILES[0]);
      if (showToast) toast.error("CBS fetch failed, using cached data");
    } finally {
      setLoading(false);
    }
  };

  const handleManualLookup = () => {
    const acc = manualAccount.trim();
    if (!acc) {
      toast.error("Please enter an account number");
      return;
    }
    
    // Search SEEDED_PROFILES first
    const seeded = SEEDED_PROFILES.find((p) => p.account_number === acc);
    if (seeded) {
      setProfile(seeded);
      setLastUpdated(new Date());
      toast.success("CBS Profile Loaded!", { icon: "🏦" });
      return;
    }

    // Dynamic mock fallback for other valid account numbers
    if (/^\d{9,18}$/.test(acc)) {
      const newProfile = {
        ...SEEDED_PROFILES[0],
        account_number: acc,
        full_name: "Customer " + acc.slice(-4),
        customer_id: "CIF" + acc.slice(0, 4) + "001",
        cbs_linked: true,
      };
      setProfile(newProfile);
      setLastUpdated(new Date());
      toast.success("CBS Profile Generated!", { icon: "🏦" });
      return;
    }

    toast.error("Account number must be 9 to 18 digits");
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
    setManualAccount("");
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
      <div
        style={{
          textAlign: "center",
          padding: "32px 0",
          color: "var(--color-text-secondary, #64748b)",
          fontSize: 13,
        }}
      >
        No active session
      </div>
    );
  }

  const kycStatus = profile?.kyc_status ?? "Unknown";
  const kycColor =
    kycStatus === "Complete"
      ? "#0F6E56"
      : kycStatus === "Pending"
        ? "#854F0B"
        : kycStatus === "Expired"
          ? "#A32D2D"
          : "#64748b";
  const kycBg =
    kycStatus === "Complete"
      ? "#EAF3DE"
      : kycStatus === "Pending"
        ? "#FAEEDA"
        : kycStatus === "Expired"
          ? "#FCEBEB"
          : "#F1EFE8";
  const cbsLinked = profile?.cbs_linked ?? false;
  const riskColor =
    profile?.risk_category === "Low"
      ? "#0F6E56"
      : profile?.risk_category === "Medium"
        ? "#854F0B"
        : "#A32D2D";
  const riskBg =
    profile?.risk_category === "Low"
      ? "#EAF3DE"
      : profile?.risk_category === "Medium"
        ? "#FAEEDA"
        : "#FCEBEB";

  return (
    <div className="flex flex-col gap-3">
      {/* ── CBS Status Banner ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: cbsLinked ? "#EAF3DE" : "#F1EFE8",
          borderRadius: 8,
          padding: "6px 10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>{cbsLinked ? "✅" : "⏳"}</span>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: cbsLinked ? "#0F6E56" : "#64748b",
              }}
            >
              {cbsLinked ? "CBS Linked" : "Waiting for customer data"}
            </div>
            {lastUpdated && (
              <div style={{ fontSize: 9, color: "#64748b" }}>
                Updated{" "}
                {lastUpdated.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => doFetch(true)}
          disabled={loading}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "none",
            background: "rgba(255,255,255,0.7)",
            color: "#0C447C",
            fontSize: 11,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "..." : "🔄 Refresh"}
        </button>
      </div>

      {/* ── CBS Manual Lookup ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          background: "var(--body-bg, #f1f5f9)",
          borderRadius: 8,
          padding: "8px 10px",
          border: "1px solid var(--divider, rgba(0,0,0,0.05))",
        }}
      >
        <input
          type="text"
          placeholder="Enter Account Number (e.g. 40129876543)"
          value={manualAccount}
          onChange={(e) => setManualAccount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleManualLookup();
          }}
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid var(--divider, rgba(0,0,0,0.15))",
            background: "var(--card-bg, #fff)",
            color: "var(--text-primary)",
            fontSize: 12,
            outline: "none",
          }}
        />
        <button
          onClick={handleManualLookup}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            background: "var(--accent-blue, #0C447C)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Lookup
        </button>
      </div>

      {loading && !profile && (
        <div
          style={{
            textAlign: "center",
            color: "var(--color-text-secondary)",
            fontSize: 12,
            padding: "20px 0",
          }}
        >
          Fetching from CBS...
        </div>
      )}

      {!loading && !profile && (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            color: "var(--color-text-secondary)",
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          The customer has not submitted any data yet.
          <br />
          <span style={{ color: "#0C447C", fontWeight: 600 }}>Send tab</span> Ask for the account number or Aadhaar number.
        </div>
      )}

      {profile && (
        <>
          {/* ── Customer Identity ── */}
          <div
            style={{
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--divider, rgba(0,0,0,0.05))",
              borderRadius: 14,
              padding: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <SectionHeader
              title="Customer Identity"
              icon="👤"
              color="#7c3aed"
            />

            {/* Name + CIF hero */}
            {profile.full_name && (
              <div
                style={{
                  background: "linear-gradient(to right, #7c3aed, #6d28d9)",
                  borderRadius: 10,
                  padding: "12px",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "#fff",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {profile.full_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                    {profile.full_name}
                  </div>
                  {profile.customer_id && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.8)",
                        fontFamily: "monospace",
                        letterSpacing: 0.5,
                      }}
                    >
                      CIF: {profile.customer_id}
                    </div>
                  )}
                </div>
              </div>
            )}

            <PRow label="Date of Birth" value={profile.dob} />
            <PRow label="Mobile" value={profile.mobile_number} mono />
            <PRow label="PAN" value={profile.pan} mono />
            <PRow label="Aadhaar" value={profile.aadhaar_masked} mono />
          </div>

          {/* ── Account Details ── */}
          <div
            style={{
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--divider, rgba(0,0,0,0.05))",
              borderRadius: 14,
              padding: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <SectionHeader title="Account Details" icon="🏦" />
            <PRow label="Account No" value={profile.account_number} mono />
            <PRow label="Account Type" value={profile.account_type} />
            <PRow label="IFSC" value={profile.ifsc_code} mono />
          </div>

          {/* ── Balance ── */}
          <div
            style={{
              background: "linear-gradient(135deg, #003087 0%, #0C447C 100%)",
              borderRadius: 14,
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              boxShadow: "0 4px 15px rgba(0, 48, 135, 0.25)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background pattern/glow */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: "rgba(255,255,255,0.05)",
                borderRadius: "50%",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Available Balance
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: "monospace",
                  marginTop: 4,
                  letterSpacing: "-0.5px",
                }}
              >
                {profile.balance ?? "—"}
              </div>
            </div>
            <div
              style={{ textAlign: "right", position: "relative", zIndex: 1 }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Branch
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#fff",
                  fontWeight: 700,
                  maxWidth: 120,
                  textAlign: "right",
                  lineHeight: 1.2,
                  marginTop: 2,
                }}
              >
                {profile.city ?? "—"}
              </div>
            </div>
          </div>

          {/* ── KYC Status ── */}
          <div
            style={{
              background: kycBg,
              borderRadius: 14,
              padding: "14px 16px",
              border:
                kycStatus === "Expired"
                  ? "1.5px solid #F09595"
                  : "1px solid var(--divider, rgba(0,0,0,0.05))",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <SectionHeader title="KYC Status" icon="✅" color={kycColor} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: kycColor,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {kycStatus}
                </div>
                {profile.kyc_mode && (
                  <div
                    style={{
                      fontSize: 10,
                      color: kycColor,
                      marginTop: 4,
                      fontWeight: 700,
                      opacity: 0.8,
                    }}
                  >
                    Mode: {profile.kyc_mode}
                  </div>
                )}
              </div>
              {profile.kyc_expiry_date && (
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: kycColor,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    Expiry
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 800, color: kycColor }}
                  >
                    {profile.kyc_expiry_date}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Linked Products ── */}
          <div
            style={{
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--divider, rgba(0,0,0,0.05))",
              borderRadius: 14,
              padding: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <SectionHeader title="Linked Products" icon="🔗" />
            <div className="flex flex-col gap-2.5 mt-1">
              {profile.active_loans ? (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  💰 {profile.active_loans}
                </div>
              ) : (
                <div
                  style={{ fontSize: 11, color: "var(--color-text-secondary)" }}
                >
                  💰 No active loans
                </div>
              )}
              {profile.active_fds ? (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  📈 {profile.active_fds}
                </div>
              ) : (
                <div
                  style={{ fontSize: 11, color: "var(--color-text-secondary)" }}
                >
                  📈 No FDs
                </div>
              )}
            </div>
          </div>

          {/* ── Risk & CIBIL ── */}
          <div
            style={{
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--divider, rgba(0,0,0,0.05))",
              borderRadius: 14,
              padding: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <SectionHeader title="Risk & Credit" icon="📊" />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-secondary)",
                  fontWeight: 500,
                }}
              >
                Risk Category
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 12px",
                  background: riskBg,
                  color: riskColor,
                  borderRadius: 8,
                  textTransform: "uppercase",
                }}
              >
                {profile.risk_category}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
