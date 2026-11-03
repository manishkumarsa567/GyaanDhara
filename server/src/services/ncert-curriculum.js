import {
  getRegionalLanguageSubject,
  normalizeLanguageCode,
  REGIONAL_LANG_INFO,
} from './ncert-regional-languages.js';

const OFFICIAL_TEXTBOOKS_URL = 'https://ncert.nic.in/textbook.php';

function subject(id, name, icon, chapters) {
  return {
    id,
    name,
    icon,
    chapters: chapters.map(([chapterId, title, reading, fact, falseFact, prompt, answer]) => ({
      id: chapterId,
      title,
      reading,
      fact,
      falseFact,
      prompt,
      answer,
    })),
  };
}

const COURSE_DATA = [
  {
    grade: 1,
    subjects: [
      subject('mathematics', 'Mathematics', '🔢', [
        ['counting-to-10', 'Counting to 10', 'Count one object at a time, saying one number for each object. Numbers tell how many objects are in a group.', 'The number after 5 is 6.', 'The number after 5 is 8.', 'A group with four objects has the number ___ .', '4'],
        ['shapes-around-us', 'Shapes Around Us', 'Look for circles, triangles, squares, and rectangles in familiar places. A shape can be named by its outline and corners.', 'A triangle has three sides.', 'A triangle has four sides.', 'A shape with three sides is a ___ .', 'triangle'],
        ['addition-and-subtraction', 'Joining and Taking Away', 'Addition joins groups. Subtraction tells how many remain after some are taken away. Draw or use objects to check an answer.', '2 + 3 means joining two and three to make five.', '2 + 3 means taking three away from two.', '2 + 3 = ___ .', '5'],
      ]),
      subject('english', 'English', '📚', [
        ['letters-and-sounds', 'Letters and Sounds', 'Letters represent sounds. Listen to the first sound in a word, then connect it to the letter that represents that sound.', 'The word sun begins with the letter s.', 'The word sun begins with the letter m.', 'The first letter in sun is ___ .', 's'],
        ['naming-words', 'Naming Words', 'A naming word tells us the name of a person, place, animal, or thing. Names help us talk about what we see.', 'A teacher is a person and a school is a place.', 'A teacher is a place and a school is a person.', 'A word that names a person, place, animal, or thing is a ___ word.', 'naming'],
        ['simple-sentences', 'Simple Sentences', 'A sentence shares a complete thought. Begin a sentence with a capital letter and use a full stop at the end.', 'A sentence begins with a capital letter.', 'A sentence should begin with a full stop.', 'We use a capital letter at the ___ of a sentence.', 'beginning'],
      ]),
      subject('hindi', 'Hindi', 'अ', [
        ['swar', 'स्वर पहचान', 'स्वर ऐसे वर्ण हैं जिनका उच्चारण बिना किसी दूसरे वर्ण की सहायता से किया जा सकता है। अ, आ और इ स्वर के उदाहरण हैं।', 'अ और आ स्वर हैं।', 'क और ख स्वर हैं।', 'अ, आ और इ ___ हैं।', 'स्वर'],
        ['vyanjan', 'व्यंजन पहचान', 'व्यंजन का उच्चारण स्वर की सहायता से होता है। क, म और स हिंदी के व्यंजन हैं।', 'क एक व्यंजन है।', 'क एक स्वर है।', 'क, म और स हिंदी के ___ हैं।', 'व्यंजन'],
        ['shabd-aur-vakya', 'शब्द और वाक्य', 'अर्थ बताने वाले वर्णों के समूह को शब्द कहते हैं। कई शब्द मिलकर पूरा विचार बताएं तो वाक्य बनता है।', 'शब्दों का सही समूह पूरा विचार बता सकता है।', 'हर अकेला वर्ण पूरा वाक्य होता है।', 'पूरा विचार बताने वाले शब्दों के समूह को ___ कहते हैं।', 'वाक्य'],
      ]),
      subject('environment', 'The World Around Us', '🌱', [
        ['my-body', 'My Body and Senses', 'Our eyes, ears, nose, tongue, and skin help us notice the world. We use our senses carefully and ask an adult for help when hurt.', 'Eyes help us see.', 'Eyes help us hear.', 'We use our eyes to ___ .', 'see'],
        ['plants-nearby', 'Plants Around Us', 'Plants need light, air, water, and space to grow. Roots hold a plant in the soil and take in water.', 'Roots take in water from the soil.', 'Roots make sunlight disappear.', 'Roots help a plant take in ___ from the soil.', 'water'],
        ['water-at-home', 'Water at Home', 'We use water for drinking, cooking, and cleaning. Clean water matters, so close taps when they are not being used.', 'Closing a tap helps save water.', 'Leaving a tap open saves water.', 'Turn off a tap to ___ water.', 'save'],
      ]),
    ],
  },
  {
    grade: 2,
    subjects: [
      subject('mathematics', 'Mathematics', '🔢', [
        ['numbers-to-100', 'Numbers to 100', 'Two-digit numbers have tens and ones. In 34, the 3 stands for three tens and the 4 stands for four ones.', 'In 34, the digit 3 means three tens.', 'In 34, the digit 3 means three ones.', 'In 34, the digit 4 means four ___ .', 'ones'],
        ['addition-with-groups', 'Adding Groups', 'Add the ones first and regroup ten ones as one ten when needed. A number line or bundles of sticks can help check addition.', '8 + 5 = 13.', '8 + 5 = 12.', '8 + 5 = ___ .', '13'],
        ['measuring-length', 'Measuring Length', 'Length tells how long something is. Use the same unit each time and line up the start of the object with zero on a ruler.', 'A ruler can measure length in centimetres.', 'A ruler measures how heavy an object is.', 'A centimetre is a unit used to measure ___ .', 'length'],
      ]),
      subject('english', 'English', '📚', [
        ['nouns-and-names', 'Nouns and Names', 'A noun names a person, place, animal, or thing. A proper name begins with a capital letter in English.', 'Rita is a name and begins with a capital letter.', 'Rita is a name and begins with a small letter in English.', 'A naming word is called a ___ .', 'noun'],
        ['action-words', 'Action Words', 'Action words tell what someone or something does. Read the sentence and ask, “What is happening?” to find the action word.', 'In “Birds fly,” fly tells the action.', 'In “Birds fly,” birds tells the action.', 'In “Birds fly,” ___ is the action word.', 'fly'],
        ['reading-a-short-story', 'Reading a Short Story', 'A story has people or characters and events. Notice what happens first, next, and last to understand its order.', 'A story can have events in an order.', 'A story has no events to follow.', 'To follow a story, notice what happens first, next, and ___ .', 'last'],
      ]),
      subject('hindi', 'Hindi', 'अ', [
        ['matra', 'मात्राएँ', 'मात्राएँ स्वर की ध्वनि को व्यंजन के साथ लिखने में मदद करती हैं। जैसे क के साथ ा लगाने पर का बनता है।', 'क + ा से का बनता है।', 'क + ा से कि बनता है।', 'क + ा मिलकर ___ बनाते हैं।', 'का'],
        ['sangya', 'संज्ञा', 'किसी व्यक्ति, स्थान, पशु या वस्तु के नाम को संज्ञा कहते हैं। अपने आसपास की चीज़ों के नाम संज्ञा के उदाहरण हैं।', '“गाय” एक पशु का नाम है।', '“दौड़ना” एक पशु का नाम है।', 'नाम बताने वाले शब्द को ___ कहते हैं।', 'संज्ञा'],
        ['saral-vakya', 'सरल वाक्य', 'सरल वाक्य किसी एक बात को साफ़ ढंग से बताते हैं। शब्दों को सही क्रम में रखने से बात समझ में आती है।', '“रीना पढ़ती है।” एक पूरा सरल वाक्य है।', '“पढ़ती रीना।” हमेशा पूरा स्पष्ट वाक्य है।', 'एक पूरी बात बताने वाले शब्दों के समूह को ___ कहते हैं।', 'वाक्य'],
      ]),
      subject('environment', 'The World Around Us', '🌱', [
        ['family-and-neighbours', 'Families and Neighbours', 'Families and neighbours can help one another. People may have different responsibilities, and everyone deserves respect.', 'Neighbours can cooperate and help each other.', 'Neighbours should never help each other.', 'People living nearby are called ___ .', 'neighbours'],
        ['food-we-eat', 'Food We Eat', 'Food gives our bodies energy and helps us grow. Different foods come from plants or animals; wash hands before eating.', 'Rice is a food that comes from a plant.', 'Rice grows on an animal.', 'Food gives our body ___ .', 'energy'],
        ['safe-travel', 'Safe Travel', 'Use a safe crossing, look for traffic, and follow a trusted adult’s instructions. A helmet helps protect a cyclist’s head.', 'A helmet helps protect a cyclist’s head.', 'A helmet is meant to be worn on the knee.', 'A cyclist wears a helmet to protect the ___ .', 'head'],
      ]),
    ],
  },
  {
    grade: 3,
    subjects: [
      subject('mathematics', 'Mathematics', '🔢', [
        ['place-value', 'Place Value', 'The value of a digit depends on its place. In 247, the digits represent two hundreds, four tens, and seven ones.', 'In 247, 4 represents four tens.', 'In 247, 4 represents four hundreds.', 'In 247, the digit 2 represents two ___ .', 'hundreds'],
        ['multiplication-as-groups', 'Multiplication as Equal Groups', 'Multiplication is a quick way to add equal groups. Three groups of four can be written as 3 × 4 and equal 12.', '3 × 4 = 12.', '3 × 4 = 7.', 'Three groups of four make ___ objects.', '12'],
        ['fractions-as-parts', 'Fractions as Parts', 'A fraction names equal parts of a whole. In one-half, the whole is divided into two equal parts and one part is taken.', 'One-half means one of two equal parts.', 'One-half means one of three unequal parts.', 'A whole split into two equal parts gives halves; one part is ___ .', 'one-half'],
      ]),
      subject('english', 'English', '📚', [
        ['describing-words', 'Describing Words', 'Adjectives describe nouns. They can tell us about colour, size, number, or another quality.', 'In “a red ball,” red describes the ball.', 'In “a red ball,” ball describes the colour red.', 'A word that describes a noun is an ___ .', 'adjective'],
        ['present-and-past', 'Present and Past', 'Verbs can show when an action happens. “Walk” can describe a present action and “walked” can describe a completed past action.', '“Walked” can describe an action in the past.', '“Walked” always describes an action in the future.', 'The past form of walk is ___ .', 'walked'],
        ['main-idea', 'Finding the Main Idea', 'The main idea is what a passage is mostly about. Details give extra information that supports it.', 'Details can support the main idea.', 'The main idea is always an unrelated detail.', 'The idea a passage is mostly about is its ___ idea.', 'main'],
      ]),
      subject('hindi', 'Hindi', 'अ', [
        ['ling', 'लिंग', 'हिंदी में संज्ञा के रूप से स्त्रीलिंग या पुल्लिंग का बोध हो सकता है। शब्दों का सही रूप वाक्य को स्पष्ट बनाता है।', '“लड़की” स्त्रीलिंग शब्द है।', '“लड़की” पुल्लिंग शब्द है।', '“लड़की” एक ___ शब्द है।', 'स्त्रीलिंग'],
        ['vachan', 'वचन', 'एकवचन एक व्यक्ति या वस्तु को बताता है। बहुवचन एक से अधिक व्यक्तियों या वस्तुओं को बताता है।', '“किताबें” बहुवचन है।', '“किताबें” एकवचन है।', 'एक से अधिक के लिए ___ वचन का प्रयोग होता है।', 'बहु'],
        ['kriya', 'क्रिया', 'काम या अवस्था बताने वाले शब्द क्रिया कहलाते हैं। वाक्य में क्रिया से पता चलता है कि क्या हो रहा है।', '“खेलना” एक क्रिया है।', '“खेलना” एक रंग का नाम है।', 'काम बताने वाले शब्द को ___ कहते हैं।', 'क्रिया'],
      ]),
      subject('environment', 'Environmental Studies', '🌱', [
        ['living-and-nonliving', 'Living and Non-living Things', 'Living things grow and need resources such as air and water. Non-living things do not grow by themselves.', 'A young plant is living and can grow.', 'A stone grows by itself like a plant.', 'Living things can ___ as they develop.', 'grow'],
        ['air-and-weather', 'Air and Weather', 'Air is around us even when we cannot see it. Weather describes conditions such as temperature, wind, and rain at a particular time.', 'Wind is moving air.', 'Wind is water flowing underground.', 'Moving air is called ___ .', 'wind'],
        ['maps-and-directions', 'Maps and Directions', 'A map is a drawing that represents a place. Direction words such as north, south, east, and west help describe where things are.', 'A map can represent a place from above.', 'A map is always the place itself.', 'A drawing that represents a place is a ___ .', 'map'],
      ]),
    ],
  },
  {
    grade: 4,
    subjects: [
      subject('mathematics', 'Mathematics', '🔢', [
        ['large-numbers', 'Large Numbers and Place Value', 'Group digits into ones, tens, hundreds, and thousands. Place value helps read, compare, and calculate with larger numbers.', 'In 3,582, the digit 5 represents five hundreds.', 'In 3,582, the digit 5 represents five thousands.', 'In 3,582, the digit 3 represents three ___ .', 'thousands'],
        ['multiplication-and-division', 'Multiplication and Division', 'Multiplication combines equal groups. Division shares a quantity into equal groups or finds how many groups fit.', '24 divided by 6 equals 4.', '24 divided by 6 equals 18.', 'Sharing 24 equally among 6 groups gives ___ in each group.', '4'],
        ['perimeter-and-area', 'Perimeter and Area', 'Perimeter is the distance around a shape. Area measures the surface covered inside it, often in square units.', 'Area describes the surface inside a shape.', 'Perimeter describes the surface inside a shape.', 'The distance around a shape is its ___ .', 'perimeter'],
      ]),
      subject('english', 'English', '📚', [
        ['paragraphs', 'Building a Paragraph', 'A paragraph develops one main idea with related sentences. A topic sentence can introduce the idea, while other sentences add details.', 'Related details help explain a paragraph’s main idea.', 'A paragraph is clearer when every sentence changes topic.', 'A group of related sentences about one idea is a ___ .', 'paragraph'],
        ['pronouns', 'Pronouns', 'A pronoun can take the place of a noun. Using pronouns carefully helps avoid repeating names while keeping the meaning clear.', '“She” can be used as a pronoun.', '“She” is a punctuation mark.', 'A word used in place of a noun is a ___ .', 'pronoun'],
        ['punctuation', 'Punctuation and Questions', 'Punctuation marks show pauses and sentence purpose. A question mark is used at the end of a direct question.', 'A direct question ends with a question mark.', 'A direct question must end with a comma.', 'A question ends with a ___ mark.', 'question'],
      ]),
      subject('hindi', 'Hindi', 'अ', [
        ['visheshan', 'विशेषण', 'जो शब्द संज्ञा या सर्वनाम की विशेषता बताते हैं, वे विशेषण कहलाते हैं। जैसे “मीठा आम” में मीठा आम की विशेषता बताता है।', '“मीठा” शब्द आम की विशेषता बताता है।', '“मीठा” शब्द आम का नाम बताता है।', 'विशेषता बताने वाले शब्द को ___ कहते हैं।', 'विशेषण'],
        ['sarvanam', 'सर्वनाम', 'संज्ञा के स्थान पर आने वाले शब्द सर्वनाम कहलाते हैं। मैं, तुम और वह सर्वनाम के उदाहरण हैं।', '“वह” सर्वनाम का उदाहरण है।', '“वह” विराम-चिह्न है।', 'संज्ञा के स्थान पर आने वाले शब्द को ___ कहते हैं।', 'सर्वनाम'],
        ['patra-lekhan', 'पत्र लेखन', 'पत्र में संबोधन, मुख्य संदेश और समापन होता है। साफ़ भाषा और सही क्रम से पाठक को बात समझने में मदद मिलती है।', 'पत्र में मुख्य संदेश स्पष्ट होना चाहिए।', 'पत्र में संदेश की जरूरत नहीं होती।', 'पत्र में लिखी मुख्य बात को ___ कहते हैं।', 'संदेश'],
      ]),
      subject('environment', 'Environmental Studies', '🌱', [
        ['food-chains', 'Food and Food Chains', 'Plants make their own food using sunlight. Animals get energy by eating plants or other animals, linking living things in food chains.', 'Plants can begin a food chain by making food.', 'Plants get all their food by hunting animals.', 'A sequence showing who eats whom is a food ___ .', 'chain'],
        ['soil-types', 'Soil and Its Uses', 'Soil contains mineral particles and organic matter. Different soils hold water differently, so plant choices and care can vary.', 'Soil helps many plants grow.', 'Soil is only made of liquid water.', 'Many plants grow with their roots in the ___ .', 'soil'],
        ['local-government', 'Community Helpers and Local Government', 'Local bodies help communities plan services such as roads, sanitation, and water. Residents can share needs and take part in local decisions.', 'Local bodies help plan community services.', 'Local government has no role in community services.', 'Roads and sanitation are examples of community ___ .', 'services'],
      ]),
    ],
  },
  {
    grade: 5,
    subjects: [
      subject('mathematics', 'Mathematics', '🔢', [
        ['fractions-and-decimals', 'Fractions and Decimals', 'Fractions and decimals can represent parts of a whole. Equivalent forms describe the same amount, such as one-half and 0.5.', 'One-half is equal to 0.5.', 'One-half is equal to 5.', 'The decimal form of one-half is ___ .', '0.5'],
        ['measurement-and-units', 'Measurement and Units', 'Choose a unit that fits what is measured. Metres measure length, litres measure capacity, and kilograms measure mass.', 'Litres are used to measure capacity.', 'Litres are used to measure distance.', 'Kilograms measure ___ .', 'mass'],
        ['data-and-graphs', 'Data and Graphs', 'Data are collected facts or measurements. Tables and graphs organize data so that patterns and comparisons are easier to see.', 'A bar graph can compare quantities.', 'A bar graph is used only to measure temperature.', 'A graph helps us organize and compare ___ .', 'data'],
      ]),
      subject('english', 'English', '📚', [
        ['comprehension', 'Reading for Meaning', 'Readers use the text and its details to identify the main idea, sequence events, and make reasonable inferences.', 'An inference is supported by clues in the text.', 'An inference ignores all clues in the text.', 'A conclusion supported by clues is an ___ .', 'inference'],
        ['verb-tenses', 'Verb Tenses', 'Verb tense shows when an action happens. Keep tense consistent unless the time changes in the meaning.', '“Played” is a past-tense verb.', '“Played” is a future-tense verb.', 'Verb tense can show when an action ___ .', 'happens'],
        ['writing-instructions', 'Writing Clear Instructions', 'Instructions explain steps in an order. Use action words and place steps in a sequence that someone can follow safely.', 'Instructions should present steps in a useful order.', 'Instructions should hide the order of steps.', 'A set of steps that explains how to do something is a set of ___ .', 'instructions'],
      ]),
      subject('hindi', 'Hindi', 'अ', [
        ['kaal', 'काल', 'क्रिया के रूप से काम के समय का पता चलता है। वर्तमान, भूत और भविष्य काल समय के तीन सामान्य रूप हैं।', '“खेलता है” वर्तमान समय का बोध करा सकता है।', '“खेलता है” हमेशा भूतकाल बताता है।', 'काम के समय को बताने वाले रूप को ___ कहते हैं।', 'काल'],
        ['muhavare', 'मुहावरे', 'मुहावरे ऐसे प्रचलित वाक्यांश हैं जिनका अर्थ अक्सर शब्दों के सीधे अर्थ से अलग होता है। संदर्भ देखकर उनका भाव समझें।', 'मुहावरे का अर्थ संदर्भ से समझने में मदद मिलती है।', 'मुहावरे का अर्थ हमेशा शब्दशः ही होता है।', 'विशेष अर्थ वाले प्रचलित वाक्यांश को ___ कहते हैं।', 'मुहावरा'],
        ['anuchhed-lekhan', 'अनुच्छेद लेखन', 'अनुच्छेद में एक विषय पर जुड़े हुए वाक्य लिखे जाते हैं। शुरुआत में विषय बताएं और फिर उससे जुड़े विचार क्रम में रखें।', 'एक अनुच्छेद के वाक्य सामान्यतः एक विषय से जुड़े रहते हैं।', 'एक अनुच्छेद में हर वाक्य का अलग विषय होना चाहिए।', 'एक विषय पर जुड़े वाक्यों के समूह को ___ कहते हैं।', 'अनुच्छेद'],
      ]),
      subject('environment', 'Environmental Studies', '🌱', [
        ['water-cycle', 'The Water Cycle', 'The Sun warms water and causes evaporation. Water vapour cools and condenses into clouds; precipitation returns water to Earth.', 'Condensation helps form clouds.', 'Condensation changes clouds into sunlight.', 'Water vapour cooling into droplets is called ___ .', 'condensation'],
        ['health-and-hygiene', 'Health and Hygiene', 'Handwashing with soap helps remove many germs. Safe water, nutritious food, rest, and activity all support health.', 'Washing hands with soap helps reduce germs.', 'Washing hands with mud is the best way to remove germs.', 'Soap and clean water help remove many ___ .', 'germs'],
        ['resources-and-conservation', 'Resources and Conservation', 'Natural resources such as water, soil, forests, and energy support life. Careful use and reuse can reduce waste and protect them.', 'Reusing suitable materials can reduce waste.', 'Throwing away reusable materials always protects resources.', 'Using something again when suitable is called ___ .', 'reuse'],
      ]),
    ],
  },
  {
    grade: 6,
    subjects: [
      subject('mathematics', 'Mathematics', '🔢', [
        ['whole-numbers', 'Whole Numbers', 'Whole numbers include zero and the positive counting numbers. Addition and multiplication of whole numbers follow useful properties.', 'Zero is a whole number.', 'Negative three is a whole number.', 'The smallest whole number is ___ .', 'zero'],
        ['fractions', 'Understanding Fractions', 'Equivalent fractions name the same value. To compare fractions, use common denominators or compare them with familiar benchmarks.', '2/4 and 1/2 are equivalent fractions.', '2/4 and 1/2 have different values.', 'A fraction equal in value to another is an ___ fraction.', 'equivalent'],
        ['geometry-basics', 'Lines, Angles, and Shapes', 'A line segment has two endpoints. Angles describe turns, and polygons are closed shapes made from straight line segments.', 'A triangle is a polygon with three sides.', 'A triangle is a polygon with five sides.', 'A closed shape made of straight sides is a ___ .', 'polygon'],
      ]),
      subject('science', 'Science', '🔬', [
        ['food-and-nutrition', 'Food and Its Components', 'Foods contain nutrients such as carbohydrates, proteins, fats, vitamins, and minerals. A balanced diet includes a variety of foods.', 'A balanced diet includes a variety of nutrients.', 'One food contains every nutrient in the needed amount.', 'A diet with a variety of needed nutrients is a ___ diet.', 'balanced'],
        ['materials-and-separation', 'Materials and Separation', 'Materials have properties such as solubility, size, and whether they are attracted to a magnet. These properties help choose ways to separate mixtures.', 'Sieving can separate particles of different sizes.', 'Sieving separates dissolved salt from water.', 'A sieve separates materials mainly by particle ___ .', 'size'],
        ['motion-and-measurement', 'Motion and Measurement', 'Distance describes how far an object travels. Motion is a change in position over time, and standard units make measurements easier to compare.', 'A moving object changes its position over time.', 'A moving object never changes its position.', 'Motion is a change in ___ over time.', 'position'],
      ]),
      subject('social-science', 'Social Science', '🗺️', [
        ['maps-and-globes', 'Maps and Globes', 'A globe is a model of Earth, while a map represents all or part of Earth on a flat surface. Symbols and a key help read maps.', 'A map key explains symbols used on a map.', 'A map key explains how to read a thermometer.', 'A map ___ explains the symbols shown on it.', 'key'],
        ['diversity', 'Understanding Diversity', 'People and communities may differ in language, food, clothing, and traditions. Respectful listening helps us learn without treating one way of life as superior.', 'Respectful listening helps us learn about diversity.', 'Differences mean some communities deserve less respect.', 'Different ways of life should be treated with ___ .', 'respect'],
        ['local-government', 'Local Government', 'Local government addresses community needs and provides services. Participation and accountability help residents understand decisions and raise concerns.', 'Local government works on community services.', 'Local government is responsible only for space exploration.', 'Residents can raise local concerns with their ___ government.', 'local'],
      ]),
      subject('english', 'English', '📚', [
        ['reading-comprehension', 'Reading Comprehension', 'Use details, word meaning, and the order of events to understand a passage. Support an answer with evidence from what you read.', 'Text evidence can support an answer about a passage.', 'A passage answer should ignore the text.', 'Information from a passage that supports an answer is text ___ .', 'evidence'],
        ['parts-of-speech', 'Parts of Speech', 'Nouns name, verbs show actions or states, and adjectives describe nouns. A word’s role depends on how it is used in a sentence.', 'A verb can show an action.', 'A verb names only a colour.', 'A word that shows an action or state is a ___ .', 'verb'],
        ['paragraph-writing', 'Writing a Paragraph', 'A clear paragraph has a focused idea and supporting details. Linking words show how ideas relate and help the reader follow the writing.', 'Supporting details develop a paragraph’s main idea.', 'Supporting details should contradict the paragraph’s main idea.', 'Details that explain the main idea are ___ details.', 'supporting'],
      ]),
      subject('hindi', 'Hindi', 'अ', [
        ['sangya-sarvanam', 'संज्ञा और सर्वनाम', 'संज्ञा नाम बताती है और सर्वनाम संज्ञा के स्थान पर आता है। सही प्रयोग से वाक्य में दोहराव कम होता है।', '“सीमा” संज्ञा है और “वह” सर्वनाम हो सकता है।', '“सीमा” सर्वनाम है और “वह” संज्ञा है।', 'संज्ञा के स्थान पर आने वाला शब्द ___ कहलाता है।', 'सर्वनाम'],
        ['kriya-kaal', 'क्रिया और काल', 'क्रिया काम या अवस्था बताती है। काल से पता चलता है कि काम वर्तमान में है, पहले हुआ, या आगे होगा।', 'क्रिया वाक्य में काम बता सकती है।', 'क्रिया हमेशा किसी स्थान का नाम बताती है।', 'काम बताने वाले शब्द को ___ कहते हैं।', 'क्रिया'],
        ['apathit-gadyansh', 'गद्यांश समझना', 'गद्यांश पढ़ते समय मुख्य विचार और सहायक विवरण पहचानें। उत्तर उसी जानकारी पर आधारित रखें जो पाठ में दी गई है।', 'गद्यांश का उत्तर पाठ के आधार पर देना चाहिए।', 'गद्यांश का उत्तर पाठ से असंबंधित होना चाहिए।', 'पाठ का मुख्य विचार उसका ___ विचार है।', 'मुख्य'],
      ]),
    ],
  },
  {
    grade: 7,
    subjects: [
      subject('mathematics', 'Mathematics', '🔢', [
        ['integers', 'Integers', 'Integers include positive numbers, negative numbers, and zero. On a number line, numbers farther right are greater than numbers to their left.', '−2 is greater than −5.', '−5 is greater than −2.', 'On a number line, numbers to the right are ___ .', 'greater'],
        ['fractions-and-rational-numbers', 'Fractions and Rational Numbers', 'A rational number can be written as p/q where p and q are integers and q is not zero. Equivalent forms represent the same number.', 'A rational number cannot have zero as its denominator.', 'A rational number can have zero as its denominator.', 'In p/q, the denominator q must not be ___ .', 'zero'],
        ['triangles-and-congruence', 'Triangles and Congruence', 'Congruent shapes have the same size and shape. For triangles, matching side and angle information can establish congruence.', 'Congruent triangles have equal corresponding sides and angles.', 'Congruent triangles must have different sizes.', 'Shapes with the same size and shape are ___ .', 'congruent'],
      ]),
      subject('science', 'Science', '🔬', [
        ['nutrition-in-plants', 'Nutrition in Plants', 'Green plants make food through photosynthesis using light, water, and carbon dioxide. Chlorophyll helps capture light energy.', 'Photosynthesis uses light energy.', 'Photosynthesis happens without any energy source.', 'The green pigment that helps capture light is ___ .', 'chlorophyll'],
        ['heat-and-temperature', 'Heat and Temperature', 'Heat moves from a warmer object to a cooler one. Temperature indicates how hot or cold something is and is measured with a thermometer.', 'Heat flows from warmer to cooler objects.', 'Heat naturally flows from cooler to warmer objects.', 'A thermometer measures ___ .', 'temperature'],
        ['soil-and-its-uses', 'Soil and Its Uses', 'Soil supports plant roots and contains spaces that can hold air and water. Different soils have different properties that affect plant growth.', 'Soil can hold air and water around plant roots.', 'Soil contains no air or water.', 'Soil can hold ___ around plant roots.', 'water'],
      ]),
      subject('social-science', 'Social Science', '🗺️', [
        ['environment-and-adaptation', 'Environment and Human Adaptation', 'Physical environments shape opportunities and challenges. People adapt through knowledge and choices, while also changing their surroundings.', 'People can adapt their practices to local environments.', 'People never adapt to their surroundings.', 'People adjust practices to meet environmental ___ .', 'conditions'],
        ['medieval-sources', 'Sources for Studying the Past', 'Historians use evidence such as inscriptions, coins, buildings, and written records. They compare sources because each one may provide only part of the story.', 'Historians compare sources to understand the past.', 'One source always tells every detail of the past.', 'A historian uses evidence to study the ___ .', 'past'],
        ['equality-and-government', 'Equality and Government', 'Constitutional rights and public institutions help protect equality. Democratic participation includes listening to people and holding decision-makers accountable.', 'Equality is supported by rights and accountable institutions.', 'Equality means only one group can participate.', 'Decision-makers should be held ___ .', 'accountable'],
      ]),
      subject('english', 'English', '📚', [
        ['inference-and-evidence', 'Inference and Evidence', 'An inference is a reasoned conclusion based on clues. Strong readers distinguish what the text states from what they infer.', 'An inference is based on clues and reasoning.', 'An inference is a guess with no clues.', 'A conclusion drawn from clues is an ___ .', 'inference'],
        ['sentence-structure', 'Sentence Structure', 'Independent clauses can stand as complete thoughts. Connect related clauses with suitable punctuation or conjunctions to avoid run-on sentences.', 'A run-on sentence joins thoughts without suitable punctuation.', 'A run-on sentence is always a single clear clause.', 'A complete thought that can stand alone is an independent ___ .', 'clause'],
        ['formal-and-informal-writing', 'Formal and Informal Writing', 'Choose tone and vocabulary for the reader and purpose. A formal request usually uses a respectful greeting, clear details, and an appropriate closing.', 'Writing style should fit its audience and purpose.', 'The audience never affects a writing choice.', 'The reader a text is written for is its ___ .', 'audience'],
      ]),
      subject('hindi', 'Hindi', 'अ', [
        ['vachya-aur-kriya', 'क्रिया और वाच्य', 'क्रिया वाक्य में काम बताती है। वाच्य से पता चलता है कि वाक्य में कर्ता, कर्म या भाव में से किस पर ज़ोर है।', 'वाच्य वाक्य में ज़ोर के संबंध को दिखाता है।', 'वाच्य शब्दों की वर्तनी का नाम है।', 'वाक्य में ज़ोर किस पर है, यह ___ से समझा जा सकता है।', 'वाच्य'],
        ['samas-and-shabd', 'शब्द-रचना', 'शब्दों के मेल से नए अर्थ बन सकते हैं। समास में दो या अधिक पद मिलकर संक्षिप्त रूप में एक पद बनाते हैं।', 'समास में पद मिलकर संक्षिप्त शब्द बना सकते हैं।', 'समास में शब्द हमेशा अलग-अलग रहते हैं।', 'दो या अधिक पदों के संक्षिप्त मेल को ___ कहते हैं।', 'समास'],
        ['patra-and-samvad', 'पत्र और संवाद लेखन', 'पत्र और संवाद का रूप उनके उद्देश्य और पाठक पर निर्भर करता है। विनम्र भाषा और स्पष्ट विचार प्रभावी संचार में मदद करते हैं।', 'स्पष्ट और विनम्र भाषा संचार में मदद करती है।', 'अस्पष्ट भाषा हमेशा बेहतर संवाद बनाती है।', 'दो या अधिक लोगों की बातचीत को ___ कहते हैं।', 'संवाद'],
      ]),
    ],
  },
  {
    grade: 8,
    subjects: [
      subject('mathematics', 'Mathematics', '🔢', [
        ['rational-numbers', 'Rational Numbers', 'Rational numbers can be written as p/q with integers p and q, where q is not zero. They can be compared and represented on a number line.', 'Every integer is also a rational number.', 'No integer can be written as a rational number.', 'A rational number has a denominator that is not ___ .', 'zero'],
        ['linear-equations', 'Linear Equations', 'A linear equation in one variable has a variable with power one. Use equal operations on both sides to find a value that makes the equation true.', 'Subtracting the same number from both sides preserves equality.', 'Changing only one side always preserves equality.', 'To keep an equation balanced, do the same operation on ___ sides.', 'both'],
        ['mensuration', 'Mensuration', 'Perimeter measures the boundary length of a shape. Area measures the surface inside a two-dimensional shape, using square units.', 'Area is measured in square units.', 'Area is measured in units of time.', 'Area is commonly measured in ___ units.', 'square'],
      ]),
      subject('science', 'Science', '🔬', [
        ['crop-production', 'Crop Production and Management', 'Crop production includes preparing soil, sowing, adding nutrients, irrigation, protection, and harvesting. Each step should suit the crop and conditions.', 'Irrigation supplies water to crops.', 'Irrigation removes all nutrients from crops.', 'Supplying water to crops is called ___ .', 'irrigation'],
        ['force-and-pressure', 'Force and Pressure', 'A force is a push or pull that can change motion or shape. Pressure depends on force and the area over which it acts.', 'Pressure increases when the same force acts on a smaller area.', 'Pressure decreases when the same force acts on a smaller area.', 'Pressure depends on force and the ___ it acts over.', 'area'],
        ['conservation-of-plants', 'Conservation of Plants and Animals', 'Habitats support living things. Protecting forests and wildlife helps conserve biodiversity and the resources people and ecosystems depend on.', 'Protecting habitats can help conserve biodiversity.', 'Destroying habitats always protects biodiversity.', 'The variety of living things in an area is its ___ .', 'biodiversity'],
      ]),
      subject('social-science', 'Social Science', '🗺️', [
        ['resources-and-development', 'Resources and Development', 'Resources become useful when people can use them to meet needs. Sustainable planning considers availability, conservation, and fair access.', 'Sustainable planning considers conservation.', 'Sustainable planning requires wasting resources.', 'Careful use that considers the future is called ___ use.', 'sustainable'],
        ['constitution-and-rights', 'The Constitution and Rights', 'A constitution sets key rules for government and citizens. Rights protect freedoms, while laws and institutions help define responsibilities and resolve disputes.', 'A constitution describes important rules for governing.', 'A constitution is only a list of market prices.', 'Rules for governing a country are set out in its ___ .', 'constitution'],
        ['law-and-social-justice', 'Law and Social Justice', 'Laws can protect people from unsafe practices and unfair treatment. Enforcement and access to justice matter for laws to work in practice.', 'Enforcement helps laws protect people in practice.', 'A law works even if no one follows or enforces it.', 'Putting a law into effect is called ___ .', 'enforcement'],
      ]),
      subject('english', 'English', '📚', [
        ['analysing-texts', 'Analysing Texts', 'Analyse a text by identifying its purpose, audience, evidence, and point of view. Separate a writer’s claims from the evidence offered for them.', 'Evidence can be examined separately from a claim.', 'A claim and its evidence are always the same thing.', 'The reason a writer creates a text is its ___ .', 'purpose'],
        ['active-and-passive-voice', 'Active and Passive Voice', 'In active voice, the subject performs the action. In passive voice, the subject receives the action, which can shift emphasis.', 'In active voice, the subject performs the action.', 'In active voice, the subject always receives the action.', 'In active voice, the subject ___ the action.', 'performs'],
        ['argument-writing', 'Writing an Argument', 'A clear argument states a claim and supports it with relevant reasons and evidence. A fair argument may also consider another viewpoint.', 'Evidence can strengthen an argument.', 'An argument is stronger when it has no reasons.', 'A statement an argument tries to support is a ___ .', 'claim'],
      ]),
      subject('hindi', 'Hindi', 'अ', [
        ['vakya-bhed', 'वाक्य के भेद', 'वाक्य का प्रकार उसके उद्देश्य से पहचाना जाता है। कथन, प्रश्न, अनुरोध और विस्मय अलग-अलग प्रकार के भाव व्यक्त करते हैं।', 'प्रश्नवाचक वाक्य प्रश्न पूछता है।', 'प्रश्नवाचक वाक्य हमेशा आदेश देता है।', 'प्रश्न पूछने वाले वाक्य को ___ वाक्य कहते हैं।', 'प्रश्नवाचक'],
        ['muhavare-and-lokokti', 'मुहावरे और लोकोक्तियाँ', 'मुहावरे और लोकोक्तियाँ भाषा को प्रभावशाली बनाते हैं। उनका अर्थ संदर्भ और पूरे वाक्य के भाव से समझना चाहिए।', 'मुहावरे का भाव संदर्भ से समझा जाता है।', 'मुहावरे का अर्थ हमेशा केवल शब्दशः होता है।', 'भाषा में विशेष अर्थ देने वाले प्रचलित वाक्यांश को ___ कहते हैं।', 'मुहावरा'],
        ['saar-lekhan', 'सार लेखन', 'सार में मूल पाठ के मुख्य विचार संक्षेप में लिखे जाते हैं। अनावश्यक उदाहरण हटाएं और मूल अर्थ को बदले बिना अपनी भाषा में लिखें।', 'सार में मुख्य विचार संक्षेप में आते हैं।', 'सार में मूल अर्थ बदल देना चाहिए।', 'किसी पाठ के मुख्य विचारों के संक्षिप्त रूप को ___ कहते हैं।', 'सार'],
      ]),
    ],
  },
];

