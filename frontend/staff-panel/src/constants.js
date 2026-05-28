/* ============================================
   VaaniBank AI — Staff Panel Constants
   Union Bank of India | Team Vectora

   Shared constants imported from frontend/shared/constants.js
   Panel-specific constants defined below.
   ============================================ */

// ── Brand Colors ────────────────────────────
export const BRAND = {
  red: '#E8231A',
  redDark: '#C41810',
  redLight: '#FF4D45',
  blue: '#003087',
  blueDark: '#001a52',
  blueMid: '#1a4db5',
  blueLight: '#e8eef8',
};

// ── Supported Languages ─────────────────────
export const LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
];

// ── App Meta ────────────────────────────────
export const APP_NAME = 'VaaniBank AI';
export const APP_DESCRIPTION = 'Multilingual Voice-First Banking Assistant';
export const BANK_NAME = 'Union Bank of India';
export const TEAM_NAME = 'Team Vectora';
export const APP_VERSION = '1.0.0';


// ── Intent Types ────────────────────────────
export const INTENTS = {
  account_opening: {
    label: 'Account Opening',
    labelHi: 'खाता खोलना',
    icon: 'UserPlus',
    color: '#2563EB',
    bgColor: 'rgba(37, 99, 235, 0.1)',
  },
  loan_enquiry: {
    label: 'Loan Enquiry',
    labelHi: 'ऋण पूछताछ',
    icon: 'Landmark',
    color: '#7C3AED',
    bgColor: 'rgba(124, 58, 237, 0.1)',
  },
  kyc_update: {
    label: 'KYC Update',
    labelHi: 'KYC अपडेट',
    icon: 'ShieldCheck',
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.1)',
  },
  card_services: {
    label: 'Card Services',
    labelHi: 'कार्ड सेवाएं',
    icon: 'CreditCard',
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.1)',
  },
  balance_enquiry: {
    label: 'Balance Enquiry',
    labelHi: 'शेष राशि पूछताछ',
    icon: 'Wallet',
    color: '#0891B2',
    bgColor: 'rgba(8, 145, 178, 0.1)',
  },
  fixed_deposit: {
    label: 'Fixed Deposit',
    labelHi: 'सावधि जमा',
    icon: 'PiggyBank',
    color: '#BE185D',
    bgColor: 'rgba(190, 24, 93, 0.1)',
  },
  general: {
    label: 'General Query',
    labelHi: 'सामान्य प्रश्न',
    icon: 'HelpCircle',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
  },
};

// ── Sentiment Types ─────────────────────────
export const SENTIMENTS = {
  calm: {
    label: 'Calm',
    labelHi: 'शांत',
    color: '#16A34A',
    bgColor: 'rgba(22, 163, 74, 0.1)',
    emoji: '😊',
  },
  frustrated: {
    label: 'Frustrated',
    labelHi: 'निराश',
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.1)',
    emoji: '😤',
  },
  confused: {
    label: 'Confused',
    labelHi: 'भ्रमित',
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.1)',
    emoji: '😕',
  },
  urgent: {
    label: 'Urgent',
    labelHi: 'अत्यावश्यक',
    color: '#9333EA',
    bgColor: 'rgba(147, 51, 234, 0.1)',
    emoji: '🚨',
  },
};

// ── API & WebSocket Base URLs ───────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

// ── Banking Services ────────────────────────
export const SERVICES = [
  {
    id: 'account_opening',
    label: 'Account Opening',
    label_hi: 'खाता खोलना',
    label_mr: 'खाते उघडणे',
    label_ta: 'கணக்கு திறப்பு',
    icon: 'UserPlus',
  },
  {
    id: 'loan_enquiry',
    label: 'Loan Enquiry',
    label_hi: 'ऋण पूछताछ',
    label_mr: 'कर्ज चौकशी',
    label_ta: 'கடன் விசாரணை',
    icon: 'Landmark',
  },
  {
    id: 'kyc_update',
    label: 'KYC Update',
    label_hi: 'KYC अपडेट',
    label_mr: 'KYC अपडेट',
    label_ta: 'KYC புதுப்பிப்பு',
    icon: 'ShieldCheck',
  },
  {
    id: 'card_services',
    label: 'Card Services',
    label_hi: 'कार्ड सेवाएं',
    label_mr: 'कार्ड सेवा',
    label_ta: 'அட்டை சேவைகள்',
    icon: 'CreditCard',
  },
  {
    id: 'balance_enquiry',
    label: 'Balance Enquiry',
    label_hi: 'शेष राशि पूछताछ',
    label_mr: 'शिल्लक चौकशी',
    label_ta: 'இருப்பு விசாரணை',
    icon: 'Wallet',
  },
  {
    id: 'fixed_deposit',
    label: 'Fixed Deposit',
    label_hi: 'सावधि जमा',
    label_mr: 'मुदत ठेव',
    label_ta: 'நிலையான வைப்பு',
    icon: 'PiggyBank',
  },
];

