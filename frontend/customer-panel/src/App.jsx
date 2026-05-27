/* ============================================
   VaaniBank AI — Customer Panel App + Routes
   Union Bank of India | Team Vectora
   ============================================ */

import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useCustomerApp } from './context/AppContext';

// ── Lazy-loaded pages ───────────────────────
const LanguageSelectPage = lazy(() => import('./pages/LanguageSelectPage'));
const WaitingPage        = lazy(() => import('./pages/WaitingPage'));
const LiveSessionPage    = lazy(() => import('./pages/LiveSessionPage'));
const SaralFormPage      = lazy(() => import('./pages/SaralFormPage'));
const SummaryPage        = lazy(() => import('./pages/SummaryPage'));

// ── Loading fallback (mobile-optimized) ─────
function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100dvh',
        backgroundColor: 'var(--body-bg)',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: '3px solid var(--card-border)',
          borderTopColor: 'var(--accent-blue)',
          borderRadius: '50%',
          animation: 'loader-spin 0.8s linear infinite',
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

      {/* Keyframe injected inline so it works before theme.css loads */}
      <style>{`
        @keyframes loader-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── App Shell ───────────────────────────────
function AppShell() {
  const theme     = useCustomerApp((state) => state.theme);
  const initTheme = useCustomerApp((state) => state.initTheme);

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div
      data-theme={theme}
      className={theme === 'dark' ? 'dark' : ''}
      style={{ width: '100%', height: '100dvh', overflow: 'hidden' }}
    >
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Language Selection — Home */}
          <Route path="/" element={<LanguageSelectPage />} />

          {/* Waiting for staff approval */}
          <Route path="/waiting/:token" element={<WaitingPage />} />

          {/* Live Session */}
          <Route path="/session/:token" element={<LiveSessionPage />} />

          {/* SaralForm — signature step between session end and summary */}
          <Route path="/saral-form" element={<SaralFormPage />} />

          {/* Session Summary */}
          <Route path="/summary/:session_id" element={<SummaryPage />} />

          {/* Catch-all → redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

// ── App Component ───────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
