import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "../../../context/AppContext";

// Phase → visual config
const PHASE_CONFIG = {
  greet: {
    icon: "🤝",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    label: "Welcome",
  },
  educate: {
    icon: "📚",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    label: "Explaining Service",
  },
  collect: {
    icon: "📋",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.08)",
    label: "Collecting Info",
  },
  verify: {
    icon: "📎",
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
    label: "Verifying Documents",
  },
  process: {
    icon: "✅",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.08)",
    label: "Processing",
  },
  close: {
    icon: "👋",
    color: "#64748b",
    bg: "rgba(100,116,139,0.08)",
    label: "Session Complete",
  },
};

// Priority map for sorting Still Needed checklist items
const PRIORITY_MAP = {
  customer_name: 1,
  purpose: 2,
  loan_type: 3,
  account_type: 3,
  update_type: 3,
  fd_type: 3,
  card_type: 3,
  account_number_provided: 3,
  phone_number_provided: 4,
  mobile_linked: 4,
  aadhaar_provided: 5,
  pan_provided: 5,
  address_proof_provided: 5,
  photos_provided: 5,
  aadhaar: 6,
  pan: 7,
  address_proof: 8,
  utility_bill: 8,
  photo: 9,
  passport_photos: 9,
};

function getItemPriority(item) {
  const key = item.key;
  if (PRIORITY_MAP[key] !== undefined) {
    return PRIORITY_MAP[key];
  }
  return 10; // other specific details/documents
}

const FIELD_LABELS = {
  // common
  customer_name: {
    label: "Customer Name",
    icon: "👤",
    hindi: "आपका नाम क्या है?",
  },
  purpose: {
    label: "Purpose",
    icon: "🎯",
    hindi: "यह खाता या लोन किस काम के लिए चाहिए?",
  },
  aadhaar_provided: {
    label: "Aadhaar",
    icon: "🪪",
    hindi: "क्या आप Aadhaar card लाए हैं?",
  },
  pan_provided: {
    label: "PAN Card",
    icon: "🆔",
    hindi: "क्या आपके पास PAN card है?",
  },
  address_proof_provided: {
    label: "Address Proof",
    icon: "📍",
    hindi: "क्या आपके पास address proof है — utility bill या Aadhaar?",
  },
  phone_number_provided: {
    label: "Phone Number",
    icon: "📱",
    hindi: "आपका registered mobile number क्या है?",
  },
  photos_provided: {
    label: "Passport Photos",
    icon: "📸",
    hindi: "क्या आप 2 passport size photos लाए हैं?",
  },
  // loan_enquiry
  loan_type: {
    label: "Loan Type",
    icon: "💰",
    hindi: "कौन सा लोन चाहिए — Home, Personal, Education, या Mudra?",
  },
  amount: { label: "Amount", icon: "₹", hindi: "कितनी राशि चाहिए आपको?" },
  tenure: {
    label: "Tenure",
    icon: "📅",
    hindi: "कितने साल या महीने के लिए चाहिए?",
  },
  monthly_income: {
    label: "Monthly Income",
    icon: "💵",
    hindi: "आपकी monthly income कितनी है?",
  },
  employment_type: {
    label: "Employment",
    icon: "💼",
    hindi: "आप Salaried हैं, Self-employed हैं, या Business करते हैं?",
  },
  cibil_score: {
    label: "CIBIL Score",
    icon: "📊",
    hindi: "क्या आपका CIBIL score pata है? (700+ ज़रूरी है)",
  },
  existing_emis: {
    label: "Existing EMIs",
    icon: "🔄",
    hindi: "अभी कोई और loan ki EMI तो नहीं चल रही?",
  },
  age: { label: "Age", icon: "🎂", hindi: "आपकी उम्र कितनी है?" },
  // account_opening
  account_type: {
    label: "Account Type",
    icon: "🏦",
    hindi: "कौन सा खाता चाहिए — Savings, Current, या Jan Dhan?",
  },
  pmjdy_eligible: {
    label: "PMJDY Eligible",
    icon: "🏛️",
    hindi: "क्या आप Jan Dhan (zero balance) खाता खोलना चाहते हैं?",
  },
  initial_deposit: {
    label: "Initial Deposit",
    icon: "💳",
    hindi: "खाता खोलने के लिए कितनी राशि जमा कराने हैं?",
  },
  nominee_name: {
    label: "Nominee",
    icon: "👨‍👩‍👧",
    hindi: "खाते में nominee का नाम क्या रखना है?",
  },
  // kyc_update
  update_type: {
    label: "Update Type",
    icon: "🔄",
    hindi: "क्या अपडेट करना है — पता, मोबाइल, आधार सीडिंग, या नॉमिनी?",
  },
  aadhaar_status: {
    label: "Aadhaar Status",
    icon: "📊",
    hindi: "क्या आपका Aadhaar bank account से link है?",
  },
  address_type: {
    label: "Address Type",
    icon: "🏠",
    hindi: "नया पता क्या है — बिजली बिल या आधार के साथ अपडेट करना है?",
  },
  mobile_linked: {
    label: "Mobile Linked",
    icon: "📱",
    hindi: "क्या आपका mobile number account से link है?",
  },
  re_kyc_due: {
    label: "Re-KYC Due",
    icon: "📅",
    hindi: "आपका रि-केवाईसी कब तक करना है?",
  },
  // fixed_deposit
  fd_type: {
    label: "FD Type",
    icon: "🏦",
    hindi: "रेगुलर FD चाहिए या स्वीप-इन FD?",
  },
  senior_citizen: {
    label: "Senior Citizen",
    icon: "👴",
    hindi:
      "क्या आप 60 साल या उससे ज़्यादा उम्र के हैं? (वरिष्ठ नागरिक दर मिलेगी)",
  },
  form_15g_applicable: {
    label: "Form 15G/15H",
    icon: "📄",
    hindi: "क्या आपकी आय कर योग्य नहीं है? फॉर्म 15G/15H जमा करना होगा।",
  },
  // card_services
  card_type: {
    label: "Card Type",
    icon: "💳",
    hindi: "कौन सा कार्ड चाहिए — RuPay, VISA, या Mastercard?",
  },
  card_issue: {
    label: "Card Issue",
    icon: "⚠️",
    hindi: "कार्ड के साथ क्या समस्या है?",
  },
  card_block_reason: {
    label: "Block Reason",
    icon: "🚫",
    hindi: "कार्ड क्यों ब्लॉक करना है — खोया, चोरी, या क्षतिग्रस्त?",
  },
  pin_issue: {
    label: "PIN Issue",
    icon: "🔢",
    hindi: "PIN भूल गए हैं या PIN रीसेट करना है?",
  },
  // balance_enquiry
  account_number_provided: {
    label: "Account Number",
    icon: "🏦",
    hindi: "आपका account number क्या है?",
  },
  identity_verified: {
    label: "Identity Verified",
    icon: "✅",
    hindi: "क्या आपकी identity verify हो गई — DOB या OTP?",
  },
};

