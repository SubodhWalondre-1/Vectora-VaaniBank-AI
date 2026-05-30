/*
   VaaniBank AI — TopBar Component
   Union Bank of India | Team Vectora
   */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Shield,
  Bell,
  Wifi,
  WifiOff,
  Timer,
  Radio,
  XCircle,
  Check,
  X,
  UserCheck,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SENTIMENTS, INTENTS, LANGUAGES } from '../../constants';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Toggle from '../ui/Toggle';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// TopBar receives pendingApprovals from DashboardPage
// pendingApprovals = [{ id, token_number, customer_language, session_id, created_at, branch_code }]
// onApprove(approval) / onReject(approval) callbacks
export default function TopBar({ onEndSession, sendMessage, pendingApprovals = [], onApprove, onReject, connectionStatus = 'connected', onRetryWS }) {
  const staff          = useApp((s) => s.staff);
  const toggleSidebar  = useApp((s) => s.toggleSidebar);
  const theme          = useApp((s) => s.theme);
  const toggleTheme    = useApp((s) => s.toggleTheme);
  const activeSession  = useApp((s) => s.activeSession);
  const sessionStatus  = useApp((s) => s.sessionStatus);
  const currentSentiment = useApp((s) => s.currentSentiment);
  const currentIntent  = useApp((s) => s.currentIntent);
  const piiAlert       = useApp((s) => s.piiAlert);
  const clearPIIAlert  = useApp((s) => s.clearPIIAlert);
  const endSession     = useApp((s) => s.endSession);
  const resetSession   = useApp((s) => s.resetSession);
  const navigate       = useNavigate();
  const [isEnding, setIsEnding] = useState(false);

  const handleEndSessionInternal = async () => {
    setIsEnding(true);
    try {
      if (onEndSession) {
        await onEndSession();
      } else {
        await endSession("completed");
        resetSession();
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.message ?? "Failed to end session");
    } finally {
      setIsEnding(false);
    }
  };

  // Notification dropdown
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef      = useRef(null);
  const unreadCount   = pendingApprovals.length;

  // Auto-open dropdown when new request arrives
  const prevCountRef = useRef(0);
  useEffect(() => {
    if (pendingApprovals.length > prevCountRef.current) {
      setNotifOpen(true);
    }
    prevCountRef.current = pendingApprovals.length;
  }, [pendingApprovals.length]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  // Session timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => {
    if (sessionStatus === 'active') {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => setElapsedSeconds((p) => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionStatus]);

  // Derived values
  const isActive      = sessionStatus === 'active';
  const langCode      = activeSession?.customer_language_code;
  const langObj       = LANGUAGES.find((l) => l.code === langCode);
  const tokenNumber   = activeSession?.token_number;
  const sentimentData = SENTIMENTS[currentSentiment] || SENTIMENTS.calm;
  const intentData    = currentIntent ? INTENTS[currentIntent] : null;
  const isOffline     = activeSession?.offline_mode || false;

  return (
    <header
      className="flex items-center justify-between h-14 px-4 shrink-0 z-20 select-none"
      style={{
        backgroundColor: 'var(--topbar-bg)',
        borderBottom: '1px solid var(--topbar-border)',
      }}
    >
      {/* ══ LEFT ══════════════════════════════ */}
      <div className="flex items-center gap-3">
        {/* Hamburger toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        {/* Language + Token badge */}
        {isActive && langObj ? (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--text-primary)' }}
          >
            <span>{langObj.flag}</span>
            <span>{langObj.name}</span>
            {tokenNumber && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--accent-blue)' }}>{tokenNumber}</span>
              </>
            )}
          </motion.div>
        ) : (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--text-muted)' }}
          >
            <Radio size={13} />
            <span>No Active Session</span>
          </div>
        )}

        {/* Status badge */}
        {isActive ? (
          <Badge variant="live" size="md">LIVE</Badge>
        ) : (
          <Badge variant="ready" size="md">Ready</Badge>
        )}

        {connectionStatus === 'error' && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            onClick={onRetryWS}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-lg border border-red-500 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
              boxShadow: '0 4px 10px rgba(220,38,38,0.3)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Offline (Retry)</span>
          </motion.button>
        )}
      </div>

      {/* ══ CENTER ════════════════════════════ */}
      <div className="flex items-center gap-2.5">
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              key={currentSentiment}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant={currentSentiment} size="md">{sentimentData.label}</Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold"
            style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--text-primary)' }}
          >
            <Timer size={13} style={{ color: 'var(--text-muted)' }} />
            <span>{formatTime(elapsedSeconds)}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {isActive && intentData && (
            <motion.div
              key={currentIntent}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Badge variant="intent" size="md">{intentData.label}</Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ RIGHT ═════════════════════════════ */}
      <div className="flex items-center gap-2">
        {/* Online/Offline */}
        {isActive && isOffline && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
            style={{
              backgroundColor: 'rgba(217,119,6,0.1)',
              color: '#D97706',
            }}
          >
            <WifiOff size={12} />
            <span>Local Only</span>
          </div>
        )}

        {/* Privacy badge */}
        <div
          className="flex items-center justify-center p-1.5 rounded-lg"
          style={{ backgroundColor: 'rgba(5,150,105,0.1)', color: '#059669' }}
          title="Privacy On"
        >
          <Shield size={16} />
        </div>

        {/* PII Alert */}
        <AnimatePresence>
          {piiAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer"
              style={{
                backgroundColor: 'rgba(220,38,38,0.15)',
                color: '#DC2626',
                border: '1px solid rgba(220,38,38,0.3)',
              }}
              onClick={clearPIIAlert}
            >
              🔒 PII: {piiAlert.toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--divider)' }} />

        {/* ── Notifications Bell ────────────── */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
            style={{ color: unreadCount > 0 ? '#E8231A' : 'var(--text-muted)' }}
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold"
                style={{ width: 16, height: 16, fontSize: 9, backgroundColor: '#E8231A' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* ── Dropdown ──────────────────────── */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 z-50 rounded-xl shadow-xl overflow-hidden"
                style={{
                  width: 320,
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  top: '100%',
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid var(--divider)' }}
                >
                  <div className="flex items-center gap-2">
                    <Bell size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Pending Approvals
                    </span>
                    {unreadCount > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-white font-bold"
                        style={{ fontSize: 10, backgroundColor: '#E8231A' }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>

                {/* List */}
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {pendingApprovals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                      <Bell size={28} style={{ color: 'var(--text-muted)', opacity: 0.35 }} />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        No pending customer requests
                      </p>
                    </div>
                  ) : (
                    pendingApprovals.map((approval) => (
                      <motion.div
                        key={approval.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="px-4 py-3"
                        style={{ borderBottom: '1px solid var(--divider)', backgroundColor: 'rgba(0,48,135,0.03)' }}
                      >
                        {/* Row: icon + info */}
                        <div className="flex items-start gap-3">
                          <div
                            className="flex items-center justify-center rounded-full flex-shrink-0"
                            style={{
                              width: 38, height: 38,
                              backgroundColor: 'rgba(0,48,135,0.1)',
                            }}
                          >
                            <UserCheck size={17} color="#003087" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', marginBottom: 3 }}>
                              Customer wants to connect
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-md"
                                style={{ backgroundColor: 'rgba(0,48,135,0.1)', color: '#003087' }}
                              >
                                #{approval.token_number}
                              </span>
                              {approval.customer_language && approval.customer_language !== 'Unknown' && (
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  🌐 {approval.customer_language}
                                </span>
                              )}
                              {approval.branch_code && (
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  📍 {approval.branch_code}
                                </span>
                              )}
                            </div>
                            {approval.created_at && (
                              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {new Date(approval.created_at).toLocaleTimeString([], {
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Accept / Reject buttons */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              setNotifOpen(false);
                              onApprove?.(approval);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                            style={{ backgroundColor: '#16A34A', color: '#fff' }}
                          >
                            <Check size={13} /> Accept
                          </button>
                          <button
                            onClick={() => {
                              onReject?.(approval);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                            style={{ backgroundColor: '#E8231A', color: '#fff' }}
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--divider)' }} />
        {/* Theme Toggle */}
        <Toggle checked={theme === 'dark'} onChange={toggleTheme} />

        {/* End Session Button */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <Button variant="danger" size="sm" icon={XCircle} loading={isEnding} onClick={handleEndSessionInternal}>
                End Session
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
