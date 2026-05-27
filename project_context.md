# PROJECT_CONTEXT.md

# ==========================================================

# BASIC INFORMATION

# ==========================================================

Project Name:
VaaniBank AI

Version:
v1.0

Project Type:
Web App / AI Product

Current Status:
Development (POC Complete, Deployed on Netlify + Render)

Created By:
Team Vectora — iDEA 2.0 PSBs Hackathon 2026 | Union Bank of India | Problem Statement 6

# ==========================================================

# PROJECT DESCRIPTION

# ==========================================================

Short Description:

VaaniBank AI is a real-time, multilingual Gen-AI voice assistant for Union Bank of India's
frontline branch staff. It enables any teller to serve walk-in customers speaking any of 10
Indian languages via live speech-to-text, AI translation, intent detection, process guidance,
and text-to-speech responses — all bridged through a dual-panel React interface.

Detailed Description:

The system solves the language barrier between frontline PSB bank staff and rural/semi-urban
walk-in customers. A customer speaks in their native language (Tamil, Odia, Marathi, etc.)
into a Customer Panel kiosk. VaaniBank AI transcribes the speech via a 3-level STT fallback
chain, masks PII per RBI 2024 guidelines, runs the text through a structured LLM pipeline
(Groq Llama-3.3-70b + Gemini 2.0 Flash fallback), and broadcasts the result over WebSocket
to the Staff Panel. The staff sees a real-time bilingual conversation, AI-generated response
suggestions, collected entity data, banking process steps, and a document readiness score.
Staff-approved responses are converted to TTS (Sarvam Bulbul v3) and auto-played in the
customer's language. Post-session, a bilingual branded PDF summary is generated for records.

# ==========================================================

# PROBLEM STATEMENT

# ==========================================================

Problems being solved:

1. Language Barrier at Bank Counters
   Description:
   India's 1.5 lakh+ bank branch counters serve 400M+ walk-in customers annually.
   Frontline staff typically speak 1-2 languages while customers speak 10+ Indian languages.
   A teller who speaks only Hindi cannot serve a Tamil or Odia-speaking customer without
   a human translator — causing service denials, data entry errors, and customer abandonment.

2. No Banking-Domain AI at the Counter
   Description:
   Existing solutions (Google Translate, generic chatbots, IVR) are not designed for
   in-branch banking conversations. They mistranslate financial jargon (CIBIL, KYC, NEFT),
   lack process guidance, and cannot handle voice input from semi-literate customers.

3. Compliance & Data Entry Risk
   Description:
   Miscommunication between staff and customers leads to incorrect KYC documents, wrong
   loan applications, and regulatory risk. There is no structured way to collect, validate,
   and record customer data during a multilingual branch interaction in real time.

# ==========================================================

# SOLUTION APPROACH

# ==========================================================

The project solves problems by:

- 3-Level STT Fallback Chain: Sarvam Saarika v2.5 → Groq Whisper Large-v3-Turbo → Reverie RevUp BFSI ensures transcription never fails across 10 Indian languages
- Single-Call LLM Pipeline: One Groq Llama-3.3-70b call produces 7 structured outputs simultaneously — translation, intent, sentiment, suggestion, entity extraction, customer-language response, conversation stage
- RAG-Augmented LLM: ChromaDB + multilingual-e5-small embeddings + BM25 hybrid retrieval with cross-encoder reranking feeds authoritative banking knowledge into the LLM context before each response
- Deterministic Session Navigator: Pure-code state machine (not LLM) handles phase detection and next-question ordering so the system never repeats a collected field and never hallucinates process steps
- SaralForm — Pre-filled Digital Signing: Post-session digital form pre-filled from AI-collected data, allowing customer review and digital signature on kiosk, eliminating manual teller data entry
- Pre-LLM PII Masking: Regex-based Aadhaar, PAN, phone, DOB masking before any text leaves the system boundary (RBI 2024 compliant)
- Real-Time WebSocket System: Sub-50ms updates across 12+ event types connecting Customer Panel ↔ Backend ↔ Staff Panel
- Streaming Audio Pipeline: Raw Float32 PCM chunks streamed from AudioWorklet → server-side WAV assembly → partial STT + final full pipeline
- Cloudflare R2 Storage: Audio files and PDF summaries uploaded to R2 CDN (falls back to local filesystem if unconfigured)
- Bilingual PDF Summary: Post-session FPDF2 + Noto fonts A4 document in Hindi + customer's native language for branch records

# ==========================================================

# TARGET USERS

# ==========================================================

Primary Users:

- Frontline bank staff (tellers, relationship managers) at Union Bank of India branches
- Branch managers and supervisors overseeing daily counter operations

Secondary Users:

- Walk-in bank customers speaking regional Indian languages (Tamil, Marathi, Telugu, Bengali, Kannada, Odia, Punjabi, Gujarati, Malayalam, Hindi)
- Bank admins managing staff, branches, and analytics

Pain Points:

- Teller cannot communicate with customer speaking a different Indian language
- No structured guidance for complex banking processes (loan enquiry, account opening, KYC) during live interaction
- Manual, error-prone data collection during multilingual customer conversations
- No compliance record of what was said and what documents were requested

# ==========================================================

# BUSINESS REQUIREMENTS

# ==========================================================

Requirements:

- Support 10 Indian languages end-to-end (STT + translation + TTS + navigator)
- Real-time (<4s end-to-end) pipeline: customer speaks → staff sees translation + AI suggestion
- PII masking must occur before data reaches any external LLM API (RBI 2024 mandate)
- Staff panel must show live conversation, intent, sentiment, process steps, and collected data
- Post-session bilingual PDF summary must be auto-generated for branch records
- Role-based access: Teller, Manager, Supervisor, Admin
- Knowledge base (RAG) must provide grounded, factual banking answers — no LLM hallucination on product facts

Constraints:

- All external AI APIs require internet — no offline STT available in current POC
- Single-server WebSocket (in-memory ConnectionManager) — not horizontally scalable yet
- CBS integration is simulated (deterministic hash-based profiles) — real Finacle/BaNCS requires bank-side OAuth2
- TTS has no fallback — if Sarvam is down, TTS fails gracefully (no backup TTS engine)
- ChromaDB RAG store requires initial ingest via ingest_kb.py before retrieval works

# ==========================================================

# CORE FEATURES

# ==========================================================

Feature Name:
3-Level STT Fallback Chain + Streaming Audio Pipeline

Purpose:
Ensure speech transcription never fails; support both push-to-talk blob upload AND streaming PCM

Inputs:

- Blob mode: audio file (WebM/Opus) POST to /stt/customer-transcribe
- Streaming mode: raw Float32 PCM binary WebSocket frames from AudioWorklet

Processing:
Streaming path (websocket/audio_pipeline.py + audio_streamer.py):

- AudioStreamSession accumulates PCM chunks in memory
- Partial STT fires every 0.4s (rate-limited) for live transcript preview
- stop_speaking event triggers build_wav_snapshot() → pure-Python Float32→int16 WAV conversion → full pipeline
- MIN_BYTES_FOR_STT = 32,000 bytes (~0.5s audio) before STT is attempted
  STT chain (services/ai_service.py):
- Primary: Sarvam AI Saarika v2.5 (~1.2s, 0.85 confidence)
- Fallback 1: Groq Cloud Whisper Large-v3-Turbo (~0.8s, 0.90 confidence)
- Fallback 2: Reverie AI RevUp BFSI (~1.5s, banking-domain tuned)
  ffmpeg: converts WebM/Opus → 16kHz mono WAV (blob path only; streaming path uses pure Python)

