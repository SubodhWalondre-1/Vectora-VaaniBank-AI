/* ============================================
   CUSTOM CURSOR — Zero-lag, CSS-transition ring
   VaaniBank AI — cursor.js
   ============================================ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  if (prefersReduced || isTouch) {
    const dotEl = document.getElementById('cursor-dot');
    const ringEl = document.getElementById('cursor-ring');
    if (dotEl) dotEl.style.display = 'none';
    if (ringEl) ringEl.style.display = 'none';
    // Remove custom cursor styling from body so system cursor is visible
    document.body.style.cursor = 'auto';
    // We should also adjust buttons style
    const style = document.createElement('style');
    style.innerHTML = 'button, a, select, input, textarea, [role="button"] { cursor: auto !important; }';
    document.head.appendChild(style);
    return;
  }

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (!dot || !ring) return;

  // Move both directly — ring lag comes from CSS transition
  function onMouseMove(e) {
    const x = e.clientX;
    const y = e.clientY;

    dot.style.left  = x + 'px';
    dot.style.top   = y + 'px';
    ring.style.left = x + 'px';
    ring.style.top  = y + 'px';
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });

  // Hide when leaving / entering window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  // Press feedback via class
  document.addEventListener('mousedown', () => {
    dot.classList.add('pressed');
    ring.classList.add('pressed');
  });
  document.addEventListener('mouseup', () => {
    dot.classList.remove('pressed');
    ring.classList.remove('pressed');
  });

})();
