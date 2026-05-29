/* ============================================
   ROLE MODAL — Visitor Role Selection Handler
   VaaniBank AI — role-modal.js
   ============================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const ctaBtn    = document.getElementById('cta-get-started');
    const navAuthBtn = document.getElementById('nav-auth');
    const roleModal  = document.getElementById('role-modal');
    const closeBtn   = document.getElementById('role-modal-close');
    let lastFocused  = null;

    function getFocusable() {
      return Array.from(roleModal.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
    }

    function openModal(e) {
      if (e) e.preventDefault();
      lastFocused = document.activeElement;
      roleModal.classList.add('active');
      roleModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const focusable = getFocusable();
        if (focusable.length) focusable[0].focus();
      }, 60);
      document.addEventListener('keydown', trapHandler);
    }

    function closeModal() {
      roleModal.classList.remove('active');
      roleModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', trapHandler);
      lastFocused?.focus();
    }

    function trapHandler(e) {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }

    ctaBtn?.addEventListener('click', openModal);
    navAuthBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);

    const overlay = roleModal?.querySelector('.role-modal-overlay');
    overlay?.addEventListener('click', closeModal);
  });
})();
