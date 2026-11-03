/** Multilingual rule-based tutor knowledge — 18 Indian languages */
const LANGS = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'ur', 'as', 'mai', 'bho', 'sa', 'ne', 'ks'];

const TOPICS = {
  fractions: {
    en: 'Fractions show parts of a whole. When denominators match, compare numerators. Practice with half (1/2), quarter (1/4), and three-quarters (3/4) using real objects like roti or fruit.',
    hi: 'भिन्न पूरे का हिस्सा दिखाते हैं। हर समान हो तो अंश की तुलना करें। रोटी या फल से 1/2, 1/4 अभ्यास करें।',
    bn: 'ভগ্নাংশ পুরো অংশ দেখায়। একই হর হলে লব দেখুন। রুটি বা ফল দিয়ে 1/2, 1/4 অনুশীলন করুন।',
    te: 'భిన్నాలు whole part చూపిస్తాయి. denominator same అయితే numerator compare చేయండి. 1/2, 1/4 practice.',
    mr: 'अपूर्णांक संपूर्णाचा भाग दाखवतात. समान हर असल्यास अंश तुलना करा.',
    ta: 'பின்னங்கள் முழு பகுதியைக் காட்டும்.分母 ஒன்றானால் numerator ஒப்பிடுங்கள்.',
    gu: 'અંશ સંપૂર્ણનો ભાગ બતાવે છે. સમાન હર હોય તો અંશની તુલના કરો.',
    kn: 'ಭಿನ್ನಗಳು whole part ತೋರಿಸುತ್ತವೆ. denominator same ಆದರೆ numerator compare ಮಾಡಿ.',
    ml: 'ഭിന്നങ്ങൾ whole part കാണിക്കുന്നു. denominator same ആണെങ്കിൽ numerator compare ചെയ്യുക.',
    or: 'ଭଗ୍ନାଂଶ whole part ଦେଖାଏ। same denominator ହେଲେ numerator compare କରନ୍ତୁ।',
    pa: 'ਭੱਜ ਪੂਰੇ ਦਾ ਹਿੱਸਾ ਦਿਖਾਉਂਦੇ ਹਨ। same denominator ਤੇ numerator compare ਕਰੋ।',
    ur: 'کسریں پورے کا حصہ دکھاتی ہیں۔ یکساں مخرج پر اعداد کا موازنہ کریں۔',
    as: 'ভগ্নাংশ whole part দেখায়। same denominator ত লব compare কৰক।',
    mai: 'भिन्न whole ke hissa dekhae. same denominator pe numerator compare karo.',
    bho: 'Fraction whole ke hissa dikhawe. same denominator pe numerator compare karo.',
    sa: 'भिन्नः समग्रस्य भागं दर्शयति। समानहरः सति अंशान् तुलयत।',
    ne: 'भिन्न whole ko bhag dekhauncha. same denominator ma numerator compare garnuhos.',
    ks: 'Fractions whole part wuchawan. same denominator pe numerator compare karo.',
  },
  algebra: {
    en: 'To solve equations, do the same operation on both sides. Move numbers to one side and keep the variable alone. Example: x + 3 = 7 → x = 4.',
    hi: 'समीकरण हल करने के लिए दोनों तरफ एक जैसा काम करें। चर को अलग रखें। उदाहरण: x + 3 = 7 → x = 4.',
    bn: 'সমীকরণে দুই পাশে একই কাজ করুন। চলক আলাদা রাখুন।',
    te: 'equation solve: రెండు వైపులా same operation. variable alone.',
    mr: 'समीकरण सोडवण्यासाठी दोन्ही बाजूंना समान क्रिया करा.',
    ta: 'சமன்பாட்டில் இரு பக்கமும் ஒரே செயல் செய்யுங்கள்.',
    gu: 'સમીકરણ solve: બંને બાજુ same operation.',
    kn: 'equation solve: both sides same operation.',
    ml: 'equation solve: both sides same operation.',
    or: 'equation solve: both sides same operation.',
    pa: 'equation solve: dono taraf same operation.',
    ur: 'مساوات میں دونوں طرف یکساں عمل کریں۔',
    as: 'equation solve: both sides same operation.',
    mai: 'equation solve: dono side same operation.',
    bho: 'equation solve: dono side same kaam.',
    sa: 'समीकरणे द्वयोः पार्श्वयोः समानं कुरुत।',
    ne: 'equation solve: dui side same operation.',
    ks: 'equation solve: dono taraf same operation.',
  },
  science: {
    en: 'Science starts with observation. Watch plants grow, water boil, or shadows change — these connect to your textbook. Write what you see in a small notebook.',
    hi: 'विज्ञान अवलोकन से शुरू होता है। पौधे, उबलता पानी देखें। देखी बात नोटबुक में लिखें।',
    bn: 'বিজ্ঞান পর্যবেক্ষণ দিয়ে শুরু। গাছ, ফুটন্ত জল দেখুন।',
    te: 'science observation tho start. plants, boiling water chudandi.',
    mr: 'विज्ञान निरीक्षणापासून सुरू. वनस्पती, उकळते पाणी पहा.',
    ta: 'science observation-ல் தொடங்கும். plants, boiling water பாருங்கள்.',
    gu: 'science observation thi start. plants, boiling water jovo.',
    kn: 'science observation inda start. plants, boiling water nodi.',
    ml: 'science observation il start. plants, boiling water nokku.',
    or: 'science observation ru start. plants, boiling water dekhan.',
    pa: 'science observation ton start. plants, boiling water dekho.',
    ur: 'سائنس مشاہدے سے شروع ہوتی ہے۔ پودے، ابلتا پانی دیکھیں۔',
    as: 'science observation ৰ পৰা start. plants, boiling water চাওক।',
    mai: 'science observation se start. plants, boiling water dekho.',
    bho: 'science observation se start. plants, boiling water dekho.',
    sa: 'विज्ञानम् अवलोकनात् आरभते।',
    ne: 'science observation bata start. plants, boiling water hernuhos.',
    ks: 'science observation pe start. plants, boiling water wuchho.',
  },
  english: {
    en: 'Read aloud 10 minutes daily. Simple present: I/you/we/they + verb; he/she/it + verb+s. Example: She reads every day.',
    hi: 'रोज 10 मिनट जोर से पढ़ें। Simple present: he/she/it के साथ verb+s। उदाहरण: She reads every day.',
    bn: 'প্রতিদিন 10 মিনিট জোরে পড়ুন। he/she/it-এ verb+s।',
    te: 'daily 10 min read aloud. he/she/it ki verb+s.',
    mr: 'दररोज 10 मिनिट मोठ्याने वाचा. he/she/it साठी verb+s.',
    ta: 'daily 10 min read aloud. he/she/it ku verb+s.',
    gu: 'daily 10 min read aloud. he/she/it mate verb+s.',
    kn: 'daily 10 min read aloud. he/she/it ge verb+s.',
    ml: 'daily 10 min read aloud. he/she/it ku verb+s.',
    or: 'daily 10 min read aloud. he/she/it re verb+s.',
    pa: 'daily 10 min read aloud. he/she/it lai verb+s.',
    ur: 'روز 10 منٹ بلند آواز میں پڑھیں۔ he/she/it کے ساتھ verb+s۔',
    as: 'daily 10 min read aloud. he/she/it t verb+s.',
    mai: 'daily 10 min read aloud. he/she/it pe verb+s.',
    bho: 'daily 10 min read aloud. he/she/it pe verb+s.',
    sa: 'प्रतिदिनं 10 निमेषाणि उच्चैः पठत।',
    ne: 'daily 10 min read aloud. he/she/it ma verb+s.',
    ks: 'daily 10 min read aloud. he/she/it pe verb+s.',
  },
  digital: {
    en: 'Never share OTP, passwords, or Aadhaar online. Use strong passwords with letters and numbers. Log out on shared phones.',
    hi: 'OTP, पासवर्ड, आधार कभी साझा न करें। मजबूत पासवर्ड बनाएं। साझा फोन पर logout करें।',
    bn: 'OTP, পাসওয়ার্ড শেয়ার করবেন না। শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।',
    te: 'OTP, password share cheyakandi. strong password use cheyandi.',
    mr: 'OTP, password share करू नका. strong password वापरा.',
    ta: 'OTP, password share pannadhinga. strong password use pannunga.',
    gu: 'OTP, password share na karo. strong password use karo.',
    kn: 'OTP, password share maadi bedi. strong password use maadi.',
    ml: 'OTP, password share cheyyaruth. strong password use cheyyuka.',
    or: 'OTP, password share karibeni. strong password use karantu.',
    pa: 'OTP, password share na karo. strong password use karo.',
    ur: 'OTP یا پاس ورڈ کبھی شیئر نہ کریں۔ مضبوط پاس ورڈ استعمال کریں۔',
    as: 'OTP, password share nokaribo. strong password use karo.',
    mai: 'OTP, password share na karo. strong password use karo.',
    bho: 'OTP, password share na karo. strong password use karo.',
    sa: 'OTP, password न साझां कुर्वीत।',
    ne: 'OTP, password share nagarnuhos. strong password use garnuhos.',
    ks: 'OTP, password share na karo. strong password use karo.',
  },
  rural: {
    en: 'GyaanDhara works on low bandwidth. Download lessons when you have good connectivity. Games need 50% score to unlock the next level.',
    hi: 'GyaanDhara कम इंटरनेट पर काम करता है। अच्छे नेटवर्क पर पाठ डाउनलोड करें। खेल में 50% पर अगला स्तर खुलता है।',
    bn: 'GyaanDhara কম bandwidth-এ কাজ করে। 50% স্কোরে পরবর্তী স্তর unlock।',
    te: 'GyaanDhara low bandwidth lo work avutundi. 50% score tho next level unlock.',
    mr: 'GyaanDhara कमी bandwidth वर चालते. 50% गुणांवर पुढचा स्तर unlock.',
    ta: 'GyaanDhara low bandwidth la work aagum. 50% score la next level unlock.',
    gu: 'GyaanDhara low bandwidth par work kare. 50% score par next level unlock.',
    kn: 'GyaanDhara low bandwidth nalli work maadutte. 50% score inda next level unlock.',
    ml: 'GyaanDhara low bandwidth il work cheyyum. 50% score il next level unlock.',
    or: 'GyaanDhara low bandwidth re work kare. 50% score re next level unlock.',
    pa: 'GyaanDhara low bandwidth te work karda. 50% score te next level unlock.',
    ur: 'GyaanDhara کم بینڈوڈth پر کام کرتا ہے۔ 50% اسکور پر اگلا لیول کھلتا ہے۔',
    as: 'GyaanDhara low bandwidth t work kore. 50% score t next level unlock.',
    mai: 'GyaanDhara low bandwidth pe work kare. 50% score pe next level unlock.',
    bho: 'GyaanDhara low bandwidth pe work kare. 50% score pe next level unlock.',
    sa: 'GyaanDhara न्यून bandwidth इत्यत्र कार्यति। 50% score इत्यत्र next level unlock।',
    ne: 'GyaanDhara low bandwidth ma work garcha. 50% score ma next level unlock.',
    ks: 'GyaanDhara low bandwidth pe work karan. 50% score pe next level unlock.',
  },
  gamification: {
    en: 'Earn XP from quizzes and games. Score 50%+ in a game to unlock the next level. Maintain daily streaks for bonus badges!',
    hi: 'क्विज़ और खेल से XP कमाएं। खेल में 50%+ पर अगला स्तर खुलता है। दैनिक streak से bonus badges!',
    bn: 'quiz ও game থেকে XP। 50%+ score এ next level unlock। daily streak bonus!',
    te: 'quiz, games nundi XP. 50%+ score tho next level. daily streak bonus!',
    mr: 'quiz आणि games मधून XP. 50%+ वर next level. daily streak bonus!',
    ta: 'quiz, games la XP. 50%+ la next level. daily streak bonus!',
    gu: 'quiz, games thi XP. 50%+ par next level. daily streak bonus!',
    kn: 'quiz, games inda XP. 50%+ inda next level. daily streak bonus!',
    ml: 'quiz, games il XP. 50%+ il next level. daily streak bonus!',
    or: 'quiz, games ru XP. 50%+ re next level. daily streak bonus!',
    pa: 'quiz, games ton XP. 50%+ te next level. daily streak bonus!',
    ur: 'کوئز اور گیمز سے XP حاصل کریں۔ 50%+ پر اگلا لیvel۔ daily streak bonus!',
    as: 'quiz, games ৰ XP. 50%+ t next level. daily streak bonus!',
    mai: 'quiz, games se XP. 50%+ pe next level. daily streak bonus!',
    bho: 'quiz, games se XP. 50%+ pe next level. daily streak bonus!',
    sa: 'quiz, games तः XP। 50%+ score इत्यत्र next level unlock।',
    ne: 'quiz, games bata XP. 50%+ ma next level. daily streak bonus!',
    ks: 'quiz, games pe XP. 50%+ pe next level. daily streak bonus!',
  },
  multiplication: {
    en: 'To multiply two numbers: 1) Multiplication is repeated addition: 4 × 3 means 4 groups of 3 (3 + 3 + 3 + 3 = 12). 2) Column method for larger numbers: Multiply the ones digit first, then tens, and add partial products together. Example: 23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92.',
    hi: 'दो संख्याओं को गुणा करने के लिए: 1) गुणन का अर्थ बार-बार जोड़ना है, जैसे 4 × 3 = 3 + 3 + 3 + 3 = 12। 2) बड़ी संख्याओं के लिए स्तंभ विधि (Column Method) से इकाई और दहाई को गुणा करके जोड़ें। उदाहरण: 23 × 4 = 80 + 12 = 92।',
    bn: 'দুটি সংখ্যা গুণ করতে: ১) গুণ মানে বারবার যোগ করা, যেমন ৪ × ৩ = ৩ + ৩ + ৩ + ৩ = ১২। ২) বড় সংখ্যার জন্য স্তম্ভ পদ্ধতি ব্যবহার করুন। উদাহরণ: ২৩ × ৪ = ৯২।',
    te: 'రెండు సంఖ్యలను గుణించడానికి: 1) గుణకారం అంటే పునరావృత సంకలనం, ఉదాహరణకు 4 × 3 = 12. 2) కాలమ్ పద్ధతిలో ఒకట్లు, పదుల స్థానాలను గుణించి కలపండి. ఉదాహరణ: 23 × 4 = 92.',
    mr: 'दोन संख्यांचा गुणाकार करण्यासाठी: १) गुणाकार म्हणजे वारंवार बेरीज, जसे ४ × ३ = १२. २) मोठ्या संख्यांसाठी स्तंभ पद्धत वापरा. उदाहरण: २३ × ४ = ९२.',
    ta: 'இரண்டு எண்களைப் பெருக்க: 1) பெருக்கல் என்பது தொடர் கூட்டல், எ.கா. 4 × 3 = 12. 2) நெடுவரிசை முறையில் பெருக்கி கூட்டவும். உதாரணம்: 23 × 4 = 92.',
    gu: 'બે સંખ્યાઓનો ગુણાકાર કરવા: ૧) ગુણાકાર એટલે વારંવાર સરવાળો, જેમ કે ૪ × ૩ = ૧૨. ૨) સ્તંભ પદ્ધતિથી ગુણાકાર કરો. ઉદાહરણ: ૨૩ × ૪ = ૯૨.',
    kn: 'ಎರಡು ಸಂಖ್ಯೆಗಳನ್ನು ಗುಣಿಸಲು: 1) ಗುಣಾಕಾರ ಎಂದರೆ ಪುನರಾವರ್ತಿತ ಸಂಕಲನ, ಉದಾ: 4 × 3 = 12. 2) ಕಾಲಮ್ ವಿಧಾನದಲ್ಲಿ ಗುಣಿಸಿ. ಉದಾಹರಣೆ: 23 × 4 = 92.',
    ml: 'രണ്ട് സംഖ്യകൾ ഗുണിക്കാൻ: 1) ഗുണനം എന്നാൽ ആവർത്തിച്ചുള്ള സങ്കലനം, ഉദാ: 4 × 3 = 12. 2) കോളം രീതിയിൽ ഗുണിക്കുക. ഉദാഹരണം: 23 × 4 = 92.',
    or: 'ଦୁଇଟି ସଂଖ୍ୟା ଗୁଣନ କରିବାକୁ: ୧) ଗୁଣନ ଅର୍ଥ ବାରମ୍ବାର ଯୋଗ, ଯଥା ୪ × ୩ = ୧୨। ୨) ସ୍ତମ୍ଭ ପଦ୍ଧତିରେ ଗୁଣନ୍ତୁ। ଉଦାହରଣ: ୨୩ × ୪ = ୯୨।',
    pa: 'ਦੋ ਸੰਖਿਆਵਾਂ ਨੂੰ ਗੁਣਾ ਕਰਨ ਲਈ: 1) ਗੁਣਾ ਦਾ ਮਤਲਬ ਵਾਰ-ਵਾਰ ਜੋੜਨਾ ਹੈ, ਜਿਵੇਂ 4 × 3 = 12। 2) ਕਾਲਮ ਵਿਧੀ ਨਾਲ ਗੁਣਾ ਕਰੋ। ਉਦਾਹਰਨ: 23 × 4 = 92।',
    ur: 'دو اعداد کو ضرب دینے کے لیے: 1) ضرب کا مطلب بار بار جمع کرنا ہے، جیسے 4 × 3 = 12۔ 2) کالم کے طریقے سے اکائی اور دہائی کو ضرب دے کر جمع کریں۔ مثال: 23 × 4 = 92۔',
    as: 'দুটা সংখ্যা পূৰণ কৰিবলৈ: ১) পূৰণ মানে বাৰে বাৰে যোগ কৰা, যেনে ৪ × ৩ = ১২। ২) স্তম্ভ পদ্ধতিৰে পূৰণ কৰক। উদাহৰণ: ২৩ × ৪ = ৯২।',
    mai: 'दो संख्या के गुणा करे लेल: 1) गुणा मतलब बार-बार जोड़ब, जेना 4 × 3 = 12। 2) कॉलम विधि सँ गुणा करू। उदाहरण: 23 × 4 = 92।',
    bho: 'दू गो संख्या के गुणा करे खातिर: 1) गुणा मतलब बार-बार जोड़ल, जइसे 4 × 3 = 12। 2) कॉलम विधि से गुणा करीं। उदाहरण: 23 × 4 = 92।',
    sa: 'द्वयोः संख्ययोः गुणनं कर्तुम्: गुणनं नाम पुनः पुनः योगः, यथा ४ × ३ = १२। स्तम्भविधिना गुणनं कुरुत। उदाहरणम्: २३ × ४ = ९२।',
    ne: 'दुई संख्या गुणन गर्न: १) गुणन भन्नाले बारम्बार जोड्नु हो, जस्तै ४ × ३ = १२। २) स्तम्भ विधिबाट गुणन गर्नुहोस्। उदाहरण: २३ × ४ = ९२।',
    ks: 'Zav adadan zarab dinkhyath: 1) Zarab chu bar bar jama karun, yuth 4 × 3 = 12। Misal: 23 × 4 = 92।',
  },
  weather: {
    en: 'Bangalore (Bengaluru) sits at an elevation of ~920 meters on the Deccan Plateau, giving it a moderate and pleasant climate. Average temperatures typically range between 18°C and 29°C. (Note: As an educational AI tutor without live satellite IoT sensors, I provide the regional climatological range).',
    hi: 'बैंगलोर (बेंगलुरु) समुद्र तल से लगभग 920 मीटर की ऊंचाई पर है, जिससे यहां साल भर सुहावना मौसम रहता है। सामान्य तापमान 18°C से 29°C के बीच रहता है। (नोट: लाइव मौसम सेंसर के बिना, यह क्षेत्र का सामान्य जलवायु डेटा है)।',
    bn: 'ব্যাঙ্গালোর সমুদ্রপৃষ্ঠ থেকে প্রায় ৯২০ মিটার উঁচুতে অবস্থিত, তাই এখানকার আবহাওয়া মনোরম থাকে। স্বাভাবিক তাপমাত্রা ১৮°C থেকে ২৯°C এর মধ্যে থাকে।',
    te: 'బెంగళూరు సముద్ర మట్టానికి సుమారు 920 మీటర్ల ఎత్తులో ఉండడం వల్ల సంవత్సరం పొడవునా ఆహ్లాదకరమైన వాతావరణం ఉంటుంది. సాధారణ ఉష్ణోగ్రత 18°C నుండి 29°C వరకు ఉంటుంది.',
    mr: 'बंगळुरू समुद्रसपाटीपासून सुमारे ९२० मीटर उंचीवर असल्याने येथे वर्षभर आल्हाददायक हवामान असते. सरासरी तापमान १८°C ते २९°C दरम्यान असते.',
    ta: 'பெங்களூரு கடல் மட்டத்திலிருந்து 920 மீட்டர் உயரத்தில் உள்ளதால் ஆண்டு முழுவதும் இதமான வானிலை நிலவுகிறது. வெப்பநிலை பொதுவாக 18°C முதல் 29°C வரை இருக்கும்.',
    gu: 'બેંગલુરુ સમુદ્ર સપાટીથી આશરે ૯૨૦ મીટર ઊંચાઈ પર હોવાથી આખું વર્ષ આહલાદક વાતાવરણ રહે છે. તાપમાન સામાન્ય રીતે ૧૮°C થી ૨૯°C ની વચ્ચે રહે છે.',
    kn: 'ಬೆಂಗಳೂರು ಸಮುದ್ರ ಮಟ್ಟದಿಂದ ಸುಮಾರು 920 ಮೀಟರ್ ಎತ್ತರದಲ್ಲಿದ್ದು, ವರ್ಷವಿಡೀ ಹಿತಕರವಾದ ಹವಾಮಾನವನ್ನು ಹೊಂದಿರುತ್ತದೆ. ಸಾಮಾನ್ಯ ತಾಪಮಾನ 18°C ರಿಂದ 29°C ಇರುತ್ತದೆ.',
    ml: 'ബെംഗളൂരു സമുദ്രനിരപ്പിൽ നിന്ന് 920 മീറ്റർ ഉയരത്തിലായതിനാൽ വർഷം മുഴുവൻ സുഖകരമായ കാലാവസ്ഥയാണ്. താപനില സാധാരണ 18°C നും 29°C നും ഇടയിലാണ്.',
    or: 'ବେଙ୍ଗାଲୁରୁ ସମୁଦ୍ର ପତ୍ତନରୁ ପ୍ରାୟ ୯୨୦ ମିଟର ଉଚ୍ଚରେ ଥିବାରୁ ଏଠାରେ ବର୍ଷସାରା ମନୋରମ ପାଗ ରହେ। ସାଧାରଣ ତାପମାତ୍ରା ୧୮°C ରୁ ୨୯°C ମଧ୍ୟରେ ଥାଏ।',
    pa: 'ਬੈਂਗਲੁਰੂ ਸਮੁੰਦਰ ਤਲ ਤੋਂ ਲਗਭਗ 920 ਮੀਟਰ ਦੀ ਉਚਾਈ ਤੇ ਹੈ, ਜਿਸ ਕਰਕੇ ਇੱਥੇ ਸਾਲ ਭਰ ਸੁਹਾਵਣਾ ਮੌਸਮ ਰਹਿੰਦਾ ਹੈ। ਤਾਪਮਾਨ ਆਮ ਤੌਰ ਤੇ 18°C ਤੋਂ 29°C ਵਿਚਕਾਰ ਹੁੰਦਾ ਹੈ।',
    ur: 'بنگلور سطح سمندر سے تقریباً 920 میٹر کی بلندی پر واقع ہے، اس لیے یہاں سال بھر خوشگوار موسم رہتا ہے۔ درجہ حرارت عام طور پر 18°C سے 29°C کے درمیان رہتا ہے۔',
    as: 'বেংগালুৰু সাগৰ পৃষ্ঠৰ পৰা প্ৰায় ৯২০ মিটাৰ উচ্চতাত অৱস্থিত হোৱাৰ বাবে বতৰ আনন্দদায়ক হৈ থাকে। সাধাৰণ উষ্ণতা ১৮°C ৰ পৰা ২৯°C।',
    mai: 'बैंगलोर के मौसम साल भर नीक रहैत अछि। सामान्य तापमान 18°C सँ 29°C रहैत अछि।',
    bho: 'बैंगलोर के मौसम साल भर सुहावन रहेला। सामान्य तापमान 18°C से 29°C के बीच रहेला।',
    sa: 'बेङ्गळूरु-नगरस्य वातावरणं वर्षपर्यन्तं सुखदं भवति। सामान्यं तापमानं १८°C तः २९°C पर्यन्तं भवति।',
    ne: 'बैंगलोरको मौसम वर्षभरि नै रमाइलो हुन्छ। सामान्य तापक्रम १८°C देखि २९°C को बीचमा रहन्छ।',
    ks: 'Bangalore-uk mosam chu sathan khoshgawar ruzan. Darja-e-hararat chu 18°C peth 29°C tak asan।',
  },
  default: {
    en: 'Namaste! I am your GyaanDhara AI tutor. Ask about math, science, English, digital literacy, games, or how to earn XP!',
    hi: 'नमस्ते! मैं आपका GyaanDhara AI शिक्षक हूं। गणित, विज्ञान, अंग्रेजी, डिजिटल साक्षरता, खेल या XP के बारे में पूछें!',
    bn: 'নমস্কার! আমি আপনার GyaanDhara AI শিক্ষক। গণিত, বিজ্ঞান, ইংরেজি, গেম বা XP সম্পর্কে জিজ্ঞাসা করুন!',
    te: 'Namaste! nenu mee GyaanDhara AI tutor. math, science, English, games, XP gurinchi adagandi!',
    mr: 'नमस्कार! मी तुमचा GyaanDhara AI शिक्षक. गणित, विज्ञान, English, games, XP विचारा!',
    ta: 'Vanakkam! naan ungal GyaanDhara AI tutor. math, science, English, games, XP kekunga!',
    gu: 'Namaste! hu tamaro GyaanDhara AI tutor. math, science, English, games, XP puchho!',
    kn: 'Namaste! nanu nimma GyaanDhara AI tutor. math, science, English, games, XP keli!',
    ml: 'Namaskaram! njan ningalude GyaanDhara AI tutor. math, science, English, games, XP chodikkuka!',
    or: 'Namaste! mu tumara GyaanDhara AI tutor. math, science, English, games, XP pachara!',
    pa: 'Sat Sri Akal! main tuhada GyaanDhara AI tutor. math, science, English, games, XP puchho!',
    ur: 'السلام علیکم! میں آپ کا GyaanDhara AI استاد ہوں۔ ریاضی، سائنس، انگریزی، گیمز، XP پوچھیں!',
    as: 'Nomoskar! moi apunar GyaanDhara AI tutor. math, science, English, games, XP suhib!',
    mai: 'Namaste! ham apke GyaanDhara AI tutor. math, science, English, games, XP puchho!',
    bho: 'Namaste! hum tohra GyaanDhara AI tutor. math, science, English, games, XP puchho!',
    sa: 'नमस्ते! अहं भवतः GyaanDhara AI शिक्षकः। गणितं, विज्ञानं, English, games, XP पृच्छतु!',
    ne: 'Namaste! ma tapainko GyaanDhara AI tutor. math, science, English, games, XP sodhnus!',
    ks: 'Namaste! ba chu GyaanDhara AI tutor. math, science, English, games, XP puchho!',
  },
};

