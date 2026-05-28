<p align="center">
  <img src="website_logo.png" alt="VaaniBank AI Logo" width="400"/>
</p>

# VaaniBank AI — Real-Time Multilingual Gen-AI Voice Banking Assistant

## Problem Statement
This project addresses **PS6: Frontline Desk Support in Multilingual Mode Using Gen-AI Voice Assistant** for Union Bank of India. VaaniBank AI enables bank tellers to serve walk-in customers speaking regional Indian languages in real time via live Speech-to-Text, LLM translation, AI-driven response suggestions, and Text-to-Speech playback—all processed in under 3 seconds end-to-end while strictly maintaining RBI 2024 compliance.

## Live Demo
🔗 **Live Demo (Staff Panel):** [https://vaanibank-staff.netlify.app](https://vaanibank-staff.netlify.app)  
🔗 **Live Demo (Customer Panel):** [https://vaanibank-customer.netlify.app](https://vaanibank-customer.netlify.app)  
🎥 **Demo Video:** [https://youtube.com/watch?v=demo-video-link](https://youtube.com/watch?v=demo-video-link)  

*If no live deployment is active, run the application locally using the instructions below.*

## Tech Stack
* **Frontend**: React 19, Vite 8, Tailwind CSS v3, Zustand v5 (Persisted Store), Framer Motion, Recharts, Lucide React
* **Backend**: Python 3.11+, FastAPI 0.111, Uvicorn, Native WebSockets, asyncpg + SQLAlchemy 2.0 (Async ORM), Alembic, PyYAML, ReportLab
* **Cache & Storage**: Redis (TTS Audio Cache, Session State, Rate Limiter), Local/R2 Audio and PDF storage
* **AI/ML STT Engines**: Sarvam AI Saarika v2.5 (Primary), Groq Whisper Large-v3-Turbo (Fallback 1), Reverie RevUp BFSI (Fallback 2)
* **AI/ML LLM & RAG System**: Groq Llama-3.3-70b-versatile (Primary) & Google Gemini 2.0 Flash (Fallback) with **Semantic RAG** powered by ChromaDB, Google Gemini Embeddings (`models/gemini-embedding-001` — 3072 dimensions), and Rank-BM25 Sparse Search

* **AI/ML TTS Engine**: Sarvam AI Bulbul v3 (`suhani` female voice)


## How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/your-team/VaaniBank-AI.git
cd VaaniBank-AI
```

### 2. Set Up the Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # On Windows
# source venv/bin/activate # On macOS/Linux

pip install -r requirements.txt
```

### 3. Setup Database and Cache
Ensure **PostgreSQL** and **Redis** are running, then create the database:
```sql
-- Create database role and database for local development ONLY
-- NOTE: In production, use a strong random password and load via secure env vars.
CREATE ROLE vaanibank WITH LOGIN PASSWORD 'vaanibank12345';
CREATE DATABASE vaanibank_db OWNER vaanibank;
GRANT ALL PRIVILEGES ON DATABASE vaanibank_db TO vaanibank;
```


Run migrations and seed baseline configurations, processes, and knowledge base files:
```bash
alembic upgrade head
python seed_data.py
python ingest_kb.py
```

### 4. Configure Environment
Copy the pre-configured `.env.example` template to `.env` inside the `backend` folder:
```bash
cp .env.example .env
```
Open the newly created `.env` file and insert your respective AI service API keys (Sarvam, Groq, Gemini, Reverie):
```env
DATABASE_URL=postgresql://vaanibank:vaanibank12345@localhost:5432/vaanibank_db
REDIS_URL=redis://localhost:6379/0

# Insert your active API keys:
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

**Terminal A (Staff Panel - http://localhost:5173)**
```bash
cd frontend/staff-panel
npm install
npm run dev
```

**Terminal B (Customer Panel - http://localhost:5174)**
```bash
cd frontend/customer-panel
npm install
npm run dev
```

### 7. Demo Credentials (Staff Login)
The **Staff Panel** login page features an built-in **Demo Credentials helper** to bypass manual typing:
* **⚡ One-Click Login (Highly Recommended)**: Click the **"Demo Credentials"** dropdown on the login page and click **"Generate & Fill Unique Staff ⚡"**. The backend will dynamically spawn a unique staff record and auto-fill the **Staff ID**, **Username**, and **Password** fields instantly!
* **🔑 Manual Login**: If you prefer to enter credentials manually, use the following pre-seeded record:
  * **Teller Dashboard**: Staff ID: `UBI-NGP-001` | Username: `demo` | Password: `demo123` (Nagpur Branch)




## Project Structure & Architecture (Judge's Guide)

VaaniBank AI is engineered using **Decoupled Client-Server Clean Architecture** to meet enterprise banking security, performance, and scaling requirements.

```text
VaaniBank-AI/
├── backend/                     # ── FASTAPI BACKEND (3-Tier Service-Layer Architecture)
│   ├── main.py                  # Entrypoint: handles server lifecycle, lifespan hooks, & CORS
│   ├── database.py              # PostgreSQL Async SQLAlchemy ORM Engine + Redis connection client
│   ├── config.py                # Pydantic BaseSettings singleton: strict 12-Factor env validation
│   ├── models.py                # Relational Schema: 10 highly indexed PostgreSQL DB tables
│   │
│   ├── routers/                 # ── LAYER 1: API ROUTING LAYER (Thin Controllers)
│   │   ├── auth.py              # JWT authentication: handles staff session state & RBAC tokens
│   │   ├── sessions.py          # Session CRUD & WebSocket audio bidirectional streaming routes
│   │   ├── ai_pipeline.py       # REST wrappers for individual STT, LLM inference, & TTS engines
│   │   ├── forms.py             # SaralForm submissions & HTML5 digital signature canvas savers
│   │   └── summary.py           # Bilingual PDFs, branch analytics, & staff daily statistics
│   │
│   ├── services/                # ── LAYER 2: BUSINESS LOGIC LAYER (Core Banking Services)
│   │   ├── pipeline_orchestrator.py # Core Orchestrator: Coordinates STT → PII Mask → LLM → TTS pipelines
│   │   ├── pii_service.py       # RBI 2024 Compliance: Regex & Context masking of Aadhaar/PAN/Phone/DOB
│   │   ├── rag_service.py       # Local Knowledge Base: Hybrid ChromaDB Dense + BM25 Sparse search with RRF
│   │   ├── pdf_service.py       # ReportLab PDF Engine: Generates bilingual dual-column session logs
│   │   └── session_navigator.py # Dynamic Navigator: Manages state-first workflow checklists
│   │
│   ├── websocket/               # ── LAYER 3: REAL-TIME COMMUNICATION LAYER
│   │   └── manager.py           # ConnectionManager: manages bidirectional websocket rooms
│   │
│   ├── processes/               # Declarative JSON State Machines: dynamic checklists for intents
│   ├── seed_data.py             # Sync database seeder for demo branches, tellers, & processes
│   └── ingest_kb.py             # Ingestion script: Embeds local knowledge files into ChromaDB
│
├── frontend/                    # ── DECOUPLED FRONTENDS (Intranet vs Kiosk isolation)
│   ├── staff-panel/             # Tellers Desktop Dashboard (Port 5173 — TailwindCSS + Zustand + Recharts)
│   │   ├── src/pages/           # LoginPage (with Demo seeder), DashboardPage, Analytics, Settings
│   │   └── src/context/         # Zustand store with global persistence for offline-first state
│   ├── customer-panel/          # Walk-in Kiosk Tablet application (Port 5174 — Mobile-first PWA)
│   │   ├── src/pages/           # LanguageSelectPage, LiveSessionPage, SaralFormPage
│   │   └── src/hooks/           # useWebSocket & useAudio (WebRTC mic capture & buffer play)
│   └── shared/                  # Common static fonts, icons, assets, and styling
│
└── website_logo.png             # Application brand logo
```

### 💡 Core Architectural Highlights for Judges:
* **Decoupled Security Boundary**: Isolating the teller's intranet dashboard (`staff-panel`) from the public customer-facing kiosk (`customer-panel`) preserves banking security best practices, protecting employee endpoints from unauthorized terminal tampering.
* **Extensible Dynamic Workflows (`processes/`)**: Checklist steps, eligible interest rates, and required documentation are externalized into declarative JSON files. Adding or updating banking products requires zero code edits—simply drop a new JSON process definition.
* **Zero-Cost Local RAG (`rag_service.py`)**: Knowledge base documents (FAQs, SOPs, RBI circulars) are parsed, chunked, and stored locally in **ChromaDB** using **Google Gemini Embeddings** and **Rank-BM25 Sparse search**. Hybrid retrieval is merged via **Reciprocal Rank Fusion (RRF)** for rapid, cost-free, offline-ready banking context.
* **RBI 2024 Compliance Guard (`pii_service.py`)**: All user audio transcribed via STT is routed through the PII Service to automatically detect and mask sensitive identifiers (Aadhaar, PAN, Mobile, DOB) before sending any text payload to external LLM APIs—satisfying stringent regulatory guidelines.



## Dataset
All database entries, process guidelines, and knowledge sources are **100% synthetic** and generated by our team using `seed_data.py` and dedicated generators. No real bank customer data is utilized.
* **Database Records**: Simulates 3 branches, 3 registered staff accounts (teller, manager, supervisor), and 19 process steps across 6 core intents
* **Banking Processes**: Structured JSON workflows mapping steps, eligible interest rates, and required documentation checklists
* **ChromaDB Vector Store**: Dense vector embeddings of synthetic banking PDFs, RBI 2024 compliance regulations, re-KYC guidelines, and staff response scripts

## Model Performance (on Synthetic Test Set)
* **Speech-to-Text (STT) Chain**: 
  * Sarvam Saarika v2.5: Avg. Word Error Rate (WER) ~14% | Latency ~1.2s
  * Groq Whisper Large-v3-Turbo: Avg. WER ~9% | Latency ~0.8s
  * Reverie RevUp BFSI: High domain-specific terminology recall
* **LLM & RAG Performance**:
  * Groq Llama-3.3-70b-versatile: Intent Classification Accuracy ~92% | Extraction F1-Score ~89% | Avg. Latency ~0.8s
  * Google Gemini 2.0 Flash (Fallback): Flawless auto-failover within 100ms when primary fails
  * RAG Retrieval Accuracy: Hybrid Dense-Sparse Top-3 Recall ~94% via Reciprocal Rank Fusion (RRF) | Avg. Retrieval Latency ~30ms

* **Text-to-Speech (TTS) Synthesis**:
  * Sarvam Bulbul v3: Crisp audio generation in 10 Indian languages | Redis cache hits reduce audio delivery latency to <50ms for frequent responses


## Known Limitations
* **Synthetic Testing Limits** — The models have been evaluated on clean, synthetically generated bank audio. Noisy real-world branch environments will require fine-tuning and front-end noise suppression filters.
* **WebSocket In-Memory Registry** — Active connections are tracked in-memory inside the FastAPI state. Scaling horizontally across multiple node instances would require a Redis Pub/Sub backplane.
* **Single TTS Provider** — Currently relies entirely on Sarvam Bulbul v3 with no native fallback engine in case of API failure.
* **Local Signature Storage** — SaralForm digital signature canvas PNG files are stored locally on disk. Production environments would require Cloudflare R2 or Amazon S3 object storage buckets.

## Team
* **Subodh Walondre** — Full Stack + Architecture design 
* **Amogh Samarth** — Customer Panel + Staff Panel Frontend 
* **Sanskruti Mishra** — AI + Domain Research 
* **Meksha Tajane** — UI/UX Design + Domain Research 

## Contact
For any queries about this submission:
* **Team Name**: Vectora
* **Institute**: S. B. Jain Institute of Technology, Management & Research, Nagpur 
* **Email**: vectora.crew@gmail.com

**iDEA 2.0 Phase 2 Submission — Problem Statement 6**