export function getNcertCatalog(progress = [], lang = 'en') {
  const progressByChapter = new Map(
    progress.map((entry) => [entry.chapter_key, entry])
  );
  const normalizedLang = normalizeLanguageCode(lang);

  return {
    textbookUrl: OFFICIAL_TEXTBOOKS_URL,
    classes: COURSE_DATA.map(({ grade, subjects }) => {
      let classSubjects = [...subjects];

      // If user selected one of the regional languages (e.g. Tamil, Telugu, Kannada, Malayalam, etc.)
      // show that language subject instead of / before Hindi, with Hindi as optional
      if (normalizedLang && normalizedLang !== 'hi' && normalizedLang !== 'en') {
        const regionalSubj = getRegionalLanguageSubject(grade, normalizedLang);
        if (regionalSubj) {
          const mathSubj = subjects.find((s) => s.id === 'mathematics');
          const englishSubj = subjects.find((s) => s.id === 'english');
          const hindiSubj = subjects.find((s) => s.id === 'hindi');
          const scienceSubj = subjects.find((s) => s.id === 'environment' || s.id === 'science');

          const hindiOptional = hindiSubj ? {
            ...hindiSubj,
            name: 'Hindi (Optional) / हिन्दी',
          } : null;

          classSubjects = [
            mathSubj,
            englishSubj,
            regionalSubj,
            scienceSubj,
            ...(hindiOptional ? [hindiOptional] : []),
          ].filter(Boolean);
        }
      }

      return {
        grade,
        title: `Class ${grade}`,
        subjects: classSubjects.map(({ id, name, icon, chapters }) => ({
          id,
          name,
          icon,
          chapters: chapters.map(({ id: chapterId, title }) => {
            const record = progressByChapter.get(`${grade}:${id}:${chapterId}`);
            return {
              id: chapterId,
              title,
              completed: Boolean(record?.completed),
              bestAccuracy: record?.best_accuracy || 0,
            };
          }),
        })),
      };
    }),
  };
}

