/* ============================================
   DEMO — Command Center v2 (Fully Realized Presentation Build)
   VaaniBank AI — demo.js
   Senior UIUX Redesign Build
   ============================================ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════
     QUERY BANK
  ══════════════════════════════════════════ */
    const QUERIES = {
    Hindi: {
      balance:  { q: 'मेरा बैलेंस बताइए',        a: 'आपका बैलेंस ₹47,850.00 है। ✓',                         conf: 97, tokens: 42, step: 'Account lookup successful. Fetching balance...' },
      transfer: { q: 'राहुल को ₹5,000 भेजो',     a: '₹5,00,000 ट्रांसफर शुरू। PIN से पुष्टि करें।',            conf: 94, tokens: 56, step: 'Transaction authorized. Waiting for PIN entry...' },
      loan:     { q: 'होम लोन की जानकारी दें',    a: 'होम लोन 7.5% ब्याज पर उपलब्ध। अवधि 20 वर्ष।',        conf: 96, tokens: 68, step: 'Credit score check: 760+. Standard home loan terms applied.' },
      fd:       { q: 'FD कैलकुलेट करो — ₹5 लाख', a: '₹5,00,000 × 12 माह × 7.2% = ₹5,74,320 परिपक्वता।',  conf: 98, tokens: 74, step: 'Calculated compound interest. Generating payout schedule...' },
    },
    Marathi: {
      balance:  { q: 'माझी शिल्लक सांगा',          a: 'तुमची शिल्लक ₹47,850.00 आहे. ✓',                     conf: 95, tokens: 40, step: 'खाते शोध यशस्वी. शिल्लक प्राप्त करत आहे...' },
      transfer: { q: 'राहुलला ₹5,000 पाठवा',       a: '₹5,00,000 ट्रान्सफर सुरू. PIN ने पुष्टी करा.',          conf: 93, tokens: 54, step: 'व्यवहार अधिकृत. PIN नोंदीची प्रतीक्षा करत आहे...' },
      loan:     { q: 'होम लोन माहिती द्या',         a: 'होम लोन 7.5% व्याजदराने उपलब्ध. मुदत 20 वर्षे.',    conf: 95, tokens: 62, step: 'क्रेडिट स्કોअर तपासणी: ७६०+. गृहकर्ज अटी लागू.' },
      fd:       { q: 'FD गणना करा — ₹5 लाख',      a: '₹5,00,000 × 12 महिने × 7.2% = ₹5,74,320.',         conf: 97, tokens: 70, step: 'चक्रवाढ व्याज मोजले. उत्पन्न वेळापत्रक तयार करत आहे...' },
    },
    Tamil: {
      balance:  { q: 'என் இருப்பு என்ன?',          a: 'உங்கள் இருப்பு ₹47,850.00. ✓',                      conf: 96, tokens: 38, step: 'கணக்கு தேடல் வெற்றி. இருப்பை பெறுகிறது...' },
      transfer: { q: 'ராகுல்க்கு ₹5,000 அனுப்பு', a: '₹5,00,000 பரிமாற்றம் தொடங்கியது. PIN உறுதிப்படுத்தவும்.', conf: 92, tokens: 52, step: 'பரிவர்த்தனை அங்கீகரிக்கப்பட்டது. PIN உள்ளீட்டிற்கு காத்திருக்கிறது...' },
      loan:     { q: 'வீட்டுக் கடன் பற்றி?',       a: '7.5% வட்டியில் வீட்டுக் கடன் கிடைக்கும்.',          conf: 94, tokens: 60, step: 'கிரெடிட் ஸ்கோர் சரிபார்ப்பு: 760+. வீட்டுக் கடன் விதிமுறைகள் பொருந்தும்.' },
      fd:       { q: 'FD கணக்கிடு — ₹5 லட்சம்',   a: '₹5,00,000 × 12 மாதம் × 7.2% = ₹5,74,320.',         conf: 97, tokens: 68, step: 'கூட்டு வட்டி கணக்கிடப்படுகிறது.FD அட்டவணை உருவாக்கப்படுகிறது...' },
    },
    Telugu: {
      balance:  { q: 'నా బ్యాలెన్స్ చెప్పండి',    a: 'మీ బ్యాలెన్స్ ₹47,850.00. ✓',                       conf: 95, tokens: 39, step: 'ఖాతా శోధన విజయవంతమైంది. బ్యాలెన్స్ పొందుతోంది...' },
      transfer: { q: 'రాహుల్‌కి ₹5,000 పంపండి',  a: '₹5,00,000 ట్రాన్స్ఫర్ మొదలైంది. PIN నిర్ధారించండి.',   conf: 91, tokens: 53, step: 'లావాదేవీ ప్రామాణీకరించబడింది. PIN నమోదు కోసం వేచి ఉంది...' },
      loan:     { q: 'హోమ్ లోన్ గురించి చెప్పండి',a: '7.5% వడ్డీతో హోమ్ లోన్ అందుబాటులో.',               conf: 93, tokens: 61, step: 'క్రెడిట్ స్కోరు తనిఖీ: 760+. గృह రుణం వర్తిస్తుంది.' },
      fd:       { q: 'FD లెక్కించండి — ₹5 లక్షలు',a: '₹5,00,000 × 12 నెలలు × 7.2% = ₹5,74,320.',         conf: 96, tokens: 69, step: 'చక్రవడ్డీ లెక్కించబడింది. స్థిర డిపాజిట్ పట్టిక సృష్టిస్తోంది...' },
    },
    Gujarati: {
      balance:  { q: 'મારો બૅલેન્સ જણાવો',        a: 'તમારો બૅલેન્સ ₹47,850.00 છે. ✓',                    conf: 96, tokens: 41, step: 'ખાતાની તપાસ સફળ. બેલેન્સ મેળવી રહ્યું છે...' },
      transfer: { q: 'રાહુલને ₹5,000 મોકલો',      a: '₹5,00,000 ટ્રાન્સફર શરૂ. PIN ખાતરી કરો.',              conf: 93, tokens: 55, step: 'ટ્રાન્ઝેક્શન અધિકૃત. PIN દાખલ કરવા માટે રાહ જુએ છે...' },
      loan:     { q: 'હોમ લોન વિશે માહિતી',        a: '7.5% વ્યાજ દરે હોમ લોન ઉપલબ્ધ.',                   conf: 95, tokens: 63, step: 'ક્રેડિટ સ્કોર તપાસ: 760+. હોમ લોનની શરતો લાગુ.' },
      fd:       { q: 'FD ગણતરી — ₹5 લાખ',         a: '₹5,00,000 × 12 મહિના × 7.2% = ₹5,74,320.',         conf: 97, tokens: 71, step: 'ચક્રવૃદ્ધિ વ્યાજ ગણતરી પૂર્ણ. FD સમયપત્રક જનરેટ થઈ રહ્યું છે...' },
    },
    Bengali: {
      balance:  { q: 'আমার ব্যালেন্স বলুন',     a: 'আপনার ব্যালেন্স ₹47,850.00। ✓',            conf: 95, tokens: 40, step: 'Account lookup successful...' },
      transfer: { q: 'রাহুলকে ₹5,000 পাঠান', a: '₹5,000 ট্রান্সফার শুরু। PIN নিশ্চিত করুন।', conf: 92, tokens: 52, step: 'Transaction authorized...' },
      loan:     { q: 'হোম লোন সম্পর্কে জানান',   a: '7.5% সুদে হোম লোন পাওয়া যাচ্ছে।',          conf: 93, tokens: 60, step: 'Credit score check: 760+...' },
      fd:       { q: 'FD হিসাব করুন — ₹5 লাখ',   a: '₹5,00,000 × 12 মাস × 7.2% = ₹5,74,320।',     conf: 96, tokens: 68, step: 'Compound interest calculated...' },
    },
    Kannada: {
      balance:  { q: 'ನನ್ನ ಬ್ಯಾಲೆನ್ಸ್ ಹೇಳಿ',      a: 'ನಿಮ್ಮ ಬ್ಯಾಲೆನ್ಸ್ ₹47,850.00। ✓',            conf: 95, tokens: 38, step: 'Account lookup successful...' },
      transfer: { q: 'ರಾಹುಲ್‌ಗೆ ₹5,000 ಕಳುಹಿಸಿ',  a: '₹5,00,000 ವರ್ಗಾವಣೆ ಶುರುವಾಗಿದೆ। PIN ದೃಢಪಡಿಸಿ।', conf: 91, tokens: 50, step: 'Transaction authorized...' },
      loan:     { q: 'ಹೋಮ್ ಲೋನ್ ಬಗ್ಗೆ ತಿಳಿಸಿ',  a: '7.5% ಬಡ್ಡಿಯಲ್ಲಿ ಹೋಮ್ ಲೋನ್ ಲಭ್ಯ।',            conf: 93, tokens: 60, step: 'Credit score check: 760+...' },
      fd:       { q: 'FD ಲೆಕ್ಕ ಮಾಡಿ — ₹5 ಲಕ್ಷ',   a: '₹5,00,000 × 12 ತಿಂಗಳು × 7.2% = ₹5,74,320।',  conf: 96, tokens: 67, step: 'Compound interest calculated...' },
    },
    Odia: {
      balance:  { q: 'ମୋ ବ୍ୟାଲେନ୍ସ କୁହ',          a: 'ଆପଣଙ୍କ ବ୍ୟାଲେନ୍ସ ₹47,850.00। ✓',         conf: 93, tokens: 38, step: 'Account lookup successful...' },
      transfer: { q: 'ରାହୁଲଙ୍କୁ ₹5,000 ପଠାନ୍ତୁ',   a: '₹5,00,000 ଟ୍ରାନ୍ସଫର ଆରମ୍ଭ। PIN ନିଶ୍ଚିତ କରନ୍ତୁ।', conf: 91, tokens: 50, step: 'Transaction authorized...' },
      loan:     { q: 'ହୋମ ଲୋନ ବିଷୟରେ କୁହ',       a: '7.5% ସୁଧରେ ହୋମ ଲୋନ ଉପଲବ୍ଧ।',               conf: 92, tokens: 58, step: 'Credit score check: 760+...' },
      fd:       { q: 'FD ହିସାବ କର — ₹5 ଲକ୍ଷ',      a: '₹5,00,000 × 12 ମାସ × 7.2% = ₹5,74,320।',     conf: 95, tokens: 65, step: 'Compound interest calculated...' },
    },
    Punjabi: {
      balance:  { q: 'ਮੇਰਾ ਬੈਲੇਂਸ ਦੱਸੋ',           a: 'ਤੁਹਾਡਾ ਬੈਲੇਂਸ ₹47,850.00 ਹੈ। ✓',           conf: 95, tokens: 40, step: 'Account lookup successful...' },
      transfer: { q: 'ਰਾਹੁਲ ਨੂੰ ₹5,000 ਭੇਜੋ',       a: '₹5,00,000 ਟ੍ਰਾਂਸਫਰ ਸ਼ੁਰੂ। PIN ਨਾਲ ਪੁਸ਼ਟੀ ਕਰੋ।', conf: 92, tokens: 52, step: 'Transaction authorized...' },
      loan:     { q: 'ਹੋਮ ਲੋਨ ਬਾਰੇ ਦੱਸੋ',          a: '7.5% ਵਿਆਜ ਤੇ ਹੋਮ ਲੋਨ ਮਿਲਦਾ ਹੈ।',            conf: 93, tokens: 60, step: 'Credit score check: 760+...' },
      fd:       { q: 'FD ਦਾ ਹਿਸਾਬ ਕਰੋ — ₹5 ਲੱਖ',  a: '₹5,00,000 × 12 ਮਹੀਨੇ × 7.2% = ₹5,74,320।',   conf: 96, tokens: 68, step: 'Compound interest calculated...' },
    },
    Malayalam: {
      balance:  { q: 'എന്റെ ബാലൻസ് പറയൂ',         a: 'നിങ്ങളുടെ ബാലൻസ് ₹47,850.00. ✓',            conf: 95, tokens: 40, step: 'Account lookup successful...' },
      transfer: { q: 'രാഹുലിന് ₹5,000 അയക്കൂ',     a: '₹5,00,000 ട്രാൻസ്ഫർ ആരംഭിച്ചു. PIN സ്ഥിരീകരിക്കൂ.', conf: 92, tokens: 52, step: 'Transaction authorized...' },
      loan:     { q: 'ഹോം ലോൺ വിവരം പറയൂ',        a: '7.5% പലിശയ്ക്ക് ഹോം ലോൺ ലഭ്യമാണ്.',          conf: 94, tokens: 60, step: 'Credit score check: 760+...' },
      fd:       { q: 'FD കണക്കാക്കൂ — ₹5 ലക്ഷം',   a: '5,00,000 × 12 മാസം × 7.2% = ₹5,74,320.',    conf: 96, tokens: 68, step: 'Compound interest calculated...' },
    }
  };

