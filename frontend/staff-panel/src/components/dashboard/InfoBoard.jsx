/* ============================================
   VaaniBank AI — InfoBoard Component
   Conversation Intelligence Dashboard
   Union Bank of India | Team Vectora
   ============================================ */

import React, { useMemo, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import SmartNavigator from './SmartNavigator';
import toast from 'react-hot-toast';

// ── SendToFormButton — shown at bottom of InfoBoard when fields are collected ──
function SendToFormButton({ sendMessage, activeSession, filledFields }) {
  const [sent, setSent] = useState(false);

  const handleClick = useCallback(() => {
    if (!sendMessage || !activeSession) return;
    sendMessage('send_to_saral_form', {
      session_id: activeSession.id,
      token_number: activeSession.token_number,
    });
    setSent(true);
    toast.success('Form sent to customer for verification ✅', { duration: 3000 });
    setTimeout(() => setSent(false), 4000);
  }, [sendMessage, activeSession]);

  return (
    <div style={{
      padding: '10px 14px',
      borderTop: '2px solid rgba(22,163,74,0.2)',
      background: 'linear-gradient(135deg, rgba(22,163,74,0.04), transparent)',
    }}>
      <button
        onClick={handleClick}
        disabled={sent}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: 10,
          border: 'none',
          backgroundColor: sent ? '#16A34A' : '#003087',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          cursor: sent ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.2s ease',
          boxShadow: sent
            ? '0 2px 8px rgba(22,163,74,0.3)'
            : '0 2px 8px rgba(0,48,135,0.25)',
        }}
      >
        <span style={{ fontSize: 15 }}>{sent ? '✅' : '📝'}</span>
        <span>{sent ? 'Sent to Customer!' : `Send to Form Verification (${filledFields.length} fields)`}</span>
      </button>
      <p style={{
        margin: '5px 0 0',
        fontSize: 10,
        color: 'var(--text-muted)',
        textAlign: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        Customer will see SaralForm with pre-filled details to review & sign
      </p>
    </div>
  );
}

// ── Master field definitions ─────────────────────
// hindi = question staff should ASK customer to collect this info
const FIELD_LABELS = {
  // ─ common ────────────────────────────────────────────────────
  customer_name:          { label: 'Customer Name',       icon: '👤', hindi: 'आपका नाम क्या है?' },
  purpose:                { label: 'Purpose',             icon: '🎯', hindi: 'यह खाता या लोन किस काम के लिए चाहिए?' },
  aadhaar_provided:       { label: 'Aadhaar',             icon: '🪪', hindi: 'क्या आप Aadhaar card लाए हैं?' },
  pan_provided:           { label: 'PAN Card',            icon: '🆔', hindi: 'क्या आपके पास PAN card है?' },
  address_proof_provided: { label: 'Address Proof',       icon: '📍', hindi: 'क्या आपके पास address proof है — utility bill या Aadhaar?' },
  phone_number_provided:  { label: 'Phone Number',        icon: '📱', hindi: 'आपका registered mobile number क्या है?' },
  photos_provided:        { label: 'Passport Photos',     icon: '📸', hindi: 'क्या आप 2 passport size photos लाए हैं?' },
  // ─ loan_enquiry ─────────────────────────────────────────
  loan_type:              { label: 'Loan Type',           icon: '💰', hindi: 'कौन सा लोन चाहिए — Home, Personal, Education, या Mudra?' },
  amount:                 { label: 'Amount',              icon: '₹',  hindi: 'कितनी राशि चाहिए आपको?' },
  tenure:                 { label: 'Tenure',              icon: '📅', hindi: 'कितने साल या महीने के लिए चाहिए?' },
  monthly_income:         { label: 'Monthly Income',      icon: '💵', hindi: 'आपकी monthly income कितनी है?' },
  employment_type:        { label: 'Employment',          icon: '💼', hindi: 'आप Salaried हैं, Self-employed हैं, या Business करते हैं?' },
  cibil_score:            { label: 'CIBIL Score',         icon: '📊', hindi: 'क्या आपका CIBIL score pata है? (700+ ज़रूरी है)' },
  existing_emis:          { label: 'Existing EMIs',       icon: '🔄', hindi: 'अभी कोई और loan ki EMI तो नहीं चल रही?' },
  age:                    { label: 'Age',                 icon: '🎂', hindi: 'आपकी उम्र कितनी है?' },
  // ─ account_opening ─────────────────────────────────────
  account_type:           { label: 'Account Type',        icon: '🏦', hindi: 'कौन सा खाता चाहिए — Savings, Current, या Jan Dhan?' },
  pmjdy_eligible:         { label: 'PMJDY Eligible',      icon: '🏛️', hindi: 'क्या आप Jan Dhan (zero balance) खाता खोलना चाहते हैं?' },
  initial_deposit:        { label: 'Initial Deposit',     icon: '💳', hindi: 'खाता खोलने के लिए कितनी राशि जमा कराने हैं?' },
  nominee_name:           { label: 'Nominee',             icon: '👨‍👩‍👧', hindi: 'खाते में nominee का नाम क्या रखना है?' },
  // ─ kyc_update ────────────────────────────────────────────
  update_type:            { label: 'Update Type',         icon: '🔄', hindi: 'क्या अपडेट करना है — पता, मोबाइल, आधार सीडिंग, या नॉमिनी?' },
  aadhaar_status:         { label: 'Aadhaar Status',      icon: '📊', hindi: 'क्या आपका Aadhaar bank account से link है?' },
  address_type:           { label: 'Address Type',        icon: '🏠', hindi: 'नया पता क्या है — बिजली बिल या आधार के साथ अपडेट करना है?' },
  mobile_linked:          { label: 'Mobile Linked',       icon: '📱', hindi: 'क्या आपका mobile number account से link है?' },
  re_kyc_due:             { label: 'Re-KYC Due',          icon: '📅', hindi: 'आपका रि-केवाईसी कब तक करना है?' },
  // ─ fixed_deposit ──────────────────────────────────────────
  fd_type:                { label: 'FD Type',             icon: '🏦', hindi: 'रेगुलर FD चाहिए या स्वीप-इन FD?' },
  senior_citizen:         { label: 'Senior Citizen',      icon: '👴', hindi: 'क्या आप 60 साल या उससे ज़्यादा उम्र के हैं? (वरिष्ठ नागरिक दर मिलेगी)' },
  form_15g_applicable:    { label: 'Form 15G/15H',        icon: '📄', hindi: 'क्या आपकी आय कर योग्य नहीं है? फॉर्म 15G/15H जमा करना होगा।' },
  // ─ card_services ─────────────────────────────────────────
  card_type:              { label: 'Card Type',           icon: '💳', hindi: 'कौन सा कार्ड चाहिए — RuPay, VISA, या Mastercard?' },
  card_issue:             { label: 'Card Issue',          icon: '⚠️', hindi: 'कार्ड के साथ क्या समस्या है?' },
  card_block_reason:      { label: 'Block Reason',        icon: '🚫', hindi: 'कार्ड क्यों ब्लॉक करना है — खोया, चोरी, या क्षतिग्रस्त?' },
  pin_issue:              { label: 'PIN Issue',           icon: '🔢', hindi: 'PIN भूल गए हैं या PIN रीसेट करना है?' },
  // ─ balance_enquiry ────────────────────────────────────────
  account_number_provided:{ label: 'Account Number',      icon: '🏦', hindi: 'आपका account number क्या है?' },
  identity_verified:      { label: 'Identity Verified',   icon: '✅', hindi: 'क्या आपकी identity verify हो गई — DOB या OTP?' },
};

// ── Determine if a value is "filled" ────────────
function isFilled(val) {
  if (val === null || val === undefined || val === '' || val === false) return false;
  if (typeof val === 'string' && val.toLowerCase() === 'null') return false;
  return true;
}

// ── Format display value ────────────
function formatValue(key, val) {
  if (typeof val === 'boolean') return val ? '✅ Provided' : '—';
  if (typeof val === 'string') return val;
  return String(val);
}

export default function InfoBoard({ sendStaffApproved: propSendApproved, sendMessage }) {
  const infoBoard     = useApp((s) => s.infoBoard);
  const activeSession = useApp((s) => s.activeSession);
  const docReadiness  = useApp((s) => s.docReadiness);

  // "Sent ✓" animation state
  const [sentQuestion, setSentQuestion] = useState(false);

  const handleSendQuestion = useCallback((text, flag) => {
    if (!propSendApproved) return;
    propSendApproved(text, flag);
    setSentQuestion(true);
    setTimeout(() => setSentQuestion(false), 2000);
  }, [propSendApproved]);

  const nextQHindi =
    infoBoard?.next_question_hindi ??
    infoBoard?.suggested_next_question ??
    infoBoard?.next_question ?? '';

  const nextQCustomer =
    infoBoard?.next_question_customer_lang ??
    infoBoard?.next_question_translated ?? '';

  // Parse and categorize fields
  const { filledFields, missingFields, completionPct } = useMemo(() => {
    if (!infoBoard?.collected_info) {
      return { filledFields: [], missingFields: [], completionPct: 0 };
    }

    const info = infoBoard.collected_info;
    const filled = [];
    const missing = [];

    for (const [key, val] of Object.entries(info)) {
      const meta = FIELD_LABELS[key];
      if (!meta) continue; // skip unknown keys

      if (isFilled(val)) {
        filled.push({ key, val, ...meta });
      } else {
        missing.push({ key, val, ...meta });
      }
    }

    const total = filled.length + missing.length;
    const pct = total > 0 ? Math.round((filled.length / total) * 100) : 0;

    return { filledFields: filled, missingFields: missing, completionPct: pct };
  }, [infoBoard]);

  if (!infoBoard) return null;

  const conversationStage = infoBoard?.conversation_stage || 'exploring';
  const isExploring = conversationStage === 'exploring';

  const hasInfoContent = filledFields.length > 0 || missingFields.length > 0;
  // Always render if we have infoBoard data, docReadiness, or nextQuestion
  // (previously this guard hid the entire panel when LLM returned all-null fields)

  // Progress bar color
  const barColor = completionPct >= 75
    ? 'var(--success)'
    : completionPct >= 40
    ? 'var(--warning)'
    : 'var(--accent-blue)';

  return (
    <div className="info-board animate-slide-up" style={styles.container}>
      {/* ── Header ────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>🧠</span>
          <span style={styles.headerTitle}>AI Information Board</span>
          {/* ── Conversation Stage Badge ── */}
          <span style={{
            ...styles.stageBadge,
            backgroundColor: isExploring ? 'rgba(59,130,246,0.12)' : 'rgba(34,197,94,0.12)',
            color: isExploring ? '#3b82f6' : '#22c55e',
          }}>
            {isExploring ? '📚 Exploring' : '📋 Applying'}
          </span>
        </div>
        <div style={styles.headerBadge}>
          <span style={styles.badgeText}>{completionPct}%</span>
        </div>
      </div>

      {/* ── Progress Bar ──────────────────────── */}
      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${completionPct}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      {/* ── Document Readiness (DRV) ──────────── */}
      {docReadiness && docReadiness.docs && docReadiness.docs.length > 0 && (
        <div style={styles.section}>
          <div style={styles.drvHeader}>
            <div style={styles.sectionLabel}>
              <span>📎</span>
              <span>Document Readiness</span>
            </div>
            <span style={{
              ...styles.drvScoreBadge,
              backgroundColor: docReadiness.score >= 80
                ? 'rgba(34,197,94,0.12)' : docReadiness.score >= 40
                ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
              color: docReadiness.score >= 80
                ? '#16a34a' : docReadiness.score >= 40
                ? '#d97706' : '#dc2626',
            }}>
              {docReadiness.confirmed}/{docReadiness.total} • {docReadiness.score}%
            </span>
          </div>

          {/* DRV progress bar */}
          <div style={styles.drvProgressTrack}>
            <div style={{
              ...styles.drvProgressFill,
              width: `${docReadiness.score}%`,
              backgroundColor: docReadiness.score >= 80
                ? '#22c55e' : docReadiness.score >= 40
                ? '#f59e0b' : '#ef4444',
            }} />
          </div>

          {/* Per-doc rows */}
          <div style={styles.drvGrid}>
            {docReadiness.docs.map((doc) => (
              <div key={doc.id} style={{
                ...styles.drvDocRow,
                backgroundColor: doc.confirmed ? 'var(--success-bg)' : 'var(--warning-bg)',
              }}>
                <span style={styles.drvDocIcon}>
                  {doc.confirmed ? '✅' : '❌'}
                </span>
                <div style={styles.drvDocInfo}>
                  <span style={styles.drvDocLabel}>{doc.label_en}</span>
                  {doc.required && (
                    <span style={styles.drvReqBadge}>Required</span>
                  )}
                </div>
                <span style={styles.drvDocStatus}>
                  {doc.confirmed ? 'Confirmed' : 'Pending'}
                </span>
                {!doc.confirmed && propSendApproved && (() => {
                  const hindiQ = `क्या आपके पास ${doc.label_en} है?`;
                  return (
                    <button
                      title={`Ask: "${hindiQ}"`}
                      style={styles.drvAskBtn}
                      onClick={() => propSendApproved(hindiQ, false)}
                    >
                      🎤
                    </button>
                  );
                })()}
              </div>
            ))}
          </div>

          {docReadiness.score < 50 && docReadiness.missing?.length > 0 && (
            <div style={styles.drvAlert}>
              ⚠️ {docReadiness.missing.length} required document(s) still unconfirmed
            </div>
          )}
        </div>
      )}

      {/* ── Collected Fields ──────────────────── */}
      {filledFields.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionLabel}>
            <span>✅</span>
            <span>Collected Information</span>
          </div>
          <div style={styles.fieldGrid}>
            {filledFields.map((f) => (
              <div key={f.key} style={styles.fieldCard}>
                <div style={styles.fieldIcon}>{f.icon}</div>
                <div style={styles.fieldContent}>
                  <div style={styles.fieldLabel}>{f.label}</div>
                  <div style={styles.fieldValue}>{formatValue(f.key, f.val)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Missing Fields ── */}
      {missingFields.length > 0 && (
        <div style={styles.section}>
          <div style={{ ...styles.sectionLabel, color: 'var(--warning)' }}>
            <span>⏳</span>
            <span>Still Needed</span>
          </div>
          <div style={styles.missingGrid}>
            {missingFields.map((f) => (
              <div key={f.key} style={styles.missingChip}>
                <span>{f.icon}</span>
                <span style={{ flex: 1 }}>{f.label}</span>
                {propSendApproved && f.hindi && (
                  <button
                    title={`Ask: "${f.hindi}"`}
                    style={styles.askChipBtn}
                    onClick={() => propSendApproved(f.hindi, false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0,48,135,0.18)';
                      e.currentTarget.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0,48,135,0.10)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    🎤
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Smart Staff Navigator (deterministic) ──────── */}
      <SmartNavigator sendStaffApproved={propSendApproved} sendMessage={sendMessage} />

      {/* ── Auto Step Completion ──────────────── */}
      {infoBoard.auto_step_completed && (
        <div style={styles.autoStep}>
          <span>🤖</span>
          <span>Auto-completed: <strong>{infoBoard.auto_step_completed}</strong></span>
        </div>
      )}

      {/* ── Send to Form Verification (only when fields collected) ── */}
      {filledFields.length > 0 && sendMessage && activeSession && (
        <SendToFormButton
          sendMessage={sendMessage}
          activeSession={activeSession}
          filledFields={filledFields}
        />
      )}

    </div>
  );
}

// ── Shared font stack — matches ProcessPanel step text exactly ─────────
const FONT = "'Inter', system-ui, 'Segoe UI', Roboto, sans-serif";

// ── Inline styles using CSS variables ────────────
const styles = {
  container: {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: 12,
    boxShadow: 'var(--card-shadow)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: FONT,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid var(--card-border)',
    background: 'linear-gradient(135deg, rgba(0,48,135,0.06), rgba(0,48,135,0.02))',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: FONT,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  stageBadge: {
    fontSize: 11,
    fontWeight: 600,
    fontFamily: FONT,
    padding: '2px 8px',
    borderRadius: 6,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  headerBadge: {
    backgroundColor: 'var(--accent-blue)',
    color: '#fff',
    borderRadius: 8,
    padding: '2px 8px',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: FONT,
  },
  badgeText: {
    fontVariantNumeric: 'tabular-nums',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'var(--card-border)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
  },
  section: {
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: FONT,
    color: 'var(--success)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  fieldGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  fieldCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 8,
    backgroundColor: 'var(--success-bg)',
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
  },
  fieldIcon: {
    fontSize: 14,
    flexShrink: 0,
    width: 22,
    textAlign: 'center',
  },
  fieldContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 600,
    fontFamily: FONT,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: 500,
    fontFamily: FONT,
    color: 'var(--text-primary)',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  missingGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
  missingChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 6px 4px 8px',
    borderRadius: 6,
    backgroundColor: 'var(--warning-bg)',
    border: '1px solid transparent',
    fontSize: 12,
    fontFamily: FONT,
    color: 'var(--warning)',
    fontWeight: 500,
  },
  askChipBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 5px',
    borderRadius: 4,
    border: 'none',
    background: 'rgba(0,48,135,0.10)',
    cursor: 'pointer',
    fontSize: 12,
    lineHeight: 1,
    transition: 'background 0.15s, transform 0.15s',
    flexShrink: 0,
  },
  nextSection: {
    padding: '10px 14px',
    borderTop: '1px solid var(--card-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    background: 'linear-gradient(135deg, rgba(37,99,235,0.04), transparent)',
  },
  nextLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: FONT,
    color: 'var(--info)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  nextQuestion: {
    fontSize: 14,
    fontWeight: 500,
    fontFamily: FONT,
    color: 'var(--text-primary)',
    lineHeight: 1.5,
    padding: '6px 10px',
    borderRadius: 8,
    backgroundColor: 'var(--info-bg)',
    borderLeft: '3px solid var(--info)',
  },
  nextQuestionCustomer: {
    fontSize: 13,
    fontFamily: FONT,
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    paddingLeft: 13,
    lineHeight: 1.4,
  },
  askButton: {
    marginTop: 4,
    padding: '7px 14px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'var(--accent-blue)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: FONT,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    boxShadow: '0 2px 4px rgba(0,48,135,0.2)',
  },
  autoStep: {
    padding: '8px 14px',
    borderTop: '1px solid var(--card-border)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontFamily: FONT,
    color: 'var(--success)',
    fontWeight: 500,
    background: 'var(--success-bg)',
  },
  /* scrollBody removed — scroll is now in the DashboardPage column wrapper */
  // ── DRV (Document Readiness) styles ─────────────
  drvHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drvScoreBadge: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: FONT,
    padding: '2px 8px',
    borderRadius: 6,
  },
  drvProgressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'var(--card-border)',
    overflow: 'hidden',
    marginTop: 4,
  },
  drvProgressFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.5s ease, background-color 0.3s ease',
  },
  drvGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    marginTop: 6,
  },
  drvDocRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 8px',
    borderRadius: 6,
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
  },
  drvDocIcon: {
    fontSize: 14,
    flexShrink: 0,
    width: 20,
    textAlign: 'center',
  },
  drvDocInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  drvDocLabel: {
    fontSize: 14,
    fontWeight: 500,
    fontFamily: FONT,
    color: 'var(--text-primary)',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  drvReqBadge: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT,
    padding: '1px 4px',
    borderRadius: 3,
    backgroundColor: 'rgba(239,68,68,0.1)',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    flexShrink: 0,
  },
  drvDocStatus: {
    fontSize: 11,
    fontWeight: 600,
    fontFamily: FONT,
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  drvAskBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 5px',
    borderRadius: 4,
    border: 'none',
    background: 'rgba(0,48,135,0.10)',
    cursor: 'pointer',
    fontSize: 12,
    lineHeight: 1,
    transition: 'background 0.15s, transform 0.15s',
    flexShrink: 0,
  },
  drvAlert: {
    marginTop: 6,
    padding: '6px 10px',
    borderRadius: 6,
    backgroundColor: 'rgba(239,68,68,0.06)',
    border: '1px solid rgba(239,68,68,0.15)',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: FONT,
    color: '#dc2626',
  },
};
