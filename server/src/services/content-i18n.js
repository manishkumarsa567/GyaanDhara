import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { geminiTranslateBatch, isGeminiConfigured, LANG_NAMES } from './gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '../../data/content-i18n');
const CACHE_VERSION = '1.0';

function readStore(lang) {
  const file = path.join(CACHE_DIR, `${lang}.json`);
  if (!existsSync(file)) return { version: CACHE_VERSION, data: {} };
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    if (parsed.version === CACHE_VERSION) return parsed;
  } catch { /* ignore */ }
  return { version: CACHE_VERSION, data: {} };
}

function writeStore(lang, store) {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(path.join(CACHE_DIR, `${lang}.json`), JSON.stringify(store, null, 0));
}

/** Translate a map of id -> { field: text } using Gemini + file cache */
export async function translateEntityMap(lang, namespace, entities, fields) {
  if (lang === 'en') return entities;

  const store = readStore(lang);
  if (!store.data[namespace]) store.data[namespace] = {};

  const result = entities.map((entity) => {
    const cached = store.data[namespace][String(entity.id)];
    if (cached) {
      const out = { ...entity };
      fields.forEach((f) => { if (cached[f]) out[f] = cached[f]; });
      return out;
    }
    return entity;
  });

  const toTranslate = {};
  entities.forEach((entity) => {
    const id = String(entity.id);
    if (store.data[namespace][id]) return;
    fields.forEach((f) => {
      if (entity[f]) toTranslate[`${namespace}.${id}.${f}`] = entity[f];
    });
  });

  if (Object.keys(toTranslate).length === 0) return result;

  if (!isGeminiConfigured()) {
    if (lang === 'hi') {
      return entities.map((e) => ({
        ...e,
        name: e.name_hi || e.name,
      }));
    }
    return entities;
  }

  try {
    const translated = await geminiTranslateBatch(toTranslate, lang);
    entities.forEach((entity) => {
      const id = String(entity.id);
      if (!store.data[namespace][id]) store.data[namespace][id] = {};
      fields.forEach((f) => {
        const key = `${namespace}.${id}.${f}`;
        if (translated[key]) store.data[namespace][id][f] = translated[key];
      });
    });
    writeStore(lang, store);

    return entities.map((entity) => {
      const cached = store.data[namespace][String(entity.id)] || {};
      const out = { ...entity };
      fields.forEach((f) => { if (cached[f]) out[f] = cached[f]; });
      return out;
    });
  } catch (err) {
    console.warn(`Content translation failed (${namespace}/${lang}):`, err.message);
    if (lang === 'hi') {
      return entities.map((e) => ({ ...e, name: e.name_hi || e.name }));
    }
    return entities;
  }
}

export async function translateLessonChapters(lessonId, chapters, lang) {
  if (lang === 'en') return { chapters, translated: true };

  const store = readStore(lang);
  const namespace = 'chapter_content';
  if (!store.data[namespace]) store.data[namespace] = {};
  const lessonCache = store.data[namespace][String(lessonId)] || {};
  const fields = ['title', 'reading', 'example', 'tryIt', 'takeaway'];
  const strings = {};

  chapters.forEach((chapter, index) => {
    fields.forEach((field) => {
      const key = `chapter${index}.${field}`;
      if (chapter[field] && !lessonCache[key]) strings[key] = chapter[field];
    });
  });

  if (Object.keys(strings).length && isGeminiConfigured()) {
    try {
      const translated = await geminiTranslateBatch(strings, lang);
      Object.entries(translated).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() && value !== strings[key]) {
          lessonCache[key] = value;
        }
      });
      if (Object.keys(lessonCache).length) {
        store.data[namespace][String(lessonId)] = lessonCache;
        writeStore(lang, store);
      }
    } catch (err) {
      console.warn(`Chapter translation failed (lesson ${lessonId}/${lang}):`, err.message);
    }
  }

  const result = chapters.map((chapter, index) => {
    const translatedChapter = { ...chapter };
    fields.forEach((field) => {
      const value = lessonCache[`chapter${index}.${field}`];
      if (value) translatedChapter[field] = value;
    });
    return translatedChapter;
  });
  const translated = chapters.every((chapter, index) =>
    fields.every((field) => !chapter[field] || result[index][field] !== chapter[field])
  );
  return { chapters: result, translated };
}

export async function translateQuizQuestions(questions, lang) {
  if (lang === 'en') return questions;

  const strings = {};
  questions.forEach((q) => {
    strings[`q${q.id}.question`] = q.question;
    if (q.explanation) strings[`q${q.id}.explanation`] = q.explanation;
    if (q.hint) strings[`q${q.id}.hint`] = q.hint;
    (q.options || []).forEach((opt, i) => {
      strings[`q${q.id}.opt${i}`] = opt;
    });
  });

  if (!isGeminiConfigured()) return questions;

  try {
    const translated = await geminiTranslateBatch(strings, lang);
    return questions.map((q) => ({
      ...q,
      question: translated[`q${q.id}.question`] || q.question,
      explanation: translated[`q${q.id}.explanation`] || q.explanation,
      hint: translated[`q${q.id}.hint`] || q.hint,
      options: (q.options || []).map((opt, i) => translated[`q${q.id}.opt${i}`] || opt),
    }));
  } catch {
    return questions;
  }
}

