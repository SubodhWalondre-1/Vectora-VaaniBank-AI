<p align="center">
  <img src="website_logo.png" alt="VaaniBank AI Logo" width="360"/>
</p>

<h1 align="center">VaaniBank AI — Problem & Solution Document</h1>

<p align="center">
  <strong>iDEA 2.0 — PSBs Hackathon 2026 | Problem Statement 6</strong><br/>
  <em>Team Vectora | Union Bank of India</em>
</p>

<p align="center">
  <em>वाणी जो हर भाषा जाने — The Voice That Knows Every Language</em>
</p>

---

# PART A: THE PROBLEM

## 1. The Problem in One Sentence

> **India's 1.5 lakh+ bank branch counters serve 400+ million walk-in customers annually, yet a frontline teller who speaks only Hindi cannot serve a Tamil, Odia, or Bengali-speaking customer without a human translator — creating service delays, data errors, mis-selling risks, and customer abandonment at the very point of inclusion that public sector banks were built to deliver.**

### Core Problem

Union Bank of India operates **8,700+ branches** across 36 states and UTs, staffed by employees who typically speak 1–2 languages. India has **22 scheduled languages** and hundreds of dialects. When a customer walks into a branch speaking a language the teller doesn't understand, one of three things happens:

1. **Service denial** — the customer is turned away or asked to "bring someone who speaks Hindi/English."
2. **Error-prone improvisation** — another customer or guard acts as an informal, untrained translator, leading to data errors in account forms, loan applications, and KYC documents.
3. **Prolonged service time** — a 5-minute account enquiry becomes a 25-minute ordeal of gesturing, phone calls, and guesswork.

This is not an edge case. **RBI's Financial Inclusion Index (March 2024)** stands at 64.2 — meaning over a third of India's population remains underserved. Language is the single largest non-economic barrier to financial inclusion at the branch level.

---

## 2. Who Is Affected and How Severely?

| Stakeholder | Impact | Scale |
|---|---|---|
| **Walk-in Customers** (rural/semi-urban) | Cannot explain their needs, receive wrong products, abandon transactions mid-way, lose trust in formal banking | **~180 million** annual branch visits in non-Hindi/non-English languages (RBI estimate) |
| **Frontline Bank Staff** (tellers, RMs) | Cannot serve customers efficiently, face longer queues, make data entry errors, risk compliance violations from miscommunication | **~2.5 lakh** PSB frontline staff across India |
| **Branch Managers** | Longer average handling time (AHT), lower customer satisfaction (CSAT), higher complaint ratios, difficulty meeting RBI's Financial Inclusion targets | **8,700+** Union Bank branches |
| **The Bank (institutional)** | Revenue leakage from abandoned transactions, regulatory risk from incorrect KYC/loan data, reputational risk in underserved regions | Estimated **₹400–600 Cr** annual opportunity cost across PSBs from language-driven service failures |
| **RBI & Government** | Financial inclusion schemes (PMJDY, DBT, Mudra, PM-SVANidhi) fail at last-mile delivery when beneficiaries can't communicate at the counter | Affects **12+ government schemes** requiring branch-level interaction |

### Real-World Scenario

> *A 58-year-old farmer from Odisha walks into a Union Bank branch in Maharashtra to enquire about a Kisan Credit Card. He speaks only Odia. The teller speaks Hindi and Marathi. Neither understands the other. The farmer leaves without the credit facility he was entitled to. This interaction — or lack thereof — happens thousands of times daily across India's banking network.*

---

## 3. Why Current Approaches Fail

| Current Approach | Why It Fails |
|---|---|
| **Human translators / bilingual staff** | Impractical at scale — banks cannot hire staff for every language combination across 8,700+ branches. Transfer policies move multilingual staff away from where they're needed. |
| **Printed multilingual forms** | Static, one-way — the customer can read a form but cannot have a conversation. Doesn't help with verbal enquiries, complaints, or complex loan discussions. |
| **Google Translate / generic translation apps** | Not designed for banking — mistranslates financial jargon ("CIBIL score", "KYC re-verification", "sweep-in FD"), doesn't handle Indian language accents well, has no banking context, doesn't provide process guidance or document checklists. |
| **IVR / phone-based language support** | Only works for phone banking — useless for in-branch walk-in customers who need face-to-face document verification, form filling, and physical signatures. |
| **Chatbots (text-based)** | Excludes the primary demographic — semi-literate and elderly customers who cannot type in any language. Voice is the only viable interface for 60%+ of rural banking customers. |
| **No existing deployed solution** | No PSB in India has deployed a real-time, voice-based, multilingual AI assistant at the branch counter that handles the full loop: listen → understand → translate → guide → respond in the customer's language. |

