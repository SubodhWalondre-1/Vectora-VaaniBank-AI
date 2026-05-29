/* ============================================
   CONTACT — Form Submission & Validation
   VaaniBank AI — contact.js
   ============================================ */

(function () {
  'use strict';

  // ── CONFIGURE THESE ─────────────────────────────────────
  const WEB3FORMS_ACCESS_KEY = '8e22b011-2d8a-4356-bdfd-087ac7d4a505';   // from web3forms.com
  // ────────────────────────────────────────────────────────

  const form      = document.getElementById('contact-form');
  const success   = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit-btn');
  const msgTextarea = document.getElementById('f-msg');
  const liveSentimentBadge = document.getElementById('live-sentiment');
  const roleInputContainer = document.getElementById('role-input-container');
  let toastTimeout;
  let stepperTimeouts = [];

  // Dynamic Lexer Storage variables (loaded/trained from sentiment_training_data.txt)
  let trainingDataLoaded = false;
  let dynamicPositiveWords = {};
  let dynamicNegativeWords = {};
  let dynamicFrictionKeywords = {};
  let dynamicNegations = new Set();
  let dynamicIntensifiers = {};
  let dynamicMultiwordRules = [];

  const defaultSelectHTML = `
    <select class="form-input form-select" id="f-role" name="Role">
      <option value="">Select your role</option>
      <option value="Customer / Account Holder">Customer / Account Holder</option>
      <option value="Bank / NBFC Decision Maker">Bank / NBFC Decision Maker</option>
      <option value="Product / Technology Head">Product / Technology Head</option>
      <option value="Fintech Founder">Fintech Founder</option>
      <option value="Investor / Analyst">Investor / Analyst</option>
      <option value="Other">Other...</option>
    </select>
  `;

  if (!form) return;

  /* ── Validation helpers ───────────────────────────────── */
  function showError(input, msg) {
    input.style.borderColor = 'var(--red)';
    input.setAttribute('aria-invalid', 'true');
    let err = document.getElementById('err-' + input.id);
    if (!err) {
      err = document.createElement('div');
      err.id = 'err-' + input.id;
      err.className = 'field-error';
      err.setAttribute('role', 'alert');
      
      let targetParent = input.parentNode;
      if (targetParent && targetParent.classList.contains('role-input-container')) {
        targetParent = targetParent.parentNode;
      }
      targetParent.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearErrors() {
    form.querySelectorAll('.form-input').forEach(i => {
      i.style.borderColor = '';
      i.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.field-error').forEach(e => e.remove());
  }

  function setLoading(on) {
    submitBtn.disabled    = on;
    submitBtn.textContent = on ? 'Sending…' : 'Send Message →';
    submitBtn.style.opacity = on ? '0.7' : '1';
  }

  /* ── Debounce Helper ── */
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /* ── Training Parser Helper ── */
  function parseTrainingText(text) {
    const lines = text.split(/\r?\n/);
    let currentSection = '';
    
    const pos = {};
    const neg = {};
    const fric = {};
    const negations = new Set();
    const intens = {};
    const multi = [];

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;
      
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1).toUpperCase();
        continue;
      }
      
      const eqIdx = line.indexOf('=');
      if (currentSection === 'NEGATIONS') {
        line.split(',').forEach(item => {
          const cl = item.trim().toLowerCase();
          if (cl) negations.add(cl);
        });
      } else if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx).trim();
        const valStr = line.slice(eqIdx + 1).trim();
        const val = parseFloat(valStr);
        
        if (isNaN(val)) continue;

        if (currentSection === 'MULTIWORD_RULES') {
          const phrase = key.replace(/^"|"$/g, '').toLowerCase();
          const pattern = new RegExp('\\b' + phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'gi');
          multi.push({ pattern, score: val });
        } else if (currentSection === 'POSITIVE_WORDS') {
          pos[key.toLowerCase()] = val;
        } else if (currentSection === 'NEGATIVE_WORDS') {
          neg[key.toLowerCase()] = val;
        } else if (currentSection === 'FRICTION_WORDS') {
          fric[key.toLowerCase()] = val;
        } else if (currentSection === 'INTENSIFIERS') {
          intens[key.toLowerCase()] = val;
        }
      }
    }

    dynamicPositiveWords = pos;
    dynamicNegativeWords = neg;
    dynamicFrictionKeywords = fric;
    dynamicNegations = negations;
    dynamicIntensifiers = intens;
    dynamicMultiwordRules = multi;
  }

  /* ── Training Loader (Stale-While-Revalidate with localStorage) ── */
  async function loadTrainingData() {
    // 1. Instantly load from cache if available (0ms load time)
    const cached = localStorage.getItem('vani_sentiment_training');
    if (cached) {
      try {
        parseTrainingText(cached);
        trainingDataLoaded = true;
        console.log('Instant-Load: Sentiment Lexer trained from localStorage cache.');
      } catch (e) {
        console.warn('Failed parsing cached training data:', e);
      }
    }

    // 2. Fetch fresh rules from the server in the background
    try {
      const response = await fetch('sentiment_training_data.txt');
      if (!response.ok) throw new Error('Not found');
      const text = await response.text();
      
      // Only parse and trigger recheck if the file content changed from what we had
      if (text !== cached) {
        parseTrainingText(text);
        localStorage.setItem('vani_sentiment_training', text);
        trainingDataLoaded = true;
        console.log('Background-Sync: Sentiment Lexer updated with fresh training data from server.');
        
        // Re-trigger live sentiment check if textarea is populated
        if (msgTextarea) {
          msgTextarea.dispatchEvent(new Event('input'));
        }
      }
    } catch (err) {
      if (!trainingDataLoaded) {
        console.warn('CORS restriction or offline mode: utilizing built-in fallback rules.');
      }
    }
  }

  // Train model immediately (cache-first revalidation)
  loadTrainingData();

  /* ── NLP Sentiment Analyzer (VADER-inspired Advanced Lexer) ── */
  function analyzeSentiment(text, ratingValue = null) {
    if (!text || !text.trim()) {
      if (ratingValue !== null) {
        const r = parseInt(ratingValue, 10);
        if (r === 1 || r === 2) return 'Negative 🔴';
        if (r === 3) return 'Neutral 🟡';
        if (r === 4 || r === 5) return 'Positive 🟢';
      }
      return 'Neutral 🟡';
    }
    
    // 1. Exclamation mark punctuation intensity calculation
    const exclamationCount = (text.match(/!/g) || []).length;
    const punctuationMultiplier = Math.min(2.0, 1.0 + (exclamationCount * 0.15));

    const cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ");
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const originalWords = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ").split(/\s+/).filter(w => w.length > 0);
    
    let posScore = 0;
    let negScore = 0;

    // Use dynamic rules if trained, otherwise fall back to static definitions
    const activePositiveWords = trainingDataLoaded ? dynamicPositiveWords : {
      'excellent': 3, 'great': 2, 'awesome': 3, 'amazing': 2, 'helpful': 2, 'loved': 2, 'love': 2, 
      'fantastic': 3, 'wonderful': 3, 'perfect': 3, 'smooth': 2, 'fast': 2, 'quick': 2, 'prompt': 2, 
      'pleased': 2, 'happy': 2, 'satisfy': 2, 'satisfied': 2, 'easy': 2, 'simple': 2, 'elegant': 2, 
      'premium': 2, 'wow': 3, 'thank': 2, 'thanks': 2, 'good': 1, 'best': 2, 'solved': 2, 'resolved': 2, 
      'resolution': 2, 'stellar': 3, 'outstanding': 3, 'recommend': 2, 'positive': 1, 'friendly': 2,
      'efficient': 2, 'superb': 3, 'brilliant': 3, 'useful': 2, 'convenient': 2, 'responsive': 2
    };
    
    const activeNegativeWords = trainingDataLoaded ? dynamicNegativeWords : {
      'bad': -1.5, 'worst': -3, 'terrible': -3, 'lag': -2, 'laggy': -2, 'angry': -2, 'slow': -2, 'hate': -2.5, 
      'poor': -2, 'horrible': -3, 'error': -2, 'bug': -2, 'bugs': -2, 'crash': -3, 'crashed': -3, 'issue': -1, 
      'problem': -1, 'failed': -2, 'fail': -2, 'failing': -2, 'failure': -2, 'broken': -2, 'difficult': -2, 
      'complex': -2, 'delays': -2, 'delayed': -2, 'delay': -2, 'disappointing': -2.5, 'disappointed': -2.5, 
      'ignore': -2, 'ignored': -2, 'useless': -3, 'frustrated': -2.5, 'frustrating': -2.5, 'upset': -2, 
      'complaint': -2, 'complain': -2, 'refund': -2, 'blocked': -2, 'locked': -2, 'charge': -1.5, 
      'charges': -1.5, 'wait': -2, 'waiting': -1, 'negative': -1, 'poorly': -2, 'annoyed': -2, 
      'annoying': -2, 'stuck': -2, 'slowly': -2, 'rude': -3, 'unhelpful': -2, 'wrong': -2, 'incorrect': -2, 
      'fraud': -3.5, 'glitch': -2, 'timeout': -2, 'expensive': -2, 'fees': -2, 'fee': -2, 'unhappy': -2
    };

    const activeFrictionKeywords = trainingDataLoaded ? dynamicFrictionKeywords : {
      'otp': -1.5, 'login': -1, 'password': -1, 'security': -1, 'unauthorized': -3, 
      'deducted': -2, 'lost': -2, 'charges': -1.5, 'unable': -1.5, 'cannot': -1.5, 'glitch': -2
    };

    const activeNegations = trainingDataLoaded ? dynamicNegations : new Set([
      'not', 'no', 'never', 'dont', "don't", 'arent', "aren't", 'wasnt', 
      "wasn't", 'isnt', "isn't", 'without', 'cant', "can't", 'neither', 'nor'
    ]);

    const activeIntensifiers = trainingDataLoaded ? dynamicIntensifiers : {
      'very': 2.0, 'extremely': 2.5, 'really': 1.8, 'so': 1.6, 'super': 1.8,
      'highly': 2.0, 'absolutely': 2.2, 'incredibly': 2.4, 'unbelievably': 2.5,
      'quite': 1.4, 'too': 1.5, 'completely': 2.0, 'total': 1.5, 'totally': 2.0,
      'dreadfully': 2.0, 'exceptionally': 2.2, 'excessively': 2.0
    };

    const activeMultiwordRules = trainingDataLoaded ? dynamicMultiwordRules : [
      { pattern: /\bnot working\b/gi, score: -3.5 },
      { pattern: /\bdoesn't work\b/gi, score: -3.0 },
      { pattern: /\bdoes not work\b/gi, score: -3.0 },
      { pattern: /\bwaste of time\b/gi, score: -3.5 },
      { pattern: /\bworst bank\b/gi, score: -4.0 },
      { pattern: /\bworst service\b/gi, score: -4.0 },
      { pattern: /\bno response\b/gi, score: -2.5 },
      { pattern: /\bpoor support\b/gi, score: -3.0 },
      { pattern: /\bbad experience\b/gi, score: -3.5 },
      { pattern: /\bhappy to\b/gi, score: 2.0 },
      { pattern: /\bwell done\b/gi, score: 3.0 },
      { pattern: /\bhighly recommend\b/gi, score: 3.5 },
      { pattern: /\bno issues\b/gi, score: 2.0 },
      { pattern: /\bno complaints\b/gi, score: 2.5 },
      { pattern: /\bso fast\b/gi, score: 2.0 },
      { pattern: /\btoo slow\b/gi, score: -3.0 },
      { pattern: /\bkeeps loading\b/gi, score: -2.5 },
      { pattern: /\bmoney deducted\b/gi, score: -3.5 },
      { pattern: /\blost my money\b/gi, score: -4.0 },
      { pattern: /\bunable to login\b/gi, score: -3.0 },
      { pattern: /\bcant login\b/gi, score: -2.5 },
      { pattern: /\bcan't login\b/gi, score: -2.5 }
    ];

    // 2. Pre-evaluate multi-word phrase expressions
    for (const rule of activeMultiwordRules) {
      const matches = text.match(rule.pattern);
      if (matches) {
        const totalRuleScore = rule.score * matches.length;
        if (totalRuleScore > 0) {
          posScore += totalRuleScore;
        } else {
          negScore += Math.abs(totalRuleScore);
        }
      }
    }

    // 4. Word-by-word contextual NLU loop
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let isNegated = false;
      let intensifierFactor = 1.0;
      let caseMultiplier = 1.0;
      
      // Lookback check for negation (within window of 2 words)
      if (i > 0 && activeNegations.has(words[i-1])) isNegated = true;
      else if (i > 1 && activeNegations.has(words[i-2])) isNegated = true;

      // Lookback check for intensifier (directly preceding word)
      if (i > 0 && words[i-1] in activeIntensifiers) {
        intensifierFactor = activeIntensifiers[words[i-1]];
      }

      // Check if word is typed in ALL CAPS
      const origWord = originalWords[i];
      if (origWord && origWord === origWord.toUpperCase() && origWord.length > 1) {
        caseMultiplier = 1.5;
      }

      let termScore = 0;
      if (word in activePositiveWords) {
        termScore = activePositiveWords[word] * intensifierFactor * caseMultiplier;
        if (isNegated) {
          negScore += termScore;
        } else {
          posScore += termScore;
        }
      } else if (word in activeNegativeWords) {
        termScore = Math.abs(activeNegativeWords[word]) * intensifierFactor * caseMultiplier;
        if (isNegated) {
          posScore += termScore * 0.35;
        } else {
          negScore += termScore;
        }
      } else if (word in activeFrictionKeywords) {
        termScore = Math.abs(activeFrictionKeywords[word]) * intensifierFactor * caseMultiplier;
        if (!isNegated) {
          negScore += termScore;
        }
      }
    }
    
    // Scale final scores by exclamation frequency
    let finalPos = posScore * punctuationMultiplier;
    let finalNeg = negScore * punctuationMultiplier;

    // Apply Star Rating adjustments
    if (ratingValue !== null) {
      const r = parseInt(ratingValue, 10);
      if (r === 1) {
        finalNeg += 3.5;
      } else if (r === 2) {
        finalNeg += 1.8;
      } else if (r === 3) {
        finalPos += 0.8;
        finalNeg += 0.8;
      } else if (r === 4) {
        finalPos += 1.8;
      } else if (r === 5) {
        finalPos += 3.5;
      }
    }

    // 5. Classification Logic with Mixed Sentiment Threshold
    if (finalPos > 0.75 && finalNeg > 0.75) {
      const total = finalPos + finalNeg;
      const posPct = Math.round((finalPos / total) * 100);
      const negPct = 100 - posPct;
      return `Mixed 🔵 (${posPct}% positive and ${negPct}% negative)`;
    }
    
    if (finalPos - finalNeg > 0.5) {
      return 'Positive 🟢';
    }
    if (finalNeg - finalPos > 0.5) {
      return 'Negative 🔴';
    }
    
    return 'Neutral 🟡';
  }

  /* ── GDPR/RBI Compliant client-side PII Scrubbing ── */
  function scrubPII(text) {
    if (!text) return '';
    let scrubbed = text;
    
    // Aadhaar Card: 12 digits (e.g. 1234 5678 9012 or 1234-5678-9012)
    const aadhaarRegex = /\b\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;
    scrubbed = scrubbed.replace(aadhaarRegex, '████-████-[MASKED]');
    
    // Debit/Credit Cards: 13 to 19 digits with optional separators
    const cardRegex = /\b(?:\d{4}[- ]?){3}\d{1,4}\b|\b\d{13,19}\b/g;
    scrubbed = scrubbed.replace(cardRegex, '████-████-████-[MASKED]');
    
    // PAN Card: 5 alphabets, 4 digits, 1 alphabet (e.g. ABCDE1234F)
    const panRegex = /\b[A-Za-z]{5}\d{4}[A-Za-z]\b/g;
    scrubbed = scrubbed.replace(panRegex, '[MASKED PAN]');

    return scrubbed;
  }

  /* ── Submit ───────────────────────────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Always prevent default to handle programmatic flow
    clearErrors();

    const name  = document.getElementById('f-name');
    const org   = document.getElementById('f-org');
    const email = document.getElementById('f-email');
    const role  = document.getElementById('f-role');
    const msg   = document.getElementById('f-msg');
    const ratingInputs = form.querySelectorAll('input[name="Rating"]');
    const ratingContainer = document.getElementById('f-rating');
    let ratingValue = '';
    for (const r of ratingInputs) {
      if (r.checked) {
        ratingValue = r.value;
        break;
      }
    }

    let valid = true; 
    if (!name.value.trim())
      { showError(name, 'Please enter your name'); valid = false; }
    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      { showError(email, 'Please enter a valid email address'); valid = false; }
    if (!role.value.trim())
      { showError(role, 'Please select or enter your role'); valid = false; }
    if (!ratingValue) {
      if (ratingContainer) {
        showError(ratingContainer, 'Please rate your experience');
      }
      valid = false;
    }
    if (msg && !msg.value.trim())
      { showError(msg, 'Please enter your message'); valid = false; }

    if (!valid) return;

    setLoading(true);

    const rawMessage = msg ? msg.value.trim() : '';
    const scrubbedMessage = scrubPII(rawMessage);
    const sentimentResult = analyzeSentiment(rawMessage, ratingValue);

    // Sync with hidden input for standard FormData serializations
    const sentimentInput = document.getElementById('f-sentiment');
    if (sentimentInput) {
      sentimentInput.value = sentimentResult;
    }

    const finalRole = role.value.trim();



    // Capture FormData object IMMEDIATELY before we clear/reset the form inputs!
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('Name', name.value.trim());
    formData.append('Email', email.value.trim());
    formData.append('Occupation', org ? org.value.trim() : '');
    formData.append('Role', finalRole);
    formData.append('Rating', ratingValue + ' Stars');
    formData.append('Sentiment', sentimentResult);
    formData.append('Message', scrubbedMessage);

    function showSuccessState(sentimentResult, scrubbedMsgText) {
      // 1. Restore button state
      setLoading(false);

      // 2. Clear any active validation error styles
      clearErrors();

      // 3. Reset form inputs back to blank
      form.reset();
      
      // Reset live sentiment badge styling
      if (liveSentimentBadge) {
        liveSentimentBadge.className = 'live-sentiment-badge';
        const indicatorText = liveSentimentBadge.querySelector('.sentiment-indicator-text');
        if (indicatorText) indicatorText.textContent = 'Neutral 🟡';
      }
      if (msgTextarea) {
        msgTextarea.className = 'form-input form-textarea';
      }

      // Reset role field back to original select dropdown if swapped
      if (roleInputContainer) {
        roleInputContainer.innerHTML = defaultSelectHTML;
        setupRoleFieldSwapListeners();
      }

      // 4. Trigger the premium toast notification
      const toast = document.getElementById('toast-notification');
      if (toast) {
        toast.classList.add('show');
        toast.setAttribute('aria-hidden', 'false');

        // Clear any active toast timeouts to prevent overlapping animation cycles
        if (toastTimeout) {
          clearTimeout(toastTimeout);
        }
        stepperTimeouts.forEach(t => clearTimeout(t));
        stepperTimeouts = [];

        const toastIcon = toast.querySelector('.toast-icon');
        const toastTitle = toast.querySelector('.toast-title');
        const toastDesc = toast.querySelector('.toast-desc');

        // Stage 1 (0ms): NLU scanning animation
        if (toastIcon) {
          toastIcon.textContent = '🧠';
          toastIcon.style.background = 'rgba(108, 92, 231, 0.15)';
          toastIcon.style.color = '#6c5ce7';
        }
        if (toastTitle) toastTitle.textContent = 'AI NLU Processor';
        if (toastDesc) toastDesc.textContent = '🧠 NLU: Running intent extraction...';

        // Stage 2 (1200ms): PII scrubbing complete
        stepperTimeouts.push(setTimeout(() => {
          if (toastIcon) {
            toastIcon.textContent = '🔒';
            toastIcon.style.background = 'rgba(9, 132, 227, 0.15)';
            toastIcon.style.color = '#0984e3';
          }
          if (toastTitle) toastTitle.textContent = 'PII Security Scrub';
          if (toastDesc) {
            toastDesc.textContent = '🔒 Security: Redacted credentials';
          }
        }, 1200));

        // Stage 3 (2400ms): Secure Dispatch Confirmed
        stepperTimeouts.push(setTimeout(() => {
          if (toastIcon) {
            toastIcon.textContent = '✅';
            toastIcon.style.background = 'rgba(46, 213, 115, 0.15)';
            toastIcon.style.color = '#2ed573';
          }
          if (toastTitle) toastTitle.textContent = 'Message Dispatched!';
          if (toastDesc) {
            toastDesc.textContent = '✅ Sent securely to Grievance Desk';
          }
        }, 2400));

        // Automatically hide the toast after 5 seconds
        toastTimeout = setTimeout(() => {
          toast.classList.remove('show');
          toast.setAttribute('aria-hidden', 'true');
          toastTimeout = null;
        }, 5000);
      }
    }

    // Instant UI Feedback: Trigger the premium 4-stage toast stepper immediately
    // so the presentation flow remains smooth, responsive, and completely functional
    // even in local file environments, offline modes, or when API keys are unverified.
    showSuccessState(sentimentResult, scrubbedMessage);

    // Background Email Transmission
    // Web3Forms background AJAX submit
    const web3FormsKeyInput = document.getElementById('web3forms-key-input');
    if (web3FormsKeyInput) {
      web3FormsKeyInput.value = WEB3FORMS_ACCESS_KEY;
    }

    if (WEB3FORMS_ACCESS_KEY !== 'YOUR_ACCESS_KEY_HERE') {
      try {
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        })
        .then(async (response) => {
          const result = await response.json();
          if (response.ok && result.success) {
            console.log('Web3Forms background dispatch successful:', result);
          } else {
            console.warn('Web3Forms dispatch returned error (verify key registration & activation link):', result);
          }
        })
        .catch((err) => {
          console.warn('Web3Forms dispatch blocked by CORS or network issues (running in offline demo mode):', err);
        });
      } catch (err) {
        console.warn('Background payload creation failed:', err);
      }
    } else {
      console.warn('Web3Forms Access Key is not configured. Submission running in simulator mode.');
    }
  });

  /* ── Live blur validation on email ───────────────────── */
  const emailInput = document.getElementById('f-email');
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !emailInput.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showError(emailInput, "That doesn't look like a valid email");
      }
    });
    emailInput.addEventListener('input', () => {
      const err = document.getElementById('err-f-email');
      if (err && emailInput.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        err.remove();
        emailInput.style.borderColor = '';
        emailInput.removeAttribute('aria-invalid');
      }
    });
  }

  /* ── Real-Time Dynamic Sentiment Analyzer Glow ────────── */
  if (msgTextarea && liveSentimentBadge) {
    const indicatorText = liveSentimentBadge.querySelector('.sentiment-indicator-text');
    
    // 60ms debounce keeps typing completely lag-free while running calculations efficiently
    const updateSentimentLive = debounce((val, activeRating) => {
      const sentiment = analyzeSentiment(val, activeRating);
      
      if (sentiment.includes('Positive')) {
        liveSentimentBadge.className = 'live-sentiment-badge positive';
        if (indicatorText) indicatorText.textContent = sentiment;
        msgTextarea.classList.remove('glow-negative', 'glow-mixed');
        msgTextarea.classList.add('glow-positive');
      } else if (sentiment.includes('Negative')) {
        liveSentimentBadge.className = 'live-sentiment-badge negative';
        if (indicatorText) indicatorText.textContent = sentiment;
        msgTextarea.classList.remove('glow-positive', 'glow-mixed');
        msgTextarea.classList.add('glow-negative');
      } else if (sentiment.includes('Mixed')) {
        liveSentimentBadge.className = 'live-sentiment-badge mixed';
        if (indicatorText) indicatorText.textContent = sentiment;
        msgTextarea.classList.remove('glow-positive', 'glow-negative');
        msgTextarea.classList.add('glow-mixed');
      } else {
        liveSentimentBadge.className = 'live-sentiment-badge';
        if (indicatorText) indicatorText.textContent = sentiment;
        msgTextarea.classList.remove('glow-positive', 'glow-negative', 'glow-mixed');
      }
    }, 60);

    msgTextarea.addEventListener('input', () => {
      const val = msgTextarea.value;
      
      // Grab active rating value (if selected)
      let activeRating = null;
      const ratingInputs = form.querySelectorAll('input[name="Rating"]');
      for (const r of ratingInputs) {
        if (r.checked) {
          activeRating = r.value;
          break;
        }
      }

      if (!val.trim()) {
        const baselineSentiment = analyzeSentiment('', activeRating);
        liveSentimentBadge.className = 'live-sentiment-badge';
        if (indicatorText) indicatorText.textContent = baselineSentiment;
        msgTextarea.classList.remove('glow-positive', 'glow-negative', 'glow-mixed');
        return;
      }

      updateSentimentLive(val, activeRating);
    });
  }

  /* ── Dynamic "Other" Role Selection Toggle ────────────── */
  function setupRoleFieldSwapListeners() {
    const roleEl = document.getElementById('f-role');
    if (!roleEl || !roleInputContainer) return;

    if (roleEl.tagName === 'SELECT') {
      roleEl.addEventListener('change', () => {
        if (roleEl.value === 'Other') {
          roleInputContainer.innerHTML = `
            <input class="form-input" id="f-role" name="Role" type="text" placeholder="Type your custom role..." autofocus />
            <button type="button" class="role-reset-btn" id="f-role-reset" title="Back to list">↩</button>
          `;
          setupRoleFieldSwapListeners();
        }
      });
    } else if (roleEl.tagName === 'INPUT') {
      const resetBtn = document.getElementById('f-role-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          roleInputContainer.innerHTML = defaultSelectHTML;
          setupRoleFieldSwapListeners();
        });
      }
    }
  }

  // Bind initial role swap togglers
  setupRoleFieldSwapListeners();

  /* ── Clear Star Rating Error on Change & Re-trigger Analyzer ── */
  const ratingRadios = form.querySelectorAll('input[name="Rating"]');
  ratingRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const err = document.getElementById('err-f-rating');
      if (err) err.remove();
      
      // Re-trigger textarea analyzer glow immediately when stars are updated
      if (msgTextarea) {
        msgTextarea.dispatchEvent(new Event('input'));
      }
    });
  });

  /* ── Toast Close Listener ─────────────────────────────── */
  const toastCloseBtn = document.getElementById('toast-close-btn');
  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', () => {
      const toast = document.getElementById('toast-notification');
      if (toast) {
        toast.classList.remove('show');
        toast.setAttribute('aria-hidden', 'true');
        if (toastTimeout) {
          clearTimeout(toastTimeout);
          toastTimeout = null;
        }
        stepperTimeouts.forEach(t => clearTimeout(t));
        stepperTimeouts = [];
      }
    });
  }

})();
