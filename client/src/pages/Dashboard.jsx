import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import KnowledgeGraph from '../components/KnowledgeGraph';
import './Dashboard.css';

export default function Dashboard() {
  const { refreshUser } = useAuth();
  const { t, lang } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [classActivities, setClassActivities] = useState([]);
  const [seasonalContent, setSeasonalContent] = useState([]);
  const [classContentError, setClassContentError] = useState('');
  const [knowledgeGraph, setKnowledgeGraph] = useState([]);
  const [knowledgeGraphLoading, setKnowledgeGraphLoading] = useState(true);
  const [mistakeAnalysis, setMistakeAnalysis] = useState(null);
  const [mistakeAnalysisLoading, setMistakeAnalysisLoading] = useState(true);
  const [knowledgeGraphError, setKnowledgeGraphError] = useState('');
  const [mistakeError, setMistakeError] = useState('');
  const [personalizationRetry, setPersonalizationRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.dashboard(lang)
      .then((d) => {
        if (!active) return;
        setData(d);
        refreshUser(d.user);
      })
      .catch(() => {
        if (active) setError('Unable to load your dashboard. Check your connection and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [lang, retryCount]);

  useEffect(() => {
    let active = true;
    Promise.all([api.studentActivities(), api.seasonalContent(lang)])
      .then(([activities, seasonal]) => {
        if (!active) return;
        setClassActivities(activities);
        setSeasonalContent(seasonal);
      })
      .catch((requestError) => {
        if (active) setClassContentError(requestError.message || t('student_content_load_error'));
      });
    return () => { active = false; };
  }, [lang, retryCount, t]);

  useEffect(() => {
    let active = true;
    setKnowledgeGraphLoading(true);
    setMistakeAnalysisLoading(true);
    setKnowledgeGraph([]);
    setMistakeAnalysis(null);
    setKnowledgeGraphError('');
    setMistakeError('');
    api.knowledgeGraph(lang)
      .then((graph) => {
        if (!active) return;
        setKnowledgeGraph(graph);
        setKnowledgeGraphError('');
      })
      .catch(() => { if (active) setKnowledgeGraphError(t('knowledge_load_error')); })
      .finally(() => { if (active) setKnowledgeGraphLoading(false); });
    api.mistakeAnalysis(lang)
      .then((result) => {
        if (!active) return;
        setMistakeAnalysis(result.analysis);
        setMistakeError('');
      })
      .catch(() => { if (active) setMistakeError(t('mistake_load_error')); })
      .finally(() => { if (active) setMistakeAnalysisLoading(false); });
    return () => { active = false; };
  }, [lang, retryCount, personalizationRetry, t]);

  if (loading) return <div className="loading">{t('loadingDashboard')}</div>;
  if (error || !data) {
    return (
      <section className="dashboard-error card" role="alert">
        <span aria-hidden="true">🌱</span>
        <h1 className="page-title">Your learning dashboard is taking a break</h1>
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={() => setRetryCount((count) => count + 1)}>
          Try again
        </button>
      </section>
    );
  }

  const xpToNext = 100 - (data.user.xp % 100);
  const diffLabel = (d) => t(`diff_${d}`) || d;

  return (
    <div className="dashboard">
      {classContentError && <p className="dashboard-content-error" role="status">{classContentError}</p>}
      {seasonalContent.length > 0 && (
        <section className="dashboard-seasonal-section">
          <div className="dashboard-section-heading"><h2>🌦️ {t('seasonal_for_you')}</h2><p>{t('seasonal_from_teacher')}</p></div>
          <div className="dashboard-seasonal-grid">
            {seasonalContent.map((item) => (
              <article className="card dashboard-seasonal-card" key={item.id}>
                <span className="dashboard-content-kicker">{item.subject || t('studio_any_subject')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      {classActivities.length > 0 && (
        <section className="dashboard-activities-section">
          <div className="dashboard-section-heading"><h2>📝 {t('student_class_activities')}</h2><p>{t('student_class_activities_help')}</p></div>
          <div className="dashboard-activity-grid">
            {classActivities.map((activity) => (
              <article className="card dashboard-activity-card" key={activity.id}>
                <span className="dashboard-content-kicker">{activity.subject || t('studio_any_subject')}</span>
                <h3>{activity.title}</h3>
                <p>{activity.description || t('student_activity_default')}</p>
                <span className="dashboard-activity-meta">{activity.questionCount} {t('studio_questions_count')} · {activity.attempts} {t('student_attempts')} {activity.bestScore !== null ? `· ${t('student_best')}: ${activity.bestScore}/${activity.questionCount}` : ''}</span>
                <Link to={`/activities/${activity.id}`} className="btn btn-primary">{t('student_start_activity')} →</Link>
              </article>
            ))}
          </div>
        </section>
      )}
      <div className="dash-welcome card">
        <div>
          <span className="dash-eyebrow">{t('appName')} <span>✦</span></span>
          <h1 className="page-title">{t('dash_greeting')}, {data.user.name}! 🙏</h1>
          <p className="page-subtitle">
            {t('dash_level')} {data.user.level} • {diffLabel(data.recommendedDifficulty)} {t('dash_difficulty')}
          </p>
          <Link
            to={data.continueLearning?.href || (data.learningPath.length ? `/lesson/${data.learningPath[0].lessonId}` : '/subjects')}
            className="dash-continue-link"
          >
            {data.continueLearning || data.learningPath.length ? t('start') : t('dash_browse')} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="streak-box">
          <span className="streak-num">🔥 {data.user.streak}</span>
          <span>{t('dash_streak')}<small>{t('streak_freezes_available', { count: data.user.streakFreezes ?? 0 })}</small></span>
        </div>
      </div>

      <div className="grid-4 stats-row">
        <div className="card stat-card">
          <span className="stat-icon">⚡</span>
          <div className="value">{data.user.xp}</div>
          <div className="label">{t('dash_total_xp')}</div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">✦</span>
          <div className="value">Lv.{data.user.level}</div>
          <div className="label">{t('dash_level_label')}</div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">◉</span>
          <div className="value">{data.overallProgress.percent}%</div>
          <div className="label">{t('dash_progress')}</div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">🏅</span>
          <div className="value">{data.badges.length}</div>
          <div className="label">{t('dash_badges')}</div>
        </div>
      </div>

      <div className="card xp-progress-card">
        <div className="xp-header">
          <span>{t('progress_to_level')} {data.user.level + 1}</span>
          <span>{xpToNext} {t('xp_needed')}</span>
        </div>
        <div
          className="progress-bar"
          role="progressbar"
          aria-label={`${t('progress_to_level')} ${data.user.level + 1}`}
          aria-valuenow={data.user.xp % 100}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div className="progress-bar-fill" style={{ width: `${data.user.xp % 100}%` }} />
        </div>
      </div>

      <div className="grid-2 dash-main">
        <section className="card">
          <h2>📍 {t('dash_path')}</h2>
          {data.continueLearning?.kind === 'game' && (
            <div className="dashboard-resume-game">
              <span aria-hidden="true">🎮</span>
              <div>
                <strong>{data.continueLearning.title}</strong>
                <small>{t('games_level')} {data.gameProgress?.level || 1} · {t('games_mastery')} {data.gameProgress?.mastery || 0}%</small>
              </div>
              <Link to={data.continueLearning.href} className="btn btn-primary btn-sm">{t('start')}</Link>
            </div>
          )}
          {data.learningPath.length > 0 ? (
            <ul className="path-list">
              {data.learningPath.map((item) => (
                <li key={item.lessonId}>
                  <div>
                    <strong>{item.title}</strong>
                    <span className="badge-pill">{item.subject}</span>
                    <small className="path-reason">{t(item.reasonKey)}</small>
                  </div>
                  <Link to={`/lesson/${item.lessonId}`} className="btn btn-primary btn-sm">
                    {t('start')}
                  </Link>
                </li>
              ))}
            </ul>
          ) : !data.continueLearning?.kind || data.continueLearning.kind !== 'game' ? (
            <p className="muted">{data.overallProgress.completed === 0 ? t('subjects_sub') : t('dash_path_done')}</p>
          ) : null}
          <Link to="/subjects" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            {t('dash_browse')}
          </Link>
        </section>

        <section className="card">
          <h2>🏅 {t('dash_your_badges')}</h2>
          {data.badges.length === 0 ? (
            <p className="muted">{t('dash_badges_empty')}</p>
          ) : (
            <div className="badges-grid">
              {data.badges.map((b) => (
                <div key={b.id} className="badge-item" title={b.description}>
                  <span>{b.icon}</span>
                  <small>{b.name}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {knowledgeGraphError && <p className="dashboard-content-error" role="status">{knowledgeGraphError}</p>}
      {mistakeAnalysis && (
        <section className="card mistake-analysis">
          <div className="mistake-analysis-heading">
            <span aria-hidden="true">🧭</span>
            <div><h2>{t('mistake_analysis_title')}</h2><p>{t('mistake_analysis_based_on', { count: mistakeAnalysis.basedOn })}</p></div>
          </div>
          <p>{mistakeAnalysis.pattern}</p>
          <p className="mistake-story-offer">{mistakeAnalysis.storyOffer}</p>
          <Link
            className="btn btn-primary"
            to={`/stories?subject=${encodeURIComponent(mistakeAnalysis.focusSubject)}`}
          >
            {t('mistake_try_story')}
          </Link>
        </section>
      )}
      {!mistakeAnalysisLoading && !mistakeAnalysis && !mistakeError && <p className="muted">{t('mistake_none')}</p>}
      {mistakeError && (
        <section className="dashboard-content-error" role="alert">
          <p>{mistakeError}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPersonalizationRetry((count) => count + 1)}>{t('try_again')}</button>
        </section>
      )}
      <KnowledgeGraph
        graph={knowledgeGraph}
        title={`🕸️ ${t('knowledge_graph_title')}`}
        description={t('knowledge_graph_help')}
        loading={knowledgeGraphLoading}
      />

      {data.recentAttempts.length > 0 && (
        <section className="card recent-section">
          <h2>{t('dash_recent')}</h2>
          <table className="recent-table">
            <thead>
              <tr>
                <th>{t('dash_lesson')}</th>
                <th>{t('dash_score')}</th>
                <th>{t('dash_xp')}</th>
                <th>{t('dash_difficulty_col')}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentAttempts.map((a) => (
                <tr key={a.id}>
                  <td>{a.lesson_title}</td>
                  <td>{a.score}/{a.total}</td>
                  <td>+{a.xp_earned}</td>
                  <td>
                    <span className={`badge-pill difficulty-${a.difficulty}`}>{diffLabel(a.difficulty)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <div className="quick-actions">
        <Link to="/games" className="card quick-card">
          <span>🎮</span>
          <strong>{t('nav_games')}</strong>
          <p>{t('dash_games_count')}</p>
        </Link>
        <Link to="/tutor" className="card quick-card">
          <span>🤖</span>
          <strong>{t('nav_tutor')}</strong>
          <p>{t('dash_ask_tutor')}</p>
        </Link>
        <Link to="/stories" className="card quick-card">
          <span>📚</span>
          <strong>{t('story_title')}</strong>
          <p>{t('story_subtitle')}</p>
        </Link>
        <Link to="/leaderboard" className="card quick-card">
          <span>🏆</span>
          <strong>{t('nav_leaderboard')}</strong>
          <p>{t('dash_see_top')}</p>
        </Link>
      </div>
    </div>
  );
}
