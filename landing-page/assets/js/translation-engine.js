(function () {
  'use strict';

  const TRANSLATIONS = {
    en: {
      '#nav-landing': 'Home',
      '#nav-voice': 'Voice AI',
      '#nav-features': 'Features',
      '#nav-demo': 'Demo',
      '#nav-contact': 'Message Us',
      '#nav-auth': 'Get Started <span>→</span>',
      '.hero-eyebrow-text': "India's #1 Voice Banking AI",
      '.hero-desc': 'VaaniBank AI serves frontline desk support with real-time voice translation across 10 Indian languages — so every customer is heard, in their own tongue.',
      '#cta-get-started': 'Get Started <span class="btn-icon">→</span>',
      '#cta-learn': 'See How It Works',
      '#scene-voice .section-label': 'Voice Intelligence',
      '#scene-voice .section-desc': 'From the mountains of Himachal to the shores of Kerala — our AI recognises every dialect, every accent, instantly.',
      '#scene-features .section-label': 'Enterprise Capabilities',
      '#scene-features .section-desc': 'Explore the robust suite of real-time voice, security, and banking intelligence features driving our next-gen platform.',
      '#scene-demo .demo-title': 'Experience <span class="accent-red">VaaniBank</span> AI',
      '#scene-demo .demo-subtitle': 'Select language · pick a scenario · watch the AI pipeline fire in real-time',
      '#scene-contact .contact-left .section-heading': 'Share Your Feedback<br><span style="color:var(--red)">&amp; Complaints</span>',
      '#scene-contact .contact-left .section-desc': 'Your voices shape VaaniBank AI. Tell us about your experiences, challenges, or suggestions regarding regional language banking support in branches across India.',
      '#scene-contact .contact-form-title': 'Message Us',
      'label[for="f-name"]': 'Your Name',
      'label[for="f-email"]': 'Email Address',
      'label[for="f-role"]': 'I am a…',
      'label[for="f-org"]': 'Occupation <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(Optional)</span>',
      'label[for="f-msg"]': 'Your Message',
      '.star-rating-group .form-label': 'Rate Your Experience',
      '#form-submit-btn': 'Send Message →',
      '#f-name': 'placeholder:Rahul Sharma',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:e.g. Student, Farmer, Banker',
      '#f-msg': 'placeholder:Tell us about your experience, review, or complaint…'
    },
    hi: {
      '#nav-landing': 'होम',
      '#nav-voice': 'वॉइस एआई',
      '#nav-features': 'विशेषताएं',
      '#nav-demo': 'डेमो',
      '#nav-contact': 'संपर्क करें',
      '#nav-auth': 'शुरू करें <span>→</span>',
      '.hero-eyebrow-text': 'भारत का नंबर 1 वॉइस बैंकिंग एआई',
      '.hero-desc': 'वाणीबैंक एआई 10 भारतीय भाषाओं में वास्तविक समय के वॉइस अनुवाद के साथ फ्रंटलाइन डेस्क सहायता प्रदान करता है — ताकि हर ग्राहक की बात उनकी अपनी भाषा में सुनी जा सके।',
      '#cta-get-started': 'शुरू करें <span class="btn-icon">→</span>',
      '#cta-learn': 'यह कैसे काम करता है',
      '#scene-voice .section-label': 'वॉइस इंटेलिजेंस',
      '#scene-voice .section-desc': 'हिमाचल के पहाड़ों से लेकर केरल के तटों तक — हमारा एआई हर बोली, हर लहजे को तुरंत पहचानता है।',
      '#scene-features .section-label': 'उद्यम क्षमताएं',
      '#scene-features .section-desc': 'हमारे नेक्स्ट-जेन प्लेटफॉर्म को चलाने वाली वास्तविक समय की आवाज, सुरक्षा और बैंकिंग खुफिया सुविधाओं के मजबूत सूट का अन्वेषण करें।',
      '#scene-demo .demo-title': 'अनुभव करें <span class="accent-red">वाणीबैंक</span> एआई',
      '#scene-demo .demo-subtitle': 'भाषा चुनें · परिदृश्य चुनें · वास्तविक समय में एआई पाइपलाइन को सक्रिय होते देखें',
      '#scene-contact .contact-left .section-heading': 'अपनी प्रतिक्रिया<br><span style="color:var(--red)">&amp; शिकायतें साझा करें</span>',
      '#scene-contact .contact-left .section-desc': 'आपकी आवाजें वाणीबैंक एआई को आकार देती हैं। पूरे भारत में शाखाओं में क्षेत्रीय भाषा बैंकिंग सहायता के संबंध में अपने अनुभवों, चुनौतियों या सुझावों के बारे में हमें बताएं।',
      '#scene-contact .contact-form-title': 'हमें संदेश भेजें',
      'label[for="f-name"]': 'आपका नाम',
      'label[for="f-email"]': 'ईमेल पता',
      'label[for="f-role"]': 'मैं एक हूँ...',
      'label[for="f-org"]': 'व्यवसाय <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(वैकल्पिक)</span>',
      'label[for="f-msg"]': 'आपका संदेश',
      '.star-rating-group .form-label': 'अपने अनुभव को रेट करें',
      '#form-submit-btn': 'संदेश भेजें →',
      '#f-name': 'placeholder:राहुल शर्मा',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:जैसे छात्र, किसान, बैंकर',
      '#f-msg': 'placeholder:हमें अपने अनुभव, समीक्षा या शिकायत के बारे में बताएं…'
    },
    mr: {
      '#nav-landing': 'मुख्यपृष्ठ',
      '#nav-voice': 'व्हॉइस एआय',
      '#nav-features': 'वैशिष्ट्ये',
      '#nav-demo': 'डेमो',
      '#nav-contact': 'संपर्क करा',
      '#nav-auth': 'सुरू करा <span>→</span>',
      '.hero-eyebrow-text': 'भारतातील नंबर १ व्हॉइस बँकिंग एआय',
      '.hero-desc': 'वाणीबँक एआय १० भारतीय भाषांमध्ये रिअल-टाइम व्हॉइस भाषांतरासह फ्रंटलाइन डेस्क सहाय्य प्रदान करते — जेणेकरून प्रत्येक ग्राहकाची बाजू त्यांच्या स्वतःच्या भाषेत ऐकली जाईल।',
      '#cta-get-started': 'सुरू करा <span class="btn-icon">→</span>',
      '#cta-learn': 'हे कसे कार्य करते',
      '#scene-voice .section-label': 'व्हॉइस इंटेलिजन्स',
      '#scene-voice .section-desc': 'हिमाचलच्या डोंगरांपासून ते केरळच्या किनाऱ्यापर्यंत — आमचे एआय प्रत्येक बोलीभाषा, प्रत्येक लहेजा त्वरित ओळखते।',
      '#scene-features .section-label': 'उद्यम क्षमता',
      '#scene-features .section-desc': 'आमच्या नेक्स्ट-जेन प्लॅटफॉर्मला चालवणाऱ्या रिअल-टाइम व्हॉइस, सुरक्षा आणि बँकिंग इंटेलिजन्स वैशिष्ट्यांचा शोध घ्या।',
      '#scene-demo .demo-title': 'अनुभव घ्या <span class="accent-red">वाणीबँक</span> एआयचा',
      '#scene-demo .demo-subtitle': 'भाषा निवडा · परिस्थिती निवडा · रिअल-टाइममध्ये एआय पाइपलाइन सुरू होताना पहा',
      '#scene-contact .contact-left .section-heading': 'तुमचा अभिप्राय<br><span style="color:var(--red)">&amp; तक्रारी शेअर करा</span>',
      '#scene-contact .contact-left .section-desc': 'तुमचे विचार वाणीबँक एआयला आकार देतात। संपूर्ण भारतातील शाखांमध्ये प्रादेशिक भाषा बँकिंग सहाय्याबाबतचे तुमचे अनुभव, आव्हाने किंवा सूचना आम्हाला सांगा।',
      '#scene-contact .contact-form-title': 'आम्हाला संदेश पाठवा',
      'label[for="f-name"]': 'तुमचे नाव',
      'label[for="f-email"]': 'ईमेल पत्ता',
      'label[for="f-role"]': 'मी एक आहे...',
      'label[for="f-org"]': 'व्यवसाय <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(पर्यायी)</span>',
      'label[for="f-msg"]': 'तुमचा संदेश',
      '.star-rating-group .form-label': 'तुमचा अनुभव रेट करा',
      '#form-submit-btn': 'संदेश पाठवा →',
      '#f-name': 'placeholder:राहुल शर्मा',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:उदा. विद्यार्थी, शेतकरी, बँकर',
      '#f-msg': 'placeholder:आम्हाला तुमच्या अनुभवाबद्दल, पुनरावलोकनाबद्दल किंवा तक्रारीबद्दल सांगा…'
    },
    ta: {
      '#nav-landing': 'முகப்பு',
      '#nav-voice': 'வாய்ஸ் ஏஐ',
      '#nav-features': 'அம்சங்கள்',
      '#nav-demo': 'டெமோ',
      '#nav-contact': 'தொடர்பு கொள்ள',
      '#nav-auth': 'தொடங்குங்கள் <span>→</span>',
      '.hero-eyebrow-text': 'இந்தியாவின் நம்பர் 1 வாய்ஸ் பேங்கிங் ஏஐ',
      '.hero-desc': 'வாணிபேங்க் ஏஐ 10 இந்திய மொழிகளில் நிகழ்நேர குரல் மொழிபெயர்ப்புடன் முன்னணி ஆதரவை வழங்குகிறது — இதனால் ஒவ்வொரு வாடிக்கையாளரின் குரலும் அவர்களின் சொந்த மொழியில் கேட்கப்படுகிறது।',
      '#cta-get-started': 'தொடங்குங்கள் <span class="btn-icon">→</span>',
      '#cta-learn': 'இது எப்படி வேலை செய்கிறது',
      '#scene-voice .section-label': 'குரல் நுண்ணறிவு',
      '#scene-voice .section-desc': 'இமாச்சல மலைகள் முதல் கேரள கடற்கரைகள் வரை — எங்கள் ஏஐ ஒவ்வொரு வட்டார வழக்கையும், ஒவ்வொரு உச்சரிப்பையும் உடனடியாக அங்கீகரிக்கிறது।',
      '#scene-features .section-label': 'நிறுவன திறன்கள்',
      '#scene-features .section-desc': 'எங்கள் அடுத்த தலைமுறை தளத்தை இயக்கும் நிகழ்நேர குரல், பாதுகாப்பு மற்றும் வங்கி நுண்ணறிவு அம்சங்களை ஆராயுங்கள்।',
      '#scene-demo .demo-title': '<span class="accent-red">வாணிபேங்க்</span> ஏஐ-ஐ அனுபவியுங்கள்',
      '#scene-demo .demo-subtitle': 'மொழியைத் தேர்ந்தெடுக்கவும் · சூழ்நிலையைத் தேர்ந்தெடுக்கவும் · ஏஐ குழாய் நிகழ்நேரத்தில் இயங்குவதைப் பார்க்கவும்',
      '#scene-contact .contact-left .section-heading': 'உங்கள் கருத்துக்கள்<br><span style="color:var(--red)">&amp; புகார்களைப் பகிர்ந்து கொள்ளுங்கள்</span>',
      '#scene-contact .contact-left .section-desc': 'உங்கள் குரல்கள் வாணிபேங்க் ஏஐ-ஐ வடிவமைக்கின்றன। இந்தியா முழுவதும் உள்ள கிளைகளில் பிராந்திய மொழி வங்கி ஆதரவு தொடர்பான உங்கள் அனுபவங்கள், சவால்கள் அல்லது பரிந்துரைகளை எங்களுக்குத் தெரிவிக்கவும்।',
      '#scene-contact .contact-form-title': 'செய்தி அனுப்பவும்',
      'label[for="f-name"]': 'உங்கள் பெயர்',
      'label[for="f-email"]': 'மின்னஞ்சல் முகவரி',
      'label[for="f-role"]': 'நான் ஒரு...',
      'label[for="f-org"]': 'தொழில் <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(விருப்பத்திற்குரியது)</span>',
      'label[for="f-msg"]': 'உங்கள் செய்தி',
      '.star-rating-group .form-label': 'உங்கள் அனுபவத்தை மதிப்பிடவும்',
      '#form-submit-btn': 'செய்தி அனுப்பவும் →',
      '#f-name': 'placeholder:ராகுல் சர்மா',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:எ.கா. மாணவர், விவசாயி, வங்கியாளர்',
      '#f-msg': 'placeholder:உங்கள் அனுபவம், மதிப்பாய்வு அல்லது புகாரைப் பற்றி எங்களிடம் கூறுங்கள்…'
    },
    te: {
      '#nav-landing': 'హోమ్',
      '#nav-voice': 'వాయిస్ ఏఐ',
      '#nav-features': 'ఫీచర్లు',
      '#nav-demo': 'డెమో',
      '#nav-contact': 'మెసేజ్ చేయండి',
      '#nav-auth': 'ప్రారంభించండి <span>→</span>',
      '.hero-eyebrow-text': 'భారతదేశపు నంబర్ 1 వాయిస్ బ్యాంకింగ్ ఏఐ',
      '.hero-desc': 'వాణీబ్యాంక్ ఏఐ 10 భారతీయ భాషలలో నిజ-సమయ వాయిస్ అనువాదంతో ఫ్రంట్‌లైన్ డెస్క్ సపోర్ట్ అందిస్తుంది — తద్వారా ప్రతి కస్టమర్ వారి స్వంత భాషలో వినబడతారు।',
      '#cta-get-started': 'ప్రారంభించండి <span class="btn-icon">→</span>',
      '#cta-learn': 'ఇది ఎలా పనిచేస్తుంది',
      '#scene-voice .section-label': 'వాయిస్ ఇంటెలిజెన్స్',
      '#scene-voice .section-desc': 'హిమాచల్ కొండల నుండి కేరళ తీరాల వరకు — మా ఏఐ ప్రతి యాసను, ప్రతి ఉచ్చారణను తక్షణమే గుర్తిస్తుంది।',
      '#scene-features .section-label': 'ఎంటర్‌ప్రైజ్ సామర్థ్యాలు',
      '#scene-features .section-desc': 'మా నెక్స్ట్-జెన్ ప్లాట్‌ఫారమ్‌ను నడిపించే నిజ-సమయ వాయిస్, సెక్యూరిటీ మరియు బ్యాంకింగ్ ఇంటెలిజెన్స్ ఫీచర్‌లను అన్వేషించండి।',
      '#scene-demo .demo-title': '<span class="accent-red">వాణీబ్యాంక్</span> ఏఐని అనుభవించండి',
      '#scene-demo .demo-subtitle': 'భాషను ఎంచుకోండి · ఒక దృశ్యాన్ని ఎంచుకోండి · నిజ సమయంలో ఏఐ పైప్‌లైన్ ఫైరింగ్‌ను చూడండి',
      '#scene-contact .contact-left .section-heading': 'మీ అభిప్రాయాన్ని<br><span style="color:var(--red)">&amp; ఫిర్యాదులను పంచుకోండి</span>',
      '#scene-contact .contact-left .section-desc': 'మీ వాయిస్ వాణీబ్యాంక్ ఏఐను తీర్చిదిద్దుతుంది। భారతదేశవ్యాప్తంగా ఉన్న బ్రాంచ్‌లలో ప్రాంతీయ భాషా బ్యాంకింగ్ మద్దతుకు సంబంధించిన మీ అనుభవాలు, సవాళ్లు లేదా సూచనల గురించి మాకు తెలియజేయండి।',
      '#scene-contact .contact-form-title': 'మాకు సందేశం పంపండి',
      'label[for="f-name"]': 'మీ పేరు',
      'label[for="f-email"]': 'ఈమెయిల్ చిరునామా',
      'label[for="f-role"]': 'నేను ఒక...',
      'label[for="f-org"]': 'ఉద్యోగం <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(ఐచ్ఛికం)</span>',
      'label[for="f-msg"]': 'మీ సందేశం',
      '.star-rating-group .form-label': 'మీ అనుభవాన్ని రేట్ చేయండి',
      '#form-submit-btn': 'సందేశం పంపు →',
      '#f-name': 'placeholder:రాహుల్ శర్మ',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:ఉదా. విద్యార్థి, రైతు, బ్యాంకర్',
      '#f-msg': 'placeholder:మీ అనుభవం, సమీక్ష లేదా ఫిర్యాదు గురించి మాకు చెప్పండి…'
    },
    bn: {
      '#nav-landing': 'হোম',
      '#nav-voice': 'ভয়েস এআই',
      '#nav-features': 'বৈশিষ্ট্য',
      '#nav-demo': 'ডেমো',
      '#nav-contact': 'বার্তা পাঠান',
      '#nav-auth': 'শুরু করুন <span>→</span>',
      '.hero-eyebrow-text': 'ভারতের ১ নম্বর ভয়েস ব্যাংকিং এআই',
      '.hero-desc': 'বাণীব্যাংক এআই ১০টি ভারতীয় ভাষায় রিয়েল-টাইম ভয়েস অনুবাদের সাথে ফ্রন্টলাইন সহায়তা প্রদান করে — যাতে প্রতিটি গ্রাহক তাদের নিজস্ব ভাষায় কথা বলতে পারেন।',
      '#cta-get-started': 'শুরু করুন <span class="btn-icon">→</span>',
      '#cta-learn': 'এটি কীভাবে কাজ করে',
      '#scene-voice .section-label': 'ভয়েস ইন্টেলিজেন্স',
      '#scene-voice .section-desc': 'হিমাচলের পাহাড় থেকে কেরালার উপকূল পর্যন্ত — আমাদের এআই প্রতিটি উপভাষা এবং উচ্চারণকে তাত্ক্ষণিকভাবে সনাক্ত করে।',
      '#scene-features .section-label': 'এন্টারপ্রাইজ ক্ষমতা',
      '#scene-features .section-desc': 'আমাদের পরবর্তী প্রজন্মের প্ল্যাটফর্ম পরিচালনাকারী রিয়েল-টাইম ভয়েস, সুরক্ষা এবং ব্যাংকিং বুদ্ধিমত্তার বৈশিষ্ট্যগুলি অন্বেষণ করুন।',
      '#scene-demo .demo-title': '<span class="accent-red">বাণীব্যাংক</span> এআই-এর অভিজ্ঞতা নিন',
      '#scene-demo .demo-subtitle': 'ভাষা নির্বাচন করুন · দৃশ্যপট নির্বাচন করুন · রিয়েল-টাইমে এআই পাইপলাইন সক্রিয় হতে দেখুন',
      '#scene-contact .contact-left .section-heading': 'আপনার মতামত<br><span style="color:var(--red)">&amp; অভিযোগ ভাগ করুন</span>',
      '#scene-contact .contact-left .section-desc': 'আপনার মতামত বাণীব্যাংক এআই-কে উন্নত করতে সাহায্য করে। ভারতের শাখাগুলিতে আঞ্চলিক ভাষায় ব্যাংকিং পরিষেবা সংক্রান্ত আপনার অভিজ্ঞতা বা পরামর্শ আমাদের জানান।',
      '#scene-contact .contact-form-title': 'আমাদের বার্তা পাঠান',
      'label[for="f-name"]': 'আপনার নাম',
      'label[for="f-email"]': 'ইমেল ঠিকানা',
      'label[for="f-role"]': 'আমি একজন...',
      'label[for="f-org"]': 'পেশা <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(ঐচ্ছিক)</span>',
      'label[for="f-msg"]': 'আপনার বার্তা',
      '.star-rating-group .form-label': 'আপনার অভিজ্ঞতা মূল্যায়ন করুন',
      '#form-submit-btn': 'বার্তা পাঠান →',
      '#f-name': 'placeholder:রাহুল শর্মা',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:যেমন ছাত্র, কৃষক, ব্যাংকার',
      '#f-msg': 'placeholder:আমাদের আপনার অভিজ্ঞতা বা অভিযোগের কথা বলুন…'
    },
    kn: {
      '#nav-landing': 'ಮುಖಪುಟ',
      '#nav-voice': 'ವಾಯ್ಸ್ ಎಐ',
      '#nav-features': 'ವೈಶಿಷ್ಟ್ಯಗಳು',
      '#nav-demo': 'ಡೆಮೊ',
      '#nav-contact': 'ಸಂಪರ್ಕಿಸಿ',
      '#nav-auth': 'ಪ್ರಾರಂಭಿಸಿ <span>→</span>',
      '.hero-eyebrow-text': 'ಭಾರತದ ನಂಬರ್ 1 ವಾಯ್ಸ್ ಬ್ಯಾಂಕಿಂಗ್ ಎಐ',
      '.hero-desc': 'ವಾಣಿಬ್ಯಾಂಕ್ ಎಐ 10 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ನೈಜ-ಸಮಯದ ಧ್ವನಿ ಅನುವಾದದೊಂದಿಗೆ ಮುಂಚೂಣಿ ಬೆಂಬಲವನ್ನು ಒದಗಿಸುತ್ತದೆ — ಇದರಿಂದ ಪ್ರತಿಯೊಬ್ಬ ಗ್ರಾಹಕನೂ ತನ್ನದೇ ಭಾಷೆಯಲ್ಲಿ ಕೇಳಲ್ಪಡುತ್ತಾನೆ.',
      '#cta-get-started': 'ಪ್ರಾರಂಭಿಸಿ <span class="btn-icon">→</span>',
      '#cta-learn': 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
      '#scene-voice .section-label': 'ವಾಯ್ಸ್ ಇಂಟೆಲಿಜೆನ್ಸ್',
      '#scene-voice .section-desc': 'ಹಿಮಾಚಲದ ಪರ್ವತಗಳಿಂದ ಹಿಡಿದು ಕೇರಳದ ತೀರದವರೆಗೆ — ನಮ್ಮ ಎಐ ಪ್ರತಿಯೊಂದು ಉಪಭಾಷೆಯನ್ನು, ಪ್ರತಿಯೊಂದು ಉಚ್ಚಾರಣೆಯನ್ನು ತಕ್ಷಣವೇ ಗುರುತಿಸುತ್ತದೆ.',
      '#scene-features .section-label': 'ಎಂಟರ್‌ಪ್ರೈಸ್ ಸಾಮರ್ಥ್ಯಗಳು',
      '#scene-features .section-desc': 'ನಮ್ಮ ಮುಂದಿನ ಪೀಳಿಗೆಯ ವೇದಿಕೆಯನ್ನು ಚಾಲನೆ ಮಾಡುವ ನೈಜ-ಸಮಯದ ಧ್ವನಿ, ಸುರಕ್ಷತೆ ಮತ್ತು ಬ್ಯಾಂಕಿಂಗ್ ಬುದ್ಧಿವಂತಿಕೆಯ ವೈಶಿಷ್ಟ್ಯಗಳ ಗಟ್ಟಿಮುಟ್ಟಾದ ಸೂಟ್ ಅನ್ನು ಅನ್ವೇಷಿಸಿ.',
      '#scene-demo .demo-title': '<span class="accent-red">ವಾಣಿಬ್ಯಾಂಕ್</span> ಎಐ ಅನ್ನು ಅನುಭವಿಸಿ',
      '#scene-demo .demo-subtitle': 'ಭಾಷೆಯನ್ನು ಆರಿಸಿ · ಸನ್ನಿವೇಶವನ್ನು ಆರಿಸಿ · ನೈಜ ಸಮಯದಲ್ಲಿ ಎಐ ಪೈಪ್‌ಲೈನ್ ಕಾರ್ಯನಿರ್ವಹಿಸುವುದನ್ನು ವೀಕ್ಷಿಸಿ',
      '#scene-contact .contact-left .section-heading': 'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ<br><span style="color:var(--red)">&amp; ದೂರುಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ</span>',
      '#scene-contact .contact-left .section-desc': 'ನಿಮ್ಮ ಧ್ವನಿಗಳು ವಾಣಿಬ್ಯಾಂಕ್ ಎಐ ಅನ್ನು ರೂಪಿಸುತ್ತವೆ. ಭಾರತದಾದ್ಯಂತದ ಶಾಖೆಗಳಲ್ಲಿ ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯ ಬ್ಯಾಂಕಿಂಗ್ ಬೆಂಬಲದ ಬಗ್ಗೆ ನಿಮ್ಮ ಅನುಭವಗಳು ಅಥವಾ ಸಲಹೆಗಳನ್ನು ತಿಳಿಸಿ.',
      '#scene-contact .contact-form-title': 'ನಮಗೆ ಸಂದೇಶ ಕಳುಹಿಸಿ',
      'label[for="f-name"]': 'ನಿಮ್ಮ ಹೆಸರು',
      'label[for="f-email"]': 'ಇಮೇಲ್ ವಿಳಾಸ',
      'label[for="f-role"]': 'ನಾನು ಒಬ್ಬ...',
      'label[for="f-org"]': 'ಉದ್ಯೋಗ <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(ಐಚ್ಛಿಕ)</span>',
      'label[for="f-msg"]': 'ನಿಮ್ಮ ಸಂದೇಶ',
      '.star-rating-group .form-label': 'ನಿಮ್ಮ ಅನುಭವವನ್ನು ರೇಟ್ ಮಾಡಿ',
      '#form-submit-btn': 'ಸಂದೇಶ ಕಳುಹಿಸಿ →',
      '#f-name': 'placeholder:ರಾಹುಲ್ ಶರ್ಮ',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:ಉದಾ: ವಿದ್ಯಾರ್ಥಿ, ರೈತ, ಬ್ಯಾಂಕರ್',
      '#f-msg': 'placeholder:ನಿಮ್ಮ ಅನುಭವ, ವಿಮರ್ಶೆ ಅಥವಾ ದೂರಿನ ಬಗ್ಗೆ ನಮಗೆ ತಿಳಿಸಿ…'
    },
    or: {
      '#nav-landing': 'ମୁଖ୍ୟପୃଷ୍ଠ',
      '#nav-voice': 'ଭଏସ ଏଆଇ',
      '#nav-features': 'ବୈଶିଷ୍ଟ୍ୟ',
      '#nav-demo': 'ଡେମୋ',
      '#nav-contact': 'ସନ୍ଦେଶ ଦିଅନ୍ତୁ',
      '#nav-auth': 'ଆରମ୍ଭ କରନ୍ତୁ <span>→</span>',
      '.hero-eyebrow-text': 'ଭାରତର ନମ୍ବର ୧ ଭଏସ ବ୍ୟାଙ୍କିଙ୍ଗ ଏଆଇ',
      '.hero-desc': 'ବାଣୀବ୍ୟାଙ୍କ ଏଆଇ ୧୦ଟି ଭାରତୀୟ ଭାଷାରେ ରିଅଲ-ଟାଇମ ଭଏସ ଅନୁବାଦ ସହିତ ଫ୍ରଣ୍ଟଲାଇନ ଡେସ୍କ ସହାୟତା ପ୍ରଦାନ କରେ — ଯାହା ଦ୍ୱାରା ପ୍ରତ୍ୟେକ ଗ୍ରାହକ ନିଜ ଭାଷାରେ ଶୁଣିପାରିବେ।',
      '#cta-get-started': 'ଆରମ୍ଭ କରନ୍ତୁ <span class="btn-icon">→</span>',
      '#cta-learn': 'ଏହା କିପରି କାମ କରେ',
      '#scene-voice .section-label': 'ଭଏସ ଇଣ୍ଟେଲିଜେନ୍ସ',
      '#scene-voice .section-desc': 'ହିମାଚଳର ପର୍ବତମାଳା ଠାରୁ କେରଳର ସମୁଦ୍ର କୂଳ ପର୍ଯ୍ୟନ୍ତ — ଆମର ଏଆଇ ପ୍ରତ୍ୟେକ ଉପଭାଷା ଏବଂ ଉଚ୍ଚାରଣକୁ ତୁରନ୍ତ ଚିହ୍ନଟ କରିପାରେ।',
      '#scene-features .section-label': 'ଉଦ୍ୟୋଗ କ୍ଷମତା',
      '#scene-features .section-desc': 'ଆମର ପରବର୍ତ୍ତୀ ପିଢିର ପ୍ଲାଟଫର୍ମକୁ ପରିଚାଳିତ କରୁଥିବା ରିଅଲ-ଟାଇମ ଭଏସ, ସୁରକ୍ଷା ଏବଂ ବ୍ୟାଙ୍କିଙ୍ଗ ବୈଶିଷ୍ଟ୍ୟଗୁଡିକର ଅନୁସନ୍ଧାନ କରନ୍ତୁ।',
      '#scene-demo .demo-title': '<span class="accent-red">ବାଣୀବ୍ୟାଙ୍କ</span> ଏଆଇର ଅନୁଭବ କରନ୍ତୁ',
      '#scene-demo .demo-subtitle': 'ଭାଷା ଚୟନ କରନ୍ତು · ପରିସ୍ଥିତି ଚୟନ କରନ୍ତು · ରିଅଲ-ଟାଇମରେ ଏଆଇ ପାଇପଲାଇନ ସକ୍ରିୟ ହେବା ଦେଖନ୍ତୁ',
      '#scene-contact .contact-left .section-heading': 'ଆପଣଙ୍କ ମତାମତ<br><span style="color:var(--red)">&amp; ଅଭିଯୋଗ ଜଣାନ୍ତୁ</span>',
      '#scene-contact .contact-left .section-desc': 'ଆପଣଙ୍କ ମତାମତ ବାଣୀବ୍ୟାଙ୍କ ଏଆଇକୁ ସମୃଦ୍ଧ କରେ। ଭାରତର ଶାଖାଗୁଡ଼ିକରେ ଆଞ୍ଚଳିକ ଭାଷାରେ ବ୍ୟାଙ୍କିଙ୍ଗ ସେବା ସମ୍ବନ୍ଧୀୟ ଆପଣଙ୍କ ଅନୁଭୂତି କିମ୍ବା ପରାମର୍ଶ ଆମକୁ ଜଣାନ୍ତୁ।',
      '#scene-contact .contact-form-title': 'ଆମକୁ ସନ୍ଦେଶ ପଠାନ୍ତୁ',
      'label[for="f-name"]': 'ଆପଣଙ୍କ ନାମ',
      'label[for="f-email"]': 'ଇମେଲ ଠିକଣା',
      'label[for="f-role"]': 'ମୁଁ ଜଣେ...',
      'label[for="f-org"]': 'ପେଶା <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(ବୈକଳ୍ପିକ)</span>',
      'label[for="f-msg"]': 'ଆପଣଙ୍କ ସନ୍ଦେଶ',
      '.star-rating-group .form-label': 'ଆପଣଙ୍କ ଅନୁଭୂତିର ମୂଲ୍ୟାଙ୍କନ କରନ୍ତୁ',
      '#form-submit-btn': 'ସନ୍ଦେଶ ପଠାନ୍ତୁ →',
      '#f-name': 'placeholder:ରାହୁଲ ଶର୍ମା',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:ଯେପରି ଛାତ୍ର, ଚାଷୀ, ବ୍ୟାଙ୍କର',
      '#f-msg': 'placeholder:ଆମକୁ ଆପଣଙ୍କ ଅନୁଭୂତି କିମ୍ବା ଅଭିଯୋଗ ବିଷୟରେ କୁହନ୍ତୁ…'
    },
    pa: {
      '#nav-landing': 'ਹੋਮ',
      '#nav-voice': 'ਵੌਇਸ ਏਆਈ',
      '#nav-features': 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ',
      '#nav-demo': 'ਡੇਮੋ',
      '#nav-contact': 'ਸੰਪਰਕ ਕਰੋ',
      '#nav-auth': 'ਸ਼ੁਰੂ ਕਰੋ <span>→</span>',
      '.hero-eyebrow-text': 'ਭਾਰਤ ਦਾ ਨੰਬਰ 1 ਵੌਇਸ ਬੈਂਕਿੰਗ ਏਆਈ',
      '.hero-desc': 'ਵਾਣੀਬੈਂਕ ਏਆਈ 10 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਰੀਅਲ-ਟਾਈਮ ਵੌਇਸ ਅਨੁਵਾਦ ਦੇ ਨਾਲ ਫਰੰਟਲਾਈਨ ਡੈਸਕ ਸਹਾਇਤਾ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ — ਤਾਂ ਜੋ ਹਰ ਗਾਹਕ ਦੀ ਗੱਲ ਉਨ੍ਹਾਂ ਦੀ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸੁਣੀ ਜਾ ਸਕੇ।',
      '#cta-get-started': 'ਸ਼ੁਰੂ ਕਰੋ <span class="btn-icon">→</span>',
      '#cta-learn': 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
      '#scene-voice .section-label': 'ਵੌਇਸ ਇੰਟੈਲੀਜੈਂਸ',
      '#scene-voice .section-desc': 'ਹਿਮਾਚਲ ਦੇ ਪਹਾੜਾਂ ਤੋਂ ਲੈ ਕੇ ਕੇਰਲ ਦੇ ਤੱਟਾਂ ਤੱਕ — ਸਾਡਾ ਏਆਈ ਹਰ ਉਪਭਾਸ਼ਾ ਅਤੇ ਉਚਾਰਨ ਨੂੰ ਤੁਰੰਤ ਪਛਾਣਦਾ ਹੈ।',
      '#scene-features .section-label': 'ਇੰਟਰਪ੍ਰਾਈਜ਼ ਸਮਰੱਥਾ',
      '#scene-features .section-desc': 'ਸਾਡੇ ਅਗਲੀ ਪੀੜ੍ਹੀ ਦੇ ਪਲੇਟਫਾਰਮ ਨੂੰ ਚਲਾਉਣ ਵਾਲੀਆਂ ਰੀਅਲ-ਟਾਈਮ ਵੌਇਸ, ਸੁਰੱਖਿਆ ਅਤੇ ਬੈਂਕਿੰਗ ਖੁਫੀਆ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਦੇ ਮਜ਼ਬੂਤ ਸੂਟ ਦੀ ਪੜਚੋਲ ਕਰੋ।',
      '#scene-demo .demo-title': '<span class="accent-red">ਵਾਣੀਬੈਂਕ</span> ਏਆਈ ਦਾ ਅਨੁਭਵ ਕਰੋ',
      '#scene-demo .demo-subtitle': 'ਭਾਸ਼ਾ ਚੁਣੋ · ਦ੍ਰਿਸ਼ ਚੁਣੋ · ਰੀਅਲ-ਟਾਈਮ ਵਿੱਚ ਏਆਈ ਪਾਈਪਲਾਈਨ ਨੂੰ ਚੱਲਦਾ ਦੇਖੋ',
      '#scene-contact .contact-left .section-heading': 'ਆਪਣੀ ਫੀਡਬੈਕ<br><span style="color:var(--red)">&amp; ਸ਼ਿਕਾਇਤਾਂ ਸਾਂਝੀਆਂ ਕਰੋ</span>',
      '#scene-contact .contact-left .section-desc': 'ਤੁਹਾਡੀਆਂ ਫੀਡਬੈਕ ਵਾਣੀਬੈਂਕ ਏਆਈ ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਦੀ ਹੈ। ਭਾਰਤ ਭਰ ਦੀਆਂ ਬ੍ਰਾਂਚਾਂ ਵਿੱਚ ਖੇਤਰੀ ਭਾਸ਼ਾ ਬੈਂਕਿੰਗ ਸਹਾਇਤਾ ਬਾਰੇ ਆਪਣੇ ਅਨੁਭਵ ਜਾਂ ਸੁਝਾਅ ਸਾਂਝੇ ਕਰੋ।',
      '#scene-contact .contact-form-title': 'ਸਾਨੂੰ ਸੁਨੇਹਾ ਭੇਜੋ',
      'label[for="f-name"]': 'ਤੁਹਾਡਾ ਨਾਮ',
      'label[for="f-email"]': 'ਈਮੇਲ ਪਤਾ',
      'label[for="f-role"]': 'ਮੈਂ ਇੱਕ ਹਾਂ...',
      'label[for="f-org"]': 'ਕਿੱਤਾ <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(ਵਿਕਲਪਿਕ)</span>',
      'label[for="f-msg"]': 'ਤੁਹਾਡਾ ਸੁਨੇਹਾ',
      '.star-rating-group .form-label': 'ਆਪਣੇ ਅਨੁਭਵ ਨੂੰ ਰੇਟ ਕਰੋ',
      '#form-submit-btn': 'ਸੁਨੇਹਾ ਭੇਜੋ →',
      '#f-name': 'placeholder:ਰਾਹੁਲ ਸ਼ਰਮਾ',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:ਜਿਵੇਂ ਕਿ ਵਿਦਿਆਰਥੀ, ਕਿਸਾਨ, ਬੈਂਕਰ',
      '#f-msg': 'placeholder:ਸਾਨੂੰ ਆਪਣੇ ਅਨੁਭਵ ਜਾਂ ਸ਼ਿਕਾਇਤ ਬਾਰੇ ਦੱਸੋ…'
    },
    gu: {
      '#nav-landing': 'મુખ્યપૃષ્ઠ',
      '#nav-voice': 'વોઇસ એઆઇ',
      '#nav-features': 'સુવિધાઓ',
      '#nav-demo': 'ડેમો',
      '#nav-contact': 'સંદેશ મોકલો',
      '#nav-auth': 'શરૂ કરો <span>→</span>',
      '.hero-eyebrow-text': 'ભારતનું નંબર 1 વોઇસ બેન્કિંગ એઆઇ',
      '.hero-desc': 'વાણીબેંક એઆઇ 10 ભારતીય ભાષાઓમાં રીઅલ-ટાઇમ વોઇસ અનુવાદ સાથે ફ્રન્ટલાઇન ડેસ્ક સપોર્ટ પ્રદાન કરે છે — જેથી દરેક ગ્રાહકની વાત તેમની પોતાની ભાષામાં સાંભળી શકાય।',
      '#cta-get-started': 'શરૂ કરો <span class="btn-icon">→</span>',
      '#cta-learn': 'તે કેવી રીતે કામ કરે છે',
      '#scene-voice .section-label': 'વોઇસ ઇન્ટેલિજન્સ',
      '#scene-voice .section-desc': 'હિમાચલના પર્વતોથી લઈને કેરળના કિનારા સુધી — અમારું એઆઇ દરેક બોલી, દરેક લહેકાને તરત જ ઓળખે છે।',
      '#scene-features .section-label': 'એન્ટરપ્રાઇઝ ક્ષમતાઓ',
      '#scene-features .section-desc': 'અમારા નેક્સ્ટ-જેન પ્લેટફોર્મને ચલાવતી રીઅલ-ટાઇમ વોઇસ, સુરક્ષા અને બેન્કિંગ ઇન્ટેલિજન્સ સુવિધાઓનું અન્વેષણ કરો।',
      '#scene-demo .demo-title': 'અનુભવ કરો <span class="accent-red">વાણીબેંક</span> એઆઇનો',
      '#scene-demo .demo-subtitle': 'ભાષા પસંદ કરો · દૃશ્ય પસંદ કરો · રીઅલ-ટાઇમમાં એઆઇ પાઇપલાઇન સક્રિય થતી જુઓ',
      '#scene-contact .contact-left .section-heading': 'તમારો પ્રતિભાવ<br><span style="color:var(--red)">&amp; ફરિયાદો શેર કરો</span>',
      '#scene-contact .contact-left .section-desc': 'તમારા વિચારો વાણીબેંક એઆઇને આકાર આપે છે। સમગ્ર ભારતમાં શાખાઓમાં પ્રાદેશિક ભાષા બેન્કિંગ સહાય અંગેના તમારા અનુભવો અથવા સૂચનો અમને જણાવો।',
      '#scene-contact .contact-form-title': 'અમને સંદેશ મોકલો',
      'label[for="f-name"]': 'તમારું નામ',
      'label[for="f-email"]': 'ઇમેઇલ સરનામું',
      'label[for="f-role"]': 'હું એક છું...',
      'label[for="f-org"]': 'વ્યવસાય <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(વૈકલ્પિક)</span>',
      'label[for="f-msg"]': 'તમારો સંદેશ',
      '.star-rating-group .form-label': 'તમારા અનુભવને રેટ કરો',
      '#form-submit-btn': 'સંદેશ મોકલો →',
      '#f-name': 'placeholder:રાહુલ શર્મા',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:જેમ કે વિદ્યાર્થી, ખેડૂત, બેન્કર',
      '#f-msg': 'placeholder:અમને તમારા અનુભવ અથવા ફરિયાદ વિશે જણાવો…'
    },
    ml: {
      '#nav-landing': 'ഹോം',
      '#nav-voice': 'വോയ്സ് എഐ',
      '#nav-features': 'ഫീച്ചറുകൾ',
      '#nav-demo': 'ഡെമോ',
      '#nav-contact': 'സന്ദേശം അയക്കൂ',
      '#nav-auth': 'തുടങ്ങുക <span>→</span>',
      '.hero-eyebrow-text': 'ഇന്ത്യയിലെ നമ്പർ 1 വോയ്സ് ബാങ്കിംഗ് എഐ',
      '.hero-desc': 'വാണിബാങ്ക് എഐ 10 ഇന്ത്യൻ ഭാഷകളിൽ തത്സമയ വോയ്‌സ് പരിഭാഷയോടെ ഫ്രണ്ട്‌ലൈൻ ഡെസ്‌ക് പിന്തുണ നൽകുന്നു — അതിലൂടെ ഓരോ ഉപഭോക്താവിനും അവരുടെ സ്വന്തം ഭാഷയിൽ സംസാരിക്കാനാകും.',
      '#cta-get-started': 'തുടങ്ങുക <span class="btn-icon">→</span>',
      '#cta-learn': 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു',
      '#scene-voice .section-label': 'വോയ്സ് ഇന്റലിജൻസ്',
      '#scene-voice .section-desc': 'ഹിമാചൽ മലനിരകൾ മുതൽ കേരളത്തിന്റെ തീരങ്ങൾ വരെ — ഞങ്ങളുടെ എഐ എല്ലാ പ്രാദേശിക ഭാഷാഭേദങ്ങളും ഉച്ചാരണങ്ങളും തൽക്ഷണം തിരിച്ചറിയുന്നു.',
      '#scene-features .section-label': 'എന്റർപ്രൈസ് ശേഷികൾ',
      '#scene-features .section-desc': 'ഞങ്ങളുടെ അടുത്ത തലമുറ പ്ലാറ്റ്‌ഫോമിനെ നയിക്കുന്ന തത്സമയ വോയ്‌സ്, സുരക്ഷ, ബാങ്കിംഗ് ഇന്റലിജൻസ് ഫീച്ചറുകൾ എന്നിവ പരിശോധിക്കുക.',
      '#scene-demo .demo-title': '<span class="accent-red">വാണിബാങ്ക്</span> എഐ അനുഭവിച്ചറിയൂ',
      '#scene-demo .demo-subtitle': 'ഭാഷ തിരഞ്ഞെടുക്കൂ · സാഹചര്യം തിരഞ്ഞെടുക്കൂ · എഐ പൈപ്‌ലൈൻ തത്സമയം പ്രവർത്തിക്കുന്നത് കാണൂ',
      '#scene-contact .contact-left .section-heading': 'നിങ്ങളുടെ അഭിപ്രായങ്ങളും<br><span style="color:var(--red)">&amp; പരാതികളും പങ്കുവെക്കൂ</span>',
      '#scene-contact .contact-left .section-desc': 'നിങ്ങളുടെ പ്രതികരണങ്ങളാണ് വാണിബാങ്ക് എഐയെ രൂപപ്പെടുത്തുന്നത്. ഇന്ത്യയിലുടനീളമുള്ള ശാഖകളിലെ പ്രാദേശിക ഭാഷാ ബാങ്കിംഗ് സേവനങ്ങളെക്കുറിച്ചുള്ള നിങ്ങളുടെ അനുഭവങ്ങളോ നിർദ്ദേശങ്ങളോ പങ്കുവെക്കുക.',
      '#scene-contact .contact-form-title': 'ഞങ്ങൾക്ക് സന്ദേശം അയക്കൂ',
      'label[for="f-name"]': 'നിങ്ങളുടെ പേര്',
      'label[for="f-email"]': 'ഇമെയിൽ വിലാസം',
      'label[for="f-role"]': 'ഞാൻ ഒരു...',
      'label[for="f-org"]': 'തൊഴിൽ <span class="optional-label" style="opacity: 0.6; font-size: 0.6rem; text-transform: none;">(ഓപ്ഷണൽ)</span>',
      'label[for="f-msg"]': 'നിങ്ങളുടെ സന്ദേശം',
      '.star-rating-group .form-label': 'നിങ്ങളുടെ അനുഭവം വിലയിരുത്തൂ',
      '#form-submit-btn': 'സന്ദേശം അയക്കൂ →',
      '#f-name': 'placeholder:രാഹുൽ ശർമ്മ',
      '#f-email': 'placeholder:rahul.sharma@gmail.com',
      '#f-org': 'placeholder:ഉദാഹരണത്തിന്: വിദ്യാർത്ഥി, കർഷകൻ, ബാങ്കർ',
      '#f-msg': 'placeholder:നിങ്ങളുടെ അനുഭവത്തെയോ പരാതിയെയോ കുറിച്ച് ഞങ്ങളോട് പറയൂ…'
    }
  };

  const currentLanguageKey = 'vaanibank_selected_lang';

  function applyLanguage(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    
    // Iterate over selectors
    for (const [selector, text] of Object.entries(dict)) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (text.startsWith('placeholder:')) {
          el.placeholder = text.replace('placeholder:', '');
        } else {
          el.innerHTML = text;
        }
      });
    }

    // Update active button state in the translation selector menu
    document.querySelectorAll('.translator-option-btn').forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    localStorage.setItem(currentLanguageKey, lang);
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    const fabBtn = document.getElementById('translator-fab-btn');
    const menu = document.getElementById('translator-menu');

    // Toggle menu
    fabBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      menu?.classList.toggle('open');
      const isOpen = menu?.classList.contains('open');
      fabBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      menu?.classList.remove('open');
      fabBtn?.setAttribute('aria-expanded', 'false');
    });

    // Option buttons
    document.querySelectorAll('.translator-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.dataset.lang;
        applyLanguage(lang);
        menu?.classList.remove('open');
        fabBtn?.setAttribute('aria-expanded', 'false');
      });
    });

    // Load saved lang
    const saved = localStorage.getItem(currentLanguageKey) || 'en';
    applyLanguage(saved);
  });
})();