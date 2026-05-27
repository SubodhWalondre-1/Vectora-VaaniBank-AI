/* ============================================================
   VaaniBank AI — Account Opening Form Configuration
   Union Bank of India | Team Vectora
   ============================================================ */

// ── Account Opening Field Labels ─────────────────────────────────────────────
export const ACCOUNT_FIELD_LABELS = {
  // Part 1: Applicant & KYC Details
  title: { en: "Title", hi: "शीर्षक" },
  customer_name: {
    en: "Full Name",
    hi: "पूरा नाम",
    mr: "पूर्ण नाव",
    ta: "முழு பெயர்",
    te: "పూర్తి పేరు",
    bn: "পুরো নাম",
    kn: "ಪೂರ್ಣ ಹೆಸರು",
    gu: "પૂરું નામ",
    pa: "ਪੂਰਾ ਨਾਮ",
    or: "ପୁରା ନାମ",
    ml: "പൂർണ്ണനാമം",
  },
  maiden_name: { en: "Maiden Name", hi: "विवाह पूर्व नाम" },
  dob: {
    en: "Date of Birth",
    hi: "जन्म तिथि",
    mr: "जन्म तारीख",
    ta: "பிறந்த தேதி",
    te: "పుట్టిన తేదీ",
    bn: "জন্ম তারিখ",
    kn: "ಹುಟ್ಟಿದ ದಿನಾಂక",
    gu: "જન્મ તારીખ",
    pa: "ਜਨਮ ਮਿતી",
    or: "ଜନ୍ମ ତାରିଖ",
    ml: "ജനന തീയതി",
  },
  gender: {
    en: "Gender",
    hi: "लिंग",
    mr: "लिंग",
    ta: "பாலினம்",
    te: "లింగం",
    bn: "লিঙ্গ",
    kn: "ಲಿಂಗ",
    gu: "લિંગ",
    pa: "ਲਿੰਗ",
    or: "ଲିଙ୍ଗ",
    ml: "ലിംഗഭേദം",
  },
  marital_status: {
    en: "Marital Status",
    hi: "वैवाहिक स्थिति",
    mr: "वैवाहिक स्थिती",
    ta: "திருமண நிலை",
    te: "వైవాహిక స్థితి",
    bn: "বৈবাহিক অবস্থা",
    kn: "ವೈವಾಹಿಕ ಸ್ಥಿತಿ",
    gu: "વૈવાહિક સ્થિતિ",
    pa: "ਵਿਆਹੁਤਾ ਸਥਿਤੀ",
    or: "ବୈବାହିକ ସ୍ଥିତି",
    ml: "വൈവാഹിക നില",
  },

  father_name: {
    en: "Father's Name",
    hi: "पिता का नाम",
    mr: "वडिलांचे नाव",
    ta: "தந்தையின் பெயர்",
    te: "తండ్రి పేరు",
    bn: "পিতার নাম",
    kn: "ತಂದೆಯ ಹೆಸರು",
    gu: "પિતાનું નામ",
    pa: "ਪਿਤਾ ਦਾ ਨਾਮ",
    or: "ପିତାଙ୍କ ନାମ",
    ml: "പിതാവിന്റെ പേര്",
  },
  mother_name: {
    en: "Mother's Name",
    hi: "माता का नाम",
    mr: "आईचे नाव",
    ta: "தாயின் பெயர்",
    te: "తల్లి పేరు",
    bn: "মাতার নাম",
    kn: "ತಾಯಿಯ ಹೆಸರು",
    gu: "માતાનું નામ",
    pa: "ਮਾਤਾ ਦਾ ਨਾਮ",
    or: "ମାତାଙ୍କ ନାମ",
    ml: "മാതാവിന്റെ പേര്",
  },
  spouse_name: { en: "Spouse's Name", hi: "पति/पत्नी का नाम" },

  pan_no: { en: "PAN Number", hi: "पैन नंबर" },
  aadhaar_no: { en: "Aadhaar Number", hi: "आधार नंबर" },
  form_60_required: { en: "Form 60 Declaration", hi: "फॉर्म 60 घोषणा" },

  nationality: { en: "Nationality", hi: "राष्ट्रीयता" },
  religion: { en: "Religion", hi: "धर्म" },
  category: { en: "Category (Gen/OBC/SC/ST)", hi: "श्रेणी" },
  education: { en: "Educational Qualification", hi: "शैक्षिक योग्यता" },
  occupation_type: { en: "Occupation Type", hi: "व्यवसाय का प्रकार" },

  annual_income_bracket: { en: "Annual Income Bracket", hi: "वार्षिक आय वर्ग" },
  net_worth: { en: "Net Worth", hi: "कुल संपत्ति" },
  is_pep: {
    en: "Politically Exposed Person (PEP)",
    hi: "राजनीतिक रूप से उजागर व्यक्ति",
  },

  current_address: {
    en: "Current/Communication Address",
    hi: "वर्तमान/पत्राचार का पता",
  },
  permanent_address: { en: "Permanent Address", hi: "स्थायी पता" },

  mobile_no: { en: "Mobile Number", hi: "मोबाइल नंबर" },
  email_id: { en: "Email ID", hi: "ईमेल आईडी" },

  // Part 2: Account Type & Services
  account_type: { en: "Type of Account", hi: "खाते का प्रकार" },
  mode_of_operation: { en: "Mode of Operation", hi: "परिचालन का तरीका" },

  atm_card_required: { en: "ATM-cum-Debit Card", hi: "एटीएम-सह-डेबिट कार्ड" },
  name_on_card: {
    en: "Name to be printed on Card",
    hi: "कार्ड पर छपने वाला नाम",
  },
  cheque_book_required: {
    en: "Cheque Book Required",
    hi: "चेक बुक की आवश्यकता है",
  },

  internet_banking: { en: "Internet Banking", hi: "इंटरनेट बैंकिंग" },
  mobile_banking: {
    en: "Mobile Banking (Vyom App)",
    hi: "मोबाइल बैंकिंग (व्योम ऐप)",
  },
  phone_banking: { en: "Phone Banking", hi: "फोन बैंकिंग" },

  sms_alerts: { en: "SMS Alerts", hi: "एसएमएस अलर्ट" },
  physical_passbook: { en: "Physical Passbook", hi: "भौतिक पासबुक" },
  e_statement: { en: "Monthly e-Statements", hi: "मासिक ई-स्टेटमेंट" },

  // Part 3: Nomination & Declarations
  nomination_required: {
    en: "Register Nominee (DA-1)",
    hi: "नामांकित व्यक्ति पंजीकृत करें",
  },
  nominee_name: { en: "Nominee's Name", hi: "नामांकित व्यक्ति का नाम" },
  nominee_relationship: {
    en: "Relationship to Applicant",
    hi: "आवेदक से संबंध",
  },
  nominee_age: { en: "Nominee's Age", hi: "नामांकित व्यक्ति की आयु" },
  nominee_address: { en: "Nominee's Address", hi: "नामांकित व्यक्ति का पता" },
  is_minor: {
    en: "Is Nominee a Minor?",
    hi: "क्या नामांकित व्यक्ति नाबालिग है?",
  },
  guardian_details: {
    en: "Guardian Details (if minor)",
    hi: "अभिभावक का विवरण",
  },

  fatca_declaration: { en: "FATCA / CRS Declaration", hi: "FATCA / CRS घोषणा" },
  place: { en: "Place", hi: "स्थान" },
  form_date: { en: "Date", hi: "दिनांक" },
  photo_provided: { en: "Photograph Attached", hi: "फोटो संलग्न" },
};

