/*
   VaaniBank AI — Demo Script Data
   Union Bank of India | Team Vectora
   Pre-scripted conversation for account_opening demo
   */

// Demo Customer Utterances
export const DEMO_SCRIPT = [
  {
    id: 1,
    customerText: 'मुझे नया बैंक अकाउंट खोलना है',
    language: 'Hindi',
    languageCode: 'hi',
    translatedText: 'मुझे नया बैंक अकाउंट खोलना है',
    sentiment: 'calm',
    intent: 'account_opening',
  },
  {
    id: 2,
    customerText: 'मेरे पास Aadhaar card और PAN card है',
    language: 'Hindi',
    languageCode: 'hi',
    translatedText: 'मेरे पास Aadhaar card और PAN card है',
    sentiment: 'calm',
    intent: 'account_opening',
  },
  {
    id: 3,
    customerText: 'Savings account chahiye, salary account nahi',
    language: 'Hindi',
    languageCode: 'hi',
    translatedText: 'Savings account chahiye, salary account nahi',
    sentiment: 'calm',
    intent: 'account_opening',
  },
  {
    id: 4,
    customerText: 'Form kaise bharna hai? Koi madad kar sakta hai?',
    language: 'Hindi',
    languageCode: 'hi',
    translatedText: 'Form kaise bharna hai? Koi madad kar sakta hai?',
    sentiment: 'confused',
    intent: 'account_opening',
  },
  {
    id: 5,
    customerText: 'Shukriya! Account kab tak active ho jayega?',
    language: 'Hindi',
    languageCode: 'hi',
    translatedText: 'Shukriya! Account kab tak active ho jayega?',
    sentiment: 'calm',
    intent: 'account_opening',
  },
];

// Demo AI Suggested Responses
export const DEMO_AI_RESPONSES = [
  {
    id: 1,
    suggestedHindi: 'बिल्कुल! मैं आपको नया खाता खोलने में मदद करूंगा। कृपया अपने दस्तावेज़ तैयार रखें।',
    suggestedCustomerLang: 'बिल्कुल! मैं आपको नया खाता खोलने में मदद करूंगा।',
    processStep: 1,
  },
  {
    id: 2,
    suggestedHindi: 'बहुत अच्छा! Aadhaar और PAN दोनों documents यहाँ जमा करें। मैं verify करता हूं।',
    suggestedCustomerLang: 'बहुत अच्छा! Documents यहाँ जमा करें।',
    processStep: 2,
  },
  {
    id: 3,
    suggestedHindi: 'ठीक है, Savings Account के लिए minimum balance ₹500 है। क्या आप agree करते हैं?',
    suggestedCustomerLang: 'Savings Account minimum balance ₹500 है।',
    processStep: 2,
  },
  {
    id: 4,
    suggestedHindi: 'चिंता न करें! मैं form भरने में आपकी पूरी सहायता करूंगा। पहले नाम और पता लिखें।',
    suggestedCustomerLang: 'मैं form भरने में मदद करूंगा।',
    processStep: 3,
  },
  {
    id: 5,
    suggestedHindi: 'आपका खाता 24 घंटे में active हो जाएगा। Passbook और Debit card 7 दिनों में मिलेगा।',
    suggestedCustomerLang: 'खाता 24 घंटे में active होगा। Passbook 7 दिनों में मिलेगी।',
    processStep: 4,
  },
];
