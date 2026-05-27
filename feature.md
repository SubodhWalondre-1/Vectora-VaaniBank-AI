# VaaniBank AI — Core Features

VaaniBank AI is a real-time, multilingual AI-powered banking assistant engineered to bridge the language gap between frontline bank staff and customers. Through its decoupled frontend panels (Staff & Customer) and advanced FastAPI backend, it provides seamless real-time translation, intent detection, and structured conversational guidance. 

Below is a detailed breakdown of the complete core features present in the codebase.

---

## 1. Multilingual Audio Pipeline (Speech-to-Text & Text-to-Speech)
- **10 Indian Languages Supported**: Transcribes and translates Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, Odia, Punjabi, Gujarati, and Malayalam.
- **3-Level STT Fallback Chain**: 
  - *Primary*: Sarvam AI Saarika v2.5 for low-latency native inference.
  - *Fallback 1*: Groq Cloud Whisper Large-v3-Turbo for ultra-fast LPU fallback.
  - *Fallback 2*: Reverie AI RevUp (BFSI domain-tuned) for banking-specific jargon.
- **Real-Time Voice Playback (TTS)**: Leverages Sarvam Bulbul v3 to instantly generate staff responses in the customer's native language. Responses are auto-played on the Customer Panel.
- **Redis TTS Caching**: Reduces cost and improves latency by caching repeated phrases via Redis (Content-based keys `tts_cache:{hash}`).

## 2. Real-Time Dual Interface System (WebSockets)
- **Customer Panel (Kiosk/Tablet Mode)**: Mobile-friendly React interface with push-to-talk recording, real-time indicators (e.g., "Staff is typing..."), Document Checklists, and a QR-code/Token entry system. No authentication required.
- **Staff Panel**: Comprehensive React dashboard providing:
  - Real-time bilingual transcript view.
  - Real-time customer intent and sentiment badges.
  - **AI Suggestion Box**: Auto-generates contextual staff replies that can be approved, edited, or ignored.
- **Persistent WebSocket Layer**: Sub-50ms latency bidirectional communication managing over 12 distinct event types (transcription, suggestions, step updates).

## 3. Advanced AI Orchestration & Hybrid Navigation
- **Single-Commit AI Pipeline Orchestrator**: Atomically coordinates STT → PII Masking → LLM Request → Database Insertion → WebSocket Broadcasting.
- **Dual LLM with Circuit Breaker Failover**: 
  - *Primary*: Groq Llama-3.3-70b-versatile for high-speed structural JSON outputs.
  - *Fallback*: Google Gemini 2.0 Flash to ensure 100% availability if the primary LLM faces rate limits.
- **Entity Extraction & Information Board**: LLM systematically extracts collected customer context (names, ages, account numbers), which is persistently shown on the Staff Panel and injected into future LLM calls so the AI never repeats a question.
- **Deterministic Session Navigator**: A pure-code state machine driving the banking process. Prevents LLM hallucinations by enforcing strict, prioritized step-by-step guidance for Intents like `account_opening`, `loan_enquiry`, `kyc_update`, etc.

## 4. Privacy, Compliance & Security (RBI Guidelines)
- **Pre-LLM Regex PII Masking**: Deterministic regex interception detects Aadhaar, PAN, DOB, Phone, and Account numbers. Sensitive data is converted to compliant formats (e.g., `**** **** {last4}`) *before* it ever leaves the network boundary for LLM processing.
- **Role-Based Access Control (RBAC)**: Secure Staff entry using JWT (python-jose) + bcrypt. Support for Teller, Manager, Supervisor, and Admin roles.
- **Sliding-Window Rate Limiting**: In-memory algorithmic rate limiting on `/stt`, `/llm`, and `/tts` endpoints ensuring robust cost-protection. Asymmetric rules enforce stricter limits on unauthenticated endpoints.

## 5. Post-Session Intelligence & Output
- **Bilingual PDF Summaries**: Integrates FPDF2 with Noto fonts to auto-generate a comprehensive two-column PDF receipt of the session (Hindi + the Customer's Native Language) summarizing key points and next steps.
- **Mock Core Banking System (CBS) Service**: Generates completely realistic, deterministic hash-based customer profiles suitable for demo/testing without exposing any real-world banking API credentials.
- **Staff Analytics Dashboard**: Tracks metrics daily via PostgreSQL `analytics_daily` table, displaying total sessions, average duration, language demographics, intent breakdowns, sentiment distribution, and AI suggestion usage rates.

## 6. Enterprise-Grade Architecture
- **Async-First Backend**: High-performance FastAPI with `asyncpg` drivers and fully async SQLAlchemy 2.0 ORM interactions.
- **Modular DB Schema**: Maintains 10 scalable PostgreSQL tables modeling everything from `Branch` and `StaffMember` to `Exchange` and `SessionProcessTracking`.
- **Global Error Handling & Observability**: Standardized `core.exceptions` capturing edge cases seamlessly without leaking backend stack traces to the frontend.
