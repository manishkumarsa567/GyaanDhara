import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { geminiTranslateBatch, isGeminiConfigured } from './gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '../../data/i18n-cache');
const LOCALE_DIR = path.join(__dirname, '../../../client/src/i18n/locales');

export const I18N_VERSION = '3.9';

const STATIC_LOCALES = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'ur', 'as', 'mai', 'bho', 'sa', 'ne', 'ks'];

let enBase = null;

async function loadEnBase() {
  if (enBase) return enBase;
  const enPath = path.join(LOCALE_DIR, 'en.js');
  const mod = await import(pathToFileURL(enPath).href);
  enBase = mod.default;
  return enBase;
}

async function loadStaticPartial(lang) {
  if (lang === 'en') return null;
  const filePath = path.join(LOCALE_DIR, `${lang}.js`);
  if (!existsSync(filePath)) return null;
  try {
    const mod = await import(pathToFileURL(filePath).href);
    return mod.default;
  } catch {
    return null;
  }
}

function readCache(lang) {
  const file = path.join(CACHE_DIR, `${lang}.json`);
  if (!existsSync(file)) return null;
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    if (data.version === I18N_VERSION) return data.locale;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(lang, locale) {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(
    path.join(CACHE_DIR, `${lang}.json`),
    JSON.stringify({ version: I18N_VERSION, locale, updatedAt: new Date().toISOString() }, null, 0)
  );
}

const NEVER_TRANSLATE = new Set(['appName', 'appTagline', 'dash_xp', 'leaderboard_xp', 'login_email_ph']);

function keysNeedingTranslation(en, merged, lang) {
  return Object.keys(en).filter((k) => {
    if (NEVER_TRANSLATE.has(k)) return false;
    if (!merged[k]) return true;
    if (merged[k] === en[k]) return true;
    return false;
  });
}

export async function getFullLocale(lang) {
  const code = STATIC_LOCALES.includes(lang) ? lang : 'en';
  const en = await loadEnBase();

  if (code === 'en') {
    return { locale: en, source: 'base', gemini: false };
  }

  const cached = readCache(code);
  const partial = await loadStaticPartial(code);
  let merged = { ...en, ...(partial || {}), ...(cached || {}) };

  const missing = keysNeedingTranslation(en, merged, code);

  if (missing.length === 0) {
    return { locale: merged, source: cached ? 'cache' : 'static', gemini: false };
  }

  const toTranslate = Object.fromEntries(missing.map((k) => [k, en[k]]));

  if (isGeminiConfigured() && Object.keys(toTranslate).length > 0) {
    try {
      const translated = await geminiTranslateBatch(toTranslate, code);
      merged = { ...merged, ...translated };
      writeCache(code, merged);
      return { locale: merged, source: 'gemini', gemini: true };
    } catch (err) {
      console.warn(`Gemini translation failed for ${code}:`, err.message);
    }
  }

  return { locale: merged, source: partial ? 'partial' : 'fallback', gemini: false };
}

export async function refreshLocale(lang) {
  const file = path.join(CACHE_DIR, `${lang}.json`);
  if (existsSync(file)) {
    try { unlinkSync(file); } catch { /* ignore */ }
  }
  return getFullLocale(lang);
}
