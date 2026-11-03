import { buildLocalTutorGuidance } from './tutor-context.js';

const DEFAULT_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function getApiKey() {
  return process.env.GEMINI_API_KEY || DEFAULT_API_KEY;
}

const CANDIDATE_MODELS = [
  ...new Set([
    process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
  ]),
];

export async function geminiGenerate(prompt, systemInstruction = '') {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 16384 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await fetch(
        `${API_BASE}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.warn(`Gemini ${model} HTTP ${res.status}:`, data?.error?.message);
        continue;
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    } catch (err) {
      console.warn(`Gemini request failed on ${model}:`, err.message);
    }
  }

  return null;
}

/** Parse JSON from Gemini response (handles markdown fences) */
export function parseJsonFromGemini(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

const LANG_NAMES = {
  en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu', mr: 'Marathi', ta: 'Tamil',
  gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', or: 'Odia', pa: 'Punjabi', ur: 'Urdu',
  as: 'Assamese', mai: 'Maithili', bho: 'Bhojpuri', sa: 'Sanskrit', ne: 'Nepali', ks: 'Kashmiri',
};

/** Batch-translate UI strings via Gemini */
export async function geminiTranslateBatch(stringsObj, targetLang) {
  if (targetLang === 'en') return stringsObj;

  const langName = LANG_NAMES[targetLang] || targetLang;
  const keys = Object.keys(stringsObj);
  const result = {};
  const CHUNK = 40;

  for (let i = 0; i < keys.length; i += CHUNK) {
    const chunkKeys = keys.slice(i, i + CHUNK);
    const chunk = Object.fromEntries(chunkKeys.map((k) => [k, stringsObj[k]]));
    const prompt = `Translate every JSON value below to ${langName} (${targetLang}).
Rules:
- Keep JSON keys exactly unchanged
- Translate ALL string values naturally for rural Indian students
- Keep brand names unchanged: GyaanDhara, XP, AI, OTP, JWT
- Keep email placeholders like you@example.com unchanged
- Return ONLY valid JSON object, no markdown fences

${JSON.stringify(chunk)}`;

    const raw = await geminiGenerate(
      prompt,
      'You are a professional translator for Indian educational software. Output valid JSON only with the same keys as input.'
    );
    const parsed = parseJsonFromGemini(raw);
    if (parsed && typeof parsed === 'object') {
      Object.assign(result, parsed);
    } else {
      chunkKeys.forEach((k) => { result[k] = stringsObj[k]; });
    }
  }

  keys.forEach((k) => {
    if (!result[k]) result[k] = stringsObj[k];
  });
  return result;
}

/** Tutor chat via Gemini */
export async function geminiTutorChat(message, userContext, lang = 'en') {
  const langName = LANG_NAMES[lang] || 'English';
  const system = `You are GyaanDhara AI Tutor, a highly knowledgeable, friendly, encouraging, and accurate educational mentor for students across India.
Your top priority is to provide 100% accurate, clear, and educational answers to every student question without any mistakes.

CRITICAL LANGUAGE INSTRUCTIONS:
1. ALWAYS respond in the EXACT same language that the student wrote their question in:
   - If the student asks in English, reply in English.
   - If the student asks in Hindi (हिन्दी or Hinglish), reply in natural, clear Hindi.
   - If the student asks in Bengali, Telugu, Tamil, Marathi, Kannada, Gujarati, Malayalam, Odia, Punjabi, Urdu, Assamese, etc., reply in that exact language.
   - If the student's question language cannot be determined (e.g. single number or symbol), reply in ${langName} (${lang}).

CRITICAL ACCURACY & CONTENT INSTRUCTIONS:
1. Mathematical & Factual Correctness: Double-check all arithmetic, scientific facts, and logic. Never produce wrong calculations or hallucinate answers.
2. Step-by-Step Explanations:
   - When asked how to solve a problem (e.g. "how can i multiply 2 number"), give a friendly, clear, step-by-step tutorial with concrete examples (e.g. 12 × 5 = 60, column method, repeated addition).
   - If asked about live or real-time measurements (e.g. "current temperature in banglore"), accurately explain that while you do not have live IoT weather station sensors connected to provide the minute-by-minute live reading, Bangalore's typical pleasant climate ranges between 18°C to 28°C, and explain how temperature and climate work.
3. Tone: Warm, respectful, inspiring, and patient (like a caring teacher / Guruji).
4. Formatting: Use neat markdown with bullet points or numbered steps for readability. Keep answers focused (between 100 and 250 words).

LOCAL LEARNING CONTEXT:
${buildLocalTutorGuidance(userContext, lang)}`;

  const prompt = `Student Question: ${message}`;
  return geminiGenerate(prompt, system);
}

export function isGeminiConfigured() {
  return Boolean(getApiKey());
}

export { LANG_NAMES };
