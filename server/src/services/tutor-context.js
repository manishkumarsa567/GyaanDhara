const DISTRICT_REGIONS = new Map([
  ...['araria', 'arwal', 'aurangabad', 'banka', 'begusarai', 'bhagalpur', 'bhojpur', 'buxar', 'darbhanga', 'east champaran', 'purvi champaran', 'gopalganj', 'gaya', 'jamui', 'jehanabad', 'kaimur', 'katihar', 'khagaria', 'kishanganj', 'lakhisarai', 'madhepura', 'madhubani', 'munger', 'muzaffarpur', 'nalanda', 'nawada', 'patna', 'purnia', 'purnea', 'rohtas', 'saharsa', 'samastipur', 'saran', 'sheikhpura', 'sheohar', 'sitamarhi', 'siwan', 'supaul', 'vaishali', 'west champaran', 'paschim champaran'].map((district) => [district, 'Bihar']),
  ...['ajmer', 'alwar', 'banswara', 'baran', 'barmer', 'bharatpur', 'bhilwara', 'bikaner', 'bundi', 'chittorgarh', 'churu', 'dausa', 'dholpur', 'dungarpur', 'hanumangarh', 'jaipur', 'jaisalmer', 'jalore', 'jhalawar', 'jhunjhunu', 'jodhpur', 'karauli', 'kota', 'nagaur', 'pali', 'pratapgarh', 'rajsamand', 'sawai madhopur', 'sikar', 'sirohi', 'sri ganganagar', 'tonk', 'udaipur'].map((district) => [district, 'Rajasthan']),
  ...['ayodhya', 'ambedkar nagar', 'amethi', 'barabanki', 'faizabad', 'gonda', 'hardoi', 'kanpur dehat', 'lucknow', 'rae bareli', 'raebareli', 'sitapur', 'sultanpur', 'unnao'].map((district) => [district, 'Awadh region']),
]);

const REGIONAL_EXAMPLES = {
  Bihar: {
    en: 'For a familiar example, compare the number or weight of grain sacks at a village market.',
    hi: 'एक परिचित उदाहरण लें: गाँव के बाज़ार में अनाज की बोरियों की संख्या या वज़न की तुलना करें।',
    bho: 'एक आसान उदाहरण लीं: गाँव के हाट में अनाज के बोरा के गिनती भा वजन के तुलना करीं।',
  },
  Rajasthan: {
    en: 'For a familiar example, compare water stored for crops or grain quantities at a local market.',
    hi: 'एक परिचित उदाहरण लें: फसल के लिए जमा पानी या स्थानीय बाज़ार में अनाज की मात्रा की तुलना करें।',
    bho: 'एक आसान उदाहरण लीं: फसल खातिर रखल पानी भा हाट में अनाज के मात्रा के तुलना करीं।',
  },
  'Awadh region': {
    en: 'For a familiar example, compare crop quantities or prices at a nearby weekly market.',
    hi: 'एक परिचित उदाहरण लें: पास के साप्ताहिक बाज़ार में फसल की मात्रा या कीमत की तुलना करें।',
    bho: 'एक आसान उदाहरण लीं: लगे के हाट में फसल के मात्रा भा दाम के तुलना करीं।',
  },
};

function normalizeDistrict(district) {
  return String(district || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');
}

function supportedLanguage(lang) {
  const normalized = String(lang || 'en').toLocaleLowerCase().split(/[-_]/)[0];
  return ['en', 'hi', 'bho'].includes(normalized) ? normalized : 'en';
}

export function getLearnerRegion(userContext = {}) {
  return DISTRICT_REGIONS.get(normalizeDistrict(userContext.district)) || null;
}

export function buildLocalTutorGuidance(userContext = {}, lang = 'en') {
  const region = getLearnerRegion(userContext);
  const language = supportedLanguage(lang);
  const dialectGuidance = language === 'bho'
    ? 'Reply in clear, respectful Bhojpuri when possible. Keep technical terms clear, and do not invent dialect words.'
    : 'Use the selected language. If the learner explicitly asks for Awadhi, Rajasthani, or another regional dialect, use it only when confident; otherwise use simple Hindi and invite correction.';

  if (!region) {
    return `Use familiar village-life examples when helpful, such as crops, irrigation, grain measures, or a weekly market. Do not guess the learner's state, district, customs, or dialect. ${dialectGuidance}`;
  }

  return `The learner's profile district maps to the broad region ${region}. Use this only to choose optional, relatable examples; do not mention or infer their exact district, village, identity, customs, or dialect. Prefer accurate examples about ${region === 'Rajasthan' ? 'water conservation, crops, and local market quantities' : region === 'Bihar' ? 'grain sacks, crop quantities, and village market prices' : 'crop quantities and weekly market prices'}. Keep examples optional and relevant to the question. ${dialectGuidance}`;
}

export function getLocalFallbackExample(userContext = {}, lang = 'en', topic = '') {
  const region = getLearnerRegion(userContext);
  if (!region || !['multiplication', 'fractions', 'algebra', 'default'].includes(topic)) return '';
  return REGIONAL_EXAMPLES[region][supportedLanguage(lang)] || REGIONAL_EXAMPLES[region].en;
}
