/** Game manuals in user's language — shown on repeat failure */
const MANUALS = {
  farm_sim: {
    en: {
      title: 'Village Farm Manager Guide',
      steps: [
        'Read each seasonal challenge and choose one farm action.',
        'Watch how your decision changes water, soil, and crop-health meters.',
        'Use evidence-based choices such as checking soil moisture, protecting soil, and monitoring pests.',
        'Finish the season with healthy resources and learn from the feedback.',
      ],
      tip: 'A resilient farm balances crop needs with healthy soil and careful water use.',
    },
  },
  rural_mission: {
    en: {
      title: 'Rural Mission Guide',
      steps: [
        'Read the field situation before choosing an action.',
        'Consider how each choice affects people and shared resources.',
        'Review the feedback to understand the real-world lesson.',
        'Use what you learned to make a better choice in the next scenario.',
      ],
      tip: 'Thoughtful, sustainable decisions help the whole community.',
    },
  },
  quiz: {
    en: {
      title: 'How to Pass: Quiz Game',
      steps: ['Read the question twice before looking at options.', 'Eliminate 1–2 wrong answers first.', 'Choose the most logical remaining answer.', 'Review wrong answers in the AI Tutor.'],
      tip: 'Score at least 50% (e.g. 3 of 5 correct) to unlock the next level.',
    },
    hi: {
      title: 'क्विज़ कैसे पास करें',
      steps: ['प्रश्न दो बार पढ़ें, फिर विकल्प देखें.', '1–2 गलत उत्तर पहले हटाएं.', 'सबसे सही उत्तर चुनें.', 'AI शिक्षक से गलत उत्तर समझाएं.'],
      tip: 'अगले स्तर के लिए कम से कम 50% (5 में 3 सही) अंक लाएं.',
    },
    te: {
      title: 'క్విజ్‌ను ఎలా పాస్ చేయాలి',
      steps: ['ప్రశ్న రెండుసార్లు చదవండి.', 'తప్పు సమాధానాలు తొలగించండి.', 'సరైన సమాధానం ఎంచుకోండి.', 'AI ట్యూటర్‌ను అడగండి.'],
      tip: '50% (5లో 3) సాధించండి.',
    },
    bn: {
      title: 'কুইজ পাস করার উপায়',
      steps: ['প্রশ্ন দুবার পড়ুন.', 'ভুল উত্তর বাদ দিন.', 'সঠিক উত্তর বেছে নিন.', 'AI শিক্ষককে জিজ্ঞাসা করুন.'],
      tip: 'পরবর্তী স্তরের জন্য ৫০% প্রয়োজন.',
    },
    ta: { title: 'வினாடி வினா — pass எப்படி', steps: ['கேள்வியை இருமுறை படியுங்கள்.', 'தவறுகளை நீக்குங்கள்.', 'சரியான பதில் தேர்ந்தெடுங்கள்.', 'AI ஆசிரியரிடம் கேளுங்கள்.'], tip: '50% பெறுங்கள்.' },
    mr: { title: 'क्विझ कसा पास करावा', steps: ['प्रश्न दोनदा वाचा.', 'चुकीचे पर्याय काढा.', 'योग्य उत्तर निवडा.', 'AI शिक्षकांना विचारा.'], tip: '50% गुण मिळवा.' },
    kn: { title: 'ಕ್ವಿಜ್ ಹೇಗೆ ಪಾಸ್', steps: ['ಪ್ರಶ್ನೆ ಎರಡು ಬಾರಿ ಓದಿ.', 'ತಪ್ಪು ಆಯ್ಕೆ ತೆಗೆದುಹಾಕಿ.', 'ಸರಿಯಾದ ಉತ್ತರ ಆರಿಸಿ.', 'AI ಶಿಕ್ಷಕರನ್ನು ಕೇಳಿ.'], tip: '50% ಸಾಧಿಸಿ.' },
    ml: { title: 'ക്വിസ് pass എങ്ങനെ', steps: ['ചോദ്യം രണ്ടുതവണ വായിക്കുക.', 'തെറ്റുകൾ നീക്കം ചെയ്യുക.', 'ശരിയായ ഉത്തരം തിരഞ്ഞെടുക്കുക.', 'AI ട്യൂട്ടറിനോട് ചോദിക്കുക.'], tip: '50% നേടുക.' },
    gu: { title: 'ક્વિઝ pass કેવી રીતે', steps: ['પ્રશ્ન બે વાર વાંચો.', 'ખોટા વિકલ્પ દૂર કરો.', 'સાચો જવાબ પસંદ કરો.', 'AI શિક્ષકને પૂછો.'], tip: '50% મેળવો.' },
    or: { title: 'କୁଇଜ୍ pass', steps: ['ପ୍ରଶ୍ନ ଦୁଇଥର ପଢ଼ନ୍ତୁ.', 'ଭୁଲ ବିକଳ୍ପ ହଟାନ୍ତୁ.', 'ଠିକ ଉତ୍ତର ବାଛନ୍ତୁ.', 'AI ଶିକ୍ଷକଙ୍କୁ ପଚାରନ୍ତୁ.'], tip: '50% ଆବଶ୍ୟକ.' },
    pa: { title: 'ਕੁਇਜ਼ pass', steps: ['ਸਵਾਲ ਦੋ ਵਾਰ ਪੜ੍ਹੋ.', 'ਗਲਤ ਹਟਾਓ.', 'ਸਹੀ ਚੁਣੋ.', 'AI ਅਧਿਆਪਕ ਨੂੰ ਪੁੱਛੋ.'], tip: '50% ਲੋੜ.' },
    ur: { title: 'کوئز کیسے پاس کریں', steps: ['سوال دو بار پڑھیں.', 'غلط ہٹائیں.', 'صحیح منتخب کریں.', 'AI استاد سے پوچھیں.'], tip: '50% حاصل کریں.' },
    as: { title: 'কুইজ pass', steps: ['প্ৰশ্ন দুবাৰ পঢ়ক.', 'ভুল আঁতৰাওক.', 'শুদ্ধ উত্তৰ বাছক.', 'AI শিক্ষকক সুধিব.'], tip: '50% লাগিব.' },
    mai: { title: 'क्विज pass', steps: ['प्रश्न दू बेर पढ़ू.', 'गलत हटाउ.', 'सही चुनू.', 'AI शिक्षक स पूछू.'], tip: '50% chahi.' },
    bho: { title: 'Quiz pass kaise', steps: ['Sawal do bar padhi.', 'Galat hatai.', 'Sahi chuni.', 'AI guru se puchhi.'], tip: '50% chahi.' },
    ne: { title: 'क्विज pass', steps: ['प्रश्न दुई पटक पढ्नुहोस्.', 'गलत हटाउनुहोस्.', 'सही छान्नुहोस्.', 'AI शिक्षकलाई सोध्नुहोस्.'], tip: '50% chahincha.' },
    sa: { title: 'प्रश्नोत्तरी pass', steps: ['प्रश्नं द्विवारं पठतु.', 'अशुद्धं निराकुरुत.', 'युक्तं व्रणीत.', 'AI शिक्षकं पृच्छतु.'], tip: '50% आवश्यकम्.' },
    ks: { title: 'کوئز pass', steps: ['سوال دوءِ پَرِو.', 'غلط ہٹٲیِو.', 'صحیح چُنِو.', 'AI استاد سُٲلِو.'], tip: '50% ضرورت.' },
  },
  memory: {
    en: { title: 'Memory Match Manual', steps: ['Flip two cards at a time.', 'Remember card positions.', 'Match known pairs first.', 'Work left to right.'], tip: 'Match all pairs with 50%+ accuracy.' },
    hi: { title: 'मेमोरी मैच मैनुअल', steps: ['एक समय में दो कार्ड पलटें.', 'स्थान याद रखें.', 'ज्ञात जोड़े पहले मिलाएं.', 'बाएं से दाएं काम करें.'], tip: '50%+ सटीकता से अगला स्तर.' },
    te: { title: 'Memory Match', steps: ['రెండు కార్డులు తిప్పండి.', 'స్థానాలు గుర్తుంచుకోండి.', 'జతలు మatch చేయండి.', 'ఎడమ నుండి ప్రారంభించండి.'], tip: '50% అవసరం.' },
    bn: { title: 'মেমরি ম্যাচ', steps: ['দুটি কার্ড উল্টান.', 'অবস্থান মনে রাখুন.', 'জোড়া মিলান.', 'বাম থেকে শুরু করুন.'], tip: '৫০% প্রয়োজন.' },
  },
  math_speed: {
    en: { title: 'Math Speed Manual', steps: ['Focus on accuracy first.', 'Use finger counting if needed.', 'Practice tables 2–9 daily.', 'Breathe before each answer.'], tip: 'Solve at least half correctly.' },
    hi: { title: 'गणित गति मैनुअल', steps: ['पहले सटीकता.', 'उंगलियों से गिनती.', 'पहाड़ा अभ्यास.', 'शांत रहें.'], tip: 'आधे सही = pass.' },
    te: { title: 'Math Speed', steps: ['ఖచ్చితత్వం ముందు.', 'బోధన అవసరమైతే.', 'tables practice.', 'prashantanga.'], tip: '50% kavali.' },
  },
  true_false: {
    en: { title: 'True/False Manual', steps: ['Read the full statement.', 'Watch for: always, never, all.', 'Recall textbook facts.', 'Think of counter-examples.'], tip: '3 of 5 correct to pass.' },
    hi: { title: 'सही/गलत मैनुअल', steps: ['पूरा वाक्य पढ़ें.', '"हमेशा", "कभी नहीं" देखें.', 'पुस्तक तथ्य याद करें.', 'उदाहरण से जांचें.'], tip: '5 में 3 = pass.' },
  },
  scramble: {
    en: { title: 'Word Scramble Manual', steps: ['Use the hint.', 'Find prefixes UN, RE.', 'Place vowels between consonants.', 'Say the word aloud.'], tip: '3+ words correct to pass.' },
    hi: { title: 'शब्द scramble', steps: ['संकेत उपयोग करें.', 'UN, RE prefix.', 'स्वर-व्यंजन.', 'जोर से बोलें.'], tip: '3+ शब्द = pass.' },
  },
  fill_blank: {
    en: { title: 'Fill Blank Manual', steps: ['Read aloud.', 'Guess word type.', 'Check grammar.', 'Spelling matters.'], tip: '3 of 5 correct.' },
    hi: { title: 'रिक्त स्थान', steps: ['जोर से पढ़ें.', 'शब्द प्रकार.', 'व्याकरण.', 'स्पेलिंग.'], tip: '5 में 3.' },
  },
  typing: {
    en: { title: 'Typing Manual', steps: ['Home row ASDF JKL;', 'Look at screen.', 'Type slowly first.', 'Copy exactly.'], tip: '3 prompts correct.' },
    hi: { title: 'टाइपिंग', steps: ['होम रो.', 'स्क्रीन देखें.', 'धीरे टाइप.', 'exact कॉपी.'], tip: '3 सही.' },
  },
  sequence: {
    en: { title: 'Sequence Manual', steps: ['Find the pattern.', 'Use arrows to reorder.', 'Check first and last.', 'Planets: Mercury first.'], tip: 'Correct order = pass.' },
    hi: { title: 'क्रम', steps: ['पैटर्न खोजें.', 'तीर से बदलें.', 'पहला/अंत जांच.', 'ग्रह क्रम.'], tip: 'सही क्रम = pass.' },
  },
  flashcard: {
    en: { title: 'Flashcard Manual', steps: ['Tap to reveal.', 'Got it only if sure.', 'Review missed twice.', 'Link to daily life.'], tip: '3+ cards known.' },
    hi: { title: 'फ्लैशकार्ड', steps: ['टैप कर उत्तर देखें.', 'यकीन हो तो Got it.', 'चूकी दोबारा.', 'जीवन से जोड़ें.'], tip: '3+ याद.' },
  },
  match_pairs: {
    en: { title: 'Match Pairs Manual', steps: ['Read all left items.', 'Read all right items.', 'Easiest pair first.', 'Do not rush.'], tip: 'All pairs matched.' },
    hi: { title: 'जोड़ी मिलाएं', steps: ['बाएं पढ़ें.', 'दाएं पढ़ें.', 'आसान जोड़ी पहले.', 'जल्दबाजी न करें.'], tip: 'सभी जोड़ी.' },
  },
};

