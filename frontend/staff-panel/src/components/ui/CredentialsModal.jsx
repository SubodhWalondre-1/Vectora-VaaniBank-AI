/*
   VaaniBank AI — Credentials Show-Once Modal
   Phase 5 | Union Bank of India | Team Vectora

   Shown after:
     1. Add Staff  → shows username + plain_password
     2. Reset Password → shows new_plain_password

   Password is NEVER shown again after this modal closes.
   */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ShieldAlert, X, KeyRound, User, IdCard } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

// Copy-to-clipboard hook
function useCopyText() {
  const [copied, setCopied] = useState(null); // key of item copied

  const copy = useCallback(async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback for non-HTTPS / older browsers
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }
  }, []);

  return { copied, copy };
}

// Credential Row
function CredRow({ label, value, copyKey, copied, onCopy, icon: Icon }) {
  const isCopied = copied === copyKey;

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: 'var(--input-bg, rgba(0,0,0,0.04))',
        border: '1px solid var(--card-border)',
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--accent-blue, #003087)20' }}
      >
        <Icon size={16} style={{ color: 'var(--accent-blue, #003087)' }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <p
          className="font-mono text-sm font-semibold truncate select-all"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </p>
      </div>

      <button
        onClick={() => onCopy(value, copyKey)}
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
        style={{
          background: isCopied
            ? 'rgba(22,163,74,0.12)'
            : 'var(--card-border)',
          color: isCopied ? '#16A34A' : 'var(--text-muted)',
        }}
        title={isCopied ? 'Copied!' : 'Copy'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isCopied ? (
            <motion.span
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check size={14} />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Copy size={14} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

// Main Modal
/**
 * Props:
 *   isOpen        boolean
 *   onClose       () => void
 *   staffName     string  — displayed in heading
 *   staffId       string  — e.g. UBI-NGP-001 (shown for new staff only)
 *   username      string
 *   password      string  — plain_password or new_plain_password
 *   isReset       boolean — true if this is a password-reset (not new staff)
 */
export default function CredentialsModal({
  isOpen,
  onClose,
  staffName,
  staffId,
  username,
  password,
  isReset = false,
}) {
  const { copied, copy } = useCopyText();
  const [confirmed, setConfirmed] = useState(false);

  const handleCopyAll = () => {
    const lines = [];
    if (!isReset && staffId)  lines.push(`Staff ID: ${staffId}`);
    if (!isReset && username) lines.push(`Username: ${username}`);
    lines.push(`Password: ${password}`);
    copy(lines.join('\n'), 'all');
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={null}
      size="sm"
      showClose={false}
      closeOnBackdrop={false}   // Force user to confirm they've copied
      closeOnEsc={false}
    >
      {/* Warning banner */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5"
        style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}
      >
        <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
        <div>
          <p className="text-sm font-bold" style={{ color: '#DC2626' }}>
            {isReset ? 'New password — shown once only' : 'Credentials — shown once only'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Copy and share with {staffName || 'the staff member'} now. This window cannot be reopened.
          </p>
        </div>
      </div>

      {/* Heading */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'var(--accent-blue, #003087)' }}
        >
          {(staffName || '?')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {staffName || 'New Staff'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {isReset ? 'Password has been reset' : 'Account created successfully'}
          </p>
        </div>
      </div>

      {/* Credential rows */}
      <div className="flex flex-col gap-2 mb-4">
        {!isReset && staffId && (
          <CredRow
            label="Staff ID"
            value={staffId}
            copyKey="staffId"
            copied={copied}
            onCopy={copy}
            icon={IdCard}
          />
        )}
        {!isReset && (
          <CredRow
            label="Username"
            value={username}
            copyKey="username"
            copied={copied}
            onCopy={copy}
            icon={User}
          />
        )}
        <CredRow
          label={isReset ? 'New Password' : 'Password'}
          value={password}
          copyKey="password"
          copied={copied}
          onCopy={copy}
          icon={KeyRound}
        />
      </div>

      {/* Copy all button */}
      <button
        onClick={handleCopyAll}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors mb-5"
        style={{
          background: copied === 'all' ? 'rgba(22,163,74,0.1)' : 'var(--card-border)',
          color: copied === 'all' ? '#16A34A' : 'var(--text-primary)',
          border: `1px solid ${copied === 'all' ? 'rgba(22,163,74,0.3)' : 'var(--divider)'}`,
        }}
      >
        {copied === 'all' ? <Check size={15} /> : <Copy size={15} />}
        {copied === 'all' ? 'Copied!' : 'Copy all credentials'}
      </button>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-2.5 cursor-pointer mb-5">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-blue-700 cursor-pointer flex-shrink-0"
        />
        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          I have copied the credentials and will share them securely.
          I understand they <strong style={{ color: 'var(--text-primary)' }}>cannot be recovered</strong> after
          closing this window.
        </span>
      </label>

      {/* Footer buttons */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          fullWidth
          disabled={!confirmed}
          onClick={handleClose}
        >
          Done, close window
        </Button>
      </div>
    </Modal>
  );
}
