/* =====================================================
   VaaniBank AI — SpeechBubbleRobot Component
   Union Bank of India | Team Vectora

   Friendly AI robot surrounded by floating organic
   speech bubbles. Stats in blue, urgency in red,
   language tags in white/outline. No background added.
   ===================================================== */

import { motion } from 'framer-motion';
import { BRAND } from '../constants';

// ── Bubble Data ──────────────────────────────────────
// type: 'blue' | 'red' | 'outline'
// x, y: offset from center (px)
// floatY: vertical float amplitude
// floatDuration: seconds for one float cycle
const BUBBLES = [
  // ── Blue solid — major stats ──
  {
    id: 1, text: '21+\nLanguages', type: 'blue',
    x: -152, y: -48,
    tailX: 18, tailY: '100%', tailAnchor: 'bottom-right',
    floatY: 9,  floatDuration: 3.4, delay: 0.0,
    pad: '8px 14px', radius: '18px 18px 4px 18px', fontSize: 13, fontWeight: 700,
  },
  {
    id: 2, text: '10Cr+\nUsers', type: 'blue',
    x: 102, y: -80,
    tailX: 'calc(100% - 18px)', tailY: '100%', tailAnchor: 'bottom-left',
    floatY: 7,  floatDuration: 2.9, delay: 0.5,
    pad: '8px 14px', radius: '18px 18px 18px 4px', fontSize: 13, fontWeight: 700,
  },
  {
    id: 3, text: 'RBI\nCompliant', type: 'blue',
    x: -140, y: 72,
    tailX: 18, tailY: 0, tailAnchor: 'top-right',
    floatY: 11, floatDuration: 3.8, delay: 1.1,
    pad: '7px 12px', radius: '18px 18px 18px 4px', fontSize: 12, fontWeight: 600,
  },

  // ── Red — urgency / speed ──
  {
    id: 4, text: '<300ms\nResponse', type: 'red',
    x: 110, y: 62,
    tailX: 'calc(100% - 18px)', tailY: 0, tailAnchor: 'top-left',
    floatY: 8,  floatDuration: 2.6, delay: 0.3,
    pad: '7px 12px', radius: '18px 4px 18px 18px', fontSize: 12, fontWeight: 600,
  },
  {
    id: 5, text: '24/7\nAI Support', type: 'red',
    x: 22, y: -148,
    tailX: '50%', tailY: '100%', tailAnchor: 'bottom-center',
    floatY: 13, floatDuration: 4.1, delay: 0.8,
    pad: '6px 12px', radius: '14px', fontSize: 11, fontWeight: 600,
  },

  // ── Outline — language tags ──
  {
    id: 6,  text: 'हिंदी',   type: 'outline',
    x: -82,  y: -152, tailX: 14, tailY: '100%', tailAnchor: 'bottom-right',
    floatY: 14, floatDuration: 3.2, delay: 0.2,
    pad: '5px 10px', radius: '10px 10px 2px 10px', fontSize: 12, fontWeight: 600,
  },
  {
    id: 7,  text: 'தமிழ்', type: 'outline',
    x: 90,  y: -152, tailX: 'calc(100% - 14px)', tailY: '100%', tailAnchor: 'bottom-left',
    floatY: 11, floatDuration: 2.8, delay: 0.7,
    pad: '5px 10px', radius: '10px 10px 10px 2px', fontSize: 12, fontWeight: 600,
  },
  {
    id: 8,  text: 'বাংলা',  type: 'outline',
    x: -174, y: 4, tailX: '100%', tailY: 14, tailAnchor: 'right-center',
    floatY: 8,  floatDuration: 3.0, delay: 1.3,
    pad: '5px 10px', radius: '10px 2px 10px 10px', fontSize: 11, fontWeight: 600,
  },
  {
    id: 9,  text: 'मराठी', type: 'outline',
    x: 160,  y: -4, tailX: 0, tailY: 14, tailAnchor: 'left-center',
    floatY: 9,  floatDuration: 2.7, delay: 0.4,
    pad: '5px 10px', radius: '2px 10px 10px 10px', fontSize: 11, fontWeight: 600,
  },
  {
    id: 10, text: 'ਪੰਜਾਬੀ', type: 'outline',
    x: -62,  y: 142, tailX: 14, tailY: 0, tailAnchor: 'top-right',
    floatY: 12, floatDuration: 3.6, delay: 1.0,
    pad: '5px 10px', radius: '10px 10px 10px 2px', fontSize: 11, fontWeight: 600,
  },
  {
    id: 11, text: 'ગુજરાતી', type: 'outline',
    x: 78,  y: 132, tailX: 'calc(100% - 14px)', tailY: 0, tailAnchor: 'top-left',
    floatY: 10, floatDuration: 3.4, delay: 0.6,
    pad: '5px 10px', radius: '10px 10px 2px 10px', fontSize: 11, fontWeight: 600,
  },
];

