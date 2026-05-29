/* ============================================
   LOADING — Cinematic Intro Screen Controller
   VaaniBank AI — loading.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const screen  = document.getElementById('front-loading-screen');
  const logo    = document.querySelector('.loading-logo');
  const barFill = document.getElementById('loading-bar-fill');

  if (!screen || !logo) return;

  document.body.classList.add('loading-active');

  // ── Progress bar fill ──────────────────────────────────
  if (barFill) {
    // Fills over ~4 seconds to match the new longer delay
    setTimeout(() => { barFill.style.width = '40%'; }, 800);
    setTimeout(() => { barFill.style.width = '75%'; }, 2400);
    setTimeout(() => { barFill.style.width = '100%'; }, 4000);
  }

  // ── Sequence ───────────────────────────────────────────
  // Phase 1 (0 – 1000ms): logo appears at large size  [CSS handles this]
  // Phase 2 (1000 – 5000ms): glow pulses, logo stays on screen for 4s [CSS animation]
  // Phase 3 (5000ms): exit begins

  const EXIT_DELAY = 5000; // Increased to 5s so the logo stays fully visible for 4 seconds

  setTimeout(() => {

    // Step 1 — logo shrinks away
    logo.classList.add('logo-exit');

    // Step 2 — screen cross-fades out (slightly staggered)
    setTimeout(() => {
      screen.classList.add('screen-exit');
    }, 180);

    // Step 3 — hide screen, fire events
    setTimeout(() => {
      screen.style.display = 'none';
      document.body.classList.remove('loading-active');
      document.body.classList.add('loaded');
      window.dispatchEvent(new Event('loadingComplete'));
    }, 950); // after screen-exit transition completes

  }, EXIT_DELAY);
});
