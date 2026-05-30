/*
   VaaniBank AI — Add Staff Modal
   Phase 5 | Union Bank of India | Team Vectora

   Manager opens this to create a new teller/supervisor.
   On success → CredentialsModal shows plain password once.
   */

import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import CredentialsModal from './CredentialsModal';
import { staffAPI } from '../../services/api';
import { LANGUAGES, STAFF_ROLES } from '../../constants';

// Roles a manager is allowed to create
const CREATABLE_ROLES = [
  { value: 'teller',     label: 'Teller' },
  { value: 'supervisor', label: 'Supervisor' },
];

const ALL_LANGS = LANGUAGES.map((l) => l.name);

const EMPTY_FORM = {
  full_name: '',
  role: 'teller',
  languages_known: [],
  username: '',            // optional — blank = auto-generate
};

export default function AddStaffModal({ isOpen, onClose, onCreated }) {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [creds, setCreds]       = useState(null);   // { staffName, username, password }
  const [showCreds, setShowCreds] = useState(false);

  // Field handlers
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleLang = (lang) =>
    setForm((f) => ({
      ...f,
      languages_known: f.languages_known.includes(lang)
        ? f.languages_known.filter((l) => l !== lang)
        : [...f.languages_known, lang],
    }));

  // Submit
  const handleSubmit = async () => {
    setError('');

    if (!form.full_name.trim() || form.full_name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!form.role) {
      setError('Please select a role.');
      return;
    }
    if (form.languages_known.length === 0) {
      setError('Please select at least one language.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        role: form.role,
        languages_known: form.languages_known,
      };
      if (form.username.trim()) payload.username = form.username.trim();

      const data = await staffAPI.createStaff(payload);

      // Show credentials modal (password shown ONCE)
      setCreds({
        staffName: data.staff.full_name,
        staffId: data.staff.staff_id,
        username: data.username,
        password: data.plain_password,
      });
      setShowCreds(true);
      setForm(EMPTY_FORM);

      // Notify parent to refresh staff list
      if (onCreated) onCreated(data.staff);
      onClose();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg).join(', ')
          : 'Failed to create staff. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm(EMPTY_FORM);
    setError('');
    onClose();
  };

  return (
    <>
      {/* ── Add Staff form modal ── */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Add New Staff"
        size="md"
        closeOnBackdrop={!loading}
        footer={
          <>
            <Button variant="ghost" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              icon={UserPlus}
            >
              Create Staff
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">

          {/* Error banner */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}
            >
              <X size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Full name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Full Name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              maxLength={200}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{
                background: 'var(--input-bg, rgba(0,0,0,0.04))',
                border: '1.5px solid var(--card-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Role <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="flex gap-2">
              {CREATABLE_ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => set('role', r.value)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    border: `2px solid ${form.role === r.value ? 'var(--accent-blue, #003087)' : 'var(--card-border)'}`,
                    background: form.role === r.value ? 'rgba(0,48,135,0.08)' : 'transparent',
                    color: form.role === r.value ? 'var(--accent-blue, #003087)' : 'var(--text-muted)',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Languages Known <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_LANGS.map((lang) => {
                const selected = form.languages_known.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggleLang(lang)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      border: `1.5px solid ${selected ? 'var(--accent-blue, #003087)' : 'var(--card-border)'}`,
                      background: selected ? 'rgba(0,48,135,0.08)' : 'transparent',
                      color: selected ? 'var(--accent-blue, #003087)' : 'var(--text-muted)',
                    }}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
            {form.languages_known.length > 0 && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Selected: {form.languages_known.join(', ')}
              </p>
            )}
          </div>

          {/* Username (optional) */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Username{' '}
              <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                (optional — leave blank to auto-generate)
              </span>
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
              placeholder="e.g. rajesh.kumar.ngp"
              maxLength={100}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none font-mono transition-all"
              style={{
                background: 'var(--input-bg, rgba(0,0,0,0.04))',
                border: '1.5px solid var(--card-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Info note */}
          <div
            className="rounded-xl px-4 py-3 text-xs leading-relaxed"
            style={{ background: 'rgba(0,48,135,0.06)', color: 'var(--text-muted)' }}
          >
            A random password will be generated and shown <strong>once</strong> after creation.
            Share it with the staff member via WhatsApp or SMS — it cannot be recovered later.
          </div>

        </div>
      </Modal>

      {/* ── Credentials show-once modal ── */}
      {creds && (
        <CredentialsModal
          isOpen={showCreds}
          onClose={() => { setShowCreds(false); setCreds(null); }}
          staffName={creds.staffName}
          staffId={creds.staffId}
          username={creds.username}
          password={creds.password}
          isReset={false}
        />
      )}
    </>
  );
}