### The Gap We Address

```
EXISTING SOLUTIONS                         OUR SOLUTION
─────────────────                         ────────────
Text-only         →  Voice-first (speech in, speech out)
One language      →  10 Indian languages, real-time
Generic AI        →  Banking-domain trained (BFSI models)
Translation only  →  Full pipeline: translate + detect intent +
                     extract data + guide process + generate docs
No staff context  →  Staff sees everything: sentiment, documents
                     needed, process steps, AI suggestions
No compliance     →  PII masking (Aadhaar, PAN, phone) before
                     any data leaves the system
```

---

# PART B: OUR SOLUTION

## 4. What We Are Building: VaaniBank AI

**VaaniBank AI** is a **Gen-AI powered, real-time, multilingual voice assistant** designed for Union Bank of India's frontline branch staff. It enables any teller to serve any customer in any of **10 Indian languages** — even when neither speaks the other's language.

### How It Works (30-Second Pitch)

```
Customer speaks Tamil  →  AI transcribes & translates to Hindi in real-time
                       →  Staff reads Hindi on their dashboard
                       →  AI suggests a response + detects intent + extracts data
                       →  Staff approves/edits response
                       →  AI speaks the response back to the customer in Tamil
                       →  Entire session generates a bilingual PDF summary
```

### The Three Interfaces

| Interface | User | Device | Purpose |
|---|---|---|---|
| **Customer Panel** | Walk-in customer | Tablet / kiosk at counter | Speak in native language, hear responses, see document checklist |
| **Staff Panel** | Bank teller / RM | Desktop browser | Real-time translated conversation, AI suggestions, process guidance, entity tracking |
| **Backend API** | System | Cloud server | AI pipeline orchestration, WebSocket routing, data persistence |

---

## 5. Core Features of Our POC (All Demonstrable)

### 🎙️ Feature 1: Three-Level STT Fallback Chain
> *"Transcription never fails — even if one AI provider goes down."*

| Level | Provider | Model | Strength |
|---|---|---|---|
| **Primary** | Sarvam AI | Saarika v2.5 | Fastest (~1s), optimized for Indian languages |
| **Fallback 1** | Groq Cloud | Whisper Large-v3-Turbo | Highest accuracy (0.90), LPU-accelerated |
| **Fallback 2** | Reverie AI | RevUp BFSI | **Banking-domain trained** — handles "CIBIL", "KYC", "NEFT" |

If Sarvam is down → Groq handles it. If Groq fails → Reverie catches domain-specific terms. **Zero single point of failure.**

### 🧠 Feature 2: Intelligent AI Pipeline (Single-Call LLM)

One LLM call (Groq Llama-3.3-70b) processes **7 outputs simultaneously**:

| Output | Example |
|---|---|
| **Translation** | Tamil → Hindi |
| **Intent Detection** | `loan_enquiry` (92% accuracy) |
| **Sentiment Analysis** | `frustrated` → triggers empathy response |
| **Suggested Response** | Natural Hindi response staff can speak |
| **Customer-Language Response** | Same response in Tamil for TTS |
| **Entity Extraction** | `{loan_type: "Home Loan", amount: "₹15 lakh"}` |
| **Conversation Stage** | `exploring` vs `ready_to_apply` |

**With Gemini 2.0 Flash as LLM fallback** — if Groq circuit-breaker opens after 3 failures, Gemini takes over within 30 seconds. Zero downtime.

### 🛡️ Feature 3: Pre-LLM PII Masking (RBI 2024 Compliant)