const BASE_URL = ''; // Set to your deployed backend URL before submission

  /* ══════════════════════════════════════════
     STATE
  ══════════════════════════════════════════ */
  let currentLang  = 'Hindi';
  let currentQuery = 'balance';
  let isRunning    = false;
  let latencyTimer = null;
  let activeSpeechUtterance = null;
  let activeAudio = null;

  // Web Audio Recording Variables
  let audioContext = null;
  let analyser = null;
  let microphoneStream = null;
  let micSourceNode = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;

  /* ══════════════════════════════════════════
     DOM REFS
  ══════════════════════════════════════════ */
  const chat       = document.getElementById('demo-chat-customer');
  const typingEl   = document.getElementById('typing-customer');
  const startBtn   = document.getElementById('demo-start-btn');
  const btnText    = document.getElementById('demo-btn-text');
  const btnIcon    = document.getElementById('demo-start-icon');
  const langLabel  = document.getElementById('customer-lang-label');
  const statusEl   = document.getElementById('ai-bridge-status');
  const voiceWaves = document.getElementById('voice-waves');
  const voiceBar   = document.getElementById('demo-voice-bar');

  // Mic and PDF Buttons
  const micBtn     = document.getElementById('demo-mic-btn');
  const pdfBtn     = document.getElementById('demo-pdf-btn');

  // ASR Fallback Trigger
  const fallbackCheck = document.getElementById('simulate-fallback');

  // Metrics
  const mLatency  = document.getElementById('metric-latency');
  const mConf     = document.getElementById('metric-conf');
  const mTokens   = document.getElementById('metric-tokens');
  const mEngine   = document.getElementById('metric-engine-name');
  const ldValue   = document.getElementById('ld-value');
  const ldConf    = document.getElementById('ld-confidence');
  const ldCard    = document.getElementById('lang-detect-card');

  /* ══════════════════════════════════════════
     WAVEFORM CANVAS
  ══════════════════════════════════════════ */
  const wfCanvas  = document.getElementById('waveform-canvas');
  let   wfCtx     = null;
  let   wfRaf     = null;
  let   wfActive  = false;
  let   wfPoints  = [];

  function initWaveform() {
    if (!wfCanvas) return;
    wfCtx = wfCanvas.getContext('2d');

    function resize() {
      const r = wfCanvas.parentElement.getBoundingClientRect();
      wfCanvas.width  = r.width  * devicePixelRatio;
      wfCanvas.height = r.height * devicePixelRatio;
      wfCtx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    new ResizeObserver(resize).observe(wfCanvas.parentElement);

    // Init points
    const COUNT = 60;
    wfPoints = [];
    for (let i = 0; i < COUNT; i++) wfPoints.push(0);

    drawWaveform();
  }

  function drawWaveform() {
    if (!wfCtx) return;
    const W = wfCanvas.parentElement.clientWidth;
    const H = wfCanvas.parentElement.clientHeight;

    wfCtx.clearRect(0, 0, W, H);

    // Shift and add new point
    wfPoints.shift();

    if (analyser) {
      // Real-time audio waveform from microphone
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalizedAmp = avg / 128.0; // scale appropriately
      wfPoints.push(Math.min(1.1, 0.08 + normalizedAmp * 0.95));
    } else if (wfActive) {
      // Simulated active wave
      const amp = 0.25 + Math.random() * 0.55;
      wfPoints.push(amp);
    } else {
      // Idle — gentle sine wave
      const t = Date.now() / 2000;
      wfPoints.push(0.06 + Math.sin(t * 3 + wfPoints.length) * 0.04);
    }

    const step = W / (wfPoints.length - 1);
    const mid  = H / 2;

    // Draw upper + lower mirror waves
    [-1, 1].forEach(side => {
      const grad = wfCtx.createLinearGradient(0, 0, W, 0);
      if (analyser || wfActive) {
        grad.addColorStop(0,   'rgba(232,57,42,0)');
        grad.addColorStop(0.4, 'rgba(232,57,42,0.85)');
        grad.addColorStop(1,   'rgba(232,57,42,0.3)');
      } else {
        grad.addColorStop(0,   'rgba(27,43,107,0)');
        grad.addColorStop(0.5, 'rgba(27,43,107,0.35)');
        grad.addColorStop(1,   'rgba(27,43,107,0)');
      }

      wfCtx.beginPath();
      wfCtx.moveTo(0, mid);

      wfPoints.forEach((v, i) => {
        const x = i * step;
        const y = mid + side * v * (mid * 0.72);
        if (i === 0) {
          wfCtx.moveTo(x, y);
        } else {
          const px = (i - 1) * step;
          const py = mid + side * wfPoints[i-1] * (mid * 0.72);
          const cx = (px + x) / 2;
          wfCtx.bezierCurveTo(cx, py, cx, y, x, y);
        }
      });

      wfCtx.strokeStyle = grad;
      wfCtx.lineWidth   = (analyser || wfActive) ? 1.8 : 1;
      wfCtx.stroke();
    });

    wfRaf = requestAnimationFrame(drawWaveform);
  }

  function setWaveformActive(active) {
    wfActive = active;
  }

  /* ══════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════ */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  /* ══════════════════════════════════════════
     CHAT HELPERS
  ══════════════════════════════════════════ */
  function clearChat() {
    if (!chat) return;
    chat.querySelectorAll('.chat-bubble, .chat-welcome-card').forEach(el => el.remove());
  }

  function addWelcomeCard() {
    if (!chat || !typingEl) return;
    const el = document.createElement('div');
    el.className = 'chat-welcome-card';
    el.innerHTML =
      '<div class="cwc-icon">🏦</div>' +
      '<div class="cwc-title">VaaniBank AI</div>' +
      '<div class="cwc-sub">Namaste! How can I assist you today?</div>';
    chat.insertBefore(el, typingEl);
  }

  function addBubble(text, type, meta) {
    if (!chat || !typingEl) return;
    const el = document.createElement('div');
    el.className = 'chat-bubble ' + type;

    if (type === 'translated') {
      const tag = document.createElement('div');
      tag.className = 'translate-tag';
      tag.textContent = 'VaaniBank AI';
      el.appendChild(tag);
    }

    const body = document.createElement('div');
    body.textContent = text;
    el.appendChild(body);

    if (meta) {
      const m = document.createElement('div');
      m.className = 'bubble-meta';
      m.textContent = meta;
      el.appendChild(m);
    }

    chat.insertBefore(el, typingEl);
    chat.scrollTop = chat.scrollHeight;
  }

  function showTyping() {
    typingEl?.classList.add('visible');
    if (chat) chat.scrollTop = chat.scrollHeight;
  }

  function hideTyping() { typingEl?.classList.remove('visible'); }

  /* ══════════════════════════════════════════
     STATUS
  ══════════════════════════════════════════ */
  function setStatus(text, cls) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'app-status';
    if (cls) statusEl.classList.add(cls);
  }

  function setVoice(active) {
    voiceWaves?.classList.toggle('active', active);
    voiceBar?.classList.toggle('listening', active);
    setWaveformActive(active);
  }



  /* ══════════════════════════════════════════
     METRIC HELPERS
  ══════════════════════════════════════════ */
  function flashMetric(el, value) {
    if (!el) return;
    el.textContent = value;
    el.classList.remove('val-flash');
    void el.offsetWidth;
    el.classList.add('val-flash');
    setTimeout(() => el.classList.remove('val-flash'), 600);
  }

  function animateValue(el, startVal, target, durationMs, suffix = '') {
    if (!el) return;
    const start = Date.now();
    const update = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const val = Math.round(startVal + (target - startVal) * progress);
      el.textContent = val + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        flashMetric(el, target + suffix);
      }
    };
    requestAnimationFrame(update);
  }



  /* ══════════════════════════════════════════
     CORE PRESENTATION RESPONSE FLOW
  ══════════════════════════════════════════ */
  async function processNluPipeline(inputText, language, confidenceScore, realMs) {
    const fallbackQuery = QUERIES[language][currentQuery];
    const isFallbackEngine = fallbackCheck?.checked;

    // FIX 9: Update visual ASR Engine metric card on the dashboard
    if (mEngine) {
      mEngine.textContent = isFallbackEngine ? "Groq Whisper" : "Sarvam Saarika";
      mEngine.style.color = isFallbackEngine ? "var(--red)" : "var(--green)";
    }

    // Determine latency: either real measured latency or simulated random latency
    const latency = typeof realMs === 'number' ? realMs : rand(220, 360);

    // Phase 2 — NLU Processing
    setStatus('● Processing…', 's-processing');
    
    // FIX 5: Animate latency counter on the UI
    animateValue(mLatency, 0, latency, Math.min(latency, 400), 'ms');
    await wait(Math.min(latency, 400));

    // Populate metadata badges
    flashMetric(mConf, confidenceScore + '%');
    flashMetric(mTokens, fallbackQuery.tokens);

    if (ldValue) ldValue.textContent = language;
    if (ldConf)  ldConf.textContent  = confidenceScore + '%';
    ldCard?.classList.add('ld-flash');
    setTimeout(() => ldCard?.classList.remove('ld-flash'), 600);

    // FIX 1: Seamless auto-play response flow without Teller/Staff approval
    showTyping();
    await wait(800); // Simulate typing/generation delay
    hideTyping();
    addBubble(fallbackQuery.a, 'translated', language);

    setStatus('● Online', 's-online');

    // Trigger TTS response playback
    await speakResponse(fallbackQuery.a, language);
  }

  async function runScenario() {
    if (isRunning) return;
    isRunning = true;

    if (startBtn) { startBtn.classList.add('running'); startBtn.disabled = true; }
    if (btnText)  btnText.textContent = 'Running…';
    if (btnIcon)  { btnIcon.textContent = '⟳'; }

    clearChat();
    addWelcomeCard();

    const isFallback = fallbackCheck?.checked;
    
    // We update engine indicator card early to reflect what we are querying
    if (mEngine) {
      mEngine.textContent = isFallback ? "Groq Whisper" : "Sarvam Saarika";
      mEngine.style.color = isFallback ? "var(--red)" : "var(--green)";
    }

    let queryData = QUERIES[currentLang][currentQuery];
    let realMs = null;

    // FIX 2: Guard fetch call and skip if BASE_URL is empty
    if (BASE_URL) {
      const t0 = Date.now();
      try {
        const resp = await fetch(`${BASE_URL}/api/demo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: currentLang, intent: currentQuery, fallback: isFallback })
        });
        if (resp.ok) {
          const backendData = await resp.json();
          queryData = {
            q: backendData.q || queryData.q,
            a: backendData.a || queryData.a,
            conf: backendData.conf || queryData.conf,
            tokens: backendData.tokens || queryData.tokens,
            step: backendData.step || queryData.step
          };
          realMs = Date.now() - t0;
        }
      } catch (err) {
        console.warn("Backend REST server offline or error. Running seamless high-fidelity frontend prototype logic.", err);
      }
    }

    // Phase 1 — Listening User Simulation
    setStatus('● Listening…', 's-listening');
    setVoice(true);
    showTyping();
    await wait(1100);
    hideTyping();
    setVoice(false);
    
    // Add user question bubble
    addBubble(queryData.q, 'original', currentLang);
    await wait(300);

    // Run NLU Pipeline
    await processNluPipeline(queryData.q, currentLang, queryData.conf, realMs);

    isRunning = false;
    if (startBtn) { startBtn.classList.remove('running'); startBtn.disabled = false; }
    if (btnText)  btnText.textContent = 'Run Scenario';
    if (btnIcon)  btnIcon.textContent = '▶';
  }

  /* ══════════════════════════════════════════
     LIVE RECORDING IMPLEMENTATION
  ══════════════════════════════════════════ */
  async function startRecording() {
    if (isRecording) return;
    clearChat();
    addWelcomeCard();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStream = stream;
      isRecording = true;

      // Update phone interface UI
      if (voiceWaves) voiceWaves.classList.add('active');
      if (voiceBar) voiceBar.classList.add('listening');
      setStatus('● Listening Voice…', 's-listening');
      
      if (micBtn) {
        micBtn.classList.add('mic-recording');
        const micText = document.getElementById('demo-mic-text');
        if (micText) micText.textContent = 'Recording…';
        const micIcon = document.getElementById('demo-mic-icon');
        if (micIcon) micIcon.textContent = '🛑';
      }

      // Hook up Web Audio analyser for genuine real-time voice feedback
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      micSourceNode = audioContext.createMediaStreamSource(stream);
      micSourceNode.connect(analyser);

      // Start MediaRecorder capture
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      
      // Auto-stop record duration safety limit (6 seconds for banking prompt)
      const autoStopTimeout = setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 6000);

      mediaRecorder.onstop = async () => {
        clearTimeout(autoStopTimeout);
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
      };

      mediaRecorder.start();
      setWaveformActive(true);

    } catch (err) {
      console.warn('Microphone permission denied or unsupported environment. Initializing voice simulator.', err);
      simulateVoiceRecording();
    }
  }

  function stopRecording() {
    if (!isRecording) return;
    isRecording = false;

    // Reset phone UI states
    if (voiceWaves) voiceWaves.classList.remove('active');
    if (voiceBar) voiceBar.classList.remove('listening');
    
    if (micBtn) {
      micBtn.classList.remove('mic-recording');
      const micText = document.getElementById('demo-mic-text');
      if (micText) micText.textContent = 'Live Mic';
      const micIcon = document.getElementById('demo-mic-icon');
      if (micIcon) micIcon.textContent = '🎤';
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    if (microphoneStream) {
      microphoneStream.getTracks().forEach(track => track.stop());
      microphoneStream = null;
    }
    
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    analyser = null;
    setWaveformActive(false);
  }

  async function simulateVoiceRecording() {
    isRecording = true;
    if (voiceWaves) voiceWaves.classList.add('active');
    if (voiceBar) voiceBar.classList.add('listening');
    setStatus('● Listening Voice…', 's-listening');
    setWaveformActive(true);

    if (micBtn) {
      micBtn.classList.add('mic-recording');
      const micText = document.getElementById('demo-mic-text');
      if (micText) micText.textContent = 'Simulating…';
      const micIcon = document.getElementById('demo-mic-icon');
      if (micIcon) micIcon.textContent = '🛑';
    }

    // Capture simulated voice for 3.5 seconds
    await wait(3500);

    stopRecording();
  }

  async function processVoiceInput(audioBlob) {
    setStatus('● Transcribing…', 's-processing');
    showTyping();

    let transcribedText = "";
    let detectedLang = currentLang;
    let confidence = rand(92, 98);
    let realMs = null;

    if (BASE_URL) {
      const t0 = Date.now();
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('language', currentLang);

        const resp = await fetch(`${BASE_URL}/api/transcribe`, {
          method: 'POST',
          body: formData
        });
        
        if (resp.ok) {
          const result = await resp.json();
          transcribedText = result.transcript;
          detectedLang = result.language || currentLang;
          confidence = result.confidence || confidence;
          realMs = Date.now() - t0;
        } else {
          throw new Error('Transcription API returned error code');
        }
      } catch (err) {
        console.warn('Transcription service offline or error. Loading template transcription for regional scenario.', err);
        const fallbackQuery = QUERIES[currentLang][currentQuery];
        transcribedText = fallbackQuery.q;
        confidence = fallbackQuery.conf;
      }
    } else {
      const fallbackQuery = QUERIES[currentLang][currentQuery];
      transcribedText = fallbackQuery.q;
      confidence = fallbackQuery.conf;
    }

    hideTyping();
    addBubble(transcribedText, 'original', detectedLang);
    await wait(300);

    // Run NLU processing pipeline
    await processNluPipeline(transcribedText, detectedLang, confidence, realMs);
  }

  /* ══════════════════════════════════════════
     TTS AUDIO PLAYBACK & WEB SPEECH SYNTHESIS FALLBACK
  ══════════════════════════════════════════ */
    function cleanTextForTTS(text, lang) {
    let t = text;
    
    // Replace currency symbol
    const rupeeWords = {
      'Hindi': 'रुपये',
      'Marathi': 'रुपये',
      'Tamil': 'ரூபாய்',
      'Telugu': 'రూపాయలు',
      'Bengali': 'টাকা',
      'Kannada': 'ರೂಪಾಯಿ',
      'Odia': 'ଟଙ୍କା',
      'Punjabi': 'ਰੁਪਏ',
      'Gujarati': 'રૂપિયા',
      'Malayalam': 'രൂപ'
    };
    const rupeeWord = rupeeWords[lang] || 'Rupees';
    t = t.replace(/₹/g, rupeeWord);

    // Replace percent symbol
    const percentWords = {
      'Hindi': ' प्रतिशत ',
      'Marathi': ' टक्के ',
      'Tamil': ' சதவீதம் ',
      'Telugu': ' శాతం ',
      'Bengali': ' শতাংশ ',
      'Kannada': ' ಪ್ರತಿಶತ ',
      'Odia': ' ପ୍ରତିଶତ ',
      'Punjabi': ' ਪ੍ਰਤੀਸ਼ਤ ',
      'Gujarati': ' ટકા ',
      'Malayalam': ' ശതമാനം '
    };
    const percentWord = percentWords[lang] || ' percent ';
    t = t.replace(/%/g, percentWord);

    // Replace multiply symbol (×)
    const multiplyWords = {
      'Hindi': ' गुणा ',
      'Marathi': ' गुणिले ',
      'Tamil': ' பெருக்கல் ',
      'Telugu': ' గుణకారం ',
      'Bengali': ' গুণ ',
      'Kannada': ' ಗುಣಾಕಾರ ',
      'Odia': ' ଗୁଣନ ',
      'Punjabi': ' ਗੁਣਾ ',
      'Gujarati': ' ગુણાકાર ',
      'Malayalam': ' gu-na-nam '
    };
    const multiplyWord = multiplyWords[lang] || ' times ';
    t = t.replace(/×/g, multiplyWord);

    // Replace equals symbol (=)
    const equalsWords = {
      'Hindi': ' बराबर ',
      'Marathi': ' बरोबर ',
      'Tamil': ' சமம் ',
      'Telugu': ' సమానం ',
      'Bengali': ' সমান ',
      'Kannada': ' ಸಮನಾಗಿದೆ ',
      'Odia': ' ସମାନ ',
      'Punjabi': ' ਬਰਾਬਰ ',
      'Gujarati': ' બરાબર ',
      'Malayalam': ' തുല്യം '
    };
    const equalsWord = equalsWords[lang] || ' equals ';
    t = t.replace(/=/g, equalsWord);

    // Remove checkmarks and other special visual indicators
    t = t.replace(/✓/g, '').replace(/×/g, '');

    return t;
  }

  /* ══════════════════════════════════════════
     TTS AUDIO PLAYBACK & WEB SPEECH SYNTHESIS FALLBACK
  ══════════════════════════════════════════ */
  async function speakResponse(text, lang) {
    // Terminate ongoing speech synthesis or audio tracks
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      // Un-wedge Chrome engine
      window.speechSynthesis.resume();
      await new Promise(r => setTimeout(r, 100));
    }
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }

    if (BASE_URL) {
      try {
        const resp = await fetch(`${BASE_URL}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language: lang })
        });
        if (resp.ok) {
          const result = await resp.json();
          if (result.audio) {
            activeAudio = new Audio('data:audio/wav;base64,' + result.audio);
            activeAudio.play();
            return;
          }
        }
      } catch (err) {
        console.warn('Neural TTS API offline. Falling back to native browser regional speech engine.');
      }
    }

    // SpeechSynthesis Fallback
    if ('speechSynthesis' in window) {
      const langMapping = {
        'Hindi': 'hi-IN',
        'Marathi': 'mr-IN',
        'Tamil': 'ta-IN',
        'Telugu': 'te-IN',
        'Gujarati': 'gu-IN',
        'Bengali': 'bn-IN',
        'Kannada': 'kn-IN',
        'Odia': 'or-IN',
        'Punjabi': 'pa-IN',
        'Malayalam': 'ml-IN'
      };
      
      const targetLangTag = langMapping[lang] || 'en-IN';
      const voices = window.speechSynthesis.getVoices();
      
      // 1. Try to find exact match (e.g. 'hi-IN')
      let matchVoice = voices.find(v => {
        const vl = v.lang.replace('_', '-').toLowerCase();
        return vl === targetLangTag.toLowerCase() || vl.startsWith(targetLangTag.toLowerCase() + '-');
      });
      
      // 2. Try to find prefix match (e.g. 'hi')
      if (!matchVoice) {
        const prefix = targetLangTag.split('-')[0].toLowerCase();
        matchVoice = voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith(prefix));
      }
      
      // 3. Fallback to Hindi voice for Sanskrit-derived regional languages
      if (!matchVoice && ['Marathi', 'Gujarati', 'Bengali', 'Odia', 'Punjabi'].includes(lang)) {
        matchVoice = voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('hi'));
      }
      
      // 4. Try to find any Indian voice (e.g. Indian English)
      if (!matchVoice) {
        matchVoice = voices.find(v => v.lang.replace('_', '-').toLowerCase().includes('-in'));
      }
      
      // 5. Try to find any English voice
      if (!matchVoice) {
        matchVoice = voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('en'));
      }
      
      let speakText = text;
      let speakLang = targetLangTag;
      
      if (matchVoice) {
        speakLang = matchVoice.lang;
        const matchedPrefix = matchVoice.lang.split('-')[0].toLowerCase();
        const targetPrefix = targetLangTag.split('-')[0].toLowerCase();
        
        // If matched voice is English (e.g. en-IN or en-US) but the target language is not English or Hindi,
        // we speak a premium translated banking response in English so it does not fail silently!
        if (matchedPrefix === 'en' && targetPrefix !== 'en' && targetPrefix !== 'hi') {
          const englishResponses = {
            balance: "Your account balance is Rupees 47,850.",
            transfer: "Transfer of Rupees 5,000 initiated. Please confirm with PIN.",
            loan: "Home loan is available at 7.5% interest rate for a tenure of 20 years.",
            fd: "Fixed deposit of Rupees 5 Lakhs for 12 months at 7.2% interest will yield Rupees 5,74,320 at maturity."
          };
          speakText = englishResponses[currentQuery] || "Transaction completed successfully.";
        } else if (matchedPrefix === 'hi' && targetPrefix !== 'hi') {
          // If we fell back to Hindi voice for other regional languages, use Devanagari Hindi text so it pronounces correctly!
          const hindiResponses = {
            balance: "आपका बैलेंस 47,850 रुपये है।",
            transfer: "5,000 रुपये का ट्रांसफर शुरू। पिन से पुष्टि करें।",
            loan: "होम लोन 7.5% ब्याज पर उपलब्ध। अवधि 20 वर्ष।",
            fd: "5,00,000 रुपये का एफडी 12 महीने के लिए 7.2% ब्याज पर। परिपक्वता पर 5,74,320 रुपये मिलेंगे।"
          };
          speakText = hindiResponses[currentQuery] || "कार्य पूरा हो गया है।";
        }
      } else {
        // No matching voices at all — default to English response
        const englishResponses = {
          balance: "Your account balance is Rupees 47,850.",
          transfer: "Transfer of Rupees 5,000 initiated. Please confirm with PIN.",
          loan: "Home loan is available at 7.5% interest rate for a tenure of 20 years.",
          fd: "Fixed deposit of Rupees 5 Lakhs for 12 months at 7.2% interest will yield Rupees 5,74,320 at maturity."
        };
        speakText = englishResponses[currentQuery] || "Transaction completed successfully.";
        speakLang = 'en-IN';
      }

      const cleaned = cleanTextForTTS(speakText, lang);
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = speakLang;
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
      
      utterance.rate = 0.95; 
      utterance.pitch = 1.0;
      
      // Store on window to prevent garbage collection bugs
      window.activeSpeechUtterance = utterance;
      activeSpeechUtterance = utterance;
      
      window.speechSynthesis.speak(utterance);
    }
  }



