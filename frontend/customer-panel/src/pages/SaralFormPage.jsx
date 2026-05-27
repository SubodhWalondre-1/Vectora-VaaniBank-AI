/* ============================================================
   VaaniBank AI — SaralForm Page
   Union Bank of India | Team Vectora
   URL: /saral-form

   Receives via React Router navigation state:
   { tokenNumber, sessionId, collectedData, intent, langCode }

   Flow:
     Step 1 → Review + edit all AI-pre-filled fields
     Step 2 → Draw signature on HTML5 canvas
     Submit → POST /forms/submit → navigate to /summary/:session_id
   ============================================================ */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Edit3,
  ArrowRight,
  RotateCcw,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { BRAND, API_BASE_URL } from "../constants";

// ── KYC Form Configuration ──────────────────────────────────────────────────
import {
  KYC_FIELD_LABELS,
  KYC_FIELD_OPTIONS,
  KYC_INTENT_FIELDS,
  KYC_SELECT_FIELDS,
  KYC_CHECKBOX_FIELDS,
} from "./KycForm";

import {
  ACCOUNT_FIELD_LABELS,
  ACCOUNT_FIELD_OPTIONS,
  ACCOUNT_INTENT_FIELDS,
  ACCOUNT_SELECT_FIELDS,
  ACCOUNT_CHECKBOX_FIELDS,
  ACCOUNT_FIELD_STATUS,
} from "./AccountForm";

import {
  LOAN_FIELD_LABELS,
  LOAN_FIELD_OPTIONS,
  LOAN_INTENT_FIELDS,
  LOAN_SELECT_FIELDS,
  LOAN_CHECKBOX_FIELDS,
  LOAN_FIELD_STATUS,
} from "./LoanForm";

import {
  CARD_FIELD_LABELS,
  CARD_FIELD_OPTIONS,
  CARD_INTENT_FIELDS,
  CARD_SELECT_FIELDS,
  CARD_CHECKBOX_FIELDS,
  CARD_FIELD_STATUS,
} from "./CardService";

// ── Inline keyframe for loader spinner ──────────────────────────────────────
const inlineKeyframes = `
  @keyframes loader-spin { to { transform: rotate(360deg); } }
`;

