/* ============================================
   FEATURES MODAL — Core Features Overlay
   VaaniBank AI — features-modal.js
   ============================================ */

(function () {
  'use strict';

  const featuresData = [
    {
      title: "Zero-Friction QR-to-Session Flow",
      badge: "Built & Functional",
      badgeType: "success",
      icon: "📲",
      desc: "Designed specifically for rural and semi-urban banking environments, this feature eliminates adoption friction. Customers join teller interactions with zero installation, setup, or account registrations, maintaining total accessibility.",
      metrics: {
        engine: "Mobile-First PWA",
        latency: "Instant Scan Connect",
        confidence: "10 Native Languages",
        compliance: "Zero Local Footprint"
      },
      techs: ["QR Code Generator", "Progressive Web App", "WebSockets Sync", "TTS Audio Playback"],
      pipeline: [
        { title: "Unique QR Generation", desc: "Every teller counter displays a unique, branch-specific QR code." },
        { title: "Instant Mobile PWA Launch", desc: "Scanning with a standard camera launches a light, mobile PWA in the customer's phone browser instantly (< 100 KB size)." },
        { title: "Native Script Language Grid", desc: "Displays a 10-language grid in native regional scripts, letting customers hear audio playbacks and push-to-talk in their own tongue." }
      ]
    },
    {
      title: "Multilingual STT (3-Level Fallback)",
      badge: "Built & Functional",
      badgeType: "success",
      icon: "🎙️",
      desc: "To guarantee zero communication failure at branch counters, VaaniBank AI operates a robust cascading Speech-to-Text pipeline. The system runs an automated fallback loop that ensures that even in remote or low-bandwidth environments, customer voices are accurately processed and translated without counter delays.",
      metrics: {
        engine: "Sarvam Saarika v2.5",
        latency: "~0.8s - 1.2s",
        confidence: "0.85+ Accuracy",
        compliance: "GDPR Compliant"
      },
      techs: ["Sarvam Saarika v2.5", "Groq Whisper LPU", "Reverie BFSI", "Whisper Large-v3"],
      pipeline: [
        { title: "Level 1 — Sarvam Saarika v2.5", desc: "Primary voice acquisition engine covering 10 Indian languages. Returns transcription in ~1.2 seconds." },
        { title: "Level 2 — Groq Whisper Large-v3-Turbo", desc: "Instantly fires on Sarvam API failures, routing audio to Groq's custom LPU hardware for an ultra-fast ~0.8s fallback response." },
        { title: "Level 3 — Reverie RevUp BFSI", desc: "Tertiary engine fine-tuned on dedicated banking domain terms, processing complex financial vocabulary with high precision." }
      ]
    },
    {
      title: "Live Response Suggestion (Co-pilot)",
      badge: "Built & Functional",
      badgeType: "success",
      icon: "🧠",
      desc: "Acting as an intelligent counter assistant, this feature bridges the language barrier without requiring tellers to learn new languages. The system detects intents, analyzes sentiment, and provides a ready-to-speak script in the teller's and customer's respective tongues in real time.",
      metrics: {
        engine: "Groq Llama-3.3-70B",
        latency: "< 2.0 seconds",
        confidence: "97% Intent NLP",
        compliance: "Redis Caching (7d TTL)"
      },
      techs: ["Groq Llama-3.3-70B", "Sarvam Bulbul v3", "Redis Caching", "Gemini 2.0 Flash"],
      pipeline: [
        { title: "Intent & NLU Processing", desc: "Processes transcription via Groq Llama-3.3-70b-versatile to identify banking intents and customer sentiment." },
        { title: "Bilingual Suggestion Generation", desc: "Produces a suggested reply in Hindi for the teller and a parallel translation in the customer's selected tongue in under 2 seconds." },
        { title: "Neural Voice Readback", desc: "Once the teller approves or edits the script, Sarvam Bulbul v3 converts it to natural-sounding regional speech." }
      ]
    },
    {
      title: "Smart PII Speech-Triggered Input",
      badge: "Built & Functional",
      badgeType: "success",
      icon: "🔒",
      desc: "VaaniBank AI introduces a zero-friction voice trigger mechanism that solves physical counter logistics. Instead of tellers typing or pointing, speech acts as a direct software trigger to securely collect sensitive customer data directly through their own devices.",
      metrics: {
        engine: "Natural Speech Keyword",
        latency: "< 10ms Scrub",
        confidence: "WebSockets Enabled",
        compliance: "RBI 2024 Guidelines"
      },
      techs: ["Keyword NLP", "WebSockets", "AES Encryption", "PII Masking Rules"],
      pipeline: [
        { title: "Keyword Detection", desc: "AI continuously scans live counter audio and detects target phrases like 'Aadhaar dikhao' or 'PAN card dena'." },
        { title: "Secure PWA Input Push", desc: "Instantly sends a secure, encrypted input prompt overlay directly to the customer's phone browser via WebSockets." },
        { title: "RBI-Compliant Masking", desc: "Applies high-speed masking (Aadhaar, PAN, phone numbers) before data is persisted to secure databases." }
      ]
    },
    {
      title: "Conversation Stage Intelligence",
      badge: "Built & Functional",
      badgeType: "success",
      icon: "⚡",
      desc: "Conversations in banking are fluid and evolve from basic learning to active transactions. This feature uses advanced stage classification to automatically shift the AI co-pilot's behavior as customer intent deepens.",
      metrics: {
        engine: "NLU State Tracker",
        latency: "Real-Time Tracking",
        confidence: "6 Core Intents",
        compliance: "19 Active Steps"
      },
      techs: ["State Classifier", "JSON Process Maps", "Context Classifier"],
      pipeline: [
        { title: "Exploring Mode", desc: "Triggers when a customer asks educational questions (e.g. eligibility requirements or loan products). The AI guides with informational guides." },
        { title: "State Transition Detection", desc: "NLU detects phrases like 'main apply karna chahta hoon' and immediately updates the session state in real time." },
        { title: "Ready-to-Apply Mode", desc: "Launches structured process navigation, walking the teller step-by-step through customer data collection." }
      ]
    },
    {
      title: "Bilingual PDF Summary & Form Auto-fill",
      badge: "Built & Functional",
      badgeType: "success",
      icon: "📄",
      desc: "Closing the interaction gap, this feature ensures that semi-literate and regional language speakers leave the bank branch with verified records. It simultaneously streamlines branch administration by auto-populating back-office database systems.",
      metrics: {
        engine: "ReportLab PDF Engine",
        latency: "Instant Generation",
        confidence: "Bilingual A4 Layout",
        compliance: "Finacle / BaNCS Sync"
      },
      techs: ["ReportLab", "Entity Extraction", "API Form Mapping", "PostgreSQL"],
      pipeline: [
        { title: "Bilingual Report Construction", desc: "ReportLab creates a custom two-column A4 document displaying the full session log in Hindi and the customer's language." },
        { title: "Entity Extraction", desc: "Automatically grabs account numbers, names, and loan figures, adding them to an interaction summary with an RBI compliance footer." },
        { title: "Core Banking System Sync", desc: "Pre-fills core banking forms (such as Finacle) using structured entities, saving tellers from repetitive manual typing." }
      ]
    },
    {
      title: "SaralForm Signature & Form Verification",
      badge: "Built & Functional",
      badgeType: "success",
      icon: "✨",
      desc: "SaralForm is an AI-powered paperless form system that dynamically bridges voice conversations and core banking. It captures AI-extracted client information, renders it bilingually on the kiosk for review, and collects a secure digital signature directly on the touch screen—eliminating manual teller data entry.",
      metrics: {
        engine: "Canvas Vector + WS",
        latency: "Instant Sync (<100ms)",
        confidence: "99.2% Accuracy Rate",
        compliance: "RBI Form Guidelines"
      },
      techs: ["HTML5 Canvas API", "React 19 & Tailwind", "Zustand v5 Persisted", "Framer Motion", "FastAPI WebSockets", "FastAPI Route ORM"],
      pipeline: [
        { title: "AI Extraction & Staff Trigger", desc: "LLM extracts Name, Income, Phone, Aadhaar, and PAN. Staff clicks 'Send to Form Verification' to trigger a WebSocket signal." },
        { title: "Kiosk Transition & Bilingual Review", desc: "Kiosk auto-navigates to /saral-form. 14+ fields are rendered in English and customer's native tongue for verification and correction." },
        { title: "Touch Signature & Secure Upload", desc: "Customer signs using HTML5 canvas. Backend processes the Base64 PNG, saves it to disk, timestamps PostgreSQL, and alerts the Staff Dashboard." }
      ]
    }
  ];

  const modal = document.getElementById('features-modal');
  const overlay = document.getElementById('features-modal-overlay');
  const closeBtn = document.getElementById('features-modal-close');
  const cards = document.querySelectorAll('.features-grid .feature-card');

  if (!modal || !cards.length) return;

  function populateModal(index) {
    const data = featuresData[index];
    if (!data) return;

    document.getElementById('fm-icon').textContent = data.icon;
    
    const badge = document.getElementById('fm-badge');
    badge.textContent = data.badge;
    badge.className = `features-modal-badge ${data.badgeType || 'success'}`;
    
    document.getElementById('fm-title').textContent = data.title;
    document.getElementById('fm-desc').textContent = data.desc;

    // Metrics
    document.getElementById('fm-metric-engine').textContent = data.metrics.engine;
    document.getElementById('fm-metric-latency').textContent = data.metrics.latency;
    document.getElementById('fm-metric-confidence').textContent = data.metrics.confidence;
    document.getElementById('fm-metric-compliance').textContent = data.metrics.compliance;

    // Tech Pills
    const techPillsContainer = document.getElementById('fm-tech-pills');
    techPillsContainer.innerHTML = '';
    data.techs.forEach(tech => {
      const span = document.createElement('span');
      span.className = 'tech-pill';
      span.textContent = tech;
      techPillsContainer.appendChild(span);
    });

    // Pipeline Steps
    const pipelineContainer = document.getElementById('fm-pipeline');
    pipelineContainer.innerHTML = '';
    data.pipeline.forEach((step, idx) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'fm-pipeline-step';

      const circle = document.createElement('div');
      circle.className = 'fm-pipeline-circle';
      circle.textContent = idx + 1;

      const content = document.createElement('div');
      content.className = 'fm-pipeline-content';

      const title = document.createElement('h4');
      title.className = 'fm-pipeline-title';
      title.textContent = step.title;

      const desc = document.createElement('p');
      desc.className = 'fm-pipeline-desc';
      desc.textContent = step.desc;

      content.appendChild(title);
      content.appendChild(desc);
      stepDiv.appendChild(circle);
      stepDiv.appendChild(content);
      pipelineContainer.appendChild(stepDiv);
    });
  }

  let activeKeydownHandler = null;

  function trapFocus(modalEl) {
    if (activeKeydownHandler) {
      modalEl.removeEventListener('keydown', activeKeydownHandler);
    }

    const focusable = modalEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    activeKeydownHandler = function handler(e) {
      if (e.key === 'Escape') {
        closeModal();
        modalEl.removeEventListener('keydown', handler);
        activeKeydownHandler = null;
      }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };

    modalEl.addEventListener('keydown', activeKeydownHandler);
    setTimeout(() => { first?.focus(); }, 50); // Small timeout to ensure visible state
  }

  function openModal(index) {
    populateModal(index);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent main page scrolling
    trapFocus(modal);
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scrolling
    if (activeKeydownHandler) {
      modal.removeEventListener('keydown', activeKeydownHandler);
      activeKeydownHandler = null;
    }
  }

  // Bind click event to each feature card
  cards.forEach((card, index) => {
    card.addEventListener('click', (e) => {
      openModal(index);
    });
    // Add visual indicator that the card is clickable
    card.style.cursor = 'pointer';
  });

  // Bind close buttons
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);

  // Esc key closure
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

})();