| PII Type | Detection | Masking Format |
|---|---|---|
| Aadhaar | `2345 6789 0123` | `**** **** 0123` |
| PAN | `ABCDE1234F` | `*****1234F` |
| Phone | `9876543210` | `******3210` |
| Account Number | Context-aware (requires banking keywords nearby) | `****3210` |
| Date of Birth | `15/08/1990` | `**/**/****` |

**Critical design decision:** PII is masked **BEFORE** text is sent to any external LLM API. Sensitive customer data never leaves the system boundary.

### 🧭 Feature 4: Deterministic Session Navigator (Hybrid AI Architecture)

> *"LLM does what LLMs are good at (translation, understanding). Code does what code is good at (state tracking, ordering)."*

A pure-Python state machine replaces LLM-based question generation:

| Phase | Trigger | Behavior |
|---|---|---|
| 🤝 **Greet** | Customer connects | Welcome message in customer's language |
| 📚 **Educate** | Intent detected, customer exploring | Provide product info, rates, eligibility |
| 📋 **Collect** | Customer ready to apply | Priority-ordered data collection, one field at a time |
| 📎 **Verify** | Info collected, checking documents | Document readiness checklist |
| ✅ **Process** | All data + docs confirmed | Guide form submission |
| 👋 **Close** | Session complete | Bilingual PDF summary generated |

**Why not use LLM for this?** LLMs are non-deterministic — same inputs can produce different next questions. Our navigator uses a priority-ordered `QUESTION_BANK` (7 intents × 4–12 fields each = 68 total field definitions) and **never repeats a question whose field is already filled**.

### 📊 Feature 5: Real-Time Staff Dashboard (6 Live Panels)

| Panel | What It Shows | Update Method |
|---|---|---|
| **Conversation Panel** | Bilingual transcript (original + translated) with sentiment badges | WebSocket `<50ms` |
| **AI Suggestion Box** | AI-generated response in Hindi + customer language, approve/edit/discard | WebSocket |
| **Information Board** | All extracted customer data (name, amount, docs) with completion % | WebSocket |
| **Process Panel** | Gamified RBI step checklist with auto-completion | WebSocket |
| **Smart Navigator** | Current phase, next question, progress bar | WebSocket |
| **Document Checklist** | Required vs. provided documents with readiness score | WebSocket |

All 6 panels update in **real-time via WebSocket** — not polling. 12+ distinct event types flow through a centralized `ConnectionManager`.

### 📄 Feature 6: Bilingual PDF Summary Generation

Post-session, the system generates a **Union Bank branded A4 PDF** with:
- Blue header with bank logo + red accent bar (UBI brand colors)
- 4 meta cards (Branch, Staff, Date, Duration)
- Intent + Sentiment + Steps badges
- PII alert bar (amber, shows which types were masked)
- Key points in Hindi + customer's language
- Session summary in both languages
- Next steps with status indicators
- RBI compliance footer

Supports **Noto fonts for Devanagari, Tamil, Telugu, and Kannada** scripts — real Unicode rendering, not transliteration.

### 🏦 Feature 7: Simulated Core Banking System (CBS)

`cbs_service.py` generates **deterministic fake customer profiles** using hash-based seeding:
- Same account number → same customer profile → consistent demo across runs
- Realistic Indian names, addresses, CIBIL scores, account types, loan details
- Lookup by account number OR Aadhaar last-4 digits
- 15 cities across 8 Indian states with real IFSC codes

**Production path:** Replace with OAuth2-authenticated Finacle/BaNCS API calls — the interface layer is already abstracted.

### 🌐 Feature 8: 10 Indian Languages with Native Script Display

| Language | Script | ISO Code | STT | TTS | Navigator |
|---|---|---|---|---|---|
| Hindi | हिंदी | `hi` | ✅ | ✅ | ✅ |
| Marathi | मराठी | `mr` | ✅ | ✅ | ✅ |
| Tamil | தமிழ் | `ta` | ✅ | ✅ | ✅ |
| Telugu | తెలుగు | `te` | ✅ | ✅ | ✅ |
| Bengali | বাংলা | `bn` | ✅ | ✅ | ✅ |
| Kannada | ಕನ್ನಡ | `kn` | ✅ | ✅ | ✅ |
| Odia | ଓଡ଼ିଆ | `or` | ✅ | ✅ | ✅ |
| Punjabi | ਪੰਜਾਬੀ | `pa` | ✅ | ✅ | ✅ |
| Gujarati | ગુજરાતી | `gu` | ✅ | ✅ | ✅ |
| Malayalam | മലയാളം | `ml` | ✅ | ✅ | ✅ |

