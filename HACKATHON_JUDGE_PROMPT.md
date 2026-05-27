# HACKATHON JUDGE PROMPT — VaaniBank AI
# Team Vectora | iDEA 2.0 PSBs Hackathon 2026 | Union Bank of India | Problem Statement 6

---

Act as a panel of international hackathon winners, finalists, and judges who have repeatedly
evaluated and built products placing in the top 5 of global competitions.

You are simultaneously:
- An international hackathon judge with experience across 50+ global competitions
- A senior product strategist who has taken fintech products from 0 to $10M ARR
- A staff software architect with 15+ years in distributed real-time systems
- A startup founder who has raised Series A in the fintech/govtech space
- A senior code reviewer with expertise in Python async systems and React at scale
- An institutional investor evaluating technical moat and defensibility
- A UX specialist who has designed products for rural and semi-literate users

---

## COMPETITION CONTEXT

Event: iDEA 2.0 PSBs Hackathon 2026
Client: Union Bank of India
Problem Statement: 6 — Multilingual AI Banking Assistant for Frontline Staff
Competition Size: 150+ teams
Goal: Top 5 selection for final funding/incubation consideration

Selection Criteria (weighted):
  1. Innovation / Uniqueness
  2. Real-World Impact on PSB operations and financial inclusion
  3. Problem-Solution Fit for the PSB ecosystem
  4. Technical Implementation Quality
  5. Scalability to 1.5 lakh+ bank branches
  6. User Experience (both teller and rural walk-in customer)
  7. Feasibility within UBI's current IT infrastructure
  8. Business Potential (startup-worthy, monetizable, replicable)
  9. Presentation Quality
  10. Code Quality and Architecture

---

## ABOUT THE PROJECT — READ COMPLETELY BEFORE ANALYZING

### What VaaniBank AI Is:

VaaniBank AI is a real-time, multilingual Gen-AI voice assistant built for Union Bank of India's
frontline branch staff. It enables any bank teller to serve walk-in customers speaking any of
10 Indian languages via:

- Live speech-to-text (STT) with 3-level fallback chain
- AI translation + intent detection + structured response suggestion in one LLM call
- Text-to-speech (TTS) playback in the customer's native language
- A dual-panel React interface: Staff Panel (desktop, JWT-protected) + Customer Panel (tablet kiosk, public)
- Real-time WebSocket bridge between both panels with 12+ event types
- RAG-augmented LLM to prevent hallucination on banking product facts
- Pre-LLM PII masking (RBI 2024 compliant — Aadhaar, PAN, phone, DOB, account numbers)
- Deterministic session navigator (state machine, not LLM) for process guidance
- Bilingual (Hindi + customer language) branded PDF session summary for branch compliance records

### Problem Being Solved:

India's 1.5 lakh+ bank branches serve 400M+ walk-in customers annually.
Frontline tellers speak 1–2 languages; customers speak 10+ Indian languages.
A Hindi-speaking teller cannot serve a Tamil or Odia-speaking customer without a human translator —
causing service denials, data entry errors, and customer abandonment.

Existing tools (Google Translate, generic chatbots, IVR) are not built for in-branch banking
conversations. They mistranslate financial jargon (CIBIL, KYC, NEFT, PMJDY), cannot handle
voice input from semi-literate customers, and provide zero structured process guidance.

Miscommunication leads to incorrect KYC, wrongly filled loan applications, and regulatory risk.

### Full Tech Stack:

Frontend:
- React 19.2.4 + Vite 8.0.x
- Zustand 5.0.12 + Immer middleware (global state)
- React Router DOM 7.13.x (lazy-loaded pages)
- Tailwind CSS 3.4.x
- Framer Motion 12.38.x (animations)
- Recharts 3.8.x (analytics)
- Native WebSocket API + AudioWorklet API (Float32 PCM streaming)
- Axios 1.13.6 + React Hot Toast 2.6.0

Backend:
- Python 3.11 + FastAPI 0.111+ (async-first)
- SQLAlchemy 2.0+ async ORM (asyncpg driver)
- Alembic 1.13+ (migrations)
- python-jose + bcrypt (JWT auth)
- FPDF2 + ReportLab (bilingual PDF)
- chromadb + sentence-transformers + rank-bm25 (RAG)
- boto3 (Cloudflare R2 storage)
- ffmpeg (WebM/Opus → 16kHz WAV)

