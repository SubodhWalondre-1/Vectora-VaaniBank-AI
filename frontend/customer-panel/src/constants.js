/*
   VaaniBank AI — Customer Panel Constants
   Union Bank of India | Team Vectora

   Shared constants imported from frontend/shared/constants.js
   Panel-specific constants defined below.
   */

// Brand Colors
export const BRAND = {
  red: '#E8231A',
  redDark: '#C41810',
  redLight: '#FF4D45',
  blue: '#003087',
  blueDark: '#001a52',
  blueMid: '#1a4db5',
  blueLight: '#e8eef8',
};

// Supported Languages
export const LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
];

// WebSocket Event Names
export const WS_EVENTS = {
  // Server → Client
  SESSION_CONNECTED: 'session_connected',
  CUSTOMER_SPEAKING: 'customer_speaking',
  TRANSCRIPTION_READY: 'transcription_ready',
  AI_SUGGESTION_READY: 'ai_suggestion_ready',
  AUDIO_READY: 'audio_ready',
  STEP_UPDATED: 'step_updated',
  PII_DETECTED: 'pii_detected',
  SESSION_ENDED: 'session_ended',
  PEER_STATUS: 'peer_status',
  INFO_BOARD_UPDATE: 'info_board_update',
  PROCESS_UPDATE: 'PROCESS_UPDATE',
  INPUT_REQUEST: 'input_request',
  INPUT_ACKNOWLEDGED: 'input_acknowledged',
  ERROR: 'error',

  // Client → Server
  PING: 'ping',
  END_SESSION: 'end_session',
  STAFF_APPROVED: 'staff_approved_response',
  STAFF_EDITED: 'staff_edited_response',
  STEP_COMPLETED: 'step_completed',
};

// Session Statuses
export const SESSION_STATUS = {
  waiting: {
    label: 'Waiting',
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.1)',
  },
  active: {
    label: 'Active',
    color: '#16A34A',
    bgColor: 'rgba(22, 163, 74, 0.1)',
  },
  completed: {
    label: 'Completed',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
  },
  abandoned: {
    label: 'Abandoned',
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.1)',
  },
};

// Sentiment Labels
export const SENTIMENTS = {
  calm: { label: 'Calm', emoji: '😊', color: '#16A34A' },
  frustrated: { label: 'Frustrated', emoji: '😤', color: '#DC2626' },
  confused: { label: 'Confused', emoji: '😕', color: '#D97706' },
  urgent: { label: 'Urgent', emoji: '🚨', color: '#9333EA' },
};

// App Meta
export const APP_NAME = 'VaaniBank AI';
export const APP_DESCRIPTION = 'Multilingual Voice-First Banking Assistant';
export const BANK_NAME = 'Union Bank of India';
export const TEAM_NAME = 'Team Vectora';
export const APP_VERSION = '1.0.0';


// API & WebSocket Base URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

// Banking Services (with all language labels)
export const SERVICES = [
  {
    id: 'account_opening',
    icon: 'UserPlus',
    color: '#2563EB',
    bgColor: 'rgba(37, 99, 235, 0.1)',
    labels: {
      en: 'Account Opening',
      hi: 'खाता खोलना',
      mr: 'खाते उघडणे',
      ta: 'கணக்கு திறப்பு',
      te: 'ఖాతా ప్రారంభం',
      bn: 'অ্যাকাউন্ট খোলা',
      kn: 'ಖಾತೆ ತೆರೆಯುವುದು',
      or: 'ଆକାଉଣ୍ଟ ଖୋଲିବା',
      pa: 'ਖਾਤਾ ਖੋਲ੍ਹਣਾ',
      gu: 'ખાતું ખોલવું',
      ml: 'അക്കൗണ്ട് തുറക്കൽ',
    },
  },
  {
    id: 'loan_enquiry',
    icon: 'Landmark',
    color: '#7C3AED',
    bgColor: 'rgba(124, 58, 237, 0.1)',
    labels: {
      en: 'Loan Enquiry',
      hi: 'ऋण पूछताछ',
      mr: 'कर्ज चौकशी',
      ta: 'கடன் விசாரணை',
      te: 'రుణ విచారణ',
      bn: 'ঋণ অনুসন্ধান',
      kn: 'ಸಾಲ ವಿಚಾರಣೆ',
      or: 'ଋଣ ଅନୁସନ୍ଧାନ',
      pa: 'ਕਰਜ਼ਾ ਪੁੱਛਗਿੱਛ',
      gu: 'લોન પૂછપરછ',
      ml: 'ലോൺ അന്വേഷണം',
    },
  },
  {
    id: 'kyc_update',
    icon: 'ShieldCheck',
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.1)',
    labels: {
      en: 'KYC Update',
      hi: 'KYC अपडेट',
      mr: 'KYC अपडेट',
      ta: 'KYC புதுப்பிப்பு',
      te: 'KYC నవీకరణ',
      bn: 'KYC আপডেট',
      kn: 'KYC ನವೀಕರಣ',
      or: 'KYC ଅପଡେଟ',
      pa: 'KYC ਅੱਪਡੇਟ',
      gu: 'KYC અપડેટ',
      ml: 'KYC അപ്‌ഡേറ്റ്',
    },
  },
  {
    id: 'card_services',
    icon: 'CreditCard',
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.1)',
    labels: {
      en: 'Card Services',
      hi: 'कार्ड सेवाएं',
      mr: 'कार्ड सेवा',
      ta: 'அட்டை சேவைகள்',
      te: 'కార్డ్ సేవలు',
      bn: 'কার্ড সেবা',
      kn: 'ಕಾರ್ಡ್ ಸೇವೆಗಳು',
      or: 'କାର୍ଡ ସେବା',
      pa: 'ਕਾਰਡ ਸੇਵਾਵਾਂ',
      gu: 'કાર્ડ સેવાઓ',
      ml: 'കാർഡ് സേവനങ്ങൾ',
    },
  },
  {
    id: 'balance_enquiry',
    icon: 'Wallet',
    color: '#0891B2',
    bgColor: 'rgba(8, 145, 178, 0.1)',
    labels: {
      en: 'Balance Enquiry',
      hi: 'शेष राशि पूछताछ',
      mr: 'शिल्लक चौकशी',
      ta: 'இருப்பு விசாரணை',
      te: 'బ్యాలెన్స్ విచారణ',
      bn: 'ব্যালেন্স অনুসন্ধান',
      kn: 'ಬ್ಯಾಲೆನ್ಸ್ ವಿಚಾರಣೆ',
      or: 'ବ୍ୟାଲେନ୍ସ ଅନୁସନ୍ଧାନ',
      pa: 'ਬੈਲੇਂਸ ਪੁੱਛਗਿੱਛ',
      gu: 'બેલેન્સ પૂછપરછ',
      ml: 'ബാലൻസ് അന്വേഷണം',
    },
  },
  {
    id: 'fixed_deposit',
    icon: 'PiggyBank',
    color: '#BE185D',
    bgColor: 'rgba(190, 24, 93, 0.1)',
    labels: {
      en: 'Fixed Deposit',
      hi: 'सावधि जमा',
      mr: 'मुदत ठेव',
      ta: 'நிலையான வைப்பு',
      te: 'ఫిక్స్‌డ్ డిపాజిట్',
      bn: 'ফিক্সড ডিপোজিট',
      kn: 'ಸ್ಥಿರ ಠೇವಣಿ',
      or: 'ସ୍ଥିର ଜମା',
      pa: 'ਫਿਕਸਡ ਡਿਪਾਜ਼ਿਟ',
      gu: 'ફિક્સ્ડ ડિપોઝિટ',
      ml: 'സ്ഥിര നിക്ഷേപം',
    },
  },
];