// ── Bilingual field label map — EN + 10 Indian languages ─────────────────────
// Each key maps exactly to a field name in session.collected_data.
// Labels shown in English (for bank staff context) AND customer language.
const FIELD_LABELS = {
  ...KYC_FIELD_LABELS,
  ...ACCOUNT_FIELD_LABELS,
  ...LOAN_FIELD_LABELS,
  ...CARD_FIELD_LABELS,
  customer_name: {
    en: "Customer Name",
    hi: "ग्राहक का नाम",
    mr: "ग्राहकाचे नाव",
    ta: "வாடிக்கையாளர் பெயர்",
    te: "కస్టమర్ పేరు",
    bn: "গ্রাহকের নাম",
    kn: "ಗ್ರಾಹಕರ ಹೆಸರು",
    gu: "ગ્રાહકનું નામ",
    pa: "ਗਾਹਕ ਦਾ ਨਾਮ",
    or: "ଗ୍ରାହକ ନାମ",
    ml: "ഉപഭോക്തൃ നാമം",
  },
  account_type: {
    en: "Account Type",
    hi: "खाता प्रकार",
    mr: "खाते प्रकार",
    ta: "கணக்கு வகை",
    te: "ఖాతా రకం",
    bn: "অ্যাকাউন্ট ধরন",
    kn: "ಖಾತೆ ಪ್ರಕಾರ",
    gu: "ખાતા પ્રકાર",
    pa: "ਖਾਤੇ ਦੀ ਕਿਸਮ",
    or: "ଖାତା ପ୍ରକାର",
    ml: "അക്കൗണ്ട് തരം",
  },
  loan_type: {
    en: "Loan Type",
    hi: "लोन प्रकार",
    mr: "कर्जाचा प्रकार",
    ta: "கடன் வகை",
    te: "రుణ రకం",
    bn: "ঋণের ধরন",
    kn: "ಸಾಲದ ಪ್ರಕಾರ",
    gu: "લોન પ્રકાર",
    pa: "ਕਰਜ਼ੇ ਦੀ ਕਿਸਮ",
    or: "ଋଣ ପ୍ରକାର",
    ml: "വായ്പ തരം",
  },
  amount: {
    en: "Amount (₹)",
    hi: "राशि",
    mr: "रक्कम",
    ta: "தொகை",
    te: "మొత్తం",
    bn: "পরিমাণ",
    kn: "ಮೊತ್ತ",
    gu: "રકમ",
    pa: "ਰਕਮ",
    or: "ପରିମାଣ",
    ml: "തുക",
  },
  tenure: {
    en: "Loan Tenure",
    hi: "अवधि",
    mr: "कालावधी",
    ta: "காலகட்டம்",
    te: "కాల వ్యవధి",
    bn: "মেয়াদ",
    kn: "ಅವಧಿ",
    gu: "મુદ્દત",
    pa: "ਮਿਆਦ",
    or: "ଅବଧି",
    ml: "കാലാവധി",
  },
  employment_type: {
    en: "Employment Type",
    hi: "रोजगार प्रकार",
    mr: "रोजगाराचा प्रकार",
    ta: "வேலைவாய்ப்பு வகை",
    te: "ఉద్యోగ రకం",
    bn: "কর্মসংস্থানের ধরন",
    kn: "ಉದ್ಯೋಗ ಪ್ರಕಾರ",
    gu: "રોજગાર પ્રકાર",
    pa: "ਰੁਜ਼ਗਾਰ ਦੀ ਕਿਸਮ",
    or: "ନିଯୁକ୍ତି ପ୍ରକାର",
    ml: "തൊഴിൽ തരം",
  },
  monthly_income: {
    en: "Monthly Income (₹)",
    hi: "मासिक आय",
    mr: "मासिक उत्पन्न",
    ta: "மாதாந்திர வருமானம்",
    te: "నెలవారీ ఆదాయం",
    bn: "মাসিক আয়",
    kn: "ಮಾಸಿಕ ಆದಾಯ",
    gu: "માસિક આવક",
    pa: "ਮਾਸਿਕ ਆਮਦਨ",
    or: "ମାସିକ ଆୟ",
    ml: "മാസ വരുമാനം",
  },
  age: {
    en: "Age",
    hi: "उम्र",
    mr: "वय",
    ta: "வயது",
    te: "వయస్సు",
    bn: "বয়স",
    kn: "ವಯಸ್ಸು",
    gu: "ઉંમર",
    pa: "ਉਮਰ",
    or: "ବୟସ",
    ml: "പ്രായം",
  },
  purpose: {
    en: "Purpose",
    hi: "उद्देश्य",
    mr: "उद्देश",
    ta: "நோக்கம்",
    te: "ఉద్దేశ్యం",
    bn: "উদ্দেশ্য",
    kn: "ಉದ್ದೇಶ",
    gu: "હેતુ",
    pa: "ਉਦੇਸ਼",
    or: "ଉଦ୍ଦେଶ୍ୟ",
    ml: "ഉദ്ദേശ്യം",
  },
  aadhaar_provided: {
    en: "Aadhaar Card",
    hi: "आधार कार्ड",
    mr: "आधार कार्ड",
    ta: "ஆதார் அட்டை",
    te: "ఆధార్ కార్డ్",
    bn: "আধার কার্ড",
    kn: "ಆಧಾರ್ ಕಾರ್ಡ್",
    gu: "આધાર કાર્ડ",
    pa: "ਆਧਾਰ ਕਾਰਡ",
    or: "ଆଧାର କାର୍ଡ",
    ml: "ആധാർ കാർഡ്",
  },
  pan_provided: {
    en: "PAN Card",
    hi: "पैन कार्ड",
    mr: "पॅन कार्ड",
    ta: "பான் கார்டு",
    te: "పాన్ కార్డ్",
    bn: "প্যান কার্ড",
    kn: "ಪ್ಯಾನ್ ಕಾರ್ಡ್",
    gu: "પાન કાર્ડ",
    pa: "ਪੈਨ ਕਾਰਡ",
    or: "ପ୍ୟାନ କାର୍ଡ",
    ml: "പാൻ കാർഡ്",
  },
  address_proof_provided: {
    en: "Address Proof",
    hi: "पता प्रमाण",
    mr: "पत्ता पुरावा",
    ta: "முகவரி சான்று",
    te: "చిరునామా రుజువు",
    bn: "ঠিকানার প্রমাণ",
    kn: "ವಿಳಾಸ ಪುರಾವೆ",
    gu: "સરનામાનો પુરાવો",
    pa: "ਪਤੇ ਦਾ ਸਬੂਤ",
    or: "ଠିକଣା ପ୍ରମାଣ",
    ml: "വിലാസ തെളിവ്",
  },
  phone_number_provided: {
    en: "Phone Number",
    hi: "मोबाइल नंबर",
    mr: "मोबाइल नंबर",
    ta: "மொபைல் எண்",
    te: "ఫోన్ నంబర్",
    bn: "ফোন নম্বর",
    kn: "ಫೋನ್ ಸಂಖ್ಯೆ",
    gu: "ફોન નંબર",
    pa: "ਫ਼ੋਨ ਨੰਬਰ",
    or: "ଫୋନ ନମ୍ବର",
    ml: "ഫോൺ നമ്പർ",
  },
  photos_provided: {
    en: "Passport Photos",
    hi: "पासपोर्ट फोटो",
    mr: "पासपोर्ट फोटो",
    ta: "புகைப்படங்கள்",
    te: "ఫోటోలు",
    bn: "পাসপোর্ট ফটো",
    kn: "ಫೋಟೋಗಳು",
    gu: "ફોટો",
    pa: "ਪਾਸਪੋਰਟ ਫੋਟੋ",
    or: "ଫଟୋ",
    ml: "ഫോട്ടോ",
  },
};

