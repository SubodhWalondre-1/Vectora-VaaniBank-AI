import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import { useApp } from '../context/AppContext';
import { getProcessSteps } from '../services/api';
import { INTENTS } from '../constants';

export default function KnowledgePage() {
  const staff = useApp((s) => s.staff);
  const activeSession = useApp((s) => s.activeSession);
  const langCode = activeSession?.customer_language_code || 'hi';

  const allIntentOptions = useMemo(() => Object.keys(INTENTS || {}).filter((k) => k !== 'general'), []);
  const [availableIntents, setAvailableIntents] = useState(allIntentOptions);
  const [intentCounts, setIntentCounts] = useState({});
  const [intentType, setIntentType] = useState(allIntentOptions[0] || 'account_opening');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState('');

  // Discover which intents actually exist in DB (have >=1 process step)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const results = await Promise.allSettled(
          allIntentOptions.map(async (k) => {
            const resp = await getProcessSteps(k, langCode);
            const list = Array.isArray(resp) ? resp : resp?.steps || [];
            return { k, count: list.length };
          })
        );

        const counts = {};
        for (const r of results) {
          if (r.status === 'fulfilled') counts[r.value.k] = r.value.count;
          else counts[r.reason?.k] = 0;
        }

        const available = allIntentOptions.filter((k) => (counts[k] || 0) > 0);
        if (!cancelled) {
          setIntentCounts(counts);
          setAvailableIntents(available.length > 0 ? available : allIntentOptions);
          if (available.length > 0 && !available.includes(intentType)) {
            setIntentType(available[0]);
          }
        }
      } catch {
        // keep defaults
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langCode]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const resp = await getProcessSteps(intentType, langCode);
        const list = Array.isArray(resp) ? resp : resp?.steps || [];
        if (!cancelled) setSteps(list);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.detail || e?.message || 'Failed to load knowledge');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [intentType, langCode]);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--body-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <div className="flex-1 min-h-0 p-4">
          <div
            className="h-full rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
            }}
          >
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Banking Knowledge
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Live process playbooks pulled from DB (intent → steps). Branch: <b>{staff?.branch_code || '—'}</b>
            </p>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Intent
              </label>
              <select
                value={intentType}
                onChange={(e) => setIntentType(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--badge-bg)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-primary)',
                }}
              >
                {availableIntents.map((k) => (
                  <option key={k} value={k}>
                    {INTENTS?.[k]?.label || k} {typeof intentCounts[k] === 'number' ? `(${intentCounts[k]})` : ''}
                  </option>
                ))}
              </select>

              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Language: {langCode}
              </span>
            </div>

            {error && (
              <div
                className="mt-4 rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.22)', color: '#DC2626' }}
              >
                {error}
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {(loading ? Array.from({ length: 4 }) : steps).map((s, idx) => {
                if (loading) {
                  return (
                    <div
                      key={`sk-${idx}`}
                      className="rounded-xl p-4"
                      style={{ background: 'var(--body-bg)', border: '1px solid var(--card-border)' }}
                    >
                      <div className="skeleton" style={{ height: 10, width: 80, marginBottom: 10 }} />
                      <div className="skeleton" style={{ height: 12, width: '100%' }} />
                      <div className="skeleton" style={{ height: 12, width: '85%', marginTop: 8 }} />
                    </div>
                  );
                }

                return (
                  <div
                    key={s?.id ?? idx}
                    className="rounded-xl p-4"
                    style={{ background: 'var(--body-bg)', border: '1px solid var(--card-border)' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                        Step {s?.step_number ?? idx + 1}
                      </span>
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                        {s?.speak_to_customer ? 'Speak to customer' : 'Internal'}
                      </span>
                    </div>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>
                      {s?.step_text_customer || s?.step_text_hindi || '—'}
                    </p>
                    {s?.step_text_hindi && (
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        Hindi: {s.step_text_hindi}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