const DIFFICULTY_SUFFIX = {
  en: (d) => ` Based on your progress, try ${d} difficulty quizzes next.`,
  hi: (d) => ` आपकी प्रगति के अनुसार ${d} कठिनाई की क्विज़ आज़माएं।`,
  bn: (d) => ` আপনার অগ্রগতি অনুযায়ী ${d} difficulty quiz চেষ্টা করুন।`,
  te: (d) => ` mee progress prakaram ${d} difficulty quiz try cheyandi.`,
  mr: (d) => ` tumchya progress nusar ${d} difficulty quiz try kara.`,
  ta: (d) => ` ungal progress padi ${d} difficulty quiz try pannunga.`,
  gu: (d) => ` tamari progress mujab ${d} difficulty quiz try karo.`,
  kn: (d) => ` nimma progress prakara ${d} difficulty quiz try maadi.`,
  ml: (d) => ` ningalude progress anusarich ${d} difficulty quiz try cheyyuka.`,
  or: (d) => ` tumara progress anusare ${d} difficulty quiz try karantu.`,
  pa: (d) => ` tuhadi progress mutabik ${d} difficulty quiz try karo.`,
  ur: (d) => ` آپ ki progress ke mutabiq ${d} difficulty quiz try karein.`,
  as: (d) => ` apunar progress anusare ${d} difficulty quiz try karo.`,
  mai: (d) => ` aapke progress ke hisab se ${d} difficulty quiz try karo.`,
  bho: (d) => ` tohra progress ke hisab se ${d} difficulty quiz try karo.`,
  sa: (d) => ` भवतः प्रगत्या ${d} difficulty quiz प्रयतत।`,
  ne: (d) => ` tapainko progress anusar ${d} difficulty quiz try garnuhos.`,
  ks: (d) => ` tuhund progress mutabiq ${d} difficulty quiz try karo.`,
};

