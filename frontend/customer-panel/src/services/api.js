/*
   VaaniBank AI — Customer Panel API Service
   Union Bank of India | Team Vectora
   */

import axios from 'axios';
import { API_BASE_URL } from '../constants';

// Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(
        `%c[API] ${config.method?.toUpperCase()} ${config.url}`,
        'color: #003087; font-weight: bold;',
        config.data || ''
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `%c[API] ✓ ${response.status} ${response.config.url}`,
        'color: #16A34A; font-weight: bold;',
        response.data
      );
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error(
        `%c[API] ✗ ${error.response?.status || 'NETWORK'} ${error.config?.url}`,
        'color: #DC2626; font-weight: bold;',
        error.response?.data || error.message
      );
    }
    return Promise.reject(error);
  }
);

//  SESSION APIs

export const getSession = async (token_number) => {
  const response = await api.get(`/sessions/${token_number}`);
  return response.data;
};

export const getPublicSettings = async () => {
  const response = await api.get('/sessions/settings/public');
  return response.data;
};

export const getCollectedInfo = async (session_id) => {
  const response = await api.get(`/sessions/${session_id}/collected-info`);
  return response.data;
};

export const createSession = async (branch_code, customer_language, customer_language_code, entry_method = 'qr_scan') => {
  const response = await api.post('/sessions/customer-create', {
    branch_code,
    customer_language,
    customer_language_code,
    entry_method,
  });
  if (import.meta.env.DEV) {
    console.log("API createSession raw response:", JSON.stringify(response.data));
  }
  return response.data;
};

//  SUMMARY APIs

export const getSessionSummary = async (session_id) => {
  const response = await api.get(`/summary/session/${session_id}`);
  return response.data;
};

export const getPDFUrl = (summary_id) => {
  return `${API_BASE_URL}/summary/${summary_id}/pdf`;
};

/**
 * Download PDF as a Blob via backend proxy.
 * Avoids CORS issues when PDFs are stored in Cloudflare R2.
 * @param {number} sessionId - The session ID
 * @returns {Promise<Blob>}
 */
export const downloadPDFBlob = async (sessionId) => {
  const response = await api.get(
    `/summary/session/${sessionId}/pdf/download`,
    { responseType: 'blob', timeout: 30000 },
  );
  return response.data;
};

//  AI PIPELINE APIs

export const transcribeAudio = async (audioBlob, languageCode, sessionId, tokenNumber) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.wav')
  formData.append('token_number', String(tokenNumber))
  formData.append('language_code', String(languageCode || 'hi'))
  formData.append('session_id', String(sessionId))

  const response = await api.post('/stt/customer-transcribe', formData, {
    headers: { 'Content-Type': undefined },
    timeout: 120000,  // 2 min — AI pipeline (STT+translate+PII+LLM) needs more time
  })
  return response.data
}

export const generateTTS = async (text, language_code, session_id, token_number = null) => {
  const response = await api.post('/tts/generate', {
    text,
    language_code,
    session_id,
    token_number,
  });
  return response.data;
};

export const getAudioUrl = (filename) => {
  return `${API_BASE_URL}/tts/audio/${filename}`;
};

// Default Export
export default api;