const FIELD_EXPLANATIONS = {
  // common
  customer_name:
    "Customer's official name for legal bank account mapping and records.",
  purpose:
    "The underlying financial goal (account opening, loan, update) driving this interaction.",
  aadhaar_provided:
    "Mandatory biometrically-verified identity card for Aadhaar e-KYC validation.",
  pan_provided:
    "Government-issued tax identity card mandatory for high-value monitoring.",
  address_proof_provided:
    "Official utility bill or card verifying current residential location.",
  phone_number_provided:
    "Primary communication link for securing OTPs, SMS alerts, and mobile app login.",
  photos_provided:
    "Physical passport photos required for card indexing and physical ledger records.",
  // loan_enquiry
  loan_type:
    "Specifies the loan product category to calculate interest rates and options.",
  amount:
    "The target capital required, used to evaluate monthly repayment schedules.",
  tenure:
    "The repayment lifetime (in years/months) selected to structure monthly EMIs.",
  monthly_income:
    "Key parameter to evaluate debt-to-income ratio and repayment capabilities.",
  employment_type:
    "Identifies whether your income source is stable salary or self-employed cash flows.",
  cibil_score:
    "Credit bureau rating reflecting repayment history (700+ required for premium rates).",
  existing_emis:
    "Deducted from monthly earnings to calculate net surplus disposable income.",
  age: "Verifies compliance with minimum/maximum age limits and senior citizen bonuses.",
  // account_opening
  account_type:
    "Specifies savings or current account structures matching transactional needs.",
  pmjdy_eligible:
    "Determines eligibility for free zero-balance accounts under PM Jan Dhan Yojana.",
  initial_deposit:
    "The seed capital deposited to activate and fund the new account ledger.",
  nominee_name:
    "Designates a beneficiary to secure and easily transfer funds in case of emergency.",
  // kyc_update
  update_type:
    "Identifies whether address, phone number, nominee, or Aadhaar is being updated.",
  aadhaar_status:
    "Checks if Aadhaar card is successfully seeded for Direct Benefit Transfer (DBT) credits.",
  address_type:
    "Specifies local vs. permanent residential updates requiring relevant documents.",
  mobile_linked:
    "Verifies if active phone number is mapped to the customer's secure account profile.",
  re_kyc_due:
    "Indicates the regulatory deadline to update customer details with the bank.",
  // fixed_deposit
  fd_type:
    "Specifies the FD interest structure — reinvestment, monthly payout, or tax-saving.",
  senior_citizen:
    "Enables special senior citizen interest rate premium (+0.50% p.a.).",
  form_15g_applicable:
    "Tax declaration preventing TDS deduction for low-income or senior depositors.",
  // card_services
  card_type:
    "Specifies network preference (RuPay for domestic/UPI, Visa/Mastercard for global).",
  card_issue:
    "Diagnoses magnetic strip errors, chip damage, or network connectivity issues.",
  card_block_reason:
    "Provides the hotlisting trigger (theft, loss) to secure against fraud.",
  pin_issue: "Authenticates request to reset or issue a physical PIN envelope.",
  // balance_enquiry
  account_number_provided:
    "Unique customer account identifier required to fetch active balances.",
  identity_verified:
    "Security check using date-of-birth or OTP to prevent unauthorized access.",

  // documents (from docReadiness)
  aadhaar:
    "Mandatory biometrically-verified identity card for Aadhaar e-KYC validation.",
  pan: "Government-issued tax identity card mandatory for high-value monitoring.",
  utility_bill:
    "Official utility bill or card verifying current residential location.",
  address_proof:
    "Official utility bill or card verifying current residential location.",
  photo:
    "Physical passport photos required for card indexing and physical ledger records.",
  passport_photos:
    "Physical passport photos required for card indexing and physical ledger records.",
  salary_slip:
    "Official corporate salary receipt serving as primary income verification.",
  bank_statement:
    "Chronological cash flow record to analyze monthly bank statements and earnings.",
  itr: "Income Tax Returns proving stable tax-compliance and long-term earnings.",
  form16:
    "Employer-issued tax form validating annual salary breakdown and tax deductions.",
};

