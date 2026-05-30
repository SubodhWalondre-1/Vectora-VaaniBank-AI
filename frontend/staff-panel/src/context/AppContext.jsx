/*
   VaaniBank AI — Staff Panel State (Zustand)
   Union Bank of India | Team Vectora
   */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { authAPI, sessionAPI, processAPI } from "../services/api";

//  MAIN APP STORE

const useAppStore = create(
  persist(
    immer((set, get) => ({
      //  HYDRATION FLAG (Zustand persist)
      _hasHydrated: false,
      setHasHydrated: (value) =>
        set((state) => {
          state._hasHydrated = value;
        }),

      //  AUTH STATE
      staff: null,
      isAuthenticated: false,
      token: null,

      login: async (credentials) => {
        try {
          const data = await authAPI.login(
            credentials.staff_id,
            credentials.username,
            credentials.password,
          );

          const token = data.access_token || data.token;
          const staffData = data.staff || data.user || data;

          localStorage.setItem("vaanibank_token", token);
          localStorage.setItem("vaanibank_staff", JSON.stringify(staffData));

          set((state) => {
            state.staff = staffData;
            state.isAuthenticated = true;
            state.token = token;
          });

          return { success: true, data };
        } catch (error) {
          const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "Login failed. Please check your credentials.";
          return { success: false, error: message };
        }
      },

      logout: async () => {
        // Clear storage synchronously for immediate UI feedback
        localStorage.removeItem("vaanibank_token");
        localStorage.removeItem("vaanibank_staff");

        // Execute API logout call in the background without blocking the UI
        authAPI.logout().catch((err) => {
          console.warn("Backend logout request failed (non-fatal):", err);
        });

        set((state) => {
          state.staff = null;
          state.isAuthenticated = false;
          state.token = null;
          state.activeSession = null;
          state.sessionStatus = "idle";
          state.exchanges = [];
          state.currentSentiment = "calm";
          state.currentIntent = null;
          state.customerSelectedIntent = false;
          state.processSteps = [];
          state.currentStep = 0;
          state.totalSteps = 0;
          state.progressPercent = 0;
          state.aiSuggestion = null;
          state.isListening = false;
          state.isProcessing = false;
          state.piiAlert = null;
          state.liveTranscript = null;
        });

        window.location.href = "/login";
      },

      restoreAuth: () => {
        const token = localStorage.getItem("vaanibank_token");
        const staffStr = localStorage.getItem("vaanibank_staff");

        if (token && staffStr) {
          try {
            const staffData = JSON.parse(staffStr);
            set((state) => {
              state.staff = staffData;
              state.isAuthenticated = true;
              state.token = token;
            });
            return true;
          } catch {
            localStorage.removeItem("vaanibank_token");
            localStorage.removeItem("vaanibank_staff");
            return false;
          }
        }
        return false;
      },

      refreshAuth: async () => {
        try {
          const data = await authAPI.getMe();
          set((state) => {
            state.staff = data;
          });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      //  SESSION STATE
      activeSession: null,
      sessionStatus: "idle", // idle | active | ended
      exchanges: [],
      currentSentiment: "calm",
      currentIntent: null,
      customerSelectedIntent: false, // true = customer explicitly selected a service, don't let LLM override
      processSteps: [],
      currentStep: 0,
      totalSteps: 0,
      progressPercent: 0,
      aiSuggestion: null,
      isListening: false,
      isProcessing: false,
      liveTranscript: null,
      // Conversation Intelligence (InfoBoard)
      infoBoard: null, // { collected_info, completion_percent, next_question_hindi, next_question_customer_lang, auto_step_completed }

      createSession: async (data) => {
        try {
          set((state) => {
            state.isProcessing = true;
          });

          const session = await sessionAPI.createSession(
            data.branch_code,
            data.customer_language,
            data.customer_language_code,
            data.entry_method,
          );

          // Ensure customer language fields are always on activeSession
          // (merge from input in case API response omits them)
          const enrichedSession = {
            ...session,
            customer_language:
              session.customer_language || data.customer_language,
            customer_language_code:
              session.customer_language_code || data.customer_language_code,
          };

          set((state) => {
            state.activeSession = enrichedSession;
            state.sessionStatus = "active";
            state.exchanges = [];
            state.currentSentiment = "calm";
            state.currentIntent = null;
            state.customerSelectedIntent = false;
            state.processSteps = [];
            state.currentStep = 0;
            state.totalSteps = 0;
            state.progressPercent = 0;
            state.aiSuggestion = null;
            state.isListening = false;
            state.isProcessing = false;
            state.piiAlert = null;
            state.infoBoard = null;
            state.liveTranscript = null;
            state.docReadiness = null;
            state.navigatorState = null;
          });

          return { success: true, session };
        } catch (error) {
          set((state) => {
            state.isProcessing = false;
          });
          const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "Failed to create session.";
          return { success: false, error: message };
        }
      },

      endSession: async (reason = "completed") => {
        const { activeSession } = get();
        if (!activeSession)
          return { success: false, error: "No active session" };

        try {
          await sessionAPI.endSession(activeSession.id, reason);

          set((state) => {
            state.sessionStatus = "ended";
            state.isListening = false;
            state.isProcessing = false;
            state.aiSuggestion = null;
          });

          return { success: true };
        } catch (error) {
          const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "Failed to end session.";
          return { success: false, error: message };
        }
      },

      resetSession: () => {
        set((state) => {
          state.activeSession = null;
          state.sessionStatus = "idle";
          state.exchanges = [];
          state.currentSentiment = "calm";
          state.currentIntent = null;
          state.customerSelectedIntent = false;
          state.processSteps = [];
          state.currentStep = 0;
          state.totalSteps = 0;
          state.progressPercent = 0;
          state.aiSuggestion = null;
          state.isListening = false;
          state.isProcessing = false;
          state.piiAlert = null;
          state.infoBoard = null;
          state.liveTranscript = null;
        });
      },

      addExchange: (exchange) => {
        set((state) => {
          state.exchanges.push(exchange);
          if (state.activeSession) {
            state.activeSession.total_exchanges = state.exchanges.length;
          }
          if (exchange.sentiment) {
            state.currentSentiment = exchange.sentiment;
          }
          if (exchange.intent && !state.customerSelectedIntent) {
            state.currentIntent = exchange.intent;
          }
        });
      },

      updateSuggestion: (suggestion) => {
        set((state) => {
          state.aiSuggestion = suggestion;
          state.isProcessing = false;
        });
      },

      clearSuggestion: () => {
        set((state) => {
          state.aiSuggestion = null;
        });
      },

      updateInfoBoard: (data) => {
        set((state) => {
          // Merge collected_info across exchanges (accumulate, don't reset)
          const prev = state.infoBoard?.collected_info || {};
          const incoming = data.collected_info || {};
          // Start with ALL incoming keys (even null) so InfoBoard renders the schema
          const merged = { ...incoming };
          // Then overlay with previously collected non-null values (don't lose progress)
          for (const [key, val] of Object.entries(prev)) {
            if (
              val !== null &&
              val !== undefined &&
              val !== "" &&
              val !== false
            ) {
              merged[key] = val;
            }
          }
          // Also overlay any new non-null values from incoming
          for (const [key, val] of Object.entries(incoming)) {
            if (
              val !== null &&
              val !== undefined &&
              val !== "" &&
              val !== false
            ) {
              merged[key] = val;
            }
          }
          state.infoBoard = {
            ...data,
            collected_info: merged,
            conversation_stage:
              data.conversation_stage ||
              state.infoBoard?.conversation_stage ||
              "exploring",
          };
        });
      },

      clearInfoBoard: () => {
        set((state) => {
          state.infoBoard = null;
        });
      },

      updateDocReadiness: (data) => {
        set((state) => {
          state.docReadiness = data;
        });
      },

      updateNavigator: (data) => {
        set((state) => {
          state.navigatorState = data;
        });
      },

      updateProcessStep: (stepData) => {
        set((state) => {
          state.currentStep = stepData.current_step ?? state.currentStep;
          state.totalSteps = stepData.total_steps ?? state.totalSteps;
          state.progressPercent =
            stepData.progress_percentage ?? state.progressPercent;

          if (stepData.step_status && state.processSteps.length > 0) {
            const stepIndex = state.processSteps.findIndex(
              (s) => s.step_number === stepData.current_step,
            );
            if (stepIndex !== -1) {
              state.processSteps[stepIndex].status = stepData.step_status;
            }
          }
        });
      },

      setProcessSteps: (steps) => {
        set((state) => {
          state.processSteps = steps;
          state.totalSteps = steps.length;
          state.currentStep = 0;
          state.progressPercent = 0;
        });
      },

      loadProcessSteps: async (intentType, languageCode = "hi") => {
        try {
          const steps = await processAPI.getProcessSteps(
            intentType,
            languageCode,
          );
          set((state) => {
            state.processSteps = Array.isArray(steps)
              ? steps
              : steps.steps || [];
            state.totalSteps = state.processSteps.length;
            state.currentStep = 0;
            state.progressPercent = 0;
          });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      setListening: (value) => {
        set((state) => {
          state.isListening = value;
        });
      },

      setProcessing: (value) => {
        set((state) => {
          state.isProcessing = value;
        });
      },

      updateSentiment: (sentiment) => {
        set((state) => {
          state.currentSentiment = sentiment;
        });
      },

      updateIntent: (intent, { isCustomerSelected = false } = {}) => {
        set((state) => {
          // If the customer explicitly selected a service, lock the intent
          if (isCustomerSelected) {
            state.currentIntent = intent;
            state.customerSelectedIntent = true;
          } else if (!state.customerSelectedIntent) {
            // Only allow LLM to update if customer hasn't explicitly chosen
            state.currentIntent = intent;
          }
          // If customerSelectedIntent is true and this is NOT a customer selection,
          // skip — keep the customer's choice
        });
      },

      updateSession: (sessionData) => {
        set((state) => {
          if (state.activeSession) {
            Object.assign(state.activeSession, sessionData);
          }
        });
      },

      //  SIDEBAR COLLAPSED STATE
      sidebarCollapsed: false,

      toggleSidebar: () => {
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        });
      },

      //  STAFF LANGUAGE STATE
      staffLanguage: "hi", // 'hi' | 'en'

      setStaffLanguage: (lang) => {
        set((state) => {
          state.staffLanguage = lang;
        });
      },

      //  THEME STATE
      theme: "light",

      toggleTheme: () => {
        set((state) => {
          state.theme = state.theme === "light" ? "dark" : "light";
        });

        const newTheme = get().theme;
        document.documentElement.setAttribute("data-theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      },

      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
      },

      initTheme: () => {
        const { theme } = get();
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
      },

      //  NOTIFICATION / PII ALERT STATE
      piiAlert: null,

      showPIIAlert: (type) => {
        set((state) => {
          state.piiAlert = type;
        });

        // Auto-clear after 5 seconds
        setTimeout(() => {
          set((state) => {
            state.piiAlert = null;
          });
        }, 5000);
      },

      clearPIIAlert: () => {
        set((state) => {
          state.piiAlert = null;
        });
      },
    })),
    {
      name: "vaanibank-staff-store",
      onRehydrateStorage: () => (state) => {
        // Re-validate token from localStorage on rehydration
        if (state) {
          const token = localStorage.getItem("vaanibank_token");
          const staffStr = localStorage.getItem("vaanibank_staff");
          if (token && staffStr) {
            try {
              const staffData = JSON.parse(staffStr);
              state.staff = staffData;
              state.isAuthenticated = true;
              state.token = token;
            } catch {
              localStorage.removeItem("vaanibank_token");
              localStorage.removeItem("vaanibank_staff");
              state.isAuthenticated = false;
            }
          } else {
            state.isAuthenticated = false;
          }
          // Always clear exchanges on rehydration — they are ephemeral WebSocket
          // data that the backend restores via _replay_last_exchange on reconnect.
          // This also cleans up stale data from the old persist format.
          state.exchanges = [];
          state._hasHydrated = true;
        }
      },
      partialize: (state) => ({
        theme: state.theme,
        staffLanguage: state.staffLanguage,
        token: state.token,
        staff: state.staff,
        isAuthenticated: state.isAuthenticated,
        activeSession: state.activeSession,
        sessionStatus: state.sessionStatus,
        aiSuggestion: state.aiSuggestion, // persist last suggestion so it survives reload
        // NOTE: exchanges are NOT persisted — they are restored from DB via getSessionExchanges.
      }),
    },
  ),
);

//  HOOK EXPORT

export const useApp = useAppStore;

// Granular selectors for performance (P1 audit fix)

/** Auth state — login page, header, guards */
export const useAuth = () =>
  useAppStore((state) => ({
    staff: state.staff,
    isAuthenticated: state.isAuthenticated,
    token: state.token,
    login: state.login,
    logout: state.logout,
    restoreAuth: state.restoreAuth,
    refreshAuth: state.refreshAuth,
  }));

/** Conversation exchanges only — ConversationPanel */
export const useExchanges = () => useAppStore((s) => s.exchanges);

/** AI suggestion — AISuggestionBox */
export const useAISuggestion = () => useAppStore((s) => s.aiSuggestion);

/** Sentiment — SentimentIndicator */
export const useSentiment = () => useAppStore((s) => s.currentSentiment);

/** Intent — ProcessPanel header, intent badge */
export const useIntent = () => useAppStore((s) => s.currentIntent);

/** Listening/Processing flags — audio recording indicators */
export const useListeningState = () =>
  useAppStore((s) => ({
    isListening: s.isListening,
    isProcessing: s.isProcessing,
  }));

/** Process progress — ProcessPanel step tracker */
export const useProcessProgress = () =>
  useAppStore((s) => ({
    processSteps: s.processSteps,
    currentStep: s.currentStep,
    totalSteps: s.totalSteps,
    progressPercent: s.progressPercent,
  }));

/** InfoBoard — Conversation Intelligence panel */
export const useInfoBoard = () =>
  useAppStore((s) => ({
    infoBoard: s.infoBoard,
    updateInfoBoard: s.updateInfoBoard,
    clearInfoBoard: s.clearInfoBoard,
  }));

/** Document Readiness — DRV panel */
export const useDocReadiness = () =>
  useAppStore((s) => ({
    docReadiness: s.docReadiness,
    updateDocReadiness: s.updateDocReadiness,
  }));

/** Navigator — Smart Staff Navigator */
export const useNavigator = () =>
  useAppStore((s) => ({
    navigatorState: s.navigatorState,
    updateNavigator: s.updateNavigator,
  }));

/** Session actions — components that trigger mutations */
export const useSessionActions = () =>
  useAppStore((s) => ({
    createSession: s.createSession,
    endSession: s.endSession,
    resetSession: s.resetSession,
    addExchange: s.addExchange,
    updateSuggestion: s.updateSuggestion,
    clearSuggestion: s.clearSuggestion,
    updateProcessStep: s.updateProcessStep,
    setProcessSteps: s.setProcessSteps,
    loadProcessSteps: s.loadProcessSteps,
    setListening: s.setListening,
    setProcessing: s.setProcessing,
    updateSentiment: s.updateSentiment,
    updateIntent: s.updateIntent,
    updateSession: s.updateSession,
  }));

/** Full session state — kept for backward compatibility with components
 *  that genuinely need everything. Prefer granular selectors above. */
export const useSession = () =>
  useAppStore((state) => ({
    activeSession: state.activeSession,
    sessionStatus: state.sessionStatus,
    exchanges: state.exchanges,
    currentSentiment: state.currentSentiment,
    currentIntent: state.currentIntent,
    customerSelectedIntent: state.customerSelectedIntent,
    processSteps: state.processSteps,
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    progressPercent: state.progressPercent,
    aiSuggestion: state.aiSuggestion,
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    createSession: state.createSession,
    endSession: state.endSession,
    resetSession: state.resetSession,
    addExchange: state.addExchange,
    updateSuggestion: state.updateSuggestion,
    clearSuggestion: state.clearSuggestion,
    updateProcessStep: state.updateProcessStep,
    setProcessSteps: state.setProcessSteps,
    loadProcessSteps: state.loadProcessSteps,
    setListening: state.setListening,
    setProcessing: state.setProcessing,
    updateSentiment: state.updateSentiment,
    updateIntent: state.updateIntent,
    updateSession: state.updateSession,
    infoBoard: state.infoBoard,
    updateInfoBoard: state.updateInfoBoard,
    clearInfoBoard: state.clearInfoBoard,
  }));

export const useLiveTranscript = () => useAppStore((s) => s.liveTranscript);

export const useTheme = () =>
  useAppStore((state) => ({
    theme: state.theme,
    toggleTheme: state.toggleTheme,
    setTheme: state.setTheme,
    initTheme: state.initTheme,
  }));

export const usePII = () =>
  useAppStore((state) => ({
    piiAlert: state.piiAlert,
    showPIIAlert: state.showPIIAlert,
    clearPIIAlert: state.clearPIIAlert,
  }));

export default useAppStore;