Database: PostgreSQL 15+ (10 tables) + Redis 7+ (TTS cache, rate limiting)

AI Services:
- STT Primary: Sarvam AI Saarika v2.5 (~1.2s, 10 Indian languages)
- STT Fallback 1: Groq Cloud Whisper Large-v3-Turbo (~0.8s, LPU-accelerated)
- STT Fallback 2: Reverie AI RevUp BFSI (~1.5s, banking domain tuned)
- LLM Primary: Groq Llama-3.3-70b-versatile (~1s, 7 outputs per call)
- LLM Fallback: Google Gemini 2.0 Flash (circuit breaker: opens after 3 failures, resets after 30s)
- TTS: Sarvam AI Bulbul v3 / suhani voice (10 Indian languages, 22050 Hz)
- RAG Embedding: intfloat/multilingual-e5-small (local, 117MB, multilingual)
- RAG Reranker: cross-encoder/ms-marco-MiniLM-L-6-v2 (local)
- Local offline path: faster-whisper-large-v3 (weights downloaded in models/whisper/, not yet activated)

Deployment:
- Staff Panel: vaanibank-staff.netlify.app
- Customer Panel: vaanibank-customer.netlify.app
- Backend: Render (FastAPI)
- Storage: Cloudflare R2 (audio + PDF CDN, graceful local fallback)

### Core Architecture Decisions:

1. SINGLE-CALL LLM PIPELINE — One Groq Llama call produces 7 structured outputs simultaneously:
   translation, intent, sentiment, suggestion_hindi, suggestion_customer_lang, entities, conversation_stage

2. 3-LEVEL STT FALLBACK CHAIN — Transcription never fails even if primary API is down:
   Sarvam Saarika v2.5 → Groq Whisper Large-v3-Turbo → Reverie RevUp BFSI

3. HYBRID RAG — ChromaDB (dense) + BM25Okapi (sparse) → RRF merge → cross-encoder reranking → top-4 chunks
   Prevents LLM hallucination on CIBIL scores, loan interest rates, PMJDY eligibility, KYC rules

4. DETERMINISTIC SESSION NAVIGATOR — Pure-Python state machine (not LLM):
   6 phases: Greet → Educate → Collect → Verify → Process → Close
   68 field definitions across 7 intents — never re-asks a collected field

5. PRE-LLM PII MASKING — Regex masking in <1ms, 5 types (Aadhaar, PAN, phone, DOB, account)
   RBI 2024 compliant — PII never reaches any external AI API

6. REAL-TIME WEBSOCKET SYSTEM — Sub-50ms bidirectional communication, 12+ event types
   4-mixin ConnectionManager (connection, handlers, audio_pipeline, helpers)
   Staff keyword detection auto-fires input_request popup on customer kiosk

7. STREAMING AUDIO PIPELINE — AudioWorklet Float32 PCM → AudioStreamSession
   Partial STT every 0.4s (live preview) + final pipeline on stop_speaking
   Pure-Python Float32→int16 WAV conversion (no ffmpeg needed in streaming path)

8. BILINGUAL PDF SUMMARY — FPDF2 + Noto Unicode fonts
   Post-session A4 doc: Hindi + customer language; LLM-generated summary; UBI branded
   Uploaded to Cloudflare R2 or local storage via storage_service.py

### User Journey:

Customer walks in → scans QR code on kiosk tablet
→ Selects language from 10-language grid (SpeechBubbleRobot animation)
→ Selects banking service (6 options: account opening, loan enquiry, KYC, card, balance, FD)
→ Staff logs into Staff Panel (JWT, role-based routing)
→ Auto-greeting TTS fires in customer's language when both sides connect
→ Customer speaks (push-to-talk / hold-to-speak) → PCM streams to backend
→ Partial STT fires every 0.4s (staff sees live preview)
→ stop_speaking → full pipeline: STT → PII mask → RAG retrieval → LLM (7 outputs) → DB commit → WS broadcast
→ Staff Panel updates: bilingual transcript, AI suggestion, intent badge, sentiment badge,
  InfoBoard (collected entities), Navigator (next question), document checklist
