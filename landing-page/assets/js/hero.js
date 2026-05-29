/* ============================================
   HERO — React HeroScene → Vanilla JS parity
   VaaniBank AI — hero.js

   Mirrors the React component's:
     • LANG_WORDS array & doMorph() timing
     • counter() cubic-ease animation
     • startParallax() / stopParallax() loop
     • onSceneEnter / onSceneExit hooks
     • loadingComplete video playback
   ============================================ */

(function () {
  'use strict';

  /* ── DOM refs ────────────────────────────────────────── */
  const heroLeft  = document.getElementById('hero-left');
  const heroRight = document.getElementById('hero-right');
  const morphEl   = document.getElementById('hero-lang-morph');
  const videoWrap = document.getElementById('hero-video-wrap');
  const video     = null; // replaced by GIF — no video element



  /* ── Language Words — exact copy from React LANG_WORDS ─ */
  const LANG_WORDS = [
    'भाषा', 'భాష', 'மொழி', 'ভাষা', 'ભાષા', 'ಭಾಷೆ', 'ਭਾਸ਼ਾ', 'भाषा'
  ];
  let morphIndex = 0;
  let morphTimer = null;

  /* ── doMorph — mirrors React doMorph() exactly ───────── */
  function doMorph() {
    if (!morphEl) return;

    // Step 1: add .morphing (fade-out) → matches setMorphing(true)
    morphEl.classList.add('morphing');

    // Step 2: after 350ms swap text → matches the first setTimeout(350)
    setTimeout(function () {
      morphIndex = (morphIndex + 1) % LANG_WORDS.length;
      morphEl.textContent = LANG_WORDS[morphIndex];
      morphEl.classList.remove('morphing');
    }, 350);

    // Step 3: schedule next cycle after 2200+350ms → matches second setTimeout
    morphTimer = setTimeout(doMorph, 2200 + 350);
  }



  /* ── Mouse Parallax — mirrors React startParallax() ──── */
  var tx = 0, ty = 0, cx = 0, cy = 0;
  var parallaxActive = false;

  /* Global mousemove listener — same as React useEffect ── */
  document.addEventListener('mousemove', function (e) {
    var scene = document.getElementById('scene-hero');
    if (!scene) return;
    var rect = scene.getBoundingClientRect();
    tx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    ty = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
  }, { passive: true });

  function startParallax() {
    if (parallaxActive) return;
    parallaxActive = true;
    (function loop() {
      if (!parallaxActive) return;
      /* lerp factor 0.06 matches React cx += (tx - cx) * 0.06 */
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      if (videoWrap) {
        videoWrap.style.transform =
          'translate(' + (cx * 14) + 'px, ' + (cy * 10) + 'px) ' +
          'rotateX(' + (-cy * 3) + 'deg) rotateY(' + (cx * 3) + 'deg)';
      }
      requestAnimationFrame(loop);
    })();
  }

  function stopParallax() {
    parallaxActive = false;
    if (videoWrap) videoWrap.style.transform = '';
    tx = 0; ty = 0; cx = 0; cy = 0;
  }

  /* ── Video playback — mirrors React loadingComplete ───── */
  window.addEventListener('loadingComplete', function () {
    if (video) {
      video.setAttribute('preload', 'auto');
      video.load();
      video.play().catch(function (err) { console.log('Autoplay blocked:', err); });
    }
  });

  /* ── Scene Enter — mirrors React enterFn ──────────────── */
  function heroEnter() {
    if (heroLeft)  heroLeft.classList.add('animate-in');
    if (heroRight) heroRight.classList.add('animate-in');

    /* Start morph after 2500ms delay — matches React setTimeout(doMorph, 2500) */
    clearTimeout(morphTimer);
    morphTimer = setTimeout(doMorph, 2500);

    /* Play video if page already loaded */
    if (document.body.classList.contains('loaded') && video) {
      video.play().catch(function () {});
    }

    startParallax();
  }

  /* ── Scene Exit — mirrors React exitFn ────────────────── */
  function heroExit() {
    clearTimeout(morphTimer);
    if (video) video.pause();
    stopParallax();
  }

  /* ── Register with scroll engine ──────────────────────── */
  if (typeof window.onSceneEnter === 'function') window.onSceneEnter(0, heroEnter);
  if (typeof window.onSceneExit  === 'function') window.onSceneExit(0, heroExit);

  /* ── Fire enter on initial load (mirrors React setTimeout 300ms) */
  setTimeout(heroEnter, 300);



})();