const STREAK_SUFFIX = {
  en: (s) => ` Great job on your ${s}-day streak!`,
  hi: (s) => ` ${s} दिन की streak — बहुत बढ़िया!`,
  bn: (s) => ` ${s} দিনের streak — দারুণ!`,
  te: (s) => ` ${s} rojula streak — chala bagundi!`,
  mr: (s) => ` ${s} दिवसांची streak — छान!`,
  ta: (s) => ` ${s} naal streak — super!`,
  gu: (s) => ` ${s} divas ni streak — saras!`,
  kn: (s) => ` ${s} dina streak — chennagi!`,
  ml: (s) => ` ${s} divasam streak — nannayi!`,
  or: (s) => ` ${s} dina streak — bhala!`,
  pa: (s) => ` ${s} din di streak — shabash!`,
  ur: (s) => ` ${s} دن کی streak — شاباش!`,
  as: (s) => ` ${s} dinor streak — bhale!`,
  mai: (s) => ` ${s} din ke streak — badhiya!`,
  bho: (s) => ` ${s} din ke streak — badhiya!`,
  sa: (s) => ` ${s} दिन streak — साधु!`,
  ne: (s) => ` ${s} din ko streak — ramro!`,
  ks: (s) => ` ${s} din streak — shabash!`,
};

