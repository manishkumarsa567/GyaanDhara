import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { geminiTranslateBatch, isGeminiConfigured } from '../src/services/gemini.js';
import { I18N_VERSION } from '../src/services/i18n-service.js';
import { LANGUAGES } from '../../client/src/i18n/languages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '../data/i18n-cache');
const LOCALE_DIR = path.join(__dirname, '../../client/src/i18n/locales');

const ALL_LANGUAGES = LANGUAGES.map(({ code }) => code).filter((code) => code !== 'en');

const NEVER_TRANSLATE = new Set(['appName']);
const ALLOWED_ENGLISH_KEYS = new Set(['appTagline', 'dash_xp', 'leaderboard_xp', 'login_email_ph']);
const FORCE_TRANSLATE = new Set(['lesson_chapters', 'lesson_chapter_label']);

async function run() {
  console.log('Loading en.js base...');
  const enMod = await import(pathToFileURL(path.join(LOCALE_DIR, 'en.js')).href);
  const en = enMod.default;
  const totalKeys = Object.keys(en).length;
  console.log(`Base has ${totalKeys} keys.`);

  mkdirSync(CACHE_DIR, { recursive: true });

  for (const lang of ALL_LANGUAGES) {
    console.log(`\n--- Processing ${lang} ---`);
    let existing = {};

    // Check disk cache first
    const cacheFile = path.join(CACHE_DIR, `${lang}.json`);
    if (existsSync(cacheFile)) {
      try {
        const d = JSON.parse(readFileSync(cacheFile, 'utf8'));
        if (d.version === I18N_VERSION && d.locale) existing = { ...d.locale };
      } catch (e) {
        console.warn(`Error reading ${cacheFile}:`, e.message);
      }
    }

    // Check static js
    const jsFile = path.join(LOCALE_DIR, `${lang}.js`);
    if (existsSync(jsFile)) {
      try {
        const mod = await import(pathToFileURL(jsFile).href);
        existing = { ...(mod.default || {}), ...existing };
      } catch (e) {
        console.warn(`Error reading ${jsFile}:`, e.message);
      }
    }

    let merged = { ...en, ...existing };

    // Find missing keys
    let missingKeys = Object.keys(en).filter((key) =>
      !NEVER_TRANSLATE.has(key) &&
      !ALLOWED_ENGLISH_KEYS.has(key) &&
      (!merged[key] || merged[key] === en[key] || FORCE_TRANSLATE.has(key))
    );

    console.log(`${lang}: ${missingKeys.length} keys need translation (already has ${totalKeys - missingKeys.length}).`);

    if (missingKeys.length > 0 && !isGeminiConfigured()) {
      throw new Error(`Gemini is not configured; cannot complete ${lang} translations.`);
    }

    for (let attempt = 1; missingKeys.length > 0 && attempt <= 3; attempt += 1) {
      const toTranslate = Object.fromEntries(missingKeys.map((key) => [key, en[key]]));
      console.log(`Translation attempt ${attempt}: ${missingKeys.length} keys via Gemini for ${lang}...`);
      const translated = await geminiTranslateBatch(toTranslate, lang);
      const expectedTranslations = Object.fromEntries(
        Object.entries(translated).filter(([key]) => missingKeys.includes(key))
      );
      merged = { ...merged, ...expectedTranslations };
      missingKeys = Object.keys(en).filter((key) =>
        !NEVER_TRANSLATE.has(key) &&
        !ALLOWED_ENGLISH_KEYS.has(key) &&
        (!merged[key] || merged[key] === en[key])
      );
    }

    const incomplete = Object.keys(en).filter((key) => {
      const value = merged[key];
      return typeof value !== 'string' || !value.trim() ||
        (!NEVER_TRANSLATE.has(key) && !ALLOWED_ENGLISH_KEYS.has(key) && value === en[key]);
    });
    if (incomplete.length > 0) {
      throw new Error(`${lang} still has untranslated or empty entries: ${incomplete.join(', ')}`);
    }

    // Always ensure appName is GyaanDhara
    merged.appName = 'GyaanDhara';
    merged = Object.fromEntries(Object.keys(en).map((key) => [key, merged[key]]));

    // Write to server cache
    writeFileSync(
      cacheFile,
      JSON.stringify({ version: I18N_VERSION, locale: merged, updatedAt: new Date().toISOString() }, null, 2),
      'utf8'
    );

    // Write to client static locale .js file
    const jsContent = `export default ${JSON.stringify(merged, null, 2)};\n`;
    writeFileSync(jsFile, jsContent, 'utf8');

    console.log(`Saved ${lang}: ${Object.keys(merged).length} keys in cache and client locale file.`);
  }

  console.log('\nAll 18 languages precompiled successfully!');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