function getDocIcon(id) {
  const icons = {
    aadhaar: "🪪",
    pan: "🆔",
    address_proof: "📍",
    utility_bill: "🏠",
    photo: "📸",
    passport_photos: "📸",
    salary_slip: "💵",
    bank_statement: "📊",
    itr: "📄",
    form16: "📄",
  };
  return icons[id] || "📄";
}

const INTENT_SCHEMAS = {
  loan_enquiry: [
    "customer_name",
    "loan_type",
    "amount",
    "monthly_income",
    "employment_type",
    "tenure",
    "age",
    "cibil_score",
    "existing_emis",
    "purpose",
    "aadhaar_provided",
    "pan_provided",
  ],
  account_opening: [
    "customer_name",
    "account_type",
    "purpose",
    "initial_deposit",
    "nominee_name",
    "phone_number_provided",
    "aadhaar_provided",
    "pan_provided",
    "address_proof_provided",
    "photos_provided",
    "pmjdy_eligible",
  ],
  kyc_update: [
    "customer_name",
    "update_type",
    "aadhaar_status",
    "aadhaar_provided",
    "address_proof_provided",
    "address_type",
    "mobile_linked",
    "re_kyc_due",
  ],
  fixed_deposit: [
    "customer_name",
    "amount",
    "tenure",
    "fd_type",
    "senior_citizen",
    "pan_provided",
    "form_15g_applicable",
  ],
  card_services: [
    "customer_name",
    "card_type",
    "card_issue",
    "card_block_reason",
    "pin_issue",
    "phone_number_provided",
    "aadhaar_provided",
  ],
  balance_enquiry: [
    "customer_name",
    "account_number_provided",
    "phone_number_provided",
    "identity_verified",
  ],
  general: ["customer_name", "purpose", "phone_number_provided"],
};

function isFilled(val) {
  if (val === null || val === undefined || val === "" || val === false)
    return false;
  if (typeof val === "string" && val.toLowerCase() === "null") return false;
  return true;
}

function formatValue(key, val) {
  if (typeof val === "boolean") return val ? "✅ Provided" : "—";
  if (typeof val === "string") return val;
  return String(val);
}

