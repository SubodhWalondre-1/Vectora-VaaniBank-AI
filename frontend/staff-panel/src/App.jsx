/*
   VaaniBank AI — Staff Panel App + Routes
   Union Bank of India | Team Vectora
   */

import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';

// Role helper (mirrors Sidebar logic)
function isSuperAdminRole(role) {
  const r = (role || '').toLowerCase();
  return ['admin', 'super_admin', 'superadmin', 'supervisor'].includes(r);
}

// Lazy-loaded pages
const LoginPage     = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HistoryPage   = lazy(() => import('./pages/HistoryPage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage  = lazy(() => import('./pages/SettingsPage'));
const ManagerPage   = lazy(() => import('./pages/ManagerPage'));
const AdminPage     = lazy(() => import('./pages/AdminPage'));

// Loading fallback
function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100vh',
        backgroundColor: 'var(--body-bg)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--card-border)',
            borderTopColor: 'var(--accent-blue)',
            borderRadius: '50%',
            animation: 'loader-spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Loading…
        </p>
      </div>

      {/* Keyframe injected inline so it works before theme.css loads */}
      <style>{`
        @keyframes loader-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children }) {
  const isAuthenticated = useApp((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function RoleRoute({ allow, children }) {
  const staff = useApp((s) => s.staff);
  const location = useLocation();
  let role = (staff?.role || '').toLowerCase();
  if (['admin', 'super_admin', 'superadmin', 'supervisor'].includes(role)) {
    role = 'super_admin';
  }

  // allow  undefined > allow all authenticated
  if (Array.isArray(allow) && allow.length > 0 && !allow.includes(role)) {
    return <Navigate to="/knowledge" state={{ from: location }} replace />;
  }
  return children;
}

// App Shell
function AppShell() {
  const theme       = useApp((state) => state.theme);
  const initTheme   = useApp((state) => state.initTheme);
  const staff       = useApp((state) => state.staff);
  const hasHydrated = useApp((state) => state._hasHydrated);

  // initTheme on mount — auth is now restored synchronously in onRehydrateStorage
  useEffect(() => {
    initTheme();
  }, [initTheme]);



  // Block rendering until Zustand persist has rehydrated from localStorage.
  // Without this, ProtectedRoute sees isAuthenticated=false on the very first
  // render (before persist callback fires) and fires API calls with no token.
  if (!hasHydrated) return <PageLoader />;

  return (
    <div data-theme={theme} className={theme === 'dark' ? 'dark' : ''}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Manager default landing */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {(['manager'].includes((staff?.role || '').toLowerCase()))
                  ? <Navigate to="/manager" replace />
                  : isSuperAdminRole(staff?.role)
                  ? <Navigate to="/admin" replace />
                  : (
                    <RoleRoute allow={['teller']}>
                      <DashboardPage />
                    </RoleRoute>
                  )
                }
              </ProtectedRoute>
            }
          />

          {/* Protected */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <RoleRoute allow={['teller', 'super_admin']}>
                  <HistoryPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/knowledge"
            element={
              <ProtectedRoute>
                <RoleRoute allow={['manager', 'teller', 'super_admin']}>
                  <KnowledgePage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <RoleRoute allow={['manager', 'teller', 'super_admin']}>
                  <AnalyticsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <RoleRoute allow={['manager', 'teller', 'super_admin']}>
                  <SettingsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Manager Panel */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute>
                <RoleRoute allow={['manager', 'super_admin']}>
                  <ManagerPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin Panel — super_admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allow={['super_admin']}>
                  <AdminPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

// App Component
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}