export function detectTopic(message) {
  const lower = message.toLowerCase();
  if (/multipl|गुणा|गुणन|గుణ|গুণ|ગુણા|ضرب/.test(lower)) return 'multiplication';
  if (/temperature|weather|bangalore|banglore|मौसम|तापमान|వాతావరణం|हवामान|வெப்பநிலை|ಹವಾಮಾನ/.test(lower)) return 'weather';
  if (/fraction|भिन्न|ભાગ|ভাগ/.test(lower)) return 'fractions';
  if (/algebra|equation|variable|समीकरण/.test(lower)) return 'algebra';
  if (/science|physics|chemistry|plant|matter|विज्ञान|photosynthesis|फोटो/.test(lower)) return 'science';
  if (/english|grammar|tense|verb|अंग्रेजी/.test(lower)) return 'english';
  if (/computer|digital|internet|password|cyber|online|otp|डिजिटल/.test(lower)) return 'digital';
  if (/rural|village|offline|bandwidth|connect|गाँव|गांव|game manual|hint|50%|level/.test(lower)) return 'rural';
  if (/xp|badge|streak|level|game|quiz|खेल|game pass/.test(lower)) return 'gamification';
  return 'default';
}

function pickLang(lang) {
  if (LANGS.includes(lang)) return lang;
  return 'en';
}

