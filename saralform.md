# SaralForm — Complete Implementation Guide

## VaaniBank AI | PSBs IDEA 2.0 Hackathon | Team Vectora

---

## Table of Contents

1. [What SaralForm Does](#1-what-saralform-does)
2. [What Already Exists (Touch Nothing)](#2-what-already-exists-touch-nothing)
3. [Architecture Overview](#3-architecture-overview)
4. [Complete Flow — Session End to Summary](#4-complete-flow--session-end-to-summary)
5. [Customer Experience — Screen by Screen](#5-customer-experience--screen-by-screen)
6. [Multi-Language Support](#6-multi-language-support)
7. [Phase-wise Implementation](#7-phase-wise-implementation)
   - [Phase 1 — Backend: New Forms Router](#phase-1--backend-new-forms-router)
   - [Phase 2 — Register Router in main.py](#phase-2--register-router-in-mainpy)
   - [Phase 3 — Database Migration](#phase-3--database-migration)
   - [Phase 4 — New Customer Panel Page: SaralFormPage.jsx](#phase-4--new-customer-panel-page-saralformpagejsx)
   - [Phase 5 — Add Route in App.jsx](#phase-5--add-route-in-appjsx)
   - [Phase 6 — Update Customer useWebSocket.js](#phase-6--update-customer-usewebsocketjs)
   - [Phase 7 — Update broadcast_session_ended() in manager.py](#phase-7--update-broadcast_session_ended-in-managerpy)
   - [Phase 8 — Staff Panel: Handle form_signed Event](#phase-8--staff-panel-handle-form_signed-event)
   - [Phase 9 — Staff Panel: Notification Card UI](#phase-9--staff-panel-notification-card-ui)
8. [All API Endpoints](#8-all-api-endpoints)
9. [Testing](#9-testing)
10. [File Locations Summary](#10-file-locations-summary)
11. [Quick Checklist](#11-quick-checklist)

---

## 1. What SaralForm Does

### The Problem (existing flow gap)

```
Customer speaks → AI collects 14 fields into Session.collected_data
      ↓
Session ends → Staff clicks "Generate Summary" → PDF generated
      ↓
Customer gets navigated to SummaryPage (PDF download + rating)
      ↓
BUT — branch still needs customer's signature on a physical form
      ↓
Teller manually re-types collected data into paper form A-101/LA-201/KYC-07
      ↓
8 min × 20 customers = 2.6 hours wasted teller time per day
```

### The Solution (new flow)

```
Session ends (staff or customer triggers)
      ↓
SaralForm appears on customer panel AUTOMATICALLY
      ↓
All fields pre-filled from session.collected_data (AI-extracted)
      ↓
Customer reviews + edits any wrong field
      ↓
Customer draws signature on canvas
      ↓
POST /forms/submit → signature saved, WebSocket fires to staff
      ↓
Staff sees "Form Signed ✅" notification + download button
      ↓
Customer navigates to SummaryPage (PDF download + rating — unchanged)
```

---

## 2. What Already Exists (Touch Nothing)

- `SummaryPage.jsx` — already perfect: PDF download, rating, footer ✅
- `ws_manager.broadcast_session_ended()` — already fires `session_ended` event ✅
- `useWebSocket.js` (customer) — already handles `session_ended` → currently navigates to `/summary/:session_id` (we will change this to `/saral-form` instead) ✅
- `POST /summary/generate` — already generates bilingual PDF ✅
- `ws_manager.send_to_staff()` — already generic, just needs a new event call ✅

**The only change to existing flow:** Instead of jumping straight to summary, we insert SaralForm BETWEEN session end and summary. Customer fills form → then goes to summary.

---

## 3. Architecture Overview

```
[Customer Panel]                    [Backend]                [Staff Panel]
      |                                 |                          |
  session_ended WS event               |                          |
  (carries collected_data,             |                          |
   intent, lang_code)                  |                          |
      ↓                                |                          |
  navigate("/saral-form",              |                          |
   { state: formData })                |                          |
      ↓                                |                          |
  SaralFormPage renders                |                          |
  (pre-filled from WS data)            |                          |
      ↓                                |                          |
  Customer edits + signs               |                          |
      ↓                                |                          |
  POST /forms/submit ──────────────────→                          |
                                  saves to DB                     |
                                  ws_manager.send_to_staff()      |
                                       ──────────────────────────→|
                                                            "form_signed" toast
                                                            + download button
      ↓
  navigate("/session/:token")
  (Return to live interaction)
```

---

## 4. Complete Flow — Session End to Summary

```
Staff clicks "End Session" (Final Step)
         │
         ▼
Backend: broadcast_session_ended() fires
         │
         ▼
Customer panel navigates to /summary/SESSION_ID
         │
         ▼
Done
```

### Form Verification Flow (Mid-Session)

```
Staff clicks "Send to Form Verification"
         │
         ▼
Customer panel navigates to /saral-form
         │
         ▼
Customer taps "Submit Signed Form"
         │
         ▼
POST /forms/submit
         │
         ▼
Staff panel receives "form_signed" notification
         │
         ▼
Customer navigates BACK to /session/:token
         │  (Conversation continues until Staff ends session)
         ▼
```

---

## 5. Customer Experience — Screen by Screen

### Screen 1 — Review Fields (Step 1)

```
┌─────────────────────────────────────────────┐
│ VaaniBank AI        Union Bank of India      │
│                              Token: NJT-1267 │
├─────────────────────────────────────────────┤
│  ●————————————○                              │
│  Review Fields      Sign                     │
├─────────────────────────────────────────────┤
│ Review your details. Tap any field to        │
│ correct before signing.                      │
├─────────────────────────────────────────────┤
│ Customer Name *                              │
│ ग्राहक का नाम                               │
│ ┌─────────────────────────────────────────┐ │
│ │ Ramesh Kumr                          ✏️ │ │  ← typo — customer can fix
│ └─────────────────────────────────────────┘ │
│                                              │
│ Monthly Income (₹)                           │
│ मासिक आय                                     │
│ ┌─────────────────────────────────────────┐ │
│ │ 35000                                ✏️ │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Aadhaar Card                                 │
│ आधार कार्ड                                   │
│ ☑  Provided ✓                                │
│                                              │
│    ┌─────────────────────────────────────┐   │
│    │  Looks Good — Proceed to Sign →     │   │
│    └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Screen 2 — Signature (Step 2)

```
┌─────────────────────────────────────────────┐
│  ●————————————●                              │
│  Review Fields      Sign                     │
├─────────────────────────────────────────────┤
│ Sign using your finger or stylus.            │
│ यहाँ हस्ताक्षर करें                          │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │    ~ Ramesh Kumar ~  (drawn)            │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│  [ Clear ]  [ ← Back to Review ]            │
│                                              │
│    ┌─────────────────────────────────────┐   │
│    │ ✓  Submit Signed Form               │   │
│    └─────────────────────────────────────┘   │
│                                              │
│  🔒 Encrypted per RBI guidelines             │
└─────────────────────────────────────────────┘
```

### Screen 3 — Summary Page (existing, unchanged)

After form submit → navigate to `/summary/:session_id`:

- Bilingual summary (Hindi + customer language)
- Download PDF button
- Rating stars
- Footer

### Staff Panel — Form Signed Notification

```
┌─────────────────────────────────────────────────┐
│  ✅  Form Signed!                                │
│      Customer has signed A-101                   │
│      Token: NJT-1267                             │
│                                 [ 📥 Signature ] │
│                                              ✕   │
└─────────────────────────────────────────────────┘
```

---

## 6. Multi-Language Support

SaralForm shows bilingual labels on every field — English on top, customer's language below.

**How language reaches the form:**

1. `broadcast_session_ended()` now sends `language_code` (e.g., `"ta"`) in the event payload
2. `useWebSocket.js` passes it as `langCode` in navigation state
3. `SaralFormPage.jsx` reads `langCode` from `location.state` and picks the right label

**Field label table (10 Indian languages, pre-wired in component):**

| Field          | Hindi         | Tamil               | Telugu        | Bengali      |
| -------------- | ------------- | ------------------- | ------------- | ------------ |
| Customer Name  | ग्राहक का नाम | வாடிக்கையாளர் பெயர் | కస్టమర్ పేరు  | গ্রাহকের নাম |
| Monthly Income | मासिक आय      | மாதாந்திர வருமானம்  | నెలవారీ ఆదాయం | মাসিক আয়    |
| Aadhaar Card   | आधार कार्ड    | ஆதார் அட்டை         | ఆధార్ కార్డ్  | আধার কার্ড   |

All 10 languages (hi, mr, ta, te, bn, kn, gu, pa, or, ml) are wired directly into `SaralFormPage.jsx` in the `FIELD_LABELS` constant — no additional setup needed.

**Font support** — add to `frontend/customer-panel/index.html`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=
  Noto+Sans+Devanagari&
  Noto+Sans+Tamil&
  Noto+Sans+Telugu&
  Noto+Sans+Bengali&
  Noto+Sans+Kannada&
  Noto+Sans+Gujarati&
  Noto+Sans+Gurmukhi&
  Noto+Sans+Oriya&
  Noto+Sans+Malayalam
  &display=swap"
  rel="stylesheet"
/>
```

---

## 7. Phase-wise Implementation

---

### Phase 1 — Backend: New Forms Router

**Create:** `backend/routers/forms.py`

```python
"""
VaaniBank AI — SaralForm Submission Router
PSBs Hackathon 2026 | Team Vectora

Endpoints:
  POST /forms/submit              — Customer submits verified + signed form
  GET  /forms/signature/{token}   — Staff downloads signature PNG
"""

from __future__ import annotations

import base64
import logging
import os
from datetime import datetime, timezone
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Session
from websocket.manager import ws_manager

logger = logging.getLogger("vaanibank.forms")

router = APIRouter(prefix="/forms", tags=["SaralForm"])

_SIGNATURE_DIR = os.getenv("SIGNATURE_STORAGE_PATH", "./storage/signatures")
os.makedirs(_SIGNATURE_DIR, exist_ok=True)

_FORM_NAMES: Dict[str, str] = {
    "A-101":  "Account Opening Form",
    "LA-201": "Loan Application Form",
    "KYC-07": "KYC Update Form",
    "CS-301": "Card Application Form",
    "FD-501": "Fixed Deposit Opening Form",
    "GQ-601": "General Query Log",
}


# ─── Schemas ──────────────────────────────────────────────────────────────────

class FormSubmitRequest(BaseModel):
    token_number: str
    session_id: int
    form_ref: str
    confirmed_fields: Dict[str, str] = {}
    signature_data_url: str = ""
    language_code: str = "hi"


class FormSubmitResponse(BaseModel):
    success: bool
    message: str
    form_ref: str
    token_number: str


# ─── POST /forms/submit ────────────────────────────────────────────────────────

@router.post(
    "/submit",
    response_model=FormSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Customer submits the verified and signed SaralForm",
)
async def submit_form(
    body: FormSubmitRequest,
    db: AsyncSession = Depends(get_db),
) -> FormSubmitResponse:
    # 1. Validate session
    session_result = await db.execute(
        select(Session).where(Session.id == body.session_id)
    )
    session_obj = session_result.scalar_one_or_none()

    if session_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {body.session_id} not found",
        )

    # 2. Merge confirmed_fields → session.collected_data
    existing_data: dict = session_obj.collected_data or {}
    merged_data = {**existing_data, **body.confirmed_fields}

    # 3. Save merged data + timestamp
    await db.execute(
        update(Session)
        .where(Session.id == body.session_id)
        .values(
            collected_data=merged_data,
            form_signed_at=datetime.now(timezone.utc),
        )
    )

    # 4. Save signature PNG to disk
    signature_file_path = ""
    if body.signature_data_url and body.signature_data_url.startswith("data:image"):
        try:
            _, encoded = body.signature_data_url.split(",", 1)
            signature_bytes = base64.b64decode(encoded)
            safe_token = body.token_number.replace("-", "_")
            filename = f"signature_{safe_token}_{body.session_id}.png"
            filepath = os.path.join(_SIGNATURE_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(signature_bytes)
            signature_file_path = f"/forms/signature/{body.token_number}"
            logger.info("Signature saved | token=%s | path=%s", body.token_number, filepath)
        except Exception as exc:
            logger.warning("Signature save failed | token=%s | %s", body.token_number, exc)

    await db.commit()

    # 5. Notify staff panel via WebSocket
    form_name = _FORM_NAMES.get(body.form_ref, "Banking Form")
    await ws_manager.send_to_staff(
        token_number=body.token_number,
        event_type="form_signed",
        data={
            "token_number":     body.token_number,
            "session_id":       body.session_id,
            "form_ref":         body.form_ref,
            "form_name":        form_name,
            "signature_url":    signature_file_path,
            "confirmed_fields": body.confirmed_fields,
            "language_code":    body.language_code,
            "submitted_at":     datetime.now(timezone.utc).isoformat(),
            "message":          f"Customer has signed {form_name}.",
        },
    )

    logger.info(
        "Form submitted | token=%s | session=%d | form=%s | staff_notified=True",
        body.token_number, body.session_id, body.form_ref,
    )

    return FormSubmitResponse(
        success=True,
        message="Form submitted. Returning to your session.",
        form_ref=body.form_ref,
        token_number=body.token_number,
    )


# ─── GET /forms/signature/{token} ─────────────────────────────────────────────

@router.get(
    "/signature/{token_number}",
    summary="Staff downloads customer signature PNG",
    response_class=Response,
)
async def get_signature(
    token_number: str,
    session_id: Optional[int] = None,
) -> Response:
    safe_token = token_number.replace("-", "_")

    if session_id:
        filepath = os.path.join(_SIGNATURE_DIR, f"signature_{safe_token}_{session_id}.png")
    else:
        filepath = None
        if os.path.exists(_SIGNATURE_DIR):
            for fname in os.listdir(_SIGNATURE_DIR):
                if fname.startswith(f"signature_{safe_token}_"):
                    filepath = os.path.join(_SIGNATURE_DIR, fname)
                    break

    if not filepath or not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Signature for token {token_number} not found",
        )

    with open(filepath, "rb") as f:
        image_bytes = f.read()

    return Response(
        content=image_bytes,
        media_type="image/png",
        headers={
            "Content-Disposition": f'attachment; filename="signature_{token_number}.png"',
            "Cache-Control": "no-store",
        },
    )
```

---

### Phase 2 — Register Router in `main.py`

Find where other routers are included in `backend/main.py` and add:

```python
# Add import at top (near other router imports):
from routers.forms import router as forms_router

# Add registration (after existing include_router calls):
app.include_router(forms_router)   # /forms/* — SaralForm endpoints
```

Also mount the signatures storage directory (same pattern as existing audio/summaries mounts):

```python
_mount_static(
    "/storage/signatures",
    os.getenv("SIGNATURE_STORAGE_PATH", "./storage/signatures"),
    "signatures",
)
```

---

### Phase 3 — Database Migration

**Add `form_signed_at` to `backend/models.py`:**

Find the `Session` model. After the `collected_data` column, add:

```python
form_signed_at = Column(
    DateTime(timezone=True),
    nullable=True,
    comment="Set when customer submits the signed SaralForm",
)
```

**Generate and run Alembic migration:**

```bash
cd backend
alembic revision --autogenerate -m "add_form_signed_at_to_sessions"
alembic upgrade head
```

The auto-generated migration will contain:

```python
def upgrade() -> None:
    op.add_column(
        "sessions",
        sa.Column("form_signed_at", sa.DateTime(timezone=True), nullable=True)
    )

def downgrade() -> None:
    op.drop_column("sessions", "form_signed_at")
```

---

### Phase 4 — New Customer Panel Page: `SaralFormPage.jsx`

**Create:** `frontend/customer-panel/src/pages/SaralFormPage.jsx`

```jsx
/* ============================================================
   VaaniBank AI — SaralForm Page
   Union Bank of India | Team Vectora
   URL: /saral-form

   Receives via React Router navigation state:
   { tokenNumber, sessionId, collectedData, intent, langCode }

   Flow:
     Step 1 → Review + edit pre-filled fields
     Step 2 → Draw signature on HTML5 canvas
     Submit → POST /forms/submit → navigate to /summary/:session_id
   ============================================================ */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Edit3,
  ArrowRight,
  RotateCcw,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { BRAND, API_BASE_URL } from "../constants";

const inlineKeyframes = `
  @keyframes loader-spin { to { transform: rotate(360deg); } }
`;

// ── Bilingual field labels ─────────────────────────────────────────────────────
const FIELD_LABELS = {
  customer_name: {
    en: "Customer Name",
    hi: "ग्राहक का नाम",
    mr: "ग्राहकाचे नाव",
    ta: "வாடிக்கையாளர் பெயர்",
    te: "కస్టమర్ పేరు",
    bn: "গ্রাহকের নাম",
    kn: "ಗ್ರಾಹಕರ ಹೆಸರು",
    gu: "ગ્રાહકનું નામ",
    pa: "ਗਾਹਕ ਦਾ ਨਾਮ",
    or: "ଗ୍ରାହକ ନାମ",
    ml: "ഉപഭോക്തൃ നാമം",
  },
  account_type: {
    en: "Account Type",
    hi: "खाता प्रकार",
    mr: "खाते प्रकार",
    ta: "கணக்கு வகை",
    te: "ఖాతా రకం",
    bn: "অ্যাকাউন্ট ধরন",
    kn: "ಖಾತೆ ಪ್ರಕಾರ",
    gu: "ખાતા પ્રકાર",
    pa: "ਖਾਤੇ ਦੀ ਕਿਸਮ",
    or: "ଖାତା ପ୍ରକାର",
    ml: "അക്കൗണ്ട് തരം",
  },
  loan_type: {
    en: "Loan Type",
    hi: "लोन प्रकार",
    mr: "कर्जाचा प्रकार",
    ta: "கடன் வகை",
    te: "రుణ రకం",
    bn: "ঋণের ধরন",
    kn: "ಸಾಲದ ಪ್ರಕಾರ",
    gu: "લોન પ્રકાર",
    pa: "ਕਰਜ਼ੇ ਦੀ ਕਿਸਮ",
    or: "ଋଣ ପ୍ରକାର",
    ml: "വായ്പ തരം",
  },
  amount: {
    en: "Amount (₹)",
    hi: "राशि",
    mr: "रक्कम",
    ta: "தொகை",
    te: "మొత్తం",
    bn: "পরিমাণ",
    kn: "ಮೊತ್ತ",
    gu: "રકમ",
    pa: "ਰਕਮ",
    or: "ପରିମାଣ",
    ml: "തുക",
  },
  tenure: {
    en: "Loan Tenure",
    hi: "अवधि",
    mr: "कालावधी",
    ta: "காலகட்டம்",
    te: "కాల వ్యవధి",
    bn: "মেয়াদ",
    kn: "ಅವಧಿ",
    gu: "મુદ્દત",
    pa: "ਮਿਆਦ",
    or: "ଅବଧି",
    ml: "കാലാവധി",
  },
  employment_type: {
    en: "Employment Type",
    hi: "रोजगार प्रकार",
    mr: "रोजगाराचा प्रकार",
    ta: "வேலைவாய்ப்பு வகை",
    te: "ఉద్యోగ రకం",
    bn: "কর্মসংস্থানের ধরন",
    kn: "ಉದ್ಯೋಗ ಪ್ರಕಾರ",
    gu: "રોજગાર પ્રકાર",
    pa: "ਰੁਜ਼ਗਾਰ ਦੀ ਕਿਸਮ",
    or: "ନିଯୁକ୍ତି ପ୍ରକାର",
    ml: "തൊഴിൽ തരം",
  },
  monthly_income: {
    en: "Monthly Income (₹)",
    hi: "मासिक आय",
    mr: "मासिक उत्पन्न",
    ta: "மாதாந்திர வருமானம்",
    te: "నెలవారీ ఆదాయం",
    bn: "মাসিক আয়",
    kn: "ಮಾಸಿಕ ಆದಾಯ",
    gu: "માસિક આવક",
    pa: "ਮਾਸਿਕ ਆਮਦਨ",
    or: "ମାସିକ ଆୟ",
    ml: "മാസ വരുമാനം",
  },
  age: {
    en: "Age",
    hi: "उम्र",
    mr: "वय",
    ta: "வயது",
    te: "వయస్సు",
    bn: "বয়স",
    kn: "ವಯಸ್ಸು",
    gu: "ઉંમર",
    pa: "ਉਮਰ",
    or: "ବୟସ",
    ml: "പ്രായം",
  },
  purpose: {
    en: "Purpose",
    hi: "उद्देश्य",
    mr: "उद्देश",
    ta: "நோக்கம்",
    te: "ఉద్దేశ్యం",
    bn: "উদ্দেশ্য",
    kn: "ಉದ್ದೇಶ",
    gu: "હેતુ",
    pa: "ਉਦੇਸ਼",
    or: "ଉଦ୍ଦେଶ୍ୟ",
    ml: "ഉദ്ദേശ്യം",
  },
  aadhaar_provided: {
    en: "Aadhaar Card",
    hi: "आधार कार्ड",
    mr: "आधार कार्ड",
    ta: "ஆதார் அட்டை",
    te: "ఆధార్ కార్డ్",
    bn: "আধার কার্ড",
    kn: "ಆಧಾರ್ ಕಾರ್ಡ್",
    gu: "આધાર કાર્ડ",
    pa: "ਆਧਾਰ ਕਾਰਡ",
    or: "ଆଧାର କାର୍ଡ",
    ml: "ആധാർ കാർഡ്",
  },
  pan_provided: {
    en: "PAN Card",
    hi: "पैन कार्ड",
    mr: "पॅन कार्ड",
    ta: "பான் கார்டு",
    te: "పాన్ కార్డ్",
    bn: "প্যান কার্ড",
    kn: "ಪ್ಯಾನ್ ಕಾರ್ಡ್",
    gu: "પાન કાર્ડ",
    pa: "ਪੈਨ ਕਾਰਡ",
    or: "ପ୍ୟାନ କାର୍ଡ",
    ml: "പാൻ കാർഡ്",
  },
  address_proof_provided: {
    en: "Address Proof",
    hi: "पता प्रमाण",
    mr: "पत्ता पुरावा",
    ta: "முகவரி சான்று",
    te: "చిరునామా రుజువు",
    bn: "ঠিকানার প্রমাণ",
    kn: "ವಿಳಾಸ ಪುರಾವೆ",
    gu: "સરનામાનો પુરાવો",
    pa: "ਪਤੇ ਦਾ ਸਬੂਤ",
    or: "ଠିକଣା ପ୍ରମାଣ",
    ml: "വിലാസ തെളിവ്",
  },
  phone_number_provided: {
    en: "Phone Number",
    hi: "मोबाइल नंबर",
    mr: "मोबाइल नंबर",
    ta: "மொபைல் எண்",
    te: "ఫోన్ నంబర్",
    bn: "ফোন নম্বর",
    kn: "ಫೋನ್ ಸಂಖ್ಯೆ",
    gu: "ફોન નંબર",
    pa: "ਫ਼ੋਨ ਨੰਬਰ",
    or: "ଫୋନ ନମ୍ବର",
    ml: "ഫോൺ നമ്പർ",
  },
  photos_provided: {
    en: "Passport Photos",
    hi: "पासपोर्ट फोटो",
    mr: "पासपोर्ट फोटो",
    ta: "புகைப்படங்கள்",
    te: "ఫోటోలు",
    bn: "পাসপোর্ট ফটো",
    kn: "ಫೋಟೋಗಳು",
    gu: "ફોટો",
    pa: "ਪਾਸਪੋਰਟ ਫੋਟੋ",
    or: "ଫଟୋ",
    ml: "ഫോട്ടോ",
  },
};

const CHECKBOX_FIELDS = new Set([
  "aadhaar_provided",
  "pan_provided",
  "address_proof_provided",
  "phone_number_provided",
  "photos_provided",
]);

const FORM_REFS = {
  account_opening: "A-101",
  loan_enquiry: "LA-201",
  kyc_update: "KYC-07",
  card_services: "CS-301",
  fixed_deposit: "FD-501",
  general: "GQ-601",
};

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.35, staggerChildren: 0.06 },
  },
};
const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function SaralFormPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    tokenNumber = "N/A",
    sessionId = null,
    collectedData = {},
    intent = "general",
    langCode = "hi",
  } = location.state || {};

  const formRef = FORM_REFS[intent] || "GQ-601";
  const shortLang = langCode.split("-")[0].toLowerCase();

  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const initial = {};
    Object.keys(FIELD_LABELS).forEach((key) => {
      if (collectedData[key] !== undefined) {
        initial[key] = String(collectedData[key]);
      }
    });
    setFormValues(initial);
  }, []);

  const getLabel = (fieldKey) => {
    const labels = FIELD_LABELS[fieldKey];
    if (!labels) return fieldKey;
    return labels[shortLang] || labels["hi"] || labels["en"];
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#003087";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPosRef.current = pos;
    setHasSignature(true);
  }, []);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
  }, []);
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  useEffect(() => {
    if (step !== 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (!hasSignature) {
      toast.error("Please draw your signature before submitting.");
      return;
    }
    if (!sessionId) {
      toast.error("Session ID missing. Please refresh.");
      return;
    }
    setIsSubmitting(true);
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL("image/png") : "";

    try {
      const response = await fetch(`${API_BASE_URL}/forms/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_number: tokenNumber,
          session_id: sessionId,
          form_ref: formRef,
          confirmed_fields: formValues,
          signature_data_url: signatureDataUrl,
          language_code: shortLang,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Submission failed");

      toast.success("Form submitted! ✅", { duration: 1800 });
      setTimeout(() => {
        navigate(`/summary/${sessionId}`, { replace: true });
      }, 1500);
    } catch (err) {
      console.error("[SaralForm] Submit error:", err);
      toast.error(err.message || "Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  }, [
    hasSignature,
    sessionId,
    tokenNumber,
    formRef,
    formValues,
    shortLang,
    navigate,
  ]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      style={styles.page}
    >
      <style>{inlineKeyframes}</style>
      <div style={styles.container}>
        {/* HEADER */}
        <motion.div variants={itemVariants} style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <p style={styles.headerTitle}>SaralForm</p>
              <p style={styles.headerSubtitle}>Union Bank of India</p>
            </div>
            <div style={styles.tokenBadge}>
              <span style={styles.tokenText}>#{tokenNumber}</span>
            </div>
          </div>
          <div style={styles.stepper}>
            <div style={styles.stepperItem}>
              <div
                style={{ ...styles.stepperDot, backgroundColor: BRAND.blue }}
              >
                {step > 1 ? (
                  <CheckCircle2 size={14} color="#fff" />
                ) : (
                  <span style={styles.stepperNum}>1</span>
                )}
              </div>
              <span style={{ ...styles.stepperLabel, color: BRAND.blue }}>
                Review Fields
              </span>
            </div>
            <div
              style={{
                ...styles.stepperLine,
                backgroundColor: step >= 2 ? BRAND.blue : "var(--card-border)",
              }}
            />
            <div style={styles.stepperItem}>
              <div
                style={{
                  ...styles.stepperDot,
                  backgroundColor:
                    step >= 2 ? BRAND.blue : "var(--card-border)",
                }}
              >
                <span style={styles.stepperNum}>2</span>
              </div>
              <span
                style={{
                  ...styles.stepperLabel,
                  color: step >= 2 ? BRAND.blue : "var(--text-muted)",
                }}
              >
                Sign
              </span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1 — REVIEW FIELDS ─────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              style={styles.stepCard}
            >
              <p style={styles.stepHint}>
                Review your details. Tap any field to correct it before signing.
              </p>

              {Object.keys(FIELD_LABELS).map((fieldKey) => {
                const val = formValues[fieldKey];
                if (!val && !CHECKBOX_FIELDS.has(fieldKey)) return null;

                const labelEN = FIELD_LABELS[fieldKey]?.en || fieldKey;
                const labelLocal = getLabel(fieldKey);

                if (CHECKBOX_FIELDS.has(fieldKey)) {
                  const isChecked =
                    val === "true" ||
                    val === "yes" ||
                    val === "provided" ||
                    val === "1";
                  return (
                    <div key={fieldKey} style={styles.fieldWrapper}>
                      <p style={styles.fieldLabelEN}>{labelEN}</p>
                      <p style={styles.fieldLabelLocal}>{labelLocal}</p>
                      <div
                        style={styles.checkboxRow}
                        onClick={() =>
                          setFormValues((prev) => ({
                            ...prev,
                            [fieldKey]: isChecked ? "false" : "true",
                          }))
                        }
                      >
                        <div
                          style={{
                            ...styles.checkbox,
                            backgroundColor: isChecked
                              ? BRAND.blue
                              : "transparent",
                            borderColor: isChecked
                              ? BRAND.blue
                              : "var(--card-border)",
                          }}
                        >
                          {isChecked && (
                            <span style={{ color: "#fff", fontSize: 12 }}>
                              ✓
                            </span>
                          )}
                        </div>
                        <span style={styles.checkboxLabel}>
                          {isChecked ? "Provided ✓" : "Not provided"}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={fieldKey} style={styles.fieldWrapper}>
                    <p style={styles.fieldLabelEN}>{labelEN}</p>
                    <p style={styles.fieldLabelLocal}>{labelLocal}</p>
                    <div style={styles.inputWrapper}>
                      <input
                        type="text"
                        value={val || ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            [fieldKey]: e.target.value,
                          }))
                        }
                        style={styles.fieldInput}
                        placeholder="—"
                      />
                      <Edit3
                        size={14}
                        color="var(--text-muted)"
                        style={{ flexShrink: 0 }}
                      />
                    </div>
                  </div>
                );
              })}

              <motion.div
                style={styles.proceedBtn}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
              >
                <span style={styles.proceedBtnText}>
                  Looks Good — Proceed to Sign
                </span>
                <ArrowRight size={18} color="#fff" />
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 2 — SIGNATURE ─────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              style={styles.stepCard}
            >
              <p style={styles.stepHint}>
                Sign below using your finger or stylus.
              </p>
              <p
                style={{
                  ...styles.stepHint,
                  fontStyle: "italic",
                  color: "var(--text-muted)",
                }}
              >
                यहाँ अपना हस्ताक्षर करें
              </p>

              <div style={styles.canvasWrapper}>
                <canvas
                  ref={canvasRef}
                  style={styles.canvas}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                  <p style={styles.canvasPlaceholder}>
                    Sign here / यहाँ हस्ताक्षर करें
                  </p>
                )}
              </div>

              <div style={styles.canvasControls}>
                <motion.div
                  style={styles.clearBtn}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearSignature}
                >
                  <RotateCcw size={14} color="var(--text-secondary)" />
                  <span style={styles.clearBtnText}>Clear</span>
                </motion.div>
                <motion.div
                  style={styles.backBtn}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                >
                  <span style={styles.clearBtnText}>← Back to Review</span>
                </motion.div>
              </div>

              <motion.div
                style={{
                  ...styles.submitBtn,
                  opacity: hasSignature && !isSubmitting ? 1 : 0.5,
                }}
                whileTap={hasSignature && !isSubmitting ? { scale: 0.97 } : {}}
                onClick={
                  hasSignature && !isSubmitting ? handleSubmit : undefined
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={20}
                      color="#fff"
                      style={{ animation: "loader-spin 0.8s linear infinite" }}
                    />
                    <span style={styles.submitBtnText}>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} color="#fff" />
                    <span style={styles.submitBtnText}>
                      Submit Signed Form ✓
                    </span>
                  </>
                )}
              </motion.div>

              <p style={styles.securityNote}>
                🔒 Your signature is encrypted and stored per RBI guidelines
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100dvh",
    backgroundColor: "var(--body-bg)",
    display: "flex",
    justifyContent: "center",
    padding: "0 0 48px 0",
    overflowY: "auto",
  },
  container: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    backgroundColor: "var(--card-bg)",
    borderBottom: "1px solid var(--card-border)",
    padding: "16px 16px 0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: BRAND.blue,
    margin: 0,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-muted)",
    margin: "2px 0 0",
  },
  tokenBadge: {
    padding: "4px 12px",
    borderRadius: 20,
    backgroundColor: "var(--badge-bg)",
    border: "1px solid var(--card-border)",
  },
  tokenText: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    fontFamily: "'Inter', monospace",
  },
  stepper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 14,
  },
  stepperItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  stepperDot: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperNum: { fontSize: 12, fontWeight: 700, color: "#fff" },
  stepperLine: {
    width: 60,
    height: 2,
    borderRadius: 1,
    margin: "0 8px",
    marginBottom: 20,
  },
  stepperLabel: { fontSize: 11, fontWeight: 600 },
  stepCard: {
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  stepHint: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.5,
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 14px",
    borderRadius: 12,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
  },
  fieldLabelEN: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: 0,
  },
  fieldLabelLocal: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-muted)",
    margin: 0,
  },
  inputWrapper: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
  fieldInput: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: 0,
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    cursor: "pointer",
    userSelect: "none",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-secondary)",
  },
  proceedBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "16px 20px",
    borderRadius: 14,
    backgroundColor: BRAND.blue,
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 2px 12px rgba(0,48,135,0.2)",
    marginTop: 8,
  },
  proceedBtnText: { fontSize: 15, fontWeight: 600, color: "#fff" },
  canvasWrapper: {
    position: "relative",
    width: "100%",
    height: 220,
    borderRadius: 14,
    border: "2px dashed rgba(0,48,135,0.25)",
    backgroundColor: "var(--card-bg)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    cursor: "default",
    touchAction: "none",
  },
  canvasPlaceholder: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-muted)",
    pointerEvents: "none",
    textAlign: "center",
    userSelect: "none",
  },
  canvasControls: { display: "flex", gap: 12, justifyContent: "center" },
  clearBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 10,
    backgroundColor: "var(--badge-bg)",
    border: "1px solid var(--card-border)",
    cursor: "pointer",
    userSelect: "none",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 10,
    backgroundColor: "var(--badge-bg)",
    border: "1px solid var(--card-border)",
    cursor: "pointer",
    userSelect: "none",
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "16px 20px",
    borderRadius: 14,
    backgroundColor: "#16A34A",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 2px 12px rgba(22,163,74,0.25)",
    marginTop: 4,
  },
  submitBtnText: { fontSize: 15, fontWeight: 700, color: "#fff" },
  securityNote: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-muted)",
    textAlign: "center",
    margin: 0,
  },
};
```

---

### Phase 5 — Add Route in `App.jsx`

Open `frontend/customer-panel/src/App.jsx`. Make exactly two changes:

```jsx
// 1. Add lazy import at the top (with existing lazy imports):
const SaralFormPage = lazy(() => import('./pages/SaralFormPage'));

