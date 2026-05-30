/*
   VaaniBank AI — Admin Panel Page
   Union Bank of India | Team Vectora

   Three tabs (super_admin role only):
     1. All Branches   — overview + create branch
     2. Network Analytics — cross-branch charts
     3. Audit Logs     — activity + PII log
   */

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Building2, BarChart3, FileText, Plus, RefreshCw,
  Activity, Clock, ShieldAlert, AlertCircle, Search,
  Download, TrendingUp, Cpu, Globe, Settings,
  QrCode, ToggleLeft, ToggleRight, Info,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { staffAPI, qrAPI } from '../services/api';
import { INTENTS } from '../constants';
import {
  CHART_COLORS,
  fmtDuration, fmtDate, fmtDateTime, todayStr, daysAgoStr,
  StatCard, StatusDot, ActionBadge,
} from '../utils/managerUtils.jsx';

// Tab definitions
const TABS = [
  { id: 'branches',  label: 'All Branches',      icon: Building2 },
  { id: 'analytics', label: 'Network Analytics', icon: BarChart3 },
  { id: 'audit',     label: 'Audit Logs',         icon: FileText  },
  { id: 'settings',  label: 'System Settings',   icon: Settings  },
];

//  SECTION 1 — All Branches
function CreateBranchModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ branch_code: '', branch_name: '', city: '', state: '', ifsc_prefix: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    const required = ['branch_code', 'branch_name', 'city', 'state'];
    const missing = required.filter(k => !form[k].trim());
    if (missing.length) { setError(`Please fill: ${missing.join(', ')}`); return; }
    setLoading(true);
    try {
      await staffAPI.adminCreateBranch(form);
      setSuccess('Branch created successfully!');
      setTimeout(() => { onCreated(); onClose(); setForm({ branch_code: '', branch_name: '', city: '', state: '', ifsc_prefix: '' }); setSuccess(''); }, 1200);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to create branch');
    } finally { setLoading(false); }
  };

  const inputStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', borderRadius: 10, padding: '8px 12px', width: '100%', fontSize: 14, outline: 'none' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Branch" size="md">
      <div className="flex flex-col gap-4">
        {[['branch_code', 'Branch Code', 'e.g. PUNB0001234'],
          ['branch_name', 'Branch Name', 'e.g. Union Bank - Nagpur Main'],
          ['city', 'City', 'e.g. Nagpur'],
          ['state', 'State', 'e.g. Maharashtra'],
          ['ifsc_prefix', 'IFSC Prefix (optional)', 'e.g. UBIN'],
        ].map(([key, label, ph]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input value={form[key]} onChange={e => handleChange(key, e.target.value)}
              placeholder={ph} style={inputStyle} />
          </div>
        ))}

        {error && (
          <div className="rounded-xl px-3 py-2 text-sm flex items-center gap-2"
            style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl px-3 py-2 text-sm"
            style={{ background: 'rgba(22,163,74,0.08)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' }}>
            ✓ {success}
          </div>
        )}

        <div className="flex gap-2 justify-end mt-1">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} loading={loading}>Create Branch</Button>
        </div>
      </div>
    </Modal>
  );
}