Outputs:
Transcript string + detected language + STT model used + confidence score → pipeline_orchestrator.py

Status:
Completed

Dependencies:
SARVAM_API_KEY, GROQ_API_KEY, REVERIE_APP_ID, REVERIE_API_KEY, ffmpeg (blob path), websocket/audio_streamer.py

Feature Name:
RAG Service (Retrieval-Augmented Generation)

Purpose:
Provide grounded banking knowledge to the LLM — prevents hallucination on product facts, rates, compliance rules

Inputs:
Customer query text + pre-detected intent + optional product name

Processing:
Architecture: ChromaDB (local vector store) + BM25 hybrid retrieval → RRF merge → cross-encoder rerank → top-4 chunks
Embedding model: intfloat/multilingual-e5-small (117MB, supports all 10 Indian languages)
Reranking model: cross-encoder/ms-marco-MiniLM-L-6-v2
BM25: in-memory BM25Okapi index rebuilt at startup from ChromaDB for exact banking term matching (CIBIL, NEFT, PMJDY)
Retrieval params: DENSE_CANDIDATES=15, BM25_CANDIDATES=15, RRF_K=60, FINAL_TOP_K=4
MIN_SCORE_THRESHOLD=0.10 — low-confidence chunks dropped
Query rewriting: short follow-up queries (< 6 words) rewritten to standalone via Groq LLM
Context injected into LLM as [BANKING KNOWLEDGE] block before customer query
Auto-ingestion: if ChromaDB collection is empty on startup, ingest_kb.py logic runs automatically
Knowledge base structure:
knowledge_base/compliance/rbi_rules.md
knowledge_base/loans/home_loan.md, personal_loan.md
knowledge_base/products/fixed_deposit.md, savings_account.md
knowledge_base/glossary/banking_glossary.md
knowledge_base/kyc/kyc_update.md
knowledge_base/processes/account_opening_sop.md, loan_application_sop.md
knowledge_base/scripts/staff_response_scripts.md
All markdown files use YAML front-matter: intent, product, doc_type, language, source_file
Chunking strategies: H2-section split (faq/compliance/glossary), Step N: split (sop), paragraph split (default)
Graceful degradation: if chromadb/sentence-transformers/rank-bm25 not installed → returns empty result, pipeline continues without RAG

Outputs:
RetrievalResult (chunks[], query_used, retrieval_source, total_retrieved) → formatted as [BANKING KNOWLEDGE] block injected into LLM

Status:
Completed

Dependencies:
chromadb, sentence-transformers, rank-bm25, services/rag_service.py, knowledge_base/, storage/chroma_db/ (auto-created)

Feature Name:
Structured LLM Pipeline (14-Output Single Call)

Purpose:
Extract maximum intelligence from each customer utterance in one LLM call while maintaining progression

Inputs:
PII-masked transcript + RAG context block + last 10 exchanges (via llm_utils) + [SYSTEM CONTEXT] (collected_info) + [SYSTEM STATE] (dashboard view)

Processing:

- Primary LLM: Groq Llama-3.3-70b-versatile
- Fallback LLM: Google Gemini 2.0 Flash (circuit breaker — opens after 3 failures, resets after 30s)
- Loop Prevention (Strict): Never repeats suggestions twice, moves forward if confirmation received, checks [SYSTEM STATE] for 'NEXT field to ask'.
- System State Awareness: Suggested responses align with dashboard readiness score, info completion, and current process phase.
- Intent Mapping: Fast keyword pre-detection (llm_utils) + precise LLM intent classification (7 types).
- Returns 14 structured fields: translation, intent, intent_confidence, sentiment, sentiment_score, conversation_stage, suggested_response_hindi, suggested_response_customer_lang, banking_terms_detected, process_triggered, collected_info, next_question_hindi, next_question_customer_lang, auto_step_completed.

Outputs:
14 structured fields used to update Staff Panel, InfoBoard, Navigator, and DB

Status:
Completed

Dependencies:
GROQ_API_KEY, GEMINI_API_KEY, services/ai_service.py, services/pipeline_orchestrator.py, services/llm_utils.py

Feature Name:
Pre-LLM PII Masking

Purpose:
RBI 2024 compliant — sensitive customer data never reaches external LLM APIs

Inputs:
Raw transcript text

Processing:
Compiled regex patterns for: Aadhaar (12-digit), PAN (ABCDE1234F format), phone (10-digit),
account numbers (context-keyword gated), DOB (DD/MM/YYYY).
Masking formats: \***\* \*\*** {last4} for Aadhaar, **\***{last5} for PAN, **\*\***{last4} for phone

Outputs:
Masked transcript + PIILog entries (pii_type, masked_value) saved to DB

Status:
Completed

Dependencies:
services/pii_service.py, PIILog ORM model

Feature Name:
Deterministic Session Navigator

Purpose:
State-first process guidance — phase detection, next-question ordering, zero LLM hallucination in navigation

Inputs:
collected_info dict + current intent + exchange history

Processing:
Pure-Python state machine. 6 phases: Greet → Educate → Collect → Verify → Process → Close.
Priority-ordered QUESTION_BANK (7 intents × 4–12 fields = 68 field definitions).
Never asks a field already present in collected_info.
Two-phase conversation intelligence: exploring (educate) vs ready_to_apply (collect data).
GREETING_MULTILINGUAL and FAREWELL_MULTILINGUAL dicts: greetings/farewells in all 10 languages
VERIFICATION_TIME_MAP: per-intent processing time messages in all 10 languages + English

Outputs:
next_question, current_phase, progress_percentage, phase_label — broadcast via WebSocket navigator_update event

Status:
Completed

Dependencies:
services/session_navigator.py, QUESTION_BANK definitions

Feature Name:
Real-Time WebSocket System — Connection + Message Routing

Purpose:
Sub-50ms bidirectional communication; full lifecycle management for connect/disconnect/reconnect

Inputs:
WebSocket connections at /ws/{token} + binary PCM audio frames + JSON event messages

Processing:
websocket/manager.py — ConnectionManager (composed of 4 mixins):
connection.py (ConnectionMixin) — connect/disconnect lifecycle, peer notifications, staff reconnect replay, auto-greeting, auto-farewell
handlers.py (HandlersMixin) — routes all staff + customer JSON events: staff_approved_response, staff_edited_response, step_completed, end_session, trigger_input_request, submit_verification, customer_service_selected, input_submitted, document_confirmed, demo_customer_message
audio_pipeline.py (AudioPipelineMixin) — start_speaking/stop_speaking, PCM chunk handling, partial STT, final pipeline trigger, session summary generation
helpers.py — \_event() envelope builder, \_safe_send(), \_now_iso()
12+ event types routed by event_type field on every payload
Staff keyword detection: \_trigger_staff_input_if_needed() detects PII-request keywords (aadhaar, PAN, account number, DOB, mobile, IFSC) in staff text and auto-fires input_request popup to customer

Outputs:
JSON event payloads to correct panel connection (staff or customer)

Status:
Completed

Dependencies:
websocket/manager.py, websocket/connection.py, websocket/handlers.py, websocket/audio_pipeline.py, websocket/audio_streamer.py, websocket/helpers.py

Feature Name:
Cloudflare R2 Storage Service

Purpose:
Cloud object storage for audio files and PDF summaries; local filesystem fallback