const GAME_MANUALS = {
  'village-panchayat-quiz': {
    en: {
      title: 'Gram Panchayat & Civics Guide',
      steps: [
        'Understand the 3 tiers of Panchayati Raj: Village (Gram Panchayat), Block (Panchayat Samiti), and District (Zilla Parishad).',
        'Remember: All registered voters (18+ years) residing in the village constitute the Gram Sabha.',
        'The Sarpanch/Pradhan is the elected head who presides over village development meetings.',
        'Panchayat responsibilities include village roads, clean drinking water, sanitation, street lighting, and school welfare.',
      ],
      tip: 'Score at least 50% to demonstrate civics mastery and earn governance badges!',
    },
    hi: {
      title: 'ग्राम पंचायत एवं नागरिक शास्त्र मार्गदर्शिका',
      steps: [
        'पंचायती राज के 3 स्तर समझें: ग्राम पंचायत (गाँव), पंचायत समिति (ब्लॉक), और जिला परिषद (ज़िला).',
        'गाँव के सभी 18+ वर्ष के पंजीकृत मतदाता ग्राम सभा के सदस्य होते हैं.',
        'सरपंच / प्रधान ग्राम पंचायत के निर्वाचित मुखिया होते हैं.',
        'सड़क, पेयजल, स्वच्छता, स्ट्रीट लाइट और प्राथमिक विद्यालय पंचायत की मुख्य जिम्मेदारियां हैं.',
      ],
      tip: 'नागरिक शास्त्र बैज प्राप्त करने के लिए कम से कम 50% अंक प्राप्त करें!',
    },
    te: {
      title: 'గ్రామ పంచాయతీ & పౌరశాస్త్ర మార్గదర్శి',
      steps: [
        'పంచాయతీరాజ్ 3 స్థాయిలు: గ్రామ పంచాయతీ, బ్లాక్ పంచాయతీ సమితి, జిల్లా పరిషత్.',
        'గ్రామంలోని 18+ ఏళ్ల ఓటర్లందరూ గ్రామసభ సభ్యులు.',
        'సర్పంచ్ గ్రామ పంచాయతీకి ఎన్నికైన అధిపతి.',
        'రహదారులు, తాగునీరు, పారిశుద్ధ్యం పంచాయతీ బాధ్యతలు.',
      ],
      tip: 'పాస్ కావడానికి కనీసం 50% స్కోర్ సాధించండి!',
    },
  },
  'digital-banking-safety': {
    en: {
      title: 'UPI & Digital Banking Safety Manual',
      steps: [
        'Golden Rule: You only enter your UPI PIN to SEND money, never to RECEIVE money.',
        'Never share your 6-digit OTP, ATM CVV, or bank password on phone calls or messages.',
        'Always double-check the recipient name and UPI ID on your screen before confirming payment.',
        'Never scan random QR codes sent by strangers claiming lottery, prize, or refund rewards.',
      ],
      tip: 'Remember: Real bank staff will NEVER call asking for your passwords or OTP.',
    },
    hi: {
      title: 'यूपीआई और डिजिटल बैंकिंग सुरक्षा मैनुअल',
      steps: [
        'स्वर्ण नियम: यूपीआई पिन केवल पैसे भेजने के लिए दर्ज किया जाता है, पैसे प्राप्त करने के लिए कभी नहीं.',
        'अपना 6-अंकों का ओटीपी, एटीएम सीवीवी या पासवर्ड फोन कॉल पर कभी किसी को न बताएं.',
        'भुगतान की पुष्टि करने से पहले स्क्रीन पर प्राप्तकर्ता का नाम अवश्य जांचें.',
        'पुरस्कार या लॉटरी का दावा करने वाले अनजान क्यूआर कोड कभी स्कैन न करें.',
      ],
      tip: 'याद रखें: बैंक कर्मचारी कभी भी आपका पासवर्ड या ओटीपी नहीं मांगते.',
    },
    te: {
      title: 'డిజిటల్ బ్యాంకింగ్ భద్రతా మార్గదర్శి',
      steps: [
        'ముఖ్య సూత్రం: డబ్బు పంపడానికి మాత్రమే UPI పిన్ అవసరం, పొందడానికి కాదు.',
        'OTP లేదా ATM పిన్ ఎవరితోనూ పంచుకోవద్దు.',
        'చెల్లింపుకు ముందు లబ్ధిదారుని పేరు సరిచూసుకోండి.',
        'తెలియని QR కోడ్‌లను స్కాన్ చేయవద్దు.',
      ],
      tip: 'బ్యాంకు అధికారులు ఎప్పుడూ OTP అడగరని గుర్తుంచుకోండి.',
    },
  },
  'organic-farming-guide': {
    en: {
      title: 'Organic Farming & Soil Health Manual',
      steps: [
        'Identify natural soil builders: Cow dung manure, vermicompost (earthworms), and green compost.',
        'Practice crop rotation: Alternating legumes (pulses) with cereals naturally fixes nitrogen in the soil.',
        'Natural pest control: Use neem oil and neem leaf sprays to deter insects without harmful chemicals.',
        'Moisture conservation: Mulch around crops using dry straw to retain water and prevent weed growth.',
      ],
      tip: 'Healthy soil rich in organic carbon produces resilient crops and higher long-term yields.',
    },
    hi: {
      title: 'जैविक खेती और मृदा स्वास्थ्य मैनुअल',
      steps: [
        'प्राकृतिक खाद पहचानें: गोबर की खाद, केंचुआ खाद (वर्मीकम्पोस्ट) और हरी खाद.',
        'फसल चक्र अपनाएं: दलहनी फसलों से मिट्टी में प्राकृतिक रूप से नाइट्रोजन बढ़ता है.',
        'प्राकृतिक कीट नियंत्रण: रसायनों के स्थान पर नीम के तेल और काढ़े का छिड़काव करें.',
        'नमी संरक्षण: पुआल या सूखे पत्तों से मल्चिंग करके मिट्टी की नमी बचाएं.',
      ],
      tip: 'जैविक कार्बन से भरपूर उपजाऊ मिट्टी बिना महंगे रसायनों के बेहतर पैदावार देती है.',
    },
  },
  'fraction-compare': {
    en: {
      title: 'Fractions & Proportions Guide',
      steps: [
        'Visualize parts of a whole: Denominator tells total equal parts; Numerator tells parts you have.',
        'Like denominators: When bottom numbers match (e.g. 3/8 vs 5/8), simply compare top numbers (5/8 is larger).',
        'Cross-multiplication shortcut: To compare a/b and c/d, compare (a × d) with (b × c).',
        'Simplifying fractions: Divide both top and bottom by their greatest common factor (e.g. 4/8 = 1/2).',
      ],
      tip: 'Picture slices of a roti or cake whenever you need to compare fraction sizes!',
    },
    hi: {
      title: 'भिन्न और अनुपात मार्गदर्शिका',
      steps: [
        'पूरे का हिस्सा समझें: हर (नीचे की संख्या) कुल हिस्से बताता है, अंश (ऊपर) आपके हिस्से बताता है.',
        'समान हर: जब नीचे की संख्या समान हो (जैसे 3/8 और 5/8), तो बड़ा अंश बड़ा होता है.',
        'तुलना करने की आसान विधि: a/b और c/d में, (a × d) और (b × c) की तुलना करें.',
        'सरल रूप: अंश और हर दोनों को समान संख्या से भाग दें (जैसे 4/8 = 1/2).',
      ],
      tip: 'भिन्नों की तुलना करते समय रोटी के बराबर टुकड़ों की कल्पना करें!',
    },
  },
  'quick-quiz-blitz': {
    en: {
      title: 'Quick Quiz Blitz Speed Guide',
      steps: [
        'Read the entire question carefully before glancing at the 4 options.',
        'Eliminate the 2 clearly wrong answers immediately to boost your odds to 50%.',
        'Use mental arithmetic tricks: Break large numbers into tens and units.',
        'Maintain a steady pace: Aim for at least 3 correct out of 5 to pass.',
      ],
      tip: 'Take a deep breath and trust your preparation — avoid hasty last-second clicks!',
    },
    hi: {
      title: 'क्विक क्विज़ ब्लिट्ज़ स्पीड गाइड',
      steps: [
        'चारों विकल्प देखने से पहले प्रश्न को ध्यानपूर्वक पूरा पढ़ें.',
        'स्पष्ट रूप से गलत 2 विकल्पों को तुरंत हटा दें.',
        'मानसिक गणना का उपयोग करें: संख्याओं को दहाई और इकाई में बांटें.',
        'पास होने के लिए 5 में से कम से कम 3 सही उत्तर दें.',
      ],
      tip: 'शांत रहें और जल्दबाजी के बजाय समझदारी से सही विकल्प चुनें!',
    },
  },
};

export function getGameManual(engine, lang, gameName, level, slug) {
  const specific = slug && GAME_MANUALS[slug];
  const source = specific || MANUALS[engine] || MANUALS.quiz;
  const manual = source[lang] || source.hi || source.en;
  return { ...manual, gameName: gameName || manual.title, level, lang, fallback: !source[lang] };
}

export { GAME_MANUALS };