export async function translateGameContent(content, lang) {
  if (lang === 'en' || !content || !content.data) return content;
  if (!isGeminiConfigured()) return content;

  const strings = {};
  const engine = content.engine;
  const data = content.data;
  if (content.intro) strings.intro = content.intro;

  if (Array.isArray(data)) {
    data.forEach((item, idx) => {
      if (item.q) strings[`i_${idx}_q`] = item.q;
      if (item.story) strings[`i_${idx}_story`] = item.story;
      if (item.feedback) strings[`i_${idx}_feedback`] = item.feedback;
      if (Array.isArray(item.options) && content.mode !== 'language') {
        item.options.forEach((opt, oi) => { strings[`i_${idx}_opt_${oi}`] = opt; });
      }
      if (item.term) strings[`i_${idx}_term`] = item.term;
      if (item.match) strings[`i_${idx}_match`] = item.match;
      if (item.word) strings[`i_${idx}_word`] = item.word;
      if (engine === 'scramble' && item.answer) strings[`i_${idx}_answer`] = item.answer;
      if (item.hint) strings[`i_${idx}_hint`] = item.hint;
      if (item.text) strings[`i_${idx}_text`] = item.text;
      if (item.prompt) strings[`i_${idx}_prompt`] = item.prompt;
      if (item.front) strings[`i_${idx}_front`] = item.front;
      if (item.back) strings[`i_${idx}_back`] = item.back;
      if (item.left) strings[`i_${idx}_left`] = item.left;
      if (item.right) strings[`i_${idx}_right`] = item.right;
    });
  }

  if (Object.keys(strings).length === 0) return content;

  try {
    const translated = await geminiTranslateBatch(strings, lang);
    const updatedData = data.map((item, idx) => {
      const out = { ...item };
      if (out.q && translated[`i_${idx}_q`]) out.q = translated[`i_${idx}_q`];
      if (out.story && translated[`i_${idx}_story`]) out.story = translated[`i_${idx}_story`];
      if (out.feedback && translated[`i_${idx}_feedback`]) out.feedback = translated[`i_${idx}_feedback`];
      if (Array.isArray(out.options) && content.mode !== 'language') {
        out.options = out.options.map((opt, oi) => translated[`i_${idx}_opt_${oi}`] || opt);
      }
      if (out.term && translated[`i_${idx}_term`]) out.term = translated[`i_${idx}_term`];
      if (out.match && translated[`i_${idx}_match`]) out.match = translated[`i_${idx}_match`];
      if (out.word && translated[`i_${idx}_word`]) out.word = translated[`i_${idx}_word`];
      if (engine === 'scramble' && out.answer && translated[`i_${idx}_answer`]) out.answer = translated[`i_${idx}_answer`];
      if (out.hint && translated[`i_${idx}_hint`]) out.hint = translated[`i_${idx}_hint`];
      if (out.text && translated[`i_${idx}_text`]) out.text = translated[`i_${idx}_text`];
      if (out.prompt && translated[`i_${idx}_prompt`]) out.prompt = translated[`i_${idx}_prompt`];
      if (out.front && translated[`i_${idx}_front`]) out.front = translated[`i_${idx}_front`];
      if (out.back && translated[`i_${idx}_back`]) out.back = translated[`i_${idx}_back`];
      if (out.left && translated[`i_${idx}_left`]) out.left = translated[`i_${idx}_left`];
      if (out.right && translated[`i_${idx}_right`]) out.right = translated[`i_${idx}_right`];
      return out;
    });
    return { ...content, intro: translated.intro || content.intro, data: updatedData };
  } catch (err) {
    console.warn('Game content translation failed:', err.message);
    return content;
  }
}

export async function translateGameManual(manual, lang) {
  if (lang === 'en' || !manual) return manual;
  if (!isGeminiConfigured()) return manual;

  const strings = {
    title: manual.title,
    tip: manual.tip,
  };
  manual.steps.forEach((step, i) => { strings[`step_${i}`] = step; });

  try {
    const translated = await geminiTranslateBatch(strings, lang);
    return {
      ...manual,
      title: translated.title || manual.title,
      tip: translated.tip || manual.tip,
      steps: manual.steps.map((step, i) => translated[`step_${i}`] || step),
      fallback: false,
    };
  } catch {
    return manual;
  }
}

export { LANG_NAMES };