Multilingual greetings, farewell messages, verification time estimates, and document checklists are all pre-translated and stored in the navigator.

---

## 6. Technical Architecture at a Glance

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        VaaniBank AI — System Architecture                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   CUSTOMER PANEL            BACKEND (FastAPI)           STAFF PANEL          │
│   ┌─────────────┐          ┌──────────────────┐        ┌─────────────┐      │
│   │ React 19    │◄──WS───►│  WebSocket Mgr   │◄──WS──►│ React 19    │      │
│   │ Mobile-first│          │  (bidirectional) │        │ Desktop     │      │
│   │ Voice I/O   │          ├──────────────────┤        │ 6-panel     │      │
│   │ 10 languages│          │ Pipeline Orch.   │        │ dashboard   │      │
│   │ Doc checklist│          │ ┌──────────────┐ │        │ AI suggest  │      │
│   └─────────────┘          │ │ STT (3-level)│ │        │ Info board  │      │
│                            │ │ PII masking  │ │        │ Navigator   │      │
│                            │ │ LLM (Groq +  │ │        │ Process     │      │
│                            │ │   Gemini FB) │ │        │ Summary PDF │      │
│                            │ │ TTS (Sarvam) │ │        └─────────────┘      │
│                            │ │ Navigator    │ │                              │
│                            │ │ CBS (mock)   │ │                              │
│                            │ └──────────────┘ │                              │
│                            ├──────────────────┤                              │
│                            │  PostgreSQL 15+  │  ← 10 tables, Alembic       │
│                            │  Redis 7+        │  ← TTS cache (7-day TTL)    │
│                            │  JWT + RBAC      │  ← Role-based auth          │
│                            └──────────────────┘                              │
│                                                                              │
│   EXTERNAL AI APIs                                                           │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│   │ Sarvam AI  │ │ Groq Cloud │ │ Reverie AI │ │ Google     │              │
│   │ STT + TTS  │ │ Whisper +  │ │ RevUp BFSI │ │ Gemini 2.0 │              │
│   │ (Primary)  │ │ Llama 3.3  │ │ (Fallback) │ │ (LLM FB)   │              │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary

| Layer | Technology | Why This Choice |
|---|---|---|
| **Backend** | FastAPI (Python 3.11, async) | Native WebSocket support, async I/O for concurrent AI calls |
| **Database** | PostgreSQL 15 + SQLAlchemy 2.0 | ACID compliance for financial data, JSONB for flexible schemas |
| **Cache** | Redis 7 | TTS audio caching (40% hit rate saves API costs), session state |
| **Frontend** | React 19 + Vite + Zustand | Dual-panel architecture, real-time state management |
| **Real-Time** | WebSockets (12+ event types) | <50ms latency vs 3–5s polling, bidirectional communication |
| **Auth** | JWT (HS256) + bcrypt + RBAC | Role-based access: teller, manager, admin, supervisor |
| **PDF** | ReportLab + FPDF2 + Noto fonts | A4 bilingual summaries with native script rendering |
| **Deployment** | Render (backend) + Netlify (frontend) | Free-tier friendly, automatic deploys |

---

## 7. What Is Built vs. What Is Planned

### ✅ BUILT (Fully Demonstrable in POC)

