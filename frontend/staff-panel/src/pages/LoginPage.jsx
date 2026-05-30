/*
   VaaniBank AI — Login Page (Redesigned v3)
   Split Layout: White brand panel + Dark form panel
   Union Bank of India | Team Vectora
   */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn, User, Lock, IdCard, AlertCircle,
  Eye, EyeOff, ShieldCheck, ChevronDown, Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_NAME, BANK_NAME, DEMO_CREDENTIALS } from '../constants';
import Spinner from '../components/ui/Spinner';
import { authAPI } from '../services/api';

const STAFF_ID_REGEX = /^UBI-[A-Z]{3}-\d{3}$/;

export default function LoginPage() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const login           = useApp((s) => s.login);
  const isAuthenticated = useApp((s) => s.isAuthenticated);

  const [staffId,      setStaffId]      = useState('');
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [fieldErrors,  setFieldErrors]  = useState({});
  const [demoOpen,     setDemoOpen]     = useState(false);
  const [generating,   setGenerating]   = useState(false);
  const [preGeneratedCreds, setPreGeneratedCreds] = useState(null);

  // Pre-fetch dynamic demo credentials and pre-cache layout modules in background on mount
  useEffect(() => {
    let active = true;

    // Pre-fetch dynamic demo credentials from backend DB
    const prefetchCredentials = async () => {
      try {
        const res = await authAPI.generateDemoTeller();
        if (res && res.success && active) {
          setPreGeneratedCreds(res);
        }
      } catch (err) {
        console.warn("Background demo credentials pre-fetch failed:", err);
      }
    };

    // Pre-load dynamic imports for main lazy loaded pages to ensure instant navigation transitions
    const prefetchLazyPages = () => {
      import('./DashboardPage').catch(() => {});
      import('./HistoryPage').catch(() => {});
    };

    prefetchCredentials();
    const pageTimer = setTimeout(prefetchLazyPages, 800);

    return () => {
      active = false;
      clearTimeout(pageTimer);
    };
  }, []);

  const handleGenerateDemoTeller = useCallback(async () => {
    setError('');
    setFieldErrors({});

    // 1. If pre-fetched credentials are ready, use them instantly (0ms latency!)
    if (preGeneratedCreds) {
      const creds = preGeneratedCreds;
      setStaffId(creds.staff_id);
      setUsername(creds.username);
      setPassword(creds.password);

      // Nullify current pre-fetched, and queue a new pre-fetch in the background
      setPreGeneratedCreds(null);
      authAPI.generateDemoTeller()
        .then((res) => {
          if (res && res.success) setPreGeneratedCreds(res);
        })
        .catch(() => {});
      return;
    }

    // 2. Fallback: normal API call if click happens before background pre-fetch is finished
    if (generating) return;
    setGenerating(true);
    try {
      const res = await authAPI.generateDemoTeller();
      if (res && res.success) {
        setStaffId(res.staff_id);
        setUsername(res.username);
        setPassword(res.password);
      } else {
        setError('Failed to generate dynamic demo credentials.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error generating credentials. Please check if backend is running.'
      );
    } finally {
      setGenerating(false);
    }
  }, [preGeneratedCreds, generating]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || '/', { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const clearErr = (field) => {
    if (error) setError('');
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = useCallback(() => {
    const e = {};
    if (!staffId.trim())                           e.staffId  = 'Staff ID is required';
    else if (!STAFF_ID_REGEX.test(staffId.trim())) e.staffId  = 'Format: UBI-XXX-000 (e.g. UBI-MUM-042)';
    if (!username.trim())                          e.username = 'Username is required';
    if (!password)                                 e.password = 'Password is required';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }, [staffId, username, password]);

  const handleLogin = useCallback(async () => {
    if (!validate() || loading) return;
    setLoading(true);
    setError('');
    const result = await login({ staff_id: staffId.trim(), username: username.trim(), password });
    setLoading(false);
    if (result.success) {
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  }, [validate, loading, login, staffId, username, password, navigate, location]);

  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Enter') handleLogin(); },
    [handleLogin]
  );

  const fillDemo = (cred) => {
    setStaffId(cred.staff_id);
    setUsername(cred.username);
    setPassword(cred.password);
    setError('');
    setFieldErrors({});
  };

  if (isAuthenticated) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── page wrapper: fills viewport, allows page-level scroll ── */
        .vb-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: flex-start;     /* NOT center — avoids vertical clipping */
          justify-content: center;
          padding: 2.5rem 1.5rem;
          background: #040d1f;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-y: auto;            /* page-level scroll on small heights */
          box-sizing: border-box;
        }

        /* vertical-center trick without clipping:
           wrap card in a flex column that fills min-height */
        .vb-page-inner {
          width: 100%;
          max-width: 960px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: calc(100vh - 5rem); /* matches padding 2.5rem × 2 */
        }

        /* ── animated bg blobs (fixed so they stay behind everything) ── */
        .vb-blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .vb-blob-red  { width:900px;height:900px; top:-300px;right:-200px; background:radial-gradient(circle,rgba(232,36,60,.12) 0%,transparent 70%); animation:vb-pulse-red  8s ease-in-out infinite alternate; }
        .vb-blob-blue { width:700px;height:700px; bottom:-200px;left:-100px; background:radial-gradient(circle,rgba(15,35,71,.9) 0%,transparent 70%); animation:vb-pulse-blue 10s ease-in-out infinite alternate; }
        @keyframes vb-pulse-red  { 0%{transform:scale(1) translate(0,0);opacity:.6}   100%{transform:scale(1.2) translate(30px,40px);opacity:1} }
        @keyframes vb-pulse-blue { 0%{transform:scale(1);opacity:.5}                  100%{transform:scale(1.3) translate(-20px,-20px);opacity:.9} }

        .vb-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size: 60px 60px;
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%);
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%);
        }
        .vb-orb { position:fixed; border-radius:50%; pointer-events:none; z-index:0; }
        .vb-orb-1 { width:6px;height:6px;background:rgba(232,36,60,.6);top:20%;left:15%;box-shadow:0 0 12px rgba(232,36,60,.4);animation:vb-float 12s ease-in-out infinite; }
        .vb-orb-2 { width:4px;height:4px;background:rgba(200,215,255,.4);top:60%;right:20%;animation:vb-float 16s ease-in-out infinite -4s; }
        .vb-orb-3 { width:8px;height:8px;background:rgba(232,36,60,.3);bottom:30%;left:25%;animation:vb-float 20s ease-in-out infinite -8s; }
        @keyframes vb-float {
          0%,100%{transform:translateY(0) translateX(0)}
          25%{transform:translateY(-30px) translateX(15px)}
          50%{transform:translateY(-15px) translateX(-10px)}
          75%{transform:translateY(-40px) translateX(5px)}
        }

        /* ── card ── */
        .vb-card {
          position: relative; z-index: 1;
          width: 100%;
          height: 600px;               /* fixed height — enables right panel scroll */
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.07);
          box-shadow: 0 0 0 1px rgba(232,36,60,.1), 0 40px 120px rgba(0,0,0,.7);
          display: flex;
        }

        /* ── left white brand panel ── */
        .vb-brand {
          width: 42%; flex-shrink: 0;
          background: #ffffff;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          border-right: 1px solid rgba(0,0,0,.1);
        }
        .vb-brand-top { position:absolute;top:0;left:0;right:0;height:4px; background:linear-gradient(90deg,#1a3fa0,#e8243c,#1a3fa0); }
        .vb-brand-bot { position:absolute;bottom:0;left:0;right:0;height:3px; background:linear-gradient(90deg,transparent,rgba(232,36,60,.3),transparent); }
        .vb-logo-wrap { width:100%; padding:0 20px; display:flex; align-items:center; justify-content:center; }
        .vb-logo-wrap img { width:100%; height:auto; object-fit:contain; filter:drop-shadow(0 4px 16px rgba(0,0,0,.08)); display:block; }

        /* ── right dark form panel — scrollable ── */
        .vb-form {
          flex: 1;
          background: #0b1d3a;
          padding: 3rem 2.5rem;
          height: 100%;                /* fill card height */
          overflow-y: auto;            /* THIS makes it scroll */
          scrollbar-width: thin;
          scrollbar-color: rgba(232,36,60,.3) transparent;
        }
        .vb-form::-webkit-scrollbar       { width: 4px; }
        .vb-form::-webkit-scrollbar-track  { background: transparent; }
        .vb-form::-webkit-scrollbar-thumb  { background: rgba(232,36,60,.3); border-radius: 4px; }
        .vb-form::-webkit-scrollbar-thumb:hover { background: rgba(232,36,60,.55); }

        /* ── eyebrow ── */
        .vb-eyebrow { font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#e8243c;margin-bottom:8px;display:flex;align-items:center;gap:8px; }
        .vb-eyebrow::before { content:'';display:inline-block;width:20px;height:2px;background:#e8243c;border-radius:1px; }

        /* ── badge ── */
        .vb-badge { display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:20px;font-size:11px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);color:rgba(200,215,255,.35); }
        .vb-dot { width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,.6);animation:vb-blink 2s ease-in-out infinite; }
        @keyframes vb-blink { 0%,100%{opacity:1} 50%{opacity:.4} }

        /* ── label ── */
        .vb-label { font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:rgba(200,215,255,.6);display:flex;align-items:center;gap:6px;margin-bottom:6px; }

        /* ── input ── */
        .vb-input {
          width:100%; height:50px;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.1);
          border-radius:12px; padding:0 44px 0 16px;
          font-family:'DM Sans',sans-serif; font-size:14px;
          color:#f0f4ff; outline:none; caret-color:#e8243c;
          transition:border-color .2s,background .2s,box-shadow .2s;
        }
        .vb-input::placeholder { color:rgba(200,215,255,.3);font-weight:300; }
        .vb-input:focus { border-color:#e8243c;background:rgba(232,36,60,.04);box-shadow:0 0 0 3px rgba(232,36,60,.12); }
        .vb-input.mono { font-family:'Courier New',monospace;letter-spacing:1.5px;font-size:13px; }
        .vb-input.err  { border-color:rgba(220,38,38,.5) !important; }
        .vb-field-err  { font-size:11px;color:#f87171;font-weight:500;margin-top:4px; }

        /* ── eye toggle ── */
        .vb-eye { position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(200,215,255,.35);display:flex;transition:color .2s;padding:0; }
        .vb-eye:hover { color:rgba(200,215,255,.7); }

        /* ── CTA button ── */
        .vb-btn {
          width:100%; height:52px;
          background:#e8243c; border:none; border-radius:12px;
          font-family:'Syne',sans-serif; font-size:15px; font-weight:700;
          color:#fff; letter-spacing:.3px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:10px;
          box-shadow:0 4px 20px rgba(232,36,60,.35);
          position:relative; overflow:hidden;
          transition:transform .15s,box-shadow .15s;
        }
        .vb-btn::before { content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);transition:left .5s; }
        .vb-btn:hover:not(:disabled)         { transform:translateY(-1px);box-shadow:0 8px 28px rgba(232,36,60,.45); }
        .vb-btn:hover:not(:disabled)::before { left:100%; }
        .vb-btn:active:not(:disabled)        { transform:translateY(0); }
        .vb-btn:disabled                     { opacity:.7;cursor:not-allowed; }

        /* ── demo block ── */
        .vb-demo-block   { border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden; }
        .vb-demo-toggle  { width:100%;padding:10px 14px;background:rgba(255,255,255,.03);border:none;display:flex;align-items:center;justify-content:space-between;color:rgba(200,215,255,.35);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:background .2s; }
        .vb-demo-toggle:hover { background:rgba(255,255,255,.05); }
        .vb-demo-content { padding:12px 14px;border-top:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.2); }
        .vb-demo-row     { display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:12px; }
        .vb-demo-key     { color:rgba(200,215,255,.4); }
        .vb-demo-fill    { background:none;border:none;cursor:pointer;color:#e8243c;font-size:11px;font-family:monospace;letter-spacing:.5px;padding:2px 8px;border-radius:6px;border:1px solid rgba(232,36,60,.25);transition:background .15s; }
        .vb-demo-fill:hover { background:rgba(232,36,60,.1); }
        .vb-demo-fill-btn {
          width: 100%;
          height: 44px;
          background: rgba(232, 36, 60, 0.15);
          border: 1px solid rgba(232, 36, 60, 0.4);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .vb-demo-fill-btn:hover:not(:disabled) {
          background: rgba(232, 36, 60, 0.25);
          border-color: rgba(232, 36, 60, 0.6);
          box-shadow: 0 4px 16px rgba(232, 36, 60, 0.25);
          transform: translateY(-1.5px);
        }
        .vb-demo-fill-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .vb-demo-fill-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── divider ── */
        .vb-divider { height:1px;background:rgba(255,255,255,.07);margin:24px 0; }

        /* ── footer ── */
        .vb-footer { display:flex;align-items:center;justify-content:space-between;margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.04); }
        .vb-footer-brand { font-size:11px;color:rgba(200,215,255,.25); }
        .vb-footer-ver   { font-size:10px;color:rgba(200,215,255,.25);background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);padding:3px 8px;border-radius:4px;letter-spacing:.5px; }

        /* ── error pill ── */
        .vb-error-pill { display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;font-size:14px;background:rgba(220,38,38,.12);border:1px solid rgba(220,38,38,.25);color:#FCA5A5;margin-bottom:18px; }

        /* ── mobile ── */
        @media (max-width: 640px) {
          .vb-card  { flex-direction: column; height: auto; }
          .vb-brand { width: 100%; min-height: 200px; }
          .vb-form  { padding: 2rem 1.25rem; height: auto; overflow-y: visible; }
        }

        /* ── custom spinner ── */
        @keyframes vb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .vb-spin {
          animation: vb-spin 1.2s linear infinite;
        }
      `}</style>

      <div className="vb-page">
        {/* bg */}
        <div className="vb-blob vb-blob-red" />
        <div className="vb-blob vb-blob-blue" />
        <div className="vb-grid" />
        <div className="vb-orb vb-orb-1" />
        <div className="vb-orb vb-orb-2" />
        <div className="vb-orb vb-orb-3" />

        {/* centering wrapper */}
        <div className="vb-page-inner">
          <motion.div
            className="vb-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >

            {/* ══════ LEFT — pure white brand panel ══════ */}
            <div className="vb-brand">
              <div className="vb-brand-top" />
              <div className="vb-logo-wrap">
                <img src="/hello.png" alt="VaaniBank AI" />
              </div>
              <div className="vb-brand-bot" />
            </div>

            {/* ══════ RIGHT — dark form panel ══════ */}
            <div className="vb-form">

              {/* header */}
              <div style={{ marginBottom: '2rem' }}>
                <div className="vb-eyebrow">Staff Portal</div>
                <div style={{ fontFamily:'Syne,sans-serif',fontSize:26,fontWeight:700,color:'#f0f4ff',letterSpacing:'-0.3px',marginBottom:6 }}>
                  Secure Sign In
                </div>
                <div style={{ fontSize:14,color:'rgba(200,215,255,.6)' }}>
                  Authentication required to access the dashboard
                </div>
              </div>

              {/* status badges */}
              <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:28 }}>
                <div className="vb-badge">
                  <div className="vb-dot" />
                  System Online
                </div>
                <div className="vb-badge">
                  <ShieldCheck size={12} style={{ opacity:.6 }} />
                  256-bit Encrypted
                </div>
              </div>

              {/* error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity:0,y:-8,height:0 }}
                    animate={{ opacity:1,y:0,height:'auto' }}
                    exit={{ opacity:0,y:-8,height:0 }}
                    style={{ overflow:'hidden' }}
                  >
                    <div className="vb-error-pill">
                      <AlertCircle size={16} style={{ flexShrink:0 }} />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── fields ── */}
              <div style={{ display:'flex',flexDirection:'column',gap:18,marginBottom:28 }} onKeyDown={handleKeyDown}>

                {/* Staff ID */}
                <div>
                  <label className="vb-label" htmlFor="l-sid">
                    <IdCard size={13} style={{ opacity:.6 }} /> Staff ID
                  </label>
                  <input
                    id="l-sid" type="text"
                    value={staffId}
                    onChange={(e) => { setStaffId(e.target.value.toUpperCase()); clearErr('staffId'); }}
                    placeholder="UBI-MUM-042"
                    autoComplete="off" spellCheck="false"
                    className={`vb-input mono${fieldErrors.staffId ? ' err' : ''}`}
                  />
                  {fieldErrors.staffId && <p className="vb-field-err">{fieldErrors.staffId}</p>}
                </div>

                {/* Username */}
                <div>
                  <label className="vb-label" htmlFor="l-usr">
                    <User size={13} style={{ opacity:.6 }} /> Username
                  </label>
                  <input
                    id="l-usr" type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); clearErr('username'); }}
                    placeholder="Enter username"
                    autoComplete="username" spellCheck="false"
                    className={`vb-input${fieldErrors.username ? ' err' : ''}`}
                  />
                  {fieldErrors.username && <p className="vb-field-err">{fieldErrors.username}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="vb-label" htmlFor="l-pwd">
                    <Lock size={13} style={{ opacity:.6 }} /> Password
                  </label>
                  <div style={{ position:'relative' }}>
                    <input
                      id="l-pwd"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearErr('password'); }}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className={`vb-input${fieldErrors.password ? ' err' : ''}`}
                    />
                    <button type="button" className="vb-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="vb-field-err">{fieldErrors.password}</p>}
                </div>
              </div>

              {/* ── CTA ── */}
              <button className="vb-btn" onClick={handleLogin} disabled={loading}>
                {loading ? (
                  <><Spinner size="xs" color="white" /><span>Authenticating…</span></>
                ) : (
                  <><LogIn size={20} /><span>Login to VaaniBank AI</span></>
                )}
              </button>

              {/* divider */}
              <div className="vb-divider" />

              {/* ── demo credentials ── */}
              <div className="vb-demo-block">
                <button type="button" className="vb-demo-toggle" onClick={() => setDemoOpen(!demoOpen)}>
                  Demo Credentials
                  <motion.span
                    animate={{ rotate: demoOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display:'flex' }}
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {demoOpen && (
                    <motion.div
                      initial={{ height:0, opacity:0 }}
                      animate={{ height:'auto', opacity:1 }}
                      exit={{ height:0, opacity:0 }}
                      transition={{ duration:0.22 }}
                      style={{ overflow:'hidden' }}
                    >
                      <div className="vb-demo-content" style={{ padding: '8px' }}>
                        <button
                          type="button"
                          className="vb-demo-fill-btn"
                          onClick={handleGenerateDemoTeller}
                          disabled={generating}
                        >
                          <Sparkles size={14} className={generating ? 'vb-spin' : ''} style={{ color: '#e8243c' }} />
                          <span>{generating ? 'Generating Unique Staff...' : 'Generate & Fill Unique Staff ⚡'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* footer */}
              <div className="vb-footer">
                <span className="vb-footer-brand">{BANK_NAME} · Team Vectora</span>
                <span className="vb-footer-ver">v2.4.1</span>
              </div>

            </div>{/* end .vb-form */}
          </motion.div>
        </div>
      </div>
    </>
  );
}