// 2. Add route inside <Routes> — between LiveSessionPage and SummaryPage:
<Route path="/session/:token"        element={<LiveSessionPage />} />
<Route path="/saral-form"            element={<SaralFormPage />} />   {/* ← NEW */}
<Route path="/summary/:session_id"   element={<SummaryPage />} />
```

---

### Phase 6 — Update Customer `useWebSocket.js`

Open `frontend/customer-panel/src/hooks/useWebSocket.js`.

Find the `session_ended` case in the `switch (type)` block:

```js
// CURRENT CODE:
case "session_ended": {
  endSessionStore();
  toast.success("Session completed", { icon: "✅", duration: 3000 });
  if (navigateRef.current && data?.session_id) {
    navigateRef.current(`/summary/${data.session_id}`);
  }
  break;
}
```

**Replace with:**

```js
// UPDATED CODE — inserts SaralForm between session end and summary:
case "session_ended": {
  endSessionStore();
  toast.success("Session complete! Please fill your form.", { icon: "📝", duration: 3000 });

  if (navigateRef.current) {
    navigateRef.current("/saral-form", {
      state: {
        tokenNumber:   data?.token_number   || "",
        sessionId:     data?.session_id     || null,
        collectedData: data?.collected_data || {},
        intent:        data?.intent         || "general",
        langCode:      data?.language_code  || "hi",
      },
    });
  }
  break;
}
```

---

### Phase 7 — Update `broadcast_session_ended()` in `manager.py`

Open `backend/websocket/manager.py`. Find `broadcast_session_ended()` and update its signature and payload:

```python
# UPDATED signature — add 3 new optional params:
async def broadcast_session_ended(
    self,
    token_number: str,
    summary_url: Optional[str],
    duration_seconds: Optional[int],
    total_exchanges: int,
    session_id: Optional[int] = None,
    collected_data: Optional[dict] = None,      # ← NEW
    intent: Optional[str] = None,               # ← NEW
    language_code: Optional[str] = None,        # ← NEW
) -> None:
    await self.send_to_both(
        token_number,
        "session_ended",
        {
            "token_number":     token_number,
            "session_id":       session_id,
            "summary_url":      summary_url,
            "duration_seconds": duration_seconds,
            "total_exchanges":  total_exchanges,
            "collected_data":   collected_data or {},    # ← NEW
            "intent":           intent or "general",     # ← NEW
            "language_code":    language_code or "hi",  # ← NEW
            "message":          "Session has ended. Thank you.",
        },
    )
