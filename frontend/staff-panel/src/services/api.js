/*
   VaaniBank AI — Staff Panel API Service
   Union Bank of India | Team Vectora
   */

import axios from "axios";
import { API_BASE_URL } from "../constants";

// Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vaanibank_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(
        `%c[API] ${config.method?.toUpperCase()} ${config.url}`,
        "color: #003087; font-weight: bold;",
        config.data || "",
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

import toast from "react-hot-toast";

// Response Interceptor: Handle 401 / 403 unauthenticated
// FastAPI's HTTPBearer(auto_error=True) returns 403 {"detail":"Not authenticated"}
// when the Authorization header is completely absent (no token sent).
// It returns 401 when a token IS sent but is invalid/expired.
// We handle both here so the user always gets redirected to /login.
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `%c[API] ✓ ${response.status} ${response.config.url}`,
        "color: #16A34A; font-weight: bold;",
        response.data,
      );
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error(
        `%c[API] ✗ ${error.response?.status || "NETWORK"} ${error.config?.url}`,
        "color: #DC2626; font-weight: bold;",
        error.response?.data || error.message,
      );
    }

    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const data = error.response?.data;
    const message = data?.message || data?.detail || error.message;

    const isUnauthenticated =
      status === 401 || (status === 403 && detail === "Not authenticated");

    if (isUnauthenticated) {
      localStorage.removeItem("vaanibank_token");
      localStorage.removeItem("vaanibank_staff");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Skip showing toast if the caller explicitly requested it
    if (!error.config?.skipGlobalToast && !isUnauthenticated) {
      if (!status) {
        toast.error("Network connection unstable or branch servers offline. Please check your connectivity.", {
          id: "staff-network-offline-toast",
          duration: 4000,
        });
      } else if (status === 404) {
        // Only toast if not a session checker (which is queried frequently)
        if (!error.config.url.includes("/sessions/")) {
          toast.error(message || "Workplace resource not found.");
        }
      } else if (status === 422) {
        toast.error(message || "Provided parameters could not be processed.");
      } else if (status >= 500) {
        toast.error("VaaniBank mainframes are temporarily busy. Retrying transaction shortly.", {
          id: "staff-server-5xx-toast",
        });
      } else {
        toast.error(message || "An error occurred during banking operations.");
      }
    }

    return Promise.reject(error);
  },
);

//  AUTH APIs

export const authAPI = {
  login: async (staff_id, username, password) => {
    const response = await api.post("/auth/login", {
      staff_id,
      username,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    localStorage.removeItem("vaanibank_token");
    localStorage.removeItem("vaanibank_staff");
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  generateDemoTeller: async () => {
    const response = await api.post("/auth/demo-teller");
    return response.data;
  },
};

//  SESSION APIs

export const sessionAPI = {
  createSession: async (
    branch_code,
    customer_language,
    customer_language_code,
    entry_method,
  ) => {
    const response = await api.post("/sessions/create", {
      branch_code,
      customer_language,
      customer_language_code,
      entry_method,
    });
    return response.data;
  },

  getSession: async (token_number) => {
    const response = await api.get(`/sessions/${token_number}`);
    return response.data;
  },

  endSession: async (session_id, reason = "completed") => {
    const response = await api.patch(`/sessions/${session_id}/end`, {
      reason,
    });
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await api.get("/sessions/active");
    return response.data;
  },

  getSessionHistory: async (page = 1, limit = 20) => {
    const response = await api.get("/sessions/history", {
      params: { page, limit },
    });
    return response.data;
  },

  getCustomerProfile: async (session_id) => {
    const response = await api.get(`/sessions/${session_id}/customer-profile`);
    return response.data;
  },

  getCollectedInfo: async (session_id) => {
    const response = await api.get(`/sessions/${session_id}/collected-info`);
    return response.data;
  },

  getSessionExchanges: async (session_id) => {
    const response = await api.get(`/sessions/${session_id}/exchanges`);
    return response.data;
  },
};

//  AI PIPELINE APIs

export const aiAPI = {
  transcribeAudio: async (
    audioBlob,
    language_code,
    session_id,
    exchange_number,
    token_number,
  ) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("language_code", language_code);
    formData.append("session_id", String(session_id));
    formData.append("exchange_number", String(exchange_number ?? 0));
    formData.append("token_number", token_number || "");

    const response = await api.post("/stt/transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return response.data;
  },

  staffTranscribeAudio: async (audioBlob, language_code) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "staff_audio.webm");
    formData.append("language_code", language_code);

    const response = await api.post("/stt/staff-transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return response.data;
  },

  detectLanguage: async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "sample.webm");

    const response = await api.post("/stt/detect-language", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    });
    return response.data;
  },

  processWithLLM: async (text, source_language, session_id, history = []) => {
    const response = await api.post("/llm/process", {
      text,
      source_language,
      session_id,
      history,
    });
    return response.data;
  },

  translateToEnglish: async (text) => {
    const response = await api.post("/llm/translate-to-english", { text });
    return response.data.english_text;
  },

  translateStaffResponse: async (
    text,
    target_language_code,
    banking_context = "",
  ) => {
    const codeMap = {
      ml: "ml-IN",
      hi: "hi-IN",
      mr: "mr-IN",
      ta: "ta-IN",
      te: "te-IN",
      bn: "bn-IN",
      kn: "kn-IN",
      or: "or-IN",
      pa: "pa-IN",
      gu: "gu-IN",
      en: "en-IN",
    };
    const nameMap = {
      "ml-IN": "Malayalam",
      "hi-IN": "Hindi",
      "mr-IN": "Marathi",
      "ta-IN": "Tamil",
      "te-IN": "Telugu",
      "bn-IN": "Bengali",
      "kn-IN": "Kannada",
      "or-IN": "Odia",
      "pa-IN": "Punjabi",
      "gu-IN": "Gujarati",
      "en-IN": "English",
    };
    const shortCode = target_language_code.split("-")[0];
    const fullCode = codeMap[shortCode] || target_language_code;
    const langName =
      nameMap[fullCode] || nameMap[target_language_code] || "Hindi";

    const response = await api.post("/llm/translate-staff-response", {
      text,
      target_language_code: fullCode,
      target_language: langName,
    });
    return response.data;
  },

  generateTTS: async (text, language_code, session_id, token_number = null) => {
    const response = await api.post("/tts/generate", {
      text,
      language_code,
      session_id,
      token_number,
    });
    return response.data;
  },

  getAudioUrl: (filename) => {
    return `${API_BASE_URL}/tts/audio/${filename}`;
  },
};

