import { useLanguage } from '../context/LanguageContext';
import './LanguageSwitcher.css';

export default function LanguageSwitcher({ variant = 'default' }) {
  const { lang, setLanguage, languages, t } = useLanguage();

  return (
    <div className={`lang-switcher lang-switcher--${variant}`}>
      <label htmlFor="lang-select" className="lang-label">
        🌐 {t('language')}
      </label>
      <select
        id="lang-select"
        className="lang-select"
        value={lang}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label={t('language')}
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </div>
  );
}
