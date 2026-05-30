/*
   VaaniBank AI — Shared Manager/Admin Utilities
   Union Bank of India | Team Vectora

   Shared between ManagerPage.jsx and AdminPage.jsx.
   Single source of truth — no duplication.
   */

// Brand palette
export const CHART_COLORS = [
  '#003087', '#E8231A', '#16A34A', '#D97706',
  '#9333EA', '#0891B2', '#BE185D',
];

export const SENTIMENT_COLORS = {
  calm:      '#16A34A',
  confused:  '#D97706',
  frustrated:'#DC2626',
  urgent:    '#9333EA',
};

// Date helpers
export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// Formatters
export function fmtDuration(s) {
  const n = Number(s ?? 0);
  if (!n) return '—';
  const m = Math.floor(n / 60), r = n % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

export function fmtDate(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function fmtDateTime(v) {
  if (!v) return '—';
  return new Date(v).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// Shared UI components

/** Generic metric card used in both panels */
export function StatCard({ label, value, sub, icon: Icon, color = '#003087' }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      {Icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      )}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-extrabold mt-0.5"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

/** Role badge — teller / supervisor / manager / admin */
export function RoleBadge({ role }) {
  const cfg = {
    teller:     { bg: 'rgba(37,99,235,0.1)',  color: '#2563EB', label: 'Teller' },
    supervisor: { bg: 'rgba(5,150,105,0.1)',  color: '#059669', label: 'Supervisor' },
    manager:    { bg: 'rgba(124,58,237,0.1)', color: '#7C3AED', label: 'Manager' },
    admin:      { bg: 'rgba(220,38,38,0.1)',  color: '#DC2626', label: 'Admin' },
  }[role] || { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', label: role };
  return (
    <span
      className="px-2 py-0.5 rounded-md text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

/** Active / Inactive status indicator */
export function StatusDot({ active }) {
  return (
    <span
      className="flex items-center gap-1.5 text-xs font-medium"
      style={{ color: active ? '#16A34A' : '#9CA3AF' }}
    >
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ background: active ? '#16A34A' : '#D1D5DB' }}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

/** Colored badge for audit-log action types */
export function ActionBadge({ action }) {
  const cfg = {
    login:             { bg: 'rgba(37,99,235,0.1)',  color: '#2563EB' },
    logout:            { bg: 'rgba(37,99,235,0.1)',  color: '#2563EB' },
    staff_created:     { bg: 'rgba(22,163,74,0.1)',  color: '#16A34A' },
    branch_created:    { bg: 'rgba(22,163,74,0.1)',  color: '#16A34A' },
    staff_deactivated: { bg: 'rgba(220,38,38,0.1)',  color: '#DC2626' },
    password_reset:    { bg: 'rgba(217,119,6,0.1)',  color: '#D97706' },
    pdf_downloaded:    { bg: 'rgba(147,51,234,0.1)', color: '#9333EA' },
  }[action] || { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };
  return (
    <span
      className="px-2 py-0.5 rounded-md text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {action?.replace(/_/g, ' ')}
    </span>
  );
}