//  SUMMARY APIs

export const summaryAPI = {
  generateSummary: async (session_id, config = {}) => {
    const response = await api.post(
      "/summary/generate",
      { session_id },
      config,
    );
    return response.data;
  },

  getSessionSummary: async (session_id) => {
    const response = await api.get(`/summary/session/${session_id}`);
    return response.data;
  },

  getPDFUrl: (summary) => {
    if (summary?.pdf_url) {
      if (
        summary.pdf_url.startsWith("http://") ||
        summary.pdf_url.startsWith("https://")
      ) {
        return summary.pdf_url;
      }
      const relativePath = summary.pdf_url.replace(
        "/storage/summaries/",
        "/summaries/",
      );
      return `${API_BASE_URL}${relativePath}`;
    }
    return `${API_BASE_URL}/summaries/${summary?.id ?? summary}.pdf`;
  },

  /**
   * Download PDF as a Blob via backend proxy.
   * This avoids CORS issues when PDFs are stored in Cloudflare R2.
   * @param {number} sessionId - The session ID
   * @returns {Promise<Blob>} - The PDF as a Blob
   */
  downloadPDFBlob: async (sessionId) => {
    const response = await api.get(
      `/summary/session/${sessionId}/pdf/download`,
      { responseType: "blob", timeout: 60000 },
    );
    return response.data;
  },

  sendWhatsApp: async (summary_id, phone_number) => {
    const response = await api.post(`/summary/${summary_id}/whatsapp`, null, {
      params: { phone_number },
    });
    return response.data;
  },
};

//  PROCESS STEP APIs

export const processAPI = {
  getProcessSteps: async (intent_type, language_code = "hi") => {
    const response = await api.get(`/process/steps/${intent_type}`, {
      params: { language_code },
    });
    return response.data;
  },

  completeStep: async (session_id, step_id) => {
    const response = await api.post("/process/step/complete", {
      session_id,
      step_id,
    });
    return response.data;
  },

  getSessionProgress: async (session_id) => {
    const response = await api.get(`/process/session/${session_id}/progress`);
    return response.data;
  },
};

//  ANALYTICS APIs

export const analyticsAPI = {
  getBranchAnalyticsToday: async (branch_id) => {
    const response = await api.get(`/analytics/branch/${branch_id}/today`);
    return response.data;
  },
};

//  QR CODE APIs

export const qrAPI = {
  getBranchQR: async (branch_code) => {
    const response = await api.get(`/branches/${branch_code}/qr`);
    return response.data;
  },
};

//  STAFF MANAGEMENT APIs  (Phase 1 + Phase 5)