Inputs:
Audio bytes (WAV) or PDF file path + filename

Processing:
services/storage_service.py — StorageService singleton
If R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME set → boto3 S3 client targeting https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com
Audio stored under key audio/{filename}, PDFs under summaries/{filename}
Public URL: R2_PUBLIC_URL/{key}
Local delete after successful R2 upload (PDF); audio files deleted after upload
If R2 unconfigured → saves to local storage/audio/ or storage/summaries/; returns /audio/{filename} or /summaries/{filename}
boto3 config: retries=3, connect_timeout=5s, read_timeout=10s, region_name="auto"

Outputs:
Public URL string (R2 CDN or local static path)

Status:
Completed

Dependencies:
boto3, aiofiles, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL env vars (all optional — graceful local fallback)

Feature Name:
SaralForm — Pre-filled Digital Signing

Purpose:
Eliminate manual teller data entry by allowing customers to review and sign AI-collected data digitally

Inputs:

- Session.collected_data (AI-extracted entities)
- Customer signature (HTML5 canvas data URL)
- Verified field edits from customer

Processing:

- Auto-mapping: AI-collected entities (name, income, Aadhaar, etc.) mapped to banking form fields (A-101, LA-201, etc.)
- Bilingual Display: Field labels shown in English and customer's native language (10 languages supported)
- HTML5 Canvas: Smooth signature capture with stroke-smoothing and multi-touch support
- POST /forms/submit: Merges customer-edited fields back to Session.collected_data, saves signature PNG, updates form_signed_at
- WebSocket Broadcast: Fires form_signed event to Staff Panel with signature download link

Outputs:

- form_signed_at timestamp in Session table
- Signature PNG at storage/signatures/{token}.png
- Real-time "Form Signed ✅" notification on Staff Panel

Status:
Completed

Dependencies:
frontend/customer-panel/src/pages/SaralFormPage.jsx, backend/routers/forms.py, SIGNATURE_STORAGE_PATH

Feature Name:
Bilingual PDF Summary

Purpose:
Post-session branded A4 document for branch records in Hindi + customer's native language

Inputs:
Session data (exchanges, collected_info, intent, sentiment, process steps, PII flags)