→ Staff approves/edits suggestion → TTS generated → Customer Panel auto-plays in their language
→ Staff keyword detection: "Aadhaar" / "PAN" detected → input_request popup auto-fires on kiosk
→ Customer submits PII via popup → masked and forwarded to staff InfoBoard
→ Steps marked complete → process progresses
→ Session ends → auto-farewell TTS in customer's language + verification time message
→ Bilingual PDF generated → Customer sees SummaryPage with PDF download link
→ AnalyticsDaily table updated

### What Is Completed:

- 3-Level STT Fallback Chain (Sarvam → Groq Whisper → Reverie BFSI)
- Streaming Audio Pipeline (AudioWorklet PCM → partial STT → final pipeline)
- Structured LLM Pipeline with Gemini fallback + circuit breaker
- RAG Service (ChromaDB + multilingual-e5-small + BM25 + cross-encoder reranking)
- Knowledge Base (9 markdown files, 7 categories, YAML front-matter)
- Pre-LLM PII Masking (5 types, <1ms, RBI 2024, PIILog audit trail)
- Deterministic Session Navigator (7 intents, 68 fields, 6 phases, multilingual greetings/farewells)
- Real-Time WebSocket System (12+ event types, 4-mixin ConnectionManager)
- Auto-greeting + auto-farewell with TTS
- Staff keyword detection → auto input_request popup on customer kiosk
- Staff Panel — 6 live dashboard panels + 10 process tab components
- Staff Panel UI library (Modal, Button, Badge, Spinner, Toggle, AddStaffModal, CredentialsModal, ResetPasswordButton)
- Customer Panel — LanguageSelectPage, WaitingPage, LiveSessionPage, SummaryPage
- Customer Panel components (ConversationBubble, MicControl, ServiceSelectionGrid, DocumentChecklist, SpeechBubbleRobot)
- Cloudflare R2 Storage Service with local filesystem fallback
- Bilingual PDF Summary (FPDF2 + Noto fonts, UBI branded, LLM-generated)
- JWT + RBAC Auth (Teller, Manager, Supervisor, Admin — 8h expiry)
- PostgreSQL schema — 10 tables, Alembic migrations
- Redis TTS caching (7-day TTL, ~40% hit rate)
- Mock CBS service (deterministic hash-based customer profiles)
- 8 Banking Process JSON definitions (10 languages)
- Sliding-window rate limiter (staff: 30/min, customer: 15/min)
- Live deployment on Netlify + Render
- Unit tests (pii_service, language_config, pipeline_helpers, rate_limit)

### What Is In Progress / Pending:

In Progress:
- Bug: translated text not appearing in Customer Panel ConversationBubble
- WebSocket race condition on rapid reconnects
- Staff Dashboard CSS layout refinements

Pending:
- Real CBS API integration (Finacle/BaNCS — needs bank OAuth2)
- TTS fallback engine (Google TTS / browser SpeechSynthesis)
- Redis Pub/Sub for horizontal WebSocket scaling
- NER-based PII detection (current is regex-only)
- Field-level DB encryption + TTL-based PII auto-purge
- Offline STT via local faster-whisper (weights already downloaded)
- HttpOnly cookie migration for JWT

### Known Bugs:

- Translated text sometimes not rendering in Customer Panel ConversationBubble
  (staff_response_translated populated in DB but not reliably in audio_ready WS payload)
- WebSocket race condition on rapid reconnects (<500ms)
  (frontend has 1s reconnect debounce; server-side fix pending)
- TTS has no fallback — if Sarvam is down, customer hears nothing (text still shown)
- ChromaDB requires initial ingest via ingest_kb.py (auto-ingest on startup if empty)

### Design System:

UBI Navy: #003087 | UBI Red: #E8231A | Inter font (UI) | Noto Sans (multilingual PDF)
Framer Motion: ConversationBubble spring entry, 11-bubble SpeechBubbleRobot float, grid stagger
Customer Panel: 48px minimum tap targets, portrait-first, mobile kiosk layout
Staff Panel: 3-column desktop dashboard, collapsing sidebar on tablet

---

