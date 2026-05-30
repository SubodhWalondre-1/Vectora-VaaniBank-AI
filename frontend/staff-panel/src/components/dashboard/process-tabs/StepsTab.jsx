import { motion } from "framer-motion";

// Language display names (for Speak button label)
const LANG_DISPLAY = {
  hi: "Hindi",
  ta: "Tamil",
  gu: "Gujarati",
  ml: "Malayalam",
  te: "Telugu",
  mr: "Marathi",
  bn: "Bengali",
  kn: "Kannada",
  or: "Odia",
  pa: "Punjabi",
  en: "English",
};

export default function StepsTab({ steps, completedCount, stepLabel, langCode, staffLanguage, onComplete, onSpeak }) {
  const shortCode  = (langCode || "hi").split("-")[0];
  const langName   = LANG_DISPLAY[shortCode] ?? shortCode.toUpperCase();
  const isEnglish  = staffLanguage === 'en';

  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const isCompleted = index < completedCount;
        const isCurrent   = index + 1 === stepLabel;
        const isPending   = !isCurrent && !isCompleted;

        // Text to display — respects staffLanguage toggle (Hindi / English)
        const displayTitle = isEnglish
          // English mode: prefer English fields
          ? (step.textEnglish ||
             step.step_text_english ||
             step.step_text_customer ||
             step.step_text ||
             step.title ||
             `Step ${index + 1}`)
          // Hindi mode: prefer Hindi fields
          : (step.step_text_customer ||
             (langCode && step[`step_text_${langCode}`]) ||
             step.step_text_hindi ||
             step.textHindi ||
             step.step_text ||
             step.title ||
             `Step ${index + 1}`);

        // Detail text (from processes/*.json format)
        const displayDetail = step.detail || step.staff_action || step.description || null;

        // RBI mandatory flag — from bankingKnowledge or DB step
        const isRBIMandatory = step.isRBIMandatory ?? false;

        // Doc hint for current step
        const docHint = step.docHint ?? null;

        // Speak button label — use speakLabel from KB, else generic with language
        const speakBtnLabel = step.speakLabel
          ? `${step.speakLabel} (${langName})`
          : `Speak in ${langName}`;

        return (
          <motion.div
            key={step.id ?? step.num ?? index}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 24 }}
            className="flex gap-3 py-2.5"
            style={{
              borderBottom: index < steps.length - 1
                ? "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.08))"
                : "none",
            }}
          >
            {/* Step circle */}
            <button
              onClick={() => !isCompleted && !isPending && onComplete(step)}
              disabled={isCompleted || isPending}
              className="shrink-0 flex items-center justify-center rounded-full transition-all duration-150"
              style={{
                width: 26,
                height: 26,
                marginTop: 1,
                flexShrink: 0,
                background: isCompleted ? "#16a34a" : isCurrent ? "#003087" : "transparent",
                border: isCompleted
                  ? "none"
                  : isCurrent
                  ? "none"
                  : "0.5px solid var(--color-border-secondary, rgba(0,0,0,0.15))",
                cursor: isCompleted || isPending ? "default" : "pointer",
              }}
            >
              {isCompleted ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span
                  className="text-xs font-medium"
                  style={{ color: isCurrent ? "#fff" : "var(--color-text-secondary, #64748b)" }}
                >
                  {index + 1}
                </span>
              )}
            </button>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">

              {/* RBI mandatory badge */}
              {isRBIMandatory && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  alignSelf: "flex-start",
                  background: "#FAEEDA", color: "#854F0B",
                  borderRadius: 6, padding: "1px 7px", fontSize: 10, fontWeight: 600,
                }}>
                  ⚠️ RBI Mandatory
                </div>
              )}

              <p
                className="text-sm leading-snug font-medium"
                style={{
                  color: isCompleted
                    ? "var(--color-text-secondary, #64748b)"
                    : "var(--color-text-primary, #0f172a)",
                  textDecoration: isCompleted ? "line-through" : "none",
                }}
              >
                {displayTitle}
              </p>

              {/* Step detail — shown for current step (expanded) or all steps on hover */}
              {displayDetail && (isCurrent || !isCompleted) && (
                <p
                  style={{
                    fontSize: 11,
                    color: isCurrent ? "#0C447C" : "var(--color-text-secondary, #64748b)",
                    lineHeight: 1.5,
                    background: isCurrent ? "#EAF3FC" : "transparent",
                    borderRadius: isCurrent ? 6 : 0,
                    padding: isCurrent ? "3px 7px" : "0",
                    marginTop: 1,
                  }}
                >
                  {displayDetail}
                </p>
              )}

              {/* Doc hint for current step */}
              {isCurrent && docHint && (
                <div style={{
                  fontSize: 11,
                  color: "#0C447C",
                  background: "#E6F1FB",
                  borderRadius: 6,
                  padding: "2px 8px",
                  alignSelf: "flex-start",
                }}>
                  📎 {docHint}
                </div>
              )}

              {/* Speak to Customer button — language aware */}
              {isCurrent && (step.speakToCustomer || step.speak_to_customer) && (
                <button
                  onClick={() => onSpeak(step)}
                  className="self-start flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: "#FCEBEB",
                    color: "#A32D2D",
                    border: "none",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                  {speakBtnLabel}
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
