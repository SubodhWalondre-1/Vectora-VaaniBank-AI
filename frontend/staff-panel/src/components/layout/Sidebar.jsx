/*
   VaaniBank AI — Sidebar Component
   Union Bank of India | Team Vectora
   */

import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Clock,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Globe,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LANGUAGES, APP_NAME, BRAND } from '../../constants';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

const NAV_ITEMS = [
  { id: 'assistant', label: 'Voice Assistant', icon: Mic, path: '/' },
  { id: 'history', label: 'Session History', icon: Clock, path: '/history' },
  { id: 'manager', label: 'Manager Panel', icon: LayoutDashboard, path: '/manager' },
  { id: 'admin',   label: 'Admin Panel',   icon: ShieldCheck,     path: '/admin'   },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

function isSuperAdminRole(role) {
  const r = (role || '').toLowerCase();
  return ['admin', 'super_admin', 'superadmin', 'supervisor'].includes(r);
}

function allowedNavForRole(role) {
  const r = (role || '').toLowerCase();
  // Super Admin gets access only to Admin Panel and Settings
  if (isSuperAdminRole(r)) {
    return NAV_ITEMS.filter((i) => ['admin', 'settings'].includes(i.id));
  }
  if (r === 'manager') {
    return NAV_ITEMS.filter((i) => ['manager', 'settings'].includes(i.id));
  }
  // default (teller/supervisor/etc): operational view — no Manager or Admin Panel
  return NAV_ITEMS.filter((i) => i.id !== 'manager' && i.id !== 'admin');
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarCollapsed = useApp((s) => s.sidebarCollapsed);
  const staff = useApp((s) => s.staff);
  const theme = useApp((s) => s.theme);
  const toggleTheme = useApp((s) => s.toggleTheme);
  const logout = useApp((s) => s.logout);
  const activeSession = useApp((s) => s.activeSession);
  const sessionStatus = useApp((s) => s.sessionStatus);
  const staffLanguage = useApp((s) => s.staffLanguage);
  const setStaffLanguage = useApp((s) => s.setStaffLanguage);

  const [langModalOpen, setLangModalOpen] = useState(false);

  const navItems = useMemo(() => allowedNavForRole(staff?.role), [staff?.role]);

  const customerLang = activeSession?.customer_language || null;
  const customerLangCode = activeSession?.customer_language_code || null;
  const langObj = LANGUAGES.find((l) => l.code === customerLangCode);

  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (item) => {
    if (item.path === '/') return location.pathname === '/';
    if (item.path) return location.pathname === item.path;
    return false;
  };

  const isSessionActive = sessionStatus === 'active' || !!activeSession;
  const targetWidth = isSessionActive ? 72 : (sidebarCollapsed ? 0 : 260);

  return (
    <>
      <motion.aside
        animate={{ width: targetWidth }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex flex-col h-full shrink-0 select-none overflow-hidden"
        style={{
          minWidth: 0,
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
        }}
      >
        {/* ── Logo Section ─────────────────────── */}
        <div className="px-4 pt-6 pb-4 flex items-center justify-center">
          {!isSessionActive ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/website_logo.png"
                alt="VaaniBank AI"
                style={{
                  height: 48,
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
              title="VaaniBank AI"
            >
              VB
            </div>
          )}
        </div>

        {/* ── Divider ──────────────────────────── */}
        <div className="mx-4 h-px bg-white/10" />

        {/* ── Navigation ───────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={[
                  'w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                  isSessionActive ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 text-left',
                  active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/90',
                  !item.path && !active ? 'opacity-50 cursor-default' : 'cursor-pointer',
                ].join(' ')}
                style={{
                  backgroundColor: active
                    ? 'rgba(255,255,255,0.15)'
                    : 'transparent',
                }}
                disabled={!item.path}
              >
                <Icon
                  size={18}
                  className={active ? 'text-white' : 'text-white/50'}
                  title={item.label}
                />
                {!isSessionActive && <span>{item.label}</span>}

                {/* Active indicator dot */}
                {active && !isSessionActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* ── Customer Language Section ─────────── */}
        {!isSessionActive && (
          <div className="px-4 pb-3">
            <p className="text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase mb-2 px-1">
              Customer Language
            </p>

            {customerLang ? (
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <span className="text-base">{langObj?.flag || '🇮🇳'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-tight truncate">
                    {langObj?.name || customerLang}
                  </p>
                  <p className="text-white/40 text-[11px] leading-tight">
                    {langObj?.native || ''}
                  </p>
                </div>
                <Badge variant="live" size="sm">Live</Badge>
              </div>
            ) : (
              <button
                onClick={() => setLangModalOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <Globe size={16} />
                <span>No session active</span>
              </button>
            )}
          </div>
        )}

        {/* ── Divider ──────────────────────────── */}
        {!isSessionActive && <div className="mx-4 h-px bg-white/10" />}

        {/* ── Agent Info ───────────────────────── */}
        <div className="px-4 py-3">
          <div className={`flex items-center ${isSessionActive ? 'justify-center' : 'gap-2.5'}`}>
            <div className="relative" title={staff?.full_name || 'Staff'}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: BRAND.blueMid }}
              >
                {staff?.full_name
                  ?.split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'ST'}
              </div>
              {/* Online dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2" style={{ borderColor: 'var(--sidebar-bg)' }} />
            </div>
            {!isSessionActive && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {staff?.full_name || 'Staff'}
                </p>
                <p className="text-[11px] text-white/40 truncate">
                  {staff?.staff_id || 'Agent'} • {isSuperAdminRole(staff?.role) ? 'super_admin' : (staff?.role || 'teller')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Controls ──────────────────── */}
        <div className="px-4 pb-4 space-y-2.5">
          {isSessionActive ? (
            <div className="flex flex-col items-center gap-3">
              {/* Staff Language Toggle Indicator */}
              <button
                onClick={() => setStaffLanguage(staffLanguage === 'hi' ? 'en' : 'hi')}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
                title={`Staff Language: ${staffLanguage === 'hi' ? 'Hindi' : 'English'}. Click to toggle.`}
              >
                {staffLanguage.toUpperCase()}
              </button>

              {/* Logout Icon-only */}
              <button
                onClick={logout}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              {/* Staff Language Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold tracking-[0.12em] text-white/30 uppercase px-1">Staff Language</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setStaffLanguage('hi')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: staffLanguage === 'hi' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)',
                      color: staffLanguage === 'hi' ? '#fff' : 'rgba(255,255,255,0.45)',
                      border: staffLanguage === 'hi' ? '1.5px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    🇮🇳 Hindi
                  </button>
                  <button
                    onClick={() => setStaffLanguage('en')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: staffLanguage === 'en' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)',
                      color: staffLanguage === 'en' ? '#fff' : 'rgba(255,255,255,0.45)',
                      border: staffLanguage === 'en' ? '1.5px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </motion.aside>

      {/* ── Language Select Modal ──────────────── */}
      <Modal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
        title="Select Customer Language"
        size="md"
      >
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLangModalOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--badge-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--card-border)',
              }}
            >
              <span className="text-xl">{lang.flag}</span>
              <div>
                <p className="text-sm font-semibold">{lang.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {lang.native}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