export const staffAPI = {
  /** Create staff — returns { staff, username, plain_password, message } */
  createStaff: async (body) => {
    const response = await api.post("/staff/create", body);
    return response.data;
  },

  listStaff: async (branchId = null, includeInactive = false) => {
    const params = { include_inactive: includeInactive };
    if (branchId) params.branch_id = branchId;
    const response = await api.get("/staff/list", { params });
    return response.data;
  },

  getStaff: async (staffDbId) => {
    const response = await api.get(`/staff/${staffDbId}`);
    return response.data;
  },

  updateStaff: async (staffDbId, body) => {
    const response = await api.patch(`/staff/${staffDbId}`, body);
    return response.data;
  },

  deactivateStaff: async (staffDbId) => {
    const response = await api.patch(`/staff/${staffDbId}/deactivate`);
    return response.data;
  },

  activateStaff: async (staffDbId) => {
    const response = await api.patch(`/staff/${staffDbId}/activate`);
    return response.data;
  },

  /** Reset password — returns { staff_id, username, new_plain_password, message } */
  resetPassword: async (staffDbId) => {
    const response = await api.post(`/staff/${staffDbId}/reset-password`);
    return response.data;
  },

  getStaffSessions: async (staffDbId, days = 7) => {
    const response = await api.get(`/staff/${staffDbId}/sessions`, {
      params: { days },
    });
    return response.data;
  },

  branchAnalyticsRange: async (branchId, fromDate, toDate) => {
    const response = await api.get(`/analytics/branch/${branchId}/range`, {
      params: { from_date: fromDate, to_date: toDate },
    });
    return response.data;
  },

  // Admin only
  adminListBranches: async (includeInactive = false) => {
    const response = await api.get("/admin/branches", {
      params: { include_inactive: includeInactive },
    });
    return response.data;
  },

  adminCreateBranch: async (body) => {
    const response = await api.post("/admin/branches/create", body);
    return response.data;
  },

  adminNetworkAnalytics: async (fromDate, toDate) => {
    const response = await api.get("/admin/analytics", {
      params: { from_date: fromDate, to_date: toDate },
    });
    return response.data;
  },

  adminAuditLogs: async (page = 1, pageSize = 50, actionFilter = null) => {
    const params = { page, page_size: pageSize };
    if (actionFilter) params.action_filter = actionFilter;
    const response = await api.get("/admin/audit-logs", { params });
    return response.data;
  },

  adminGetSettings: async () => {
    const response = await api.get("/admin/settings");
    return response.data;
  },

  adminUpdateSettings: async (settings) => {
    const response = await api.post("/admin/settings", settings);
    return response.data;
  },
};

// Default Export
export default api;

//  NAMED EXPORTS — flat convenience wrappers

// Auth
export const login = (staff_id, username, password) =>
  authAPI.login(staff_id, username, password);
export const logout = () => authAPI.logout();
export const refreshToken = () => authAPI.refreshToken();
export const getMe = () => authAPI.getMe();

// Sessions
export const createSession = (payload) =>
  sessionAPI.createSession(
    payload.branch_code,
    payload.customer_language,
    payload.customer_language_code,
    payload.entry_method ?? "walk_in",
  );

export const getSession = (token_number) => sessionAPI.getSession(token_number);
export const endSession = (session_id, reason) =>
  sessionAPI.endSession(session_id, reason);
export const getActiveSessions = () => sessionAPI.getActiveSessions();
export const getSessionHistory = (page, limit) =>
  sessionAPI.getSessionHistory(page, limit);
export const getCustomerProfile = (session_id) =>
  sessionAPI.getCustomerProfile(session_id);
export const getCollectedInfo = (session_id) =>
  sessionAPI.getCollectedInfo(session_id);

// AI Pipeline
export const transcribeAudio = (blob, lang, sid, num, token) =>
  aiAPI.transcribeAudio(blob, lang, sid, num, token);
export const detectLanguage = (blob) => aiAPI.detectLanguage(blob);
export const processWithLLM = (text, lang, sid, hist) =>
  aiAPI.processWithLLM(text, lang, sid, hist);
export const translateResponse = (text, code, ctx) =>
  aiAPI.translateStaffResponse(text, code, ctx);
export const generateTTS = (text, lang, sid, token) =>
  aiAPI.generateTTS(text, lang, sid, token);
export const getAudioUrl = (filename) => aiAPI.getAudioUrl(filename);

// Summary
export const generateSummary = (session_id) =>
  summaryAPI.generateSummary(session_id, { timeout: 60000 }); // 60s timeout for AI summary
export const getSummary = (session_id) =>
  summaryAPI.getSessionSummary(session_id);
export const getSummaryPDF = async (summary_id) => {
  const response = await api.get(`/summary/${summary_id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};
export const sendWhatsApp = (summary_id, phone) =>
  summaryAPI.sendWhatsApp(summary_id, phone);

// Process Steps
export const getProcessSteps = (intent, lang) =>
  processAPI.getProcessSteps(intent, lang);
export const completeProcessStep = (payload) =>
  processAPI.completeStep(payload.session_id, payload.step_id);
export const getSessionProgress = (session_id) =>
  processAPI.getSessionProgress(session_id);

// Analytics
export const fetchAnalytics = (branch_id) =>
  analyticsAPI.getBranchAnalyticsToday(branch_id);

// QR
export const getBranchQR = (branch_code) => qrAPI.getBranchQR(branch_code);