export default function InfoTab({
  info = [],
  infoBoard,
  docReadiness,
  sendStaffApproved,
  sendMessage,
  sendForceNext,
  sendEditField,
  sendUndoNext,
  sendSaralForm,
}) {
  const nav = useApp((s) => s.navigatorState);
  const activeSession = useApp((s) => s.activeSession);
  const sessionId = activeSession?.id ?? activeSession?.session_id ?? null;

  const [sentKey, setSentKey] = useState(null); // track which question was just sent
  const [submitting, setSubmitting] = useState(false);
  const [sendingSaral, setSendingSaral] = useState(false);
  const [saralSent, setSaralSent] = useState(false);
  const [forcingNext, setForcingNext] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [editingKey, setEditingKey] = useState(null); // key of field being edited inline
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [skippingKey, setSkippingKey] = useState(null); // key of pending item being skipped
  // Post-ask inline edit in Ask Next card — shows after staff clicks "Ask This"
  const [postAskEditKey, setPostAskEditKey] = useState(null); // field key currently in post-ask edit mode
  const [postAskEditValue, setPostAskEditValue] = useState("");
  const [savingPostAsk, setSavingPostAsk] = useState(false);

  // Track history of asked field keys for Undo
  const questionHistoryRef = useRef([]);

  useEffect(() => {
    if (nav?.verification_submitted) {
      setSubmitting(false);
    }
  }, [nav?.verification_submitted]);

  const handleSendSaralForm = useCallback(() => {
    if (!sessionId) return;
    setSendingSaral(true);
    if (sendSaralForm) {
      sendSaralForm(sessionId);
    } else if (sendMessage) {
      sendMessage("send_to_saral_form", { session_id: sessionId });
    }
    setTimeout(() => {
      setSendingSaral(false);
      setSaralSent(true);
    }, 1200);
  }, [sessionId, sendSaralForm, sendMessage]);

  // Reset forcing/undo states when nav updates (backend responded)
  useEffect(() => {
    setForcingNext(false);
    setUndoing(false);
    setSkippingKey(null);
    // Clear post-ask edit if backend moved to a different field
    setPostAskEditKey((prev) => {
      if (prev && prev !== nav?.next_question?.key) return null;
      return prev;
    });
  }, [nav?.next_question?.key]);

  const handleSubmitVerification = useCallback(() => {
    if (!sessionId) {
      console.error("No active session ID found for verification submission.");
      return;
    }
    if (!sendMessage) {
      console.error("sendMessage function is missing.");
      return;
    }
    setSubmitting(true);
    sendMessage("submit_verification", { session_id: sessionId });
  }, [sessionId, sendMessage]);

  const handleAsk = useCallback(
    (questionHi, fieldKey) => {
      if (!sendStaffApproved) return;
      sendStaffApproved(questionHi, true);
      setSentKey(fieldKey);
      // Push to history for Undo
      if (fieldKey && fieldKey !== "__greet__" && fieldKey !== "__farewell__") {
        questionHistoryRef.current = [
          ...questionHistoryRef.current.slice(-9), // keep last 10
          fieldKey,
        ];
      }
      // After "Ask This" — show Edit option after 2.5s so staff can capture value manually
      if (fieldKey && fieldKey !== "__greet__" && fieldKey !== "__farewell__") {
        setTimeout(() => {
          setSentKey(null);
          setPostAskEditKey(fieldKey);
          setPostAskEditValue("");
        }, 2500);
      } else {
        setTimeout(() => setSentKey(null), 2500);
      }
    },
    [sendStaffApproved],
  );

  // Force advance to next question
  const handleForceNext = useCallback(() => {
    if (!sendForceNext) return;
    const currentKey = nav?.next_question?.key ?? null;
    setForcingNext(true);
    sendForceNext(currentKey);
    // Fallback: clear loading state after 4s in case backend doesn't respond
    setTimeout(() => setForcingNext(false), 4000);
  }, [sendForceNext, nav?.next_question?.key]);

  // Undo — go back to previous question
  const handleUndo = useCallback(() => {
    if (!sendUndoNext || !nav?.collected || nav.collected.length === 0) return;
    const lastField = nav.collected[nav.collected.length - 1];
    setUndoing(true);
    sendUndoNext(lastField?.key ?? null);
    setTimeout(() => setUndoing(false), 2000);
  }, [sendUndoNext, nav?.collected]);

  // Save post-ask manual value — saves the field and advances to next
  const handlePostAskSave = useCallback(() => {
    if (!postAskEditKey || !postAskEditValue.trim()) return;
    setSavingPostAsk(true);
    if (sendEditField) {
      sendEditField(postAskEditKey, postAskEditValue.trim());
    }
    // Advance to next question after saving
    setTimeout(() => {
      setSavingPostAsk(false);
      setPostAskEditKey(null);
      setPostAskEditValue("");
      if (sendForceNext) sendForceNext(postAskEditKey);
    }, 400);
  }, [postAskEditKey, postAskEditValue, sendEditField, sendForceNext]);

  // Cancel post-ask edit without saving
  const handlePostAskCancel = useCallback(() => {
    setPostAskEditKey(null);
    setPostAskEditValue("");
  }, []);

  // Skip a specific pending item
  const handleSkip = useCallback(
    (fieldKey) => {
      if (!sendForceNext) return;
      setSkippingKey(fieldKey);
      sendForceNext(fieldKey);
      setTimeout(() => setSkippingKey(null), 4000);
    },
    [sendForceNext],
  );

  // Start inline edit
  const handleEditStart = useCallback((fieldKey, currentValue) => {
    setEditingKey(fieldKey);
    setEditValue(
      typeof currentValue === "boolean"
        ? currentValue
          ? "Yes"
          : "No"
        : (currentValue ?? ""),
    );
  }, []);

  // Save inline edit
  const handleEditSave = useCallback(() => {
    if (!editingKey || !editValue.trim()) return;
    if (!sendEditField) {
      // Graceful: still optimistically update store if WS not wired
      console.warn("[InfoTab] sendEditField not provided");
      setEditingKey(null);
      return;
    }
    setSavingEdit(true);
    sendEditField(editingKey, editValue.trim());
    setTimeout(() => {
      setSavingEdit(false);
      setEditingKey(null);
      setEditValue("");
    }, 600);
  }, [editingKey, editValue, sendEditField]);

  // Cancel inline edit
  const handleEditCancel = useCallback(() => {
    setEditingKey(null);
    setEditValue("");
  }, []);

  // Parse fields dynamically using navigatorState or static schemas fallback
  const { filledFields, missingFields, completionPct } = useMemo(() => {
    // Keys to exclude from profile details if docReadiness exists
    // to avoid redundancy with the document checklist
    const duplicateDocKeys = new Set([
      "aadhaar_provided",
      "pan_provided",
      "address_proof_provided",
      "photos_provided",
    ]);

    // Priority 1: Use backend-supplied nav.collected and nav.missing if they exist
    if (nav && Array.isArray(nav.collected) && Array.isArray(nav.missing)) {
      const filled = nav.collected
        .filter((f) => !(docReadiness && duplicateDocKeys.has(f.key)))
        .map((f) => {
          const meta = FIELD_LABELS[f.key] || { label: f.label, icon: "📋" };
          return { key: f.key, val: f.value, ...meta };
        });

      const missing = nav.missing
        .filter((f) => !(docReadiness && duplicateDocKeys.has(f.key)))
        .map((f) => {
          const meta = FIELD_LABELS[f.key] || {
            label: f.label,
            icon: "📋",
            hindi: f.question_hi,
          };
          return { key: f.key, val: null, ...meta };
        });

      return {
        filledFields: filled,
        missingFields: missing,
        completionPct: nav.fill_percent ?? 0,
      };
    }

    // Priority 2: Fallback schema-aware logic when nav is not available
    if (!infoBoard?.collected_info) {
      return { filledFields: [], missingFields: [], completionPct: 0 };
    }

    const collectedInfo = infoBoard.collected_info;
    const filled = [];
    const missing = [];

    const activeIntent =
      nav?.intent ||
      infoBoard?.intent ||
      activeSession?.intent_detected ||
      activeSession?.intent ||
      "general";
    const normalizeIntent = (intent) => {
      if (!intent) return "general";
      const intentLower = intent.trim().toLowerCase();
      const mapping = {
        home_loan: "loan_enquiry",
        personal_loan: "loan_enquiry",
        education_loan: "loan_enquiry",
        vehicle_loan: "loan_enquiry",
        mudra_loan: "loan_enquiry",
        cibil_info: "general",
      };
      return mapping[intentLower] || intentLower;
    };
    const normalizedIntent = normalizeIntent(activeIntent);
    const schemaFields =
      INTENT_SCHEMAS[normalizedIntent] || INTENT_SCHEMAS.general;
    const schemaSet = new Set(schemaFields);

    // 1. Process all fields from the intent schema
    schemaFields.forEach((key) => {
      if (docReadiness && duplicateDocKeys.has(key)) {
        return; // Skip because docReadiness will handle it
      }
      const meta = FIELD_LABELS[key];
      if (!meta) return;

      const val = collectedInfo[key];
      if (isFilled(val)) {
        filled.push({ key, val, ...meta });
      } else {
        missing.push({ key, val: null, ...meta });
      }
    });

    // 2. Process any other keys in collectedInfo that are not in the schema (e.g. from previous intents)
    for (const [key, val] of Object.entries(collectedInfo)) {
      if (schemaSet.has(key)) {
        continue;
      }
      if (docReadiness && duplicateDocKeys.has(key)) {
        continue;
      }
      const meta = FIELD_LABELS[key];
      if (!meta) continue;

      if (isFilled(val)) {
        filled.push({ key, val, ...meta });
      }
    }

    const total = filled.length + missing.length;
    const pct = total > 0 ? Math.round((filled.length / total) * 100) : 0;

    return { filledFields: filled, missingFields: missing, completionPct: pct };
  }, [nav, infoBoard, docReadiness, activeSession]);

  // Combine still needed profile fields and unconfirmed documents
  const pendingItems = useMemo(() => {
    const list = [];

    // 1. Add remaining missing profile fields
    missingFields.forEach((f) => {
      list.push({
        type: "profile",
        key: f.key,
        label: f.label,
        icon: f.icon,
        hindi: f.hindi,
        required: true,
        explanation:
          FIELD_EXPLANATIONS[f.key] ||
          "Required to complete the customer's profile.",
      });
    });

    // 2. Add unconfirmed documents from docReadiness
    if (docReadiness && docReadiness.docs) {
      docReadiness.docs.forEach((doc) => {
        if (!doc.confirmed) {
          list.push({
            type: "document",
            key: doc.id,
            label: doc.label_en,
            icon: doc.icon || getDocIcon(doc.id),
            hindi: doc.label_hi
              ? `क्या आपके पास ${doc.label_hi} है?`
              : `क्या आपके पास ${doc.label_en} है?`,
            required: doc.required,
            explanation:
              FIELD_EXPLANATIONS[doc.id] ||
              `Required ${doc.required ? "mandatory" : "optional"} document for verification.`,
          });
        }
      });
    }

    // Sort items by priority so customer_name is first, then purpose, etc.
    list.sort((a, b) => getItemPriority(a) - getItemPriority(b));

    return list;
  }, [missingFields, docReadiness]);

  // Combine filled profile fields and confirmed documents
  const collectedItems = useMemo(() => {
    const list = [];

    // 1. Add filled profile fields (already filtered duplicates in filledFields)
    filledFields.forEach((f) => {
      list.push({
        type: "profile",
        key: f.key,
        label: f.label,
        icon: f.icon,
        val: f.val,
      });
    });

    // 2. Add confirmed documents from docReadiness
    if (docReadiness && docReadiness.docs) {
      docReadiness.docs.forEach((doc) => {
        if (doc.confirmed) {
          list.push({
            type: "document",
            key: doc.id,
            label: doc.label_en,
            icon: doc.icon || getDocIcon(doc.id),
            val: "Received",
          });
        }
      });
    }

    return list;
  }, [filledFields, docReadiness]);

  if (infoBoard || nav || docReadiness) {
    const phaseKey =
      nav?.phase ||
      (infoBoard?.conversation_stage === "ready_to_apply" ||
      infoBoard?.conversation_stage === "collecting"
        ? "collect"
        : infoBoard?.conversation_stage === "applying"
          ? "process"
          : infoBoard?.conversation_stage === "completed"
            ? "close"
            : infoBoard
              ? "educate"
              : null);
    const phaseConf = phaseKey
      ? PHASE_CONFIG[phaseKey] || PHASE_CONFIG.collect
      : null;

    // Navigator not yet arrived but infoBoard is here — show a warm waiting state
    // instead of a broken/empty panel. Navigator comes after the 2nd AI exchange.
    if (!nav && !phaseConf && !docReadiness && !infoBoard) {
      return (
        <div className="flex flex-col gap-3">
          {/* Progress bar from infoBoard */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span>👤</span>
                <span>Profile Completeness</span>
              </span>
              <span className="font-bold text-blue-600">
                {infoBoard.completion_percent ?? 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${infoBoard.completion_percent ?? 0}%`,
                  backgroundColor: "#3b82f6",
                }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "3px solid rgba(0,48,135,0.15)",
                borderTopColor: "#003087",
                animation: "vaani-spin 0.9s linear infinite",
              }}
            />
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--color-text-primary, #0f172a)" }}
            >
              Analyzing conversation...
            </p>
            <p
              className="text-[10px]"
              style={{ color: "var(--color-text-secondary, #64748b)" }}
            >
              Smart Navigator loads after first AI response
            </p>
          </div>
          <style>{`@keyframes vaani-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {/* Consolidated Phase & Progress Tracker Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col gap-3">
          {/* Phase Badge & Header */}
          {phaseConf && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/40 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: phaseConf.bg }}
                >
                  {phaseConf.icon}
                </span>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {phaseConf.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Active Session Phase
                  </div>
                </div>
              </div>
              <div
                className="text-[9px] font-bold px-2 py-0.5 rounded tracking-wider font-sans uppercase shrink-0"
                style={{
                  backgroundColor: phaseConf.bg,
                  color: phaseConf.color,
                }}
              >
                {phaseKey}
              </div>
            </div>
          )}

          {!nav && !infoBoard && (
            <div className="flex flex-col items-center justify-center py-3 gap-2 text-center border-t border-slate-200/40 dark:border-slate-800/60">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "3px solid rgba(0,48,135,0.15)",
                  borderTopColor: "#003087",
                  animation: "vaani-spin 0.9s linear infinite",
                }}
              />
              <p
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary, #0f172a)" }}
              >
                Analyzing conversation...
              </p>
              <p
                className="text-[10px]"
                style={{ color: "var(--text-secondary, #64748b)" }}
              >
                Smart Navigator loads after first AI response
              </p>
              <style>{`@keyframes vaani-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Profile Progress */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>👤</span>
                <span>Profile Completeness</span>
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {completionPct}%
              </span>
            </div>
            <div className="w-full bg-slate-200/60 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${completionPct}%`,
                  backgroundColor:
                    completionPct >= 75
                      ? "#22c55e"
                      : completionPct >= 40
                        ? "#f59e0b"
                        : "#3b82f6",
                }}
              />
            </div>
          </div>

          {/* Document Readiness Progress */}
          {docReadiness &&
            docReadiness.docs &&
            docReadiness.docs.length > 0 && (
              <div className="flex flex-col gap-1 border-t border-slate-200/40 dark:border-slate-800/60 pt-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>📎</span>
                    <span>Document Readiness</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {docReadiness.confirmed}/{docReadiness.total} •{" "}
                    {docReadiness.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/60 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${docReadiness.score}%`,
                      backgroundColor:
                        docReadiness.score >= 80
                          ? "#22c55e"
                          : docReadiness.score >= 40
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  />
                </div>
              </div>
            )}
        </div>

        {/* Auto Step Warning / Alert */}
        {infoBoard?.auto_step_completed && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl text-xs bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border border-green-200/50">
            <span>🤖</span>
            <span>
              Auto-completed: <strong>{infoBoard.auto_step_completed}</strong>
            </span>
          </div>
        )}

        {/* Dynamic State Guidance Panel */}
        {nav && (
          <div className="flex flex-col gap-2">
            {/* Phase: GREET */}
            {nav.phase === "greet" && (
              <div className="p-3 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/5 flex flex-col gap-2">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  🎤 Greeting Script
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {nav.greeting_script}
                </div>
                {sendStaffApproved && (
                  <button
                    onClick={() => handleAsk(nav.greeting_script, "__greet__")}
                    className={`mt-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 self-start shadow-sm transition-all duration-150 ${
                      sentKey === "__greet__"
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#003087] border-[#003087]/20 hover:border-[#003087]"
                    }`}
                  >
                    {sentKey === "__greet__" ? "✅ Sent!" : "🎤 Speak Greeting"}
                  </button>
                )}
              </div>
            )}

            {/* Phase: EDUCATE / COLLECT — Next Question */}
            {(nav.phase === "collect" || nav.phase === "educate") &&
              nav.next_question && (
                <div className="p-3 rounded-xl border border-cyan-200/60 dark:border-cyan-900/40 bg-cyan-50/20 dark:bg-cyan-950/5 flex flex-col gap-2">
                  <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                    <span>⏭️ Ask Next</span>
                    <span className="text-[9px] font-semibold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 px-1.5 py-0.5 rounded font-sans">
                      {nav.next_question.label}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed p-2.5 rounded-lg bg-cyan-100/30 dark:bg-cyan-950/20 border-l-4 border-cyan-500">
                    {nav.next_question.question_hi}
                  </div>
                  {/* Post-ask inline edit — shown after "Ask This" so staff can type the captured value */}
                  {postAskEditKey === nav.next_question.key && (
                    <div className="flex flex-col gap-2 mt-1 p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                      <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        ✏️ Voice didn't capture? Type manually:
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          autoFocus
                          placeholder={`Enter ${nav.next_question.label}...`}
                          value={postAskEditValue}
                          onChange={(e) => setPostAskEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handlePostAskSave();
                            if (e.key === "Escape") handlePostAskCancel();
                          }}
                          className="w-full text-xs rounded-lg px-2.5 py-1.5 border outline-none"
                          style={{
                            borderColor: "rgba(217,119,6,0.4)",
                            background: "var(--body-bg, #fff)",
                            color: "var(--text-primary)",
                          }}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handlePostAskCancel}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-none"
                            title="Cancel"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handlePostAskSave}
                            disabled={savingPostAsk || !postAskEditValue.trim()}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-700 text-white border-none disabled:opacity-50"
                            title="Save and move to next question"
                          >
                            {savingPostAsk ? "⏳" : "✓ Save & Next"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Action buttons row */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {/* Ask This — send question to customer */}
                    {sendStaffApproved &&
                      postAskEditKey !== nav.next_question.key && (
                        <button
                          onClick={() =>
                            handleAsk(
                              nav.next_question.question_hi,
                              nav.next_question.key,
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-150 ${
                            sentKey === nav.next_question.key
                              ? "bg-green-600 border-green-600 text-white"
                              : "bg-[#003087] hover:bg-[#002566] text-white border-transparent"
                          }`}
                          disabled={sentKey === nav.next_question.key}
                        >
                          {sentKey === nav.next_question.key
                            ? "✅ Sent!"
                            : "🎤 Ask This"}
                        </button>
                      )}
                    {/* Re-ask — visible only in post-ask edit mode */}
                    {postAskEditKey === nav.next_question.key &&
                      sendStaffApproved && (
                        <button
                          onClick={() => {
                            sendStaffApproved(
                              nav.next_question.question_hi,
                              true,
                            );
                            setSentKey(nav.next_question.key);
                            setTimeout(() => setSentKey(null), 2500);
                          }}
                          className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-sm bg-white dark:bg-slate-800 border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50"
                          title="Re-ask the same question again"
                        >
                          🔁 Re-ask
                        </button>
                      )}
                    {/* Next — force advance even if customer didn't answer clearly */}
                    {sendForceNext && (
                      <button
                        onClick={handleForceNext}
                        disabled={forcingNext}
                        title="Skip this question — advance to next field even if customer hasn't answered clearly"
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-150 ${
                          forcingNext
                            ? "bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-400 cursor-not-allowed"
                            : "bg-white dark:bg-slate-800 border-cyan-400 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
                        }`}
                      >
                        {forcingNext ? "⏳ Moving..." : "⏭️ Next"}
                      </button>
                    )}
                    {/* Undo — go back to previously asked question */}
                    {sendUndoNext && nav?.collected && nav.collected.length >= 1 && (
                      <button
                        onClick={handleUndo}
                        disabled={undoing}
                        title="Go back to the previous question"
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-150 ${
                          undoing
                            ? "bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-400 cursor-not-allowed"
                            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {undoing ? "⏳..." : "↩️ Undo"}
                      </button>
                    )}
                  </div>
                </div>
              )}

            {/* Phase: PROCESS */}
            {nav.phase === "process" && (
              <div
                className={`p-3 rounded-xl border flex flex-col gap-2 transition-all duration-300 ${
                  nav.verification_submitted
                    ? "border-green-200/60 dark:border-green-900/40 bg-green-50/20 dark:bg-green-950/5"
                    : "border-cyan-200/60 dark:border-cyan-900/40 bg-cyan-50/20 dark:bg-cyan-950/5"
                }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    nav.verification_submitted
                      ? "text-green-600 dark:text-green-400"
                      : "text-cyan-600 dark:text-cyan-400"
                  }`}
                >
                  {nav.verification_submitted
                    ? "🚀 Verification Started"
                    : "✅ Ready to Process"}
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {nav.verification_submitted
                    ? "The verification process has been successfully started on the customer panel. You can now close the session when finished."
                    : "All information collected. Please submit the data to start the automated verification process and notify the customer."}
                </div>
                {nav.verification_submitted ? (
                  <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                    <span>✅</span> Message & voice sent to customer panel!
                  </div>
                ) : (
                  sendMessage && (
                    <button
                      onClick={handleSubmitVerification}
                      className="mt-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 w-full shadow-sm transition-all duration-150"
                      disabled={submitting || !sessionId}
                    >
                      {submitting
                        ? "⏳ Submitting..."
                        : "🚀 Submit & Start Verification"}
                    </button>
                  )
                )}
              </div>
            )}

            {/* Phase: CLOSE */}
            {nav.phase === "close" && (
              <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/5 flex flex-col gap-2">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  👋 Farewell Script
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {nav.farewell_script}
                </div>
                {sendStaffApproved && (
                  <button
                    onClick={() =>
                      handleAsk(nav.farewell_script, "__farewell__")
                    }
                    className={`mt-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 self-start shadow-sm transition-all duration-150 ${
                      sentKey === "__farewell__"
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {sentKey === "__farewell__"
                      ? "✅ Sent!"
                      : "🎤 Speak Farewell"}
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* Unified STILL NEEDED Section */}
        <div className="flex flex-col gap-2">
          <div className={`text-xs font-bold flex items-center justify-between px-1 ${
            pendingItems.length > 0
              ? "text-amber-600 dark:text-amber-400"
              : "text-green-600 dark:text-green-400"
          }`}>
            <span className="flex items-center gap-1">
              <span>{pendingItems.length > 0 ? "⏳" : "✅"}</span>
              <span>
                {pendingItems.length > 0
                  ? `STILL NEEDED (${pendingItems.length})`
                  : "ALL ITEMS COLLECTED"}
              </span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase">
              {pendingItems.length > 0 ? "Action Required" : "Ready"}
            </span>
          </div>

          {pendingItems.length > 0 ? (
            <div className="space-y-2">
              {pendingItems.map((item) => {
                const isDoc = item.type === "document";
                return (
                  <div
                    key={item.key}
                    className="flex flex-col p-3 rounded-xl border transition-all duration-200 hover:shadow-sm"
                    style={{
                      borderColor: isDoc
                        ? "rgba(217, 119, 6, 0.15)"
                        : "rgba(59, 130, 246, 0.15)",
                      backgroundColor: isDoc
                        ? "rgba(217, 119, 6, 0.02)"
                        : "rgba(59, 130, 246, 0.02)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="text-base mt-0.5 shrink-0">
                          {item.icon}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {item.label}
                            </span>
                            <span
                              className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide font-sans shrink-0"
                              style={{
                                backgroundColor: isDoc
                                  ? "rgba(217, 119, 6, 0.1)"
                                  : "rgba(59, 130, 246, 0.1)",
                                color: isDoc ? "#d97706" : "#3b82f6",
                              }}
                            >
                              {isDoc ? "Doc" : "Profile"}
                            </span>
                            {item.required && (
                              <span className="text-[8px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 px-1.5 py-0.5 rounded font-sans shrink-0">
                                Required
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed italic">
                            💡 {item.explanation}
                          </span>
                        </div>
                      </div>

                      {sendStaffApproved && item.hindi && (
                        <div className="flex flex-col gap-1 shrink-0">
                          {/* Ask button */}
                          <button
                            onClick={() => handleAsk(item.hindi, item.key)}
                            className="p-1.5 rounded-lg border bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-colors flex items-center justify-center transition-all duration-150"
                            style={{
                              borderColor:
                                sentKey === item.key
                                  ? "#16a34a"
                                  : isDoc
                                    ? "rgba(217, 119, 6, 0.2)"
                                    : "rgba(59, 130, 246, 0.2)",
                              color:
                                sentKey === item.key
                                  ? "#16a34a"
                                  : isDoc
                                    ? "#d97706"
                                    : "#3b82f6",
                            }}
                            disabled={sentKey === item.key}
                            title={`Ask: "${item.hindi}"`}
                          >
                            {sentKey === item.key ? (
                              <span className="text-[10px] font-semibold">
                                ✅ Sent!
                              </span>
                            ) : (
                              <>
                                🎤{" "}
                                <span className="text-[10px] font-medium ml-1">
                                  Ask
                                </span>
                              </>
                            )}
                          </button>
                          {/* Skip button — force advance past this field */}
                          {sendForceNext && (
                            <button
                              onClick={() => handleSkip(item.key)}
                              disabled={skippingKey === item.key}
                              title="Skip this field — move to next"
                              className="p-1.5 rounded-lg border bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 shadow-sm transition-all duration-150 flex items-center justify-center"
                              style={{
                                borderColor:
                                  skippingKey === item.key
                                    ? "#94a3b8"
                                    : "rgba(100,116,139,0.25)",
                                color:
                                  skippingKey === item.key
                                    ? "#94a3b8"
                                    : "#64748b",
                              }}
                            >
                              {skippingKey === item.key ? (
                                <span className="text-[10px] font-semibold">
                                  ⏳
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium">
                                  ⏭️ Skip
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : completionPct < 100 ||
            (docReadiness && docReadiness.score < 100) ? (
            <div className="flex flex-col items-center justify-center p-5 text-center rounded-xl bg-amber-50/40 dark:bg-amber-950/5 border border-amber-200/30 gap-3">
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "2.5px solid rgba(217,119,6,0.15)",
                  borderTopColor: "#d97706",
                  animation: "vaani-spin 1s linear infinite",
                }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                  Processing Information...
                </span>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-500/60 leading-tight">
                  Extraction in progress for remaining {100 - completionPct}% of
                  profile.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center rounded-xl bg-green-50/50 dark:bg-green-950/10 border border-green-200/30 gap-3">
              <span className="text-2xl">🎉</span>
              <span className="text-xs font-semibold text-green-800 dark:text-green-400">
                All Items Collected!
              </span>
              <span className="text-[10px] text-green-600 dark:text-green-500/80">
                Ready to proceed to verification / processing.
              </span>
              {/* Saral Form verification button — visible in any phase once all items are collected */}
              {sessionId &&
                sendMessage &&
                (saralSent ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30 px-3 py-1.5 rounded-lg border border-green-200/50">
                    <span>✅</span> Saral Form sent to customer for
                    re-verification!
                  </div>
                ) : (
                  <button
                    onClick={handleSendSaralForm}
                    disabled={sendingSaral}
                    className="w-full px-3 py-2 rounded-lg bg-[#003087] hover:bg-[#002566] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all duration-150 disabled:opacity-60"
                  >
                    {sendingSaral
                      ? "⏳ Sending..."
                      : "📋 Send Saral Form for Re-Verification"}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Unified COLLECTED INFORMATION */}
        {collectedItems.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 px-1">
              <span>✅</span>
              <span>COLLECTED INFORMATION ({collectedItems.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {collectedItems.map((item) => {
                const isDoc = item.type === "document";
                const isEditing = editingKey === item.key;
                return (
                  <div
                    key={item.key}
                    className="flex items-center gap-2 p-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/60"
                  >
                    <span className="text-sm shrink-0">{item.icon}</span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate max-w-[70px]">
                          {item.label}
                        </span>
                        <span
                          className="text-[7px] font-extrabold px-1 rounded-sm uppercase shrink-0 font-sans"
                          style={{
                            backgroundColor: isDoc
                              ? "rgba(16, 185, 129, 0.1)"
                              : "rgba(59, 130, 246, 0.1)",
                            color: isDoc ? "#10b981" : "#3b82f6",
                          }}
                        >
                          {isDoc ? "Doc" : "Val"}
                        </span>
                      </div>
                      {/* Inline edit mode */}
                      {isEditing ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditSave();
                              if (e.key === "Escape") handleEditCancel();
                            }}
                            className="flex-1 min-w-0 text-xs rounded px-1.5 py-0.5 border outline-none"
                            style={{
                              borderColor: "rgba(0,48,135,0.3)",
                              background: "var(--body-bg, #f8fafc)",
                              color: "var(--text-primary)",
                              fontSize: "11px",
                            }}
                          />
                          <button
                            onClick={handleEditSave}
                            disabled={savingEdit || !editValue.trim()}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white border-none cursor-pointer shrink-0"
                            title="Save correction"
                          >
                            {savingEdit ? "⏳" : "✓"}
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-none cursor-pointer shrink-0"
                            title="Cancel"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {isDoc
                              ? "✓ Received"
                              : formatValue(item.key, item.val)}
                          </span>
                          {/* Edit pencil — only for non-doc profile fields */}
                          {!isDoc && sendEditField && (
                            <button
                              onClick={() =>
                                handleEditStart(item.key, item.val)
                              }
                              title="Correct voice capture error"
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                              style={{
                                color: "#94a3b8",
                                fontSize: "10px",
                                lineHeight: 1,
                              }}
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback: original static layout
  return (
    <div className="flex flex-col gap-2.5">
      {info.map((block, bi) => (
        <div
          key={bi}
          className="rounded-xl p-3"
          style={{ background: "var(--body-bg, #f8fafc)" }}
        >
          <div
            className="text-xs font-medium mb-2 uppercase tracking-wide"
            style={{
              color: "var(--text-secondary, #64748b)",
              letterSpacing: "0.4px",
            }}
          >
            {block.blockTitle}
          </div>
          {block.rows.map((row, ri) => (
            <div key={ri} className="flex justify-between items-center py-1">
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary, #64748b)" }}
              >
                {row.key}
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-primary, #0f172a)" }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
