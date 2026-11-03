import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Landing.css';

const SUBJECT_TRACKS = [
  { id: 'math', label: 'cat_math', icon: '📐', prompt: 'tutor_q1', art: ['½', '+ ¼', '= ¾'] },
  { id: 'science', label: 'cat_science', icon: '🔬', prompt: 'tutor_q2', art: ['☀️', '🌱', '💧'] },
  { id: 'english', label: 'cat_english', icon: '📖', prompt: 'tutor_q3', art: ['A', 'B', 'C'] },
  { id: 'digital', label: 'cat_digital', icon: '💻', prompt: 'tutor_q4', art: ['🔒', '✓', '🌐'] },
  { id: 'logic', label: 'cat_logic', icon: '🧩', prompt: 'tutor_q5', art: ['2', '4', '8'] },
  { id: 'social', label: 'cat_social', icon: '🌾', prompt: 'tutor_q2', art: ['🏡', '🌿', '☀️'] },
  { id: 'language', label: 'cat_language', icon: '🗣️', prompt: 'tutor_q3', art: ['अ', 'A', 'அ'] },
];

export default function Landing() {
  const { t, lang, languages } = useLanguage();
  const [activeTrack, setActiveTrack] = useState(SUBJECT_TRACKS[0].id);
  const selectedTrack = SUBJECT_TRACKS.find((track) => track.id === activeTrack) || SUBJECT_TRACKS[0];

  return (
    <div className="landing">
      <header className="landing-topbar">
        <div className="container landing-topbar-inner">
          <Link to="/" className="landing-logo" aria-label={t('appName')}>
            <span className="landing-logo-icon" aria-hidden="true">✳</span>
            <span>{t('appName')}</span>
          </Link>
          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#features">{t('landing_why')}</a>
            <a href="#subjects">{t('landing_subjects')}</a>
            <Link to="/login">{t('landing_login')}</Link>
            <Link
              to="/register"
              className="landing-nav-cta"
              aria-label={t('landing_start')}
            >
              <span className="landing-nav-cta-label">{t('landing_start')}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </nav>
          <div className="landing-language">
            <LanguageSwitcher variant="auth" />
          </div>
        </div>
      </header>

      <main>
      <section className="landing-hero">
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-eyebrow">
              <span className="hero-status-dot" aria-hidden="true" />
              {t('landing_feat1_title')} <span aria-hidden="true">·</span> {t('landing_feat3_title')}
            </span>
            <h1>
              <span className="hero-title-brand">{t('appName')}</span>
              <span className="hi">{t('appTagline')}</span>
            </h1>
            <p className="hero-desc">{t('landing_desc')}</p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                {t('landing_start')}
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg hero-login">
                {t('landing_login')}
              </Link>
            </div>
            <div className="hero-proof">
              <span className="hero-proof-avatars" aria-hidden="true"><i>📐</i><i>🔬</i><i>📚</i></span>
              <span>{t('landing_feat4_title')}</span>
              <span className="hero-proof-divider" aria-hidden="true" />
              <span className="hero-language-proof" aria-label={`${languages.length} ${lang === 'en' ? 'languages' : t('language')}`}>
                {languages.length} <span aria-hidden="true">🌐</span>
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="feature-orbit">
              <div className="orbit-card c1">🎯 {t('landing_orbit_adaptive')}</div>
              <div className="orbit-card c2">🤖 {t('landing_orbit_tutor')}</div>
              <div className="orbit-card c3">🏆 {t('landing_orbit_gamified')}</div>
              <div className="orbit-card c4">🌾 {t('landing_orbit_rural')}</div>
              <div className="orbit-center"><span>✳</span></div>
              <div className="orbit-float orbit-float-top"><span>✦</span> {t('landing_feat1_title')}</div>
              <div className="orbit-float orbit-float-bottom"><span>⚡</span> +25 XP <i aria-hidden="true" /></div>
            </div>
          </div>
        </div>
        <a className="hero-scroll-cue" href="#features" aria-label={t('landing_why')}>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="container features-section" id="features">
        <span className="section-kicker">{t('appName')}</span>
        <h2>{t('landing_why')}</h2>
        <p className="section-intro">{t('landing_desc')}</p>
        <div className="grid-4 features-grid">
          <article className="card feature-card">
            <span className="feature-icon">🧠</span>
            <h3>{t('landing_feat1_title')}</h3>
            <p>{t('landing_feat1_desc')}</p>
          </article>
          <article className="card feature-card">
            <span className="feature-icon">🎮</span>
            <h3>{t('landing_feat2_title')}</h3>
            <p>{t('landing_feat2_desc')}</p>
          </article>
          <article className="card feature-card">
            <span className="feature-icon">🤖</span>
            <h3>{t('landing_feat3_title')}</h3>
            <p>{t('landing_feat3_desc')}</p>
          </article>
          <article className="card feature-card">
            <span className="feature-icon">📶</span>
            <h3>{t('landing_feat4_title')}</h3>
            <p>{t('landing_feat4_desc')}</p>
          </article>
        </div>
        <div className="landing-proof-strip" role="group" aria-label={t('landing_why')}>
          <div className="landing-proof-item">
            <span aria-hidden="true">🌐</span>
            <strong>{t('login_stats_langs')}</strong>
          </div>
          <div className="landing-proof-item">
            <span aria-hidden="true">🎮</span>
            <strong>{t('login_stats_games')}</strong>
          </div>
          <div className="landing-proof-item">
            <span aria-hidden="true">✨</span>
            <strong>{t('login_stats_free')}</strong>
          </div>
        </div>
        <div className="landing-journey">
          <div className="landing-journey-heading">
            <span className="section-kicker">{t('landing_feat4_title')}</span>
            <h3>{t('dash_path')}</h3>
          </div>
          <div className="landing-journey-steps">
            <article className="journey-step">
              <span className="journey-step-icon" aria-hidden="true">📚</span>
              <span className="journey-step-number">01</span>
              <h4>{t('subjects_lessons')}</h4>
              <p>{t('subjects_sub')}</p>
            </article>
            <article className="journey-step">
              <span className="journey-step-icon" aria-hidden="true">🧠</span>
              <span className="journey-step-number">02</span>
              <h4>{t('quiz_title')}</h4>
              <p>{t('quiz_sub')}</p>
            </article>
            <article className="journey-step">
              <span className="journey-step-icon" aria-hidden="true">🏆</span>
              <span className="journey-step-number">03</span>
              <h4>{t('games_title')}</h4>
              <p>{t('games_sub')}</p>
            </article>
          </div>
          <Link to="/register" className="journey-cta">
            {t('landing_start')} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="container landing-subjects" id="subjects">
        <span className="section-kicker">{t('landing_feat1_title')}</span>
        <h2>{t('landing_subjects')}</h2>
        <p className="subjects-intro">{t('subjects_sub')}</p>
        <div className="subjects-showcase">
          <div className="subjects-track-grid" role="group" aria-label={t('landing_subjects')}>
            {SUBJECT_TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                className={`subject-track${activeTrack === track.id ? ' is-active' : ''}`}
                aria-pressed={activeTrack === track.id}
                onClick={() => setActiveTrack(track.id)}
              >
                <span className="subject-track-icon" aria-hidden="true">{track.icon}</span>
                <span className="subject-track-name">{t(track.label)}</span>
                <span className="subject-track-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <aside className="ai-subject-preview" aria-live="polite">
            <div className="ai-preview-topline">
              <span className="ai-preview-sparkle" aria-hidden="true">✦</span>
              <span>{t('tutor_title')}</span>
              <span className="ai-preview-status"><i aria-hidden="true" /> AI</span>
            </div>
            <div className={`ai-preview-art ai-preview-art--${selectedTrack.id}`} aria-hidden="true">
              <span className="ai-art-orbit ai-art-orbit-one" />
              <span className="ai-art-orbit ai-art-orbit-two" />
              <span className="ai-art-subject-icon">{selectedTrack.icon}</span>
              <span className="ai-art-chips">
                {selectedTrack.art.map((item, index) => (
                  <i key={`${item}-${index}`}>{item}</i>
                ))}
              </span>
            </div>
            <span className="ai-preview-label">{t(selectedTrack.label)} · {t('tutor_quick')}</span>
            <p className="ai-preview-prompt">{t(selectedTrack.prompt)}</p>
            <p className="ai-preview-note">{t('tutor_sub')}</p>
            <Link to="/register" className="ai-preview-cta">
              {t('landing_start')} <span aria-hidden="true">↗</span>
            </Link>
          </aside>
        </div>
        <div className="landing-bottom-cta">
          <div><strong>{t('landing_start')}</strong><span>{t('landing_desc')}</span></div>
          <Link to="/register" className="btn btn-primary btn-lg">{t('landing_start')} <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      </main>

      <footer className="landing-footer">
        <div className="container">{t('landing_footer')}</div>
      </footer>
    </div>
  );
}