// ── Dropdown options for select fields ──────────────────────────────────────
const FIELD_OPTIONS = {
  ...KYC_FIELD_OPTIONS,
  ...ACCOUNT_FIELD_OPTIONS,
  ...LOAN_FIELD_OPTIONS,
  ...CARD_FIELD_OPTIONS,
  account_type: [
    { value: "savings", label: "Savings Account", label_hi: "बचत खाता" },
    { value: "current", label: "Current Account", label_hi: "चालू खाता" },
    {
      value: "jan_dhan",
      label: "Jan Dhan Account (PMJDY)",
      label_hi: "जन धन खाता (PMJDY)",
    },
    { value: "salary", label: "Salary Account", label_hi: "वेतन खाता" },
    {
      value: "nri",
      label: "NRI Account (NRE/NRO)",
      label_hi: "NRI खाता (NRE/NRO)",
    },
    {
      value: "fixed_deposit",
      label: "Fixed Deposit Account",
      label_hi: "सावधि जमा खाता",
    },
    { value: "recurring", label: "Recurring Deposit", label_hi: "आवर्ती जमा" },
  ],
  loan_type: [
    { value: "home_loan", label: "Home Loan", label_hi: "गृह ऋण" },
    {
      value: "personal_loan",
      label: "Personal Loan",
      label_hi: "व्यक्तिगत ऋण",
    },
    { value: "education_loan", label: "Education Loan", label_hi: "शिक्षा ऋण" },
    { value: "vehicle_loan", label: "Vehicle Loan", label_hi: "वाहन ऋण" },
    {
      value: "mudra_loan",
      label: "PM Mudra Loan (PMMY)",
      label_hi: "प्रधानमंत्री मुद्रा ऋण",
    },
    { value: "gold_loan", label: "Gold Loan", label_hi: "स्वर्ण ऋण" },
    {
      value: "business_loan",
      label: "Business Loan (MSME)",
      label_hi: "व्यवसाय ऋण (MSME)",
    },
    {
      value: "kisan_credit",
      label: "Kisan Credit Card (KCC)",
      label_hi: "किसान क्रेडिट कार्ड",
    },
  ],
  purpose: [
    {
      value: "account_opening",
      label: "Open a New Account",
      label_hi: "नया खाता खोलना",
    },
    {
      value: "loan_enquiry",
      label: "Apply for a Loan",
      label_hi: "ऋण के लिए आवेदन",
    },
    {
      value: "kyc_update",
      label: "KYC / Document Update",
      label_hi: "KYC / दस्तावेज़ अपडेट",
    },
    {
      value: "fixed_deposit",
      label: "Fixed / Recurring Deposit",
      label_hi: "सावधि / आवर्ती जमा",
    },
    {
      value: "card_services",
      label: "Debit / Credit Card Service",
      label_hi: "डेबिट / क्रेडिट कार्ड सेवा",
    },
    {
      value: "balance_enquiry",
      label: "Balance / Statement Enquiry",
      label_hi: "बैलेंस / स्टेटमेंट जानकारी",
    },
    {
      value: "fund_transfer",
      label: "Fund Transfer / NEFT / RTGS",
      label_hi: "फंड ट्रांसफर / NEFT / RTGS",
    },
    {
      value: "internet_banking",
      label: "Internet / Mobile Banking",
      label_hi: "इंटरनेट / मोबाइल बैंकिंग",
    },
    {
      value: "pension_services",
      label: "Pension / Government Scheme",
      label_hi: "पेंशन / सरकारी योजना",
    },
    {
      value: "locker_services",
      label: "Locker Services",
      label_hi: "लॉकर सेवा",
    },
    {
      value: "general_enquiry",
      label: "General Enquiry",
      label_hi: "सामान्य जानकारी",
    },
  ],
  employment_type: [
    {
      value: "salaried",
      label: "Salaried (Private)",
      label_hi: "वेतनभोगी (निजी)",
    },
    {
      value: "govt_employee",
      label: "Government Employee",
      label_hi: "सरकारी कर्मचारी",
    },
    {
      value: "self_employed",
      label: "Self-Employed / Business",
      label_hi: "स्व-रोजगार / व्यवसाय",
    },
    {
      value: "farmer",
      label: "Farmer / Agriculture",
      label_hi: "किसान / कृषि",
    },
    {
      value: "retired",
      label: "Retired / Pensioner",
      label_hi: "सेवानिवृत्त / पेंशनर",
    },
    { value: "student", label: "Student", label_hi: "छात्र" },
    { value: "homemaker", label: "Homemaker", label_hi: "गृहिणी" },
    {
      value: "unemployed",
      label: "Currently Unemployed",
      label_hi: "बेरोजगार",
    },
  ],
  fd_type: [
    {
      value: "regular_fd",
      label: "Regular Fixed Deposit",
      label_hi: "सामान्य FD",
    },
    {
      value: "tax_saver_fd",
      label: "Tax Saver FD (80C)",
      label_hi: "टैक्स सेवर FD (80C)",
    },
    { value: "sweep_in", label: "Sweep-in FD", label_hi: "स्वीप-इन FD" },
    {
      value: "union_suvidha",
      label: "Union Suvidha Deposit",
      label_hi: "यूनियन सुविधा डिपॉजिट",
    },
    {
      value: "senior_citizen_fd",
      label: "Senior Citizen FD (+0.5%)",
      label_hi: "वरिष्ठ नागरिक FD",
    },
  ],
  card_type: [
    {
      value: "rupay_debit",
      label: "RuPay Debit Card",
      label_hi: "रूपे डेबिट कार्ड",
    },
    {
      value: "visa_debit",
      label: "VISA Debit Card",
      label_hi: "VISA डेबिट कार्ड",
    },
    {
      value: "mastercard_debit",
      label: "Mastercard Debit",
      label_hi: "मास्टरकार्ड डेबिट",
    },
    {
      value: "rupay_credit",
      label: "RuPay Credit Card",
      label_hi: "रूपे क्रेडिट कार्ड",
    },
    {
      value: "visa_credit",
      label: "VISA Credit Card",
      label_hi: "VISA क्रेडिट कार्ड",
    },
    {
      value: "union_miles",
      label: "Union Miles Credit Card",
      label_hi: "यूनियन माइल्स क्रेडिट कार्ड",
    },
  ],
  update_type: [
    { value: "address_update", label: "Address Update", label_hi: "पता अपडेट" },
    {
      value: "mobile_update",
      label: "Mobile Number Update",
      label_hi: "मोबाइल नंबर अपडेट",
    },
    {
      value: "aadhaar_seeding",
      label: "Aadhaar Seeding (DBT)",
      label_hi: "आधार सीडिंग (DBT)",
    },
    {
      value: "nominee_update",
      label: "Nominee Update",
      label_hi: "नॉमिनी अपडेट",
    },
    { value: "email_update", label: "Email ID Update", label_hi: "ईमेल अपडेट" },
    { value: "re_kyc", label: "Re-KYC / Periodic Update", label_hi: "री-KYC" },
  ],
};