Now perform ALL of the following analysis parts in order.
Do NOT skip any part. Do NOT give generic suggestions.
Every answer must reference specific files, features, and architecture decisions of VaaniBank AI.

---

# PART 1 — Brutal Selection Probability Analysis

Act exactly as the iDEA 2.0 hackathon jury evaluating VaaniBank AI against 150 teams.

Give:

Current selection probability: X/100

Score each dimension (0–10):
- Innovation score: X/10 — [specific reason referencing VaaniBank AI features]
- Technical score: X/10 — [specific reason]
- Impact score: X/10 — [specific reason]
- Scalability score: X/10 — [specific reason]
- UX score: X/10 — [specific reason]
- Presentation score: X/10 — [specific reason, based on known demo readiness]
- Execution score: X/10 — [specific reason, referencing completed vs pending features]

Then answer with brutal honesty:
"What will SPECIFICALLY stop VaaniBank AI from entering the top 5?"

Name the exact weaknesses (not generic statements). Reference actual known bugs,
pending features, missing elements, or architectural gaps.

---

# PART 2 — Top 5 Strategy

Tell me exactly what must change to convert VaaniBank AI from a strong entry into a
top-5 winning project at iDEA 2.0.

Provide specific actions under each category:

1. Immediate improvements (can do in the next few hours before demo)
   — Reference specific bugs, demo flow gaps, or UI polish items

2. Short-term improvements (1–2 days)
   — Reference pending features that are close to done or high-leverage

3. High-impact improvements (architectural or feature depth)
   — Reference specific missing capabilities that judges will probe

4. Final presentation improvements
   — Specific to the UBI/PSB judging panel — what they care about most

---

# PART 3 — One Feature Nobody Thinks About

Suggest ONLY ONE feature.

Conditions it must meet:
- Extremely innovative — no other team will have built it
- Judges say "wow" immediately
- Solves a real, documented problem in the PSB banking context
- Not a gimmick — real technical depth and social impact
- Feasible to demo within hackathon timeframe
- Gives VaaniBank AI a competitive moat
- Can become startup-worthy and monetizable independently

Provide ALL of the following for this ONE feature:

Feature name:
Problem solved: [specific PSB / RBI / rural banking problem]
Why competitors won't think of it: [psychology + complexity reasons]
How it works: [user-facing explanation]
Technical implementation: [specific files to modify, APIs to call, data flow]
Required APIs/models: [name specific models/APIs with justification]
Architecture flow: [step-by-step data flow from customer to output]
Expected impact: [quantified where possible — e.g. X% reduction in Y]
Why judges will love it: [specific to iDEA 2.0 / UBI judging criteria]
Difficulty: Easy / Medium / Hard
Time required: [realistic estimate for team of ~3 developers]
Selection boost: [estimated % improvement in selection probability]

---

# PART 4 — Improvement Matrix

Create a prioritized table with these exact columns:
Priority | Issue | Current Problem in VaaniBank AI | Suggested Solution | Impact

Use these Priority levels: Critical | High | Medium | Low

Cover ALL of the following categories — at least 2 issues per category:

- Technical issues (backend, pipeline, WebSocket)
- Product issues (missing flows, incomplete features)
- UX issues (Staff Panel, Customer Panel — specific component names)
- Security issues (referencing actual current implementation gaps)
- Architecture issues (scalability, single points of failure)
- AI issues (RAG, LLM, STT, TTS gaps)
- Scalability issues (what breaks at 100 concurrent sessions)
- Demo issues (what will make judges confused or unimpressed during live demo)

Do not invent problems. Only reference actual known issues from the codebase and status above.

---

# PART 5 — Hidden Weakness Detection

Find and name specifically:

- Fake features: things that appear to work but are simulated or incomplete
  (e.g., mock CBS, Reverie STT key not configured, WhatsApp send not integrated)
- Duplicate logic: redundant code paths or duplicated state
- Weak implementations: technically present but not production-quality
- Placeholder functionality: UI components that render but don't connect to real backend
- Unnecessary complexity: overengineered parts that add no judging value
- Missing flows: user journeys that are incomplete end-to-end
- Overengineering: parts that impress technically but confuse judges during demo
- Underengineering: parts that should have more depth but are shallow
- Potential judge criticism: the 3 questions judges will definitely ask that the current
  implementation cannot answer confidently

