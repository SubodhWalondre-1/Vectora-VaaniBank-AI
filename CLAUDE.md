# CLAUDE.md

# ==========================================================
# PROJECT INFORMATION
# ==========================================================

Project Name:
VaaniBank AI

Purpose:
Real-time multilingual Gen-AI voice assistant for Union Bank of India frontline branch staff

Current Stage:
Development (POC Complete — Deployed on Netlify + Render)

Created By:
Team Vectora — iDEA 2.0 PSBs Hackathon 2026 | Union Bank of India | Problem Statement 6

Version:
v1.0



# ==========================================================
# PROJECT SUMMARY
# ==========================================================

Summary:

VaaniBank AI bridges the language barrier between frontline PSB bank staff and rural/semi-urban
walk-in customers. A customer speaks in their native language (Tamil, Odia, Marathi, etc.) into
a Customer Panel kiosk. The system transcribes via 3-level STT fallback, masks PII per RBI 2024
guidelines, runs through a structured LLM pipeline (Groq Llama-3.3-70b + Gemini 2.0 Flash fallback),
and broadcasts results over WebSocket to the Staff Panel in real-time. Staff sees bilingual
conversation, AI suggestions, collected entity data, process steps, and document readiness scores.
Approved responses are TTS-converted (Sarvam Bulbul v3) and auto-played in the customer's language.

Main Objectives:

- Eliminate the language barrier at 1.5 lakh+ PSB counters serving 400M+ walk-in customers annually
- Provide structured, hallucination-free banking process guidance during live multilingual interactions
- Ensure RBI 2024 compliant real-time PII masking before any data reaches external LLM APIs
- Generate post-session bilingual PDF summaries for branch compliance records



# ==========================================================
# TECH STACK
# ==========================================================

Frontend:
- React 19.2.4
- Vite 8.0.x (build tool)
- Zustand 5.0.12 + Immer middleware (state management)
- React Router DOM 7.13.x
- Tailwind CSS 3.4.x
- Framer Motion 12.38.x (animations)
- Recharts 3.8.x (analytics charts)
- Lucide React (icons)
- Axios 1.13.6 (HTTP client)
- React Hot Toast 2.6.0 (notifications)
- Native WebSocket API (custom hooks with auto-reconnect)
- Native AudioWorklet API (Float32 PCM streaming from browser)

Backend:
- FastAPI 0.111+ (Python 3.11, async-first)
- SQLAlchemy 2.0+ (fully async ORM with asyncpg driver)
- Alembic 1.13+ (database migrations)
- python-jose + bcrypt (JWT auth)
- httpx (async HTTP for external API calls)
- ffmpeg (WebM/Opus → 16kHz mono WAV — blob path)
- FPDF2 + ReportLab (bilingual PDF generation)
- qrcode + Pillow (QR code generation)
- boto3 (Cloudflare R2 S3-compatible object storage)
- aiofiles (async file I/O)
- chromadb (local persistent vector store for RAG)
- sentence-transformers (multilingual-e5-small + cross-encoder reranking)
- rank-bm25 (BM25Okapi in-memory keyword index)
- PyYAML (YAML front-matter parsing in knowledge base)

Database:
- PostgreSQL 15+ (primary relational store, 10 ORM tables, JSONB support)
- Redis 7+ (TTS cache with 7-day TTL, staff online status)

Authentication:
- JWT (HS256, 8h expiry, python-jose)
- bcrypt (password hashing)
- RBAC: Teller, Manager, Supervisor, Admin roles