// ── Select fields (render as option grid, not text input) ────────────────────
const SELECT_FIELDS = new Set([
  ...Object.keys(FIELD_OPTIONS),
  ...KYC_SELECT_FIELDS,
  ...ACCOUNT_SELECT_FIELDS,
  ...LOAN_SELECT_FIELDS,
  ...CARD_SELECT_FIELDS,
]);
const CHECKBOX_FIELDS = new Set([
  "aadhaar_provided",
  "pan_provided",
  "address_proof_provided",
  "phone_number_provided",
  "photos_provided",
  ...KYC_CHECKBOX_FIELDS,
  ...ACCOUNT_CHECKBOX_FIELDS,
  ...LOAN_CHECKBOX_FIELDS,
  ...CARD_CHECKBOX_FIELDS,
]);

// ── Intent → required fields to always show (even if empty) ────────────────
const INTENT_FIELDS = {
  account_opening: ACCOUNT_INTENT_FIELDS,
  loan_enquiry: LOAN_INTENT_FIELDS,
  kyc_update: KYC_INTENT_FIELDS,
  card_services: CARD_INTENT_FIELDS,
  fixed_deposit: [
    "customer_name",
    "amount",
    "tenure",
    "fd_type",
    "senior_citizen",
    "pan_provided",
  ],
  card_services: [
    "customer_name",
    "card_type",
    "card_issue",
    "phone_number_provided",
    "aadhaar_provided",
  ],
  balance_enquiry: [
    "customer_name",
    "account_number_provided",
    "phone_number_provided",
  ],
  general: ["customer_name", "purpose", "phone_number_provided"],
};

// ── Intent → official form reference code ────────────────────────────────────
const FORM_REFS = {
  account_opening: "A-101",
  loan_enquiry: "LA-201",
  kyc_update: "KYC-07",
  card_services: "CS-301",
  fixed_deposit: "FD-501",
  balance_enquiry: "GQ-601",
  general: "GQ-601",
};

