/*
   VaaniBank AI — Smart Staff Navigator
   Deterministic Phase-Aware Guidance Panel
   Union Bank of India | Team Vectora

   Replaces LLM-based "AI Suggests You Ask Next"
   with a deterministic state machine output.
   100% reliable. Never repeats. Phase-aware.
   */

import React, { useState, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { aiAPI } from '../../services/api';

// Phase → visual config
const PHASE_CONFIG = {
  greet:   { icon: '🤝', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  label: 'Welcome' },
  educate: { icon: '📚', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',  label: 'Explaining Service' },
  collect: { icon: '📋', color: '#0891b2', bg: 'rgba(8,145,178,0.08)',   label: 'Collecting Info' },
  verify:  { icon: '📎', color: '#d97706', bg: 'rgba(217,119,6,0.08)',   label: 'Verifying Documents' },
  process: { icon: '✅', color: '#16a34a', bg: 'rgba(22,163,74,0.08)',   label: 'Processing' },
  close:   { icon: '👋', color: '#64748b', bg: 'rgba(100,116,139,0.08)', label: 'Session Complete' },
};

export default function SmartNavigator({ sendStaffApproved, sendMessage, sendForceNext, sendEditField, sendUndoNext }) {
  const nav = useApp((s) => s.navigatorState);
  const activeSession = useApp((s) => s.activeSession);
  const staffLanguage = useApp((s) => s.staffLanguage);
  const sessionId = activeSession?.id ?? activeSession?.session_id ?? null;

  const [translatedTexts, setTranslatedTexts] = useState({});
  const translatingRef = useRef(new Set());

  React.useEffect(() => {
    if (staffLanguage !== 'en' || !nav) return;

    // Collect all Hindi texts to translate
    const textsToTranslate = [];
    if (nav.phase === 'greet' && nav.greeting_script) {
      textsToTranslate.push(nav.greeting_script);
    }
    if (nav.next_question && nav.next_question.question_hi) {
      textsToTranslate.push(nav.next_question.question_hi);
    }
    if (nav.phase === 'close' && nav.farewell_script) {
      textsToTranslate.push(nav.farewell_script);
    }
    if (nav.missing && Array.isArray(nav.missing)) {
      nav.missing.forEach(f => {
        if (f.question_hi) textsToTranslate.push(f.question_hi);
      });
    }

    // Filter to only new texts not already translated or in-flight
    const newTexts = textsToTranslate.filter(txt => !translatedTexts[txt] && !translatingRef.current.has(txt));

    if (newTexts.length === 0) return;

    newTexts.forEach(txt => {
      translatingRef.current.add(txt);
      aiAPI.translateToEnglish(txt)
        .then(eng => {
          setTranslatedTexts(prev => ({ ...prev, [txt]: eng }));
        })
        .catch(() => {
          setTranslatedTexts(prev => ({ ...prev, [txt]: txt })); // fallback: original
        })
        .finally(() => {
          translatingRef.current.delete(txt);
        });
    });
  }, [staffLanguage, nav, translatedTexts]);

  // Utility to get localized guided scripts
  const getGuidedText = useCallback((txt) => {
    if (staffLanguage !== 'en' || !txt) return txt;
    return translatedTexts[txt] || (translatingRef.current.has(txt) ? 'Translating...' : txt);
  }, [staffLanguage, translatedTexts]);

  const [sentKey, setSentKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [forcingNext, setForcingNext] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  // Post-ask inline edit in Ask Next card
  const [postAskEditKey, setPostAskEditKey] = useState(null);
  const [postAskEditValue, setPostAskEditValue] = useState('');
  const [savingPostAsk, setSavingPostAsk] = useState(false);

  // Track history of asked field keys for Undo
  const questionHistoryRef = useRef([]);

  React.useEffect(() => {
    if (nav?.verification_submitted) {
      setSubmitting(false);
    }
  }, [nav?.verification_submitted]);

  // Reset force/undo states when backend responds with new next_question
  React.useEffect(() => {
    setForcingNext(false);
    setUndoing(false);
    // Clear post-ask edit if backend moved to a different field
    setPostAskEditKey((prev) => {
      if (prev && prev !== nav?.next_question?.key) return null;
      return prev;
    });
  }, [nav?.next_question?.key]);

  const handleSubmitVerification = useCallback(() => {
    if (!sessionId) { console.error("No active session ID found."); return; }
    if (!sendMessage) { console.error("sendMessage missing."); return; }
    setSubmitting(true);
    sendMessage('submit_verification', { session_id: sessionId });
  }, [sessionId, sendMessage]);

  const handleAsk = useCallback((questionHi, fieldKey) => {
    if (!sendStaffApproved) return;
    sendStaffApproved(questionHi, true);
    setSentKey(fieldKey);
    if (fieldKey && fieldKey !== '__greet__' && fieldKey !== '__farewell__') {
      questionHistoryRef.current = [...questionHistoryRef.current.slice(-9), fieldKey];
    }
    // After "Ask This" — show Edit box after 2.5s for manual capture
    if (fieldKey && fieldKey !== '__greet__' && fieldKey !== '__farewell__') {
      setTimeout(() => {
        setSentKey(null);
        setPostAskEditKey(fieldKey);
        setPostAskEditValue('');
      }, 2500);
    } else {
      setTimeout(() => setSentKey(null), 2500);
    }
  }, [sendStaffApproved]);

  const handlePostAskSave = useCallback(() => {
    if (!postAskEditKey || !postAskEditValue.trim()) return;
    setSavingPostAsk(true);
    sendEditField?.(postAskEditKey, postAskEditValue.trim());
    setTimeout(() => {
      setSavingPostAsk(false);
      setPostAskEditKey(null);
      setPostAskEditValue('');
      if (sendForceNext) sendForceNext(postAskEditKey);
    }, 400);
  }, [postAskEditKey, postAskEditValue, sendEditField, sendForceNext]);

  const handlePostAskCancel = useCallback(() => {
    setPostAskEditKey(null);
    setPostAskEditValue('');
  }, []);

  const handleForceNext = useCallback(() => {
    if (!sendForceNext) return;
    setForcingNext(true);
    sendForceNext(nav?.next_question?.key ?? null);
    setTimeout(() => setForcingNext(false), 4000);
  }, [sendForceNext, nav?.next_question?.key]);

  const handleUndo = useCallback(() => {
    if (!sendUndoNext || !nav?.collected || nav.collected.length === 0) return;
    const lastField = nav.collected[nav.collected.length - 1];
    setUndoing(true);
    sendUndoNext(lastField?.key ?? null);
    setTimeout(() => setUndoing(false), 2000);
  }, [sendUndoNext, nav?.collected]);

  const handleEditStart = useCallback((fieldKey, currentValue) => {
    setEditingKey(fieldKey);
    setEditValue(typeof currentValue === 'boolean' ? (currentValue ? 'Yes' : 'No') : (currentValue ?? ''));
  }, []);

  const handleEditSave = useCallback(() => {
    if (!editingKey || !editValue.trim()) return;
    setSavingEdit(true);
    sendEditField?.(editingKey, editValue.trim());
    setTimeout(() => { setSavingEdit(false); setEditingKey(null); setEditValue(''); }, 600);
  }, [editingKey, editValue, sendEditField]);

  const handleEditCancel = useCallback(() => { setEditingKey(null); setEditValue(''); }, []);

  if (!nav) return null;

  const phaseConf = PHASE_CONFIG[nav.phase] || PHASE_CONFIG.collect;

  return (
    <div style={styles.container}>
      {/* ── Phase Badge + Progress ────────── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={{ ...styles.phaseIcon, backgroundColor: phaseConf.bg }}>
            {phaseConf.icon}
          </span>
          <div>
            <div style={styles.phaseLabel}>{phaseConf.label}</div>
            <div style={styles.phaseSub}>
              {nav.filled_fields}/{nav.total_fields} fields • {nav.fill_percent}%
            </div>
          </div>
        </div>
        <div style={{
          ...styles.phaseBadge,
          backgroundColor: phaseConf.bg,
          color: phaseConf.color,
        }}>
          {nav.phase.toUpperCase()}
        </div>
      </div>

      {/* ── Progress Bar ─────────────────── */}
      <div style={styles.progressTrack}>
        <div style={{
          ...styles.progressFill,
          width: `${nav.fill_percent}%`,
          backgroundColor: nav.fill_percent >= 80 ? '#22c55e' :
                           nav.fill_percent >= 40 ? '#f59e0b' : '#3b82f6',
        }} />
      </div>

      {/* ── Phase: GREET ─────────────────── */}
      {nav.phase === 'greet' && (
        <div style={styles.scriptCard}>
          <div style={styles.scriptLabel}>🎤 Greeting Script</div>
          <div style={styles.scriptText}>{getGuidedText(nav.greeting_script)}</div>
          {sendStaffApproved && (
            <button
              style={styles.askBtn}
              onClick={() => handleAsk(nav.greeting_script, '__greet__')}
            >
              {sentKey === '__greet__' ? '✅ Sent!' : '🎤 Speak Greeting'}
            </button>
          )}
        </div>
      )}

      {/* ── Phase: COLLECT / EDUCATE — Next Question ── */}
      {(nav.phase === 'collect' || nav.phase === 'educate') && nav.next_question && (
        <div style={styles.nextCard}>
          <div style={styles.nextLabel}>⏭️ Ask Next</div>
          <div style={styles.nextBody}>
            <div style={styles.nextFieldLabel}>{nav.next_question.label}</div>
            <div style={styles.nextQuestionText}>{getGuidedText(nav.next_question.question_hi)}</div>
            {/* Post-ask inline edit box */}
            {postAskEditKey === nav.next_question.key && (
              <div style={{
                marginTop: 8,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(217,119,6,0.35)',
                backgroundColor: 'rgba(217,119,6,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: FONT }}>
                  ✏️ Voice didn't capture? Type manually:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    autoFocus
                    placeholder={`Enter ${nav.next_question.label}...`}
                    value={postAskEditValue}
                    onChange={(e) => setPostAskEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handlePostAskSave();
                      if (e.key === 'Escape') handlePostAskCancel();
                    }}
                    style={{ ...styles.inlineEditInput }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <button
                      onClick={handlePostAskCancel}
                      style={{ ...styles.editCancelBtn, padding: '4px 10px', fontSize: 11 }}
                      title="Cancel"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePostAskSave}
                      disabled={savingPostAsk || !postAskEditValue.trim()}
                      style={{ ...styles.editSaveBtn, padding: '4px 10px', fontSize: 11 }}
                      title="Save and move to next question"
                    >
                      {savingPostAsk ? '⏳' : '✓ Save & Next'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Action buttons row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {/* Ask This — hidden when post-ask edit is open */}
              {sendStaffApproved && postAskEditKey !== nav.next_question.key && (
                <button
                  style={{
                    ...styles.askBtn,
                    ...(sentKey === nav.next_question.key ? styles.askBtnSent : {}),
                  }}
                  onClick={() => handleAsk(nav.next_question.question_hi, nav.next_question.key)}
                  disabled={sentKey === nav.next_question.key}
                >
                  {sentKey === nav.next_question.key ? '✅ Sent!' : '🎤 Ask This'}
                </button>
              )}
              {/* Re-ask — visible only in post-ask mode */}
              {postAskEditKey === nav.next_question.key && sendStaffApproved && (
                <button
                  style={{
                    ...styles.nextBtn,
                    borderColor: 'rgba(217,119,6,0.45)',
                    color: '#d97706',
                  }}
                  onClick={() => {
                    sendStaffApproved(nav.next_question.question_hi, true);
                    setSentKey(nav.next_question.key);
                    setTimeout(() => setSentKey(null), 2500);
                  }}
                  title="Re-ask the same question"
                >
                  🔁 Re-ask
                </button>
              )}
              {/* Next — force advance */}
              {sendForceNext && (
                <button
                  style={{
                    ...styles.nextBtn,
                    opacity: forcingNext ? 0.55 : 1,
                    cursor: forcingNext ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleForceNext}
                  disabled={forcingNext}
                  title="Skip — advance to next field even if customer hasn't answered clearly"
                >
                  {forcingNext ? '⏳ Moving...' : '⏭️ Next'}
                </button>
              )}
              {/* Undo — go back */}
              {sendUndoNext && nav?.collected && nav.collected.length >= 1 && (
                <button
                  style={{
                    ...styles.undoBtn,
                    opacity: undoing ? 0.55 : 1,
                    cursor: undoing ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleUndo}
                  disabled={undoing}
                  title="Go back to the previous question"
                >
                  {undoing ? '⏳...' : '↩️ Undo'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Collected fields ──────────────── */}
      {nav.collected && nav.collected.length > 0 && (
        <div style={styles.fieldSection}>
          <div style={{ ...styles.sectionLabel, color: '#16a34a' }}>
            <span>✅</span>
            <span>Collected ({nav.collected.length})</span>
          </div>
          <div style={styles.fieldGrid}>
            {nav.collected.map((f) => {
              const isEditing = editingKey === f.key;
              return (
                <div key={f.key} style={styles.collectedRow}>
                  <span style={styles.fieldBullet}>•</span>
                  <span style={styles.collectedLabel}>{f.label}</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        style={styles.inlineEditInput}
                      />
                      <button
                        onClick={handleEditSave}
                        disabled={savingEdit || !editValue.trim()}
                        style={styles.editSaveBtn}
                        title="Save correction"
                      >
                        {savingEdit ? '⏳' : '✓'}
                      </button>
                      <button
                        onClick={handleEditCancel}
                        style={styles.editCancelBtn}
                        title="Cancel"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
                      <span style={styles.collectedValue}>
                        {typeof f.value === 'string' && f.value.length > 25
                          ? f.value.slice(0, 25) + '…'
                          : f.value === 'true' || f.value === 'True' ? '✅' : f.value}
                      </span>
                      {sendEditField && (
                        <button
                          onClick={() => handleEditStart(f.key, f.value)}
                          style={styles.miniEditBtn}
                          title="Correct voice capture error"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Missing fields with Ask buttons ── */}
      {nav.missing && nav.missing.length > 0 && nav.phase !== 'greet' && (
        <div style={styles.fieldSection}>
          <div style={{ ...styles.sectionLabel, color: '#d97706' }}>
            <span>⏳</span>
            <span>Still Needed ({nav.missing.length})</span>
          </div>
          <div style={styles.fieldGrid}>
            {nav.missing.map((f) => (
              <div key={f.key} style={styles.missingRow}>
                <span style={styles.missingLabel}>{f.label}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {sendStaffApproved && (
                    <button
                      style={{
                        ...styles.miniAskBtn,
                        ...(sentKey === f.key ? { background: '#16a34a', color: '#fff' } : {}),
                      }}
                      onClick={() => handleAsk(f.question_hi, f.key)}
                      title={getGuidedText(f.question_hi)}
                      disabled={sentKey === f.key}
                    >
                      {sentKey === f.key ? '✓' : '🎤'}
                    </button>
                  )}
                  {sendForceNext && (
                    <button
                      style={styles.miniSkipBtn}
                      onClick={() => sendForceNext(f.key)}
                      title="Skip this field"
                    >
                      ⏭️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Phase: PROCESS ───────────────── */}
      {nav.phase === 'process' && (
        <div style={{
          ...styles.scriptCard,
          borderColor: nav.verification_submitted ? 'rgba(22,163,74,0.4)' : 'rgba(8,145,178,0.3)',
          backgroundColor: nav.verification_submitted ? 'rgba(22,163,74,0.04)' : 'rgba(8,145,178,0.03)',
          borderWidth: '1px',
          borderStyle: 'solid',
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            ...styles.scriptLabel,
            color: nav.verification_submitted ? '#16a34a' : '#0891b2'
          }}>
            {nav.verification_submitted ? '🚀 Verification Started' : '✅ Ready to Process'}
          </div>
          <div style={styles.scriptText}>
            {nav.verification_submitted
              ? 'The verification process has been successfully started on the customer panel. You can now close the session when finished.'
              : 'All information collected. Please submit the data to start the automated verification process and notify the customer.'
            }
          </div>
          {nav.verification_submitted ? (
            <div style={{
              marginTop: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span>✅</span> Message & voice sent to customer panel!
            </div>
          ) : (
            sendMessage && (
              <button
                style={{
                  ...styles.submitBtn,
                  opacity: submitting || !sessionId ? 0.7 : 1,
                  cursor: submitting || !sessionId ? 'not-allowed' : 'pointer',
                }}
                onClick={handleSubmitVerification}
                disabled={submitting || !sessionId}
              >
                {submitting ? '⏳ Submitting...' : '🚀 Submit & Start Verification'}
              </button>
            )
          )}
        </div>
      )}

      {/* ── Phase: CLOSE ─────────────────── */}
      {nav.phase === 'close' && (
        <div style={{ ...styles.scriptCard, borderColor: 'rgba(100,116,139,0.2)' }}>
          <div style={styles.scriptLabel}>👋 Farewell Script</div>
          <div style={styles.scriptText}>{getGuidedText(nav.farewell_script)}</div>
          {sendStaffApproved && (
            <button
              style={styles.askBtn}
              onClick={() => handleAsk(nav.farewell_script, '__farewell__')}
            >
              {sentKey === '__farewell__' ? '✅ Sent!' : '🎤 Speak Farewell'}
            </button>
          )}
        </div>
      )}

      {/* ── All Complete Banner ───────────── */}
      {nav.all_complete && nav.phase !== 'close' && (
        <div style={styles.completeBanner}>
          🎉 All information collected!
        </div>
      )}
    </div>
  );
}

//  STYLES — matched to ProcessPanel step text font
const FONT = "'Inter', system-ui, 'Segoe UI', Roboto, sans-serif";
const styles = {
  container: {
    borderRadius: 12,
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    overflow: 'hidden',
    fontFamily: FONT,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid var(--card-border)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  phaseIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
  phaseLabel: {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: FONT,
    color: 'var(--text-primary)',
  },
  phaseSub: {
    fontSize: 11,
    fontFamily: FONT,
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  phaseBadge: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT,
    padding: '3px 8px',
    borderRadius: 6,
    letterSpacing: '0.06em',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'var(--card-border)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.5s ease, background-color 0.3s ease',
  },
  scriptCard: {
    margin: '8px 10px',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(59,130,246,0.15)',
    backgroundColor: 'rgba(59,130,246,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  scriptLabel: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: FONT,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  scriptText: {
    fontSize: 14,
    fontWeight: 500,
    fontFamily: FONT,
    color: 'var(--text-primary)',
    lineHeight: 1.5,
  },
  nextCard: {
    margin: '8px 10px',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(8,145,178,0.2)',
    backgroundColor: 'rgba(8,145,178,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: FONT,
    color: '#0891b2',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  nextBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  nextFieldLabel: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: FONT,
    color: 'var(--text-primary)',
  },
  nextQuestionText: {
    fontSize: 14,
    fontWeight: 500,
    fontFamily: FONT,
    color: 'var(--text-primary)',
    padding: '6px 10px',
    borderRadius: 6,
    backgroundColor: 'rgba(8,145,178,0.08)',
    borderLeft: '3px solid #0891b2',
    lineHeight: 1.5,
  },
  askBtn: {
    marginTop: 4,
    padding: '7px 14px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#003087',
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
    alignSelf: 'flex-start',
  },
  askBtnSent: {
    backgroundColor: '#16a34a',
    transform: 'scale(1.02)',
  },
  fieldSection: {
    padding: '8px 14px',
    borderTop: '1px solid var(--card-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: FONT,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  fieldGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  collectedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 6px',
    borderRadius: 4,
    backgroundColor: 'var(--success-bg)',
  },
  fieldBullet: {
    color: '#16a34a',
    fontWeight: 700,
    fontSize: 14,
  },
  collectedLabel: {
    fontSize: 11,
    fontWeight: 600,
    fontFamily: FONT,
    color: 'var(--text-muted)',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  collectedValue: {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: FONT,
    color: 'var(--text-primary)',
    maxWidth: 140,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  missingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '3px 6px',
    borderRadius: 4,
    backgroundColor: 'var(--warning-bg)',
  },
  missingLabel: {
    fontSize: 12,
    fontWeight: 500,
    fontFamily: FONT,
    color: 'var(--warning)',
  },
  miniAskBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    borderRadius: 4,
    border: 'none',
    background: 'rgba(0,48,135,0.10)',
    cursor: 'pointer',
    fontSize: 12,
    lineHeight: 1,
    transition: 'all 0.15s ease',
    flexShrink: 0,
  },
  miniSkipBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    borderRadius: 4,
    border: 'none',
    background: 'rgba(100,116,139,0.10)',
    cursor: 'pointer',
    fontSize: 11,
    lineHeight: 1,
    transition: 'all 0.15s ease',
    flexShrink: 0,
    color: '#64748b',
  },
  miniEditBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1px 4px',
    borderRadius: 3,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 10,
    lineHeight: 1,
    color: '#94a3b8',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  nextBtn: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid rgba(8,145,178,0.35)',
    backgroundColor: 'transparent',
    color: '#0891b2',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: FONT,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  undoBtn: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid rgba(100,116,139,0.30)',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: FONT,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  inlineEditInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontFamily: FONT,
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid rgba(0,48,135,0.3)',
    background: 'var(--body-bg, #f8fafc)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  editSaveBtn: {
    padding: '2px 7px',
    borderRadius: 4,
    border: 'none',
    background: '#16a34a',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
    fontFamily: FONT,
  },
  editCancelBtn: {
    padding: '2px 7px',
    borderRadius: 4,
    border: 'none',
    background: '#e2e8f0',
    color: '#475569',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
    fontFamily: FONT,
  },
  completeBanner: {
    padding: '8px 14px',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: FONT,
    color: '#16a34a',
    backgroundColor: 'rgba(22,163,74,0.06)',
    borderTop: '1px solid var(--card-border)',
  },
  submitBtn: {
    marginTop: 8,
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#16a34a',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: FONT,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 6px rgba(22,163,74,0.2)',
    width: '100%',
  },
};