| # | Feature | Implementation Detail |
|---|---|---|
| 1 | **3-Level STT Fallback** | Sarvam → Groq Whisper → Reverie BFSI, with automatic failover |
| 2 | **LLM Pipeline** (Groq + Gemini) | 7-output structured JSON, circuit breaker with 30s cooldown |
| 3 | **Pre-LLM PII Masking** | 5 PII types, compiled regex, <1ms per scan, RBI 2024 format |
| 4 | **Deterministic Session Navigator** | 7 intents × 68 fields, 6 phases, priority-ordered question bank |
| 5 | **Real-Time WebSocket System** | 12+ event types, ConnectionManager with session routing |
| 6 | **Staff Panel Dashboard** | 6 live panels, Framer Motion animations, light/dark mode |
| 7 | **Customer Panel** | Mobile-first, push-to-talk, auto-play TTS, 10-language selector |
| 8 | **Bilingual PDF Summaries** | UBI-branded A4, Noto fonts, PII alert bar, key points + next steps |
| 9 | **10 Indian Languages** | Full STT + TTS + translation + navigator support |
| 10 | **Simulated CBS** | Deterministic profiles, account + Aadhaar lookup, realistic data |
| 11 | **Banking Process Definitions** | 8 JSON process files (account, 4 loan types, FD, CIBIL, default) |
| 12 | **Document Readiness Verification** | Per-intent document registry with readiness scoring |
| 13 | **Conversation Intelligence** | Two-phase detection (exploring vs ready_to_apply), context memory |
| 14 | **Rate Limiting** | Sliding-window, per-IP, asymmetric (staff: 30/min, customer: 15/min) |
| 15 | **Database Migrations** | Alembic-managed, 10 tables, JSONB collected_data persistence |
| 16 | **Intent Guidance Config** | Externalized YAML prompts, cached on first load |
| 17 | **Cross-System Correlation** | LLM context injection: [SYSTEM STATE] + [SYSTEM CONTEXT] blocks |
| 18 | **Live Deployment** | Staff: vaanibank-staff.netlify.app, Customer: vaanibank-customer.netlify.app |

### 🗺️ PLANNED (Roadmap — Not Yet Built)

| # | Feature | Priority | Effort |
|---|---|---|---|
| 1 | Integration with actual CBS APIs (Finacle/BaNCS) | High | Bank-side OAuth2 required |
| 2 | Offline STT fallback (on-device Whisper) | Medium | For low-connectivity rural branches |
| 3 | TTS fallback (Google TTS / browser SpeechSynthesis) | Medium | Single TTS provider is current limitation |
| 4 | Redis Pub/Sub for horizontal WebSocket scaling | Medium | Current: single-server in-memory |
| 5 | NER-based PII detection (for verbal PII) | Low | "My mother's maiden name is..." |
| 6 | Role-specific LLM fine-tuning per intent | Low | Currently uses general prompt engineering |
| 7 | Case management & FIU report generation | Medium | Post-session workflow automation |
| 8 | Auto-retraining pipeline | Low | Model performance monitoring |
| 9 | Field-level encryption + TTL-based PII auto-purge | High | Production compliance requirement |
| 10 | Multi-branch real-time analytics dashboard | Low | Branch manager oversight tools |

---

## 8. Key Design Decisions That Set Us Apart

### 1. Hybrid AI Architecture (LLM + Deterministic Code)
Most hackathon projects use LLMs for everything. We deliberately split responsibilities:
- **LLM handles:** Translation, intent extraction, sentiment analysis, info parsing
- **Code handles:** Phase detection, next question selection, state tracking, process ordering

*Result:* **100% deterministic navigation** — same inputs always produce the same next question. The navigator never asks a question whose field is already filled.

### 2. Pre-LLM PII Masking (Security-First Design)
Customer PII is masked **before** text reaches any external API. This isn't a nice-to-have — it's an RBI mandate for cloud-processed data.

### 3. Single-Commit Architecture
All DB mutations (Exchange, PII logs, Session metadata, collected_data) are committed in a **single `await db.commit()`** — no partial state, no orphaned records, no race conditions.

### 4. Conversation Stage Detection
The system detects whether a customer is *exploring* (asking for information) or *ready to apply* (wants to proceed). In exploring mode, it educates. In ready_to_apply mode, it collects data. **No aggressive form-filling on confused customers.**

### 5. Stale Suggestion Override
When all fields are collected and all documents are confirmed, the system detects if the LLM is still generating stale suggestions ("Do you have Aadhaar?") and overrides them with contextually appropriate completion messages. **The dashboard never contradicts itself.**