// ── Framer Motion variants ────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.35, staggerChildren: 0.06 },
  },
};
const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function SaralFormPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Receive state from navigate("/saral-form", { state: {...} }) ─────────
  const {
    tokenNumber = "N/A",
    sessionId = null,
    collectedData = {},
    intent = "general",
    langCode = "hi",
  } = location.state || {};

  // Derive form reference and short language code
  const formRef = FORM_REFS[intent] || "GQ-601";
  const shortLang = langCode.split("-")[0].toLowerCase();

  // ── Component state ───────────────────────────────────────────────────────
  const [step, setStep] = useState(1); // 1 = Review, 2 = Sign
  const [formValues, setFormValues] = useState({}); // editable field values
  const [openSelect, setOpenSelect] = useState(null); // which select field is expanded
  const [editingKey, setEditingKey] = useState(null); // which text field is in edit mode
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Canvas / signature refs ───────────────────────────────────────────────
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false); // whether pointer is currently down
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [hasSignature, setHasSignature] = useState(false);

  // ── Initialize form values from AI-collected data ──────────────────────────
  // Only populate fields that exist in FIELD_LABELS to avoid surfacing
  // internal keys (e.g. verification_submitted, completion_percent).
  useEffect(() => {
    const initial = {};
    Object.keys(FIELD_LABELS).forEach((key) => {
      const raw = collectedData[key];
      // Skip null / undefined / literal string "null" — don't show them as "null"
      if (raw === null || raw === undefined) return;
      const str = String(raw);
      if (str === "null" || str === "undefined" || str === "") return;
      initial[key] = str;
    });
    setFormValues(initial);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Bilingual label helper ─────────────────────────────────────────────────
  // Returns label in customer language, falls back to Hindi, then English.
  const getLabel = (fieldKey) => {
    const labels = FIELD_LABELS[fieldKey];
    if (!labels) return fieldKey;
    return labels[shortLang] || labels["hi"] || labels["en"];
  };

  // ── Option label helper ───────────────────────────────────────────────────
  // Handles both legacy string labels and new multi-language label objects.
  const getOptionLabel = (opt, lang = "en") => {
    if (!opt) return "";
    if (typeof opt.label === "string") return opt.label;
    if (typeof opt.label === "object") {
      return opt.label[lang] || opt.label["en"];
    }
    return String(opt.value);
  };

  const getOptionSubLabel = (opt, lang = "hi") => {
    if (!opt) return "";
    if (typeof opt.label === "object") {
      return opt.label[lang] || opt.label["hi"];
    }
    return opt.label_hi || "";
  };

  const getFieldStatusColor = (fieldKey) => {
    if (intent === "account_opening") {
      if (ACCOUNT_FIELD_STATUS.mandatory.includes(fieldKey)) return "#22c55e"; // 🟢 Green
      if (ACCOUNT_FIELD_STATUS.conditional.includes(fieldKey)) return "#eab308"; // 🟡 Yellow
      if (ACCOUNT_FIELD_STATUS.optional.includes(fieldKey)) return "#3b82f6"; // 🔵 Blue
    }
    if (intent === "loan_enquiry") {
      if (LOAN_FIELD_STATUS.mandatory.includes(fieldKey)) return "#22c55e"; // 🟢 Green
      if (LOAN_FIELD_STATUS.conditional.includes(fieldKey)) return "#eab308"; // 🟡 Yellow
      if (LOAN_FIELD_STATUS.optional.includes(fieldKey)) return "#3b82f6"; // 🔵 Blue
    }
    if (intent === "card_services") {
      if (CARD_FIELD_STATUS.mandatory.includes(fieldKey)) return "#22c55e"; // 🟢 Green
      if (CARD_FIELD_STATUS.conditional.includes(fieldKey)) return "#eab308"; // 🟡 Yellow
      if (CARD_FIELD_STATUS.optional.includes(fieldKey)) return "#3b82f6"; // 🔵 Blue
    }
    return null;
  };

  // ── Canvas: get pointer position (mouse OR touch) ─────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Use ratio to account for any mismatch between CSS size and internal canvas resolution
    // This handles high-DPI scaling and fractional layout sizes robustly.
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // ── Canvas: start drawing ─────────────────────────────────────────────────
  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e, canvas);
  }, []);

  // ── Canvas: draw stroke ───────────────────────────────────────────────────
  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#003087"; // Union Bank of India blue
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPosRef.current = pos;
    setHasSignature(true);
  }, []);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  // ── Canvas: clear signature ───────────────────────────────────────────────
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  // ── Resize canvas to its rendered CSS dimensions when step 2 mounts ───────
  // This prevents stretched/blurry signatures on high-DPI / mobile screens.
  useEffect(() => {
    if (step !== 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, [step]);

  // ── Submit form ───────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Guard: signature is mandatory
    if (!hasSignature) {
      toast.error("Please draw your signature before submitting.");
      return;
    }
    // Guard: session_id must be present
    if (!sessionId) {
      toast.error("Session ID missing. Please refresh.");
      return;
    }

    setIsSubmitting(true);

    // Export canvas as base64 PNG data URL
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL("image/png") : "";

    try {
      const response = await fetch(`${API_BASE_URL}/forms/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_number: tokenNumber,
          session_id: sessionId,
          form_ref: formRef,
          intent_detected: intent,
          confirmed_fields: formValues,
          signature_data_url: signatureDataUrl,
          language_code: shortLang,
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.detail || "Form submission failed.");

      toast.success("Form submitted! ✅", { duration: 1800 });

      // Redirect back to the live session so customer and staff can continue
      setTimeout(() => {
        navigate(`/session/${tokenNumber}`, { replace: true });
      }, 1500);
    } catch (err) {
      console.error("[SaralForm] Submit error:", err);
      toast.error(err.message || "Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  }, [
    hasSignature,
    sessionId,
    tokenNumber,
    formRef,
    intent,
    formValues,
    shortLang,
    navigate,
  ]);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      style={styles.page}
    >
      <style>{inlineKeyframes}</style>
      <div style={styles.container}>
        {/* ── STICKY HEADER ─────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <p style={styles.headerTitle}>SaralForm</p>
              <p style={styles.headerSubtitle}>
                Union Bank of India · {formRef}
              </p>
            </div>
            <div style={styles.tokenBadge}>
              <span style={styles.tokenText}>#{tokenNumber}</span>
            </div>
          </div>

          {/* Step progress indicator */}
          <div style={styles.stepper}>
            <div style={styles.stepperItem}>
              <div
                style={{ ...styles.stepperDot, backgroundColor: BRAND.blue }}
              >
                {step > 1 ? (
                  <CheckCircle2 size={14} color="#fff" />
                ) : (
                  <span style={styles.stepperNum}>1</span>
                )}
              </div>
              <span style={{ ...styles.stepperLabel, color: BRAND.blue }}>
                Review Fields
              </span>
            </div>

            <div
              style={{
                ...styles.stepperLine,
                backgroundColor: step >= 2 ? BRAND.blue : "var(--card-border)",
              }}
            />

            <div style={styles.stepperItem}>
              <div
                style={{
                  ...styles.stepperDot,
                  backgroundColor:
                    step >= 2 ? BRAND.blue : "var(--card-border)",
                }}
              >
                <span style={styles.stepperNum}>2</span>
              </div>
              <span
                style={{
                  ...styles.stepperLabel,
                  color: step >= 2 ? BRAND.blue : "var(--text-muted)",
                }}
              >
                Sign
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── ANIMATED STEP CONTENT ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* ── STEP 1: REVIEW FIELDS ──────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              style={styles.stepCard}
            >
              <p style={styles.stepHint}>
                Review your details. Tap any field to correct it before signing.
              </p>

              {/* ── Legend for Account Opening, Loan Enquiry & Card Services ── */}
              {(intent === "account_opening" ||
                intent === "loan_enquiry" ||
                intent === "card_services") && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 16,
                    padding: "8px 12px",
                    backgroundColor: "var(--body-bg)",
                    borderRadius: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                      }}
                    >
                      Mandatory
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#eab308",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                      }}
                    >
                      Conditional
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                      }}
                    >
                      Optional
                    </span>
                  </div>
                </div>
              )}

              {/* Render fields based on intent — dynamically filtered for KYC to show only relevant parts */}
              {(INTENT_FIELDS[intent] || INTENT_FIELDS.general)
                .filter((fieldKey) => {
                  // ── SMART FILTER FOR KYC UPDATE ──
                  // If it's a KYC update, only show fields that:
                  // 1. Are essential (Name, ID, Account No)
                  // 2. Already have a value (meaning AI heard them or they were pre-filled)
                  if (intent === "kyc_update") {
                    const isEssential = [
                      "customer_name",
                      "customer_id",
                      "account_no",
                    ].includes(fieldKey);
                    const hasValue =
                      collectedData[fieldKey] !== undefined &&
                      collectedData[fieldKey] !== null &&
                      String(collectedData[fieldKey]).trim() !== "" &&
                      String(collectedData[fieldKey]).toLowerCase() !== "null";

                    return isEssential || hasValue;
                  }
                  return true;
                })
                .map((fieldKey) => {
                  // Skip keys not in FIELD_LABELS (e.g. cibil_score, existing_emis not yet added)
                  if (!FIELD_LABELS[fieldKey]) return null;

                  const val = formValues[fieldKey];
                  const labelEN = FIELD_LABELS[fieldKey]?.en || fieldKey;
                  const labelLocal = getLabel(fieldKey);
                  const isEmpty = !val;

                  // ── Checkbox / document-provided fields ────────────────────
                  if (CHECKBOX_FIELDS.has(fieldKey)) {
                    const isChecked =
                      val === "true" ||
                      val === "yes" ||
                      val === "provided" ||
                      val === "1";
                    const statusColor = getFieldStatusColor(fieldKey);

                    return (
                      <div key={fieldKey} style={styles.fieldWrapper}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {statusColor && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: statusColor,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <p style={{ ...styles.fieldLabelEN, margin: 0 }}>
                            {labelEN}
                          </p>
                        </div>
                        <p style={styles.fieldLabelLocal}>{labelLocal}</p>
                        <div
                          style={styles.checkboxRow}
                          onClick={() =>
                            setFormValues((prev) => ({
                              ...prev,
                              [fieldKey]: isChecked ? "false" : "true",
                            }))
                          }
                        >
                          <div
                            style={{
                              ...styles.checkbox,
                              backgroundColor: isChecked
                                ? BRAND.blue
                                : "transparent",
                              borderColor: isChecked
                                ? BRAND.blue
                                : "var(--card-border)",
                            }}
                          >
                            {isChecked && (
                              <span style={{ color: "#fff", fontSize: 12 }}>
                                ✓
                              </span>
                            )}
                          </div>
                          <span style={styles.checkboxLabel}>
                            {isChecked ? "Provided ✓" : "Not provided"}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // ── Select / option-grid fields ─────────────────────────────
                  if (SELECT_FIELDS.has(fieldKey)) {
                    const options = FIELD_OPTIONS[fieldKey];
                    const selected = val;
                    const selOption = options.find((o) => o.value === selected);
                    const isOpen = openSelect === fieldKey;
                    const statusColor = getFieldStatusColor(fieldKey);

                    return (
                      <div
                        key={fieldKey}
                        style={{
                          ...styles.fieldWrapper,
                          borderColor: "var(--card-border)",
                          backgroundColor: "var(--card-bg)",
                          gap: 0,
                        }}
                      >
                        {/* ── Collapsed header row — always visible ── */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: "pointer",
                            userSelect: "none",
                            WebkitTapHighlightColor: "transparent",
                          }}
                          onClick={() =>
                            setOpenSelect(isOpen ? null : fieldKey)
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {statusColor && (
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: statusColor,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <div>
                              <p style={{ ...styles.fieldLabelEN, margin: 0 }}>
                                {labelEN}
                              </p>
                              <p
                                style={{
                                  ...styles.fieldLabelLocal,
                                  margin: "2px 0 0",
                                }}
                              >
                                {labelLocal}
                              </p>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexShrink: 0,
                            }}
                          >
                            {selOption && (
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: BRAND.blue,
                                  maxWidth: 140,
                                  textAlign: "right",
                                  lineHeight: 1.3,
                                }}
                              >
                                {getOptionLabel(selOption, shortLang)}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: 16,
                                color: "var(--text-muted)",
                                transition: "transform 0.2s",
                                transform: isOpen
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                                display: "inline-block",
                              }}
                            >
                              ⌄
                            </span>
                          </div>
                        </div>

                        {/* ── Expanded option list ── */}
                        {isOpen && (
                          <div
                            style={{
                              marginTop: 12,
                              display: "flex",
                              flexDirection: "column",
                              gap: 7,
                            }}
                          >
                            {options.map((opt) => {
                              const isSel = selected === opt.value;
                              return (
                                <div
                                  key={opt.value}
                                  style={{
                                    ...styles.optionChip,
                                    borderColor: isSel
                                      ? BRAND.blue
                                      : "var(--card-border)",
                                    backgroundColor: isSel
                                      ? BRAND.blue
                                      : "var(--body-bg)",
                                    color: isSel
                                      ? "#fff"
                                      : "var(--text-primary)",
                                  }}
                                  onClick={() => {
                                    setFormValues((prev) => ({
                                      ...prev,
                                      [fieldKey]: opt.value,
                                    }));
                                    setOpenSelect(null); // auto-close after selection
                                  }}
                                >
                                  <span style={styles.optionChipLabel}>
                                    {getOptionLabel(opt, shortLang)}
                                  </span>
                                  {shortLang !== "en" && (
                                    <span
                                      style={{
                                        ...styles.optionChipSub,
                                        color: isSel
                                          ? "rgba(255,255,255,0.75)"
                                          : "var(--text-muted)",
                                      }}
                                    >
                                      {getOptionSubLabel(opt, shortLang)}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ── Text / editable fields ─────────────────────────────────
                  const isEditing = editingKey === fieldKey;
                  const statusColor = getFieldStatusColor(fieldKey);

                  return (
                    <div
                      key={fieldKey}
                      style={{
                        ...styles.fieldWrapper,
                        borderColor: "var(--card-border)",
                        backgroundColor: "var(--card-bg)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {statusColor && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: statusColor,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <p style={{ ...styles.fieldLabelEN, margin: 0 }}>
                            {labelEN}
                          </p>
                        </div>
                      </div>
                      <p style={styles.fieldLabelLocal}>{labelLocal}</p>
                      <div style={styles.inputWrapper}>
                        {isEditing ? (
                          <input
                            autoFocus
                            type="text"
                            value={val || ""}
                            onChange={(e) =>
                              setFormValues((prev) => ({
                                ...prev,
                                [fieldKey]: e.target.value,
                              }))
                            }
                            onBlur={() => setEditingKey(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setEditingKey(null);
                            }}
                            style={{
                              ...styles.fieldInput,
                              borderBottom:
                                "2px solid var(--accent-blue, #003087)",
                              paddingBottom: 2,
                            }}
                            placeholder={`Enter ${labelEN}…`}
                          />
                        ) : (
                          <span
                            style={{
                              ...styles.fieldInput,
                              cursor: "text",
                              color: val ? "var(--text-primary)" : "#ef4444",
                            }}
                            onClick={() => setEditingKey(fieldKey)}
                          >
                            {val || `Tap to enter ${labelEN}`}
                          </span>
                        )}
                        <Edit3
                          size={16}
                          color={
                            isEditing
                              ? "var(--accent-blue, #003087)"
                              : isEmpty
                                ? "#ef4444"
                                : "var(--text-muted)"
                          }
                          style={{
                            flexShrink: 0,
                            cursor: "pointer",
                            padding: 2,
                          }}
                          onClick={() =>
                            setEditingKey(isEditing ? null : fieldKey)
                          }
                        />
                      </div>
                    </div>
                  );
                })}

              {/* Proceed to Sign button */}
              <motion.div
                style={styles.proceedBtn}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
              >
                <span style={styles.proceedBtnText}>
                  Looks Good — Proceed to Sign
                </span>
                <ArrowRight size={18} color="#fff" />
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 2: SIGNATURE ─────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              style={styles.stepCard}
            >
              <p style={styles.stepHint}>
                Sign below using your finger or stylus.
              </p>
              <p
                style={{
                  ...styles.stepHint,
                  fontStyle: "italic",
                  color: "var(--text-muted)",
                }}
              >
                यहाँ अपना हस्ताक्षर करें
              </p>

              {/* Signature canvas */}
              <div style={styles.canvasWrapper}>
                <canvas
                  ref={canvasRef}
                  style={styles.canvas}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {/* Placeholder text shown before any stroke */}
                {!hasSignature && (
                  <p style={styles.canvasPlaceholder}>
                    Sign here / यहाँ हस्ताक्षर करें
                  </p>
                )}
              </div>

              {/* Canvas controls: clear + back */}
              <div style={styles.canvasControls}>
                <motion.div
                  style={styles.clearBtn}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearSignature}
                >
                  <RotateCcw size={14} color="var(--text-secondary)" />
                  <span style={styles.clearBtnText}>Clear</span>
                </motion.div>

                <motion.div
                  style={styles.backBtn}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                >
                  <span style={styles.clearBtnText}>← Back to Review</span>
                </motion.div>
              </div>

              {/* Submit button — disabled until signature drawn */}
              <motion.div
                style={{
                  ...styles.submitBtn,
                  opacity: hasSignature && !isSubmitting ? 1 : 0.5,
                  cursor:
                    hasSignature && !isSubmitting ? "pointer" : "not-allowed",
                }}
                whileTap={hasSignature && !isSubmitting ? { scale: 0.97 } : {}}
                onClick={
                  hasSignature && !isSubmitting ? handleSubmit : undefined
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={20}
                      color="#fff"
                      style={{ animation: "loader-spin 0.8s linear infinite" }}
                    />
                    <span style={styles.submitBtnText}>Submitting…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} color="#fff" />
                    <span style={styles.submitBtnText}>
                      Submit Signed Form ✓
                    </span>
                  </>
                )}
              </motion.div>

              <p style={styles.securityNote}>
                🔒 Your signature is encrypted and stored per RBI guidelines
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLES — inline style objects (no Tailwind dependency)
// ══════════════════════════════════════════════════════════════════════════════

const styles = {
  page: {
    width: "100%",
    height: "100%",
    backgroundColor: "var(--body-bg)",
    display: "flex",
    justifyContent: "center",
    padding: "0 0 48px 0",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
  },
  container: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    flexDirection: "column",
  },

  // Header
  header: {
    backgroundColor: "var(--card-bg)",
    borderBottom: "1px solid var(--card-border)",
    padding: "16px 16px 0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "var(--accent-blue, #003087)",
    margin: 0,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-muted)",
    margin: "2px 0 0",
  },
  tokenBadge: {
    padding: "4px 12px",
    borderRadius: 20,
    backgroundColor: "var(--badge-bg)",
    border: "1px solid var(--card-border)",
  },
  tokenText: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    fontFamily: "'Inter', monospace",
  },

  // Stepper
  stepper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 14,
  },
  stepperItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  stepperDot: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperNum: { fontSize: 12, fontWeight: 700, color: "#fff" },
  stepperLine: {
    width: 60,
    height: 2,
    borderRadius: 1,
    margin: "0 8px",
    marginBottom: 20,
  },
  stepperLabel: { fontSize: 11, fontWeight: 600 },

  // Step card
  stepCard: {
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  stepHint: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.5,
  },

  // Field cards
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 14px",
    borderRadius: 12,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
  },
  fieldLabelEN: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: 0,
  },
  fieldLabelLocal: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-muted)",
    margin: 0,
  },
  inputWrapper: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
  fieldInput: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: 0,
  },

  // Checkbox fields
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    cursor: "pointer",
    userSelect: "none",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-secondary)",
  },

  // Proceed button
  proceedBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "16px 20px",
    borderRadius: 14,
    backgroundColor: "var(--accent-blue, #003087)",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 2px 12px rgba(0,48,135,0.2)",
    marginTop: 8,
  },
  proceedBtnText: { fontSize: 15, fontWeight: 600, color: "#fff" },

  // Canvas / signature
  canvasWrapper: {
    position: "relative",
    width: "100%",
    height: 220,
    borderRadius: 14,
    border: "2px dashed rgba(0,48,135,0.25)",
    backgroundColor: "var(--card-bg)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    cursor: "default",
    touchAction: "none",
  },
  canvasPlaceholder: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-muted)",
    pointerEvents: "none",
    textAlign: "center",
    userSelect: "none",
  },
  canvasControls: { display: "flex", gap: 12, justifyContent: "center" },
  clearBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 10,
    backgroundColor: "var(--badge-bg)",
    border: "1px solid var(--card-border)",
    cursor: "pointer",
    userSelect: "none",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 10,
    backgroundColor: "var(--badge-bg)",
    border: "1px solid var(--card-border)",
    cursor: "pointer",
    userSelect: "none",
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-secondary)",
  },

  // Submit button
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "16px 20px",
    borderRadius: 14,
    backgroundColor: "#16A34A",
    userSelect: "none",
    boxShadow: "0 2px 12px rgba(22,163,74,0.25)",
    marginTop: 4,
  },
  submitBtnText: { fontSize: 15, fontWeight: 700, color: "#fff" },
  securityNote: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-muted)",
    textAlign: "center",
    margin: 0,
  },

  // Option grid (select fields)
  optionGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 10,
  },
  optionChip: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid",
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    transition: "all 0.15s ease",
  },
  optionChipLabel: { fontSize: 14, fontWeight: 600, lineHeight: 1.3 },
  optionChipSub: { fontSize: 11, fontWeight: 400, lineHeight: 1.2 },
};
