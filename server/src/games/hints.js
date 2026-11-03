/** Multilingual hints when score < 50% */
const HINTS = {
  en: {
    quiz: ['Read each option carefully before choosing.', 'Eliminate obviously wrong answers first.', 'Review the lesson topic before retrying.'],
    true_false: ['Think about what you learned in class.', 'If unsure, recall textbook definitions.', 'False statements often contain extreme words like "always" or "never".'],
    memory: ['Start by flipping two cards at a time.', 'Remember positions of cards you have seen.', 'Match easier pairs first to reduce the board.'],
    scramble: ['Look for common letter pairs like TH, CH, SH.', 'Use the hint word meaning.', 'Write consonants first, then fill vowels.'],
    fill_blank: ['Read the full sentence aloud.', 'Think what word fits grammatically.', 'Check spelling before submitting.'],
    math_speed: ['Practice mental math daily.', 'Break problems: 12+8 = 10+2+8.', 'Stay calm — accuracy beats speed initially.'],
    typing: ['Place fingers on home row keys.', 'Type slowly at first for accuracy.', 'Say the word aloud while typing.'],
    sequence: ['Look for increasing or alphabetical patterns.', 'Compare adjacent items.', 'Start with the smallest or first event.'],
    flashcard: ['Review cards you missed twice.', 'Connect facts to real-life examples.', 'Study in short 10-minute sessions.'],
    match_pairs: ['Read all items on both sides first.', 'Match the easiest pair first.', 'Eliminate matched pairs mentally.'],
    rural_mission: ['Read the full scenario before choosing.', 'Consider safety, fairness, and long-term impact.', 'Use the feedback to guide your next decision.'],
    general: ['Take a short break and try again.', 'Ask the AI Tutor for help in your language.', 'Scores below 50% — study the manual below.'],
  },
  hi: {
    quiz: ['हर विकल्प ध्यान से पढ़ें।', 'गलत उत्तर पहले हटाएं।', 'पुनः प्रयास से पहले पाठ दोहराएं।'],
    true_false: ['कक्षा में सीखी बात याद करें।', 'पुस्तक की परिभाषा याद करें।', '"हमेशा" जैसे शब्द अक्सर गलत होते हैं।'],
    memory: ['एक समय में दो कार्ड पलटें।', 'कार्ड की जगह याद रखें।', 'आसान जोड़े पहले मिलाएं।'],
    scramble: ['TH, CH जैसे अक्षर खोजें।', 'संकेत शब्द का अर्थ उपयोग करें।', 'पहले व्यंजन, फिर स्वर लिखें।'],
    fill_blank: ['पूरा वाक्य जोर से पढ़ें।', 'व्याकरण के अनुसार शब्द सोचें।', 'स्पेलिंग जांचें।'],
    math_speed: ['रोज मानसिक गणित अभ्यास करें।', 'सवाल को छोटे हिस्सों में तोड़ें।', 'शांत रहें — सटीकता जरूरी है।'],
    typing: ['उंगलियां होम रो पर रखें।', 'पहले धीरे टाइप करें।', 'टाइप करते समय शब्द बोलें।'],
    sequence: ['बढ़ते或 क्रम के पैटर्न देखें।', 'पड़ोसी items तुलना करें।', 'सबसे छोटे से शुरू करें।'],
    flashcard: ['चूकी कार्ड दोबारा पढ़ें।', 'वास्तविक उदाहरण से जोड़ें।', '10 मिनट के सत्र में पढ़ें।'],
    match_pairs: ['दोनों तरफ सभी items पढ़ें।', 'आसान जोड़ी पहले मिलाएं।', 'मिले हुए हटाते जाएं।'],
    rural_mission: ['चुनने से पहले पूरा परिदृश्य पढ़ें।', 'सुरक्षा, निष्पक्षता और लंबे समय के प्रभाव पर विचार करें।', 'अगले निर्णय के लिए प्रतिक्रिया से सीखें।'],
    general: ['थोड़ा ब्रेक लें और फिर कोशिश करें।', 'AI शिक्षक से अपनी भाषा में पूछें।', '50% से कम — नीचे मैनुअल पढ़ें।'],
  },
  te: {
    quiz: ['ప్రతి ఎంపికను జాగ్రత్తగా చదవండి.', 'తప్పు సమాధానాలను ముందుగా తొలగించండి.', 'మళ్లీ ప్రయత్నించే ముందు పాఠం చదవండి.'],
    memory: ['ఒక సమయంలో రెండు కార్డులు తిప్పండి.', 'స్థానాలు గుర్తుంచుకోండి.', 'సులభ జతలతో ప్రారంభించండి.'],
    general: ['బ్రేక్ తీసుకుని మళ్లీ ప్రయత్నించండి.', 'AI ట్యూటర్‌ను మీ భాషలో అడగండి.', '50% కంటే తక్కువ — మాన్యువల్ చదవండి.'],
  },
  bn: {
    quiz: ['প্রতিটি বিকল্প মনোযোগ দিয়ে পড়ুন.', 'ভুল উত্তর আগে বাদ দিন.', 'আবার চেষ্টার আগে পাঠ পড়ুন।'],
    general: ['বিরতি নিয়ে আবার চেষ্টা করুন.', 'AI শিক্ষককে আপনার ভাষায় জিজ্ঞাসা করুন.', '৫০%-এর নিচে — নিচের ম্যানুয়াল পড়ুন।'],
  },
};

const SUGGESTIONS = {
  en: {
    low: 'Your score is below 50%. Study these hints and the game manual, then retry.',
    medium: 'You are close! One more focused attempt should help you pass.',
    pass: 'Great work! You passed this level. The next level is now unlocked.',
    maxLevel: 'You mastered all levels of this game!',
  },
  hi: {
    low: 'आपका स्कोर 50% से कम है। संकेत और मैनुअल पढ़ें, फिर पुनः प्रयास करें।',
    medium: 'आप करीब हैं! एक और प्रयास से पास हो सकते हैं।',
    pass: 'बहुत बढ़िया! आप इस स्तर में सफल हुए। अगला स्तर खुल गया।',
    maxLevel: 'आपने इस खेल के सभी स्तर पूरे कर लिए!',
  },
  te: {
    low: 'మీ స్కోర్ 50% కంటే తక్కువ. సూచనలు మరియు మాన్యువల్ చదవండి.',
    pass: 'బాగా చేసారు! తదుపరి స్థాయి తెరవబడింది.',
    maxLevel: 'అన్ని స్థాయిలు పూర్తి!',
  },
  bn: {
    low: 'আপনার স্কোর ৫০%-এর নিচে। ইঙ্গিত এবং ম্যানুয়াল পড়ুন।',
    pass: 'দারুণ! পরবর্তী স্তর unlocked।',
    maxLevel: 'সব স্তর সম্পন্ন!',
  },
};

export function getHints(engine, lang, accuracy) {
  const L = HINTS[lang] || HINTS.en;
  const engineHints = L[engine] || L.quiz || HINTS.en.quiz;
  const general = L.general || HINTS.en.general;
  const hints = [...engineHints.slice(0, 3), general[0]];
  const suggestionKey = accuracy >= 40 ? 'medium' : 'low';
  const S = SUGGESTIONS[lang] || SUGGESTIONS.en;
  return { hints, suggestion: S[suggestionKey] || S.low };
}

export function getPassMessage(lang, levelUnlocked, atMax) {
  const S = SUGGESTIONS[lang] || SUGGESTIONS.en;
  if (atMax) return S.maxLevel;
  if (levelUnlocked) return S.pass;
  return S.pass;
}
