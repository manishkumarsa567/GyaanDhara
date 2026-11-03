import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LANGUAGES } from '../i18n/languages.js';
import en from '../i18n/locales/en.js';
import hi from '../i18n/locales/hi.js';
import bn from '../i18n/locales/bn.js';
import te from '../i18n/locales/te.js';
import mr from '../i18n/locales/mr.js';
import ta from '../i18n/locales/ta.js';
import gu from '../i18n/locales/gu.js';
import kn from '../i18n/locales/kn.js';
import ml from '../i18n/locales/ml.js';
import orLocale from '../i18n/locales/or.js';
import pa from '../i18n/locales/pa.js';
import ur from '../i18n/locales/ur.js';
import asLocale from '../i18n/locales/as.js';
import mai from '../i18n/locales/mai.js';
import bho from '../i18n/locales/bho.js';
import sa from '../i18n/locales/sa.js';
import ne from '../i18n/locales/ne.js';
import ks from '../i18n/locales/ks.js';
import { api } from '../api.js';

const STATIC_LOCALES = {
  en,
  hi,
  bn,
  te,
  mr,
  ta,
  gu,
  kn,
  ml,
  or: orLocale,
  pa,
  ur,
  as: asLocale,
  mai,
  bho,
  sa,
  ne,
  ks,
};

const LanguageContext = createContext(null);

export const I18N_VERSION = '3.20';
const CACHE_PREFIX = 'gd_i18n_';
const RTL_LANGUAGES = new Set(['ur', 'ks']);
const localeRequests = new Map();

function isSupportedLanguage(lang) {
  return LANGUAGES.some((language) => language.code === lang);
}

function getStoredLanguage() {
  const stored = localStorage.getItem('lang');
  return isSupportedLanguage(stored) ? stored : 'en';
}

function getLocale(lang) {
  if (!localeRequests.has(lang)) {
    const request = api.getLocale(lang, false).finally(() => localeRequests.delete(lang));
    localeRequests.set(lang, request);
  }
  return localeRequests.get(lang);
}

function readLocalCache(lang) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${lang}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version === I18N_VERSION && parsed.locale) return parsed.locale;
  } catch { /* ignore */ }
  return null;
}

function writeLocalCache(lang, locale) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${lang}`, JSON.stringify({ version: I18N_VERSION, locale }));
  } catch { /* ignore */ }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getStoredLanguage);
  const [dictionary, setDictionary] = useState(() => {
    const initial = getStoredLanguage();
    const cached = readLocalCache(initial);
    return { ...en, ...(STATIC_LOCALES[initial] || {}), ...(cached || {}) };
  });

  // Switch language instantly in memory
  const setLanguage = useCallback((code) => {
    if (!isSupportedLanguage(code)) return;
    setLangState(code);
    localStorage.setItem('lang', code);
    document.documentElement.lang = code;
    document.documentElement.dir = RTL_LANGUAGES.has(code) ? 'rtl' : 'ltr';

    const localStatic = STATIC_LOCALES[code] || en;
    const cached = readLocalCache(code);
    const merged = { ...en, ...localStatic, ...(cached || {}) };
    setDictionary(merged);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);

    const localStatic = STATIC_LOCALES[lang] || en;
    const cached = readLocalCache(lang);
    setDictionary({ ...en, ...localStatic, ...(cached || {}) });

    if (lang === 'en') return undefined;

    let active = true;
    getLocale(lang)
      .then(({ locale }) => {
        if (!active || !locale || typeof locale !== 'object') return;
        const updated = { ...en, ...localStatic, ...locale };
        setDictionary(updated);
        writeLocalCache(lang, updated);
      })
      .catch((error) => {
        if (active) console.warn(`Failed to load ${lang} translations:`, error);
      });

    return () => {
      active = false;
    };
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      let text = dictionary[key] ?? en[key] ?? key;
      if (vars && typeof text === 'string') {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [dictionary]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t, languages: LANGUAGES, loading: false, dictionary }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