AI Services:
- Sarvam AI Saarika v2.5 — STT Primary (10 Indian languages)
- Groq Cloud Whisper Large-v3-Turbo — STT Fallback 1 (LPU-accelerated)
- Reverie AI RevUp BFSI — STT Fallback 2 (banking-domain tuned)
- Groq Llama-3.3-70b-versatile — LLM Primary (intent, translation, sentiment, entity extraction)
- Google Gemini 2.0 Flash — LLM Fallback (circuit breaker auto-failover)
- Sarvam AI Bulbul v3 (suhani voice) — TTS (10 Indian languages, 22050 Hz)
- intfloat/multilingual-e5-small — RAG embedding model (local, multilingual)
- cross-encoder/ms-marco-MiniLM-L-6-v2 — RAG reranking model (local)
- faster-whisper-large-v3 — local Whisper model (in models/whisper/, optional offline path)

Deployment:
- Netlify (Staff Panel: vaanibank-staff.netlify.app)
- Netlify (Customer Panel: vaanibank-customer.netlify.app)
- Render (Backend API)
- Cloudflare R2 (audio + PDF CDN storage — optional, falls back to local)



# ==========================================================
# IMPORTANT PROJECT STRUCTURE
# ==========================================================

Frontend (Staff Panel — frontend/staff-panel/src/):

/pages
Purpose: Full-page route components
  LoginPage.jsx — UBI branded split-layout login + Demo Helper modal
  DashboardPage.jsx — Main 3-column operational screen (6 live panels)
  HistoryPage.jsx — Past sessions table + Recharts analytics charts
  AdminPage.jsx — Admin control panel (staff CRUD, branch management, audit log)
  ManagerPage.jsx — Manager dashboard (session oversight, team stats)
  AnalyticsPage.jsx — Branch analytics and reporting
  KnowledgePage.jsx — Banking knowledge base viewer
  SettingsPage.jsx — User settings and preferences

/components/dashboard
Purpose: The 6 live operational panels shown during an active session
  ConversationPanel.jsx — Live bilingual chat + sentiment badges
  AISuggestionBox.jsx — AI response + approve/edit/discard CTAs
  ProcessPanel.jsx — Gamified RBI step checklist (loads 10 tab components)
  InfoBoard.jsx — Real-time entity collection dashboard
  SmartNavigator.jsx — State-first guided process navigator
  BilingualSummary.jsx — Post-session bilingual PDF viewer

/components/dashboard/process-tabs
Purpose: 10 extracted tab components for ProcessPanel (barrel exported via index.js)
  StepsTab, DocsTab, EligibilityTab, InfoTab, NumbersTab, RatesTab,
  ComplianceTab, ProfileTab, SendTab, ActionsTab

/components/layout
Purpose: Global shell components
  TopBar.jsx — Header with branch info + connection status
  Sidebar.jsx — Navigation sidebar
  BottomBar.jsx — Action bar with mic + AI hints

/components/ui
Purpose: Reusable UI component library
  Modal.jsx, Button.jsx, Badge.jsx, Spinner.jsx, Toggle.jsx
  AddStaffModal.jsx — Create new teller/supervisor → triggers CredentialsModal
  CredentialsModal.jsx — Shows generated password ONCE after staff creation
  ResetPasswordButton.jsx — Admin/manager password reset → shows new credentials once

/hooks
Purpose: Custom React hooks
  useWebSocket.js — WS connection, auto-reconnect, message routing
  useAudio.js — MediaRecorder + AudioWorklet PCM streaming + audio playback

/services
Purpose: API layer
  api.js — Axios instance + all API wrappers (login, sessions, STT, TTS, summaries, analytics, staffAPI)

/context
Purpose: Global state management
  AppContext.jsx — Zustand store (auth, theme, session, WS state, conversationHistory,
    collectedInfo, processSteps, navigatorState, aiSuggestion, docReadiness)

/utils
Purpose: Shared utilities
  managerUtils.jsx — StatCard, RoleBadge, StatusDot, ActionBadge, CHART_COLORS,
    SENTIMENT_COLORS, todayStr(), daysAgoStr(), fmtDuration(), fmtDate(), fmtDateTime()


Frontend (Customer Panel — frontend/customer-panel/src/):

