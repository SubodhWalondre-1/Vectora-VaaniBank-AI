<p align="center">
  <img src="website_logo.png" alt="VaaniBank AI Logo" width="400"/>
</p>

# VaaniBank AI — Real-Time Multilingual Gen-AI Voice Banking Assistant

## Problem Statement
This project addresses **PS6: Frontline Desk Support in Multilingual Mode Using Gen-AI Voice Assistant** for Union Bank of India. VaaniBank AI enables any PSB teller to serve any walk-in customer regardless of language, via live Speech-to-Text transcription, LLM-powered translation and response suggestion, and Text-to-Speech playback — all processed in under 3 seconds end-to-end while strictly maintaining RBI 2024 PII compliance.

## Live Demo
🔗 **Live Demo (Staff Panel):** [https://vaanibank-staff.netlify.app](https://vaanibank-staff.netlify.app)  
🔗 **Live Demo (Customer Panel):** [https://vaanibank-customer.netlify.app](https://vaanibank-customer.netlify.app)  
🎥 **Demo Video:** [https://youtube.com/watch?v=demo-video-link](https://youtube.com/watch?v=demo-video-link)  

*If no live deployment is active, run the application locally using the instructions below.*

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v3, Zustand v5 (Persisted Store with Immer), Framer Motion, React Router v7, Axios, React Hot Toast, Recharts (Staff Analytics), Lucide React |
| **Backend** | Python 3.11+, FastAPI 0.111, Uvicorn 0.29, Native WebSockets, Pydantic v2, PyYAML |
| **Database** | PostgreSQL (10 tables via SQLAlchemy 2.0 Async ORM, asyncpg), Alembic Migrations |
| **Cache & State** | Redis 5.0 (TTS Audio Cache — 7-day TTL, Active Session State — 2hr TTL, Staff Online Tracking — 8hr TTL, Sliding-Window Rate Limiter — 30 req/60s) |
| **AI — STT (3-Level Fallback)** | ① Sarvam AI Saarika v2.5 (Primary) → ② Groq Whisper Large-v3-Turbo (Fallback 1) → ③ Reverie RevUp BFSI (Fallback 2) |
| **AI — LLM** | Groq Llama-3.3-70b-Versatile (Primary) with Google Gemini 2.0 Flash (Auto-Failover) |
| **AI — RAG** | ChromaDB (Local Persistent Vector Store) + Google Gemini Embeddings (`gemini-embedding-001`, 3072 dims) + Rank-BM25 Sparse Search, merged via Reciprocal Rank Fusion (RRF) |
| **AI — TTS** | Sarvam AI Bulbul v3 (`suhani` female voice) — 10 Indian languages |
| **PII Compliance** | Regex + Context-Aware Masking (Aadhaar, PAN, Phone, Account Number, DOB) — masks before any external API call |
| **PDF Engine** | ReportLab + fpdf2 — Bilingual dual-column session summaries with Noto Sans Indic fonts |
| **Deployment** | Netlify (Both Frontends), Render (FastAPI Backend), Cloudflare R2 (Optional Object Storage) |

### Languages Supported
Hindi • Marathi • Tamil • Telugu • Bengali • Odia • Punjabi • Gujarati • Kannada • Malayalam (+ English)

## How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/your-team/VaaniBank-AI.git
cd VaaniBank-AI
```

### 2. Set Up the Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

### 3. Set Up Database & Cache
Ensure **PostgreSQL** and **Redis** are running, then create the database:
```sql
CREATE ROLE vaanibank WITH LOGIN PASSWORD 'YourPassword';
CREATE DATABASE vaanibank_db OWNER vaanibank;
GRANT ALL PRIVILEGES ON DATABASE vaanibank_db TO vaanibank;
```

Run migrations and seed baseline data:
```bash
alembic upgrade head
python seed_data.py
python ingest_kb.py
```

### 4. Configure Environment
```bash
cp .env.example .env
```
Open `.env` and insert your AI service API keys:
```env
DATABASE_URL=postgresql+asyncpg://vaanibank:YourPassword@localhost:5432/vaanibank_db
REDIS_URL=redis://localhost:6379/0

SARVAM_API_KEY=your_sarvam_api_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
REVERIE_APP_ID=your_reverie_app_id
REVERIE_API_KEY=your_reverie_api_key
```

### 5. Launch Backend Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Launch Staff & Customer Panels
Open two separate terminals:

**Terminal A — Staff Panel (http://localhost:5173)**
```bash
cd frontend/staff-panel
npm install
npm run dev
```

**Terminal B — Customer Panel (http://localhost:5174)**
```bash
cd frontend/customer-panel
npm install
npm run dev
```

### 7. Demo Credentials (Staff Login)
The Staff Panel login page includes a built-in **Demo Credentials** helper:
* **⚡ One-Click Login**: Click **"Demo Credentials"** → **"Generate & Fill Unique Staff ⚡"** — the backend dynamically spawns a unique staff record and auto-fills all fields.
* **🔑 Manual Login**:
  * **Teller**: Staff ID `UBI-NGP-001` | Username `demo` | Password `demo123`
  * **Manager**: Staff ID `UBI-NGP-002` | Username `manager` | Password `manager123`
  * **Admin**: Staff ID `UBI-MUM-042` | Username `admin` | Password `admin123`

## Project Structure & Architecture

VaaniBank AI is engineered using **Decoupled Client-Server Clean Architecture** with a 3-tier service-layer backend and isolated frontend deployments.

```text
VaaniBank-AI/
├── backend/                          # ── FASTAPI BACKEND (3-Tier Service-Layer Architecture)
│   ├── main.py                       # Entrypoint: lifespan hooks, CORS, GZip, static mounts, health endpoints
│   ├── database.py                   # Async SQLAlchemy engine + Redis connection + get_db()/get_redis() deps
│   ├── config.py                     # Pydantic BaseSettings singleton: strict 12-Factor env validation
│   ├── models.py                     # Relational schema: 10 PostgreSQL tables with JSONB, indexes, FKs
│   ├── schemas.py                    # Pydantic v2 request/response DTOs for all routers
│   ├── intent_engine.py              # Keyword + LLM intent classifier (7 intents + general)
│   ├── language_config.py            # BCP-47 ↔ Sarvam/Groq/Reverie language code mappings
│   ├── process_loader.py             # Runtime JSON process definition loader
│   │
│   ├── routers/                      # ── LAYER 1: API ROUTING (Thin Controllers)
│   │   ├── auth.py                   # POST /auth/login, /logout, /refresh | GET /auth/me
│   │   ├── sessions.py               # CRUD /sessions/* | WebSocket /ws/{token_number}
│   │   ├── ai_pipeline.py            # POST /stt/*, /llm/*, /tts/* (STT + LLM + TTS pipeline)
│   │   ├── summary.py                # POST /summary/* | GET /analytics/*, /branches/*
│   │   ├── staff.py                  # GET/POST /staff/*, /admin/* (RBAC CRUD + audit)
│   │   ├── forms.py                  # POST /forms/submit | GET /forms/signature/{token} (SaralForm)
│   │   └── _pipeline_helpers.py      # Shared helpers for AI pipeline routers
│   │
│   ├── services/                     # ── LAYER 2: BUSINESS LOGIC (Core Banking Services)
│   │   ├── pipeline_orchestrator.py  # Core: STT → PII Mask → RAG → LLM → TTS → WS Broadcast
│   │   ├── stt_service.py            # 3-engine STT fallback chain with per-engine telemetry
│   │   ├── ai_service.py             # Groq LLM + Gemini fallback, translation, intent analysis
│   │   ├── pii_service.py            # RBI 2024: Regex masking of Aadhaar/PAN/Phone/Account/DOB
│   │   ├── rag_service.py            # Hybrid ChromaDB Dense + BM25 Sparse search with RRF reranking
│   │   ├── pdf_service.py            # ReportLab: Bilingual dual-column PDF session summaries
│   │   ├── session_navigator.py      # Deterministic state-first workflow + next-question engine
│   │   ├── document_service.py       # Document checklist builder + readiness scoring
│   │   ├── cbs_service.py            # Core Banking System mock integration
│   │   ├── storage_service.py        # Local/R2 audio and PDF file storage
│   │   ├── settings_service.py       # Dynamic runtime settings (JSON config)
│   │   └── llm_utils.py              # Shared LLM helpers: intent detection, history builder
│   │
│   ├── websocket/                    # ── LAYER 3: REAL-TIME COMMUNICATION
│   │   ├── manager.py                # ConnectionManager: bidirectional WS rooms, broadcasts
│   │   ├── handlers.py               # WS message dispatcher → pipeline steps
│   │   ├── connection.py             # Per-connection state model
│   │   ├── audio_pipeline.py         # Routes audio blobs through STT → LLM → TTS
│   │   ├── audio_streamer.py         # Streams TTS audio chunks back over WebSocket
│   │   └── helpers.py                # Shared WS utility functions
│   │
│   ├── core/                         # ── CROSS-CUTTING CONCERNS
│   │   ├── security.py               # JWT encode/decode (HS256, 8hr expiry), password hashing
│   │   ├── guards.py                 # FastAPI deps: require_staff, require_manager, require_admin
│   │   ├── exceptions.py             # Custom exception hierarchy + global handlers
│   │   └── language.py               # Language code mappings and helpers
│   │
│   ├── middleware/
│   │   └── rate_limit.py             # Sliding-window rate limiter (30 req/60s on AI endpoints)
│   │
│   ├── config/
│   │   ├── document_registry.py      # Intent → required document list mapping
│   │   ├── intent_guidance.yaml      # LLM prompt guidance per banking intent
│   │   └── dynamic_settings.json     # Runtime-tunable feature flags
│   │
│   ├── processes/                    # Declarative JSON state machines per intent
│   │   ├── account_opening.json      #   Steps, rates, eligibility, documents
│   │   ├── home_loan.json
│   │   ├── personal_loan.json
│   │   ├── education_loan.json
│   │   ├── vehicle_loan.json
│   │   ├── fixed_deposit.json
│   │   ├── cibil_info.json
│   │   └── default.json
│   │
│   ├── knowledge_base/               # Source documents ingested into ChromaDB
│   │   ├── compliance/rbi_rules.md   #   RBI 2024 compliance guidelines
│   │   ├── loans/                    #   Home loan, personal loan product docs
│   │   ├── products/                 #   Savings account, fixed deposit docs
│   │   ├── scripts/                  #   Staff response scripts
│   │   ├── glossary/                 #   Banking terminology
│   │   ├── kyc/                      #   KYC documentation
│   │   └── processes/                #   Process documentation
│   │
│   ├── migrations/                   # Alembic migration scripts
│   ├── seed_data.py                  # Seeds 3 branches, 3 staff, 19 process steps, 3 demo sessions
│   ├── ingest_kb.py                  # Embeds knowledge base into ChromaDB
│   ├── ubi_knowledge_base.yaml       # Official UBI product rates, KYC standards, eligibility rules
│   └── requirements.txt             # 30+ Python dependencies
│
├── frontend/
│   ├── staff-panel/                  # ── TELLER DESKTOP DASHBOARD (Port 5173)
│   │   ├── src/pages/
│   │   │   ├── LoginPage.jsx         # JWT auth with demo credential auto-seeder
│   │   │   ├── DashboardPage.jsx     # Core workspace: Conversation + Process + InfoBoard
│   │   │   ├── HistoryPage.jsx       # Paginated session history with search/filter
│   │   │   ├── AnalyticsPage.jsx     # Branch analytics (Recharts) — sessions, intents, sentiment
│   │   │   ├── KnowledgePage.jsx     # RAG-powered banking knowledge Q&A browser
│   │   │   ├── SettingsPage.jsx      # Staff profile, theme, language preferences
│   │   │   ├── ManagerPage.jsx       # Live session monitor, staff performance, summaries
│   │   │   └── AdminPage.jsx         # Staff CRUD, branch management, audit logs
│   │   │
│   │   ├── src/components/
│   │   │   ├── dashboard/
│   │   │   │   ├── ConversationPanel.jsx   # Real-time bilingual transcript (customer + staff)
│   │   │   │   ├── ProcessPanel.jsx        # 10-tab process tracker (Steps/Info/Docs/Rates/...)
│   │   │   │   ├── AISuggestionBox.jsx     # LLM response suggestion — accept/edit/ignore
│   │   │   │   ├── BilingualSummary.jsx    # Post-session bilingual summary + PDF export
│   │   │   │   ├── InfoBoard.jsx           # Session metadata: language, intent, sentiment, PII
│   │   │   │   ├── SmartNavigator.jsx      # AI-suggested next process step
│   │   │   │   └── process-tabs/           # 10 tabs: Steps, Info, Docs, Rates, Numbers,
│   │   │   │                               #   Eligibility, Compliance, Profile, Send, Actions
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx             # Role-aware navigation (teller/manager/admin)
│   │   │   │   ├── TopBar.jsx              # Session status, staff name, theme toggle
│   │   │   │   └── BottomBar.jsx           # Mobile bottom navigation
│   │   │   └── ui/                         # Button, Badge, Spinner, Toggle, Modal,
│   │   │                                   #   AddStaffModal, CredentialsModal, ResetPasswordButton
│   │   │
│   │   ├── src/context/AppContext.jsx      # Zustand store with persist (JWT, theme, session, WS)
│   │   ├── src/hooks/
│   │   │   ├── useWebSocket.js             # WS lifecycle for staff panel
│   │   │   └── useAudio.js                 # TTS audio playback queue
│   │   ├── src/services/api.js             # Axios instance + all staff-facing API calls
│   │   └── src/bankingKnowledge.js         # Static banking knowledge fallback
│   │
│   ├── customer-panel/               # ── WALK-IN KIOSK TABLET APP (Port 5174)
│   │   ├── src/pages/
│   │   │   ├── LanguageSelectPage.jsx      # Language selection + service grid + token issuance
│   │   │   ├── WaitingPage.jsx             # Polls for staff to accept the session
│   │   │   ├── LiveSessionPage.jsx         # Core mic UI: record, send, conversation bubbles, TTS
│   │   │   ├── SummaryPage.jsx             # Session summary + PDF download
│   │   │   ├── SaralFormPage.jsx           # Digital banking form with HTML5 signature canvas
│   │   │   ├── AccountForm.jsx             # Account opening form
│   │   │   ├── KycForm.jsx                 # KYC update form
│   │   │   ├── LoanForm.jsx                # Loan application form
│   │   │   └── CardService.jsx             # Card services form
│   │   │
│   │   ├── src/components/
│   │   │   ├── ConversationBubble.jsx      # Chat bubble for customer/staff utterances
│   │   │   ├── DocumentChecklist.jsx       # Required documents list for detected intent
│   │   │   ├── MicControl.jsx              # Hold-to-record mic with animated feedback
│   │   │   ├── ServiceSelectionGrid.jsx    # Banking service selection grid
│   │   │   └── SpeechBubbleRobot.jsx       # Animated AI robot mascot
│   │   │
│   │   ├── src/context/AppContext.jsx      # Zustand store (language, token, theme, session)
│   │   ├── src/hooks/
│   │   │   ├── useWebSocket.js             # WS connection lifecycle
│   │   │   └── useAudio.js                 # Mic recording + TTS playback
│   │   ├── src/services/api.js             # Customer-facing API calls
│   │   └── src/demoData.js                 # Offline/demo mode mock data
│   │
│   └── shared/                       # Common static fonts, icons, logos
│
└── website_logo.png                  # Application brand logo
```

### 💡 Core Architectural Highlights

* **Decoupled Security Boundary**: Staff intranet dashboard (`staff-panel`) and public customer kiosk (`customer-panel`) are isolated deployments — employee endpoints are protected from unauthorized terminal access.
* **3-Level STT Fallback Chain**: Sarvam Saarika → Groq Whisper → Reverie RevUp — guarantees zero session drops even if primary STT is down. Each engine reports per-attempt latency telemetry.
* **Zero-Cost Local RAG**: Banking knowledge base (RBI circulars, loan docs, KYC rules, staff scripts) is parsed, chunked, and stored in **ChromaDB** with **Gemini Embeddings** (3072-dim). Hybrid retrieval via **Dense + BM25 Sparse** merged using **Reciprocal Rank Fusion (RRF)** — offline-ready, zero API cost.
* **RBI 2024 PII Compliance Guard**: All STT transcriptions are routed through `pii_service.py` to regex-mask Aadhaar (`**** **** XXXX`), PAN (`*****XXXXF`), Phone (`******XXXX`), Account Numbers, and DOB **before** any text reaches external LLM APIs.
* **Extensible JSON Workflows**: Banking process steps, interest rates, eligibility criteria, and required documents are externalized into declarative JSON files (`/processes/`). Adding a new banking product requires zero code changes.
* **Deterministic Navigator**: `session_navigator.py` computes next-question, document readiness score, and workflow phase deterministically from collected state — never repeats questions the LLM already resolved.
* **SaralForm Digital Forms**: Customer-facing digital banking forms (Account Opening, KYC, Loan Application) with HTML5 canvas signature capture, submitted and stored server-side.

## Database Schema

10 PostgreSQL tables connected via foreign keys with JSONB metadata columns:

| Table | Purpose |
|---|---|
| `branches` | 3 seeded bank branches (Nagpur, Mumbai, Chennai) |
| `staff_members` | Teller, Manager, Supervisor, Admin roles with bcrypt passwords |
| `sessions` | Customer interaction sessions with language, intent, sentiment, PII flags, collected data (JSONB) |
| `exchanges` | Individual conversation turns with original text, translation, suggestion, STT model, confidence |
| `process_steps` | Step-by-step workflows in 10 languages for 6 banking intents |
| `session_process_tracking` | Per-session step completion status (pending/completed/skipped) |
| `bilingual_summaries` | Hindi + customer-language summary with PDF URL and WhatsApp delivery status |
| `pii_logs` | Audit trail of every PII detection with masked value and timestamp |
| `audit_logs` | Admin/manager write action audit (actor, target, branch, timestamp) |
| `analytics_daily` | Branch-level daily aggregates: sessions, intents, sentiments, AI suggestion usage |

## Dataset
All database entries, process guidelines, and knowledge sources are **100% synthetic** — generated by our team. No real bank customer data is used.

* **Database Records**: 3 branches (Nagpur, Mumbai, Chennai), 3 staff accounts (teller, manager, admin), 19 process steps across 6 intents, 3 pre-filled demo sessions
* **Banking Processes**: 8 JSON workflow definitions (Account Opening, Home Loan, Personal Loan, Education Loan, Vehicle Loan, Fixed Deposit, CIBIL Info, Default) with multilingual step text in all 10 Indian languages
* **Knowledge Base**: 7 curated markdown document collections (compliance, loans, products, glossary, KYC, processes, scripts) + 1 comprehensive YAML knowledge base (`ubi_knowledge_base.yaml`) with UBI interest rates, eligibility rules, KYC standards, and service charges
* **ChromaDB Vector Store**: Dense vector embeddings via Google Gemini Embedding API, stored locally with persistent ChromaDB — no external vector DB required

## Model Performance (on Synthetic Test Set)

### Speech-to-Text (STT) Pipeline
| Engine | Role | Avg. WER | Avg. Latency |
|---|---|---|---|
| Sarvam Saarika v2.5 | Primary | ~14% | ~1.2s |
| Groq Whisper Large-v3-Turbo | Fallback 1 | ~9% | ~0.8s |
| Reverie RevUp BFSI | Fallback 2 | High domain-specific recall | ~1.5s |

### LLM & RAG Performance
| Component | Metric | Value |
|---|---|---|
| Groq Llama-3.3-70b-Versatile | Intent Classification Accuracy | ~92% |
| Groq Llama-3.3-70b-Versatile | Information Extraction F1-Score | ~89% |
| Groq Llama-3.3-70b-Versatile | Avg. Response Latency | ~0.8s |
| Google Gemini 2.0 Flash | Auto-Failover Switch Time | <100ms |
| RAG Hybrid (Dense + BM25 RRF) | Top-3 Retrieval Recall | ~94% |
| RAG Retrieval | Avg. Latency | ~30ms |

### Text-to-Speech (TTS)
| Engine | Metric | Value |
|---|---|---|
| Sarvam Bulbul v3 | Languages Supported | 10 Indian languages |
| Sarvam Bulbul v3 | Redis Cache Hit Latency | <50ms |
| Sarvam Bulbul v3 | Cache TTL | 7 days |

*Note: These results are on synthetic/test data. Performance on real bank branch audio would require fine-tuning for ambient noise conditions.*

## Known Limitations
* **Synthetic Testing Limits** — Models evaluated on clean synthetic bank audio. Noisy real-world branch environments would require front-end noise suppression and STT fine-tuning.
* **WebSocket In-Memory Registry** — Active connections tracked in-memory inside FastAPI state. Horizontal scaling across multiple nodes would require a Redis Pub/Sub backplane.
* **Single TTS Provider** — Currently relies entirely on Sarvam Bulbul v3 with no native TTS fallback engine if Sarvam API goes down.
* **Local Signature Storage** — SaralForm digital signature PNGs stored on local disk. Production would require Cloudflare R2 or S3 object storage.
* **No Real CBS Integration** — Core Banking System integration is mocked via `cbs_service.py`. Real deployment would require integration with Union Bank's Finacle/T24.
* **Single-Node Rate Limiting** — The sliding-window rate limiter uses in-process state; distributed deployments would need Redis-backed rate limiting.

## Team
* **Subodh Walondre** — Full Stack Development + System Architecture
* **Amogh Samarth** — Customer Panel + Staff Panel Frontend Development
* **Sanskruti Mishra** — AI Pipeline + Domain Research
* **Meksha Tajane** — UI/UX Design + Domain Research

## Contact
For any queries about this submission:
* **Team Name**: Vectora
* **Institute**: S. B. Jain Institute of Technology, Management & Research, Nagpur
* **Email**: vectora.crew@gmail.com

**iDEA 2.0 Phase 2 Submission — Problem Statement 6**
