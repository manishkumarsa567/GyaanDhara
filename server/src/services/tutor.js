/** AI-enhanced tutor: Gemini first, then OpenAI, then rule-based multilingual */
import { geminiTutorChat, isGeminiConfigured } from './gemini.js';
import { detectTopic, ruleBasedReplyI18n, SUPPORTED_TUTOR_LANGS } from './tutor-i18n.js';
import { buildLocalTutorGuidance, getLocalFallbackExample } from './tutor-context.js';

const LANG_NAMES = {
  en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu', mr: 'Marathi', ta: 'Tamil',
  gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', or: 'Odia', pa: 'Punjabi', ur: 'Urdu',
  as: 'Assamese', mai: 'Maithili', bho: 'Bhojpuri', sa: 'Sanskrit', ne: 'Nepali', ks: 'Kashmiri',
};

function normalizeLang(lang) {
  if (!lang) return 'en';
  const l = String(lang).toLowerCase().trim();
  if (LANG_NAMES[l]) return l;
  const two = l.slice(0, 2);
  if (LANG_NAMES[two]) return two;
  return 'en';
}

export async function openAiTutorChat(message, userContext, userLang) {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey) return null;

  const langName = LANG_NAMES[userLang] || 'English';
  const systemPrompt = `You are GyaanDhara AI Tutor, a highly knowledgeable, friendly, encouraging, and accurate educational mentor for students across India.
Your top priority is to provide 100% accurate, clear, and educational answers to every student question without any mistakes.

CRITICAL LANGUAGE INSTRUCTIONS:
1. ALWAYS respond in the EXACT same language that the student wrote their question in:
   - If the student asks in English, reply in English.
   - If the student asks in Hindi (हिन्दी or Hinglish), reply in natural, clear Hindi.
   - If the student asks in Bengali, Telugu, Tamil, Marathi, Kannada, Gujarati, Malayalam, Odia, Punjabi, Urdu, Assamese, etc., reply in that exact language.
   - If the question language is ambiguous, reply in ${langName} (${userLang}).

CRITICAL ACCURACY & CONTENT INSTRUCTIONS:
1. Mathematical & Factual Correctness: Double-check all arithmetic, scientific facts, and logic. Never produce wrong calculations or hallucinate answers.
2. Step-by-Step Explanations:
   - When asked how to solve a problem (e.g. "how can i multiply 2 number"), give a friendly, clear, step-by-step tutorial with concrete examples (e.g. 12 × 5 = 60, column method, repeated addition).
   - If asked about live or real-time measurements (e.g. "current temperature in banglore"), accurately explain that while you do not have live IoT weather station sensors connected to provide the minute-by-minute live reading, Bangalore's typical pleasant climate ranges between 18°C to 28°C, and explain how temperature and climate work.
3. Tone: Warm, respectful, inspiring, and patient (like a caring teacher / Guruji).
4. Formatting: Use neat markdown with bullet points or numbered steps for readability. Keep answers focused (between 100 and 250 words).

LOCAL LEARNING CONTEXT:
${buildLocalTutorGuidance(userContext, userLang)}`;

  const candidateModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
  for (const model of candidateModels) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 450,
          temperature: 0.4,
        }),
      });
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      }
    } catch (err) {
      console.warn(`OpenAI ${model} call failed:`, err.message);
    }
  }
  return null;
}

export async function getTutorResponse(message, userContext, lang = 'en') {
  const userLang = normalizeLang(lang);

  // 1. Try Gemini first (with high-availability flash-lite candidate models)
  if (isGeminiConfigured()) {
    try {
      const reply = await geminiTutorChat(message, userContext, userLang);
      if (reply) return reply;
    } catch (err) {
      console.warn('Gemini tutor chat failed:', err.message);
    }
  }

  // 2. Try OpenAI second (with user-provided OpenAI key and candidate models)
  try {
    const openAiReply = await openAiTutorChat(message, userContext, userLang);
    if (openAiReply) return openAiReply;
  } catch (err) {
    console.warn('OpenAI tutor chat failed:', err.message);
  }

  // 3. Fallback to enhanced rule-based / arithmetic solver engine
  const reply = ruleBasedReplyI18n(message, userContext, userLang);
  const localExample = getLocalFallbackExample(userContext, userLang, detectTopic(message));
  return localExample ? `${reply}\n\n${localExample}` : reply;
}