Processing:
FPDF2 + Noto fonts (Devanagari, Tamil, Telugu, Kannada) for real Unicode script rendering.
UBI color scheme (navy #003087, red #E8231A). Two-column layout.
Sections: meta cards, intent/sentiment badges, PII alert bar, key points, summary, next steps, compliance footer.
LLM generates summary JSON (summary_hindi, summary_customer_lang, key_points_hindi, key_points_customer, next_steps_hindi, next_steps_customer) before PDF creation.
PDF uploaded to Cloudflare R2 (or saved locally) via storage_service.

Outputs:
PDF file at storage/summaries/ (or R2), URL stored in BilingualSummary table, downloadable via Staff Panel

Status:
Completed

Dependencies:
services/pdf_service.py, FPDF2, Noto font files (backend/fonts/), services/storage_service.py

Feature Name:
Staff Dashboard (6 Live Panels + 10 Process Tabs)

Purpose:
Central operational screen for frontline staff during a live customer session

Inputs:
WebSocket events from backend (all 12+ types)

Processing:
ConversationPanel — bilingual transcript + sentiment badges
AISuggestionBox — approve/edit/discard AI response + trigger TTS
InfoBoard — collected entity data with completion percentage
ProcessPanel — gamified RBI step checklist with 10 extracted tab components:
StepsTab, DocsTab, EligibilityTab, InfoTab, NumbersTab, RatesTab,
ComplianceTab, ProfileTab, SendTab, ActionsTab (process-tabs/ barrel export)
SmartNavigator — current phase, progress bar, next question
BilingualSummary — post-session PDF viewer

Outputs:
Staff takes action (approve suggestion → TTS plays for customer)

Status:
Completed

Dependencies:
React 19, Zustand, Framer Motion, Recharts, useWebSocket.js, useAudio.js, components/dashboard/process-tabs/

Feature Name:
Staff UI Component Library

Purpose:
Reusable UI components shared across Staff Panel pages

Components:
ui/Modal.jsx — base modal wrapper with backdrop, close button, footer slot
ui/Button.jsx — primary/secondary/ghost variants with loading state and icon support
ui/Badge.jsx — colored status/sentiment badges
ui/Spinner.jsx — loading spinner
ui/Toggle.jsx — toggle switch
ui/AddStaffModal.jsx — manager creates new teller/supervisor; shows role + language selector; on success triggers CredentialsModal
ui/CredentialsModal.jsx — shows generated username + password ONCE after staff creation (plain password not recoverable)
ui/ResetPasswordButton.jsx — admin/manager reset password, shows new credentials once

Status:
Completed

Dependencies:
staffAPI from services/api.js, LANGUAGES and STAFF_ROLES from constants.js

Feature Name:
Shared Utilities (managerUtils.jsx)

Purpose:
Single source of truth for Manager and Admin page shared logic — no duplication

Contents:
CHART_COLORS array, SENTIMENT_COLORS map
todayStr(), daysAgoStr(n) — date helpers
fmtDuration(s), fmtDate(v), fmtDateTime(v) — formatters
StatCard component — metric card used in Manager + Admin panels
RoleBadge component — teller/supervisor/manager/admin colored pill
StatusDot component — Active/Inactive indicator
ActionBadge component — colored badge for audit log action types

Status:
Completed

Dependencies:
frontend/staff-panel/src/utils/managerUtils.jsx

Feature Name:
Customer Panel Components

Purpose:
Mobile-first kiosk UI components for the customer-facing panel

Components:
ConversationBubble.jsx — animated chat bubble with staff/customer styles, audio wave indicator, pending spinner, Framer Motion spring animations
MicControl.jsx — push-to-talk mic button; dual touch+mouse event handling (passive:false touchstart/touchend); Framer Motion; hold-to-record OR tap-to-toggle; audio level bar; waveform visualizer
ServiceSelectionGrid.jsx — 6-service grid (account_opening, loan_enquiry, kyc_update, card_services, balance_enquiry, fixed_deposit) with icons from lucide-react; sends customer_service_selected WS event; "Skip — Go to Live Help" shortcut
DocumentChecklist.jsx — required documents per banking intent with checkboxes; sends document_confirmed WS event
SpeechBubbleRobot.jsx — animated SVG robot character for LanguageSelectPage; 11 floating speech bubbles (blue stats, red urgency, outline language tags); Framer Motion float animations; scales for mobile (0.72x)

Status:
Completed

Dependencies:
Framer Motion, lucide-react, constants.js (BRAND, SERVICES)

# ==========================================================

# USER JOURNEY

# ==========================================================

Main User Flow:

Customer walks into UBI branch
→ Scans QR code or enters token number on Customer Panel (tablet/kiosk)
→ Selects preferred language from 10-language grid (SpeechBubbleRobot on LanguageSelectPage)
→ Selects banking service from ServiceSelectionGrid (6 services)
→ Backend updates intent_detected in Session table
→ Staff logs in to Staff Panel (JWT auth) — sees customer connected
→ Auto-greeting sent to customer in their language (TTS + text) when both sides connect
→ Customer speaks in native language (MicControl push-to-talk or hold-to-speak)
→ Streaming: Float32 PCM chunks sent via WebSocket binary frames
→ Backend: AudioStreamSession assembles WAV → partial STT → final pipeline on stop_speaking
→ Pipeline: STT → PII Mask → RAG retrieval → LLM (7 outputs) → DB commit → WebSocket broadcast
→ Staff Panel: sees transcript (original + Hindi), AI suggestion, intent badge, sentiment badge, process step, document checklist, InfoBoard update, navigator update
→ Staff approves / edits suggestion → Backend translates (DB step text → LLM fallback) → TTS generation
→ Customer Panel: ConversationBubble appears + auto-plays TTS audio in customer's language
→ Staff keyword detection: if staff says "Aadhaar" / "PAN" / "account number" → input_request popup appears on customer kiosk
→ Customer submits PII via popup → masked value forwarded to staff InfoBoard
→ Customer can confirm documents via DocumentChecklist → document_confirmed event to staff
→ Process steps marked completed via step_completed events → step_updated broadcast
→ Session ends (staff or customer triggers end_session) → auto-farewell + verification time sent to customer
→ SaralForm appears on customer kiosk → AI-collected data pre-filled for review
→ Customer reviews/edits fields + draws signature on canvas → POST /forms/submit
→ Staff Panel: sees "Form Signed ✅" notification + signature download button
→ Bilingual PDF summary generated (LLM summary → FPDF2 → R2 or local)
→ session_ended broadcast → Customer sees SummaryPage → Staff sees BilingualSummary modal
→ Analytics updated in AnalyticsDaily table

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
- ffmpeg (WebM/Opus → 16kHz mono WAV conversion — blob path)
- ReportLab + FPDF2 (bilingual PDF generation)
- qrcode + Pillow (QR code generation)
- boto3 (Cloudflare R2 S3-compatible object storage)
- aiofiles (async file I/O)
- chromadb (local persistent vector store for RAG)
- sentence-transformers (intfloat/multilingual-e5-small embedding + cross-encoder reranking)
- rank-bm25 (BM25Okapi in-memory keyword index)
- PyYAML (YAML front-matter parsing in knowledge base files)

Database:

- PostgreSQL 15+ (primary relational store, 10 ORM tables, JSONB support)
- Redis 7+ (TTS cache with 7-day TTL, staff online status)

Authentication:

- JWT (HS256, 8h expiry, python-jose)
- bcrypt (password hashing)
- RBAC: Teller, Manager, Supervisor, Admin roles

AI/ML:

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
- Local Storage Mounts: /audio, /summaries, /storage/signatures (SaralForm)

External APIs:

- Sarvam AI (STT + TTS)
- Groq Cloud (Whisper STT + Llama LLM)
- Reverie AI RevUp BFSI (STT fallback)
- Google Gemini 2.0 Flash (LLM fallback)

# ==========================================================

# PROJECT STRUCTURE

# ==========================================================

Backend (backend/):

Root files:
main.py — FastAPI app entry, lifespan, CORS, router mounts
config.py — Pydantic BaseSettings, all env var loading (including R2 credentials)
database.py — Async SQLAlchemy engine + Redis client
models.py — 10 SQLAlchemy ORM models
schemas.py — 50+ Pydantic v2 request/response schemas
seed_data.py — Database seeder (3 branches, 3 staff, 19 process steps, 8 languages)
intent_engine.py — Intent classification engine
language_config.py — Language code mappings and configuration
process_loader.py — Banking process step loader from JSON files
ingest_kb.py — CLI script to parse/chunk/embed all knowledge_base/\*.md into ChromaDB
migrate_add_gu_ml_columns.py — One-time migration: adds step_text_gujarati + step_text_malayalam columns to process_steps table
alembic.ini — DB migration config
requirements.txt — Python dependencies
render.yaml — Render.com deployment blueprint
Procfile — Process runner config
build.sh — Production build script

/routers
Purpose: FastAPI route handlers
auth.py — /auth/_ (login, logout, refresh, me)
sessions.py — /sessions/_ CRUD + WebSocket /ws/{token}
ai*pipeline.py — /stt/*, /llm/_, /tts/_ endpoints
summary.py — /summary/_, /process/_, /analytics/\_, /branches/\*/qr
staff.py — Staff management, password reset, credentials
forms.py — /forms/\* (SaralForm submission + signature download)
\_pipeline_helpers.py — Shared AI pipeline utility functions

/services
Purpose: Business logic layer
ai_service.py — Core AI singleton: STT→LLM→TTS orchestration, translate_text()
llm_utils.py — Shared LLM helpers: conversation history building, keyword intent pre-detection
pipeline_orchestrator.py — Full pipeline: STT→PII→RAG→LLM→DB→WS (single-commit)
session_navigator.py — Deterministic state machine, GREETING_MULTILINGUAL, FAREWELL_MULTILINGUAL, VERIFICATION_TIME_MAP, QUESTION_BANK (68 fields)
pii_service.py — Regex PII detection & masking (5 types, RBI 2024 format)
pdf_service.py — FPDF2 bilingual PDF generator (UBI branded, Noto fonts)
cbs_service.py — Mock Core Banking System (deterministic hash-based profiles)
document_service.py — Document readiness scoring + build_checklist() per intent
rag_service.py — RAG: ChromaDB + multilingual-e5-small + BM25 + cross-encoder; ingest_knowledge_base(), retrieve(), rewrite_query(), format_context_for_llm()
storage_service.py — Cloudflare R2 upload (boto3) with local filesystem fallback; upload_audio_bytes(), upload_pdf_file(), upload_pdf_file_sync()

/websocket
Purpose: Real-time WebSocket system (ConnectionManager composed of 4 mixins)
manager.py — ConnectionManager class, broadcast helpers (send_to_staff, send_to_customer, broadcast_audio, broadcast_step_update, broadcast_session_ended, broadcast_input_request)
connection.py — ConnectionMixin: connect/disconnect lifecycle, peer notifications, staff reconnect + exchange replay, auto-greeting (\_send_auto_greeting), auto-farewell (\_send_auto_farewell with VERIFICATION_TIME_MAP)
handlers.py — HandlersMixin: all staff/customer JSON event routing, \_handle_staff_response (DB lang lookup → step text → LLM fallback translate → TTS → DB persist), \_handle_step_completed (lazy-insert tracking), \_handle_end_session, \_handle_input_submitted (PII field save + InfoBoard sync), \_handle_document_confirmed, handle_demo_message, \_trigger_staff_input_if_needed (keyword map for auto input popups), \_update_suggestion_analytics
audio_pipeline.py — AudioPipelineMixin: \_handle_start_speaking, handle_customer_audio_chunk, \_run_partial_stt, \_handle_stop_speaking, \_run_final_pipeline, \_generate_session_summary (LLM + PDF)
audio_streamer.py — AudioStreamSession dataclass (PCM buffer, VAD, rate-limiting); float32_bytes_to_wav(); PCM_SAMPLE_RATE=16000, PARTIAL_INTERVAL_SEC=0.4, SILENCE_TIMEOUT_SEC=2.0
helpers.py — \_event(), \_safe_send(), \_now_iso()

/core
Purpose: Security and cross-cutting concerns
security.py — JWT creation/validation, bcrypt, RBAC FastAPI dependencies
guards.py — Route guard utilities (require_role)
exceptions.py — 12 custom exceptions + global error handlers
language.py — LANG_CODE_TO_ATTR dict, lang_code_to_attr() for DB column resolution

/middleware
Purpose: Request-level middleware
rate_limit.py — Sliding-window per-IP rate limiter (staff: 30/min, customer: 15/min, in-memory defaultdict)

/config
Purpose: Externalized configuration
document_registry.py — Banking document requirements per intent (used by document_service.py)
intent_guidance.yaml — Per-intent LLM prompt guidance strings (cached on first load)

/processes
Purpose: Banking process step JSON definitions
account_opening.json, personal_loan.json, home_loan.json, education_loan.json,
vehicle_loan.json, fixed_deposit.json, cibil_info.json, default.json

/knowledge_base
Purpose: Markdown knowledge base for RAG ingestion
compliance/rbi_rules.md
loans/home_loan.md, personal_loan.md
products/fixed_deposit.md, savings_account.md
glossary/banking_glossary.md
kyc/kyc_update.md
processes/account_opening_sop.md, loan_application_sop.md
scripts/staff_response_scripts.md
All files use YAML front-matter: intent, product, doc_type, language, source_file

/models/whisper
Purpose: Local faster-whisper-large-v3 model weights (optional offline STT path)

/fonts
Purpose: Noto font files for multilingual PDF rendering (Devanagari, Tamil, Telugu, Kannada scripts)

/migrations
Purpose: Alembic migration versions — schema versioning for 10 PostgreSQL tables

/storage
Purpose: Local fallback storage
audio/ — generated TTS .wav files (fallback if R2 not configured)
summaries/ — generated PDF summary files (fallback if R2 not configured)
chroma_db/ — ChromaDB persistent vector store (auto-created on first RAG ingest)

/tests
Purpose: Unit tests
test_language_config.py, test_pii_service.py, test_pipeline_helpers.py, test_rate_limit.py

Frontend (frontend/staff-panel/src/):

App.jsx — Router: /login, /, /history, /admin, /analytics, /manager, /knowledge, /settings
main.jsx — React DOM entry point
index.css — Global + Tailwind base styles
theme.css — CSS variables for light/dark mode theming
App.css — App-level styles
constants.js — API_BASE_URL, LANGUAGES, BRAND colors, SERVICES, STAFF_ROLES, WS_EVENTS
bankingKnowledge.js — Local banking domain knowledge base for offline hints

/pages
LoginPage.jsx — UBI branded split-layout login + Demo Helper modal
DashboardPage.jsx — Main 3-column operational screen (the 6 live panels)
HistoryPage.jsx — Past sessions table + Recharts analytics charts
AdminPage.jsx — Admin control panel (staff CRUD, branch management, audit log)
ManagerPage.jsx — Manager dashboard (session oversight, team stats)
AnalyticsPage.jsx — Branch analytics and reporting (Recharts)
KnowledgePage.jsx — Banking knowledge base viewer
SettingsPage.jsx — User settings and preferences

/components/dashboard
ConversationPanel.jsx — Live bilingual chat + sentiment badges
AISuggestionBox.jsx — AI response + approve/edit/discard CTAs
ProcessPanel.jsx — Gamified RBI step checklist; loads 10 tab components from process-tabs/
InfoBoard.jsx — Real-time entity collection dashboard
SmartNavigator.jsx — State-first guided process navigator
BilingualSummary.jsx — Post-session bilingual PDF viewer

/components/dashboard/process-tabs (barrel exported via index.js)
StepsTab.jsx — Process step checklist tab
DocsTab.jsx — Document requirements tab
EligibilityTab.jsx — Customer eligibility information tab
InfoTab.jsx — General product info tab
NumbersTab.jsx — Loan amounts, rates, limits tab
RatesTab.jsx — Interest rates tab
ComplianceTab.jsx — RBI compliance rules tab
ProfileTab.jsx — Customer profile tab
SendTab.jsx — Send message / TTS tab
ActionsTab.jsx — Quick actions tab

/components/layout
TopBar.jsx — Header with branch info + connection status
Sidebar.jsx — Navigation sidebar
BottomBar.jsx — Action bar with mic + AI hints

/components/ui
Modal.jsx — Base modal wrapper
Button.jsx — Primary/secondary/ghost with loading + icon
Badge.jsx — Colored status badges
Spinner.jsx — Loading spinner
Toggle.jsx — Toggle switch
AddStaffModal.jsx — Create new teller/supervisor (role + language selector → CredentialsModal on success)
CredentialsModal.jsx — Show generated password once after staff creation
ResetPasswordButton.jsx — Admin/manager password reset → shows new credentials once

/hooks
useWebSocket.js — WS connection, auto-reconnect, message routing
useAudio.js — MediaRecorder + AudioWorklet PCM streaming + audio playback

/services
api.js — Axios instance + all API wrappers (login, sessions, STT, TTS, summaries, analytics, staffAPI)

/context
AppContext.jsx — Zustand store (auth, theme, session, WS state, conversationHistory, collectedInfo, processSteps, navigatorState, aiSuggestion, docReadiness)

/utils
managerUtils.jsx — Shared Manager+Admin utilities: CHART_COLORS, SENTIMENT_COLORS, date helpers (todayStr, daysAgoStr), formatters (fmtDuration, fmtDate, fmtDateTime), StatCard, RoleBadge, StatusDot, ActionBadge components

Frontend (frontend/customer-panel/src/):

App.jsx — Router: /, /session/:token, /summary/:id
main.jsx — React DOM entry point
index.css — Global styles
theme.css — CSS variables for light/dark mode
App.css — App-level styles
constants.js — API_BASE_URL, BRAND colors, LANGUAGES, SERVICES, WS_EVENTS
demoData.js — Demo mode scripted conversations

/pages
LanguageSelectPage.jsx — 10-language grid with SpeechBubbleRobot animation (QR entry point)
WaitingPage.jsx — Waiting for staff connection
LiveSessionPage.jsx — Core voice interaction screen (ServiceSelectionGrid → ConversationBubble + MicControl)
SaralFormPage.jsx — Pre-filled digital form with HTML5 signature capture
KycForm.jsx, AccountForm.jsx, LoanForm.jsx, CardService.jsx — Intent-specific form field definitions for SaralForm
SummaryPage.jsx — Bilingual summary + PDF download

/components
ConversationBubble.jsx — Animated Framer Motion chat bubble (staff=blue, customer=red; audio wave; pending spinner)
MicControl.jsx — Push-to-talk + tap-to-toggle mic; passive:false touchstart/touchend for mobile; audio level bar; waveform
ServiceSelectionGrid.jsx — 6-service selection grid with icons; sends customer_service_selected WS event; Skip shortcut
DocumentChecklist.jsx — Required documents per intent; sends document_confirmed WS event
SpeechBubbleRobot.jsx — Animated SVG robot (UBI colors) + 11 floating speech bubbles (stats, language tags); mobile-scaled

/hooks
useAudio.js — Push-to-talk recording + AudioWorklet Float32 PCM streaming + auto-playback
useWebSocket.js — WS connection for customer role

/services
api.js — Axios + customer API wrappers (no auth required)

/context
AppContext.jsx — Zustand store (theme, session state)

Frontend (frontend/shared/):
constants.js — Shared constants: BRAND colors, LANGUAGES array, WS_EVENTS enum, SESSION_STATUS, SENTIMENTS, APP_NAME, APP_VERSION, BANK_NAME, TEAM_NAME

# ==========================================================

# DATABASE DESIGN

# ==========================================================

Table/Collection:
Branch

Fields:

- id (PK)
- branch_code (UK)
- branch_name
- city
- state

Table/Collection:
StaffMember

Fields:

- id (PK)
- staff_id (UK)
- username (UK)
- password_hash
- full_name
- role (teller/manager/supervisor/admin)
- branch_id (FK → Branch)
- languages_known (JSONB)
- is_active (boolean)

Table/Collection:
Session

Fields:

- id (PK)
- token_number (UK)
- branch_id (FK)
- staff_id (FK)
- customer_language (display name)
- customer_language_code (e.g. "ta", "mr")
- customer_account_number
- customer_mobile_number
- customer_pan
- customer_dob
- customer_aadhaar_last4
- status (waiting/active/completed/abandoned)
- intent_detected
- sentiment_overall
- collected_data (JSONB)
- pii_types_found (JSONB)
- form_signed_at (DateTime)
- started_at, ended_at
- duration_seconds
- total_exchanges

Table/Collection:
Exchange

Fields:

- id (PK)
- session_id (FK)
- exchange_number
- direction (customer_to_staff / staff_to_customer)
- customer_text_original
- customer_text_translated
- staff_response_suggested
- staff_response_final
- staff_response_translated (customer-language version)
- staff_audio_url
- staff_used_suggestion (boolean)
- pii_detected (boolean)
- stt_confidence
- stt_model_used
- sentiment
- intent

Table/Collection:
ProcessStep

Fields:

- id (PK)
- intent_type
- step_number
- step_text_hindi
- step_text_marathi, step_text_tamil, step_text_telugu, step_text_bengali
- step_text_kannada, step_text_odia, step_text_punjabi
- step_text_gujarati (added via migrate_add_gu_ml_columns.py)
- step_text_malayalam (added via migrate_add_gu_ml_columns.py)
- speak_to_customer (boolean)
- is_active (boolean)

Table/Collection:
SessionProcessTracking

Fields:

- id (PK)
- session_id (FK)
- step_id (FK → ProcessStep)
- status (pending/completed/skipped)
- completed_at
  Note: rows lazy-inserted on first step_completed event if not pre-created

Table/Collection:
BilingualSummary

Fields:

- id (PK)
- session_id (FK)
- customer_language
- summary_hindi (JSONB array)
- summary_customer_lang (JSONB array)
- key_points_hindi (JSONB array)
- key_points_customer (JSONB array)
- next_steps_hindi (JSONB array)
- next_steps_customer (JSONB array)
- pdf_url
- pdf_generated (boolean)
- generated_at

Table/Collection:
PIILog

Fields:

- id (PK)
- session_id (FK)
- exchange_id (FK → Exchange)
- pii_type
- masked_value

Table/Collection:
AuditLog

Fields:

- id (PK)
- actor_id (FK → StaffMember)
- action (login/logout/staff_created/branch_created/staff_deactivated/password_reset/pdf_downloaded)
- branch_code
- created_at

Table/Collection:
AnalyticsDaily

Fields:

- id (PK)
- branch_id (FK)
- date
- total_sessions
- avg_duration_seconds
- languages_used (JSONB)
- intents_breakdown (JSONB)
- ai_suggestion_used (int)
- ai_suggestion_edited (int)
- ai_suggestion_ignored (int)

Relationships:

Branch → StaffMember (one-to-many)
Branch → Session (one-to-many)
Branch → AnalyticsDaily (one-to-many)
StaffMember → Session (one-to-many)
Session → Exchange (one-to-many)
Session → SessionProcessTracking (one-to-many)
Session → BilingualSummary (one-to-one)
Session → PIILog (one-to-many)
ProcessStep → SessionProcessTracking (one-to-many)
Exchange → PIILog (one-to-many)

# ==========================================================

# API DOCUMENTATION

# ==========================================================

Endpoint:
POST /auth/login

Purpose:
Authenticate staff, return JWT token

Input:
{
"staff_id": "UBI-NGP-001",
"password": "demo123"
}

Output:
{
"access_token": "<jwt>",
"token_type": "bearer",
"staff": { "id": 1, "username": "demo", "role": "teller", "branch_id": 1 }
}

Endpoint:
POST /stt/customer-transcribe

Purpose:
Full AI pipeline — STT → PII Mask → RAG → LLM → DB → WebSocket broadcast

Input:
FormData: audio (WebM blob), session_token, language_code

Output:
{
"transcript": "...",
"translation": "...",
"intent": "loan_enquiry",
"sentiment": "calm",
"suggestion": "...",
"entities": { "loan_type": "Home Loan" }
}

Endpoint:
POST /tts/generate

Purpose:
Generate TTS audio for staff-approved response, cache in Redis, broadcast audio URL to Customer Panel

Input:
{
"text": "...",
"language_code": "ta",
"session_token": "..."
}

Output:
{
"audio_url": "/audio/<filename>.wav",
"cached": false
}

Endpoint:
GET /summary/{session_id}/pdf

Purpose:
Generate and return bilingual PDF summary for a completed session

Input:
session_id (path param), Authorization: Bearer <jwt>

Output:
PDF file (application/pdf) or { "pdf_url": "..." }

Endpoint:
WebSocket /ws/{token}

Purpose:
Persistent bidirectional connection for real-time event streaming + binary PCM audio

Input:
WebSocket handshake with session token; accepts JSON messages + binary Float32 PCM frames

Output (all JSON with {type, data, timestamp} envelope):
session_connected, customer_speaking, transcription_ready, transcription_partial,
ai_suggestion_ready, audio_ready, step_updated, pii_detected, pii_alert,
info_board_update, navigator_update, doc_readiness_update, input_request,
input_received, input_acknowledged, document_confirmed, staff_message,
staff_typing, session_ended, peer_status, error, pong

Endpoint:
POST /staff/ (staffAPI.createStaff)

Purpose:
Manager creates new teller/supervisor — auto-generates staff_id, username, random password

Input:
{
"full_name": "...",
"role": "teller",
"languages_known": ["Hindi", "Marathi"],
"username": "" // optional
}

Output:
{
"staff": { ... },
"username": "...",
"plain_password": "..." // shown ONCE — not stored in plain
}

Endpoint:
POST /staff/{staff_id}/reset-password

Purpose:
Admin/manager resets staff password — returns new plain password once

Input:
Authorization: Bearer <jwt> (manager/admin role required)

Output:
{ "plain_password": "..." }

Endpoint:
POST /forms/submit

Purpose:
Customer submits the verified and signed SaralForm

Input:
{
"token_number": "NJT-1267",
"session_id": 101,
"form_ref": "A-101",
"confirmed_fields": { "customer_name": "...", "monthly_income": "..." },
"signature_data_url": "data:image/png;base64,...",
"language_code": "ta"
}

Output:
{
"success": true,
"message": "Form submitted successfully",
"form_ref": "A-101",
"token_number": "NJT-1267"
}

Endpoint:
GET /forms/signature/{token}

Purpose:
Staff downloads the customer's signature PNG file

Output:
PNG Image File (Content-Type: image/png)

# ==========================================================

# WEBSOCKET EVENT REFERENCE

# ==========================================================

Shared event envelope: { type: string, data: object, timestamp: ISO8601 }

Client → Server (Staff):
ping → pong
staff_approved_response → TTS generation + DB persist + audio broadcast
staff_edited_response → same as approved but analytics tracks as edited
step_completed → DB update + step_updated broadcast
end_session → DB close + auto-farewell + PDF + session_ended broadcast
trigger_input_request → input_request to customer
submit_verification → collected_data.verification_submitted=true + navigator update

Client → Server (Customer):
ping → pong
start_speaking {lang_code, session_id} → AudioStreamSession init
[binary frames] → PCM chunks accumulated, partial STT fired
stop_speaking → final pipeline triggered
customer_service_selected {service_id, service_name} → intent update + staff notified + auto-greeting
end_session → session close via token lookup
input_submitted {field_type, value, request_id} → PII masked + Session table updated + InfoBoard sync
document_confirmed {doc_id, confirmed} → forwarded to staff
demo_customer_message → scripted demo exchange

Server → Client:
session_connected, peer_status — connection lifecycle
customer_speaking — live speaking indicator
transcription_partial — intermediate STT text
transcription_ready — final STT + translation + intent + sentiment + pii_detected
ai_suggestion_ready — LLM suggestion (hindi + customer lang)
info_board_update — collected_info dict + completion_percent
navigator_update — phase, next_question, progress %
doc_readiness_update — checklist + score
audio_ready — audio_url + duration_seconds + response_text
step_updated — current_step/total_steps/progress/step_text
pii_alert, pii_detected — PII found in exchange
input_request {field_type, field_label, field_label_customer, request_id}
input_received, input_acknowledged — popup flow
document_confirmed — relayed from customer
staff_message {text, language_code} — staff text to customer
staff_typing {typing: bool}
session_ended {summary_url, duration_seconds, total_exchanges, session_id}
form_signed {token_number, session_id, form_ref, signature_url}
error {code, message}

# ==========================================================

# STATE MANAGEMENT

# ==========================================================

Global States (Zustand — AppContext.jsx, Staff Panel):

- auth (staff object, JWT token, isAuthenticated)
- theme (light/dark mode)
- session (current session token, customer language, intent, status)
- websocket (connection status, reconnect count)
- conversationHistory (Exchange[] array for ConversationPanel)
- collectedInfo (entity dict for InfoBoard)
- processSteps (step array + completion status for ProcessPanel)
- navigatorState (current phase, next question, progress %)
- aiSuggestion (current suggestion text + approval status)
- docReadiness (score + checklist for DocumentChecklist)

Local States:

- Form state (LoginPage — staffId, password, showPassword)
- Modal state (BilingualSummary PDF viewer modal, AddStaffModal, CredentialsModal)
- Recording state (useAudio.js — isRecording, audioBlob, audioLevel)
- WebSocket buffer state (useWebSocket.js — messageQueue, reconnectTimer)
- AudioStreamSession (per-token in ConnectionManager — PCM buffer, lang_code, partial tracking)

# ==========================================================

# DESIGN SYSTEM

# ==========================================================

Theme:
Union Bank of India Corporate + Modern Dashboard

Primary Colors (from shared/constants.js BRAND):
blue: #003087 (UBI Navy)
blueDark: #001a52
blueMid: #1a4db5
blueLight: #e8eef8
red: #E8231A (UBI Red)
redDark: #C41810
redLight: #FF4D45

Chart Colors (managerUtils.jsx CHART_COLORS):
#003087, #E8231A, #16A34A, #D97706, #9333EA, #0891B2, #BE185D

Sentiment Colors:
calm: #16A34A, confused: #D97706, frustrated: #DC2626, urgent: #9333EA

Typography:
Inter (UI text), Noto Sans Devanagari / Tamil / Telugu / Kannada (multilingual PDF + bubble text)

Spacing:
8px grid system (Tailwind defaults)

Animations:
Framer Motion: smooth panel transitions, ConversationBubble spring entry, SpeechBubbleRobot float (11 bubbles), MicControl pulse, sentiment badge slide-in, ServiceSelectionGrid item stagger
CSS: audio waveform bars, loader-spin keyframes

# ==========================================================

# CODING STANDARDS

# ==========================================================

Naming:

- camelCase for JS variables and functions
- PascalCase for React components and Python classes
- snake_case for Python variables, functions, file names, DB columns
- UPPER_CASE for constants (API_BASE_URL, LANGUAGE_CODES, WS_EVENTS)
- DB column resolution: lang*code → step_text*{lang_attr} via core/language.py LANG_CODE_TO_ATTR

Component Rules:

- Single responsibility — each dashboard panel is its own component
- ProcessPanel tab components extracted to process-tabs/ for code splitting (10 tabs)
- Custom hooks for WebSocket (useWebSocket.js) and Audio (useAudio.js)
- Shared Manager+Admin utilities in utils/managerUtils.jsx — no duplication
- Shared frontend constants in frontend/shared/constants.js — panels re-export with additions
- Modals: AddStaffModal + CredentialsModal flow — password shown exactly once, never stored plain

Code Rules:

- All async operations in Python use await — no blocking calls in FastAPI routes
- Single-commit architecture — all DB mutations in one await db.commit() per pipeline run
- Pre-LLM PII masking is non-negotiable — always runs before LLM, even for tests
- WebSocket events must always include event_type field in {type, data, timestamp} envelope
- RAG context injected as [BANKING KNOWLEDGE] block BEFORE customer query in LLM prompt
- Staff keyword detection fires input_request popup automatically — do not duplicate this logic in routers
- Session PII fields saved to Session table columns, not just collected_data JSONB
- SessionProcessTracking rows lazy-inserted on first step_completed if not pre-created
- Keep service files pure — routers call services, services call AI APIs — no AI calls in routers

# ==========================================================

# SECURITY RULES

# ==========================================================

Requirements:

- JWT (HS256) with 8h expiry for all staff-facing endpoints
- bcrypt password hashing — no plaintext passwords in DB or logs
- PII masked BEFORE reaching external APIs — pre-LLM masking is mandatory, runs in <1ms
- Sliding-window rate limiting on all AI endpoints (/stt, /llm, /tts): staff 30/min, customer 15/min
- CORS restricted to known frontend origins (ALLOWED_ORIGINS env var)
- All secrets in backend/.env — never hardcode API keys or R2 credentials
- Customer Panel is intentionally unauthenticated (public kiosk design) — isolated from staff endpoints by design
- RBAC enforced via FastAPI dependency injection (get_current_staff, require_role)
- Staff passwords shown ONCE via CredentialsModal and ResetPasswordButton — not logged or stored plain
- Input popup PII (Aadhaar, PAN, account number) masked before forwarding to staff and InfoBoard

# ==========================================================

# PERFORMANCE REQUIREMENTS

# ==========================================================

Goals:

- End-to-end pipeline (customer speaks → staff sees translation + suggestion): target <4s
- STT latency: <1.5s (Sarvam primary), <1s (Groq fallback)
- LLM response: <1s (Groq Llama)
- TTS generation: <2s (Sarvam Bulbul v3)
- WebSocket event delivery: <50ms
- Redis TTS cache hit: ~5ms (vs ~1.5s generation), ~40% hit rate
- PII masking: <1ms per scan
- Session Navigator next-question: ~0.1ms
- RAG retrieval (hybrid + rerank): ~200-500ms (thread-pool offloaded, non-blocking)
- Partial STT interval: 0.4s (rate-limited, non-blocking)
- PDF generation: <3s per session summary
- Silence detection timeout: 2.0s (auto-triggers stop_speaking fallback)

# ==========================================================

# ENVIRONMENT VARIABLES

# ==========================================================

Database:
DATABASE_URL=postgresql+asyncpg://vaanibank:vaanibank12345@localhost:5432/vaanibank_db

Redis:
REDIS_URL=redis://localhost:6379/0

JWT:
JWT_SECRET_KEY=your-256-bit-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=8

Sarvam AI (STT Primary + TTS):
SARVAM_API_KEY=
SARVAM_STT_URL=https://api.sarvam.ai/speech-to-text
SARVAM_TTS_URL=https://api.sarvam.ai/text-to-speech
SARVAM_TTS_MODEL=bulbul:v3

Reverie AI (STT Fallback 2 — BFSI):
REVERIE_APP_ID=
REVERIE_API_KEY=

Groq (LLM + STT Fallback 1):
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=1000

Google Gemini (LLM Fallback):
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

Cloudflare R2 (Storage — optional, graceful fallback):
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

Local File Storage (used if R2 not configured):
AUDIO_STORAGE_PATH=./storage/audio
SUMMARY_STORAGE_PATH=./storage/summaries

App:
APP_ENV=development
APP_PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
DEMO_MODE=true
APP_URL=https://vaanibank-customer.netlify.app

# ==========================================================

# CURRENT PROJECT STATUS

# ==========================================================

Completed:

- 3-Level STT Fallback Chain (Sarvam → Groq Whisper → Reverie BFSI)
- Streaming Audio Pipeline (AudioWorklet PCM → AudioStreamSession → partial STT → final pipeline)
- Structured LLM Pipeline with Gemini fallback + circuit breaker
- RAG Service (ChromaDB + multilingual-e5-small + BM25 + cross-encoder reranking)
- Knowledge Base (9 markdown files across 7 categories with YAML front-matter)
- ingest_kb.py CLI with --force flag for re-ingestion
- Pre-LLM PII Masking (5 types, RBI 2024 compliant)
- Deterministic Session Navigator (7 intents, 68 fields, 6 phases, GREETING/FAREWELL/VERIFICATION_TIME multilingual)
- Real-Time WebSocket System (12+ event types, 4-mixin ConnectionManager)
- Auto-greeting + auto-farewell with TTS (triggered on both-sides-connected event)
- Staff keyword detection → auto input_request popup on customer kiosk
- Staff Panel — all 6 live dashboard panels + 10 process tab components
- Staff Panel UI library (Modal, Button, Badge, Spinner, Toggle, AddStaffModal, CredentialsModal, ResetPasswordButton)
- Staff Panel utils (managerUtils.jsx: StatCard, RoleBadge, StatusDot, ActionBadge, formatters, CHART_COLORS)
- Customer Panel — LanguageSelectPage (SpeechBubbleRobot), WaitingPage, LiveSessionPage (ServiceSelectionGrid + ConversationBubble + MicControl), SummaryPage
- Cloudflare R2 Storage Service with local filesystem fallback (boto3)
- Bilingual PDF Summary (FPDF2 + Noto fonts, UBI branded, LLM-generated content)
- JWT + RBAC Auth (4 roles, 8h expiry, AddStaffModal/CredentialsModal flow)
- PostgreSQL schema — 10 tables, Alembic migrations
- migrate_add_gu_ml_columns.py — Gujarati + Malayalam step translations added
- Redis TTS caching (7-day TTL, ~40% hit rate)
- Mock CBS service (deterministic hash-based customer profiles)
- 8 Banking Process JSON definitions (19 process steps across 6 intents, now 10 languages)
- Sliding-window rate limiter (in-memory, asymmetric)
- Seed data (3 branches, 3 staff, 19 process steps, 8 languages)
- Shared frontend constants (frontend/shared/constants.js)
- Live deployment (Netlify Staff + Customer, Render Backend)
- Unit tests (test_language_config, test_pii_service, test_pipeline_helpers, test_rate_limit)

In Progress:

- Bug fixes on translated text display in Customer Panel message display
- WebSocket session persistence edge cases on rapid reconnects
- CSS layout refinements in Staff Dashboard

Pending:

- Real CBS API integration (Finacle/BaNCS — requires bank-side OAuth2)
- TTS fallback engine (Google TTS / browser SpeechSynthesis)
- Redis Pub/Sub for horizontal WebSocket scaling
- NER-based PII detection for verbal PII
- Field-level DB encryption + TTL-based PII auto-purge (production compliance)
- Offline STT fallback (local faster-whisper via models/whisper/ already downloaded)
- HttpOnly cookie migration for JWT (replace localStorage)

Known Bugs:

- Translated text sometimes not appearing in Customer Panel ConversationBubble (active fix)
- WebSocket race condition on rapid reconnects (intermittent)

# ==========================================================

# FUTURE ROADMAP

# ==========================================================

Priority 1 (Production Readiness):

- Real CBS API integration (Finacle/BaNCS) with bank-side OAuth2
- TTS fallback engine configuration
- Field-level DB encryption + PII auto-purge TTL
- HttpOnly cookie migration for JWT (replace localStorage)
- Redis-backed rate limiter (replace in-memory for multi-instance)

Priority 2 (Scalability):

- Redis Pub/Sub for distributed WebSocket (horizontal scaling)
- Multi-instance backend deployment
- ChromaDB → Qdrant or Weaviate for distributed RAG at scale

Priority 3 (AI Improvement):

- Activate local faster-whisper offline STT (weights already in models/whisper/)
- NER-based PII detection for verbal/contextual PII
- Fine-tuned intent models per banking product
- Dialect handling (e.g., Vidarbha Marathi vs Pune Marathi)
- Case management + FIU report generation post-session
- Multi-branch real-time analytics for regional managers
- Expand knowledge_base/ with more products, schemes, and compliance documents

# ==========================================================

# AI INSTRUCTIONS

# ==========================================================

Instructions for AI systems working on this codebase:

- Read project structure before making any changes — understand which service handles which responsibility
- Preserve the single-commit architecture in pipeline_orchestrator.py — all DB mutations in one await db.commit()
- Never skip PII masking — pii_service.py must always run before any LLM calls
- Do not replace the deterministic session_navigator.py with LLM-based navigation — this is by design
- RAG context must be injected as [BANKING KNOWLEDGE] block BEFORE customer query in every LLM call — do not skip
- WebSocket events must always use {type, data, timestamp} envelope — check helpers.py \_event()
- New event types must be added to WS_EVENTS in frontend/shared/constants.js
- Staff panel process tab components live in process-tabs/ — do not merge back into ProcessPanel.jsx
- Shared Manager+Admin logic belongs in utils/managerUtils.jsx — not duplicated in each page
- Customer Panel new components go in frontend/customer-panel/src/components/
- Staff Panel new UI components go in frontend/staff-panel/src/components/ui/
- Staff password flow: AddStaffModal → CredentialsModal (plain password shown ONCE) — do not log passwords
- Session PII must be saved to both Session table columns AND collected_data JSONB (handlers.py \_handle_input_submitted pattern)
- SessionProcessTracking rows are lazy-inserted — check \_handle_step_completed in handlers.py before modifying step logic
- RAG ingest: after adding/editing any knowledge_base/\*.md file, run python ingest_kb.py (or python ingest_kb.py --force to re-embed all)
- storage_service.py is the single path for all file uploads — do not write audio/PDFs directly to disk except via this service
- core/language.py LANG_CODE_TO_ATTR is the single source for lang_code → DB column mapping — use it everywhere
- All new endpoints must use RBAC dependency injection (get_current_staff or require_role) — no unprotected staff routes
- Backend file conventions: routers call services, services call AI APIs — never call ai_service or rag_service from routers directly
- Avoid unnecessary refactoring of ai_service.py, pipeline_orchestrator.py, or manager.py — they are stable critical path
- Explain changes before implementation for any modification to those three files