function BranchesSection() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [netData, setNetData]   = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch]     = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [branchRes, analyticsRes] = await Promise.all([
        staffAPI.adminListBranches(showInactive),
        staffAPI.adminNetworkAnalytics(daysAgoStr(0), todayStr()),
      ]);
      setBranches(branchRes.branches || []);
      setNetData(analyticsRes);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load branches');
    } finally { setLoading(false); }
  }, [showInactive]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(b =>
      b.branch_code?.toLowerCase().includes(q) ||
      b.branch_name?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q)
    );
  }, [branches, search]);

  // Merge per_branch analytics into branch rows for sessions/duration
  const branchMap = useMemo(() => {
    const m = {};
    (netData?.per_branch || []).forEach(pb => { m[pb.branch_code] = pb; });
    return m;
  }, [netData]);

  const totalStaff = branches.reduce((s, b) => s + (b.staff_count ?? 0), 0);

  return (
    <div>
      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Active Branches"    value={branches.filter(b => b.is_active !== false).length} icon={Building2}  color="#003087" />
        <StatCard label="Sessions Today"     value={netData?.total_sessions ?? 0}                         icon={Activity}  color="#E8231A"
          sub="across all branches" />
        <StatCard label="Total Staff"        value={totalStaff || '—'}                                    icon={Globe}     color="#16A34A" />
        <StatCard label="Network Completion" value={netData ? `${netData.completion_rate ?? 0}%` : '—'}   icon={TrendingUp} color="#D97706" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', minWidth: 220 }}>
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search branch code / city…"
              className="outline-none text-sm bg-transparent w-full"
              style={{ color: 'var(--text-primary)' }} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-700" />
            Show inactive
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setCreateOpen(true)}>New Branch</Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Branches table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,48,135,0.04)' }}>
                {['Branch Code', 'Name / City', 'Sessions Today', 'Avg Duration', 'Completion', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-bold px-4 py-3"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading branches…</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm"
                  style={{ color: 'var(--text-muted)' }}>
                  {search ? 'No branches match your search.' : 'No branches found.'}
                </td></tr>
              ) : filtered.map(b => {
                const pb = branchMap[b.branch_code] || {};
                const isActive = b.is_active !== false;
                return (
                  <tr key={b.id}
                    style={{ borderBottom: '1px solid rgba(0,48,135,0.06)', opacity: isActive ? 1 : 0.55 }}>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-sm" style={{ color: '#003087' }}>{b.branch_code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{b.branch_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.city}{b.state ? `, ${b.state}` : ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {pb.total_sessions ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {fmtDuration(pb.avg_duration_seconds)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {pb.completion_rate != null ? `${pb.completion_rate}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusDot active={isActive} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{filtered.length} branches shown</p>

      <CreateBranchModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
      />
    </div>
  );
}

//  SECTION 2 — Network Analytics
function NetworkAnalyticsSection() {
  const [fromDate, setFromDate] = useState(daysAgoStr(6));
  const [toDate, setToDate]     = useState(todayStr());
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await staffAPI.adminNetworkAnalytics(fromDate, toDate);
      setData(res);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load analytics');
    } finally { setLoading(false); }
  }, [fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  // Branch comparison bar chart
  const branchBar = useMemo(() =>
    (data?.per_branch || []).map(b => ({
      name: b.branch_code,
      total: b.total_sessions,
      completed: b.completed_sessions,
      abandoned: b.abandoned_sessions,
    })), [data]);

  // Intent donut
  const intentPie = useMemo(() =>
    Object.entries(data?.intents_breakdown || {}).map(([k, v]) => ({
      name: INTENTS[k]?.label || k, value: v,
    })), [data]);

  return (
    <div>
      {/* Date range */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>From</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} max={toDate}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>To</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} min={fromDate}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
        </div>
        <div className="flex items-end pb-0.5">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load} loading={loading}>Update</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard label="Total Sessions"    value={data?.total_sessions ?? 0}     icon={Activity}   color="#003087" />
            <StatCard label="Completion Rate"   value={`${data?.completion_rate ?? 0}%`} icon={TrendingUp} color="#16A34A"
              sub={`${data?.completed_sessions ?? 0} completed`} />
            <StatCard label="Avg Duration"      value={fmtDuration(data?.avg_duration_seconds)} icon={Clock} color="#D97706" />
            <StatCard label="PII Detections"    value={data?.total_pii_detected ?? 0} icon={ShieldAlert} color="#DC2626" />
          </div>

          {/* Branch comparison bar */}
          <div className="rounded-2xl p-5 mb-4"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Branch Comparison</p>
            {branchBar.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={branchBar} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total"     name="Total"     fill="#003087" radius={[4,4,0,0]} />
                  <Bar dataKey="completed" name="Completed" fill="#16A34A" radius={[4,4,0,0]} />
                  <Bar dataKey="abandoned" name="Abandoned" fill="#E8231A" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Intent donut + AI model cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="rounded-2xl p-5"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Intent Heatmap (Network-wide)</p>
              {intentPie.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={intentPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="value" nameKey="name">
                      {intentPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 10, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* AI model performance */}
            <div className="flex flex-col gap-3">
              <StatCard label="AI Suggestions Used"  value={data?.ai_suggestion_used ?? 0} icon={Cpu} color="#003087" />
              <StatCard label="Total Branches"        value={data?.total_branches ?? 0}     icon={Building2} color="#9333EA" />
              <StatCard label="Abandoned Sessions"    value={data?.abandoned_sessions ?? 0} icon={AlertCircle} color="#E8231A" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

//  SECTION 3 — Audit Logs
const ACTION_FILTERS = [
  { value: '', label: 'All Actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'staff_created', label: 'Staff Created' },
  { value: 'staff_deactivated', label: 'Staff Deactivated' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'branch_created', label: 'Branch Created' },
  { value: 'pdf_downloaded', label: 'PDF Downloaded' },
];

function AuditLogsSection() {
  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage]         = useState(1);
  const PAGE_SIZE = 50;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await staffAPI.adminAuditLogs(page, PAGE_SIZE, actionFilter || null);
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load audit logs');
    } finally { setLoading(false); }
  }, [page, actionFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(l =>
      l.actor_staff_id?.toLowerCase().includes(q) ||
      l.actor_name?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.target_name?.toLowerCase().includes(q) ||
      l.branch_code?.toLowerCase().includes(q)
    );
  }, [logs, search]);

  const exportCSV = () => {
    const rows = [
      ['Timestamp', 'Action', 'Actor ID', 'Actor Name', 'Role', 'Target', 'Branch', 'Detail'],
      ...filtered.map(l => [
        fmtDateTime(l.timestamp),
        l.action,
        l.actor_staff_id,
        l.actor_name,
        l.actor_role,
        l.target_name || l.target_staff_id || '',
        l.branch_code || '',
        l.detail || '',
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `VaaniBank_AuditLogs_${todayStr()}.csv`; a.click();
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', minWidth: 220 }}>
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search actor / action / branch…"
              className="outline-none text-sm bg-transparent w-full"
              style={{ color: 'var(--text-primary)' }} />
          </div>
          <select
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
            {ACTION_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          <Button variant="outline" size="sm" icon={Download} onClick={exportCSV}>Export CSV</Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="px-4 py-2.5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(0,48,135,0.03)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{total} total entries</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Page {page}/{totalPages}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,48,135,0.03)' }}>
                {['Timestamp', 'Action', 'Actor', 'Target', 'Branch', 'Detail'].map(h => (
                  <th key={h} className="text-left text-xs font-bold px-4 py-3"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading logs…</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm"
                  style={{ color: 'var(--text-muted)' }}>No audit logs found.</td></tr>
              ) : filtered.map((l, i) => (
                <tr key={l.id ?? i}
                  style={{ borderBottom: '1px solid rgba(0,48,135,0.05)' }}>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtDateTime(l.timestamp)}</span>
                  </td>
                  <td className="px-4 py-3"><ActionBadge action={l.action} /></td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{l.actor_name || '—'}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{l.actor_staff_id} • {l.actor_role}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {l.target_name || l.target_staff_id || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs" style={{ color: '#003087' }}>{l.branch_code || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {l.detail ? String(l.detail).slice(0, 60) + (String(l.detail).length > 60 ? '…' : '') : '—'}
                    </span>
                  </td>
                </tr>
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
          Page {page} of {totalPages} — {total} entries
        </span>
        <Button variant="ghost" size="sm" disabled={page >= totalPages || loading}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
      </div>
    </div>
  );
}

//  SECTION 4 — System Settings

// Small read-only info row used inside settings cards
function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-2.5"
      style={{ borderBottom: '1px solid var(--card-border)' }}>
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span
        className={`text-sm font-semibold ${mono ? 'font-mono' : ''}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </span>
    </div>
  );
}

// Toggle switch (controlled)
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className="flex items-center gap-1.5 transition-all"
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      {checked
        ? <ToggleRight size={32} style={{ color: '#16A34A' }} />
        : <ToggleLeft  size={32} style={{ color: 'var(--text-muted)' }} />}
    </button>
  );
}

function SystemSettingsSection() {
  const DEMO_KEY = 'vaanibank_demo_mode';

  const [settings, setSettings] = useState({
    demo_mode: false,
    default_session_timeout: 15,
    max_exchanges_per_session: 50,
    pii_detection: true,
    idle_timeout: 5,
    primary_stt: 'sarvam_saarika_2.5',
    fallback_stt_1: 'groq_whisper',
    fallback_stt_2: 'reverie',
    llm_model: 'groq_llama_3.3_70b',
    translation_engine: 'sarvam_translate',
    tts_engine: 'sarvam_bulbul_v3',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // QR state per branch
  const [branches, setBranches]     = useState([]);
  const [branchLoading, setBranchLoading] = useState(true);
  const [qrLoading, setQrLoading]   = useState({});   // { branch_code: bool }
  const [qrResults, setQrResults]   = useState({});   // { branch_code: { url, error } }

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await staffAPI.adminGetSettings();
      setSettings(res);
      localStorage.setItem(DEMO_KEY, String(!!res.demo_mode));
    } catch (e) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load branch list and settings once
  useEffect(() => {
    fetchSettings();
    staffAPI.adminListBranches(false)
      .then(res => setBranches(res.branches || []))
      .catch(() => setBranches([]))
      .finally(() => setBranchLoading(false));
  }, [fetchSettings]);

  const handleChange = (key, val) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: val };
      if (key === 'demo_mode') {
        localStorage.setItem(DEMO_KEY, String(val));
      }
      return updated;
    });
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const updated = await staffAPI.adminUpdateSettings(settings);
      setSettings(updated);
      localStorage.setItem(DEMO_KEY, String(!!updated.demo_mode));
      toast.success('System settings updated globally!');
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateQR = async (branch_code) => {
    setQrLoading(prev => ({ ...prev, [branch_code]: true }));
    setQrResults(prev => ({ ...prev, [branch_code]: null }));
    try {
      const res = await qrAPI.getBranchQR(branch_code);
      const url = res?.qr_image_url || res?.qr_url || res?.url || null;
      setQrResults(prev => ({ ...prev, [branch_code]: { url, error: url ? null : 'No QR URL in response' } }));
    } catch (e) {
      setQrResults(prev => ({
        ...prev,
        [branch_code]: { url: null, error: e?.response?.data?.detail || e?.message || 'Failed to generate QR' },
      }));
    } finally {
      setQrLoading(prev => ({ ...prev, [branch_code]: false }));
    }
  };

  const cardStyle = {
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.3s ease'
  };

  const selectStyle = {
    background: 'var(--body-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
    borderRadius: 12,
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
    marginTop: 4
  };

  const inputStyle = {
    background: 'var(--body-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
    borderRadius: 12,
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    marginTop: 4
  };

  const formLabelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted)',
    display: 'block'
  };

  const sectionTitle = (t) => (
    <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t}</p>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading active system configuration...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Save action bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl"
        style={{
          background: 'rgba(0, 48, 135, 0.03)',
          border: '1px dashed var(--card-border)'
        }}>
        <div className="flex items-center gap-2">
          <Info size={16} style={{ color: '#003087' }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Changes are saved immediately to dual-persistence (Redis + dynamic_settings.json) to drive all live voice counters.
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSaveSettings}
          loading={saving}
          style={{ paddingLeft: 24, paddingRight: 24 }}
        >
          Save Settings
        </Button>
      </div>

      {/* Row 1 — Demo Mode + Session Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Demo Mode card */}
        <div style={cardStyle} className="hover:shadow-md">
          {sectionTitle('🎮 Demo Mode')}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                When enabled, the customer panel kiosk shows the 🎬 Demo floating button, allowing simulated websocket operations without backend microservices connectivity.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{
                    background: settings.demo_mode ? 'rgba(22,163,74,0.12)' : 'rgba(107,114,128,0.1)',
                    color: settings.demo_mode ? '#16A34A' : '#6B7280',
                  }}
                >
                  {settings.demo_mode ? '✓ Demo Mode ON' : 'Demo Mode OFF'}
                </span>
              </div>
            </div>
            <Toggle checked={settings.demo_mode} onChange={(val) => handleChange('demo_mode', val)} />
          </div>
        </div>

        {/* Session Config card */}
        <div style={cardStyle} className="hover:shadow-md">
          {sectionTitle('⏱️ Session Configuration')}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={formLabelStyle}>Session Timeout (min)</label>
              <input
                type="number"
                value={settings.default_session_timeout}
                onChange={(e) => handleChange('default_session_timeout', parseInt(e.target.value) || 1)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={formLabelStyle}>Max Exchanges</label>
              <input
                type="number"
                value={settings.max_exchanges_per_session}
                onChange={(e) => handleChange('max_exchanges_per_session', parseInt(e.target.value) || 1)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={formLabelStyle}>Idle Timeout (min)</label>
              <input
                type="number"
                value={settings.idle_timeout}
                onChange={(e) => handleChange('idle_timeout', parseInt(e.target.value) || 1)}
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <div className="flex items-center justify-between px-2">
                <span style={formLabelStyle}>PII Detection</span>
                <Toggle
                  checked={settings.pii_detection}
                  onChange={(val) => handleChange('pii_detection', val)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 — AI Pipeline config */}
      <div style={cardStyle} className="hover:shadow-md">
        {sectionTitle('🤖 AI Pipeline Dynamic Shift')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#003087' }}>Speech-to-Text Falling-Chain</p>
            
            <div>
              <label style={formLabelStyle}>Primary STT (Engine 1)</label>
              <select
                value={settings.primary_stt}
                onChange={(e) => handleChange('primary_stt', e.target.value)}
                style={selectStyle}
              >
                <option value="sarvam_saarika_2.5">Sarvam AI — saarika:v2.5</option>
                <option value="groq_whisper">Groq Whisper (large-v3-turbo)</option>
                <option value="reverie">Reverie RevUp BFSI</option>
                <option value="none">Disabled (none)</option>
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>STT Fallback 1 (Engine 2)</label>
              <select
                value={settings.fallback_stt_1}
                onChange={(e) => handleChange('fallback_stt_1', e.target.value)}
                style={selectStyle}
              >
                <option value="sarvam_saarika_2.5">Sarvam AI — saarika:v2.5</option>
                <option value="groq_whisper">Groq Whisper (large-v3-turbo)</option>
                <option value="reverie">Reverie RevUp BFSI</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>STT Fallback 2 (Engine 3)</label>
              <select
                value={settings.fallback_stt_2}
                onChange={(e) => handleChange('fallback_stt_2', e.target.value)}
                style={selectStyle}
              >
                <option value="sarvam_saarika_2.5">Sarvam AI — saarika:v2.5</option>
                <option value="groq_whisper">Groq Whisper (large-v3-turbo)</option>
                <option value="reverie">Reverie RevUp BFSI</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#003087' }}>LLM Suggester + TTS Generation</p>
            
            <div>
              <label style={formLabelStyle}>LLM Suggester Model</label>
              <select
                value={settings.llm_model}
                onChange={(e) => handleChange('llm_model', e.target.value)}
                style={selectStyle}
              >
                <option value="groq_llama_3.3_70b">Groq — LLaMA 3.3 70B Versatile</option>
                <option value="gemini_2.0_flash">Google Gemini 2.0 Flash</option>
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>Translation Engine</label>
              <select
                value={settings.translation_engine}
                onChange={(e) => handleChange('translation_engine', e.target.value)}
                style={selectStyle}
              >
                <option value="sarvam_translate">Sarvam AI Mayura Translation API</option>
                <option value="llm_translation">Direct LLM Translation (Llama/Gemini)</option>
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>TTS Synthesis Engine</label>
              <select
                value={settings.tts_engine}
                onChange={(e) => handleChange('tts_engine', e.target.value)}
                style={selectStyle}
              >
                <option value="sarvam_bulbul_v3">Sarvam AI Bulbul v3 (Suhani)</option>
                <option value="none">Bypass TTS (No Audio Output)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 — QR Code Regeneration */}
      <div style={cardStyle} className="hover:shadow-md">
        {sectionTitle('📷 Branch QR Code Regeneration')}
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Regenerate the customer-facing QR code for any branch. Each QR links to that branch’s voice session start page.
        </p>

        {branchLoading ? (
          <div className="flex items-center gap-2 py-4">
            <Spinner size="sm" />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading branches…</span>
          </div>
        ) : branches.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No branches found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {branches.map(b => {
              const isLoading = qrLoading[b.branch_code];
              const result    = qrResults[b.branch_code];
              return (
                <div key={b.branch_code}
                  className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(0,48,135,0.04)', border: '1px solid var(--card-border)' }}>

                  {/* Branch info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,48,135,0.1)' }}>
                      <QrCode size={17} style={{ color: '#003087' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-mono" style={{ color: '#003087' }}>{b.branch_code}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{b.branch_name}</p>
                    </div>
                  </div>

                  {/* Result / button */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {result?.error && (
                      <span className="text-xs" style={{ color: '#DC2626' }}>{result.error}</span>
                    )}
                    {result?.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold underline"
                        style={{ color: '#16A34A' }}
                      >
                        View QR ↗
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      icon={isLoading ? undefined : QrCode}
                      loading={isLoading}
                      onClick={() => handleGenerateQR(b.branch_code)}
                    >
                      {result?.url ? 'Regenerate' : 'Generate QR'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}


export default function AdminPage() {
  const staff = useApp((s) => s.staff);
  const [tab, setTab] = useState('branches');

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--body-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {/* Page header */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Admin Panel
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Logged in as <strong>{staff?.staff_id}</strong> — Network-wide access
            </p>
          </div>

          {/* Tab bar */}
          <div
            className="flex items-center gap-1 mb-6 p-1 rounded-2xl w-fit"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: active ? '#E8231A' : 'transparent',
                    color: active ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tab === 'branches'  && <BranchesSection />}
          {tab === 'analytics' && <NetworkAnalyticsSection />}
          {tab === 'audit'     && <AuditLogsSection />}
          {tab === 'settings'  && <SystemSettingsSection />}
        </div>
      </div>
    </div>
  );
}