/pages
Purpose: Customer-facing route pages (no auth required — public kiosk)
  LanguageSelectPage.jsx — 10-language grid with SpeechBubbleRobot animation
  WaitingPage.jsx — Waiting for staff connection
  LiveSessionPage.jsx — Core voice interaction screen
  SummaryPage.jsx — Bilingual summary + PDF download

/components
Purpose: Mobile-first kiosk UI components
  ConversationBubble.jsx — Animated Framer Motion chat bubble (staff=blue, customer=red)
  MicControl.jsx — Push-to-talk mic; passive:false touchstart for mobile; waveform visualizer
  ServiceSelectionGrid.jsx — 6-service selection grid; sends customer_service_selected WS event
  DocumentChecklist.jsx — Required documents per intent; sends document_confirmed WS event
  SpeechBubbleRobot.jsx — Animated SVG robot + 11 floating speech bubbles (UBI colors)

/hooks
Purpose: Customer-side hooks
  useAudio.js — Push-to-talk recording + AudioWorklet PCM streaming + auto-playback
  useWebSocket.js — WS connection for customer role

/services
  api.js — Axios + customer API wrappers (no auth required)


Frontend (Shared — frontend/shared/):
  constants.js — BRAND colors, LANGUAGES array, WS_EVENTS enum, SESSION_STATUS,
    SENTIMENTS, APP_NAME, APP_VERSION, BANK_NAME, TEAM_NAME


Backend (backend/):

Root files:
  main.py — FastAPI app entry, lifespan, CORS, router mounts
  config.py — Pydantic BaseSettings, all env var loading
  database.py — Async SQLAlchemy engine + Redis client
  models.py — 10 SQLAlchemy ORM models
  schemas.py — 50+ Pydantic v2 request/response schemas
  seed_data.py — DB seeder (3 branches, 3 staff, 19 process steps, 8 languages)
  ingest_kb.py — CLI: parse/chunk/embed knowledge_base/*.md into ChromaDB
  migrate_add_gu_ml_columns.py — One-time migration: adds Gujarati + Malayalam step columns

/routers
Purpose: FastAPI route handlers — NEVER call ai_service or rag_service directly here
  auth.py — /auth/* (login, logout, refresh, me)
  sessions.py — /sessions/* CRUD + WebSocket /ws/{token}
  ai_pipeline.py — /stt/*, /llm/*, /tts/* endpoints
  summary.py — /summary/*, /process/*, /analytics/*, /branches/*/qr
  staff.py — Staff management, password reset, credentials
  _pipeline_helpers.py — Shared AI pipeline utility functions

/services
Purpose: Business logic layer — all AI calls happen here, not in routers
  ai_service.py — Core AI singleton: STT→LLM→TTS orchestration, translate_text()
  pipeline_orchestrator.py — Full pipeline: STT→PII→RAG→LLM→DB→WS (single-commit)
  session_navigator.py — Deterministic state machine (7 intents, 68 fields, 6 phases,
    GREETING_MULTILINGUAL, FAREWELL_MULTILINGUAL, VERIFICATION_TIME_MAP, QUESTION_BANK)
  pii_service.py — Regex PII detection & masking (5 types, RBI 2024 format)
  pdf_service.py — FPDF2 bilingual PDF generator (UBI branded, Noto fonts)
  cbs_service.py — Mock Core Banking System (deterministic hash-based profiles)
  document_service.py — Document readiness scoring + build_checklist() per intent
  rag_service.py — ChromaDB + multilingual-e5-small + BM25 + cross-encoder reranking
  storage_service.py — Cloudflare R2 upload (boto3) with local filesystem fallback

/websocket
Purpose: Real-time WebSocket system (ConnectionManager composed of 4 mixins)
  manager.py — ConnectionManager class + broadcast helpers
  connection.py — ConnectionMixin: connect/disconnect lifecycle, auto-greeting, auto-farewell
  handlers.py — HandlersMixin: all 12+ staff/customer JSON event routing
  audio_pipeline.py — AudioPipelineMixin: PCM chunk handling, partial STT, final pipeline
  audio_streamer.py — AudioStreamSession dataclass (PCM buffer, VAD, rate-limiting)
  helpers.py — _event(), _safe_send(), _now_iso()

