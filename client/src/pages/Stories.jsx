import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import StoryIllustration from './StoryIllustration';
import './Stories.css';

export default function Stories() {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [storiesLanguage, setStoriesLanguage] = useState('');
  const [activeStory, setActiveStory] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [quest, setQuest] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [pathLoading, setPathLoading] = useState(true);
  const [pathError, setPathError] = useState('');
  const [retryPath, setRetryPath] = useState(0);
  const [openingBoxId, setOpeningBoxId] = useState(null);
  const requestedSubject = searchParams.get('subject');
  const requestedGrade = searchParams.get('grade') || '';
  const subjectFilter = stories.some((story) => story.subject.toLocaleLowerCase() === requestedSubject?.toLocaleLowerCase())
    ? requestedSubject
    : '';
  const gradeFilter = /^[1-8]$/.test(requestedGrade) ? requestedGrade : '';
  const visibleStories = stories.filter((story) => (
    (!subjectFilter || story.subject.toLocaleLowerCase() === subjectFilter.toLocaleLowerCase())
    && (!gradeFilter || story.grade === Number(gradeFilter))
  ));
  const subjectOptions = [...new Set(stories.map((story) => story.subject))].sort();

  const updateStoryFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setStoriesLanguage('');
    setError('');
    api.stories(lang)
      .then((result) => {
        if (!active) return;
        setStories(result);
        setStoriesLanguage(lang);
      })
      .catch(() => {
        if (!active) return;
        setError(t('story_load_error'));
        if (activeStory && activeStory.lang !== lang) {
          setActiveStory(null);
          setHistory([]);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [lang, t]);

  useEffect(() => {
    let active = true;
    setPathLoading(true);
    setPathError('');
    Promise.allSettled([api.dashboard(lang), api.gamification(lang)])
      .then(([dashboardResult, rewardsResult]) => {
        if (!active) return;
        if (dashboardResult.status === 'fulfilled') setQuest(dashboardResult.value.narrativeQuest);
        else setPathError(t('storypath_load_error'));
        if (rewardsResult.status === 'fulfilled') setRewards(rewardsResult.value);
        else setPathError((current) => current || t('gamification_load_error'));
      })
      .finally(() => { if (active) setPathLoading(false); });
    return () => { active = false; };
  }, [lang, retryPath, t]);

  const openRewardBox = async (boxId) => {
    setOpeningBoxId(boxId);
    setPathError('');
    try {
      const box = await api.openMysteryBox(boxId, lang);
      setRewards((current) => current && ({
        ...current,
        boxes: current.boxes.map((entry) => entry.id === box.id ? box : entry),
      }));
    } catch {
      setPathError(t('gamification_open_error'));
    } finally {
      setOpeningBoxId(null);
    }
  };

  const startStory = async (story) => {
    setBusy(true);
    setError('');
    setHistory([]);
    try {
      const session = await api.startStory(story.id, lang);
      setActiveStory({
        ...session,
        subject: story.subject,
        topic: story.topic,
        learningTopic: story.learningTopic,
        grade: story.grade,
        visual: story.visual,
        storyId: story.id,
        lang,
      });
    } catch (requestError) {
      setError(t('story_start_error'));
    } finally {
      setBusy(false);
    }
  };

  const choosePath = async (choice) => {
    if (!activeStory || busy) return;
    setBusy(true);
    setError('');
    try {
      const next = await api.chooseStory(activeStory.sessionId, choice.id);
      setHistory((current) => [...current, {
        scene: activeStory.scene,
        fact: activeStory.fact,
        choice: choice.label,
      }]);
      setActiveStory({ ...activeStory, ...next });
    } catch (requestError) {
      setError(t('story_continue_error'));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!activeStory || activeStory.lang === lang || storiesLanguage !== lang || busy) return;
    const story = stories.find((entry) => entry.id === activeStory.storyId);
    if (!story) {
      setActiveStory(null);
      setHistory([]);
      return;
    }
    setActiveStory(null);
    setHistory([]);
    startStory(story);
  }, [activeStory, busy, lang, stories, storiesLanguage]);

  return (
    <div className="stories-page">
      <header className="stories-heading">
        <p className="stories-eyebrow">📚 {t('story_eyebrow')}</p>
        <h1 className="page-title">{t('story_title')}</h1>
        <p className="page-subtitle">{t('story_subtitle')}</p>
      </header>
      {error && <p className="stories-error" role="alert">{error}</p>}

      <section className="storypath-section" aria-label={t('storypath_title')}>
        <div className="storypath-section-heading">
          <div><p>{t('storypath_eyebrow')}</p><h2>{t('storypath_title')}</h2></div>
          <span aria-hidden="true">🧭</span>
        </div>
        {pathError && (
          <div className="storypath-error" role="alert">
            <p>{pathError}</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRetryPath((value) => value + 1)}>{t('try_again')}</button>
          </div>
        )}
        {pathLoading ? <p className="storypath-loading" role="status">{t('loading')}</p> : (
          <div className="storypath-grid">
            {quest && (
              <article className="storypath-quest">
                <div className="storypath-card-heading">
                  <span aria-hidden="true">🩺</span>
                  <div><small>{t('quest_eyebrow')}</small><h3>{quest.title}</h3></div>
                </div>
                <p className="storypath-premise">{quest.premise}</p>
                <div
                  className="storypath-progress"
                  role="progressbar"
                  aria-label={t('quest_progress')}
                  aria-valuenow={quest.steps.filter((step) => step.completed).length}
                  aria-valuemin="0"
                  aria-valuemax={quest.steps.length}
                >
                  <span style={{ width: `${(quest.steps.filter((step) => step.completed).length / quest.steps.length) * 100}%` }} />
                </div>
                {quest.completed ? (
                  <p className="storypath-complete">🎉 {t('quest_complete')}</p>
                ) : (
                  <div className="storypath-current-step">
                    <span>{t('quest_step_count', { current: quest.currentStep + 1, total: quest.steps.length })}</span>
                    <strong>{quest.steps[quest.currentStep].title}</strong>
                    <Link to={quest.steps[quest.currentStep].href} className="btn btn-primary btn-sm">{t('quest_continue')} →</Link>
                  </div>
                )}
                <details className="storypath-all-steps">
                  <summary>{t('quest_view_all_steps')}</summary>
                  <ol>
                    {quest.steps.map((step) => (
                      <li key={step.id} className={step.completed ? 'complete' : ''}>
                        <span aria-hidden="true">{step.completed ? '✓' : '○'}</span>
                        <div><strong>{step.title}</strong><p>{step.chapter}</p></div>
                      </li>
                    ))}
                  </ol>
                </details>
              </article>
            )}
            <article className="storypath-loot">
              <div className="storypath-card-heading">
                <span aria-hidden="true">🎁</span>
                <div><small>{t('loot_eyebrow')}</small><h3>{t('loot_title')}</h3></div>
              </div>
              <p className="storypath-premise">{t('loot_help')}</p>
              <div className="storypath-loot-count">
                {t('loot_available_count', { count: rewards?.boxes.filter((box) => !box.opened).length || 0 })}
                <span>❄️ {t('streak_freezes_available', { count: rewards?.streakFreezes || 0 })}</span>
              </div>
              {rewards?.boxes.some((box) => !box.opened) ? (
                <div className="storypath-boxes">
                  {rewards.boxes.filter((box) => !box.opened).map((box) => (
                    <div className="storypath-box" key={box.id}>
                      <span aria-hidden="true">🎁</span>
                      <div><strong>{t('loot_mystery_box')}</strong><small>{t(`diff_${box.difficulty}`)}</small></div>
                      <button type="button" className="btn btn-primary btn-sm" disabled={openingBoxId !== null} onClick={() => openRewardBox(box.id)}>
                        {openingBoxId === box.id ? t('loot_opening') : t('loot_open')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : !pathLoading && <p className="storypath-empty">{t('loot_empty')}</p>}
              {rewards?.boxes.some((box) => box.opened && box.item) && (
                <details className="storypath-inventory">
                  <summary>{t('loot_inventory_count', { count: rewards.boxes.filter((box) => box.opened && box.item).length })}</summary>
                  <div>
                    {rewards.boxes.filter((box) => box.opened && box.item).map((box) => (
                      <span className="storypath-inventory-item" key={box.id} title={box.item.name}>
                        {box.item.icon} {box.item.name}
                      </span>
                    ))}
                  </div>
                </details>
              )}
            </article>
          </div>
        )}
      </section>

      {activeStory && activeStory.lang !== lang ? (
        <p className="storypath-loading" role="status">{t('story_language_switching')}</p>
      ) : activeStory ? (
        <section className="card story-play">
          <div className="story-play-header">
            <div>
              <span className="story-subject">{t('story_grade', { grade: activeStory.grade })} · {activeStory.subject}</span>
              <h2>{activeStory.topic}</h2>
              <p className="story-learning-topic">{activeStory.learningTopic}</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setActiveStory(null); setHistory([]); setError(''); }}>{t('story_choose_another')}</button>
          </div>
          <StoryIllustration subject={activeStory.subject} topic={activeStory.topic} visual={activeStory.visual} />
          <div className="story-transcript" aria-live="polite">
            {history.map((item, index) => (
              <article className="story-memory" key={`${index}-${item.choice}`}>
                <p>{item.scene}</p>
                <span>➡️ {item.choice}</span>
                <p className="story-fact">💡 {item.fact}</p>
              </article>
            ))}
            <article className="story-current-scene">
              <span>{t('story_turn', { turn: activeStory.turn + 1 })}</span>
              <p>{activeStory.scene}</p>
              <p className="story-fact">💡 {activeStory.fact}</p>
            </article>
          </div>
          {activeStory.turn < 8 ? (
            <div className="story-choice-list">
              <h3>{t('story_what_next')}</h3>
              {activeStory.choices.map((choice) => (
                <button type="button" key={choice.id} disabled={busy} onClick={() => choosePath(choice)}>
                  <span>{choice.label}</span><b aria-hidden="true">→</b>
                </button>
              ))}
              {busy && <p role="status">{t('story_generating')}</p>}
            </div>
          ) : <p className="story-end-note">{t('story_turn_limit')}</p>}
        </section>
      ) : (
        <section>
          <div className="story-filters">
            <label>
              {t('story_filter_class')}
              <select value={gradeFilter} onChange={(event) => updateStoryFilter('grade', event.target.value)}>
                <option value="">{t('story_all_classes')}</option>
                {Array.from({ length: 8 }, (_, index) => (
                  <option value={String(index + 1)} key={index}>{t('story_grade', { grade: index + 1 })}</option>
                ))}
              </select>
            </label>
            <label>
              {t('story_filter_subject')}
              <select value={subjectFilter} onChange={(event) => updateStoryFilter('subject', event.target.value)}>
                <option value="">{t('story_all_subjects')}</option>
                {subjectOptions.map((subject) => <option value={subject} key={subject}>{subject}</option>)}
              </select>
            </label>
            <span className="story-filter-count" role="status">
              {t(visibleStories.length === 1 ? 'story_count_one' : 'story_count_many', { count: visibleStories.length })}
            </span>
            {(subjectFilter || gradeFilter) && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSearchParams({})}>{t('story_show_all')}</button>
            )}
          </div>
          <div className="story-catalog">
          {loading ? <p>{t('loading')}</p> : visibleStories.map((story) => (
            <article className="card story-card" key={story.id}>
              <StoryIllustration subject={story.subject} topic={story.topic} visual={story.visual} />
              <span className="story-grade-badge">{t('story_grade', { grade: story.grade })}</span>
              <small>{story.subject}</small>
              <h2>{story.topic}</h2>
              <p>{story.learningTopic}</p>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => startStory(story)}>{t('story_begin')}</button>
            </article>
          ))}
          {!loading && !visibleStories.length && <p>{t('story_no_stories')}</p>}
          </div>
        </section>
      )}
      <p className="story-safety-note">{t('story_safety_note')}</p>
    </div>
  );
}
