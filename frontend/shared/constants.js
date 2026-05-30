/*
   VaaniBank AI — Shared Constants
   Union Bank of India | Team Vectora

   Single source of truth for constants shared
   between staff-panel and customer-panel.

   Both panels import from their own constants.js
   which re-exports these shared values plus
   panel-specific additions.
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
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
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
