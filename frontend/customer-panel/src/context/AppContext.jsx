/*
   VaaniBank AI — Customer Panel State (Zustand)
   Union Bank of India | Team Vectora
   */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

//  CUSTOMER APP STORE

const useCustomerStore = create(
  persist(
    immer((set, get) => ({
      //  SESSION STATE
      tokenNumber: null,
      sessionId: null,
      branchCode: null,
      customerLanguage: null,
      customerLanguageCode: null,
      status: "idle", // idle | active | ended
      staffMessage: null,
      audioUrl: null,
      staffMessageSeq: 0,
      summary: null,
      entryMethod: null, // 'qr_scan' | 'walk_in'
      staffTyping: false, // true when staff is preparing a response (TTS generating)
      chatHistory: [], // array of { id, type, text, audioUrl, timestamp }
      isAudioUnlocked: false,
      selectedService: null, // { id, labels, ... }
      intent: null,
      docChecklist: null, // { checklist: [], intent: "" }

      setLanguage: (lang, code) => {
        set((state) => {
          state.customerLanguage = lang;
          state.customerLanguageCode = code;
        });
      },

      setSession: (
        tokenNumber,
        sessionId,
        branchCode,
        entryMethod = "walk_in",
      ) => {
        console.log(
          "setSession called with:",
          tokenNumber,
          sessionId,
          branchCode,
        );
        set((state) => {
          state.tokenNumber = tokenNumber;
          state.sessionId = sessionId;
          state.branchCode = branchCode;
          state.entryMethod = entryMethod;
          state.status = "active";
          state.staffMessage = null;
          state.audioUrl = null;
          state.staffMessageSeq = 0;
          state.summary = null;
          state.chatHistory = [];
          state.selectedService = null;
          state.intent = null;
        });
      },

      setSelectedService: (service) => {
        set((state) => {
          state.selectedService = service;
          state.intent = service?.id || null;
        });
      },

      setDocChecklist: (data) => {
        set((state) => {
          state.docChecklist = data;
        });
      },

      setStaffMessage: (text, audioUrl) => {
        set((state) => {
          state.staffMessage = text;
          state.audioUrl = audioUrl || null;
          state.staffMessageSeq += 1;
          state.staffTyping = false; // response arrived, stop typing indicator

          // Add to chat history
          const id = `staff-${state.staffMessageSeq}-${Date.now()}`;
          state.chatHistory.push({
            id,
            type: "staff",
            text,
            audioUrl: audioUrl || null,
            timestamp: new Date().toISOString(),
          });
        });
      },

      addCustomerMessage: (text) => {
        set((state) => {
          const id = `customer-${Date.now()}`;
          state.chatHistory.push({
            id,
            type: "customer",
            text,
            timestamp: new Date().toISOString(),
          });
        });
      },

      unlockAudio: () => {
        set((state) => {
          state.isAudioUnlocked = true;
        });
      },

      setStaffTyping: (typing) => {
        set((state) => {
          state.staffTyping = typing;
        });
      },

      setSummary: (summaryData) => {
        set((state) => {
          state.summary = summaryData;
        });
      },

      setStatus: (status) => {
        set((state) => {
          state.status = status;
        });
      },

      endSession: () => {
        set((state) => {
          state.status = "ended";
          state.staffMessage = null;
          state.audioUrl = null;
          state.staffTyping = false;
          state.chatHistory = [];
          state.selectedService = null;
          state.intent = null;
          state.docChecklist = null;
        });
      },

      updateLastMessageAudio: (audioUrl) => {
        set((state) => {
          state.audioUrl = audioUrl || null;
          for (let i = state.chatHistory.length - 1; i >= 0; i--) {
            if (state.chatHistory[i].type === "staff") {
              state.chatHistory[i].audioUrl = audioUrl || null;
              break;
            }
          }
        });
      },

      resetSession: () => {
        set((state) => {
          state.tokenNumber = null;
          state.sessionId = null;
          state.branchCode = null;
          state.customerLanguage = null;
          state.customerLanguageCode = null;
          state.status = "idle";
          state.staffMessage = null;
          state.audioUrl = null;
          state.staffMessageSeq = 0;
          state.summary = null;
          state.entryMethod = null;
          state.chatHistory = [];
          state.selectedService = null;
          state.intent = null;
          state.docChecklist = null;
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
    })),
    {
      name: "vaanibank-customer-store",
      partialize: (state) => ({
        theme: state.theme,
        customerLanguage: state.customerLanguage,
        customerLanguageCode: state.customerLanguageCode,
        tokenNumber: state.tokenNumber,
        sessionId: state.sessionId,
        branchCode: state.branchCode,
        entryMethod: state.entryMethod,
        chatHistory: state.chatHistory,
        staffMessageSeq: state.staffMessageSeq,
        selectedService: state.selectedService,
        intent: state.intent,
        docChecklist: state.docChecklist,
      }),
    },
  ),
);

//  HOOK EXPORTS

export const useCustomerApp = useCustomerStore;

// Selectors for performance
export const useSessionState = () =>
  useCustomerStore((state) => ({
    tokenNumber: state.tokenNumber,
    sessionId: state.sessionId,
    branchCode: state.branchCode,
    customerLanguage: state.customerLanguage,
    customerLanguageCode: state.customerLanguageCode,
    status: state.status,
    staffMessage: state.staffMessage,
    audioUrl: state.audioUrl,
    staffMessageSeq: state.staffMessageSeq,
    summary: state.summary,
    setLanguage: state.setLanguage,
    setSession: state.setSession,
    setStaffMessage: state.setStaffMessage,
    setSummary: state.setSummary,
    setStatus: state.setStatus,
    endSession: state.endSession,
    resetSession: state.resetSession,
    updateLastMessageAudio: state.updateLastMessageAudio,
  }));

export const useTheme = () =>
  useCustomerStore((state) => ({
    theme: state.theme,
    toggleTheme: state.toggleTheme,
    setTheme: state.setTheme,
    initTheme: state.initTheme,
  }));

export default useCustomerStore;
