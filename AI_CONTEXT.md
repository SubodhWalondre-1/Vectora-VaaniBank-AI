# AI_CONTEXT.md

# ==========================================================
# PROJECT INFORMATION
# ==========================================================

Project Name:
VaaniBank AI

Version:
v1.0

Project Type:
Web App / AI Product / Banking Assistant

Status:
Development (POC Complete — Deployed on Netlify + Render)

Created By:
Team Vectora — iDEA 2.0 PSBs Hackathon 2026 | Union Bank of India | Problem Statement 6



# ==========================================================
# PROJECT SUMMARY
# ==========================================================

Description:

VaaniBank AI is a real-time, multilingual Gen-AI voice banking assistant built for Union Bank of India's frontline branch staff. It enables any bank teller to serve walk-in customers who speak any of 10 Indian languages by transcribing the customer's speech, running it through a 7-output structured LLM pipeline, and delivering the AI-translated response to the staff — all within 4 seconds. The staff approves the AI suggestion, which is then spoken back to the customer in their native language via TTS. The system runs as two separate React panels (Staff Panel on port 5173, Customer Panel on port 5174) connected via WebSocket to a FastAPI backend, with PostgreSQL for persistence and Redis for caching. A bilingual branded PDF summary is auto-generated at session end for branch compliance records.



# ==========================================================
# PROBLEM STATEMENT
# ==========================================================

Current Problem:

- India's 1.5 lakh+ bank branches serve 400M+ walk-in customers annually. Frontline tellers speak 1–2 languages; customers speak 10+ Indian languages. A Hindi-speaking teller cannot serve a Tamil or Odia customer without a human translator, causing service denials and customer abandonment.

- Existing tools (Google Translate, generic chatbots, IVR) are not built for in-branch banking conversations. They mistranslate financial terms (CIBIL, KYC, NEFT, PMJDY), cannot handle voice input from semi-literate customers, and provide no structured banking process guidance.

- Miscommunication between staff and customers causes incorrect KYC documents, wrongly filled loan applications, and regulatory risk. There is no structured real-time way to collect, validate, and record customer data during a multilingual branch interaction.



# ==========================================================
# SOLUTION
# ==========================================================

The project solves this by:

- Deploying a 3-level STT fallback chain (Sarvam Saarika v2.5 → Groq Whisper → Reverie RevUp BFSI) so transcription never fails across 10 Indian languages
- Running a single Groq Llama-3.3-70b LLM call that simultaneously produces 7 structured outputs — translation, intent, sentiment, AI response suggestion (Hindi + customer language), entity extraction, and conversation stage — in under 1 second
- Injecting grounded banking knowledge via a hybrid RAG system (ChromaDB + multilingual-e5-small embeddings + BM25 + cross-encoder reranking) before every LLM call to eliminate hallucination on product facts
- Masking all PII (Aadhaar, PAN, phone, DOB, account numbers) via regex before the text reaches any external AI API, ensuring RBI 2024 compliance in under 1ms
- Guiding staff through banking processes step-by-step using a deterministic (non-LLM) session navigator state machine with 68 field definitions across 7 intents and 6 conversation phases
- Generating and delivering a bilingual (Hindi + customer language) branded A4 PDF summary to branch records at session end via FPDF2 + Noto Unicode fonts



# ==========================================================
# TARGET USERS
# ==========================================================

Primary Users:

- Frontline bank tellers and relationship managers at Union Bank of India branches who serve walk-in customers
- Branch managers and supervisors who monitor daily counter operations and teller performance

Secondary Users:

- Walk-in bank customers speaking regional Indian languages (Tamil, Marathi, Telugu, Bengali, Kannada, Odia, Punjabi, Gujarati, Malayalam, Hindi) who interact with the customer kiosk panel
- Bank system administrators who manage staff accounts, branches, and view analytics



# ==========================================================
# CORE FEATURES
# ==========================================================

Feature 1:
Name: 3-Level STT Fallback Chain + Streaming Audio Pipeline
Purpose: Ensure speech transcription never fails; support push-to-talk blob mode AND real-time PCM streaming via AudioWorklet
Status: Completed
Dependencies: SARVAM_API_KEY, GROQ_API_KEY, REVERIE_APP_ID + REVERIE_API_KEY, ffmpeg (blob path only), websocket/audio_streamer.py (AudioStreamSession), websocket/audio_pipeline.py

STT Chain:
  Primary:    Sarvam AI Saarika v2.5 (~1.2s, 10 Indian languages)
  Fallback 1: Groq Cloud Whisper Large-v3-Turbo (~0.8s, LPU-accelerated)
  Fallback 2: Reverie AI RevUp BFSI (~1.5s, banking-domain tuned)

Streaming Path:
  AudioWorklet (browser) → Float32 PCM binary WebSocket frames
  → AudioStreamSession accumulates PCM in memory
  → Partial STT fires every 0.4s (rate-limited) for live transcript preview
  → stop_speaking event → build_wav_snapshot() (pure-Python Float32→int16 WAV) → full pipeline
  → MIN_BYTES_FOR_STT = 32,000 bytes (~0.5s audio) before STT is attempted

Blob Path:
  WebM/Opus audio POST to /stt/customer-transcribe → ffmpeg → 16kHz mono WAV → STT chain


Feature 2:
Name: RAG Service (Retrieval-Augmented Generation)
Purpose: Ground every LLM call in authoritative banking knowledge — zero hallucination on product rates, compliance rules, or process SOPs
Status: Completed
Dependencies: chromadb, sentence-transformers (intfloat/multilingual-e5-small), rank-bm25, services/rag_service.py, knowledge_base/ (9 markdown files), storage/chroma_db/ (auto-created)