Reference specific file names, components, and features.

---

# PART 6 — Useless Code Detection

Scan all files described above and identify any code that is:

For each item provide:

File name:
Purpose (what it claims to do):
Why it exists (historical reason):
Why it is unnecessary (specific technical reason):
Risk if removed:
Recommendation:

Categories to scan:
- Completely useless (dead file)
- Dead code paths (unreachable logic)
- Unused component (rendered nowhere)
- Duplicate file (logic duplicated between files)
- Unused dependency (imported but never called)
- Unused API endpoint (defined but never triggered from frontend)
- Redundant state (Zustand state that mirrors DB or WS state unnecessarily)
- Unused imports (in specific files)

Only report after tracing actual stated usage. Do not assume.

---

# PART 7 — Code Quality Review

Review VaaniBank AI's code quality as a Staff Engineer at a Series-B fintech company.

Analyze specifically:
- Folder structure (staff-panel, customer-panel, shared, backend separation)
- Naming conventions (Python snake_case, React PascalCase/camelCase, UPPER_CASE constants)
- Component design (single responsibility, reusability, process-tabs extraction)
- State management (Zustand architecture, selector granularity, persist configuration)
- API architecture (thin routers → services → AI APIs layering)
- Error handling (custom exceptions, WS try/catch, 401 interceptor, graceful AI fallbacks)
- Loading states (Spinner.jsx usage, skeleton states, empty states)
- Security (JWT in localStorage vs HttpOnly, CORS config, rate limiting, PII audit trail)
- Performance (single-commit pattern, Redis caching, GZip, granular Zustand selectors)
- Accessibility (Customer Panel tap target sizes, language support, kiosk UX)
- Maintainability (managerUtils.jsx DRY pattern, process-tabs barrel export)
- Scalability (in-memory rate limiter, in-memory ConnectionManager, single Render instance)

Current code quality score: X/100

Then for each significant issue provide:
Issue: [specific]
Why it matters: [for judges / production / security]
Suggested fix: [reference specific file and approach]
Expected improvement: [measurable]

---

# PART 8 — Demo Day Winning Strategy

VaaniBank AI will be demoed live to a UBI/iDEA 2.0 judging panel. Give:

1. First 30 seconds script
   — Must open with a story, not a feature list. Reference the real problem (1.5 lakh branches,
   400M customers, language barrier) and immediately trigger emotional impact.
   Write the exact words to say.

2. Demo flow (step-by-step)
   — Specific sequence of actions: which panel to show first, which language to pick,
   which banking service to select, when to highlight specific features (PII masking,
   RAG, Navigator, PDF) and in what order for maximum impact.

3. Storytelling sequence
   — The narrative arc from problem to solution to proof to scale. Reference UBI's
   specific goals (financial inclusion, rural banking, PM Jan Dhan Yojana).

4. Judge psychology strategy
   — What iDEA 2.0 / UBI judges care about most vs. what generic hackathon judges care about.
   How to speak to a banker vs. a technologist vs. an investor simultaneously.

5. How to create emotional impact
   — The exact moment in the demo where judges will feel the impact. What to say at that moment.

6. Questions judges will definitely ask (at least 7 specific questions)
   — Based on known gaps: CBS mock, offline STT, horizontal scaling, RBI compliance audit,
   cost to deploy, TTS fallback, etc.

7. Perfect answers to each question
   — Honest, confident, technically grounded. No bluffing. Reference actual implementation.

---

# PART 9 — Final Verdict

Provide:

Current state: [one honest paragraph]
Top-5 probability right now: X/100
After implementing suggested improvements: X/100
Probability with the one wow-feature added: X/100

Then answer this question in detail:
"If VaaniBank AI were your own project and you were presenting tomorrow,
what would you change, fix, add, or remove before walking into that room?"

Rules for your answer:
- Be brutally honest
- No motivational language
- No generic suggestions
- Reference only VaaniBank AI's actual code, features, and gaps
- Think from the perspective of someone who wants to WIN, not just participate
- Prioritize ruthlessly — if you had 8 hours left, what exactly would you do, in what order?
