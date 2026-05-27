<p align="center">
  <img src="website_logo.png" alt="VaaniBank AI Logo" width="400"/>
</p>

<h1 align="center">VaaniBank AI — Multilingual Gen-AI Voice Assistant for Frontline Bank Staff</h1>

<p align="center">
  <em>वाणी जो हर भाषा जाने — The Voice That Knows Every Language</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Redis-7+-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/WebSocket-Real--Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSocket"/>
</p>

---

## Problem Statement

> **PS6: Frontline Desk Support in Multilingual Mode Using Gen-AI Voice Assistant**

This project builds a **Gen-AI powered Multilingual Voice Assistant** that supports frontline Union Bank of India staff during customer interactions at branches. The assistant listens to customers speaking in their preferred Indian language (10+ supported), provides **real-time translation and transcription** for the staff member, enables the staff to respond back in the customer's language through **AI-generated voice output**, understands **banking context** (product names, jargon, account types, common queries), guides staff through banking processes (account opening, loan enquiry, KYC update) in the customer's language, and generates a **bilingual summary** of the interaction for records.

---

## Live Demo

🌐 **Live Demo (Staff Panel):** [https://vaanibank-staff.netlify.app](https://vaanibank-staff.netlify.app)  
🌐 **Live Demo (Customer Panel):** [https://vaanibank-customer.netlify.app](https://vaanibank-customer.netlify.app)  
🖥️ **Backend API:** Deployed on [Render](https://render.com)  
🎥 **Demo Video:** [https://youtube.com/](https://youtube.com/)

> If no live deployment is accessible, run locally using instructions below.

---

## Tech Stack

### Backend

| Layer                | Technology                 | Details                                      |
| -------------------- | -------------------------- | -------------------------------------------- |
| **Web Framework**    | FastAPI                    | Python 3.11+, async-first with uvicorn       |
| **ORM**              | SQLAlchemy 2.0             | Fully async with `asyncpg` driver            |
| **Database**         | PostgreSQL 14+             | Primary relational store                     |
| **Cache / Session**  | Redis 7+                   | TTS cache (7-day TTL), staff online status   |
| **Auth**             | JWT (python-jose) + bcrypt | HS256, 8h expiry, role-based access          |
| **Real-Time**        | WebSockets                 | Bidirectional staff ↔ customer communication |
| **PDF Engine**       | ReportLab + FPDF2          | A4 bilingual two-column summaries            |
| **Audio Conversion** | ffmpeg                     | WebM/Opus → 16kHz mono WAV                   |
| **QR Generation**    | qrcode + Pillow            | Branch-specific QR PNGs for customer entry   |
| **HTTP Client**      | httpx                      | Async HTTP for external AI APIs              |

### AI / ML Services (External APIs)

| Service                | Provider            | Model                      | Purpose                                                                  |
| ---------------------- | ------------------- | -------------------------- | ------------------------------------------------------------------------ |
| **STT (Primary)**      | Sarvam AI           | Saarika v2.5               | Speech-to-Text for 10 Indian languages                                   |
| **STT (Fallback 1)**   | Groq Cloud          | Whisper Large-v3-Turbo     | Extremely fast fallback via Groq LPU, uses existing GROQ_API_KEY         |
| **STT (Fallback 2)**   | Reverie AI          | RevUp BFSI                 | Banking & Financial Services domain-trained STT, all 10 Indian languages |
| **LLM (Primary)**      | Groq Cloud          | Llama-3.3-70b-versatile    | Intent detection, sentiment analysis, translation, response suggestion   |
| **LLM (Fallback)**     | Google              | Gemini 2.0 Flash           | Backup LLM with circuit-breaker failover (30s cooldown)                  |
| **TTS**                | Sarvam AI           | Bulbul v3 (`suhani` voice) | Text-to-Speech in 10 Indian languages                                    |
| **Language Detection** | Sarvam AI / Whisper | Auto-detect mode           | Identify spoken language from audio clip                                 |

### Frontend

| Layer                | Technology           | Version                          |
| -------------------- | -------------------- | -------------------------------- |
| **Framework**        | React                | 19.2.4                           |
| **Build Tool**       | Vite                 | 8.0.x                            |
| **State Management** | Zustand              | 5.0.12 (with Immer middleware)   |
| **Routing**          | React Router DOM     | 7.13.x                           |
| **Styling**          | Tailwind CSS         | 3.4.x                            |
| **Animations**       | Framer Motion        | 12.38.x                          |
| **Charts**           | Recharts             | 3.8.x (Staff Panel analytics)    |
| **Icons**            | Lucide React         | 1.6+                             |
| **HTTP Client**      | Axios                | 1.13.6                           |
| **Notifications**    | React Hot Toast      | 2.6.0                            |
| **Real-Time**        | Native WebSocket API | Custom hooks with auto-reconnect |

### Languages Supported

Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, Odia, Punjabi, Gujarati, Malayalam — displayed in native scripts (हिंदी, मराठी, தமிழ், తెలుగు, বাংলা, ಕನ್ನಡ, ଓଡ଼ିଆ, ਪੰਜਾਬੀ, ગુજરાતી, മലയാളം)

---

## How to Run Locally

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** & npm
- **PostgreSQL 14+** (running)
- **Redis 7+** (running)
- **ffmpeg** (installed and on PATH — required for audio conversion)

### Step-by-step

#### Terminal 1 — Backend

```bash
# 1. Clone the repo
git clone https://github.com/your-team/VaaniBank-AI.git
cd VaaniBank-AI

# 2. Setup Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt

# 3. Configure environment
#    A .env file already exists with defaults.
#    Edit backend/.env — set your own API keys:
#      SARVAM_API_KEY, GROQ_API_KEY, GEMINI_API_KEY,
#      REVERIE_APP_ID, REVERIE_API_KEY
#    See "Environment Variables" section below for the full list.

# 4. Create PostgreSQL role and database
#    (ensure PostgreSQL is running)
#    Open psql as superuser and run:
psql -U postgres
```

```sql
CREATE ROLE vaanibank WITH LOGIN PASSWORD 'vaanibank12345';
CREATE DATABASE vaanibank_db OWNER vaanibank;
GRANT ALL PRIVILEGES ON DATABASE vaanibank_db TO vaanibank;
\q
```

```bash
# 5. Create required storage directories
mkdir -p storage/audio storage/summaries storage/signatures   # macOS/Linux
# mkdir storage\audio storage\summaries storage\signatures    # Windows (CMD)

# 6. Run database migrations (creates all 10 tables)
alembic upgrade head

# 7. Seed the database with demo data
#    (3 branches, 3 staff members, 19 process steps across 6 intents)
python seed_data.py

# 8. Start the backend server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 2 — Staff Panel

```bash
# From repo root:
cd frontend/staff-panel
npm install
npm run dev                    # → http://localhost:5173
```

#### Terminal 3 — Customer Panel

```bash
# From repo root:
cd frontend/customer-panel
npm install
npm run dev                    # → http://localhost:5174
```

> **Note:** Both frontend panels have `.env.development` files pre-configured to point to `http://localhost:8000` (backend). No additional frontend env setup is needed for local development.

#### Open in Browser

| Panel              | URL                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Staff Panel**    | [http://localhost:5173](http://localhost:5173)                                       |
| **Customer Panel** | [http://localhost:5174/?branch=NGP-CVL-01](http://localhost:5174/?branch=NGP-CVL-01) |

### Demo Credentials (Staff Login)

| Staff ID      | Username | Password  | Role   | Branch             |
| ------------- | -------- | --------- | ------ | ------------------ |
| `UBI-NGP-001` | `demo`   | `demo123` | Teller | Nagpur Civil Lines |

### Environment Variables

```bash
# ═══ Database ═══
DATABASE_URL=postgresql://vaanibank:vaanibank12345@localhost:5432/vaanibank_db

# ═══ Redis ═══
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1

# ═══ JWT ═══
JWT_SECRET_KEY=your-256-bit-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=8

# ═══ Sarvam AI (STT Primary + TTS) ═══
# Get from: https://sarvam.ai → Dashboard → API Keys
SARVAM_API_KEY=your-sarvam-subscription-key
SARVAM_STT_URL=https://api.sarvam.ai/speech-to-text
SARVAM_TTS_URL=https://api.sarvam.ai/text-to-speech
SARVAM_TTS_MODEL=bulbul:v3

# ═══ Reverie RevUp (STT Fallback 2 — BFSI-trained, all 10 Indian languages) ═══
# Get from: revup.reverieinc.com → Dashboard → API Keys
REVERIE_APP_ID=your-reverie-app-id
REVERIE_API_KEY=your-reverie-api-key

# ═══ Groq (LLM + STT Fallback 1 via Whisper Large-v3-Turbo) ═══
# Get from: https://console.groq.com → API Keys
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=1000

# ═══ Google Gemini (LLM Fallback — circuit-breaker auto-failover) ═══
# Get free key from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash

# ═══ File Storage ═══
AUDIO_STORAGE_PATH=./storage/audio
SUMMARY_STORAGE_PATH=./storage/summaries
SIGNATURE_STORAGE_PATH=./storage/signatures

# ═══ App ═══
APP_ENV=development
APP_PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
DEMO_MODE=true
APP_URL=https://vaanibank-customer.netlify.app
```

---

## Project Structure

```
VaaniBank-AI/
├── backend/
│   ├── main.py                          # FastAPI app entry, lifespan, CORS, router mounts
│   ├── config.py                        # Pydantic BaseSettings — all env var loading
│   ├── database.py                      # Async SQLAlchemy engine + Redis client
│   ├── models.py                        # 10 SQLAlchemy ORM models (Branch, Staff, Session, etc.)
│   ├── schemas.py                       # 50+ Pydantic v2 request/response schemas
│   ├── seed_data.py                     # Database seeder (3 branches, 3 staff, 19 process steps)
│   ├── intent_engine.py                 # Intent classification engine
│   ├── language_config.py               # Language code mappings & configuration
│   ├── process_loader.py                # Banking process step loader
│   ├── requirements.txt                 # Python dependencies
│   ├── render.yaml                      # Render.com deployment blueprint
│   ├── Procfile                         # Process runner config
│   ├── build.sh                         # Production build script
│   ├── alembic.ini                      # Database migration config
│   │
│   ├── core/
│   │   ├── security.py                  # JWT creation/validation, bcrypt, RBAC dependencies
│   │   ├── exceptions.py                # 12 custom exceptions + global error handlers
│   │   ├── guards.py                    # Route guard utilities
│   │   └── language.py                  # Language utility functions
│   │
│   ├── routers/
│   │   ├── auth.py                      # /auth/* — login, logout, refresh, me
│   │   ├── sessions.py                  # /sessions/* — CRUD + WebSocket /ws/{token}
│   │   ├── ai_pipeline.py               # /stt/*, /llm/*, /tts/* — AI pipeline endpoints
│   │   ├── summary.py                   # /summary/*, /process/*, /analytics/*, /branches/*/qr
│   │   ├── staff.py                     # Staff management endpoints
│   │   ├── forms.py                     # /forms/* — SaralForm submit + signature download [NEW]
│   │   └── _pipeline_helpers.py         # Shared AI pipeline utility functions
│   │
│   ├── services/
│   │   ├── ai_service.py                # Core AI singleton — STT→LLM→TTS orchestration
│   │   ├── pipeline_orchestrator.py     # Multi-stage AI pipeline coordinator
│   │   ├── session_navigator.py         # State-first process navigator for guided flows
│   │   ├── pii_service.py               # PII detection & masking (Aadhaar, PAN, phone, etc.)
│   │   ├── pdf_service.py               # ReportLab bilingual PDF generator
│   │   ├── cbs_service.py               # Core Banking System integration service
│   │   └── document_service.py          # Document verification service
│   │
│   ├── config/
│   │   ├── intent_guidance.yaml         # Externalized intent-specific LLM prompt guidance
│   │   └── document_registry.py         # Banking document type registry & validation
│   │
│   ├── processes/                       # Banking process definitions (JSON)
│   │   ├── account_opening.json         # Account opening step definitions
│   │   ├── personal_loan.json           # Personal loan process
│   │   ├── home_loan.json               # Home loan process
│   │   ├── education_loan.json          # Education loan process
│   │   ├── vehicle_loan.json            # Vehicle loan process
│   │   ├── fixed_deposit.json           # Fixed deposit process
│   │   ├── cibil_info.json              # CIBIL score information
│   │   └── default.json                 # Default fallback process
│   │
│   ├── websocket/
│   │   └── manager.py                   # ConnectionManager — event broadcasting & routing
│   │
│   ├── middleware/
│   │   └── rate_limit.py                # API rate limiting middleware
│   │
│   ├── models/                          # Extended model modules
│   │   └── whisper/                     # Whisper model integration
│   │
│   ├── migrations/                      # Alembic database migrations
│   │   ├── env.py
│   │   └── versions/                    # Migration version files
│   │
│   └── storage/
│       ├── audio/                       # Generated TTS audio files (.wav)
│       ├── summaries/                   # Generated PDF summary files (.pdf)
│       └── signatures/                  # Customer signature PNG files [NEW]
│
├── frontend/
│   ├── staff-panel/                     # Staff-facing desktop web app (port 5173)
│   │   └── src/
│   │       ├── App.jsx                  # Router: /login, /, /history, /admin, /analytics
│   │       ├── main.jsx                 # React DOM entry point
│   │       ├── index.css                # Global + Tailwind base styles
│   │       ├── theme.css                # CSS variables — light/dark mode theming
│   │       ├── constants.js             # API_BASE_URL, languages, brand colors
│   │       ├── bankingKnowledge.js       # Banking domain knowledge base
│   │       ├── context/
│   │       │   └── AppContext.jsx       # Zustand store (auth, theme, session state)
│   │       ├── hooks/
│   │       │   ├── useWebSocket.js      # WS connection, reconnect, message routing
│   │       │   └── useAudio.js          # MediaRecorder + Audio playback
│   │       ├── services/
│   │       │   └── api.js               # Axios instance + all API wrappers
│   │       ├── pages/
│   │       │   ├── LoginPage.jsx        # Union Bank branded login + Demo Helper
│   │       │   ├── DashboardPage.jsx    # Main 3-column operational screen
│   │       │   ├── HistoryPage.jsx      # Past sessions table + Recharts analytics
│   │       │   ├── AdminPage.jsx        # Admin control panel
│   │       │   ├── ManagerPage.jsx      # Manager dashboard & oversight
│   │       │   ├── AnalyticsPage.jsx    # Branch analytics & reporting
│   │       │   ├── KnowledgePage.jsx    # Banking knowledge base viewer
│   │       │   └── SettingsPage.jsx     # User settings & preferences
│   │       └── components/
│   │           ├── dashboard/
│   │           │   ├── ConversationPanel.jsx    # Live bilingual chat + sentiment badges
│   │           │   ├── AISuggestionBox.jsx      # AI response + approve/edit/discard CTAs
│   │           │   ├── ProcessPanel.jsx         # Gamified RBI step checklist + navigator
│   │           │   ├── InfoBoard.jsx            # Real-time entity collection dashboard
│   │           │   ├── SmartNavigator.jsx        # State-first guided process navigator
│   │           │   └── BilingualSummary.jsx      # Post-session bilingual PDF viewer
│   │           └── layout/
│   │               ├── TopBar.jsx       # Header with branch info + connection status
│   │               ├── Sidebar.jsx      # Navigation sidebar
│   │               └── BottomBar.jsx    # Action bar with mic + AI hints
│   │
│   ├── customer-panel/                  # Customer-facing mobile-first PWA (port 5174)
│   │   └── src/
│   │       ├── App.jsx                  # Router: /, /session/:token, /saral-form, /summary/:id
│   │       ├── main.jsx                 # React DOM entry point
│   │       ├── index.css                # Global styles
│   │       ├── theme.css                # CSS variables — light/dark mode
│   │       ├── constants.js             # API_BASE_URL, language configs
│   │       ├── demoData.js              # Demo mode scripted conversations
│   │       ├── context/
│   │       │   └── AppContext.jsx       # Zustand store (theme, session state)
│   │       ├── hooks/
│   │       │   ├── useWebSocket.js      # WS connection for customer role
│   │       │   └── useAudio.js          # Push-to-talk recording + auto-playback
│   │       ├── services/
│   │       │   └── api.js               # Axios + customer API wrappers (no auth)
│   │       ├── pages/
│   │       │   ├── LanguageSelectPage.jsx    # 10-language grid (QR entry point)
│   │       │   ├── LiveSessionPage.jsx       # Core voice interaction screen
│   │       │   ├── WaitingPage.jsx           # Waiting for staff connection
│   │       │   ├── SaralFormPage.jsx         # Pre-filled form review + signature canvas [NEW]
│   │       │   └── SummaryPage.jsx           # Bilingual summary + PDF download
│   │       └── components/
│   │           └── DocumentChecklist.jsx     # Document requirement checklist
│   │
│   └── shared/                          # Shared frontend utilities
│
├── website_logo.png                     # VaaniBank AI brand logo
└── README.md                            # ← This file
```

---

## Dataset & Knowledge Base (RAG)

All data used in VaaniBank AI is **100% synthetic**, generated by our team using `seed_data.py`. No real bank customer data is used at any point.

### Structured Data (Seeded)

The seeder populates:

- **3 Union Bank branches** across Maharashtra & Tamil Nadu (Nagpur, Mumbai, Chennai)
- **3 demo staff members** across roles: Teller, Manager, Supervisor
- **19 process steps** across 6 banking intents, each with translations in **8 Indian languages**
- **8 banking process definitions** (JSON) covering account opening, personal/home/education/vehicle loans, fixed deposits, and CIBIL information

### Retrieval-Augmented Generation (RAG) Dataset

The system includes a comprehensive Markdown-based knowledge base used for **Semantic RAG retrieval**, ensuring the AI provides grounded, factual banking information.

| Category       | Files                                               | Content Highlights                                                 |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| **Compliance** | `rbi_rules.md`                                      | RBI 2024 guidelines, KYC circulars, Grievance TAT                  |
| **Loans**      | `home_loan.md`, `personal_loan.md`                  | Rates, eligibility, margin, repayment rules                        |
| **Products**   | `savings_account.md`, `fixed_deposit.md`            | QAB requirements, interest rates, account variants                 |
| **Processes**  | `account_opening_sop.md`, `loan_application_sop.md` | Step-by-step SOPs for branch staff                                 |
| **KYC**        | `kyc_update.md`                                     | Re-KYC cycles, valid documents (OVD), masking rules                |
| **Glossary**   | `banking_glossary.md`                               | Definitions of Indian banking jargon (e.g., _mortgage_, _nominee_) |
| **Scripts**    | `staff_response_scripts.md`                         | Recommended conversational scripts for staff                       |

#### RAG Architecture & Ingestion

- **Local Vector Store**: [ChromaDB](https://www.trychroma.com/) used for low-latency, zero-cost persistent storage.
- **Hybrid Retrieval**: Combines **Dense Vector Search** (`multilingual-e5-small`) with **Sparse Keyword Search** (`BM25Okapi`) for exact term matching.
- **Cross-Encoder Reranking**: Uses `ms-marco-MiniLM-L-6-v2` for a high-precision final pass on retrieved chunks.
- **Ingestion Script**: Run `python ingest_kb.py` to embed all knowledge base files into ChromaDB.

### Official Knowledge Source

- **`ubi_knowledge_base.yaml`**: The single source of truth for official Union Bank of India (UBI) knowledge, including current interest rates and product features.
- **`intent_guidance.yaml`**: Context-specific LLM instructions for each banking intent.
- **`data.md`**: Detailed technical implementation summary of the knowledge base upgrades (v2.5).

---

## AI Pipeline Architecture

```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Customer    │───▶│  STT        │───▶│  PII Mask    │───▶│  LLM        │
│  Audio (WebM)│    │  (3-Level   │    │  (Regex)     │    │  Groq/Gemini│
└──────────────┘    │  Fallback)  │    └──────────────┘    └──────┬──────┘
                    └─────────────┘                               │
        ┌─────────────────────────────────────────────────────────┘
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌───────────────┐
│ Translation  │    │ Intent       │    │ Sentiment     │
│ Hindi ↔ Lang │    │ Detection    │    │ Analysis      │
└──────────────┘    └──────────────┘    └───────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌───────────────┐
│ Staff Panel  │    │ Process Step │    │ Entity        │
│ Suggestion   │    │ Navigator    │    │ Extraction    │
└──────┬───────┘    └──────────────┘    └───────────────┘
       │ (staff approves/edits)
       ▼
┌──────────────┐    ┌──────────────┐
│   TTS        │───▶│  Customer    │
│ (Sarvam AI)  │    │  Audio Play  │
└──────────────┘    └──────────────┘
```

### Key AI Capabilities

- **3-Level STT Fallback Chain**: Sarvam Saarika v2.5 → Groq Whisper Large-v3-Turbo (LPU) → Reverie RevUp BFSI (banking-domain) — ensures transcription never fails
- **Dual LLM with Circuit Breaker**: Groq Llama-3.3-70b (primary) → Gemini 2.0 Flash (fallback). Circuit breaker opens after 3 consecutive failures, auto-resets after 30 seconds
- **Structured JSON Output from LLM**: Translation, intent, sentiment, suggested response, banking terms, entity extraction — all in one call
- **Two-Phase Conversation Intelligence**: Detects whether customer is _exploring_ (asking for info) or _ready to apply_ (wants to proceed) — educates first, collects data only when ready
- **Persistent Conversation Memory**: Collected entity data persists in DB and is injected into every LLM call, preventing repeated questions
- **PII Detection & Masking**: Aadhaar, PAN, phone, account numbers, DOB — all automatically detected and masked per RBI 2024 guidelines

### Intent Categories

`account_opening` · `loan_enquiry` · `kyc_update` · `card_services` · `balance_enquiry` · `fixed_deposit` · `general`

### Sentiment Categories

`calm` · `frustrated` · `confused` · `urgent`

---

## ✨ SaralForm — AI-Powered Digital Form Verification

SaralForm is a **paperless mid-session digital form** that auto-fills all AI-extracted customer information and collects the customer's digital signature directly on the kiosk screen — eliminating the manual teller re-entry step that wastes ~2.6 hours per teller per day.

### The Problem It Solves

```
Traditional Flow (WITHOUT SaralForm):
  AI collects 14 fields from voice conversation
        ↓
  Session ends
        ↓
  Teller manually re-types every field into paper form A-101 / LA-201 / KYC-07
        ↓
  8 min × 20 customers = 2.6 hours wasted per teller per day
```

### The SaralForm Flow

```
Staff clicks "Send to Form Verification" on the ProcessPanel
        ↓
Customer Panel automatically navigates to /saral-form
        ↓
All 14+ fields pre-filled from session.collected_data (AI-extracted)
        ↓
Customer reviews fields — taps any field to correct errors
        ↓
Customer draws digital signature on HTML5 canvas (touch/stylus/mouse)
        ↓
POST /forms/submit → fields merged into DB, signature saved as PNG
        ↓
Staff Panel receives "Form Signed ✅" WebSocket notification + download button
        ↓
Customer returns to live session (conversation continues until staff ends session)
```

### SaralForm Architecture

```
[Customer Panel]              [Backend]                    [Staff Panel]
      │                           │                               │
   staff clicks                   │                               │
  "Send to Form                   │                               │
   Verification"                  │                               │
      │                           │                               │
   saral_form_trigger ────────────→                               │
   WS event (carries              │                               │
   collected_data,                │                               │
   intent, lang_code)             │                               │
      │                           │                               │
   navigate("/saral-form")        │                               │
      │                           │                               │
   SaralFormPage renders          │                               │
   (14+ pre-filled fields)        │                               │
      │                           │                               │
   Customer edits + signs         │                               │
      │                           │                               │
   POST /forms/submit ────────────→                               │
                              saves to DB                         │
                              ws_manager.send_to_staff() ────────→│
                                                          "form_signed"
                                                          toast + download
      │
   navigate back to
   /session/:token
   (live session continues)
```

### SaralForm API Endpoints

| Method | Endpoint                          | Description                                                                                                                                           |
| ------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/forms/submit`                   | Customer submits pre-filled + signed form. Merges `confirmed_fields` into `session.collected_data`, saves signature PNG, notifies staff via WebSocket |
| `GET`  | `/forms/signature/{token_number}` | Staff downloads customer signature PNG by token number                                                                                                |

### Banking Form References

| Intent            | Form Code | Form Name                  |
| ----------------- | --------- | -------------------------- |
| `account_opening` | `A-101`   | Account Opening Form       |
| `loan_enquiry`    | `LA-201`  | Loan Application Form      |
| `kyc_update`      | `KYC-07`  | KYC Update Form            |
| `card_services`   | `CS-301`  | Card Application Form      |
| `fixed_deposit`   | `FD-501`  | Fixed Deposit Opening Form |
| `general`         | `GQ-601`  | General Query Log          |

### Bilingual Field Labels (10 Indian Languages)

SaralForm renders every field with an English label and the customer's native language label directly below it. All 14 fields are pre-wired in the `FIELD_LABELS` constant inside `SaralFormPage.jsx`:

| Field          | Hindi         | Tamil               | Telugu        | Bengali      |
| -------------- | ------------- | ------------------- | ------------- | ------------ |
| Customer Name  | ग्राहक का नाम | வாடிக்கையாளர் பெயர் | కస్టమర్ పేరు  | গ্রাহকের নাম |
| Monthly Income | मासिक आय      | மாதாந்திர வருமானம்  | నెలవారీ ఆదాయం | মাসিক আয়    |
| Aadhaar Card   | आधार कार्ड    | ஆதார் அட்டை         | ఆధార్ కార్డ్  | আধার কার্ড   |
| PAN Card       | पैन कार्ड     | பான் கார்டு         | పాన్ కార్డ్   | প্যান কার্ড  |
| Phone Number   | मोबाइल नंबर   | மொபைல் எண்          | ఫోన్ నంబర్    | ফোন নম্বর    |

> All 10 languages (hi, mr, ta, te, bn, kn, gu, pa, or, ml) are fully supported with native-script Noto fonts.

### SaralForm Screen Flow

**Step 1 — Review Fields**

```
┌─────────────────────────────────────────────┐
│ SaralForm             Union Bank of India    │
│                              Token: NJT-1267 │
├─────────────────────────────────────────────┤
│  ●————————————○                             │
│  Review Fields      Sign                    │
├─────────────────────────────────────────────┤
│ Customer Name *                             │
│ ग्राहक का नाम                              │
│ ┌─────────────────────────────────────────┐ │
│ │ Ramesh Kumar                         ✏️ │ │   ← tap to correct
│ └─────────────────────────────────────────┘ │
│                                             │
│ Monthly Income (₹)                          │
│ मासिक आय                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ 35000                                ✏️ │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Aadhaar Card    ☑ Provided ✓               │
│                                             │
│    ┌─────────────────────────────────────┐  │
│    │  Looks Good — Proceed to Sign  →   │  │
│    └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Step 2 — Digital Signature**

```
┌─────────────────────────────────────────────┐
│  ●————————————●                             │
│  Review Fields      Sign                    │
├─────────────────────────────────────────────┤
│ Sign using your finger or stylus.           │
│ यहाँ हस्ताक्षर करें                         │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │    ~ Ramesh Kumar ~  (drawn)            │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│  [ Clear ]  [ ← Back to Review ]           │
│                                             │
│    ┌─────────────────────────────────────┐  │
│    │ ✓  Submit Signed Form               │  │
│    └─────────────────────────────────────┘  │
│                                             │
│  🔒 Encrypted per RBI guidelines            │
└─────────────────────────────────────────────┘
```

**Staff Panel Notification (After Submission)**

```
┌─────────────────────────────────────────────────┐
│  ✅  Form Signed!                                │
│      Customer has signed A-101                   │
│      Token: NJT-1267                             │
│                                 [ 📥 Signature ] │
│                                              ✕   │
└─────────────────────────────────────────────────┘
```

### SaralForm Database Change

A single new column is added to the `sessions` table:

```python
form_signed_at = Column(
    DateTime(timezone=True),
    nullable=True,
    comment="Set when customer submits the signed SaralForm",
)
```

Run migration with:

```bash
cd backend
alembic revision --autogenerate -m "add_form_signed_at_to_sessions"
alembic upgrade head
```

---

## Model Performance (on Synthetic Test Data)

### Speech-to-Text (STT)

| Model                  | Provider         | Languages Tested                                                                    | Avg. Confidence | Latency |
| ---------------------- | ---------------- | ----------------------------------------------------------------------------------- | --------------- | ------- |
| Sarvam Saarika v2.5    | Sarvam AI        | Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, Odia, Punjabi, Gujarati, Malayalam | 0.85            | ~1.2s   |
| Whisper Large-v3-Turbo | Groq Cloud (LPU) | All 10 Indian languages                                                             | 0.90            | ~0.8s   |
| RevUp BFSI             | Reverie AI       | All 10 Indian languages (banking-domain)                                            | 0.85            | ~1.5s   |

### LLM (Groq Llama-3.3-70b primary + Gemini 2.0 Flash fallback)

| Metric                           | Score                                            |
| -------------------------------- | ------------------------------------------------ |
| Intent Detection Accuracy        | ~92% (on synthetic banking dialogues)            |
| Translation Quality (subjective) | High for major languages (Hindi, Marathi, Tamil) |
| Avg. Response Latency            | ~0.8s                                            |
| Context Window Utilization       | Last 6 exchanges + persistent collected_info     |

### TTS (Sarvam Bulbul v3)

| Metric               | Value                       |
| -------------------- | --------------------------- |
| Supported Languages  | 10 Indian languages         |
| Voice                | `suhani` (female)           |
| Sample Rate          | 22050 Hz                    |
| Avg. Generation Time | ~1.5s                       |
| Redis Cache Hit Rate | ~40% (for repeated phrases) |

> **Note**: These results are on synthetic/demo data. Performance on real bank branch audio (noisy environments, dialectal variation) would require field testing and fine-tuning.

---

## Known Limitations

We believe in transparency — here are the current limitations:

- **Synthetic data only** — trained and tested on generated data; real branch audio with background noise, dialectal accents, and code-switching would require adaptation.
- **Single-server WebSocket** — `ConnectionManager` maintains state in-memory (`active_connections` dict); not distributed across multiple server instances. Horizontal scaling would require Redis Pub/Sub or similar.
- **Single TTS provider** — currently relies solely on Sarvam Bulbul v3 for TTS; no fallback TTS engine is configured. If Sarvam API is down, TTS fails gracefully.
- **Simulated CBS integration** — `cbs_service.py` generates deterministic fake customer profiles using hashing; actual Core Banking System APIs (Finacle, BaNCS) would require bank-side OAuth2 integration.
- **LLM context window** — retains last 6 conversation exchanges (`[-6:]` slice in `ai_service.py`); very long sessions may lose early context (mitigated by persistent `collected_data` injected as `[SYSTEM CONTEXT]` into every LLM call).
- **Internet dependency** — all three STT engines (Sarvam, Groq Whisper, Reverie) and TTS require internet access; no offline-only STT is available.
- **SaralForm signature storage** — signatures are stored as local PNG files; production deployment should move this to Cloudflare R2 or equivalent object storage for durability.

---

## Team

| Name         | Contribution                                                                         |
| ------------ | ------------------------------------------------------------------------------------ |
| **[Name 1]** | Full-stack architecture, AI pipeline (STT→LLM→TTS), WebSocket system                 |
| **[Name 2]** | Backend services, database design, PII compliance, PDF generation                    |
| **[Name 3]** | Staff Panel frontend, dashboard components, analytics visualizations                 |
| **[Name 4]** | Customer Panel frontend, mobile-first UX, SaralForm, domain research & documentation |

**Team Name:** Vectora  
**Institute:** [Your College Name]  
**Hackathon:** iDEA 2.0 — PSBs Hackathon 2026  
**Partner Bank:** Union Bank of India

---

## Contact

For any queries about this submission:

|                |                                        |
| -------------- | -------------------------------------- |
| **Team Name**  | Vectora                                |
| **Institute**  | [Your College Name]                    |
| **Email**      | [team-email@example.com]               |
| **Submission** | iDEA 2.0 Phase 2 — Problem Statement 6 |

---

<p align="center">
  <img src="website_logo.png" alt="VaaniBank AI" width="200"/>
  <br/>
  <em>Built with ❤️ by Team Vectora for Union Bank of India</em>
  <br/>
  <strong>iDEA 2.0 — PSBs Hackathon 2026</strong>
</p>