Architecture:
  ChromaDB local vector store + BM25Okapi in-memory keyword index
  → RRF merge (DENSE_CANDIDATES=15, BM25_CANDIDATES=15, RRF_K=60)
  → Cross-encoder reranking (ms-marco-MiniLM-L-6-v2)
  → Top 4 chunks above MIN_SCORE_THRESHOLD=0.10
  → Injected as [BANKING KNOWLEDGE] block BEFORE customer query in LLM prompt

Knowledge Base Categories:
  compliance/rbi_rules.md | loans/home_loan.md, personal_loan.md
  products/fixed_deposit.md, savings_account.md | glossary/banking_glossary.md
  kyc/kyc_update.md | processes/account_opening_sop.md, loan_application_sop.md
  scripts/staff_response_scripts.md
  All files use YAML front-matter: intent, product, doc_type, language, source_file

Re-ingest after edits: python ingest_kb.py (or --force to re-embed all)


Feature 3:
Name: Structured LLM Pipeline (7-Output Single Call)
Purpose: Extract maximum intelligence from each customer utterance in one LLM call — translation, intent, sentiment, suggestion, entities, customer-lang response, conversation stage
Status: Completed
Dependencies: GROQ_API_KEY, GEMINI_API_KEY, services/ai_service.py, services/pipeline_orchestrator.py

Primary LLM:  Groq Llama-3.3-70b-versatile (<1s)
Fallback LLM: Google Gemini 2.0 Flash (circuit breaker — opens after 3 failures, resets after 30s)

Single call outputs (structured JSON):
  translation, intent, sentiment, suggestion_hindi, suggestion_customer_lang,
  entities (collected_info fields), conversation_stage

Pipeline entrypoint: services/pipeline_orchestrator.py (single-commit pattern — all DB mutations in one await db.commit())


Feature 4:
Name: Pre-LLM PII Masking
Purpose: RBI 2024 mandate — PII never reaches external AI APIs; all masking happens in <1ms before any LLM call
Status: Completed
Dependencies: services/pii_service.py, PIILog ORM model

Types masked: Aadhaar (12-digit, format: **** **** {last4}), PAN (ABCDE1234F, format: *****{last5}),
  phone (10-digit, format: ******{last4}), account numbers (context-keyword gated), DOB (DD/MM/YYYY)
Masking saves PIILog rows per exchange in DB for compliance audit trail


Feature 5:
Name: Deterministic Session Navigator
Purpose: State-first process guidance — never repeats a collected field, never hallucinates process steps; zero LLM involvement in navigation decisions
Status: Completed
Dependencies: services/session_navigator.py

State machine: 6 phases — Greet → Educate → Collect → Verify → Process → Close
QUESTION_BANK: 7 intents × 4–12 fields = 68 field definitions (priority-ordered, never re-asks)
GREETING_MULTILINGUAL + FAREWELL_MULTILINGUAL: all 10 Indian languages + English
VERIFICATION_TIME_MAP: per-intent processing time messages in all 10 languages + English
Broadcasts via WebSocket: navigator_update event (next_question, phase, progress %)


Feature 6:
Name: Real-Time WebSocket System (12+ Event Types)
Purpose: Sub-50ms bidirectional communication; full lifecycle management for connect/disconnect/reconnect
Status: Completed
Dependencies: websocket/manager.py (4-mixin ConnectionManager), websocket/connection.py, websocket/handlers.py, websocket/audio_pipeline.py, websocket/audio_streamer.py, websocket/helpers.py

ConnectionManager composed of 4 mixins:
  ConnectionMixin (connection.py) — lifecycle, peer notifications, staff reconnect replay, auto-greeting, auto-farewell
  HandlersMixin (handlers.py) — routes all JSON events from both panels (12+ event types)
  AudioPipelineMixin (audio_pipeline.py) — PCM chunks, partial STT, final pipeline trigger, session summary gen
  Helpers (helpers.py) — _event() envelope, _safe_send(), _now_iso()

Staff keyword detection: _trigger_staff_input_if_needed() auto-fires input_request popup
  on Customer Panel when staff response contains PII-request keywords (Aadhaar, PAN, account number, DOB, mobile, IFSC)


Feature 7:
Name: Bilingual PDF Summary
Purpose: Post-session branded A4 compliance document in Hindi + customer's native language for branch records
Status: Completed
Dependencies: services/pdf_service.py, FPDF2, Noto font files (backend/fonts/), services/storage_service.py

Generation: LLM generates 6-field summary JSON (summary_hindi, summary_customer_lang, key_points_hindi,
  key_points_customer, next_steps_hindi, next_steps_customer) → FPDF2 renders A4
UBI branded: navy #003087 + red #E8231A color scheme; two-column layout
Sections: meta cards, intent/sentiment badges, PII alert bar, key points, summary, next steps, compliance footer
Upload: Cloudflare R2 (or local fallback) via storage_service.py; URL stored in BilingualSummary table


Feature 8:
Name: Staff Dashboard (6 Live Panels + 10 Process Tabs)
Purpose: Central real-time operational screen for tellers during a live customer session
Status: Completed
Dependencies: React 19, Zustand, Framer Motion, Recharts, useWebSocket.js, useAudio.js, components/dashboard/process-tabs/

6 Live Panels:
  ConversationPanel — bilingual transcript + sentiment badges
  AISuggestionBox — approve / edit / discard AI response + trigger TTS
  InfoBoard — collected entity data + completion percentage
  ProcessPanel — gamified RBI step checklist (hosts 10 tab components below)
  SmartNavigator — current phase, progress bar, next question
  BilingualSummary — post-session PDF viewer

