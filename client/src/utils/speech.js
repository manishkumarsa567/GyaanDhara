export const SPEECH_LOCALES = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  pa: 'pa-IN',
  ur: 'ur-IN',
  as: 'as-IN',
  mai: 'hi-IN',
  bho: 'hi-IN',
  sa: 'hi-IN',
  ne: 'ne-NP',
  ks: 'ur-IN',
};

export function getSpeechLocale(language) {
  return SPEECH_LOCALES[language] || SPEECH_LOCALES.en;
}

export function getSpeechRecognitionConstructor(scope = globalThis) {
  return scope.SpeechRecognition || scope.webkitSpeechRecognition || null;
}
