# AGENTS.md

# ==========================================================
# PROJECT IDENTITY
# ==========================================================

Project Name: VaaniBank AI

Project Purpose:
A real-time multilingual Gen-AI voice banking assistant that bridges the language barrier between PSB frontline staff and walk-in customers across 10 Indian languages.

Target Users:
- Bank tellers and frontline staff at Union Bank of India branches (Staff Panel)
- Walk-in bank customers speaking regional Indian languages (Customer Panel)
- Branch managers overseeing teller performance (Manager view)
- System administrators managing staff accounts and branches (Admin view)

Main Goal:
Enable any PSB teller to serve any walk-in customer regardless of language, via live STT → LLM translation → AI response suggestion → TTS playback — all in under 3 seconds end-to-end.



# ==========================================================
# PROJECT OVERVIEW
# ==========================================================

Summary:

This project exists to:
- Eliminate language barriers at bank branch counters by transcribing, translating, and responding in the customer's native language in real time
- Guide staff through banking processes (loan enquiry, account opening, FD, KYC etc.) with AI-generated step-by-step checklists and response suggestions
- Maintain RBI 2024 compliance by auto-masking PII (Aadhaar, PAN, account numbers) before any AI processing
- Generate bilingual (Hindi + customer language) branded PDF session summaries for branch records after each interaction

Important business requirements:
- Must support 10 Indian languages: Hindi, Marathi, Tamil, Telugu, Bengali, Odia, Punjabi, Gujarati, Kannada, Malayalam
- 3-level STT fallback chain: Sarvam Saarika v2.5 → Groq Whisper → Reverie RevUp — so zero session drops
- All AI processing must mask PII before sending to external APIs (RBI 2024 guideline)
- Staff and Customer panels run on separate ports (5173 and 5174) and communicate via WebSocket through the FastAPI backend
- Offline/demo mode must work without real AI APIs (localStorage-simulated WebSocket)



# ==========================================================
# TECH STACK
# ==========================================================

Frontend:
- React 19 + Vite 8
- Tailwind CSS v3 (both panels)
- Framer Motion (animations)
- Zustand v5 (global state with persist)
- React Router v7
- Axios (HTTP)
- React Hot Toast (notifications)
- Recharts (analytics charts — staff panel only)
- Lucide React (icons)

Backend:
- Python 3.11+
- FastAPI 0.111 + Uvicorn 0.29
- WebSockets (native FastAPI WebSocket)
- Alembic (DB migrations)
- asyncpg + SQLAlchemy 2.0 async ORM
- Passlib + python-jose (auth)
- httpx (async HTTP client)
- ReportLab + fpdf2 (PDF generation)
- qrcode[pil] (QR branch entry)
- sentence-transformers + ChromaDB + rank-bm25 (RAG)
- aiofiles, PyYAML, boto3

Database:
- PostgreSQL (primary — 10 tables via SQLAlchemy ORM)
- Redis (session state cache, TTS cache, rate limiting)

Authentication:
- JWT (HS256, 8-hour expiry, staff login only)
- Staff roles: teller | manager | supervisor | admin

AI/ML:
- Sarvam AI Saarika v2.5 — primary STT
- Groq Llama-3.3-70b-versatile — primary LLM
- Groq Whisper — STT fallback 1
- Sarvam Bulbul v3 — TTS
- Google Gemini 2.0 Flash — LLM fallback
- Reverie RevUp — STT fallback 2
- ChromaDB + sentence-transformers — local RAG over banking knowledge base

Deployment:
- Netlify (Customer Panel + Staff Panel frontend)
- Render (FastAPI backend)
- Cloudflare R2 (audio + PDF storage, optional)



# ==========================================================
# FOLDER STRUCTURE
# ==========================================================

Root:
D:\idea 2.0 hackathon\Problem statement 6\VaaniBank-AI\

Main directories:

/backend
Purpose:
FastAPI application — all API routes, WebSocket handlers, AI pipeline, ORM models, DB migrations, services, and configuration.