10 Process Tabs (components/dashboard/process-tabs/, barrel exported via index.js):
  StepsTab, DocsTab, EligibilityTab, InfoTab, NumbersTab, RatesTab,
  ComplianceTab, ProfileTab, SendTab, ActionsTab


Feature 9:
Name: Cloudflare R2 Storage Service
Purpose: Cloud object storage for TTS audio files and PDF summaries; auto-falls back to local filesystem if unconfigured
Status: Completed
Dependencies: boto3, aiofiles, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL (all optional)

Single entrypoint: services/storage_service.py StorageService singleton
  upload_audio_bytes() → audio/{filename} → R2 or /storage/audio/
  upload_pdf_file() / upload_pdf_file_sync() → summaries/{filename} → R2 or /storage/summaries/
If R2 configured: boto3 S3 client → https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com
  retries=3, connect_timeout=5s, read_timeout=10s, region_name="auto"
All file writes must go through this service — never write audio/PDFs to disk directly


Feature 10:
Name: JWT + RBAC Authentication System
Purpose: Secure staff access with role-based routing; manager can create staff; admin manages all; credentials shown once
Status: Completed
Dependencies: core/security.py, core/guards.py, frontend AddStaffModal.jsx + CredentialsModal.jsx + ResetPasswordButton.jsx

Roles: teller | manager | supervisor | admin (admin/supervisor treated as super_admin in frontend routing)
JWT: HS256, 8-hour expiry, python-jose
Password hashing: bcrypt (plain password shown ONCE via CredentialsModal after creation — not stored or logged)
Staff creation flow: AddStaffModal → POST /staff/ → CredentialsModal (plain password shown once)
Password reset: ResetPasswordButton → POST /staff/{id}/reset-password → shows new plain password once



# ==========================================================
# USER FLOW
# ==========================================================

Flow:

Customer walks into UBI branch
→ Scans QR code or enters token number on Customer Panel kiosk (tablet/mobile)
→ Selects preferred language from 10-language grid (LanguageSelectPage with SpeechBubbleRobot animation)
→ Selects banking service from ServiceSelectionGrid (6 services: account opening, loan enquiry, KYC, card, balance, FD)
→ Backend sets intent_detected on Session, WebSocket session_connected broadcast fires
→ Staff logs into Staff Panel (JWT login, role-based routing)
→ Auto-greeting sent to customer in their language via TTS (triggered on both-sides-connected)
→ Customer speaks via MicControl (push-to-talk or hold-to-speak)
→ Float32 PCM chunks streamed via WebSocket binary frames → AudioStreamSession
→ Partial STT fires every 0.4s for live transcript preview on Staff Panel
→ stop_speaking → build_wav_snapshot() → full pipeline:
    STT → PII Masking → RAG retrieval → Groq LLM (7 outputs) → DB commit → WebSocket broadcast
→ Staff Panel updates: ConversationPanel (transcript), AISuggestionBox (suggestion), InfoBoard (entities),
    ProcessPanel step, SmartNavigator (next question), intent badge, sentiment badge, doc checklist
→ Staff approves / edits AI suggestion → backend translates → TTS generated (Sarvam Bulbul v3, cached in Redis)
→ Customer Panel: ConversationBubble animates in + TTS audio auto-plays in customer's language
→ Staff keyword detection: if "Aadhaar" / "PAN" / "account number" detected in staff response
    → input_request popup auto-fires on customer kiosk
→ Customer submits PII via popup → masked value forwarded to staff InfoBoard + saved to Session table columns
→ Customer confirms documents via DocumentChecklist → document_confirmed event
→ Steps marked complete via StepsTab → step_completed → step_updated broadcast
→ Staff or customer ends session → auto-farewell with verification time sent in customer's language
→ Bilingual PDF summary auto-generated (LLM → FPDF2 → R2/local)
→ session_ended broadcast → Customer sees SummaryPage (PDF download link)
→ Staff sees BilingualSummary modal → AnalyticsDaily table updated



# ==========================================================
# TECH STACK
# ==========================================================

Frontend:
- React 19.2.4 + Vite 8.0.x (build tool)
- Zustand 5.0.12 + Immer middleware (state management, persisted)
- React Router DOM 7.13.x (lazy-loaded page routing)
- Tailwind CSS 3.4.x (utility-first styling)
- Framer Motion 12.38.x (page transitions, component animations)
- Recharts 3.8.x (analytics charts — staff panel only)
- Lucide React (icon set)
- Axios 1.13.6 (HTTP client, interceptors for JWT 401 redirect)
- React Hot Toast 2.6.0 (toast notifications)
- Native WebSocket API (custom hooks with auto-reconnect)
- Native AudioWorklet API (Float32 PCM streaming from browser mic)

Backend:
- Python 3.11+
- FastAPI 0.111+ + Uvicorn 0.29 (async-first web framework)
- SQLAlchemy 2.0+ async ORM (asyncpg driver)
- Alembic 1.13+ (database migrations)
- python-jose + bcrypt (JWT + password hashing)
- httpx 0.27 (async HTTP for external AI API calls)
- ffmpeg (WebM/Opus → 16kHz mono WAV conversion, blob path only)
- ReportLab + FPDF2 (bilingual PDF generation)
- qrcode + Pillow (QR code generation for branch entry)
- boto3 (Cloudflare R2 S3-compatible object storage)
- aiofiles (async local file I/O)
- chromadb 0.5.3 (local persistent vector store for RAG)
- sentence-transformers 3.0.1 (intfloat/multilingual-e5-small + cross-encoder reranking)
- rank-bm25 0.2.2 (BM25Okapi in-memory keyword index)
- PyYAML (YAML front-matter parsing in knowledge base files)
- GZipMiddleware (60–80% bandwidth savings on JSON responses)