```

**Find the call site** and add the three new args:

```bash
grep -rn "broadcast_session_ended" backend/
```

```python
# UPDATED call site:
await ws_manager.broadcast_session_ended(
    token_number=token_number,
    summary_url=None,
    duration_seconds=duration,
    total_exchanges=total,
    session_id=session_obj.id,
    collected_data=session_obj.collected_data or {},            # ← NEW
    intent=str(session_obj.intent_detected or "general"),      # ← NEW
    language_code=session_obj.customer_language_code or "hi",  # ← NEW
)
```

---

### Phase 8 — Staff Panel: Handle `form_signed` Event

Open `frontend/staff-panel/src/hooks/useWebSocket.js`.

Add this case **before** the `default` case in `switch (type)`:

```js
case "form_signed": {
  const { form_ref, form_name, token_number, signature_url } = data;

  toast.success(
    `📝 ${form_name || form_ref} signed — Token ${token_number}`,
    { duration: 8000, icon: "✅" }
  );

  window.dispatchEvent(
    new CustomEvent("vaani_form_signed", { detail: data })
  );

  break;
}
```

---

### Phase 9 — Staff Panel: Notification Card UI

Open `frontend/staff-panel/src/pages/DashboardPage.jsx` (or `ProcessPanel.jsx` — whichever renders the main session area).

**Add state + event listener:**

```jsx
const [formSignedNotif, setFormSignedNotif] = useState(null);