/core
Purpose: Security and cross-cutting concerns
  security.py — JWT creation/validation, bcrypt, RBAC FastAPI dependencies
  guards.py — Route guard utilities (require_role)
  exceptions.py — 12 custom exceptions + global error handlers
  language.py — LANG_CODE_TO_ATTR dict, lang_code_to_attr() for DB column resolution

/middleware
Purpose: Request-level middleware
  rate_limit.py — Sliding-window per-IP rate limiter (staff: 30/min, customer: 15/min)

/config
Purpose: Externalized configuration
  document_registry.py — Banking document requirements per intent
  intent_guidance.yaml — Per-intent LLM prompt guidance strings (cached on first load)

/processes
Purpose: Banking process step JSON definitions (8 files)
  account_opening.json, personal_loan.json, home_loan.json, education_loan.json,
  vehicle_loan.json, fixed_deposit.json, cibil_info.json, default.json

/knowledge_base
Purpose: Markdown files for RAG ingestion (YAML front-matter on all files)
  compliance/rbi_rules.md
  loans/home_loan.md, personal_loan.md
  products/fixed_deposit.md, savings_account.md
  glossary/banking_glossary.md
  kyc/kyc_update.md
  processes/account_opening_sop.md, loan_application_sop.md
  scripts/staff_response_scripts.md

/fonts
Purpose: Noto font files for multilingual PDF rendering (Devanagari, Tamil, Telugu, Kannada)

/storage
Purpose: Local fallback storage
  audio/ — TTS .wav files (fallback if R2 not configured)
  summaries/ — PDF summary files (fallback if R2 not configured)
  chroma_db/ — ChromaDB persistent vector store (auto-created on first RAG ingest)

/tests
Purpose: Unit tests
  test_language_config.py, test_pii_service.py, test_pipeline_helpers.py, test_rate_limit.py



# ==========================================================
# DATABASE DESIGN
# ==========================================================

10 PostgreSQL Tables:

Branch: id, branch_code (UK), branch_name, city, state

StaffMember: id, staff_id (UK), username (UK), password_hash, full_name,
  role (teller/manager/supervisor/admin), branch_id (FK), languages_known (JSONB), is_active

Session: id, token_number (UK), branch_id, staff_id, customer_language,
  customer_language_code, customer_account_number, customer_mobile_number,
  customer_pan, customer_dob, customer_aadhaar_last4,
  status (waiting/active/completed/abandoned), intent_detected, sentiment_overall,
  collected_data (JSONB), pii_types_found (JSONB), started_at, ended_at,
  duration_seconds, total_exchanges

Exchange: id, session_id, exchange_number, direction, customer_text_original,
  customer_text_translated, staff_response_suggested, staff_response_final,
  staff_response_translated, staff_audio_url, staff_used_suggestion, pii_detected,
  stt_confidence, stt_model_used, sentiment, intent

ProcessStep: id, intent_type, step_number, step_text_hindi + step_text in 9 more languages,
  speak_to_customer, is_active

SessionProcessTracking: id, session_id, step_id (FK → ProcessStep),
  status (pending/completed/skipped), completed_at
  NOTE: rows lazy-inserted on first step_completed event

BilingualSummary: id, session_id, customer_language, summary_hindi, summary_customer_lang,
  key_points_hindi, key_points_customer, next_steps_hindi, next_steps_customer (all JSONB),
  pdf_url, pdf_generated, generated_at

PIILog: id, session_id, exchange_id (FK → Exchange), pii_type, masked_value

AuditLog: id, actor_id (FK → StaffMember), action, branch_code, created_at

AnalyticsDaily: id, branch_id, date, total_sessions, avg_duration_seconds,
  languages_used (JSONB), intents_breakdown (JSONB),
  ai_suggestion_used, ai_suggestion_edited, ai_suggestion_ignored