---

## 9. Model Performance (on Synthetic Test Data)

| Component | Metric | Score |
|---|---|---|
| **STT (Sarvam Saarika v2.5)** | Avg. Confidence | 0.85 |
| **STT (Groq Whisper v3-Turbo)** | Avg. Confidence | 0.90 |
| **STT (Reverie RevUp BFSI)** | Avg. Confidence | 0.85 |
| **LLM Intent Detection** | Accuracy | ~92% |
| **LLM Response Latency** | Avg. | ~0.8s |
| **TTS (Sarvam Bulbul v3)** | Avg. Generation | ~1.5s |
| **TTS Redis Cache** | Hit Rate | ~40% |
| **PII Detection** | Execution Time | <1ms |
| **Navigator** | Execution Time | ~0.1ms |
| **End-to-End Pipeline** | Customer speaks → Staff sees | ~3–4s |

---

## 10. Deployment & Demo Access

| Component | URL | Status |
|---|---|---|
| 🌐 **Staff Panel** | [vaanibank-staff.netlify.app](https://vaanibank-staff.netlify.app) | ✅ Live |
| 🌐 **Customer Panel** | [vaanibank-customer.netlify.app](https://vaanibank-customer.netlify.app) | ✅ Live |
| 🖥️ **Backend API** | Deployed on Render | ✅ Live |

### Demo Credentials

| Staff ID | Username | Password | Role | Branch |
|---|---|---|---|---|
| `UBI-NGP-001` | `demo` | `demo123` | Teller | Nagpur Civil Lines |
| `UBI-NGP-002` | `manager` | `manager123` | Manager | Nagpur Civil Lines |
| `UBI-MUM-042` | `admin` | `admin123` | Supervisor | Mumbai Andheri |

---

## 11. Codebase Metrics

| Metric | Value |
|---|---|
| **Total Backend Files** | 40+ Python files |
| **Total Frontend Components** | 25+ React components (Staff) + 10+ (Customer) |
| **AI Service** | 1,317 lines (`ai_service.py`) |
| **Pipeline Orchestrator** | 934 lines (`pipeline_orchestrator.py`) |
| **WebSocket Manager** | Event-driven, 12+ event types |
| **PDF Service** | 1,187 lines, Union Bank branded |
| **Database Models** | 10 ORM tables, JSONB support |
| **Pydantic Schemas** | 50+ request/response schemas |
| **Banking Processes** | 8 JSON definitions (19 process steps) |
| **Languages Supported** | 10 Indian languages in native scripts |
| **External API Integrations** | 5 (Sarvam STT, Sarvam TTS, Groq Whisper, Groq LLM, Reverie STT) + 1 backup (Gemini) |

---

## 12. Why VaaniBank AI Matters

### For Union Bank of India
- **Serve any customer in any language** — no staff retraining, no human translators
- **Reduce average handling time** from 25 minutes (with language barrier) to under 8 minutes
- **Eliminate data entry errors** — AI extracts and structures customer data automatically
- **RBI compliance built-in** — PII masking, audit logs, bilingual summaries for records

### For India's Financial Inclusion Mission
- **1 billion Indians** speak a language that their local bank teller may not understand
- **VaaniBank AI** turns every teller into a multilingual banker — instantly
- **Cost:** One tablet + internet connection per branch counter. No hardware upgrades.
- **Scale:** Cloud-hosted, works on any browser. Deploy to 8,700+ branches via URL.

### The Vision

> *A farmer from rural Odisha walks into any Union Bank branch in India. He speaks Odia. The teller speaks Hindi. Within seconds, they are having a seamless, natural conversation — each in their own language — guided by AI that understands banking, respects privacy, and ensures the farmer gets exactly the service he came for.*
>
> **That is VaaniBank AI.**

---

<p align="center">
  <img src="website_logo.png" alt="VaaniBank AI" width="180"/>
  <br/>
  <em>Built with ❤️ by Team Vectora for Union Bank of India</em>
  <br/>
  <strong>iDEA 2.0 — PSBs Hackathon 2026 | Problem Statement 6</strong>
</p>