// ── Token Number Prefix by Language ─────────
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

// ── Session Statuses ────────────────────────
export const SESSION_STATUS = {
  waiting: {
    label: 'Waiting',
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.1)',
    icon: 'Clock',
  },
  active: {
    label: 'Active',
    color: '#16A34A',
    bgColor: 'rgba(22, 163, 74, 0.1)',
    icon: 'Radio',
  },
  completed: {
    label: 'Completed',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    icon: 'CheckCircle',
  },
  abandoned: {
    label: 'Abandoned',
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.1)',
    icon: 'XCircle',
  },
};

// ── Entry Methods ───────────────────────────
export const ENTRY_METHODS = {
  qr_scan: { label: 'QR Scan', icon: 'QrCode' },
  manual: { label: 'Manual Entry', icon: 'Keyboard' },
  walk_in: { label: 'Walk-In', icon: 'Footprints' },
};

// ── Staff Roles ─────────────────────────────
export const STAFF_ROLES = {
  teller: { label: 'Teller', color: '#2563EB' },
  manager: { label: 'Manager', color: '#7C3AED' },
  supervisor: { label: 'Supervisor', color: '#059669' },
  admin: { label: 'Admin', color: '#DC2626' },
};

// ── WebSocket Event Names ───────────────────
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
  ERROR: 'error',

  // Client → Server
  STAFF_APPROVED_RESPONSE: 'staff_approved_response',
  STAFF_EDITED_RESPONSE: 'staff_edited_response',
  STEP_COMPLETED: 'step_completed',
  END_SESSION: 'end_session',
  PING: 'ping',
};

// ── PII Types ───────────────────────────────
export const PII_TYPES = {
  aadhaar: { label: 'Aadhaar Number', icon: 'Fingerprint', severity: 'high' },
  pan: { label: 'PAN Card', icon: 'CreditCard', severity: 'high' },
  account_number: { label: 'Account Number', icon: 'Hash', severity: 'high' },
  phone: { label: 'Phone Number', icon: 'Phone', severity: 'medium' },
  dob: { label: 'Date of Birth', icon: 'Calendar', severity: 'medium' },
};

// ── Demo Credentials (only exposed in dev/demo builds) ──
const _DEMO_CREDS = [
  {
    staff_id: 'UBI-NGP-001',
    username: 'demo',
    password: 'demo123',
    role: 'teller',
    branch: 'Nagpur Civil Lines',
  },
];

export const DEMO_CREDENTIALS =
  import.meta.env.VITE_SHOW_DEMO_CREDENTIALS !== 'false' ? _DEMO_CREDS : [];

const CUSTOMER_PANEL_BASE = import.meta.env.VITE_CUSTOMER_PANEL_URL || 'http://localhost:5174';

export const DEMO_BRANCHES = [
  {
    code: 'NGP-CVL-01',
    name: 'Nagpur Civil Lines',
    customer_url: `${CUSTOMER_PANEL_BASE}/?branch=NGP-CVL-01`,
  },
  {
    code: 'MUM-AND-01',
    name: 'Mumbai Andheri',
    customer_url: `${CUSTOMER_PANEL_BASE}/?branch=MUM-AND-01`,
  },
  {
    code: 'CHN-TNG-01',
    name: 'Chennai T Nagar',
    customer_url: `${CUSTOMER_PANEL_BASE}/?branch=CHN-TNG-01`,
  },
];

