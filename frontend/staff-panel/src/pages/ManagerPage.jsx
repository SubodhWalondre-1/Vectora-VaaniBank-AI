/*
   VaaniBank AI — Manager Panel Page (Phase 2)
   Union Bank of India | Team Vectora

   Three tabs (manager role):
     1. Staff Management  — CRUD + password reset
     2. Branch Analytics  — charts + stat cards
     3. Session Logs      — table + CSV export + PII masked
   */

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Users, BarChart3, FileText, Plus, RefreshCw,
  UserCheck, UserX, Search, Download, ChevronDown,
  ChevronUp, Activity, Clock, ShieldAlert, Cpu,
  TrendingUp, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import AddStaffModal from '../components/ui/AddStaffModal';
import ResetPasswordButton from '../components/ui/ResetPasswordButton';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useApp } from '../context/AppContext';
import { staffAPI } from '../services/api';
import { LANGUAGES, SENTIMENTS, INTENTS, STAFF_ROLES } from '../constants';
import {
  CHART_COLORS, SENTIMENT_COLORS,
  fmtDuration, fmtDate, todayStr, daysAgoStr,
  StatCard, RoleBadge, StatusDot,
} from '../utils/managerUtils.jsx';

//  SECTION 1 — Staff Management
function StaffSection({ branchId }) {
  const [staff, setStaff]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch]           = useState('');
  const [addOpen, setAddOpen]         = useState(false);
  const [toggling, setToggling]       = useState(null); // id being toggled

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await staffAPI.listStaff(branchId, showInactive);
      setStaff(data.staff || []);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load staff');
    } finally { setLoading(false); }
  }, [branchId, showInactive]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(s =>
      s.full_name.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      s.staff_id.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q)
    );
  }, [staff, search]);

  const handleToggleActive = async (s) => {
    setToggling(s.id);
    try {
      if (s.is_active) await staffAPI.deactivateStaff(s.id);
      else             await staffAPI.activateStaff(s.id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.detail || 'Action failed');
    } finally { setToggling(null); }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', minWidth: 220 }}>
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name / ID / role…"
              className="outline-none text-sm bg-transparent w-full"
              style={{ color: 'var(--text-primary)' }} />
          </div>
          {/* Show inactive toggle */}
          <label className="flex items-center gap-2 text-sm cursor-pointer"
            style={{ color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={showInactive}
              onChange={e => setShowInactive(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-700" />
            Show inactive
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load} loading={loading}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
            Add Staff
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,48,135,0.04)' }}>
                {['Name', 'Staff ID', 'Role', 'Languages', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-bold px-4 py-3"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading staff…</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm"
                  style={{ color: 'var(--text-muted)' }}>
                  {search ? 'No staff match your search.' : 'No staff found.'}
                </td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}
                  style={{ borderBottom: '1px solid rgba(0,48,135,0.06)', opacity: s.is_active ? 1 : 0.55 }}>
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'var(--accent-blue, #003087)' }}>
                        {s.full_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.full_name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{s.username}</p>
                      </div>
                    </div>
                  </td>
                  {/* Staff ID */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{s.staff_id}</span>
                  </td>
                  {/* Role */}
                  <td className="px-4 py-3"><RoleBadge role={s.role} /></td>
                  {/* Languages */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(s.languages_known || []).slice(0, 3).map(l => (
                        <span key={l} className="px-1.5 py-0.5 rounded text-xs"
                          style={{ background: 'rgba(0,48,135,0.07)', color: '#003087' }}>{l}</span>
                      ))}
                      {(s.languages_known || []).length > 3 && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          +{s.languages_known.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3"><StatusDot active={s.is_active} /></td>
                  {/* Last Login */}
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {s.last_login_at ? fmtDate(s.last_login_at) : 'Never'}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ResetPasswordButton staffDbId={s.id} staffName={s.full_name} />
                      <button
                        onClick={() => handleToggleActive(s)}
                        disabled={toggling === s.id}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: s.is_active ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)',
                          color: s.is_active ? '#DC2626' : '#16A34A',
                          border: `1px solid ${s.is_active ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)'}`,
                          cursor: toggling === s.id ? 'not-allowed' : 'pointer',
                        }}>
                        {toggling === s.id
                          ? <Spinner size="xs" />
                          : s.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                        {s.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        {filtered.length} of {staff.length} staff shown
      </p>

      <AddStaffModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => load()}
      />
    </div>
  );
}

//  SECTION 2 — Branch Analytics
function AnalyticsSection({ branchId }) {
  const [fromDate, setFromDate] = useState(daysAgoStr(6));
  const [toDate, setToDate]     = useState(todayStr());
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true); setError('');
    try {
      const res = await staffAPI.branchAnalyticsRange(branchId, fromDate, toDate);
      setData(res);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load analytics');
    } finally { setLoading(false); }
  }, [branchId, fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  // Chart data
  const dailyBar = useMemo(() => (data?.daily_breakdown || []).map(d => ({
    date: d.date?.slice(5) || d.date,
    sessions: d.sessions,
    completed: d.completed,
    abandoned: d.abandoned,
  })), [data]);

  const intentPie = useMemo(() =>
    Object.entries(data?.intents_breakdown || {}).map(([k, v]) => ({
      name: INTENTS[k]?.label || k, value: v,
    })), [data]);

  const sentimentPie = useMemo(() =>
    Object.entries(data?.sentiments_breakdown || {}).map(([k, v]) => ({
      name: k, value: v, color: SENTIMENT_COLORS[k] || '#6B7280',
    })), [data]);

  const langData = useMemo(() =>
    Object.entries(data?.languages_used || {}).map(([k, v]) => ({
      name: k, value: v,
    })), [data]);

  const completionRate = data?.completion_rate ?? 0;
  const avgDuration = data?.avg_duration_seconds ? fmtDuration(data.avg_duration_seconds) : '—';

  return (
    <div>
      {/* Date range picker */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>From</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            max={toDate}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>To</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            min={fromDate}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
        </div>
        <div className="flex items-end pb-0.5">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load} loading={loading}>
            Update
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard label="Total Sessions"    value={data?.total_sessions ?? 0}     icon={Activity}  color="#003087" />
            <StatCard label="Completion Rate"   value={`${completionRate}%`}           icon={TrendingUp} color="#16A34A"
              sub={`${data?.completed_sessions ?? 0} completed`} />
            <StatCard label="Avg Duration"      value={avgDuration}                   icon={Clock}     color="#D97706" />
            <StatCard label="PII Detections"    value={data?.pii_detected_count ?? 0} icon={ShieldAlert} color="#DC2626" />
          </div>

          {/* Bar chart — daily sessions */}
          <div className="rounded-2xl p-5 mb-4"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Daily Sessions ({fromDate} → {toDate})
            </p>
            {dailyBar.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No data for this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyBar} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="sessions"  name="Total"     fill="#003087" radius={[4,4,0,0]} />
                  <Bar dataKey="completed" name="Completed" fill="#16A34A" radius={[4,4,0,0]} />
                  <Bar dataKey="abandoned" name="Abandoned" fill="#E8231A" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Intent pie */}
            <div className="rounded-2xl p-5"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Intent Breakdown</p>
              {intentPie.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={intentPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                      dataKey="value" nameKey="name">
                      {intentPie.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 10, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Sentiment pie */}
            <div className="rounded-2xl p-5"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Sentiment Breakdown</p>
              {sentimentPie.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={sentimentPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                      dataKey="value" nameKey="name">
                      {sentimentPie.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 10, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Language distribution */}
            <div className="rounded-2xl p-5"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Language Distribution</p>
              {langData.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No data.</p>
              ) : (
                <div className="flex flex-col gap-2 mt-1">
                  {langData.sort((a, b) => b.value - a.value).map((l, i) => {
                    const total = langData.reduce((s, x) => s + x.value, 0);
                    const pct = total ? Math.round(l.value / total * 100) : 0;
                    return (
                      <div key={l.name}>
                        <div className="flex justify-between text-xs mb-1"
                          style={{ color: 'var(--text-muted)' }}>
                          <span>{l.name}</span>
                          <span>{l.value} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--card-border)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* AI suggestion stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard label="AI Suggestions Used"   value={data?.ai_suggestion_used   ?? 0} icon={Cpu}   color="#003087"
              sub={`Acceptance: ${data?.ai_suggestion_acceptance_rate ?? 0}%`} />
            <StatCard label="AI Suggestions Edited" value={data?.ai_suggestion_edited ?? 0} icon={Cpu}   color="#D97706" />
            <StatCard label="AI Suggestions Ignored" value={data?.ai_suggestion_ignored ?? 0} icon={Cpu} color="#9CA3AF" />
          </div>
        </>
      )}
    </div>
  );
}

//  SECTION 3 — Session Logs
// PII masking rules: Aadhaar → XXXX-XXXX-1234  (last 4 only)
function maskPII(text) {
  if (!text) return text;
  // Aadhaar 12-digit
  return text
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'XXXX-XXXX-####')
    .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, 'XXXXX####X');  // PAN
}

function SentimentBadge({ s }) {
  const cfg = SENTIMENTS[s];
  if (!cfg) return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s || '—'}</span>;
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ background: cfg.bgColor, color: cfg.color }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

// Safe string converter — prevents React "Objects are not valid" crash
function safeStr(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function SessionLogsSection({ branchId }) {
  const [sessions, setSessions]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [expanded, setExpanded]       = useState(null);
  const [page, setPage]               = useState(1);
  const PAGE_SIZE = 15;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { default: api } = await import('../services/api');
      // /sessions/history is staff-scoped, page_size max = 100 (backend limit)
      let allSessions = [];
      if (branchId) {
        try {
          // Paginate: fetch up to 3 pages of 100 to get recent sessions
          let fetchedAll = false;
          let currentPage = 1;
          while (!fetchedAll && currentPage <= 3) {
            const res = await api.get('/sessions/history', { params: { page: currentPage, page_size: 100 } });
            const pageData = res.data?.sessions || [];
            allSessions = [...allSessions, ...pageData];
            const totalPages = res.data?.total_pages ?? 1;
            if (currentPage >= totalPages || pageData.length === 0) fetchedAll = true;
            currentPage++;
          }
        } catch {
          allSessions = [];
        }
      }
      setSessions(allSessions);
    } catch (e) {
      const detail = e?.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map(d => (typeof d === 'object' ? d?.msg : String(d)) || String(d)).join(', ')
          : e?.message || 'Failed to load sessions';
      setError(msg);
    } finally { setLoading(false); }
  }, [branchId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s =>
      s.token_number?.toLowerCase().includes(q) ||
      s.intent_detected?.toLowerCase().includes(q) ||
      s.customer_language?.toLowerCase().includes(q) ||
      s.sentiment_overall?.toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const rows = [
      ['Token #', 'Intent', 'Language', 'Sentiment', 'Duration', 'Exchanges', 'Status', 'Date'],
      ...filtered.map(s => [
        s.token_number,
        INTENTS[s.intent_detected]?.label || s.intent_detected || '',
        s.customer_language || '',
        s.sentiment_overall || '',
        fmtDuration(s.duration_seconds),
        s.total_exchanges,
        s.status,
        fmtDate(s.ended_at || s.started_at || s.created_at),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `VaaniBank_Sessions_${todayStr()}.csv`; a.click();
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', minWidth: 240 }}>
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search token / intent / language…"
            className="outline-none text-sm bg-transparent w-full"
            style={{ color: 'var(--text-primary)' }} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          <Button variant="outline" size="sm" icon={Download} onClick={exportCSV}>Export CSV</Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
          {error}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        {/* Header row */}
        <div className="px-4 py-2.5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(0,48,135,0.03)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} sessions — PII masked
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Page {page}/{totalPages}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,48,135,0.03)' }}>
                {['Token #', 'Intent', 'Language', 'Sentiment', 'Duration', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left text-xs font-bold px-4 py-3"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading sessions…</span>
                  </div>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm"
                  style={{ color: 'var(--text-muted)' }}>No sessions found.</td></tr>
              ) : paginated.map(s => (
                <>
                  <tr key={s.id}
                    style={{ borderBottom: '1px solid rgba(0,48,135,0.05)', cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {s.token_number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {INTENTS[s.intent_detected]?.label || s.intent_detected || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {s.customer_language || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><SentimentBadge s={s.sentiment_overall} /></td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {fmtDuration(s.duration_seconds)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold"
                        style={{
                          background: s.status === 'completed' ? 'rgba(22,163,74,0.1)' : s.status === 'abandoned' ? 'rgba(220,38,38,0.1)' : 'rgba(107,114,128,0.1)',
                          color: s.status === 'completed' ? '#16A34A' : s.status === 'abandoned' ? '#DC2626' : '#6B7280',
                        }}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {fmtDate(s.ended_at || s.started_at || s.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {expanded === s.id
                        ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} />
                        : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expanded === s.id && (
                    <tr key={`detail-${s.id}`}
                      style={{ background: 'rgba(0,48,135,0.025)' }}
                      onClick={e => e.stopPropagation()}>
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="font-bold uppercase tracking-wider mb-2"
                              style={{ color: 'var(--text-muted)' }}>Session Info</p>
                            <div className="space-y-1">
                              {[
                                ['Token', s.token_number],
                                ['Branch', s.branch_code || '—'],
                                ['Staff', s.staff_id || '—'],
                                ['Entry method', s.entry_method || '—'],
                                ['Exchanges', String(s.total_exchanges ?? '—')],
                                ['PII detected', s.pii_detected ? '⚠️ Yes' : 'No'],
                              ].map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-2">
                                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                                  <span className="font-semibold text-right" style={{ color: 'var(--text-primary)' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="font-bold uppercase tracking-wider mb-2"
                              style={{ color: 'var(--text-muted)' }}>Customer (PII Masked)</p>
                            <div className="space-y-1">
                              {[
                                ['Name', s.customer_name || '—'],
                                ['Mobile', s.customer_mobile_number ? maskPII(s.customer_mobile_number) : '—'],
                                ['Account', s.customer_account_number ? 'XXXXXX' + String(s.customer_account_number).slice(-4) : '—'],
                                ['Aadhaar', s.customer_aadhaar_last4 ? `XXXX-XXXX-${s.customer_aadhaar_last4}` : '—'],
                                ['PAN', s.customer_pan ? maskPII(s.customer_pan) : '—'],
                                ['Account type', s.customer_account_type || '—'],
                              ].map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-2">
                                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                                  <span className="font-mono font-semibold text-right"
                                    style={{ color: 'var(--text-primary)' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="font-bold uppercase tracking-wider mb-2"
                              style={{ color: 'var(--text-muted)' }}>Timestamps</p>
                            <div className="space-y-1">
                              {[
                                ['Created', fmtDate(s.created_at)],
                                ['Started', s.started_at ? fmtDate(s.started_at) : '—'],
                                ['Ended', s.ended_at ? fmtDate(s.ended_at) : '—'],
                                ['Duration', fmtDuration(s.duration_seconds)],
                              ].map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-2">
                                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                                  <span className="font-semibold text-right" style={{ color: 'var(--text-primary)' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3 gap-3">
        <Button variant="ghost" size="sm" disabled={page <= 1 || loading}
          onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
        </span>
        <Button variant="ghost" size="sm" disabled={page >= totalPages || loading}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
      </div>
    </div>
  );
}

//  MAIN PAGE — tabs
const TABS = [
  { id: 'staff',     label: 'Staff Management', icon: Users },
  { id: 'analytics', label: 'Branch Analytics', icon: BarChart3 },
  { id: 'logs',      label: 'Session Logs',     icon: FileText },
];

export default function ManagerPage() {
  const staff    = useApp(s => s.staff);
  const branchId = staff?.branch_id;
  const [tab, setTab] = useState('staff');

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--body-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {/* Page header */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Manager Panel
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Branch: <strong>{staff?.branch_code}</strong> — {staff?.branch_name}
            </p>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 mb-6 p-1 rounded-2xl w-fit"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: active ? '#003087' : 'transparent',
                    color: active ? '#fff' : 'var(--text-muted)',
                  }}>
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tab === 'staff'     && <StaffSection     branchId={branchId} />}
          {tab === 'analytics' && <AnalyticsSection branchId={branchId} />}
          {tab === 'logs'      && <SessionLogsSection branchId={branchId} />}
        </div>
      </div>
    </div>
  );
}