Database:
- PostgreSQL 15+ (primary relational store, 10 ORM tables, JSONB support for flexible metadata)
- Redis 7+ (TTS audio cache with 7-day TTL, staff online status, rate limiting state)

Authentication:
- JWT (HS256, 8-hour expiry, python-jose)
- bcrypt (Passlib, password hashing)
- RBAC via FastAPI Depends: teller | manager | supervisor | admin
- Customer Panel intentionally unauthenticated (public kiosk design)

AI/ML:
- Sarvam AI Saarika v2.5 — STT Primary (10 Indian languages)
- Groq Cloud Whisper Large-v3-Turbo — STT Fallback 1 (LPU-accelerated, ~0.8s)
- Reverie AI RevUp BFSI — STT Fallback 2 (banking-domain vocabulary tuned)
- Groq Llama-3.3-70b-versatile — LLM Primary (7-output single call, ~1s)
- Google Gemini 2.0 Flash — LLM Fallback (circuit breaker auto-failover)
- Sarvam AI Bulbul v3 (suhani voice) — TTS (10 Indian languages, 22050 Hz)
- intfloat/multilingual-e5-small — RAG embedding model (local, 117MB, multilingual)
- cross-encoder/ms-marco-MiniLM-L-6-v2 — RAG reranking model (local)
- faster-whisper-large-v3 — local Whisper weights in models/whisper/ (optional offline path, not yet activated)

Hosting:
- Netlify — Staff Panel (vaanibank-staff.netlify.app)
- Netlify — Customer Panel (vaanibank-customer.netlify.app)
- Render — FastAPI Backend
- Cloudflare R2 — Audio + PDF CDN storage (optional, graceful local fallback)



# ==========================================================
# FOLDER ARCHITECTURE
# ==========================================================

Frontend Structure (staff-panel/src/):

/pages
Purpose: All 8 full-page views — LoginPage, DashboardPage, HistoryPage, KnowledgePage, AnalyticsPage, SettingsPage, ManagerPage (manager role), AdminPage (admin role). All lazy-loaded via React.lazy()

/components/dashboard
Purpose: 6 live session panels — ConversationPanel, AISuggestionBox, ProcessPanel, InfoBoard, SmartNavigator, BilingualSummary

/components/dashboard/process-tabs
Purpose: 10 extracted tab components for ProcessPanel — StepsTab, DocsTab, EligibilityTab, InfoTab, NumbersTab, RatesTab, ComplianceTab, ProfileTab, SendTab, ActionsTab. Barrel exported via index.js

/components/layout
Purpose: App shell — Sidebar (role-aware nav), TopBar (session status + theme toggle), BottomBar (mobile nav)

/components/ui
Purpose: Reusable primitives — Modal, Button, Badge, Spinner, Toggle, AddStaffModal, CredentialsModal, ResetPasswordButton

/hooks
Purpose: useWebSocket.js (WS lifecycle + auto-reconnect + message routing), useAudio.js (recording + AudioWorklet PCM streaming + TTS audio playback queue)

/services
Purpose: api.js — Axios instance + all API call wrappers (login, sessions, STT pipeline, TTS, summaries, analytics, staffAPI CRUD)

/context
Purpose: AppContext.jsx — Zustand store with persist. Holds: auth, theme, session, WS status, conversationHistory, collectedInfo, processSteps, navigatorState, aiSuggestion, docReadiness, _hasHydrated flag

/utils
Purpose: managerUtils.jsx — StatCard, RoleBadge, StatusDot, ActionBadge components + CHART_COLORS, SENTIMENT_COLORS, date helpers (todayStr, daysAgoStr), formatters (fmtDuration, fmtDate, fmtDateTime). Single source for Manager + Admin page shared logic.

---

Frontend Structure (customer-panel/src/):

/pages
Purpose: LanguageSelectPage (10-language grid + SpeechBubbleRobot), WaitingPage (polling for staff), LiveSessionPage (MicControl + ConversationBubble + ServiceSelectionGrid), SummaryPage (bilingual summary + PDF download)

/components
Purpose: ConversationBubble (Framer Motion animated chat, audio wave, pending spinner), MicControl (push-to-talk/hold-to-speak, AudioWorklet, waveform), ServiceSelectionGrid (6 banking services, customer_service_selected WS event), DocumentChecklist (document confirmation, document_confirmed WS event), SpeechBubbleRobot (animated SVG robot, 11 floating speech bubbles)

/hooks
Purpose: useWebSocket.js (WS connection for customer role), useAudio.js (push-to-talk + PCM streaming + TTS auto-playback)

/services
Purpose: api.js — Axios instance + customer API wrappers (no auth required)

/context
Purpose: AppContext.jsx — Zustand store (theme, language, token, session state, demo mode flag)

---

Backend Structure (backend/):

