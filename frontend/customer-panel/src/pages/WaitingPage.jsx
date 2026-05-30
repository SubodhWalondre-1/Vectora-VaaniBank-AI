/*
   VaaniBank AI — Waiting Page
   Customer waits here after language selection
   Staff must Accept before session begins
   Union Bank of India | Team Vectora
   */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { BRAND } from '../constants';
import { useCustomerApp } from '../context/AppContext';
import { getSession } from '../services/api';

// Multilingual strings (10 languages)
const I18N = {
  hi: {
    tokenLabel:   'TOKEN NUMBER',
    reviewMsg:    'Staff member is reviewing your request.\nPlease wait here…',
    maxWait:      'Max 2 min',
    connected:    'Connected! 🎉',
    connectedSub: 'Staff has accepted. Session is starting…',
    rejected:     'Request Rejected',
    rejectedSub:  'Staff member is currently unavailable.\nPlease try again after some time.',
    timeout:      'Wait Time Over',
    timeoutSub:   'The 2-minute wait period has ended.\nPlease scan the QR code again.',
    retry:        'Try Again',
  },
  mr: {
    tokenLabel:   'टोकन क्रमांक',
    reviewMsg:    'कर्मचारी सदस्य तुमची विनंती पाहत आहेत.\nकृपया येथे थांबा…',
    maxWait:      'जास्तीत जास्त 2 मिनिटे',
    connected:    'जोडले! 🎉',
    connectedSub: 'कर्मचाऱ्याने स्वीकारले. सत्र सुरू होत आहे…',
    rejected:     'विनंती नाकारली',
    rejectedSub:  'कर्मचारी सध्या उपलब्ध नाहीत.\nथोड्या वेळाने पुन्हा प्रयत्न करा.',
    timeout:      'प्रतीक्षा वेळ संपला',
    timeoutSub:   '2 मिनिटांचा प्रतीक्षा कालावधी संपला.\nकृपया QR पुन्हा स्कॅन करा.',
    retry:        'पुन्हा प्रयत्न करा',
  },
  ta: {
    tokenLabel:   'டோக்கன் எண்',
    reviewMsg:    'ஊழியர் உங்கள் கோரிக்கையை மதிப்பாய்வு செய்கிறார்.\nதயவுசெய்து இங்கே காத்திருங்கள்…',
    maxWait:      'அதிகபட்சம் 2 நிமிடம்',
    connected:    'இணைக்கப்பட்டது! 🎉',
    connectedSub: 'ஊழியர் ஏற்றுக்கொண்டார். அமர்வு தொடங்குகிறது…',
    rejected:     'கோரிக்கை நிராகரிக்கப்பட்டது',
    rejectedSub:  'ஊழியர் இப்போது கிடைக்கவில்லை.\nசிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.',
    timeout:      'காத்திருப்பு நேரம் முடிந்தது',
    timeoutSub:   '2 நிமிட காத்திருப்பு கடந்தது.\nதயவுசெய்து QR மீண்டும் ஸ்கேன் செய்யுங்கள்.',
    retry:        'மீண்டும் முயற்சிக்கவும்',
  },
  te: {
    tokenLabel:   'టోకెన్ నంబర్',
    reviewMsg:    'సిబ్బంది మీ అభ్యర్థనను సమీక్షిస్తున్నారు.\nదయచేసి ఇక్కడ వేచి ఉండండి…',
    maxWait:      'గరిష్టంగా 2 నిమిషాలు',
    connected:    'కనెక్ట్ అయింది! 🎉',
    connectedSub: 'సిబ్బంది అంగీకరించారు. సెషన్ ప్రారంభమవుతోంది…',
    rejected:     'అభ్యర్థన తిరస్కరించబడింది',
    rejectedSub:  'సిబ్బంది ప్రస్తుతం అందుబాటులో లేరు.\nకొంత సేపటి తర్వాత మళ్ళీ ప్రయత్నించండి.',
    timeout:      'వేచి ఉండే సమయం ముగిసింది',
    timeoutSub:   '2 నిమిషాల వేచి ఉండే వ్యవధి ముగిసింది.\nదయచేసి QR మళ్ళీ స్కాన్ చేయండి.',
    retry:        'మళ్ళీ ప్రయత్నించండి',
  },
  bn: {
    tokenLabel:   'টোকেন নম্বর',
    reviewMsg:    'কর্মী সদস্য আপনার অনুরোধ পর্যালোচনা করছেন।\nঅনুগ্রহ করে এখানে অপেক্ষা করুন…',
    maxWait:      'সর্বোচ্চ ২ মিনিট',
    connected:    'সংযুক্ত! 🎉',
    connectedSub: 'কর্মী গ্রহণ করেছেন। সেশন শুরু হচ্ছে…',
    rejected:     'অনুরোধ প্রত্যাখ্যাত',
    rejectedSub:  'কর্মী এখন উপলব্ধ নেই।\nকিছুক্ষণ পরে আবার চেষ্টা করুন।',
    timeout:      'অপেক্ষার সময় শেষ',
    timeoutSub:   '২ মিনিটের অপেক্ষার সময় শেষ হয়েছে।\nঅনুগ্রহ করে আবার QR স্ক্যান করুন।',
    retry:        'আবার চেষ্টা করুন',
  },
  kn: {
    tokenLabel:   'ಟೋಕನ್ ಸಂಖ್ಯೆ',
    reviewMsg:    'ಸಿಬ್ಬಂದಿ ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ.\nದಯವಿಟ್ಟು ಇಲ್ಲಿ ನಿರೀಕ್ಷಿಸಿ…',
    maxWait:      'ಗರಿಷ್ಠ 2 ನಿಮಿಷ',
    connected:    'ಸಂಪರ್ಕಗೊಂಡಿದೆ! 🎉',
    connectedSub: 'ಸಿಬ್ಬಂದಿ ಒಪ್ಪಿಕೊಂಡಿದ್ದಾರೆ. ಅಧಿವೇಶನ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ…',
    rejected:     'ವಿನಂತಿ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
    rejectedSub:  'ಸಿಬ್ಬಂದಿ ಈಗ ಲಭ್ಯವಿಲ್ಲ.\nಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    timeout:      'ನಿರೀಕ್ಷಣೆ ಸಮಯ ಮುಗಿದಿದೆ',
    timeoutSub:   '2 ನಿಮಿಷದ ನಿರೀಕ್ಷಣೆ ಅವಧಿ ಮುಗಿದಿದೆ.\nದಯವಿಟ್ಟು QR ಮತ್ತೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.',
    retry:        'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
  },
  or: {
    tokenLabel:   'ଟୋକେନ ନମ୍ବର',
    reviewMsg:    'କର୍ମଚାରୀ ଆପଣଙ୍କ ଅନୁରୋଧ ଯାଞ୍ଚ କରୁଛନ୍ତି।\nଦୟାକରି ଏଠାରେ ଅପେକ୍ଷା କରନ୍ତୁ…',
    maxWait:      'ସର୍ବାଧିକ ୨ ମିନିଟ',
    connected:    'ସଂଯୁକ୍ତ! 🎉',
    connectedSub: 'କର୍ମଚାରୀ ଗ୍ରହଣ କଲେ। ସତ୍ର ଆରମ୍ଭ ହେଉଛି…',
    rejected:     'ଅନୁରୋଧ ପ୍ରତ୍ୟାଖ୍ୟାତ',
    rejectedSub:  'କର୍ମଚାରୀ ବର୍ତ୍ତମାନ ଉପଲବ୍ଧ ନୁହଁନ୍ତି।\nଟିକେ ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    timeout:      'ଅପେକ୍ଷା ସମୟ ଶେଷ',
    timeoutSub:   '୨ ମିନିଟ ଅପେକ୍ଷା ସମୟ ଶେଷ ହୋଇଛି।\nଦୟାକରି QR ପୁଣି ସ୍କାନ କରନ୍ତୁ।',
    retry:        'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ',
  },
  pa: {
    tokenLabel:   'ਟੋਕਨ ਨੰਬਰ',
    reviewMsg:    'ਸਟਾਫ਼ ਮੈਂਬਰ ਤੁਹਾਡੀ ਬੇਨਤੀ ਦੀ ਸਮੀਖਿਆ ਕਰ ਰਿਹਾ ਹੈ।\nਕਿਰਪਾ ਕਰਕੇ ਇੱਥੇ ਉਡੀਕ ਕਰੋ…',
    maxWait:      'ਵੱਧ ਤੋਂ ਵੱਧ 2 ਮਿੰਟ',
    connected:    'ਜੁੜ ਗਿਆ! 🎉',
    connectedSub: 'ਸਟਾਫ਼ ਨੇ ਸਵੀਕਾਰ ਕਰ ਲਿਆ। ਸੈਸ਼ਨ ਸ਼ੁਰੂ ਹੋ ਰਿਹਾ ਹੈ…',
    rejected:     'ਬੇਨਤੀ ਰੱਦ ਕੀਤੀ ਗਈ',
    rejectedSub:  'ਸਟਾਫ਼ ਹੁਣ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।\nਥੋੜੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    timeout:      'ਉਡੀਕ ਦਾ ਸਮਾਂ ਖਤਮ',
    timeoutSub:   '2 ਮਿੰਟ ਦਾ ਉਡੀਕ ਸਮਾਂ ਖਤਮ ਹੋ ਗਿਆ।\nਕਿਰਪਾ ਕਰਕੇ QR ਦੁਬਾਰਾ ਸਕੈਨ ਕਰੋ।',
    retry:        'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
  },
  gu: {
    tokenLabel:   'ટોકન નંબર',
    reviewMsg:    'સ્ટાફ સભ્ય તમારી વિનંતી સમીક્ષા કરી રહ્યા છે.\nમહેરબાની કરીને અહીં રાહ જુઓ…',
    maxWait:      'મહત્તમ 2 મિનિટ',
    connected:    'કનેક્ટ થઈ ગયું! 🎉',
    connectedSub: 'સ્ટાફે સ્વીકાર્યું. સત્ર શરૂ થઈ રહ્યું છે…',
    rejected:     'વિનંતી નકારી',
    rejectedSub:  'સ્ટાફ હાલ ઉપલબ્ધ નથી.\nથોડા સમય પછી ફરી પ્રયાસ કરો.',
    timeout:      'રાહ જોવાનો સમય પૂરો',
    timeoutSub:   '2 મિનિટનો રાહ જોવાનો સમય પૂરો થઈ ગયો.\nમહેરબાની કરીને QR ફરી સ્કૅન કરો.',
    retry:        'ફરી પ્રયાસ કરો',
  },
  ml: {
    tokenLabel:   'ടോക്കൺ നമ്പർ',
    reviewMsg:    'ജീവനക്കാരൻ നിങ്ങളുടെ അഭ്യർത്ഥന അവലോകനം ചെയ്യുന്നു.\nദയവായി ഇവിടെ കാത്തിരിക്കൂ…',
    maxWait:      'പരമാവധി 2 മിനിറ്റ്',
    connected:    'കണക്‌റ്റ് ആയി! 🎉',
    connectedSub: 'ജീവനക്കാരൻ അംഗീകരിച്ചു. സെഷൻ ആരംഭിക്കുന്നു…',
    rejected:     'അഭ്യർത്ഥന നിരസിച്ചു',
    rejectedSub:  'ജീവനക്കാരൻ ഇപ്പോൾ ലഭ്യമല്ല.\nകുറച്ച് സമയം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കൂ.',
    timeout:      'കാത്തിരിപ്പ് സമയം കഴിഞ്ഞു',
    timeoutSub:   '2 മിനിറ്റ് കാത്തിരിപ്പ് കഴിഞ്ഞു.\nദയവായി QR വീണ്ടും സ്‌കാൻ ചെയ്യൂ.',
    retry:        'വീണ്ടും ശ്രമിക്കൂ',
  },
};

