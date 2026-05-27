import { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import { useApp } from '../context/AppContext';
import { getMe } from '../services/api';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const staff = useApp((s) => s.staff);
  const theme = useApp((s) => s.theme);
  const toggleTheme = useApp((s) => s.toggleTheme);

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const resp = await getMe();
        if (!cancelled) setMe(resp);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.detail || e?.message || 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const profile = me || staff;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--body-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <div className="flex-1 min-h-0 p-4">
          <div
            className="h-full rounded-2xl p-6 overflow-y-auto"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
            }}
          >
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Settings
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Live staff profile from DB (`/auth/me`) + local preferences.
            </p>

            {error && (
              <div
                className="mt-4 rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.22)', color: '#DC2626' }}
              >
                {error}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: 'var(--body-bg)', border: '1px solid var(--card-border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Staff profile
                </p>
                <div className="mt-3">
                  <Row label="Full name" value={loading ? '…' : profile?.full_name} />
                  <Row label="Staff ID" value={loading ? '…' : profile?.staff_id} />
                  <Row label="Username" value={loading ? '…' : profile?.username} />
                  <Row label="Role" value={loading ? '…' : profile?.role} />
                  <Row label="Branch code" value={loading ? '…' : profile?.branch_code} />
                  <Row label="Branch name" value={loading ? '…' : profile?.branch_name} />
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: 'var(--body-bg)', border: '1px solid var(--card-border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Preferences
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Theme
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Current: {theme}
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-3 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: 'var(--badge-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                  >
                    Toggle
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
              Note: Admin/Super Admin features can be added here (branch config, staff management, etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