// Token Number Prefix by Language
export const TOKEN_PREFIX = {
  hi: 'HIN',
  mr: 'MRT',
  ta: 'TAM',
  te: 'TEL',
  bn: 'BEN',
  kn: 'KAN',
  or: 'ODI',
  pa: 'PUN',
  gu: 'GUJ',
  ml: 'MAL',
};



// UI Strings (multilingual)
export const UI_STRINGS = {
  selectLanguage: {
    en: 'Select Your Language',
    hi: 'अपनी भाषा चुनें',
    mr: 'तुमची भाषा निवडा',
    ta: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    te: 'మీ భాషను ఎంచుకోండి',
    bn: 'আপনার ভাষা নির্বাচন করুন',
    kn: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    or: 'ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ',
    pa: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
    gu: 'તમારી ભાષા પસંદ કરો',
    ml: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക',
  },
  tapToSpeak: {
    en: 'Tap to Speak',
    hi: 'बोलने के लिए टैप करें',
    mr: 'बोलण्यासाठी टॅप करा',
    ta: 'பேச தட்டவும்',
    te: 'మాట్లాడటానికి నొక్కండి',
    bn: 'কথা বলতে ট্যাপ করুন',
    kn: 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    or: 'କଥା ହେବାକୁ ଟ୍ୟାପ୍ କରନ୍ତୁ',
    pa: 'ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ',
    gu: 'બોલવા માટે ટેપ કરો',
    ml: 'സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക',
  },
  listening: {
    en: 'Listening...',
    hi: 'सुन रहे हैं...',
    mr: 'ऐकत आहे...',
    ta: 'கேட்கிறது...',
    te: 'వింటోంది...',
    bn: 'শুনছি...',
    kn: 'ಕೇಳುತ್ತಿದೆ...',
    or: 'ଶୁଣୁଛି...',
    pa: 'ਸੁਣ ਰਿਹਾ ਹੈ...',
    gu: 'સાંભળી રહ્યું છે...',
    ml: 'കേൾക്കുന്നു...',
  },
  processing: {
    en: 'Processing...',
    hi: 'प्रोसेसिंग...',
    mr: 'प्रक्रिया करत आहे...',
    ta: 'செயலாக்குகிறது...',
    te: 'ప్రాసెస్ చేస్తోంది...',
    bn: 'প্রক্রিয়াকরণ হচ্ছে...',
    kn: 'ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ...',
    or: 'ପ୍ରକ୍ରିୟାକରଣ ହେଉଛି...',
    pa: 'ਪ੍ਰੋਸੈਸਿੰਗ...',
    gu: 'પ્રોસેસિંગ...',
    ml: 'പ്രോസസ്സ് ചെയ്യുന്നു...',
  },
  selectService: {
    en: 'How can we help you today?',
    hi: 'आज हम आपकी कैसे मदद कर सकते हैं?',
    mr: 'आज आम्ही तुम्हाला कशी मदत करू शकतो?',
    ta: 'இன்று நாங்கள் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
    te: 'ఈరోజు మేము మీకు ఎలా సహాయం చేయగలం?',
    bn: 'আজ আমরা আপনাকে কিভাবে সাহায্য করতে পারি?',
    kn: 'ಇಂದು ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    or: 'ଆଜି ଆମେ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବା?',
    pa: 'ਅੱਜ ਅਸੀਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ?',
    gu: 'આજે અમે તમારી કેવી રીતે મદદ કરી શકીએ?',
    ml: 'ഇന്ന് ഞങ്ങൾ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?',
  },
};