const getT = (code) => I18N[code] || I18N.hi;

// Config
const WAIT_TIMEOUT_MS  = 2 * 60 * 1000;
const POLL_INTERVAL_MS = 2500;

const keyframes = `@keyframes loader-spin { to { transform: rotate(360deg); } }`;

export default function WaitingPage() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const customerLanguage = useCustomerApp((s) => s.customerLanguage);
  const langCode         = useCustomerApp((s) => s.customerLanguageCode);
  const t                = getT(langCode);

  const [remainingMs, setRemainingMs] = useState(WAIT_TIMEOUT_MS);
  const [status, setStatus]           = useState('waiting');

  const startTimeRef = useRef(Date.now());
  const pollRef      = useRef(null);
  const timerRef     = useRef(null);
  const hasNavigated = useRef(false);

  const stopAll = useCallback(() => {
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (hasNavigated.current) return;
    if (status === 'accepted') {
      hasNavigated.current = true;
      stopAll();
      setTimeout(() => navigate(`/session/${token}`), 900);
    } else if (status === 'rejected') {
      hasNavigated.current = true;
      stopAll();
      setTimeout(() => navigate('/'), 2500);
    } else if (status === 'timeout') {
      hasNavigated.current = true;
      stopAll();
      setTimeout(() => navigate('/'), 2500);
    }
  }, [status, navigate, token, stopAll]);

  useEffect(() => {
    if (!token) return;
    const check = async () => {
      try {
        const session = await getSession(token);
        const s = session?.status;
        if (s === 'active')                        setStatus('accepted');
        else if (s === 'rejected' || s === 'abandoned') setStatus('rejected');
      } catch { /* keep polling */ }
    };
    check();
    pollRef.current = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [token]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, WAIT_TIMEOUT_MS - (Date.now() - startTimeRef.current));
      setRemainingMs(remaining);
      if (remaining <= 0) setStatus((p) => p === 'waiting' ? 'timeout' : p);
    }, 500);
    return () => clearInterval(timerRef.current);
  }, []);

  const totalSec         = Math.ceil(remainingMs / 1000);
  const mm               = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const ss               = (totalSec % 60).toString().padStart(2, '0');
  const progress         = remainingMs / WAIT_TIMEOUT_MS;
  const R                = 52;
  const circumference    = 2 * Math.PI * R;
  const strokeDashoffset = circumference * (1 - progress);
  const isTerminal       = status !== 'waiting';

  return (
    <div style={S.page}>
      <style>{keyframes}</style>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, type: 'spring', stiffness: 260, damping: 22 }}
        style={S.card}
      >
        {/* Logo */}
        <img src="/website_logo.png" alt="VaaniBank AI" style={S.logo} />

        {/* Token badge */}
        <div style={S.tokenBadge}>
          <span style={S.tokenLabel}>{t.tokenLabel}</span>
          <span style={S.tokenValue}>{token || '—'}</span>
        </div>

        {/* Visual */}
        <div style={S.visualWrap}>
          <AnimatePresence mode="wait">
            {status === 'waiting' && (
              <motion.div key="ring"
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }} style={S.ringWrap}>
                <svg width={128} height={128} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={64} cy={64} r={R} fill="none" stroke="var(--card-border)" strokeWidth={6} />
                  <circle cx={64} cy={64} r={R} fill="none"
                    stroke={progress > 0.33 ? BRAND.blue : BRAND.red}
                    strokeWidth={6} strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease' }} />
                </svg>
                <div style={S.ringCenter}>
                  <span style={S.timeText}>{mm}:{ss}</span>
                </div>
              </motion.div>
            )}

            {status === 'accepted' && (
              <motion.div key="ok"
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                style={{ ...S.statusIcon, background: 'rgba(22,163,74,0.12)' }}>
                <CheckCircle size={58} color="#16A34A" />
              </motion.div>
            )}

            {(status === 'rejected' || status === 'timeout') && (
              <motion.div key="no"
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                style={{ ...S.statusIcon, background: 'rgba(220,38,38,0.1)' }}>
                <XCircle size={58} color="#DC2626" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {status === 'waiting' && (
            <motion.div key="m-wait"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={S.msgBox}>
              <p style={S.msgSub}>{t.reviewMsg}</p>
              <div style={S.dotsRow}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} style={S.dot}
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 0.65, delay: i * 0.18, repeat: Infinity }} />
                ))}
              </div>
            </motion.div>
          )}

          {status === 'accepted' && (
            <motion.div key="m-ok"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={S.msgBox}>
              <p style={{ ...S.msgTitle, color: '#16A34A' }}>{t.connected}</p>
              <p style={S.msgSub}>{t.connectedSub}</p>
            </motion.div>
          )}

          {status === 'rejected' && (
            <motion.div key="m-no"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={S.msgBox}>
              <p style={{ ...S.msgTitle, color: '#DC2626' }}>{t.rejected}</p>
              <p style={S.msgSub}>{t.rejectedSub}</p>
            </motion.div>
          )}

          {status === 'timeout' && (
            <motion.div key="m-time"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={S.msgBox}>
              <p style={{ ...S.msgTitle, color: '#D97706' }}>{t.timeout}</p>
              <p style={S.msgSub}>{t.timeoutSub}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info chips */}
        {status === 'waiting' && (
          <div style={S.chips}>
            {customerLanguage && <span style={S.chip}>🌐 {customerLanguage}</span>}
            <span style={S.chip}>
              <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {t.maxWait}
            </span>
          </div>
        )}

        {/* Retry button */}
        {isTerminal && status !== 'accepted' && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            onClick={() => navigate('/')}
            style={S.retryBtn}
          >
            {t.retry}
          </motion.button>
        )}

        {/* Footer */}
        <div style={S.footer}>
          <div style={S.divider} />
          <p style={S.footerText}>Union Bank of India | RBI Compliant</p>
          <p style={{ ...S.footerText, opacity: 0.5, fontSize: 10, marginTop: 3 }}>
            वाणी जो हर भाषा जाने
          </p>
        </div>
      </motion.div>
    </div>
  );
}