export function getNcertChapter(grade, subjectId, chapterId) {
  const course = COURSE_DATA.find((item) => item.grade === Number(grade));
  let book = course?.subjects.find((item) => item.id === subjectId);
  if (!book) {
    book = getRegionalLanguageSubject(Number(grade), subjectId);
  }
  const chapter = book?.chapters.find((item) => item.id === chapterId);
  if (!course || !book || !chapter) return null;

  const distractors = book.chapters.filter((item) => item.id !== chapter.id).map((item) => item.fact);
  const choices = [chapter.fact, chapter.falseFact, ...distractors].slice(0, 4);
  const rotation = [...chapter.id].reduce((total, char) => total + char.charCodeAt(0), course.grade) % choices.length;
  const options = [...choices.slice(rotation), ...choices.slice(0, rotation)];
  const questions = [
    {
      id: 'check-understanding',
      type: 'mcq',
      prompt: `Which statement best describes “${chapter.title}”?`,
      options,
      correctIndex: options.indexOf(chapter.fact),
      explanation: chapter.fact,
    },
    {
      id: 'true-or-false',
      type: 'true_false',
      prompt: chapter.falseFact,
      correctValue: false,
      explanation: chapter.fact,
    },
    {
      id: 'fill-the-blank',
      type: 'fill_blank',
      prompt: chapter.prompt,
      correctValue: chapter.answer,
      explanation: chapter.fact,
    },
  ];

  return {
    grade: course.grade,
    classTitle: `Class ${course.grade}`,
    subject: { id: book.id, name: book.name, icon: book.icon },
    chapter: { id: chapter.id, title: chapter.title, reading: chapter.reading },
    textbookUrl: OFFICIAL_TEXTBOOKS_URL,
    questions: questions.map(({ correctIndex, correctValue, ...question }) => question),
    answers: questions.map(({ id, type, correctIndex, correctValue }) => ({
      id,
      type,
      ...(type === 'mcq' ? { correctIndex } : { correctValue }),
    })),
  };
}