useEffect(() => {
  const onFormSigned = (e) => setFormSignedNotif(e.detail);
  window.addEventListener("vaani_form_signed", onFormSigned);
  return () => window.removeEventListener("vaani_form_signed", onFormSigned);
}, []);
```

**Add notification card JSX** (near other status banners):

```jsx
{
  formSignedNotif && (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 14,
        backgroundColor: "rgba(22,163,74,0.06)",
        border: "2px solid rgba(22,163,74,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: "rgba(22,163,74,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        ✅
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#16A34A" }}
        >
          Form Signed!
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          {formSignedNotif.form_name || formSignedNotif.form_ref}
        </p>
        <p
          style={{
            margin: "1px 0 0",
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          Token: {formSignedNotif.token_number}
        </p>
      </div>

      {formSignedNotif.signature_url && (
        <a
          href={`${API_BASE_URL}/forms/signature/${formSignedNotif.token_number}`}
          target="_blank"
          rel="noreferrer"
          download
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            backgroundColor: "#16A34A",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
            whiteSpace: "nowrap",
          }}
        >
          📥 Signature
        </a>
      )}

      <div
        style={{
          cursor: "pointer",
          padding: 6,
          color: "var(--text-muted)",
          fontSize: 16,
          flexShrink: 0,
        }}
        onClick={() => setFormSignedNotif(null)}
      >
        ✕
      </div>
    </div>
  );
}
```

---

## 8. All API Endpoints

| Method | Path                       | Auth | Description                             |
| ------ | -------------------------- | ---- | --------------------------------------- |
| `POST` | `/forms/submit`            | None | Customer submits verified + signed form |
| `GET`  | `/forms/signature/{token}` | None | Staff/customer downloads signature PNG  |

**Existing endpoints used (no changes needed):**

| Method | Path                            | Used By                                     |
| ------ | ------------------------------- | ------------------------------------------- |
| `GET`  | `/summary/session/{session_id}` | SummaryPage polls after SaralForm submits   |
| `GET`  | `/summary/{summary_id}/pdf`     | SummaryPage PDF download button             |
| `WS`   | `/ws/{token}`                   | `form_signed` event received by staff panel |

---

## 9. Testing

```bash
# 1. Start backend
cd backend && uvicorn main:app --reload

# 2. Test form submission directly:
curl -X POST http://localhost:8000/forms/submit \
  -H "Content-Type: application/json" \
  -d '{
    "token_number": "NJT-1267",
    "session_id": 1,
    "form_ref": "A-101",
    "confirmed_fields": {"customer_name": "Ramesh Kumar", "age": "42"},
    "signature_data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "language_code": "hi"
  }'

