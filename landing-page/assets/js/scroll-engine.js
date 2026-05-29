/* ============================================================
   SCROLL ENGINE — VaaniBank AI
   ============================================================ */

(function () {
  'use strict';

  window.goToScene    = function () {};
  window.onSceneEnter = function () {};
  window.onSceneExit  = function () {};

  function init() {

    /* ========================================================
       1. NAV LINK HIGHLIGHTER
    ======================================================== */
    const navLinks = {
      'scene-hero':     document.getElementById('nav-landing'),
      'scene-voice':    document.getElementById('nav-voice'),
      'scene-features': document.getElementById('nav-features'),
      'scene-demo':     document.getElementById('nav-demo'),
      'scene-contact':  document.getElementById('nav-contact'),
    };

    const scenes = document.querySelectorAll('.scene');

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Object.values(navLinks).forEach((l) => l && l.classList.remove('active'));
            const link = navLinks[entry.target.id];
            if (link) link.classList.add('active');
          }
        });
      },
      { threshold: 0.45 }
    );

    scenes.forEach((scene) => navObserver.observe(scene));

    /* ========================================================
       2. SCROLL-REVEAL ENGINE
    ======================================================== */
    const AUTO_REVEALS = [
      { sel: '.voice-left',        type: 'fade-left',  delay: 0 },
      { sel: '.voice-panel',       type: 'fade-right', delay: 120 },
      { sel: '.voice-tab',         type: 'fade-up',    delay: 80, stagger: true },
      { sel: '.features-header',   type: 'fade-up',    delay: 0 },
      { sel: '.features-grid',     type: 'fade-up',    delay: 100 },
      { sel: '.feature-card',      type: 'fade-up',    delay: 60, stagger: true },
      { sel: '.demo-header',       type: 'fade-up',    delay: 0 },
      { sel: '.demo-sidebar',      type: 'fade-left',  delay: 100 },
      { sel: '.demo-phone-wrap',   type: 'zoom-in',    delay: 180 },
      { sel: '.demo-dashboard',    type: 'fade-right', delay: 260 },
      { sel: '.contact-left',      type: 'fade-left',  delay: 0 },
      { sel: '.contact-form-wrap', type: 'fade-right', delay: 140 },
      { sel: '.contact-info-card', type: 'fade-up',    delay: 60, stagger: true },
      { sel: '.section-label',     type: 'fade-up',    delay: 0 },
      { sel: '.section-heading',   type: 'fade-up',    delay: 60 },
      { sel: '.section-desc',      type: 'fade-up',    delay: 120 },
      { sel: '#footer',            type: 'fade-up',    delay: 0 },
    ];

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      scheduleReveal(el, el.dataset.reveal, +el.dataset.delay || 0, +el.dataset.duration || 700);
    });

    AUTO_REVEALS.forEach(({ sel, type, delay, stagger }) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        const d = stagger ? delay * i : delay;
        if (!el.dataset.reveal) scheduleReveal(el, type, d, 700);
      });
    });

    function scheduleReveal(el, type, delay, duration) {
      if (el._revealInit) return;
      el._revealInit = true;
      el.classList.add('sr-hidden', `sr-${type}`);
      if (duration !== 700) el.style.transitionDuration = duration + 'ms';
      if (delay) el.style.transitionDelay = delay + 'ms';

      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { el.style.willChange = 'transform, opacity'; }
        });
      }, { rootMargin: '200px 0px' }).observe(el);

      const ro = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              requestAnimationFrame(() => {
                el.classList.add('sr-visible');
                el.addEventListener('transitionend', () => {
                  el.style.willChange = 'auto';
                  el.style.transitionDelay = '';
                }, { once: true });
              });
              ro.disconnect();
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
      );
      ro.observe(el);
    }

    /* ========================================================
       3. HERO NAV OVERLAY — logo + CTA fade with hero scene
          Nav pill gets dark style once hero scrolls out
    ======================================================== */
    const nav         = document.getElementById('nav');
    const heroLogo    = document.getElementById('hero-nav-logo');
    const heroCta     = document.getElementById('hero-nav-cta');
    const heroScene   = document.getElementById('scene-hero');

    /* Start visible (on hero) */
    if (nav) nav.classList.add('nav-hero');

    if (heroScene) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              /* Hero in view — show logo + CTA, light pill */
              heroLogo && heroLogo.classList.remove('hero-nav-hidden');
              heroCta  && heroCta.classList.remove('hero-nav-hidden');
              nav      && nav.classList.remove('nav-scrolled');
              nav      && nav.classList.add('nav-hero');
            } else {
              /* Hero out — hide logo + CTA, dark pill */
              heroLogo && heroLogo.classList.add('hero-nav-hidden');
              heroCta  && heroCta.classList.add('hero-nav-hidden');
              nav      && nav.classList.remove('nav-hero');
              nav      && nav.classList.add('nav-scrolled');
            }
          });
        },
        { threshold: 0.10 }
      );
      heroObserver.observe(heroScene);
    }

    /* ========================================================
       4. SMOOTH SCROLL for anchor links
    ======================================================== */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