export function scoreNcertQuiz(chapter, submittedAnswers) {
  const correctAnswers = new Map(chapter.answers.map((answer) => [answer.id, answer]));
  if (!Array.isArray(submittedAnswers) || submittedAnswers.length !== correctAnswers.size) {
    return { error: 'Answer every question before submitting.' };
  }
  const seen = new Set();
  for (const submitted of submittedAnswers) {
    const correct = correctAnswers.get(submitted?.questionId);
    if (!correct || seen.has(submitted.questionId)) return { error: 'Submitted answers are invalid.' };
    seen.add(submitted.questionId);
    if (correct.type === 'mcq') {
      if (!Number.isInteger(submitted.answer) || submitted.answer < 0 || submitted.answer > 3) {
        return { error: 'Choose a valid option for every multiple-choice question.' };
      }
    } else if (correct.type === 'true_false' && typeof submitted.answer !== 'boolean') {
      return { error: 'Choose true or false for every statement.' };
    } else if (correct.type === 'fill_blank' && typeof submitted.answer !== 'string') {
      return { error: 'Submitted answers are invalid.' };
    }
  }

  const results = chapter.answers.map((correct) => {
    const submitted = submittedAnswers.find((answer) => answer.questionId === correct.id);
    const isCorrect = correct.type === 'mcq'
      ? submitted.answer === correct.correctIndex
      : correct.type === 'true_false'
        ? submitted.answer === correct.correctValue
        : String(submitted.answer).trim().toLocaleLowerCase() === correct.correctValue.toLocaleLowerCase();
    return {
      questionId: correct.id,
      correct: isCorrect,
      correctAnswer: correct.type === 'mcq'
        ? chapter.questions.find((question) => question.id === correct.id).options[correct.correctIndex]
        : correct.correctValue,
    };
  });
  const score = results.filter((result) => result.correct).length;
  return {
    score,
    total: results.length,
    accuracy: Math.round((score / results.length) * 100),
    completed: score / results.length >= 0.5,
    results,
  };
}

export const NCERT_GRADES = COURSE_DATA.map((course) => course.grade);