function getTopicText(topic, lang) {
  const L = pickLang(lang);
  const block = TOPICS[topic] || TOPICS.default;
  return block[L] || block.hi || block.en;
}

export function ruleBasedReplyI18n(message, userContext, lang = 'en') {
  const L = pickLang(lang);

  // Check if message is a simple arithmetic evaluation like "5 * 6" or "12 + 15"
  const mathMatch = message.trim().match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/×÷])\s*(\d+(?:\.\d+)?)$/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let res;
    if (op === '+' ) res = a + b;
    else if (op === '-') res = a - b;
    else if (op === '*' || op === '×') res = a * b;
    else if (op === '/' || op === '÷') res = b !== 0 ? (a / b) : 'Cannot divide by zero';
    return `${a} ${op} ${b} = ${res}`;
  }

  const topic = detectTopic(message);
  let reply = getTopicText(topic, L);

  if (topic === 'default' && userContext?.recommendedDifficulty && DIFFICULTY_SUFFIX[L]) {
    reply += DIFFICULTY_SUFFIX[L](userContext.recommendedDifficulty);
  }

  if (topic === 'default' && userContext?.streak > 0 && STREAK_SUFFIX[L]) {
    reply += STREAK_SUFFIX[L](userContext.streak);
  }

  return reply;
}

export const SUPPORTED_TUTOR_LANGS = LANGS;