// ── Style lookup ─────────────────────────────────────
const STYLE = {
  blue: {
    bg: BRAND.blue,
    color: '#fff',
    border: 'none',
    shadow: '0 4px 18px rgba(0,48,135,0.38)',
  },
  red: {
    bg: BRAND.red,
    color: '#fff',
    border: 'none',
    shadow: '0 4px 18px rgba(232,35,26,0.38)',
  },
  outline: {
    bg: 'rgba(255,255,255,0.96)',
    color: BRAND.blue,
    border: `1.5px solid ${BRAND.blue}`,
    shadow: '0 2px 12px rgba(0,48,135,0.18)',
  },
};

// ── Bubble component ─────────────────────────────────
function Bubble({ b, scale = 1 }) {
  const s = STYLE[b.type];
  return (
    <motion.div
      key={b.id}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -b.floatY * scale, 0],
      }}
      transition={{
        opacity:  { delay: b.delay * 0.4, duration: 0.35 },
        scale:    { delay: b.delay * 0.4, duration: 0.4, type: 'spring', stiffness: 320, damping: 20 },
        y: {
          delay: b.delay,
          duration: b.floatDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      style={{
        position: 'absolute',
        left: `calc(50% + ${b.x * scale}px)`,
        top:  `calc(50% + ${b.y * scale}px)`,
        transform: 'translate(-50%, -50%)',
        backgroundColor: s.bg,
        color: s.color,
        border: s.border || 'none',
        boxShadow: s.shadow,
        borderRadius: b.radius,
        padding: b.pad,
        fontSize: b.fontSize * scale,
        fontWeight: b.fontWeight,
        lineHeight: 1.3,
        whiteSpace: 'pre-line',
        textAlign: 'center',
        zIndex: 10,
        userSelect: 'none',
        pointerEvents: 'none',
        fontFamily: "'Inter', system-ui, sans-serif",
        letterSpacing: 0.3,
        backdropFilter: b.type === 'outline' ? 'blur(4px)' : 'none',
      }}
    />
  );
}

// ── Robot SVG ────────────────────────────────────────
function RobotSVG({ size }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.42)}
      viewBox="0 0 120 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Antenna ── */}
      <line x1="60" y1="15" x2="60" y2="4"
        stroke={BRAND.blue} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="60" cy="3" r="4.5" fill={BRAND.red} />
      <circle cx="60" cy="3" r="2" fill="#fff" opacity="0.6" />

      {/* ── Head shell ── */}
      <rect x="24" y="15" width="72" height="54" rx="16" fill={BRAND.blue} />
      {/* inner screen tint */}
      <rect x="28" y="19" width="64" height="46" rx="13"
        fill={BRAND.blueMid || '#1a4db5'} opacity="0.45" />

      {/* ── Eyes ── */}
      <circle cx="44" cy="37" r="10" fill="#fff" />
      <circle cx="76" cy="37" r="10" fill="#fff" />
      <circle cx="44" cy="37" r="5.5" fill={BRAND.blue} />
      <circle cx="76" cy="37" r="5.5" fill={BRAND.blue} />
      {/* pupil shine */}
      <circle cx="47" cy="34" r="2.2" fill="#fff" />
      <circle cx="79" cy="34" r="2.2" fill="#fff" />

      {/* ── Mouth display strip ── */}
      <rect x="34" y="52" width="52" height="11" rx="5.5"
        fill={BRAND.blueDark || '#001a52'} />
      {/* voice equaliser bars */}
      <rect x="39" y="55" width="4" height="5" rx="1.5" fill={BRAND.red}   opacity="0.9" />
      <rect x="46" y="53" width="4" height="7" rx="1.5" fill="#fff"        opacity="0.75" />
      <rect x="53" y="54" width="4" height="6" rx="1.5" fill={BRAND.red}   opacity="0.9" />
      <rect x="60" y="52" width="4" height="8" rx="1.5" fill="#fff"        opacity="0.75" />
      <rect x="67" y="54" width="4" height="6" rx="1.5" fill={BRAND.red}   opacity="0.9" />
      <rect x="74" y="55" width="4" height="5" rx="1.5" fill="#fff"        opacity="0.75" />

      {/* ── Neck ── */}
      <rect x="52" y="69" width="16" height="9" rx="4.5" fill={BRAND.blue} />

      {/* ── Body ── */}
      <rect x="16" y="78" width="88" height="60" rx="20" fill={BRAND.blue} />
      <rect x="20" y="82" width="80" height="52" rx="17"
        fill={BRAND.blueMid || '#1a4db5'} opacity="0.35" />

      {/* chest panel */}
      <rect x="28" y="88" width="64" height="38" rx="11"
        fill={BRAND.blueDark || '#001a52'} />

      {/* ── Mic icon in chest (VaaniBank identity) ── */}
      <circle cx="60" cy="105" r="13" fill={BRAND.blue} />
      <rect x="55.5" y="97" width="9" height="13" rx="4.5" fill="#fff" />
      <path d="M51 106 Q51 114 60 114 Q69 114 69 106"
        stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <line x1="60" y1="114" x2="60" y2="118"
        stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="55.5" y1="118" x2="64.5" y2="118"
        stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />

      {/* status LEDs */}
      <circle cx="35" cy="94" r="3.5" fill={BRAND.red} />
      <circle cx="85" cy="94" r="3.5" fill="#4ade80" />

      {/* ── Arms ── */}
      <rect x="0"   y="82" width="14" height="42" rx="7" fill={BRAND.blue} />
      <rect x="106" y="82" width="14" height="42" rx="7" fill={BRAND.blue} />
      {/* fists */}
      <ellipse cx="7"   cy="127" rx="8" ry="7" fill={BRAND.red} />
      <ellipse cx="113" cy="127" rx="8" ry="7" fill={BRAND.red} />

      {/* ── Legs ── */}
      <rect x="30" y="138" width="22" height="26" rx="11" fill={BRAND.blue} />
      <rect x="68" y="138" width="22" height="26" rx="11" fill={BRAND.blue} />

      {/* ── Feet ── */}
      <rect x="26" y="157" width="30" height="11" rx="5.5"
        fill={BRAND.blueDark || '#001a52'} />
      <rect x="64" y="157" width="30" height="11" rx="5.5"
        fill={BRAND.blueDark || '#001a52'} />
    </svg>
  );
}

// ── Main Export ──────────────────────────────────────
export default function SpeechBubbleRobot({ isMobile = false }) {
  // Scale down everything on mobile
  const scale      = isMobile ? 0.72 : 1;
  const robotSize  = isMobile ? 86 : 118;
  const wrapHeight = isMobile ? 230 : 320;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: wrapHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',       // bubbles can bleed outside
        pointerEvents: 'none',     // don't block scroll
      }}
    >
      {/* ── Subtle glow ring behind robot (blue, no bg) ── */}
      <div
        style={{
          position: 'absolute',
          width: robotSize * 1.6,
          height: robotSize * 1.6,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.blue}14 0%, ${BRAND.blue}04 55%, transparent 75%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Speech Bubbles ── */}
      {BUBBLES.map((b) => (
        <Bubble key={b.id} b={b} scale={scale} />
      ))}

      {/* ── Robot ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
        style={{ position: 'relative', zIndex: 20 }}
      >
        <RobotSVG size={robotSize} />
      </motion.div>
    </div>
  );
}