const S = {
  page: {
    width: '100%', height: '100dvh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'var(--body-bg)', padding: '20px 16px',
  },
  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: 24,
    boxShadow: '0 8px 40px rgba(0,48,135,0.1), 0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '28px 24px 24px', overflow: 'hidden',
  },
  logo: { height: 68, width: 'auto', objectFit: 'contain', marginBottom: 16 },
  tokenBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    marginBottom: 20, padding: '10px 28px', borderRadius: 14,
    backgroundColor: `${BRAND.blue}0d`, border: `1.5px solid ${BRAND.blue}22`,
  },
  tokenLabel: {
    fontSize: 10, fontWeight: 600, letterSpacing: 1.2,
    textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2,
  },
  tokenValue: {
    fontSize: 26, fontWeight: 800, color: BRAND.blue,
    fontFamily: "'Inter', monospace", letterSpacing: -0.5,
  },
  visualWrap: {
    width: 128, height: 128,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, position: 'relative',
  },
  ringWrap: {
    position: 'relative', width: 128, height: 128,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  },
  timeText: {
    fontSize: 22, fontWeight: 800, color: 'var(--text-primary)',
    fontFamily: "'Inter', monospace", letterSpacing: -1,
  },
  statusIcon: {
    width: 104, height: 104, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  msgBox: { textAlign: 'center', marginBottom: 16, padding: '0 8px' },
  msgTitle: {
    fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
    margin: '0 0 6px 0', lineHeight: 1.3,
  },
  msgSub: {
    fontSize: 13, color: 'var(--text-secondary)',
    margin: '0 0 10px 0', lineHeight: 1.7, whiteSpace: 'pre-line',
  },
  dotsRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: '50%', backgroundColor: BRAND.blue },
  chips: {
    display: 'flex', gap: 8, marginBottom: 16,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  chip: {
    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
    backgroundColor: 'rgba(0,0,0,0.05)', padding: '4px 10px',
    borderRadius: 8, display: 'flex', alignItems: 'center',
  },
  retryBtn: {
    marginBottom: 16, padding: '13px 32px', borderRadius: 12,
    backgroundColor: BRAND.red, color: '#fff', fontWeight: 700,
    fontSize: 14, border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(232,35,26,0.25)',
  },
  footer: { textAlign: 'center', marginTop: 4, width: '100%' },
  divider: {
    width: 48, height: 2, borderRadius: 1,
    backgroundColor: 'var(--divider)', margin: '0 auto 10px',
  },
  footerText: {
    fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', margin: 0, letterSpacing: 0.3,
  },
};
