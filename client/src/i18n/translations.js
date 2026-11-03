import { LANGUAGES } from './languages.js';
import en from './locales/en.js';
import hi from './locales/hi.js';
import bn from './locales/bn.js';
import te from './locales/te.js';
import mr from './locales/mr.js';
import ta from './locales/ta.js';
import gu from './locales/gu.js';
import kn from './locales/kn.js';
import ml from './locales/ml.js';
import or from './locales/or.js';
import pa from './locales/pa.js';
import ur from './locales/ur.js';
import as from './locales/as.js';
import mai from './locales/mai.js';
import bho from './locales/bho.js';
import sa from './locales/sa.js';
import ne from './locales/ne.js';
import ks from './locales/ks.js';

export { LANGUAGES };

export const translations = {
  en, hi, bn, te, mr, ta, gu, kn, ml, or, pa, ur, as, mai, bho, sa, ne, ks,
};

export function getTranslation(lang, key) {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}
