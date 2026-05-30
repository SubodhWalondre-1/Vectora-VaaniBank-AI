/*
   VaaniBank AI — Reset Password Button
   Phase 5 | Union Bank of India | Team Vectora

   Drop-in button for the staff table row.
   Calls reset-password API and shows CredentialsModal.
   */

import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import CredentialsModal from './CredentialsModal';
import { staffAPI } from '../../services/api';

/**
 * Props:
 *   staffDbId   number  — staff.id (DB primary key)
 *   staffName   string
 *   onReset     () => void  — optional callback after reset
 */
export default function ResetPasswordButton({ staffDbId, staffName, onReset }) {
  const [loading, setLoading]   = useState(false);
  const [creds, setCreds]       = useState(null);
  const [showCreds, setShowCreds] = useState(false);
  const [error, setError]       = useState('');

  const handleReset = async () => {
    if (!window.confirm(`Reset password for ${staffName}? A new password will be generated.`)) return;

    setLoading(true);
    setError('');
    try {
      const data = await staffAPI.resetPassword(staffDbId);
      setCreds({
        staffName,
        username: data.username,
        password: data.new_plain_password,
      });
      setShowCreds(true);
      if (onReset) onReset();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-start gap-1">
        <button
          onClick={handleReset}
          disabled={loading}
          title="Reset Password"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: 'rgba(217,119,6,0.08)',
            color: loading ? 'var(--text-muted)' : '#D97706',
            border: '1px solid rgba(217,119,6,0.2)',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading
            ? <Loader2 size={13} className="animate-spin" />
            : <KeyRound size={13} />
          }
          {loading ? 'Resetting…' : 'Reset PW'}
        </button>
        {error && (
          <span className="text-xs" style={{ color: '#DC2626' }}>{error}</span>
        )}
      </div>

      {creds && (
        <CredentialsModal
          isOpen={showCreds}
          onClose={() => { setShowCreds(false); setCreds(null); }}
          staffName={creds.staffName}
          username={creds.username}
          password={creds.password}
          isReset={true}
        />
      )}
    </>
  );
}