/backend/routers
Purpose:
Route handlers grouped by domain.
- auth.py         → POST /auth/login, /auth/logout, /auth/refresh, GET /auth/me
- sessions.py     → CRUD /sessions/*, WebSocket /ws/{token_number}
- ai_pipeline.py  → POST /stt/*, /llm/*, /tts/* (STT + LLM + TTS pipeline)
- summary.py      → POST /summary/*, GET /process/*, /analytics/*, /branches/*
- staff.py        → GET/POST /staff/*, /admin/* (manager/admin CRUD + audit)
- _pipeline_helpers.py → shared helpers for AI pipeline routers

/backend/services
Purpose:
Business logic layer — called by routers, never directly by WebSocket handlers.
- ai_service.py            → Groq LLM + Gemini fallback calls
- cbs_service.py           → Core Banking System mock integration
- document_service.py      → Document checklist builder
- pdf_service.py           → Bilingual PDF summary generation (ReportLab)
- pii_service.py           → PII detection + masking (Aadhaar, PAN, phone, DOB)
- pipeline_orchestrator.py → Coordinates STT → PII mask → LLM → TTS pipeline
- rag_service.py           → ChromaDB + BM25 RAG over banking knowledge base
- session_navigator.py     → Process step tracking and navigation logic
- storage_service.py       → Local/R2 audio and PDF file storage

/backend/websocket
Purpose:
Real-time bidirectional audio + text exchange between Customer and Staff panels.
- manager.py       → WebSocket connection manager (connects/disconnects/broadcasts)
- connection.py    → Per-connection state model
- handlers.py      → Dispatches incoming WS messages to pipeline steps
- audio_pipeline.py → Routes audio blobs through STT → LLM → TTS pipeline
- audio_streamer.py → Streams TTS audio chunks back over WebSocket
- helpers.py       → Shared WS utility functions

/backend/core
Purpose:
Cross-cutting concerns.
- security.py    → JWT encode/decode, password hashing
- guards.py      → FastAPI dependency guards (require_staff, require_manager, require_admin)
- exceptions.py  → Custom exception hierarchy + register_exception_handlers()
- language.py    → Language code mappings and helpers

/backend/middleware
Purpose:
- rate_limit.py  → Sliding-window rate limiter (30 req/60s on AI endpoints)

/backend/models
Purpose:
SQLAlchemy ORM models directory. The flat models.py at /backend/models.py defines all 10 tables:
Branch, StaffMember, Session, Exchange, ProcessStep,
SessionProcessTracking, BilingualSummary, PIILog, AuditLog, AnalyticsDaily

/backend/processes
Purpose:
JSON-driven banking process definitions loaded at runtime.
Each file defines step-by-step workflow for an intent type:
- account_opening.json, home_loan.json, personal_loan.json,
  education_loan.json, vehicle_loan.json, fixed_deposit.json,
  cibil_info.json, default.json

/backend/config
Purpose:
- document_registry.py  → Maps intent → required document list
- intent_guidance.yaml  → LLM prompt guidance per banking intent

/backend/knowledge_base
Purpose:
Source documents ingested into ChromaDB for RAG (banking FAQs, product docs, RBI guidelines).

/backend/migrations
Purpose:
Alembic migration scripts — run before first deployment and after schema changes.

/backend/main.py
Purpose:
FastAPI app entrypoint. Registers all routers, middleware, CORS, static mounts (/audio, /summaries), and lifespan startup (DB test, Redis flush, auto-seed demo staff, RAG warmup).

/backend/config.py
Purpose:
Pydantic BaseSettings singleton. Single source of truth for all env vars (DB URL, Redis URL, JWT secret, Sarvam/Groq/Gemini API keys, storage paths, CORS origins, app port/env).

/backend/database.py
Purpose:
Async SQLAlchemy engine + session factory, DeclarativeBase, get_db() + get_redis() FastAPI dependencies, and startup connection health checks.

/backend/models.py
Purpose:
All 10 ORM table definitions with relationships, enums, and indexes.

/backend/schemas.py
Purpose:
Pydantic request/response schemas (DTOs) for all routers.

/backend/intent_engine.py
Purpose:
Classifies customer utterances into one of the IntentType enums using keyword/LLM logic.

/backend/language_config.py
Purpose:
Maps human-readable language names → ISO codes → Sarvam/Groq language identifiers.

/backend/seed_data.py
Purpose:
One-time seed script to populate branches, process steps, and demo staff into PostgreSQL.

/backend/ingest_kb.py
Purpose:
Ingests /knowledge_base documents into ChromaDB for RAG.

---

/frontend/customer-panel
Purpose:
Mobile-first React kiosk app for walk-in bank customers. Runs on port 5174.
Entry flow: Language Select → Waiting (token issued) → Live Session (mic, voice bubbles) → Summary.

/frontend/customer-panel/src/pages
Purpose:
- LanguageSelectPage.jsx  → Customer picks their language; token number is displayed (scanned via QR or entered manually by staff)
- WaitingPage.jsx         → Polls for staff to accept the session
- LiveSessionPage.jsx     → Core mic UI — records audio, sends to backend STT, displays conversation bubbles, plays TTS audio
- SummaryPage.jsx         → Displays session summary + PDF download link after session ends

/frontend/customer-panel/src/components
Purpose:
- ConversationBubble.jsx    → Chat bubble for customer/staff utterances
- DocumentChecklist.jsx     → Shows required document list for the detected intent
- MicControl.jsx            → Mic hold-to-record button with animated feedback
- ServiceSelectionGrid.jsx  → Banking service selection grid on language select page
- SpeechBubbleRobot.jsx     → Animated AI robot mascot with speech bubble

/frontend/customer-panel/src/context/AppContext.jsx
Purpose:
Zustand store for customer panel — language, token, theme, session state, demo mode flag.

/frontend/customer-panel/src/hooks
Purpose:
- useWebSocket.js  → Manages WS connection lifecycle (connect/disconnect/message dispatch)
- useAudio.js      → Handles mic recording, audio blob creation, and TTS audio playback

/frontend/customer-panel/src/services/api.js
Purpose:
Axios instance with base URL from env + all customer-facing API call functions.

/frontend/customer-panel/src/constants.js
Purpose:
Shared constants — language options, intent labels, API base URL fallback.

/frontend/customer-panel/src/demoData.js
Purpose:
Static mock data for offline/demo mode (simulated WS messages, fake responses).

---

/frontend/staff-panel
Purpose:
Full-featured React dashboard for bank tellers, managers, and admins. Runs on port 5173.
Protected by JWT auth. Role-based routing: teller → Dashboard, manager → ManagerPage, admin → AdminPage.

/frontend/staff-panel/src/pages
Purpose:
- LoginPage.jsx     → JWT login form; stores token + staff object in Zustand persist
- DashboardPage.jsx → Main teller workspace (ConversationPanel + ProcessPanel + InfoBoard)
- HistoryPage.jsx   → Paginated session history with search/filter
- KnowledgePage.jsx → In-app banking knowledge browser (RAG-powered Q&A)
- AnalyticsPage.jsx → Branch analytics charts (sessions, intents, sentiments, languages) using Recharts
- SettingsPage.jsx  → Staff profile + theme + language preferences
- ManagerPage.jsx   → Manager view: live session monitor, staff performance, summaries
- AdminPage.jsx     → Admin CRUD: add/remove staff, branch management, audit logs

/frontend/staff-panel/src/components/dashboard
Purpose:
Core dashboard widgets shown during an active session:
- ConversationPanel.jsx  → Real-time bilingual conversation transcript (customer + staff messages)
- ProcessPanel.jsx       → Step tracker for current banking process (tabs: Steps, Info, Docs, Rates, Numbers, Eligibility, Compliance, Profile, Send, Actions)
- AISuggestionBox.jsx    → LLM-generated staff response suggestion with accept/edit/ignore controls
- BilingualSummary.jsx   → Post-session bilingual summary card + PDF export trigger
- InfoBoard.jsx          → Session metadata (customer language, intent, sentiment, duration, PII flags)
- SmartNavigator.jsx     → AI-suggested next process step based on conversation context

/frontend/staff-panel/src/components/dashboard/process-tabs
Purpose:
11 tab components inside ProcessPanel — each renders a specific aspect of the banking process:
- StepsTab.jsx       → Numbered checklist of process steps with tick-off
- InfoTab.jsx        → General process information
- DocsTab.jsx        → Required documents checklist
- RatesTab.jsx       → Current interest rates for the detected product
- NumbersTab.jsx     → Key figures (income, loan amount, tenure, EMI)
- EligibilityTab.jsx → Customer eligibility criteria
- ComplianceTab.jsx  → RBI/regulatory compliance notes
- ProfileTab.jsx     → Customer profile data collected during session
- SendTab.jsx        → WhatsApp/email send controls for summary
- ActionsTab.jsx     → Quick-action buttons (mark complete, flag, escalate)
- index.js           → Named exports barrel file

/frontend/staff-panel/src/components/layout
Purpose:
- Sidebar.jsx   → Role-aware navigation sidebar (teller/manager/admin routes)
- TopBar.jsx    → Session status bar, staff name, theme toggle, logout
- BottomBar.jsx → Mobile bottom navigation bar

/frontend/staff-panel/src/components/ui
Purpose:
Reusable primitive UI components:
- Button.jsx, Badge.jsx, Spinner.jsx, Toggle.jsx, Modal.jsx
- AddStaffModal.jsx       → Form modal to add new staff (admin)
- CredentialsModal.jsx    → Display generated credentials after staff creation
- ResetPasswordButton.jsx → One-click password reset for admin

/frontend/staff-panel/src/context/AppContext.jsx
Purpose:
Zustand store with persist — JWT token, staff object, isAuthenticated, theme, active session, WS state, _hasHydrated flag.

/frontend/staff-panel/src/hooks
Purpose:
- useWebSocket.js  → Manages WS lifecycle for staff panel (mirrors customer panel hook, different message types)
- useAudio.js      → Plays incoming TTS audio chunks; manages audio queue

/frontend/staff-panel/src/services/api.js
Purpose:
Axios instance + all staff-facing API calls (login, session CRUD, STT/LLM/TTS pipeline, analytics, staff/admin endpoints).

/frontend/staff-panel/src/utils/managerUtils.jsx
Purpose:
Shared utility functions for ManagerPage (data transformation, chart formatters).

/frontend/staff-panel/src/bankingKnowledge.js
Purpose:
Local static banking knowledge fallback for KnowledgePage when RAG API is unavailable.

/frontend/staff-panel/src/constants.js
Purpose:
App-wide constants — role labels, intent/sentiment enums, API base URL, sidebar nav items.

/frontend/shared
Purpose:
Shared assets (fonts, icons, logos) referenced by both panels.



# ==========================================================
# AGENT WORKFLOW RULES
# ==========================================================

Before making changes:

1. Understand the relevant router + service pair before touching any endpoint
2. Check WebSocket message schema in websocket/handlers.py before changing frontend WS hook
3. Verify Zustand store shape in AppContext.jsx before adding/modifying state
4. Check config.py for any new env vars before hardcoding values
5. Read the corresponding process JSON in /backend/processes/ before changing process-tab logic

When making changes:

1. Modify only the files required for the task
2. Keep frontend components dumb — business logic belongs in services/ or hooks/
3. Keep backend route handlers thin — heavy logic belongs in services/
4. Reuse existing UI primitives from /components/ui/ before creating new ones
5. Follow existing naming: snake_case in Python, camelCase + PascalCase in React
6. Never duplicate API call logic — extend api.js for new endpoints
7. Keep Zustand actions co-located in AppContext.jsx — no scattered setState calls

After making changes:

1. Check that WS message type strings match between backend handlers.py and frontend useWebSocket.js
2. Check that new env vars are added to config.py AND documented in .env.example
3. Verify that role guards in App.jsx RoleRoute match the guards in backend core/guards.py
4. Check mobile responsiveness on the Customer Panel (it runs on a kiosk/tablet)
5. Check that new DB columns have a corresponding Alembic migration



# ==========================================================
# DO NOT
# ==========================================================

Never:

- Send raw PII (Aadhaar, PAN, account numbers) to any external AI API — always route through pii_service.py first
- Hardcode API keys, DB URLs, or secrets anywhere in source — always use config.py / .env
- Change WebSocket message type strings without updating both backend handlers.py AND frontend useWebSocket.js simultaneously
- Remove the 3-level STT fallback chain in pipeline_orchestrator.py — it is a core availability requirement
- Break the offline/demo mode flow — it must work with zero backend connectivity
- Add a new npm package to either frontend without checking if Tailwind, Framer Motion, or Zustand already covers the need
- Rename database columns without a corresponding Alembic migration
- Change the JWT payload shape without updating core/guards.py and AppContext.jsx together
- Merge Customer Panel and Staff Panel into one Vite project — they are intentionally separate deployments
- Remove PII masking from any Exchange before it is stored in the DB



# ==========================================================
# ALWAYS
# ==========================================================

Always:

- Use settings from config.py — never os.environ.get() directly in routers or services
- Use get_db() and get_redis() FastAPI dependencies in router functions — never instantiate sessions directly
- Keep all language code mappings in language_config.py — never hardcode BCP-47 strings in routers
- Use the existing toast system (react-hot-toast) for all user-facing notifications in both panels
- Keep the Customer Panel fully usable on a 768px tablet in portrait orientation
- Use the existing CSS custom properties (--accent-blue, --card-bg, --text-primary etc.) for all new UI styles — never hardcode hex values
- Handle API loading, error, and empty states in every new frontend component
- Add audit log entries for all admin/manager write actions via the AuditLog model
- Use immer-based Zustand set() pattern when updating nested state
- Keep process JSON files in /backend/processes/ as the single source of truth for banking workflows



# ==========================================================
# CODE STYLE RULES
# ==========================================================

General:
- Use consistent naming: snake_case (Python), camelCase variables + PascalCase components (React)
- Avoid deeply nested if/else — prefer early returns
- Remove unused imports before committing
- Keep functions under 50 lines where possible; extract helpers if longer

Frontend:
- All pages are lazy-loaded via React.lazy() — maintain this pattern for new pages
- Keep Zustand selectors granular — select only the slice needed, not the whole store
- Separate data-fetching hooks from rendering components
- All API calls go through /services/api.js — no fetch() or axios calls inline in components

Backend:
- Keep router handler functions thin (< 30 lines) — delegate to services/
- All DB queries go through the async SQLAlchemy session (get_db dependency)
- Use Pydantic schemas (schemas.py) for all request/response bodies — no raw dicts
- Handle HTTPException with appropriate status codes — never return 200 with an error body
- Use logger = logging.getLogger("vaanibank.<module>") in every new Python file

Database:
- All new tables/columns require an Alembic migration
- Use JSONB for flexible metadata columns (languages_used, intents_breakdown etc.)
- Add indexes on every foreign key and frequently filtered column
- Never use raw SQL strings — always use SQLAlchemy ORM or text() with bound params



# ==========================================================
# UI/UX RULES
# ==========================================================

Design requirements:

Theme: Fintech / Banking — clean, professional, trust-building

Primary Color (accent): #2563EB (--accent-blue)
Secondary Color (surface): #1E293B (--card-bg, dark mode)
Light mode surface: #FFFFFF / #F8FAFC

Rules:
- Customer Panel is kiosk/mobile-first — all tap targets minimum 48px, large readable text
- Staff Panel is desktop-first with a responsive sidebar that collapses on tablet
- Both panels support dark/light theme toggled via data-theme attribute on root div
- Use Framer Motion for page transitions and key UI state changes — keep animations under 300ms
- Never use alert() or confirm() — use Modal.jsx or react-hot-toast instead
- Loading states must be shown for all async operations — use Spinner.jsx
- Empty states must have a descriptive message + icon — never blank white space



# ==========================================================
# PERFORMANCE RULES
# ==========================================================

Optimize for:
- Sub-3-second end-to-end STT → LLM → TTS pipeline latency
- Fast initial page load — all pages are lazy-loaded, keep chunk sizes small
- Redis TTS cache (7-day TTL) — never re-generate audio for identical text
- GZip middleware on FastAPI (minimum_size=500) — do not disable
- Minimal WebSocket message size — send only changed fields, not full session state on every event
- Avoid re-renders in Zustand — always use granular selectors, not `useApp(s => s)`
- Efficient DB queries — never N+1; use SQLAlchemy joinedload() for relationships needed in one call



# ==========================================================
# ERROR HANDLING
# ==========================================================

Always:

- Handle Sarvam / Groq / Gemini API failures gracefully — fall back to the next STT/LLM in the chain
- Show a user-friendly toast on frontend when WebSocket disconnects — never let the UI freeze silently
- Wrap all WebSocket message handlers in try/except — a bad message must not crash the WS connection
- Return structured JSON errors from FastAPI with {detail: string, code: string} shape
- Handle 401 in axios response interceptor — auto-redirect to /login on token expiry
- Validate all file uploads (audio format, size) before sending to STT endpoint
- Never expose raw Python tracebacks in production error responses (APP_ENV=production)
- Log all unhandled exceptions at ERROR level with session/staff context for traceability



# ==========================================================
# RESPONSE FORMAT FOR AI AGENTS
# ==========================================================

Before implementing:

Explain:
1. Which router + service + frontend component are affected
2. Whether a DB migration is needed
3. Whether WS message schema changes are required
4. Any PII/security implications

After implementing:

Provide:
1. Files changed (with path from project root)
2. Summary of changes per file
3. Any new env vars required
4. Suggested next steps (e.g. run migration, restart Redis, test on customer panel)



# ==========================================================
# CURRENT PROJECT STATUS
# ==========================================================

Completed:
- Full FastAPI backend with all 5 routers (auth, sessions, ai_pipeline, summary, staff)
- PostgreSQL schema (10 tables) + Alembic migrations
- Redis session cache + TTS cache + rate limiting
- 3-level STT fallback chain (Sarvam → Groq Whisper → Reverie)
- LLM pipeline with Groq Llama-3.3-70b + Gemini 2.0 Flash fallback
- Sarvam Bulbul v3 TTS with Redis cache
- PII detection + masking (Aadhaar, PAN, account number, phone, DOB)
- RAG service (ChromaDB + sentence-transformers + BM25 over banking knowledge base)
- WebSocket manager (customer ↔ staff real-time bidirectional audio + text)
- Customer Panel — all 4 pages (LanguageSelect, Waiting, LiveSession, Summary)
- Staff Panel — all 8 pages (Login, Dashboard, History, Knowledge, Analytics, Settings, Manager, Admin)
- All 11 ProcessPanel tabs
- Role-based routing (teller / manager / admin)
- Demo/offline mode (localStorage-based WS simulation, no real API needed)
- JWT auth with auto-seed demo staff on startup
- Bilingual PDF summary generation
- QR code branch entry system
- Tailwind v3 (downgraded from v4 for stability)
- Netlify deployment (both panels) + Render deployment (backend)
- GZip compression + CORS for static audio files

In Progress:
- RAG knowledge ingestion pipeline refinement (ingest_kb.py)
- Manager analytics charts polish
- WhatsApp summary delivery integration (send_tab)

Pending:
- Production R2 cloud storage migration (currently using local storage)
- Load testing WebSocket under concurrent sessions
- VAPT / security audit before production handover

Known Issues:
- TTS audio may have ~500ms initial playback delay on first session (cold-start ChromaDB warmup)
- Reverie RevUp STT fallback requires valid APP_ID + API_KEY in .env — currently blank in demo mode
- Staff Panel AnalyticsPage recharts may flash empty on first render before data loads (no skeleton state yet)



# ==========================================================
# EXTRA NOTES
# ==========================================================

Demo Credentials (auto-seeded on startup):
- Teller:  username=demo,    password=demo123
- Manager: username=manager, password=manager123
- Admin:   username=admin,   password=admin123

Port Convention:
- Backend API:      http://localhost:8000
- Staff Panel:      http://localhost:5173
- Customer Panel:   http://localhost:5174

Environment File:
- Backend: /backend/.env  (copy from .env.example, fill all API keys)
- Customer Panel: /frontend/customer-panel/.env.production
- Staff Panel:    /frontend/staff-panel/.env.development + .env.production

Key External APIs (all keys in backend .env):
- SARVAM_API_KEY     → Sarvam AI (STT + TTS)
- GROQ_API_KEY       → Groq (LLM + STT fallback)
- GEMINI_API_KEY     → Google Gemini (LLM fallback)
- REVERIE_APP_ID + REVERIE_API_KEY → Reverie RevUp (STT fallback 2)

Hackathon Context:
- Event:   iDEA 2.0 PSBs Hackathon 2026
- Client:  Union Bank of India
- Problem: Statement 6 — Multilingual AI Banking Assistant
- Team:    Vectora