// ── Account Field Options ───────────────────────────────────────────────────
export const ACCOUNT_FIELD_OPTIONS = {
  title: [
    { value: "mr", label: "Mr.", label_hi: "श्री" },
    { value: "mrs", label: "Mrs.", label_hi: "श्रीमती" },
    { value: "ms", label: "Ms.", label_hi: "सुश्री" },
  ],
  gender: [
    { value: "male", label: "Male", label_hi: "पुरुष" },
    { value: "female", label: "Female", label_hi: "महिला" },
    { value: "transgender", label: "Transgender", label_hi: "ट्रांसजेंडर" },
  ],
  marital_status: [
    { value: "single", label: "Single", label_hi: "अविवाहित" },
    { value: "married", label: "Married", label_hi: "विवाहित" },
    { value: "other", label: "Other", label_hi: "अन्य" },
  ],
  category: [
    { value: "general", label: "General", label_hi: "सामान्य" },
    { value: "obc", label: "OBC", label_hi: "ओबीसी" },
    { value: "sc", label: "SC", label_hi: "एससी" },
    { value: "st", label: "ST", label_hi: "एसटी" },
  ],
  account_type: [
    {
      value: "savings",
      label: "Savings Bank Account",
      label_hi: "बचत बैंक खाता",
    },
    { value: "bsbda", label: "BSBDA", label_hi: "बीएसबीडीए" },
    { value: "current", label: "Current Account", label_hi: "चालू खाता" },
    { value: "term_deposit", label: "Term Deposit", label_hi: "सावधि जमा" },
  ],
  mode_of_operation: [
    { value: "self", label: "Self", label_hi: "स्वयं" },
    {
      value: "either_survivor",
      label: "Either or Survivor",
      label_hi: "आइदर या सर्वाइवर",
    },
    {
      value: "former_survivor",
      label: "Former or Survivor",
      label_hi: "फॉर्मर या सर्वाइवर",
    },
    {
      value: "anyone_survivor",
      label: "Any One or Survivor",
      label_hi: "एनी वन या सर्वाइवर",
    },
    { value: "jointly", label: "Jointly Operated", label_hi: "संयुक्त रूप से" },
  ],
};