# Expected response:
# {
#   "success": true,
#   "message": "Form submitted. Redirecting to your session summary.",
#   "form_ref": "A-101",
#   "token_number": "NJT-1267"
# }

# 3. Download the saved signature:
curl http://localhost:8000/forms/signature/NJT-1267 --output signature.png

# 4. Run existing test suite to ensure nothing broke:
cd backend && pytest tests/ -v
```

---

## 10. File Locations Summary

```
backend/
├── routers/
│   └── forms.py                          ← NEW (Phase 1)
├── models.py                             ← MODIFY: add form_signed_at column (Phase 3)
├── main.py                               ← MODIFY: add forms_router (Phase 2)
├── websocket/
│   └── manager.py                        ← MODIFY: broadcast_session_ended() + 3 params (Phase 7)
└── migrations/versions/
    └── xxxx_add_form_signed_at.py        ← AUTO-GENERATED by alembic (Phase 3)

frontend/customer-panel/src/
├── pages/
│   └── SaralFormPage.jsx                 ← NEW (Phase 4)
├── App.jsx                               ← MODIFY: add /saral-form route (Phase 5)
└── hooks/
    └── useWebSocket.js                   ← MODIFY: session_ended case (Phase 6)

frontend/staff-panel/src/
├── hooks/
│   └── useWebSocket.js                   ← MODIFY: add form_signed case (Phase 8)
└── pages/ (or components/)
    └── ProcessPanel.jsx / DashboardPage  ← MODIFY: notification card UI (Phase 9)

