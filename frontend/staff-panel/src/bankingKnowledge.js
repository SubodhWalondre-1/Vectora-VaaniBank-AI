/**
 * VaaniBank AI — Complete Banking Knowledge Base
 * Union Bank of India — Real Data (2025)
 * Used by ProcessPanel tabs: Steps | Documents | Eligibility | Key Info | Quick Numbers
 */

export const BANKING_KNOWLEDGE = {

  // 1. ACCOUNT OPENING
  account_opening: {
    label: 'Account Opening',
    steps: [
      { num: 1, textHindi: 'ग्राहक को बताएं कि खाता खोलने के लिए आधार कार्ड, पैन कार्ड और पासपोर्ट साइज फोटो आवश्यक है।', textEnglish: 'Inform the customer that Aadhaar card, PAN card, and passport-size photo are required to open an account.', speakToCustomer: true,  speakLabel: 'Explain required documents',  isRBIMandatory: false, docHint: 'Aadhaar + PAN + Photo' },
      { num: 2, textHindi: 'ग्राहक द्वारा प्रस्तुत दस्तावेज़ों की जांच करें — मूल देखें, स्व-प्रमाणित प्रति लें।', textEnglish: 'Verify documents submitted by the customer — check originals and collect self-attested copies.', speakToCustomer: false, speakLabel: null,               isRBIMandatory: false, docHint: 'Aadhaar + PAN + Photo + Address Proof' },
      { num: 3, textHindi: 'आधार-आधारित eKYC करें — OTP या बायोमेट्रिक फिंगरप्रिंट वेरिफिकेशन।', textEnglish: 'Complete Aadhaar-based eKYC — OTP verification or biometric fingerprint authentication.', speakToCustomer: false, speakLabel: null,               isRBIMandatory: true,  docHint: 'Aadhaar (OTP/Biometric)' },
      { num: 4, textHindi: 'PAN लिंकेज — NSDL/CDSL डेटाबेस में PAN वेरिफाई करें।', textEnglish: 'PAN linkage — verify PAN in the NSDL/CDSL database.', speakToCustomer: false, speakLabel: null,               isRBIMandatory: true,  docHint: 'PAN Card' },
      { num: 5, textHindi: 'प्रारंभिक जमा लें — न्यूनतम ₹500 नकद या चेक के रूप में।', textEnglish: 'Collect the initial deposit — minimum ₹500 in cash or cheque.', speakToCustomer: true,  speakLabel: 'State deposit amount',    isRBIMandatory: false, docHint: null },
      { num: 6, textHindi: 'AOF फॉर्म स्कैन करके CBS/Finacle में अपलोड करें।', textEnglish: 'Scan the AOF form and upload it to CBS/Finacle.', speakToCustomer: false, speakLabel: null,               isRBIMandatory: false, docHint: 'Form A-101 (AOF)' },
      { num: 7, textHindi: 'खाता नंबर जनरेट करें, पासबुक व डेबिट कार्ड आवेदन दें। नेट बैंकिंग एक्टिवेशन बताएं।', textEnglish: 'Generate account number, issue passbook and debit card application. Explain net banking activation.', speakToCustomer: true,  speakLabel: 'Explain account details', isRBIMandatory: false, docHint: null },
    ],
    docs: [
      { icon: '🪪', label: 'Aadhaar Card', sub: '12-digit UID — original + self-attested copy', required: true, tagLabel: 'Required' },
      { icon: '📄', label: 'PAN Card', sub: 'Mandatory for deposits above ₹50,000. Form 60/61 if no PAN.', required: true, tagLabel: 'Required' },
      { icon: '📷', label: 'Passport Size Photos', sub: '2 recent colour photographs (not older than 6 months)', required: true, tagLabel: 'Required' },
      { icon: '🏠', label: 'Address Proof', sub: 'Utility bill, ration card or registered rent agreement (≤3 months old)', required: false, tagLabel: 'If Aadhaar address differs' },
      { icon: '📋', label: 'Form 60 / 61', sub: 'Only if customer does not have PAN card', required: false, tagLabel: 'If no PAN' },
    ],
    eligibility: [
      { label: 'Minimum age', value: '18 yrs (10+ for minor a/c)', status: 'neutral' },
      { label: 'Minimum balance', value: '₹500 urban / ₹0 BSBD', status: 'neutral' },
      { label: 'Initial deposit', value: '₹500 cash or cheque', status: 'good' },
      { label: 'KYC status', value: 'Full KYC required', status: 'good' },
      { label: 'Re-KYC frequency', value: 'Every 2–10 yrs (risk based)', status: 'neutral' },
      { label: 'NRI eligible', value: 'NRE / NRO account only', status: 'warn' },
      { label: 'Joint account', value: 'Allowed (Either/Survivor)', status: 'good' },
    ],
    info: [
      {
        blockTitle: 'Account Types',
        rows: [
          { key: 'Savings (Regular)', value: 'Min ₹500' },
          { key: 'BSBD (Zero Balance)', value: '₹0 — Jan Dhan' },
          { key: 'Current account', value: 'Min ₹5,000–₹25,000' },
          { key: 'Salary account', value: '₹0 employer-linked' },
          { key: 'Senior Citizen Savings', value: 'Min ₹500, extra interest' },
        ],
      },
      {
        blockTitle: 'Interest & Charges',
        rows: [
          { key: 'Savings interest rate', value: '2.75%–3.50% p.a.' },
          { key: 'ATM charges (own bank)', value: 'Free' },
          { key: 'ATM (other bank)', value: '₹20 after 5 free/month' },
          { key: 'Debit card delivery', value: '7–10 working days' },
          { key: 'Passbook issuance', value: 'Free at branch' },
        ],
      },
    ],
    numbers: [
      { icon: '📞', label: 'Customer care (24x7)', value: '1800 22 2244' },
      { icon: '💳', label: 'Card block SMS to', value: '09223008486' },
      { icon: '📱', label: 'Balance missed call', value: '09223766666' },
      { icon: '🌐', label: 'Net banking', value: 'unionbankonline.co.in' },
      { icon: '🛡️', label: 'Grievance / Ombudsman', value: 'cms.rbi.org.in' },
    ],
  },

  // 2. LOAN ENQUIRY
  loan_enquiry: {
    label: 'Loan Enquiry',
    steps: [
      { num: 1, textHindi: 'ग्राहक से लोन की जरूरत समझें — प्रकार, राशि, उद्देश्य और अवधि पूछें।', textEnglish: "Understand the customer's loan requirement — ask about type, amount, purpose, and tenure.", speakToCustomer: true,  speakLabel: 'Ask loan type', isRBIMandatory: false, docHint: null },
      { num: 2, textHindi: 'त्वरित पात्रता जांच करें — आयु, आय, और CIBIL स्कोर सिस्टम में देखें (न्यूनतम 700)।', textEnglish: 'Run a quick eligibility check — verify age, income, and CIBIL score in the system (minimum 700).', speakToCustomer: false, speakLabel: null,              isRBIMandatory: false, docHint: 'Salary slip / ITR' },
      { num: 3, textHindi: 'लोन कैलकुलेटर से EMI निकालें और ग्राहक को दिखाएं — EMI आय का 50% से अधिक नहीं होनी चाहिए।', textEnglish: 'Calculate EMI using the loan calculator and show the customer — EMI should not exceed 50% of income.', speakToCustomer: true,  speakLabel: 'State EMI details',       isRBIMandatory: false, docHint: null },
      { num: 4, textHindi: 'प्रोसेसिंग शुल्क (0.50%–1% + GST) और प्रीपेमेंट चार्जेस की जानकारी दें।', textEnglish: 'Inform about processing fee (0.50%–1% + GST) and prepayment charges.', speakToCustomer: true,  speakLabel: 'State service charges',   isRBIMandatory: false, docHint: null },
      { num: 5, textHindi: 'दस्तावेज़ और आवेदन पत्र एकत्र करें। PMAY सब्सिडी के बारे में बताएं यदि लागू हो।', textEnglish: 'Collect documents and application form. Inform about PMAY subsidy if applicable.', speakToCustomer: false, speakLabel: null,              isRBIMandatory: false, docHint: 'Salary slip + ITR + Bank stmt + Property docs' },
      { num: 6, textHindi: 'आवेदन लोन प्रोसेसिंग अधिकारी को भेजें और ग्राहक को आवेदन संख्या दें।', textEnglish: 'Forward the application to the loan processing officer and provide the customer with an application number.', speakToCustomer: true,  speakLabel: 'Provide application number', isRBIMandatory: false, docHint: null },
    ],
    docs: [
      { icon: '💰', label: 'Salary Slips (last 3 months)', sub: 'Original or bank-stamped copies', required: true, tagLabel: 'Salaried — Required' },
      { icon: '📄', label: 'Form 16 / ITR (last 2 years)', sub: 'Income tax return with computation sheet', required: true, tagLabel: 'Salaried — Required' },
      { icon: '🏦', label: 'Bank Statement (6 months)', sub: 'Savings account statement — salary credit visible', required: true, tagLabel: 'Required' },
      { icon: '🪪', label: 'Employer ID / Appointment Letter', sub: 'Current employment proof with designation', required: true, tagLabel: 'Salaried — Required' },
      { icon: '📊', label: 'ITR last 3 years (Self-Employed)', sub: 'With computation, balance sheet + P&L (CA certified)', required: false, tagLabel: 'Self-Employed' },
      { icon: '📜', label: 'Business Proof', sub: 'GST registration, trade license or incorporation certificate', required: false, tagLabel: 'Self-Employed' },
      { icon: '🏠', label: 'Property Documents', sub: 'Sale deed, agreement to sell, approved building plan, NOC from society', required: false, tagLabel: 'Home Loan only' },
    ],
    eligibility: [
      { label: 'Minimum age', value: '21 years', status: 'neutral' },
      { label: 'Maximum age', value: '65 yrs (70 for home loan)', status: 'neutral' },
      { label: 'CIBIL score (minimum)', value: '700 (750+ preferred)', status: 'good' },
      { label: 'Income — EMI ratio', value: 'EMI ≤ 40–50% of income', status: 'neutral' },
      { label: 'Salaried employment', value: 'Min 2 years in current job', status: 'neutral' },
      { label: 'Self-employed stability', value: 'Min 3 years in business', status: 'neutral' },
      { label: 'Existing NPA/default', value: 'Not eligible if active NPA', status: 'warn' },
    ],
    info: [
      {
        blockTitle: 'Loan Interest Rates (2025)',
        rows: [
          { key: 'Home Loan', value: '8.35%–9.85% p.a.' },
          { key: 'Personal Loan', value: '10.50%–14.75% p.a.' },
          { key: 'Car Loan', value: '8.80%–10.25% p.a.' },
          { key: 'Education Loan', value: '8.15%–11.15% p.a.' },
          { key: 'Gold Loan', value: '8.75%–10.50% p.a.' },
          { key: 'Mudra Loan (Tarun)', value: '10%–12% up to ₹10L' },
          { key: 'Kisan Credit Card', value: '7% p.a. (subsidized)' },
        ],
      },
      {
        blockTitle: 'EMI Quick Reference',
        rows: [
          { key: 'Home ₹30L, 20yr, 8.5%', value: '≈ ₹26,035/month' },
          { key: 'Personal ₹5L, 5yr, 12%', value: '≈ ₹11,122/month' },
          { key: 'Car ₹8L, 7yr, 9%', value: '≈ ₹12,800/month' },
          { key: 'Processing fee', value: '0.50%–1% + 18% GST' },
          { key: 'PMAY subsidy (home)', value: 'Up to ₹2.67L (EWS/LIG)' },
        ],
      },
    ],
    numbers: [
      { icon: '📞', label: 'Loan helpline (24x7)', value: '1800 22 2244' },
      { icon: '🌐', label: 'Apply loan online', value: 'unionbankofindia.co.in' },
      { icon: '🧮', label: 'EMI calculator', value: 'unionbankofindia.co.in/emi' },
      { icon: '📊', label: 'CIBIL score check', value: 'cibil.com' },
      { icon: '🏠', label: 'PMAY scheme portal', value: 'pmaymis.gov.in' },
    ],
  },

  // 3. KYC UPDATE
  kyc_update: {
    label: 'KYC Update',
    steps: [
      { num: 1, textHindi: 'ग्राहक से पूछें कि क्या अपडेट करना है — पता, मोबाइल, ईमेल, नॉमिनी, हस्ताक्षर या नाम।', textEnglish: 'Ask the customer what needs to be updated — address, mobile, email, nominee, signature, or name.', speakToCustomer: true,  speakLabel: 'Ask update type',    isRBIMandatory: false, docHint: null },
      { num: 2, textHindi: 'ग्राहक की पहचान सत्यापित करें — आधार OTP या बायोमेट्रिक फिंगरप्रिंट से।', textEnglish: "Verify the customer's identity — via Aadhaar OTP or biometric fingerprint.", speakToCustomer: false, speakLabel: null,                    isRBIMandatory: true,  docHint: 'Aadhaar (OTP/Biometric)' },
      { num: 3, textHindi: 'सहायक दस्तावेज़ एकत्र करें — मूल देखें, स्व-प्रमाणित प्रति लें।', textEnglish: 'Collect supporting documents — check originals and take self-attested copies.', speakToCustomer: false, speakLabel: null,                    isRBIMandatory: false, docHint: 'Address proof / Nominee KYC / Gazette (as needed)' },
      { num: 4, textHindi: 'CBS / Finacle में अपडेट करें और परिवर्तन सेव करें।', textEnglish: 'Update in CBS / Finacle and save the changes.', speakToCustomer: false, speakLabel: null,                    isRBIMandatory: false, docHint: null },
      { num: 5, textHindi: 'पावती पर्ची जनरेट करें और ग्राहक को दें। बताएं — 24 घंटे में सक्रिय होगा।', textEnglish: 'Generate acknowledgement slip and hand it to the customer. Inform — active within 24 hours.', speakToCustomer: true,  speakLabel: 'Provide acknowledgement', isRBIMandatory: false, docHint: null },
    ],
    docs: [
      { icon: '📍', label: 'Updated Aadhaar Card', sub: 'For address update — Aadhaar must already have new address updated', required: false, tagLabel: 'Address Update' },
      { icon: '📄', label: 'Utility Bill / Govt Letter', sub: 'Electricity, gas, water bill — not older than 3 months', required: false, tagLabel: 'Address Update (alt)' },
      { icon: '👤', label: "Nominee's Aadhaar + Photo", sub: "Nominee's KYC + relationship proof (birth certificate / marriage certificate)", required: false, tagLabel: 'Nominee Change' },
      { icon: '📰', label: 'Gazette Notification / Court Order', sub: 'Only for legal name correction (not spelling correction)', required: false, tagLabel: 'Name Correction' },
      { icon: '💼', label: 'Occupation Proof', sub: 'Salary slip, trade license or appointment letter', required: false, tagLabel: 'Occupation Update' },
    ],
    eligibility: [
      { label: 'KYC update cost', value: 'Free — no charge at all', status: 'good' },
      { label: 'Mobile update', value: 'Dual OTP: old + new mobile', status: 'neutral' },
      { label: 'Activation time', value: '24 hours after update', status: 'neutral' },
      { label: 'Low-risk Re-KYC', value: 'Every 10 years (RBI)', status: 'good' },
      { label: 'Medium-risk Re-KYC', value: 'Every 8 years (RBI)', status: 'neutral' },
      { label: 'High-risk Re-KYC', value: 'Every 2 years (PEP/NRI)', status: 'warn' },
      { label: 'Non-compliance', value: 'Account restricted in 6 months', status: 'warn' },
    ],
    info: [
      {
        blockTitle: 'Update Types & Requirements',
        rows: [
          { key: 'Address change', value: 'Aadhaar (updated) / utility bill' },
          { key: 'Mobile number', value: 'Old OTP + new OTP (dual verify)' },
          { key: 'Email ID', value: 'Net banking update / branch form' },
          { key: 'Nominee addition', value: 'DA1 form + nominee Aadhaar' },
          { key: 'Nominee change', value: 'DA2 form + relationship proof' },
          { key: 'Nominee cancellation', value: 'DA3 form + account holder sign' },
        ],
      },
      {
        blockTitle: 'RBI Re-KYC Mandate',
        rows: [
          { key: 'Low risk customers', value: 'Every 10 years' },
          { key: 'Medium risk', value: 'Every 8 years' },
          { key: 'High risk (PEP/NRI/HNI)', value: 'Every 2 years' },
          { key: 'Bank-initiated KYC', value: 'Comply within 6 months' },
          { key: 'Video KYC (V-CIP)', value: 'Available for remote update' },
        ],
      },
    ],
    numbers: [
      { icon: '📞', label: 'Customer care (24x7)', value: '1800 22 2244' },
      { icon: '🌐', label: 'KYC update portal', value: 'unionbankofindia.co.in' },
      { icon: '📱', label: 'Mobile banking app', value: 'Union Bank Mobile' },
      { icon: '🛡️', label: 'RBI KYC guidelines', value: 'rbi.org.in/kyc' },
      { icon: '❓', label: 'Grievance portal', value: 'unionbankofindia.co.in/grievance' },
    ],
  },

  // 4. CARD SERVICES
  card_services: {
    label: 'Card Services',
    steps: [
      { num: 1, textHindi: 'सेवा अनुरोध का प्रकार पहचानें — ब्लॉक, नया कार्ड, PIN बदलाव, लिमिट बदलाव, या ऐड-ऑन।', textEnglish: 'Identify the type of service request — block, new card, PIN change, limit change, or add-on card.', speakToCustomer: true,  speakLabel: 'Ask card request type',  isRBIMandatory: false, docHint: null },
      { num: 2, textHindi: 'ग्राहक की पहचान सत्यापित करें — जन्म तिथि + कार्ड के अंतिम 4 अंक।', textEnglish: 'Verify customer identity — date of birth + last 4 digits of card.', speakToCustomer: false, speakLabel: null,                    isRBIMandatory: true,  docHint: 'DOB + Last 4 card digits' },
      { num: 3, textHindi: 'यदि कार्ड ब्लॉक करना है — CBS में तुरंत ब्लॉक करें और संदर्भ संख्या दें।', textEnglish: 'If card blocking is needed — block immediately in CBS and provide a reference number.', speakToCustomer: true,  speakLabel: 'Block confirmation',   isRBIMandatory: false, docHint: null },
      { num: 4, textHindi: 'नए कार्ड के लिए — फॉर्म भरें, अंगूठे का निशान लें और सिस्टम में दर्ज करें।', textEnglish: 'For a new card — fill the form, take thumb impression, and register in the system.', speakToCustomer: false, speakLabel: null,                    isRBIMandatory: false, docHint: 'Photo ID + Card application form' },
      { num: 5, textHindi: 'ट्रैकिंग नंबर, डिलीवरी समय (7–10 दिन) और कार्ड सक्रिय करने के चरण बताएं।', textEnglish: 'Share tracking number, delivery timeline (7–10 days), and steps to activate the card.', speakToCustomer: true,  speakLabel: 'State delivery details', isRBIMandatory: false, docHint: null },
    ],
    docs: [
      { icon: '🪪', label: 'Photo ID Proof', sub: 'Aadhaar / Voter ID / Passport — for new card issuance', required: true, tagLabel: 'New Card — Required' },
      { icon: '💳', label: 'Old Card (if available)', sub: 'Damaged / expired card — submit for physical destruction at branch', required: false, tagLabel: 'Replacement Card' },
      { icon: '📋', label: 'Card Application Form', sub: 'Physical form with thumb impression at branch counter', required: true, tagLabel: 'Required' },
      { icon: '👤', label: 'Add-on Beneficiary KYC', sub: "Relationship proof + beneficiary's Aadhaar (spouse, child 18+, parent)", required: false, tagLabel: 'Add-on Card only' },
      { icon: '🌐', label: 'International Usage Form', sub: 'Separate application + RBI compliance for international limit activation', required: false, tagLabel: 'International limit only' },
    ],
    eligibility: [
      { label: 'Daily ATM limit (default)', value: '₹25,000', status: 'neutral' },
      { label: 'Daily ATM limit (max)', value: '₹1,00,000', status: 'neutral' },
      { label: 'POS limit (default)', value: '₹1,00,000', status: 'neutral' },
      { label: 'POS limit (max)', value: '₹2,00,000', status: 'good' },
      { label: 'Online limit (default)', value: '₹1,00,000', status: 'neutral' },
      { label: 'Online limit (max)', value: '₹5,00,000', status: 'good' },
      { label: 'International usage', value: 'Branch application needed', status: 'warn' },
    ],
    info: [
      {
        blockTitle: 'Card Types — Union Bank of India',
        rows: [
          { key: 'RuPay Platinum Debit', value: 'Domestic + free insurance' },
          { key: 'Visa Debit Classic', value: 'International usage' },
          { key: 'Mastercard Debit', value: 'Contactless + international' },
          { key: 'Union Bank Credit Card', value: 'Reward points, EMI facility' },
          { key: 'Kisan Credit Card', value: 'RuPay — agriculture credit' },
        ],
      },
      {
        blockTitle: 'Card Block Channels (Instant)',
        rows: [
          { key: 'Toll-free call', value: '1800 22 2244 (24x7)' },
          { key: 'SMS command', value: 'BLOCK <last 4 digits>' },
          { key: 'SMS number', value: '09223008486' },
          { key: 'Branch (CBS)', value: 'Immediate blocking' },
          { key: 'Mobile app', value: 'Union Bank Mobile' },
        ],
      },
      {
        blockTitle: 'PIN Change Options',
        rows: [
          { key: 'ATM self-serve', value: 'Any Union Bank ATM' },
          { key: 'Green PIN', value: 'Via registered mobile OTP' },
          { key: 'Net banking', value: 'unionbankonline.co.in' },
        ],
      },
    ],
    numbers: [
      { icon: '📞', label: 'Card block / helpline (24x7)', value: '1800 22 2244' },
      { icon: '💬', label: 'Card block SMS to', value: '09223008486' },
      { icon: '📱', label: 'Mobile banking app', value: 'Union Bank Mobile' },
      { icon: '🌐', label: 'Net banking', value: 'unionbankonline.co.in' },
      { icon: '🛡️', label: 'Card fraud report', value: '1800 22 2244 (Press 2)' },
    ],
  },

  // 5. BALANCE ENQUIRY
  balance_enquiry: {
    label: 'Balance Enquiry',
    steps: [
      { num: 1, textHindi: 'ग्राहक की पहचान सत्यापित करें — आधार के अंतिम 4 अंक या पंजीकृत मोबाइल OTP।', textEnglish: 'Verify customer identity — last 4 digits of Aadhaar or registered mobile OTP.', speakToCustomer: false, speakLabel: null,                  isRBIMandatory: true,  docHint: 'Aadhaar last 4 digits / Mobile OTP' },
      { num: 2, textHindi: 'CBS सिस्टम से बैलेंस / स्टेटमेंट प्राप्त करें और मिनी-स्टेटमेंट प्रिंट करें यदि आवश्यक हो।', textEnglish: 'Fetch balance / statement from CBS system and print mini-statement if needed.', speakToCustomer: false, speakLabel: null,                  isRBIMandatory: false, docHint: null },
      { num: 3, textHindi: 'जानकारी मौखिक रूप से दें और ग्राहक को स्व-सेवा विकल्प बताएं — मोबाइल बैंकिंग, मिस्ड कॉल, ATM।', textEnglish: 'Provide information verbally and inform the customer about self-service options — mobile banking, missed call, ATM.', speakToCustomer: true,  speakLabel: 'Explain self-service options', isRBIMandatory: false, docHint: null },
    ],
    docs: [
      { icon: '🪪', label: 'Identity Verification', sub: 'Aadhaar last 4 digits OR registered mobile OTP — mandatory before sharing balance', required: true, tagLabel: 'Required' },
      { icon: '✍️', label: 'Written Authorization', sub: 'If third party collecting info — signed letter + ID proof of both persons', required: false, tagLabel: 'Third-Party Request' },
      { icon: '📒', label: 'Passbook', sub: 'For passbook update — last 3 months transaction print at counter', required: false, tagLabel: 'Passbook Update' },
    ],
    eligibility: [
      { label: 'Identity verification', value: 'Mandatory before sharing', status: 'warn' },
      { label: 'Third party sharing', value: 'NEVER without written auth', status: 'warn' },
      { label: 'Mini statement (ATM)', value: 'Last 5 transactions', status: 'neutral' },
      { label: 'Detailed statement', value: 'Last 3 months via passbook', status: 'neutral' },
      { label: 'UBI ATM transactions', value: 'Unlimited — free', status: 'good' },
      { label: 'Other bank ATM', value: '5 free/month, ₹20 after', status: 'neutral' },
      { label: 'Missed call service', value: 'Free — 09223766666', status: 'good' },
    ],
    info: [
      {
        blockTitle: 'Balance Check Channels',
        rows: [
          { key: 'Missed call — balance', value: '09223766666 (free)' },
          { key: 'Missed call — mini stmt', value: '09223866666 (free)' },
          { key: 'SMS — balance', value: 'BAL to 09223008486' },
          { key: 'ATM (UBI bank)', value: 'Free — balance + mini stmt' },
          { key: 'ATM (other bank)', value: '₹20 after 5 free/month' },
          { key: 'Net banking', value: 'unionbankonline.co.in' },
          { key: 'Mobile app', value: 'Union Bank Mobile Banking' },
        ],
      },
      {
        blockTitle: 'RBI Privacy Rules',
        rows: [
          { key: 'Balance sharing', value: 'Only to account holder' },
          { key: 'Third party', value: 'Written auth + ID proof both' },
          { key: 'Phone enquiry', value: 'OTP verification mandatory' },
          { key: 'Minor account', value: 'Parent/guardian authorized only' },
        ],
      },
    ],
    numbers: [
      { icon: '📞', label: 'Balance missed call', value: '09223766666' },
      { icon: '📞', label: 'Mini-statement missed call', value: '09223866666' },
      { icon: '💬', label: 'SMS BAL to', value: '09223008486' },
      { icon: '🌐', label: 'Net banking', value: 'unionbankonline.co.in' },
      { icon: '📞', label: 'Customer care (24x7)', value: '1800 22 2244' },
    ],
  },

  // 6. FIXED DEPOSIT
  fixed_deposit: {
    label: 'Fixed Deposit',
    steps: [
      { num: 1, textHindi: 'ग्राहक से FD की राशि, अवधि और ब्याज भुगतान विकल्प पूछें — मासिक / तिमाही / परिपक्वता पर।', textEnglish: 'Ask the customer for FD amount, tenure, and interest payout preference — monthly / quarterly / at maturity.', speakToCustomer: true,  speakLabel: 'Ask FD details',  isRBIMandatory: false, docHint: null },
      { num: 2, textHindi: 'वर्तमान ब्याज दरें दिखाएं — मैच्योरिटी राशि कैलकुलेटर से निकालें और ग्राहक को बताएं।', textEnglish: 'Show current interest rates — calculate the maturity amount using the calculator and inform the customer.', speakToCustomer: true,  speakLabel: 'State FD interest rate',     isRBIMandatory: false, docHint: null },
      { num: 3, textHindi: 'नॉमिनी विवरण लें और Form 15G/15H (TDS बचत के लिए) जमा करें यदि लागू हो।', textEnglish: 'Collect nominee details and submit Form 15G/15H (for TDS exemption) if applicable.', speakToCustomer: false, speakLabel: null,                  isRBIMandatory: false, docHint: 'PAN + Form 15G/15H (if applicable) + Nominee details' },
      { num: 4, textHindi: 'बचत खाते से डेबिट करें या नकद स्वीकार करें (₹49,999 तक नकद सीमा)।', textEnglish: 'Debit from savings account or accept cash (cash limit up to ₹49,999).', speakToCustomer: false, speakLabel: null,                  isRBIMandatory: false, docHint: null },
      { num: 5, textHindi: 'FD रसीद जनरेट करें — ग्राहक को भौतिक रसीद दें और पासबुक में एंट्री करें।', textEnglish: 'Generate FD receipt — give the customer a physical receipt and make a passbook entry.', speakToCustomer: true,  speakLabel: 'Provide receipt details',    isRBIMandatory: false, docHint: null },
    ],
    docs: [
      { icon: '🪪', label: 'Aadhaar Card', sub: 'KYC mandatory — original + self-attested copy', required: true, tagLabel: 'Required' },
      { icon: '📄', label: 'PAN Card', sub: 'Mandatory — without PAN, TDS deducted at 20% instead of 10%', required: true, tagLabel: 'Required' },
      { icon: '📋', label: 'Form 15G', sub: 'For customers below 60 yrs and below taxable income — to avoid TDS', required: false, tagLabel: 'Below tax bracket' },
      { icon: '📋', label: 'Form 15H', sub: 'For senior citizens (60+) — to avoid TDS on FD interest', required: false, tagLabel: 'Senior Citizen' },
      { icon: '👤', label: 'Nominee Details', sub: 'Name, relation, DOB of nominee — mandatory for new FD', required: true, tagLabel: 'Required' },
    ],
    eligibility: [
      { label: 'Minimum FD amount', value: '₹1,000', status: 'good' },
      { label: 'Maximum FD amount', value: 'No upper limit', status: 'good' },
      { label: 'Cash deposit limit', value: 'Max ₹49,999 in cash', status: 'warn' },
      { label: 'TDS threshold', value: 'Interest > ₹40,000/year', status: 'neutral' },
      { label: 'TDS threshold (senior)', value: 'Interest > ₹50,000/year', status: 'neutral' },
      { label: 'TDS rate (with PAN)', value: '10%', status: 'neutral' },
      { label: 'TDS rate (no PAN)', value: '20% — higher penalty', status: 'warn' },
      { label: 'Loan against FD', value: 'Up to 90% of FD value', status: 'good' },
      { label: 'Premature withdrawal', value: '0.5–1% interest penalty', status: 'warn' },
    ],
    info: [
      {
        blockTitle: 'FD Rates — 2025 (General / Senior Citizen)',
        rows: [
          { key: '7–14 days', value: '3.00% / 3.50%' },
          { key: '46–90 days', value: '4.50% / 5.00%' },
          { key: '91–179 days', value: '5.50% / 6.00%' },
          { key: '180–364 days', value: '6.50% / 7.00%' },
          { key: '1 year', value: '6.80% / 7.30%' },
          { key: '2–3 years', value: '7.00% / 7.50%' },
          { key: '5 yrs Tax Saver (80C)', value: '6.70% / 7.20%' },
        ],
      },
      {
        blockTitle: 'Special FD Schemes',
        rows: [
          { key: 'Union Samridhi (400 days)', value: '7.40% / 7.90% (senior)' },
          { key: 'Union Dhan Vriddhi (333 days)', value: '7.25% / 7.75% (senior)' },
          { key: 'Tax Saver FD (5yr)', value: '80C deduction up to ₹1.5L' },
          { key: 'Loan against FD', value: 'Up to 90%, FD rate + 0.5–1%' },
        ],
      },
    ],
    numbers: [
      { icon: '📞', label: 'FD helpline (24x7)', value: '1800 22 2244' },
      { icon: '🌐', label: 'FD calculator online', value: 'unionbankofindia.co.in/fd' },
      { icon: '📱', label: 'Mobile banking — book FD', value: 'Union Bank Mobile' },
      { icon: '📋', label: 'TDS / Form 15G info', value: 'incometax.gov.in' },
      { icon: '🛡️', label: 'Ombudsman (dispute)', value: 'cms.rbi.org.in' },
    ],
  },

  // 7. GENERAL
  general: {
    label: 'General Query',
    steps: [
      {
        num: 1,
        textHindi:   'ग्राहक का स्वागत करें और टोकन नंबर नोट करें। पूछें — "आज हम आपकी क्या सहायता कर सकते हैं?"',
        textEnglish: 'Greet the customer and note their token number. Ask — "How may I assist you today?"',
        speakToCustomer: true, speakLabel: 'Welcome customer', isRBIMandatory: false, docHint: null,
      },
      {
        num: 2,
        textHindi:   'ग्राहक की आवश्यकता पहचानें — खाता, लोन, कार्ड, KYC, बैलेंस, FD या शिकायत?',
        textEnglish: 'Identify customer need — account opening, loan, card service, KYC update, balance enquiry, FD, or grievance?',
        speakToCustomer: false, speakLabel: null, isRBIMandatory: false, docHint: null,
      },
      {
        num: 3,
        textHindi:   'CBS में ग्राहक का खाता सत्यापित करें — खाता संख्या या Aadhaar के अंतिम 4 अंक से।',
        textEnglish: 'Verify the customer account in CBS — using account number or last 4 digits of Aadhaar.',
        speakToCustomer: false, speakLabel: null, isRBIMandatory: true, docHint: 'Aadhaar last 4 digits / Account number',
      },
      {
        num: 4,
        textHindi:   'सही सेवा काउंटर या विभाग पर भेजें — या यदि तत्काल हो तो स्वयं सेवा प्रदान करें।',
        textEnglish: 'Direct to the correct service counter / department — or handle immediately if urgent.',
        speakToCustomer: true, speakLabel: 'Direct to counter', isRBIMandatory: false, docHint: null,
      },
      {
        num: 5,
        textHindi:   'शिकायत हो तो — लिखित में लें, UBI Grievance Portal में दर्ज करें, Reference Number दें।',
        textEnglish: 'For grievance — record in writing, register on UBI Grievance Portal, provide reference number.',
        speakToCustomer: true, speakLabel: 'Provide reference number', isRBIMandatory: false, docHint: 'Written complaint form',
      },
      {
        num: 6,
        textHindi:   'ग्राहक को स्व-सेवा विकल्प बताएं — Union Bank Mobile App, Net Banking, ATM, Missed Call सेवा।',
        textEnglish: 'Inform customer about self-service channels — Union Bank Mobile App, Net Banking, ATM, Missed Call.',
        speakToCustomer: true, speakLabel: 'Explain self-service options', isRBIMandatory: false, docHint: null,
      },
    ],

    docs: [
      { icon: '🪪', label: 'Photo ID (if account action)', sub: 'Aadhaar / Voter ID for any account-related general request', required: false, tagLabel: 'If account action' },
      { icon: '✍️', label: 'Written Complaint (if grievance)', sub: 'Signed letter stating issue — branch keeps copy and gives reference number', required: false, tagLabel: 'Grievance' },
      { icon: '📒', label: 'Passbook / Account Number', sub: 'For cheque book request, NEFT/RTGS, or standing instruction queries', required: false, tagLabel: 'Fund Transfer / Cheque' },
    ],
    eligibility: [
      { label: 'Grievance resolution time', value: 'Within 30 days (RBI)', status: 'neutral' },
      { label: 'Ombudsman escalation', value: 'After 30 days if unresolved', status: 'warn' },
      { label: 'Cheque book (first 25)', value: 'Free per year', status: 'good' },
      { label: 'Cheque book (extra)', value: '₹3–5 per leaf', status: 'neutral' },
      { label: 'NEFT limit', value: 'No upper limit', status: 'good' },
      { label: 'RTGS minimum', value: '₹2 lakh (bank hours only)', status: 'neutral' },
      { label: 'IMPS limit', value: 'Up to ₹5 lakh (24x7)', status: 'good' },
      { label: 'UPI limit', value: 'Up to ₹1 lakh (free)', status: 'good' },
    ],
    info: [
      {
        blockTitle: 'Fund Transfer Modes',
        rows: [
          { key: 'IMPS', value: 'Up to ₹5L — ₹5–25 — Instant 24x7' },
          { key: 'NEFT', value: 'No limit — ₹2–25 — 30 min batches' },
          { key: 'RTGS', value: 'Min ₹2L — ₹25–50 — bank hours' },
          { key: 'UPI', value: 'Up to ₹1L — Free — Instant 24x7' },
        ],
      },
      {
        blockTitle: 'Common Charges',
        rows: [
          { key: 'Cheque book (25/yr)', value: 'Free' },
          { key: 'Extra cheque leaves', value: '₹3–5 per leaf' },
          { key: 'Duplicate passbook', value: '₹100' },
          { key: 'Account statement (email)', value: 'Free' },
          { key: 'Account statement (print)', value: '₹100 per quarter' },
          { key: 'NEFT via net banking', value: 'Free' },
        ],
      },
      {
        blockTitle: 'Grievance Escalation Path',
        rows: [
          { key: 'Step 1', value: 'Branch Manager — written complaint' },
          { key: 'Step 2', value: 'Toll-free: 1800 22 2244' },
          { key: 'Step 3', value: 'Online grievance portal' },
          { key: 'Step 4 (>30 days)', value: 'RBI Ombudsman: cms.rbi.org.in' },
        ],
      },
    ],
    numbers: [
      { icon: '📞', label: 'Customer care (24x7)', value: '1800 22 2244' },
      { icon: '💬', label: 'Balance SMS to', value: '09223008486' },
      { icon: '📞', label: 'Balance missed call', value: '09223766666' },
      { icon: '🌐', label: 'Grievance portal', value: 'unionbankofindia.co.in/grievance' },
      { icon: '🛡️', label: 'RBI Ombudsman', value: 'cms.rbi.org.in' },
    ],
  },
};

/** Get data for a specific intent (falls back to general) */
export function getIntentData(intentType) {
  return BANKING_KNOWLEDGE[intentType] || BANKING_KNOWLEDGE['general'];
}
