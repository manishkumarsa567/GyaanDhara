import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Portfolio.css';

function formatDate(value, lang, fallback) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(date);
}

export default function Portfolio() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('studentId');
  const [portfolio, setPortfolio] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isTeacherView = user?.role === 'teacher';

  useEffect(() => {
    if (isTeacherView && !studentId) {
      setError(t('portfolio_select_student'));
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError('');
    const request = isTeacherView
      ? api.teacherStudentPortfolio(studentId, lang)
      : api.studentPortfolio(lang);

    request
      .then((result) => {
        if (!active) return;
        setPortfolio(result);
        const firstLesson = result.completedLessons[0];
        const firstBadge = result.earnedBadges[0];
        const firstGame = result.completedGames[0];
        setCertificate(
          firstLesson
            ? { title: firstLesson.title, detail: firstLesson.subject, date: firstLesson.completedAt }
            : firstBadge
              ? { title: firstBadge.name, detail: firstBadge.description, date: firstBadge.earnedAt }
              : firstGame
                ? { title: firstGame.name, detail: `${t('portfolio_levels_passed')}: ${firstGame.passedLevels}`, date: null }
                : null
        );
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || t('portfolio_load_error'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [isTeacherView, studentId, lang, t]);

  const achievements = useMemo(() => {
    if (!portfolio) return [];
    return [
      ...portfolio.completedLessons.map((lesson) => ({
        key: `lesson-${lesson.id}`,
        icon: '📘',
        title: lesson.title,
        detail: lesson.subject,
        date: lesson.completedAt,
      })),
      ...portfolio.earnedBadges.map((badge) => ({
        key: `badge-${badge.id}`,
        icon: badge.icon || '🏅',
        title: badge.name,
        detail: badge.description,
        date: badge.earnedAt,
      })),
      ...portfolio.completedGames.map((game) => ({
        key: `game-${game.slug}`,
        icon: '🎮',
        title: game.name,
        detail: `${t('portfolio_levels_passed')}: ${game.passedLevels}`,
        date: null,
      })),
    ];
  }, [portfolio, t]);

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) {
    return (
      <section className="portfolio-error card" role="alert">
        <h1>{t('portfolio_title')}</h1>
        <p>{error}</p>
        {isTeacherView && <Link className="btn btn-secondary" to="/teacher">{t('nav_teacher')}</Link>}
      </section>
    );
  }
  if (!portfolio) return null;

  const selectCertificate = (achievement) => {
    setCertificate({ title: achievement.title, detail: achievement.detail, date: achievement.date });
  };

  return (
    <div className="portfolio-page">
      <header className="portfolio-heading portfolio-screen-only">
        <div>
          <p className="portfolio-eyebrow">🏆 {t('portfolio_eyebrow')}</p>
          <h1 className="page-title">{t('portfolio_title')}</h1>
          <p className="page-subtitle">{t('portfolio_subtitle')}</p>
        </div>
        {isTeacherView && <Link className="btn btn-secondary" to="/teacher">← {t('nav_teacher')}</Link>}
      </header>

      <section className="portfolio-summary grid-3 portfolio-screen-only" aria-label={t('portfolio_summary')}>
        <div className="card portfolio-stat"><span>📘</span><strong>{portfolio.totals.lessons}</strong><small>{t('portfolio_lessons')}</small></div>
        <div className="card portfolio-stat"><span>🏅</span><strong>{portfolio.totals.badges}</strong><small>{t('portfolio_badges')}</small></div>
        <div className="card portfolio-stat"><span>🎮</span><strong>{portfolio.totals.games}</strong><small>{t('portfolio_games')}</small></div>
      </section>

      <section className="portfolio-certificate" aria-label={t('portfolio_certificate')}>
        <div className="certificate-topline"><span>✦</span> {t('appName')} <span>✦</span></div>
        <div className="certificate-seal" aria-hidden="true">🏆</div>
        <p className="certificate-kicker">{t('portfolio_certificate')}</p>
        <h2>{t('portfolio_awarded_to')}</h2>
        <p className="certificate-student">{portfolio.student.name}</p>
        {certificate ? (
          <>
            <p className="certificate-copy">{t('portfolio_recognition')}</p>
            <h3>{certificate.title}</h3>
            {certificate.detail && <p className="certificate-detail">{certificate.detail}</p>}
            <p className="certificate-date">
              {t('portfolio_issued')} · {formatDate(certificate.date, lang, t('portfolio_date_unknown'))}
            </p>
          </>
        ) : (
          <p className="certificate-copy">{t('portfolio_no_certificate')}</p>
        )}
        <div className="certificate-signature">
          <span>{portfolio.student.xp} XP</span>
          <span>{t('portfolio_level')} {portfolio.student.level}</span>
        </div>
      </section>

      <div className="portfolio-print-actions portfolio-screen-only">
        <button type="button" className="btn btn-primary" onClick={() => window.print()} disabled={!certificate}>
          🖨️ {t('portfolio_print')}
        </button>
        <p>{t('portfolio_print_hint')}</p>
      </div>

      <section className="card portfolio-achievements portfolio-screen-only">
        <div className="portfolio-section-heading">
          <div>
            <h2>{t('portfolio_trophy_cabinet')}</h2>
            <p>{t('portfolio_choose_certificate')}</p>
          </div>
        </div>
        {achievements.length ? (
          <div className="portfolio-achievement-grid">
            {achievements.map((achievement) => (
              <article className="portfolio-achievement" key={achievement.key}>
                <span className="portfolio-achievement-icon" aria-hidden="true">{achievement.icon}</span>
                <div className="portfolio-achievement-copy">
                  <h3>{achievement.title}</h3>
                  {achievement.detail && <p>{achievement.detail}</p>}
                  <small>{formatDate(achievement.date, lang, t('portfolio_earned'))}</small>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => selectCertificate(achievement)}>
                  {t('portfolio_make_certificate')}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="portfolio-empty">
            <span aria-hidden="true">🌱</span>
            <p>{t('portfolio_empty')}</p>
            {!isTeacherView && <Link className="btn btn-primary" to="/subjects">{t('nav_learn')}</Link>}
          </div>
        )}
      </section>
    </div>
  );
}