storage/
└── signatures/                           ← AUTO-CREATED at runtime by forms.py
```

**Zero new npm packages needed:**

| Package            | Status               |
| ------------------ | -------------------- |
| `react-router-dom` | ✅ already installed |
| `framer-motion`    | ✅ already installed |
| `lucide-react`     | ✅ already installed |
| `react-hot-toast`  | ✅ already installed |
| HTML5 Canvas API   | ✅ native browser    |

---

## 11. Quick Checklist

```
☐ Phase 1  — Create backend/routers/forms.py
☐ Phase 2  — Register in main.py (2 lines)
☐ Phase 3  — Add form_signed_at column + run alembic upgrade
☐ Phase 4  — Create SaralFormPage.jsx
☐ Phase 5  — Add /saral-form route in App.jsx (2 lines)
☐ Phase 6  — Update session_ended handler in customer useWebSocket.js
☐ Phase 7  — Update broadcast_session_ended() in manager.py + call site
☐ Phase 8  — Add form_signed case in staff useWebSocket.js
☐ Phase 9  — Add notification card in staff panel ProcessPanel/DashboardPage
☐ Phase 10 — Test with curl, then end-to-end in browser
```

---

_VaaniBank AI | PSBs IDEA 2.0 Hackathon | Union Bank of India | Team Vectora_
