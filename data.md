# VaaniBank AI — Knowledge Base Analysis & Data Requirements
**Date:** May 2026  
**Status:** ✅ Implemented (v2.5)

## 1. Executive Summary
The knowledge base has been upgraded to **Version 2.5**, transitioning from general product info to **Comprehensive Retail, Digital & Overseas Data**. This upgrade significantly improves RAG retrieval for complex banking inquiries, particularly for Education Loans, Fixed Deposits, and Digital Banking limits.

---

## 2. Implemented: Scheme-Specific Education Loan Matrices
We have integrated distinct rules for:
*   **PM-Vidyalaxmi Scheme (PMV):** 
    *   **QHEI Definition:** NIRF Top 100/200 and Central Govt institutions.
    *   **Guarantee Rule:** Strictly collateral-free even above ₹7.5L for QHEIs.
    *   **Subvention Delivery:** 3% subvention via CBDC e-vouchers for mid-income groups.
    *   **Refusal Policy:** Cannot be refused based on income > ₹8L.
*   **Premier Institute Abroad Studies:** Unsecured limits up to ₹40 Lakh for Category A institutes and specific rate/margin concessions for high collateral.
*   **Domestic Premier Institutes (Tier I & II):** 
    *   **Tier 1:** IITs, IIMs, NITs, ISB, XLRI with max loan ₹40L and 0% margin.
    *   **Co-Applicant Logic:** Income not required for evaluation in Tier 1 institutes (only KYC/CIBIL).
*   **General Baseline Matrix:** Clear thresholds for collateral (₹4L/₹7.5L) and mandatory third-party guarantees.

---

## 3. Implemented: Savings & Operational Rules
*   **QAB (Quarterly Average Balance):** Tiered logic for Rural, Semi-Urban, Urban, and Metro branches (ranging from ₹100 to ₹1,000).
*   **QAB Calculation:** Explicit formula `Σ(Daily EOD Closing Balances) / Total Days` and guardrail examples.
*   **Shortfall Penalties:** Scaled penalty logic (₹29.50 to ₹118.00 including 18% GST).
*   **Dormancy Guardrails:** 2-year inoperative flag logic with RAG-specific instructions on customer-induced activity.
*   **BSBDA & Small Accounts:** Detailed caps for balance (₹50k), credits (₹1L), and monthly withdrawals (4 free).

---

## 4. Implemented: Digital Banking & Limits
*   **Rebranding:** Official transition from **VYOM** to **Union ease**.
*   **Hard Transaction Caps:** Daily limits for IMPS/NEFT (₹2L), UPI (₹1L), and customized variant limits for ATM/POS.

---

## 5. Implemented: Grievance Redressal
*   **Escalation Matrix:** Level 1 to Level 4 (RBI Ombudsman) pathing with official PNO contact details.
*   **TAT Rules:** 5-7 days for digital reversals and the mandatory 30-day internal resolution window.

---

## 6. Implemented: General Account Services & Deposits
*   **Service Requests:** Nominee management (DA-1/DA-2), branch-to-branch account transfers, and digital email registration.
*   **Fees & Limits:** Passbook duplicate charges and the ₹50,000 PAN threshold for cash deposits.
*   **Fixed & Recurring Deposits:** 
    *   **Milestone Rates:** Detailed 400-day peak rates (6.30%) and Senior/Super Senior Citizen premiums.
    *   **Monthly Income Scheme (MIS):** Discounted interest payout logic.
    *   **Loans against FD:** 90% limit and 1-2% markup rate.
    *   **TDS Management:** Statutory thresholds and digital Form 15G/H workflows.

---

## 8. Implemented: Comprehensive Retail, Digital & Overseas Data (v2.5)
*   **Education Loan Extensions:** 
    *   **Overseas:** No ceiling for Ivy League, 15% margin (0% with FD), refundable 1% processing fee for >₹40L.
    *   **Moratorium:** EMI starts 1yr after course or 6mo after job. Interest-only payments allowed.
    *   **CSIS:** 100% subvention for EWS (income <₹4.5L) for domestic studies.
*   **Retail Lending Overhaul:**
    *   **Home Loans:** 7.15% min rate (CIBIL 800+), ₹15k fee cap, 5bps female concession, 90/80/75% LTV bands.
    *   **Vehicle Loans:** 7-year tenure, NRI primary borrower eligibility, specific used car age limits.
    *   **Personal Loans:** ₹20k metro income, pensioner fee waivers, 2% default penalty.
*   **Digital Channel Mastery ("Union ease"):**
    *   **Troubleshooting:** Device binding (SIM 1), tPIN generation, and Net Banking self-unlocking.
    *   **Limits:** IMPS (₹5L), NEFT (₹10L), UPI (₹1L/20 txns), new beneficiary cooling cap (₹50k).
    *   **Self-Service:** Stop-payment, Aadhaar seeding (BASE), and IVR card blocking.
*   **Fraud & Safeguards:**
    *   **Reporting:** Phishing email and 1930 Cyber Helpline.
    *   **Panic Button:** SMS "BLOCK" to 09223008486 or in-app emergency freeze.
*   **Card & Grievance Extras:**
    *   **HNI Cards:** ₹1L ATM / ₹5L POS limits and lounge access.
    *   **Reversals:** T+5 day mandate for failed ATM transactions.

---
**Prepared by:** VaaniBank-AI Assistant  
**Target:** Knowledge Base v2.5 Upgrade (COMPLETED)
