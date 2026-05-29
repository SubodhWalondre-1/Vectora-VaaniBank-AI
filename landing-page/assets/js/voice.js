/* ============================================
   VOICE ASSISTANT — Tabs + Cycling Phrases
   VaaniBank AI — voice.js
   ============================================ */

(function () {
  'use strict';

  const tabs     = document.querySelectorAll('.voice-tab');
  const panels   = document.querySelectorAll('.voice-panel-content');
  const resultEl = document.getElementById('voice-result-text');

  /* ── Hindi/Indian phrases cycling ─────────────────────── */
  const phrases = [
    { text: 'मेरा बैलेंस चेक करें',      lang: 'Hindi' },
    { text: 'पैसे ट्रांसफर करना है',     lang: 'Hindi' },
    { text: 'माझा खाते बघायचे आहे',       lang: 'Marathi' },
    { text: 'என் இருப்பு என்ன?',          lang: 'Tamil' },
    { text: 'నా బ్యాలెన్స్ చెప్పండి',    lang: 'Telugu' },
    { text: 'ਮੇਰਾ ਬੈਲੇਂਸ ਦੱਸੋ',           lang: 'Punjabi' },
    { text: 'মোর ব্যালেন্স দেখাও',         lang: 'Bengali' },
    { text: 'Check my account balance',   lang: 'English' },
    { text: 'મારી બૅલેન્સ ચકાસો',          lang: 'Gujarati' },
    { text: 'ಮಯ್ ಖಾತೆ ನೋಡಿ',             lang: 'Kannada' },
  ];

  let phraseIndex = 0;
  let phraseTimer = null;
  let flowTimer = null;
  let currentFlowStep = -1;
  let flowUserPaused = false;



  function setFlowStep(index) {
    currentFlowStep = index;
    const cards = document.querySelectorAll('.flow-card');
    cards.forEach((c, i) => {
      c.classList.remove('active', 'done');
      if (i < index) c.classList.add('done');
      if (i === index) c.classList.add('active');
    });

    // Smooth scroll inside flow-steps-list so active card is centered
    const container = document.getElementById('flow-steps-list');
    const activeCard = cards[index];
    if (container && activeCard) {
      const containerTop = container.getBoundingClientRect().top;
      const cardTop = activeCard.getBoundingClientRect().top;
      const offset = cardTop - containerTop + container.scrollTop - (container.clientHeight / 2) + (activeCard.clientHeight / 2);
      container.scrollTo({ top: offset, behavior: 'smooth' });
    }

    // Update progress bar
    const fill = document.querySelector('.flow-progress-fill');
    if (fill) {
      fill.style.width = ((index + 1) / 7 * 100) + '%';
    }
  }

  function startFlowAuto() {
    clearInterval(flowTimer);
    flowUserPaused = false;
    currentFlowStep = -1;
    // Reset all cards to idle first
    document.querySelectorAll('.flow-card').forEach(c => c.classList.remove('active','done'));
    const fill = document.querySelector('.flow-progress-fill');
    if (fill) fill.style.width = '0%';
    // Scroll to top of list on restart
    const container = document.getElementById('flow-steps-list');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    // Small delay so reset is visible before first card lights up
    setTimeout(() => {
      setFlowStep(0);
      flowTimer = setInterval(() => {
        const next = (currentFlowStep + 1) % 7;
        setFlowStep(next);
      }, 2400);
    }, 400);
  }

  function stopFlowAuto() {
    clearInterval(flowTimer);
    flowTimer = null;
  }

  // Click on cards — pause auto, resume after 6s
  document.addEventListener('click', function(e) {
    const step = e.target.closest('.flow-card');
    if (!step) return;
    const idx = parseInt(step.dataset.step, 10);
    if (isNaN(idx)) return;
    stopFlowAuto();
    flowUserPaused = true;
    setFlowStep(idx);
    // Resume auto after 6s of no interaction
    clearTimeout(flowResumeTimer);
    flowResumeTimer = setTimeout(() => {
      if (flowUserPaused) startFlowAuto();
    }, 6000);
  });
  let flowResumeTimer = null;

  /* ── Voice heading "languages" morph ───────────────────── */
  const voiceMorphEl = document.getElementById('voice-lang-morph');
  const VOICE_LANG_WORDS = [
    'languages', 'भाषाएँ', 'மொழிகள்', 'భాషలు', 'ভাষাসমূহ',
    'ભાષાઓ', 'ಭಾಷೆಗಳು', 'ਭਾਸ਼ਾਵਾਂ', 'languages',
  ];
  let voiceMorphIdx = 0;
  let voiceMorphTimer = null;

  function morphVoiceLang() {
    if (!voiceMorphEl) return;
    voiceMorphEl.classList.add('morphing');
    setTimeout(() => {
      voiceMorphIdx = (voiceMorphIdx + 1) % VOICE_LANG_WORDS.length;
      voiceMorphEl.textContent = VOICE_LANG_WORDS[voiceMorphIdx];
      voiceMorphEl.classList.remove('morphing');
    }, 350);
    voiceMorphTimer = setTimeout(morphVoiceLang, 2000);
  }

  function startVoiceMorph() {
    clearTimeout(voiceMorphTimer);
    voiceMorphTimer = setTimeout(morphVoiceLang, 1500);
  }
  function stopVoiceMorph() {
    clearTimeout(voiceMorphTimer);
  }

  function cyclePhrases() {
    if (!resultEl) return;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    const p = phrases[phraseIndex];

    resultEl.style.opacity = '0';
    resultEl.style.transform = 'translateY(6px)';

    setTimeout(() => {
      resultEl.textContent = p.text;
      resultEl.style.transition = 'opacity 0.4s, transform 0.4s';
      resultEl.style.opacity = '1';
      resultEl.style.transform = 'translateY(0)';

      const langEl = document.getElementById('voice-result-lang');
      if (langEl) langEl.textContent = `Detected: ${p.lang}`;
    }, 300);
  }

  function startPhrases() {
    if (phraseTimer) return;
    phraseTimer = setInterval(cyclePhrases, 2400);
  }

  function stopPhrases() {
    clearInterval(phraseTimer);
    phraseTimer = null;
  }



  /* ── Tab Switching ─────────────────────────────────────── */
  function activateTab(index) {
    tabs.forEach((t, i) => t.classList.toggle('active', i === index));
    panels.forEach((p, i) => p.classList.toggle('active', i === index));
    if (index === 0) startPhrases();
    else             stopPhrases();
    if (index === 2) startFlowAuto();
    else             stopFlowAuto();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(i));
  });

  // Default active tab on load
  activateTab(0);

  /* ══════════════════════════════════════════════════════════
     VOICE SCENE — Live Wave Background Canvas
     
     FIX: Always use IntersectionObserver — never rely on
     window.onSceneEnter/onSceneExit stubs from scroll-engine.
     Those stubs are no-ops; the old fallback only ran when
     onSceneEnter was NOT a function, but now it IS (stub),
     so the fallback branch never executed → wave invisible.
     
     Solution: IO is the sole source of truth for start/stop.
     Phrases + morph also wired to same IO lifecycle.
  ══════════════════════════════════════════════════════════ */
  (function initVoiceWave() {
    const scene = document.getElementById('scene-voice');
    if (!scene) return;

    /* ── Create & inject canvas ────────────────────────── */
    const cv = document.createElement('canvas');
    cv.id    = 'voice-wave-canvas';
    cv.setAttribute('aria-hidden', 'true');
    scene.insertBefore(cv, scene.firstChild);

    const ctx = cv.getContext('2d');
    let W, H, tick = 0, rafId = null, active = false;

    /* ── Wave definitions ──────────────────────────────── */
    const WAVES_LIGHT = [
      { amp: 0.055, freq: 0.012, speed: 0.018, phase: 0.0, yRatio: 0.68, alpha: 0.22, color: '#1565c0' },
      { amp: 0.048, freq: 0.009, speed: 0.013, phase: 1.2, yRatio: 0.75, alpha: 0.17, color: '#1976d2' },
      { amp: 0.065, freq: 0.007, speed: 0.009, phase: 2.4, yRatio: 0.80, alpha: 0.23, color: '#42a5f5' },
      { amp: 0.042, freq: 0.015, speed: 0.022, phase: 0.8, yRatio: 0.86, alpha: 0.28, color: '#64b5f6' },
      { amp: 0.058, freq: 0.010, speed: 0.007, phase: 3.5, yRatio: 0.93, alpha: 0.38, color: '#90caf9' },
    ];

    const WAVES_DARK = [
      { amp: 0.055, freq: 0.012, speed: 0.018, phase: 0.0, yRatio: 0.68, alpha: 0.28, color: '#1565c0' },
      { amp: 0.048, freq: 0.009, speed: 0.013, phase: 1.2, yRatio: 0.75, alpha: 0.22, color: '#1976d2' },
      { amp: 0.065, freq: 0.007, speed: 0.009, phase: 2.4, yRatio: 0.80, alpha: 0.30, color: '#42a5f5' },
      { amp: 0.042, freq: 0.015, speed: 0.022, phase: 0.8, yRatio: 0.86, alpha: 0.35, color: '#64b5f6' },
      { amp: 0.058, freq: 0.010, speed: 0.007, phase: 3.5, yRatio: 0.93, alpha: 0.45, color: '#90caf9' },
    ];

    function isDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    /* ── Resize canvas to match scene ──────────────────── */
    function resize() {
      const rect = scene.getBoundingClientRect();
      W = cv.width  = Math.round(rect.width  || window.innerWidth);
      H = cv.height = Math.round(rect.height || window.innerHeight);
    }

    /* ── Draw one sinusoidal wave layer ────────────────── */
    function drawWave(wave) {
      const baseY = H * wave.yRatio;
      const amp   = H * wave.amp;

      ctx.beginPath();
      ctx.moveTo(0, H);

      for (let x = 0; x <= W; x += 2) {
        const y = baseY
          + Math.sin(x * wave.freq + tick * wave.speed + wave.phase) * amp
          + Math.sin(x * wave.freq * 1.7 + tick * wave.speed * 0.6 + wave.phase) * amp * 0.38;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(W, H);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, baseY - amp, 0, H);
      const hi   = Math.round(wave.alpha * 255).toString(16).padStart(2, '0');
      grad.addColorStop(0, wave.color + hi);
      grad.addColorStop(1, wave.color + '08');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    /* ── Draw animated dot grid in upper portion ───────── */
    function drawDots() {
      const dotColor = isDark() ? '144,202,249' : '21,101,192';
      for (let x = 0; x < W; x += 44) {
        for (let y = 0; y < H * 0.60; y += 44) {
          const blink = (Math.sin(tick * 0.028 + x * 0.09 + y * 0.065) + 1) / 2;
          ctx.beginPath();
          ctx.arc(x + (tick * 0.18 % 44), y, 1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + dotColor + ',' + (blink * 0.09) + ')';
          ctx.fill();
        }
      }
    }

    /* ── Animation loop ────────────────────────────────── */
    function frame() {
      if (!active) { rafId = null; return; }
      tick++;
      ctx.clearRect(0, 0, W, H);

      /* Background gradient */
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      if (isDark()) {
        bg.addColorStop(0,   '#0f1326');
        bg.addColorStop(0.6, '#111630');
        bg.addColorStop(1,   '#0c1020');
      } else {
        bg.addColorStop(0,   '#e8f2ff');
        bg.addColorStop(0.5, '#f0f7ff');
        bg.addColorStop(1,   '#ddeeff');
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      drawDots();
      const waves = isDark() ? WAVES_DARK : WAVES_LIGHT;
      waves.forEach(drawWave);

      rafId = requestAnimationFrame(frame);
    }

    /* ── Start / Stop ──────────────────────────────────── */
    function startWave() {
      if (active) return;
      active = true;
      resize();
      if (!rafId) rafId = requestAnimationFrame(frame);
    }

    function stopWave() {
      active = false;
      /* frame() will self-exit on next tick, setting rafId = null */
    }

    /* ── Resize passively ──────────────────────────────── */
    window.addEventListener('resize', function () {
      if (active) resize();
    }, { passive: true });

    /* ── Pause when tab/window hidden ──────────────────── */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopWave();
      else if (sceneVisible) startWave();
    });

    /* ── IntersectionObserver — sole lifecycle controller ─
       Threshold 0.08 = wave starts as soon as 8 % of
       #scene-voice enters viewport (feels instant on scroll).
    ─────────────────────────────────────────────────────── */
    let sceneVisible = false;

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        sceneVisible = entry.isIntersecting;

        if (entry.isIntersecting) {
          startWave();
          /* Also kick off the UI animations */
          activateTab(0);
          startPhrases();
          startVoiceMorph();
        } else {
          stopWave();
          stopPhrases();
          stopVoiceMorph();
          stopFlowAuto();

        }
      });
    }, { threshold: 0.08 });

    io.observe(scene);

  })(); // initVoiceWave

})();