Key Relationships:
  Branch → StaffMember, Session, AnalyticsDaily (one-to-many)
  Session → Exchange, SessionProcessTracking, PIILog (one-to-many)
  Session → BilingualSummary (one-to-one)



# ==========================================================
# WEBSOCKET EVENT REFERENCE
# ==========================================================

All events use envelope: { type: string, data: object, timestamp: ISO8601 }

Client → Server (Customer):
  start_speaking, [binary PCM frames], stop_speaking
  customer_service_selected, input_submitted, document_confirmed, end_session
  demo_customer_message, ping

Client → Server (Staff):
  staff_approved_response, staff_edited_response, step_completed, end_session
  trigger_input_request, submit_verification, ping

Server → Client (broadcast):
  session_connected, peer_status, customer_speaking
  transcription_partial, transcription_ready
  ai_suggestion_ready, info_board_update, navigator_update, doc_readiness_update
  audio_ready, step_updated, pii_alert, pii_detected
  input_request, input_received, input_acknowledged, document_confirmed
  staff_message, staff_typing, session_ended, error, pong

New event types MUST be added to WS_EVENTS in frontend/shared/constants.js



# ==========================================================
# CLAUDE WORKING RULES
# ==========================================================

Before changing code:

1. Read relevant files first — understand which service owns which responsibility
2. Understand the single-commit architecture in pipeline_orchestrator.py
3. Identify dependencies between routers → services → AI APIs
4. Check if the change affects the critical path (ai_service.py, pipeline_orchestrator.py, manager.py)
5. Avoid assumptions — read the actual code

While changing code:

1. Modify only required files
2. Minimize unnecessary changes
3. Reuse existing components and utilities
4. Follow project patterns (routers call services, services call AI APIs)
5. Keep naming consistent (camelCase JS, snake_case Python, PascalCase components/classes)
6. Preserve all existing functionality

After changing code:

1. Verify imports
2. Verify mobile responsiveness (Customer Panel is kiosk/mobile-first)
3. Verify error handling (all async ops need try/catch or FastAPI exception handlers)
4. Verify performance impact (pipeline target <4s end-to-end)
5. Check for WebSocket side effects



# ==========================================================
# DO NOT
# ==========================================================

Never:

- Skip PII masking — pii_service.py MUST always run before any LLM call
- Replace session_navigator.py with an LLM — deterministic state machine is by design
- Skip RAG [BANKING KNOWLEDGE] block injection before customer query in LLM calls
- Call ai_service or rag_service directly from routers — services layer is mandatory
- Break the single-commit architecture in pipeline_orchestrator.py
- Use WebSocket events without the { type, data, timestamp } envelope
- Log or store plain-text passwords anywhere — CredentialsModal shows them ONCE only
- Write audio or PDF files directly to disk — always use storage_service.py
- Duplicate Manager+Admin logic — it belongs in utils/managerUtils.jsx
- Merge process-tabs/ components back into ProcessPanel.jsx
- Rewrite ai_service.py, pipeline_orchestrator.py, or manager.py without prior explanation
- Hardcode API keys, DB credentials, or R2 secrets — all go in backend/.env
- Create SessionProcessTracking rows eagerly — they are lazy-inserted on step_completed
- Use a single lang_code → DB column mapping anywhere except core/language.py LANG_CODE_TO_ATTR
- Add unprotected staff routes — all staff endpoints must use RBAC dependency injection



# ==========================================================
# ALWAYS
# ==========================================================

Always:

- Save Session PII to BOTH Session table columns AND collected_data JSONB (see handlers.py _handle_input_submitted)
- Use core/language.py LANG_CODE_TO_ATTR for all lang_code → DB column resolution
- Inject RAG context as [BANKING KNOWLEDGE] block BEFORE customer query in every LLM prompt
- Use storage_service.py as the single path for all audio and PDF file uploads
- Add new WS event types to WS_EVENTS in frontend/shared/constants.js
- Run python ingest_kb.py (or --force) after adding/editing any knowledge_base/*.md file
- Use { type, data, timestamp } envelope for every WebSocket event (helpers.py _event())
- Apply RBAC dependency injection (get_current_staff or require_role) on all new staff endpoints
- Use managerUtils.jsx for any new shared Manager/Admin utilities or components
- Put new Staff Panel UI components in components/ui/
- Put new Customer Panel components in frontend/customer-panel/src/components/
- Keep functions small and single-responsibility
- Handle errors — all FastAPI routes use custom exceptions from core/exceptions.py
- Consider mobile responsiveness — Customer Panel is a tablet/mobile kiosk
- Follow async-first pattern — no blocking calls in FastAPI routes



# ==========================================================
# FRONTEND RULES
# ==========================================================

UI Rules:

- Customer Panel: mobile-first, touch-optimized (passive:false touchstart/touchend on MicControl)
- Staff Panel: 3-column dashboard layout — do not break the panel grid
- Reuse ui/ components (Modal, Button, Badge, Spinner, Toggle) — do not create duplicates
- Separate logic from UI — business logic in hooks/context, rendering in components
- Maintain UBI color scheme: navy #003087, red #E8231A (from shared/constants.js BRAND)
- Maintain consistent 8px spacing grid (Tailwind defaults)

Animation Rules:

- Use Framer Motion for all panel transitions, bubble animations, and service grid stagger
- SpeechBubbleRobot float animations use 11 bubbles — do not simplify
- Audio waveform bars use CSS keyframes — keep them performant
- MicControl pulse animation signals active recording — do not remove



# ==========================================================
# BACKEND RULES
# ==========================================================

Backend Requirements:

- All async — await every DB, Redis, and external API call; no blocking in FastAPI routes
- Single-commit per pipeline run — all DB mutations in one await db.commit() in pipeline_orchestrator.py
- Validate all inputs via Pydantic v2 schemas in schemas.py
- Handle errors via custom exceptions in core/exceptions.py — never expose stack traces
- Rate limiting applies to all AI endpoints — check middleware/rate_limit.py before adding new routes
- Separate concerns strictly: routers → services → AI APIs (no layer-skipping)
- All new environment variables go in backend/.env and are loaded via config.py Pydantic BaseSettings



# ==========================================================
# CRITICAL ARCHITECTURE NOTES
# ==========================================================

Pipeline Flow (do not alter this order):
  Customer speaks → AudioWorklet PCM → WebSocket binary frames
  → AudioStreamSession (audio_streamer.py) assembles WAV
  → stop_speaking event → _run_final_pipeline (audio_pipeline.py)
  → pipeline_orchestrator.py:
      STT (3-level fallback) → PII Mask → RAG retrieval → LLM (7 outputs)
      → single DB commit → WebSocket broadcast to Staff Panel

LLM produces 7 structured outputs in one call:
  translation, intent, sentiment, suggestion_hindi,
  suggestion_customer_lang, entities, conversation_stage

RAG Architecture:
  ChromaDB (dense) + BM25Okapi (sparse) → RRF merge → cross-encoder rerank → top-4 chunks
  Embedding: intfloat/multilingual-e5-small | Reranker: ms-marco-MiniLM-L-6-v2
  Short queries (< 6 words) are rewritten to standalone via Groq before retrieval

Session Navigator phases (deterministic — NOT LLM):
  Greet → Educate → Collect → Verify → Process → Close
  68 field definitions across 7 intents — never re-asks collected fields

TTS flow:
  Staff approves suggestion → _handle_staff_response (handlers.py)
  → DB lang lookup → step text → LLM fallback translate → Sarvam Bulbul v3 TTS
  → Redis cache (7-day TTL) → Cloudflare R2 (or local) → audio_ready WS event → Customer Panel auto-plays



# ==========================================================
# RESPONSE FORMAT
# ==========================================================

Before implementation explain:

1. Problem found
2. Files affected (be specific — include full paths)
3. Proposed approach and why it preserves existing architecture

After implementation provide:

1. Files changed (with paths)
2. Exact changes made
3. Potential impacts (especially on WebSocket events, DB schema, pipeline flow)
4. Suggested next steps or related improvements



# ==========================================================
# CURRENT PROJECT STATUS
# ==========================================================

Completed:

- 3-Level STT Fallback Chain (Sarvam → Groq Whisper → Reverie BFSI)
- Streaming Audio Pipeline (AudioWorklet PCM → AudioStreamSession → partial STT → final pipeline)
- Structured LLM Pipeline with Gemini fallback + circuit breaker (7 outputs per call)
- RAG Service (ChromaDB + multilingual-e5-small + BM25 + cross-encoder reranking)
- Knowledge Base (9 markdown files across 7 categories with YAML front-matter)
- ingest_kb.py CLI with --force flag for re-ingestion
- Pre-LLM PII Masking (5 types — Aadhaar, PAN, phone, account, DOB — RBI 2024 compliant)
- Deterministic Session Navigator (7 intents, 68 fields, 6 phases, multilingual greetings/farewells)
- Real-Time WebSocket System (12+ event types, 4-mixin ConnectionManager)
- Auto-greeting + auto-farewell with TTS on both-sides-connected event
- Staff keyword detection → auto input_request popup on customer kiosk
- Staff Panel — all 6 live dashboard panels + 10 process tab components (process-tabs/)
- Staff Panel UI library (Modal, Button, Badge, Spinner, Toggle, AddStaffModal, CredentialsModal, ResetPasswordButton)
- Staff Panel utils (managerUtils.jsx)
- Customer Panel — LanguageSelectPage, WaitingPage, LiveSessionPage, SummaryPage
- Customer Panel components (ConversationBubble, MicControl, ServiceSelectionGrid, DocumentChecklist, SpeechBubbleRobot)
- Cloudflare R2 Storage Service with local filesystem fallback
- Bilingual PDF Summary (FPDF2 + Noto fonts, UBI branded, LLM-generated content)
- JWT + RBAC Auth (4 roles, 8h expiry)
- PostgreSQL schema — 10 tables, Alembic migrations
- migrate_add_gu_ml_columns.py — Gujarati + Malayalam step translations
- Redis TTS caching (7-day TTL, ~40% hit rate)
- Mock CBS service (deterministic hash-based customer profiles)
- 8 Banking Process JSON definitions (19 process steps across 6 intents, 10 languages)
- Sliding-window rate limiter (asymmetric — staff 30/min, customer 15/min)
- Seed data (3 branches, 3 staff, 19 process steps, 8 languages)
- Shared frontend constants (frontend/shared/constants.js)
- Live deployment (Netlify Staff + Customer, Render Backend)
- Unit tests (test_language_config, test_pii_service, test_pipeline_helpers, test_rate_limit)

In Progress:

- Bug fix: translated text not appearing in Customer Panel ConversationBubble
- WebSocket session persistence edge cases on rapid reconnects
- CSS layout refinements in Staff Dashboard

Pending:

- Real CBS API integration (Finacle/BaNCS — requires bank-side OAuth2)
- TTS fallback engine (Google TTS / browser SpeechSynthesis)
- Redis Pub/Sub for horizontal WebSocket scaling
- NER-based PII detection for verbal/contextual PII
- Field-level DB encryption + TTL-based PII auto-purge (production compliance)
- Offline STT fallback (faster-whisper weights already in models/whisper/)
- HttpOnly cookie migration for JWT (replace localStorage)

Known Issues:

- Translated text sometimes not appearing in Customer Panel ConversationBubble (active fix)
- WebSocket race condition on rapid reconnects (intermittent)



# ==========================================================
# ENVIRONMENT VARIABLES
# ==========================================================

Database:
  DATABASE_URL=postgresql+asyncpg://vaanibank:vaanibank12345@localhost:5432/vaanibank_db
  REDIS_URL=redis://localhost:6379/0

JWT:
  JWT_SECRET_KEY=your-256-bit-secret-key
  JWT_ALGORITHM=HS256
  JWT_EXPIRE_HOURS=8

AI Services:
  SARVAM_API_KEY=
  SARVAM_STT_URL=https://api.sarvam.ai/speech-to-text
  SARVAM_TTS_URL=https://api.sarvam.ai/text-to-speech
  SARVAM_TTS_MODEL=bulbul:v3
  GROQ_API_KEY=
  GROQ_MODEL=llama-3.3-70b-versatile
  GROQ_MAX_TOKENS=1000
  GEMINI_API_KEY=
  GEMINI_MODEL=gemini-2.0-flash
  REVERIE_APP_ID=
  REVERIE_API_KEY=

Cloudflare R2 (all optional — graceful local fallback):
  R2_ACCOUNT_ID=
  R2_ACCESS_KEY_ID=
  R2_SECRET_ACCESS_KEY=
  R2_BUCKET_NAME=
  R2_PUBLIC_URL=

App:
  APP_ENV=development
  APP_PORT=8000
  ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
  DEMO_MODE=true
  APP_URL=https://vaanibank-customer.netlify.app
  AUDIO_STORAGE_PATH=./storage/audio
  SUMMARY_STORAGE_PATH=./storage/summaries



# ==========================================================
# PERFORMANCE REQUIREMENTS
# ==========================================================

Targets:

- End-to-end pipeline (customer speaks → staff sees result): < 4s
- STT: < 1.5s (Sarvam primary), < 1s (Groq fallback)
- LLM response: < 1s (Groq Llama)
- TTS generation: < 2s (Sarvam Bulbul v3)
- WebSocket event delivery: < 50ms
- Redis TTS cache hit: ~5ms (~40% hit rate)
- PII masking: < 1ms per scan
- Session Navigator next-question: ~0.1ms
- RAG retrieval (hybrid + rerank): 200–500ms (thread-pool offloaded, non-blocking)
- Partial STT interval: 0.4s (rate-limited)
- Silence detection timeout: 2.0s (auto-triggers stop_speaking fallback)
- PDF generation: < 3s per session summary



# ==========================================================
# EXTRA PROJECT NOTES
# ==========================================================

RAG Re-ingestion:
  After adding or editing any file in knowledge_base/, always run:
    python ingest_kb.py           # incremental ingest
    python ingest_kb.py --force   # re-embed all (use after edits)

Staff Password Security:
  Plain passwords are generated once and shown via CredentialsModal / ResetPasswordButton.
  They are NEVER logged, stored in plaintext, or sent via email.
  bcrypt hash only in DB. If lost, admin must reset.

CBS Integration:
  cbs_service.py currently returns deterministic hash-based mock profiles.
  Real Finacle/BaNCS integration requires bank-side OAuth2 — do not attempt without bank credentials.

ChromaDB:
  Auto-created at storage/chroma_db/ on first RAG ingest.
  If collection is empty on startup, auto-ingestion runs via ingest_kb.py logic.

Cloudflare R2:
  Fully optional — if R2 env vars are unset, all audio and PDFs fall back to local filesystem.
  Storage paths: audio/{filename} and summaries/{filename} in R2; local fallback matches.

Multilingual PDF:
  Noto fonts required in backend/fonts/ for Tamil, Telugu, Kannada, Devanagari script rendering.
  Missing fonts will cause PDF generation to fail silently — verify fonts present before PDF testing.

Demo Mode:
  DEMO_MODE=true enables scripted demo exchanges from demoData.js (Customer Panel).
  Seed credentials: UBI-NGP-001 / demo123 (teller), UBI-NGP-002 / demo123 (manager).