function generateBilingualPdf() {
    const link = document.createElement('a');
    link.href = 'assets/VaaniBank_Summary_ZKL-8077.pdf';
    link.download = 'VaaniBank_Summary_ZKL-8077.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
    
    // Primary Header Block
    doc.setFillColor(27, 43, 107); // Navy #1B2B6B
    doc.rect(0, 0, 210, 42, 'F');
    
    // Title Branding
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("VAANIBANK AI", 15, 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("INDIA'S #1 VOICE-FIRST AI BRANCH SYSTEM", 15, 30);
    doc.text("PSB iDEA 2.0 Hackathon Presentation", 132, 22);
    
    // Set layout styling
    doc.setTextColor(27, 43, 107);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("COMPLIANCE & TRANSACTION AUDIT REPORT", 15, 56);
    
    // Horizontal rule
    doc.setDrawColor(27, 43, 107);
    doc.setLineWidth(0.6);
    doc.line(15, 59, 195, 59);
    
    // Session metadata
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    
    const sessionId = `VBI-${Date.now().toString(36).toUpperCase()}-${rand(1000, 9999)}`;
    const timestamp = new Date().toLocaleString();
    const isFallback = fallbackCheck?.checked;
    const asrEngine = isFallback ? "Groq Whisper LPU (ASR Level-2 Fallback)" : "Sarvam Saarika v2.5 (Primary Engine)";
    
    doc.setFont('helvetica', 'bold');
    doc.text("Audit Reference ID:", 15, 69);
    doc.text("Session Timestamp:", 15, 76);
    doc.text("Customer Language:", 15, 83);
    doc.text("Classified Intent:", 15, 90);
    
    doc.setFont('helvetica', 'normal');
    doc.text(sessionId, 60, 69);
    doc.text(timestamp, 60, 76);
    doc.text(`${currentLang} (Regional Indian Language)`, 60, 83);
    doc.text(`${currentQuery.toUpperCase()} TRANSACTION`, 60, 90);

    doc.setFont('helvetica', 'bold');
    doc.text("Active ASR Engine:", 115, 69);
    doc.text("NLU Confidence:", 115, 76);
    doc.text("End-to-End Latency:", 115, 83);
    doc.text("Total Tokens:", 115, 90);

    const fallbackQuery = QUERIES[currentLang][currentQuery];
    const confidence = mConf.textContent !== '—' ? mConf.textContent : `${fallbackQuery.conf}%`;
    const latency = mLatency.textContent !== '—' ? mLatency.textContent : "240ms";
    const tokens = mTokens.textContent !== '—' ? mTokens.textContent : fallbackQuery.tokens;

    doc.setFont('helvetica', 'normal');
    doc.text(asrEngine, 155, 69);
    doc.text(confidence, 155, 76);
    doc.text(latency, 155, 83);
    doc.text(String(tokens), 155, 90);

    // Transcript logs section
    doc.setTextColor(27, 43, 107);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("REGIONAL CONVERSATION TRANSLATION LOGS", 15, 107);
    doc.line(15, 110, 195, 110);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Customer Regional Speech (Input Query):", 15, 120);
    doc.setFont('helvetica', 'italic');
    doc.text(`"${fallbackQuery.q}"`, 20, 127);

    doc.setFont('helvetica', 'bold');
    doc.text("AI Multilingual Response (Output):", 15, 140);
    doc.setFont('helvetica', 'italic');
    doc.text(`"${fallbackQuery.a}"`, 20, 147);

    // Compliance scorecard checks
    doc.setTextColor(27, 43, 107);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("ENTERPRISE SECURITY & COMPLIANCE SHIELD AUDIT", 15, 167);
    doc.line(15, 170, 195, 170);

    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    doc.text("1. GDPR & RBI PII Shield Protection Layer", 15, 180);
    doc.setFont('helvetica', 'normal');
    doc.text("PASSED - Sensitive client metrics, PAN, Aadhaar cards and phone integers scrubbed at kiosk origin prior to API transmission.", 20, 186);

    doc.setFont('helvetica', 'bold');
    doc.text("2. Branch Kiosk SLA Response Time Compliance (< 1.0s target)", 15, 196);
    doc.setFont('helvetica', 'normal');
    doc.text(`PASSED - Transaction processed and completed in ${latency} (SLA target threshold: 1000ms).`, 20, 202);

    doc.setFont('helvetica', 'bold');
    doc.text("3. Multi-ASR Engine Failover Capability Verification", 15, 212);
    doc.setFont('helvetica', 'normal');
    doc.text(isFallback ? "TRIGGERED FAILOVER - Primary engine threshold exceeded. Groq Whisper LPU fallback fired successfully." : "STABLE - Centralized Sarvam Saarika v2.5 primary engine completed operation with high intent score.", 20, 218);

    doc.setFont('helvetica', 'bold');
    doc.text("4. Finacle Central Core Banking Synchronization", 15, 228);
    doc.setFont('helvetica', 'normal');
    doc.text("SYNCD - Full audit records structured and uploaded safely to decentralized PSB core banking ledger.", 20, 234);

    // Business Impact Section
    doc.setTextColor(27, 43, 107);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text("PROJECTED BUSINESS IMPACT — UNION BANK NETWORK", 15, 245);
    doc.setLineWidth(0.4);
    doc.line(15, 248, 195, 248);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);

    const stats = [
      ["Union Bank Branch Network:", "8,700+ branches across India"],
      ["Avg. language friction queries/day:", "~30% of walk-in interactions"],
      ["Time saved per resolved interaction:", "3–4 minutes (no interpreter needed)"],
      ["Est. daily hours saved (network-wide):", "~4,350 staff-hours per day"],
      ["Languages supported by VaaniBank AI:", "10 major Indian regional languages"],
      ["Target SLA — End-to-end response:", "< 800ms (currently achieved in demo)"],
    ];

    let yPos = 256;
    stats.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 105, yPos);
      yPos += 6;
    });

    // Bottom structural color bar (adjusted starting at y=287 height=10 to avoid overlap)
    doc.setFillColor(27, 43, 107);
    doc.rect(0, 287, 210, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text("CONFIDENTIAL  ·  VAANIBANK COMPLIANCE SYSTEM  ·  FOR BOARD & AUDIT REVIEW ONLY", 46, 293);

    // Save
    doc.save(`VaaniBank_Session_Audit_${sessionId}.pdf`);
  }

  /* ══════════════════════════════════════════
     EVENT BINDINGS
  ══════════════════════════════════════════ */
  startBtn?.addEventListener('click', runScenario);
  
  // Live Mic Toggle Binding
  micBtn?.addEventListener('click', () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  // PDF Audit Report Download
  pdfBtn?.addEventListener('click', generateBilingualPdf);



  // Language selection options
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
      if (isRunning || isRecording) return;
      currentLang = opt.dataset.lang;
      document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      if (langLabel) langLabel.textContent = currentLang;
      if (ldValue)   ldValue.textContent   = 'Select & Run';
      if (ldConf)    ldConf.textContent    = '—';
      
      // Stop speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    });
  });

  // Scenario selection options
  document.querySelectorAll('.scenario-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunning || isRecording) return;
      currentQuery = btn.dataset.query;
      document.querySelectorAll('.scenario-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Handle load voice engine list
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  initWaveform();

})();