// ── Account Field Groups ─────────────────────────────────────────────────────
export const ACCOUNT_INTENT_FIELDS = [
  // Part 1
  "title",
  "customer_name",
  "maiden_name",
  "dob",
  "gender",
  "marital_status",
  "father_name",
  "mother_name",
  "spouse_name",
  "pan_no",
  "aadhaar_no",
  "form_60_required",
  "nationality",
  "religion",
  "category",
  "education",
  "occupation_type",
  "annual_income_bracket",
  "net_worth",
  "is_pep",
  "current_address",
  "permanent_address",
  "mobile_no",
  "email_id",

  // Part 2
  "account_type",
  "mode_of_operation",
  "atm_card_required",
  "name_on_card",
  "cheque_book_required",
  "internet_banking",
  "mobile_banking",
  "phone_banking",
  "sms_alerts",
  "physical_passbook",
  "e_statement",

  // Part 3
  "nomination_required",
  "nominee_name",
  "nominee_relationship",
  "nominee_age",
  "nominee_address",
  "is_minor",
  "guardian_details",
  "fatca_declaration",
  "place",
  "form_date",
  "photo_provided",
];

export const ACCOUNT_SELECT_FIELDS = [
  "title",
  "gender",
  "marital_status",
  "category",
  "account_type",
  "mode_of_operation",
];

export const ACCOUNT_CHECKBOX_FIELDS = [
  "form_60_required",
  "is_pep",
  "atm_card_required",
  "cheque_book_required",
  "internet_banking",
  "mobile_banking",
  "phone_banking",
  "sms_alerts",
  "physical_passbook",
  "e_statement",
  "nomination_required",
  "is_minor",
  "fatca_declaration",
  "photo_provided",
];

// ── Field Requirement Status (Dots) ──────────────────────────────────────────
export const ACCOUNT_FIELD_STATUS = {
  // 🟢 Mandatory (Green Dot)
  mandatory: [
    "customer_name",
    "dob",
    "gender",
    "marital_status",
    "father_name",
    "mother_name",
    "pan_no",
    "aadhaar_no",
    "current_address",
    "permanent_address",
    "account_type",
    "fatca_declaration",
    "form_date",
    "photo_provided",
  ],
  // 🟡 Conditional (Yellow Dot)
  conditional: [
    "mode_of_operation",
    "form_60_required",
    "is_minor",
    "guardian_details",
    "nomination_required",
    "nominee_name",
    "nominee_relationship",
    "nominee_age",
    "nominee_address",
  ],
  // 🔵 Optional (Blue Dot)
  optional: [
    "title",
    "maiden_name",
    "spouse_name",
    "nationality",
    "religion",
    "category",
    "education",
    "occupation_type",
    "annual_income_bracket",
    "net_worth",
    "is_pep",
    "mobile_no",
    "email_id",
    "atm_card_required",
    "name_on_card",
    "cheque_book_required",
    "internet_banking",
    "mobile_banking",
    "phone_banking",
    "sms_alerts",
    "physical_passbook",
    "e_statement",
    "place",
  ],
};