/routers
Purpose: Thin FastAPI route handlers. auth.py (/auth/*), sessions.py (/sessions/* + WebSocket /ws/{token}), ai_pipeline.py (/stt/* /llm/* /tts/*), summary.py (/summary/* /process/* /analytics/* /branches/*), staff.py (/staff/* /admin/*), _pipeline_helpers.py (shared helpers)

/services
Purpose: Business logic layer. ai_service.py (AI singleton: STT→LLM→TTS), pipeline_orchestrator.py (full pipeline: STT→PII→RAG→LLM→DB→WS, single-commit), session_navigator.py (deterministic state machine, QUESTION_BANK 68 fields), pii_service.py (5-type PII masking), pdf_service.py (FPDF2 bilingual PDF), cbs_service.py (mock CBS), document_service.py (checklist builder), rag_service.py (ChromaDB + BM25 + reranking), storage_service.py (R2 + local fallback)

/websocket
Purpose: Real-time system. manager.py (ConnectionManager + broadcast helpers), connection.py (lifecycle mixin), handlers.py (all event routing mixin), audio_pipeline.py (PCM + STT + pipeline mixin), audio_streamer.py (AudioStreamSession dataclass, WAV builder), helpers.py (envelope + safe send)

/core
Purpose: Cross-cutting. security.py (JWT + bcrypt), guards.py (RBAC Depends), exceptions.py (12 custom exceptions + global handlers), language.py (LANG_CODE_TO_ATTR dict for DB column resolution)

/middleware
Purpose: rate_limit.py — sliding-window per-IP rate limiter (staff: 30/min, customer: 15/min, in-memory defaultdict)

/config
Purpose: document_registry.py (document requirements per intent), intent_guidance.yaml (per-intent LLM prompt strings)

/processes
Purpose: Banking process step JSON files (8 files: account_opening, personal_loan, home_loan, education_loan, vehicle_loan, fixed_deposit, cibil_info, default)

/knowledge_base
Purpose: Markdown source files for RAG ingestion (9 files across 7 categories with YAML front-matter)

/migrations
Purpose: Alembic migration versions for all 10 PostgreSQL tables

/models/whisper
Purpose: Local faster-whisper-large-v3 weights (optional offline STT path, not yet activated)

/fonts
Purpose: Noto font files for multilingual PDF (Devanagari, Tamil, Telugu, Kannada script rendering)

/storage
Purpose: Local fallback storage — audio/ (TTS wav files), summaries/ (PDF files), chroma_db/ (ChromaDB persistent vector store, auto-created on first RAG ingest)

/tests
Purpose: Unit tests — test_language_config.py, test_pii_service.py, test_pipeline_helpers.py, test_rate_limit.py



# ==========================================================
# DATABASE STRUCTURE
# ==========================================================

Table: Branch
Fields:
- id (PK, auto-increment)
- branch_code (UK, indexed)
- branch_name
- bank_name (default: "Union Bank of India")
- city, state, region, address, pincode
- is_active (boolean)
- created_at (timestamptz)

Table: StaffMember
Fields:
- id (PK)
- staff_id (UK, e.g. "UBI-NGP-001")
- username (UK)
- password_hash (bcrypt)
- full_name
- role (teller / manager / supervisor / admin)
- branch_id (FK → Branch)
- languages_known (JSONB array)
- is_active (boolean)
- last_login_at, created_at

Table: Session
Fields:
- id (PK)
- token_number (UK, indexed)
- branch_id (FK), staff_id (FK → StaffMember)
- customer_language, customer_language_code
- customer_account_number, customer_mobile_number, customer_name
- customer_pan, customer_dob, customer_aadhaar_last4
- customer_account_type, customer_kyc_status, customer_balance
- status (waiting / active / completed / abandoned)
- intent_detected, sentiment_overall
- entry_method (qr_scan / manual / walk_in)
- collected_data (JSONB — all AI-collected entities)
- pii_detected (boolean), pii_types_found (JSONB)
- total_exchanges, duration_seconds
- offline_mode, stt_model_used
- started_at, ended_at, created_at

Table: Exchange
Fields:
- id (PK)
- session_id (FK), exchange_number
- direction (customer_to_staff / staff_to_customer)
- customer_text_original, customer_text_translated
- staff_response_suggested, staff_response_final, staff_response_translated
- staff_audio_url
- stt_confidence, stt_model_used
- sentiment, intent
- pii_detected (boolean), pii_masked_text
- staff_used_suggestion (boolean)
- response_time_ms
- created_at
Index: (session_id, exchange_number)

Table: ProcessStep
Fields:
- id (PK)
- intent_type, step_number
- step_text_hindi, step_text_marathi, step_text_tamil, step_text_telugu
- step_text_bengali, step_text_kannada, step_text_odia, step_text_punjabi
- step_text_gujarati, step_text_malayalam (added via migration)
- speak_to_customer (boolean), is_active (boolean)
Constraint: UNIQUE(intent_type, step_number)

Table: SessionProcessTracking
Fields:
- id (PK)
- session_id (FK), step_id (FK → ProcessStep)
- status (pending / completed / skipped)
- completed_at
Note: rows lazy-inserted on first step_completed event (see handlers.py _handle_step_completed)

Table: BilingualSummary
Fields:
- id (PK)
- session_id (FK, unique — one-to-one with Session)
- customer_language
- summary_hindi, summary_customer_lang (JSONB)
- key_points_hindi, key_points_customer (JSONB)
- next_steps_hindi, next_steps_customer (JSONB)
- pdf_url, pdf_generated (boolean)
- whatsapp_sent (boolean), whatsapp_sent_at
- generated_at

Table: PIILog
Fields:
- id (PK)
- session_id (FK), exchange_id (FK → Exchange, nullable)
- pii_type (aadhaar / pan / account_number / phone / dob)
- masked_value
- detected_at

Table: AuditLog
Fields:
- id (PK)
- actor_id (FK → StaffMember), actor_staff_id, actor_name, actor_role
- action (login / logout / staff_created / branch_created / staff_deactivated / password_reset / pdf_downloaded)
- detail (text)
- target_id (FK → StaffMember), target_staff_id, target_name
- branch_id (FK), branch_code
- created_at (indexed)

Table: AnalyticsDaily
Fields:
- id (PK)
- branch_id (FK), date
- total_sessions, completed_sessions, abandoned_sessions
- avg_duration_seconds
- languages_used (JSONB), intents_breakdown (JSONB), sentiments_breakdown (JSONB)
- offline_sessions, pii_detected_count
- ai_suggestion_used, ai_suggestion_edited, ai_suggestion_ignored
- created_at, updated_at
Constraint: UNIQUE(branch_id, date)

Relationships:
  Branch → StaffMember (one-to-many)
  Branch → Session (one-to-many)
  Branch → AnalyticsDaily (one-to-many)
  StaffMember → Session (one-to-many)
  Session → Exchange (one-to-many, cascade delete)
  Session → SessionProcessTracking (one-to-many, cascade delete)
  Session → BilingualSummary (one-to-one, cascade delete)
  Session → PIILog (one-to-many, cascade delete)
  ProcessStep → SessionProcessTracking (one-to-many)
  Exchange → PIILog (one-to-many, cascade delete)



# ==========================================================
# API STRUCTURE
# ==========================================================

Route: POST /auth/login
Purpose: Authenticate staff member, return JWT access token
Input:  { "staff_id": "UBI-NGP-001", "password": "demo123" }
Output: { "access_token": "<jwt>", "token_type": "bearer", "staff": { "id", "username", "role", "branch_id" } }

---

Route: POST /stt/customer-transcribe
Purpose: Full AI pipeline — STT → PII Mask → RAG → LLM → DB commit → WebSocket broadcast
Input:  FormData: audio (WebM blob), session_token, language_code
Output: { "transcript": "...", "translation": "...", "intent": "loan_enquiry", "sentiment": "calm", "suggestion": "...", "entities": { "loan_type": "Home Loan" } }

---

Route: POST /tts/generate
Purpose: Generate TTS audio for staff-approved response; cache result in Redis; broadcast audio_ready to Customer Panel
Input:  { "text": "...", "language_code": "ta", "session_token": "..." }
Output: { "audio_url": "/audio/<filename>.wav", "cached": false }

---

Route: GET /summary/{session_id}/pdf
Purpose: Generate (if not exists) and return bilingual PDF summary for a completed session
Input:  session_id (path), Authorization: Bearer <jwt>
Output: PDF (application/pdf) or { "pdf_url": "https://..." }

---

Route: POST /sessions/
Purpose: Create a new session (token issued, QR or walk-in entry)
Input:  { "branch_id": 1, "entry_method": "qr_scan", "customer_language": "Tamil", "customer_language_code": "ta" }
Output: { "session_id": 12, "token_number": "T-0042", "status": "waiting" }

---

Route: POST /staff/
Purpose: Manager creates new teller or supervisor; auto-generates staff_id, username, random password
Input:  { "full_name": "...", "role": "teller", "languages_known": ["Hindi", "Marathi"] }
Output: { "staff": { ... }, "username": "...", "plain_password": "..." }  ← shown ONCE

---

Route: POST /staff/{staff_id}/reset-password
Purpose: Admin/manager resets staff password; returns new plain password shown once
Input:  Authorization: Bearer <jwt> (manager or admin role required)
Output: { "plain_password": "..." }

---

Route: WebSocket /ws/{token}
Purpose: Persistent bidirectional real-time channel — JSON events + binary PCM audio
Input:  WS handshake; JSON messages with event_type field; binary Float32 PCM frames
Output: JSON event envelope {type, data, timestamp} for all 12+ server-push event types:
  session_connected, peer_status, customer_speaking, transcription_partial,
  transcription_ready, ai_suggestion_ready, audio_ready, info_board_update,
  navigator_update, step_updated, pii_alert, input_request, input_received,
  doc_readiness_update, staff_message, session_ended, error, pong

---

Route: GET /analytics/branch/{branch_id}
Purpose: Return daily analytics summary for a branch (sessions, intents, sentiments, languages, suggestion rates)
Input:  branch_id (path), date_from / date_to (query params), Authorization: Bearer <jwt>
Output: { "days": [ { "date", "total_sessions", "languages_used", "intents_breakdown", "ai_suggestion_used" } ] }



# ==========================================================
# CURRENT PROJECT STATE
# ==========================================================

Completed:

- 3-Level STT Fallback Chain (Sarvam → Groq Whisper → Reverie BFSI)
- Streaming Audio Pipeline (AudioWorklet PCM → AudioStreamSession → partial STT → full pipeline)
- Structured LLM Pipeline with Gemini fallback + circuit breaker
- RAG Service (ChromaDB + multilingual-e5-small + BM25 + cross-encoder reranking)
- Knowledge Base (9 markdown files, 7 categories, YAML front-matter, ingest_kb.py CLI)
- Pre-LLM PII Masking (5 types, <1ms, RBI 2024 compliant, PIILog audit trail)
- Deterministic Session Navigator (7 intents, 68 fields, 6 phases, multilingual greetings/farewells)
- Real-Time WebSocket System (12+ event types, 4-mixin ConnectionManager)
- Auto-greeting + auto-farewell with TTS on both-sides-connected event
- Staff keyword detection → auto input_request popup on customer kiosk
- Staff Panel — all 6 live dashboard panels + 10 process tab components
- Staff Panel UI library (Modal, Button, Badge, Spinner, Toggle, AddStaffModal, CredentialsModal, ResetPasswordButton)
- Staff Panel shared utils (managerUtils.jsx — StatCard, RoleBadge, StatusDot, ActionBadge, CHART_COLORS, formatters)
- Customer Panel — LanguageSelectPage (SpeechBubbleRobot), WaitingPage, LiveSessionPage, SummaryPage
- Customer Panel components (ConversationBubble, MicControl, ServiceSelectionGrid, DocumentChecklist, SpeechBubbleRobot)
- Cloudflare R2 Storage Service with local filesystem fallback
- Bilingual PDF Summary (FPDF2 + Noto fonts, UBI branded, LLM-generated content, R2/local upload)
- JWT + RBAC Auth (4 roles, 8h expiry, AddStaffModal → CredentialsModal → password shown once flow)
- PostgreSQL schema — 10 tables + Alembic migrations
- migrate_add_gu_ml_columns.py — Gujarati + Malayalam step translation columns added
- Redis TTS caching (7-day TTL, ~40% hit rate in prod)
- Mock CBS service (deterministic hash-based customer profiles)
- 8 Banking Process JSON files (19 process steps, 10 languages)
- Sliding-window rate limiter (asymmetric: staff 30/min, customer 15/min)
- Seed data (3 branches, 3 demo staff, 19 process steps)
- Shared frontend constants (frontend/shared/constants.js)
- Unit tests (test_language_config, test_pii_service, test_pipeline_helpers, test_rate_limit)
- Live deployment (Netlify Staff + Customer panels, Render backend)

Working (In Progress):

- Bug fix: translated text sometimes not rendering in Customer Panel ConversationBubble
- WebSocket session persistence edge cases on rapid reconnects
- CSS layout refinements in Staff Dashboard column widths

Pending:

- Real CBS API integration (Finacle/BaNCS — requires bank-side OAuth2)
- TTS fallback engine (Google TTS or browser SpeechSynthesis)
- Redis Pub/Sub for horizontal WebSocket scaling (multi-instance backend)
- NER-based PII detection for verbal/contextual PII (current is regex-only)
- Field-level DB encryption + TTL-based PII auto-purge (production compliance)
- Offline STT: activate local faster-whisper via models/whisper/ (weights already downloaded)
- HttpOnly cookie migration for JWT (currently uses localStorage)
- Redis-backed rate limiter (replace in-memory defaultdict for multi-instance)

Blocked:

- Real CBS integration: requires UBI Finacle/BaNCS OAuth2 credentials — not available in hackathon



# ==========================================================
# KNOWN ISSUES
# ==========================================================

Issue 1:
Description: Translated customer-language text sometimes not appearing in ConversationBubble on Customer Panel after staff sends TTS response. staff_response_translated field is populated in DB but not reliably passed via WebSocket audio_ready payload.
Temporary solution: Customer Panel currently falls back to displaying staff_response_suggested (Hindi) if translated text is absent. Active fix in progress in websocket/handlers.py _handle_staff_response.

Issue 2:
Description: WebSocket race condition on rapid reconnects — if a customer reconnects within <500ms of disconnect, ConnectionManager may create a duplicate entry before the old one is cleaned up, causing duplicate broadcasts.
Temporary solution: Frontend useWebSocket.js has a 1-second reconnect debounce. Server-side fix pending in websocket/connection.py ConnectionMixin.disconnect().

Issue 3:
Description: TTS has no fallback engine — if Sarvam AI is down, audio_ready events are skipped and the customer panel shows no audio. Staff response text is still displayed.
Temporary solution: Staff panel shows response text even without audio. Full TTS fallback (Google TTS / browser SpeechSynthesis) is in the pending roadmap.

Issue 4:
Description: ChromaDB RAG store requires initial ingest via python ingest_kb.py before any retrieval works. If deployed on Render without running ingest, RAG returns empty results (graceful degradation — LLM continues without banking context).
Temporary solution: Auto-ingest on startup if ChromaDB collection is empty (implemented in rag_service.ensure_ready()). Manual re-ingest required after knowledge_base/*.md edits.



# ==========================================================
# DESIGN SYSTEM
# ==========================================================

Theme:
Union Bank of India Corporate + Modern Fintech Dashboard — trust-building, professional, clean

Primary Colors (BRAND from frontend/shared/constants.js):
  UBI Navy:        #003087 (primary brand, headers, sidebar)
  UBI Navy Dark:   #001a52
  UBI Navy Mid:    #1a4db5
  UBI Navy Light:  #e8eef8
  UBI Red:         #E8231A (accent, alerts, CTAs)
  UBI Red Dark:    #C41810
  UBI Red Light:   #FF4D45

Chart Colors (managerUtils.jsx CHART_COLORS):
  #003087, #E8231A, #16A34A, #D97706, #9333EA, #0891B2, #BE185D

Sentiment Colors:
  calm: #16A34A (green)
  confused: #D97706 (amber)
  frustrated: #DC2626 (red)
  urgent: #9333EA (purple)

Typography:
  Inter — all UI text
  Noto Sans Devanagari, Noto Sans Tamil, Noto Sans Telugu, Noto Sans Kannada — multilingual PDF and chat bubble script rendering

Spacing:
  8px grid system (Tailwind defaults: p-2=8px, p-4=16px, p-6=24px)

Animation Rules:
  Framer Motion: ConversationBubble spring entry (type:"spring", stiffness:300, damping:30), SpeechBubbleRobot 11-bubble float (keyframes: y oscillation, opacity fade), ServiceSelectionGrid item stagger, panel fade/slide transitions
  CSS: audio waveform bars, loader-spin keyframe (used before theme.css loads), mic pulse ring
  Target: all transitions ≤300ms — no heavy motion on banking/sensitive screens
  Mobile (Customer Panel): all tap targets minimum 48px, large readable text, portrait-first layout



# ==========================================================
# BUSINESS RULES
# ==========================================================

Rules:

- PII (Aadhaar, PAN, phone, DOB, account numbers) must be masked via pii_service.py BEFORE any text is sent to Groq, Gemini, or Sarvam — non-negotiable, runs even in tests
- Staff access to /sessions/*, /staff/*, /admin/*, /analytics/* requires valid JWT + role guard via FastAPI Depends
- Customer Panel is unauthenticated by design — session identified by token_number only; isolated from all staff endpoints
- Staff passwords must never be stored in plain text — bcrypt only; plain password shown exactly once via CredentialsModal, never logged
- Single-commit architecture: all DB mutations in pipeline_orchestrator.py must execute in one await db.commit() — no partial saves
- RAG context [BANKING KNOWLEDGE] block must be injected into every LLM call BEFORE the customer query — never skip
- Session navigator (session_navigator.py) must remain deterministic Python — never replace with LLM-based navigation
- WebSocket events must always use {type, data, timestamp} envelope format (_event() in websocket/helpers.py)
- New WebSocket event types must be added to WS_EVENTS in frontend/shared/constants.js
- SessionProcessTracking rows are lazy-inserted on first step_completed — do not pre-create in advance
- Session PII must be saved to both Session table columns AND collected_data JSONB (handlers.py _handle_input_submitted pattern)
- All file writes (audio, PDF) must go through storage_service.py — never write to disk directly
- core/language.py LANG_CODE_TO_ATTR is the single source for lang code → DB column resolution — never hardcode
- Staff keyword detection (_trigger_staff_input_if_needed) lives only in handlers.py — do not duplicate in routers or services
- Voice processing timeout: SILENCE_TIMEOUT_SEC=2.0 — auto-triggers stop_speaking fallback
- TTS cache TTL: 7 days in Redis (key: tts_cache:{md5 of text+lang})
- Staff suggestion accepted/edited/ignored must update AnalyticsDaily.ai_suggestion_* counts



# ==========================================================
# FUTURE ROADMAP
# ==========================================================

Priority 1 — Production Readiness:

- Real CBS API integration (Finacle/BaNCS with UBI OAuth2 credentials)
- TTS fallback engine (Google Cloud TTS or browser SpeechSynthesis when Sarvam is down)
- Field-level DB encryption for PII columns + TTL-based auto-purge (DPDP Act compliance)
- HttpOnly cookie migration for JWT (replace localStorage for XSS hardening)
- Redis-backed rate limiter (replace in-memory defaultdict for multi-instance backend)
- VAPT / security audit before production handover

Priority 2 — Scalability:

- Redis Pub/Sub for distributed WebSocket (horizontal backend scaling on Render)
- Multi-instance backend deployment with load balancing
- ChromaDB → Qdrant or Weaviate for distributed production RAG at scale
- Offline STT: activate local faster-whisper-large-v3 via models/whisper/ (weights already downloaded)

Priority 3 — AI and Feature Improvement:

- NER-based PII detection (spaCy or fine-tuned model) to catch verbal/contextual PII
- Fine-tuned intent classification per banking product
- Dialect handling (Vidarbha Marathi vs Pune Marathi; regional vocabulary)
- WhatsApp summary delivery integration (SendTab in ProcessPanel)
- Case management + FIR/FIU report generation post-session
- Multi-branch real-time analytics for regional managers
- Expand knowledge_base/ with more UBI products, Pradhan Mantri schemes, and RBI circulars
- Customer satisfaction feedback collection at SummaryPage



# ==========================================================
# IMPORTANT NOTES FOR AI
# ==========================================================

Read this file before analyzing code.

Critical architecture rules:

- Routers call services. Services call AI APIs. Never call ai_service, rag_service, or pipeline_orchestrator directly from routers.
- pipeline_orchestrator.py, ai_service.py, and websocket/manager.py are critical-path stable files. Explain changes BEFORE implementing. Do not refactor unnecessarily.
- PII masking (pii_service.py) runs BEFORE every LLM call — even in tests. This is non-negotiable.
- The session navigator (session_navigator.py) is intentionally deterministic Python — do not replace with LLM navigation.
- RAG context must always be injected as [BANKING KNOWLEDGE] before the customer query in LLM prompts.
- WebSocket _event() envelope (websocket/helpers.py) is mandatory for all WS payloads — {type, data, timestamp}.
- SessionProcessTracking rows are lazy-inserted — check _handle_step_completed in handlers.py before modifying step logic.
- Session PII saved to BOTH Session table columns AND collected_data JSONB — always maintain both (handlers.py _handle_input_submitted pattern).
- storage_service.py is the ONLY allowed path for all audio/PDF file writes — never write directly to disk.
- core/language.py LANG_CODE_TO_ATTR is the single source for lang_code → step_text_* column resolution — use it everywhere.
- Staff Panel and Customer Panel are separate Vite projects on separate ports — do not merge them.
- New page components go in /pages/. New reusable UI primitives go in /components/ui/. New dashboard panels go in /components/dashboard/.
- Shared Manager+Admin logic belongs in utils/managerUtils.jsx — not duplicated across pages.
- After editing any knowledge_base/*.md file, run: python ingest_kb.py (or --force to re-embed all).
- All new staff-facing endpoints must use RBAC dependency injection (get_current_staff or require_role from core/guards.py).
- Demo credentials (auto-seeded on startup): teller → demo/demo123, manager → manager123, admin → admin123.
- Backend API: localhost:8000 | Staff Panel: localhost:5173 | Customer Panel: localhost:5174
