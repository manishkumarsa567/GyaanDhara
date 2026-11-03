import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import SpeakButton from '../components/SpeakButton';
import './Lesson.css';

const readingSizes = ['small', 'medium', 'large'];

export default function Lesson() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const [lesson, setLesson] = useState(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [readingSize, setReadingSize] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([api.lesson(id, lang), api.saveLessonProgress(id)])
      .then(([lessonData]) => {
        if (!active) return;
        setLesson(lessonData);
        setActiveChapter(0);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load this chapter.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id, lang, retryCount]);

  const displayLabel = (key, fallback) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) {
    return (
      <section className="card" role="alert">
        <h1 className="page-title">{t('loading')}</h1>
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={() => setRetryCount((count) => count + 1)}>
          Try again
        </button>
      </section>
    );
  }
  if (!lesson) return null;

  const chapters = lesson.chapters || [];
  const chapter = chapters[activeChapter];
  const chapterLabel = t('lesson_chapter_label', {
    current: activeChapter + 1,
    total: chapters.length,
  });
  const tutorSearch = new URLSearchParams({
    topic: lesson.title,
    ...(chapter ? { chapter: chapter.title } : {}),
  }).toString();
  const chapterReading = chapter
    ? [
      lesson.title,
      chapter.title,
      chapter.reading,
      t('lesson_real_world'),
      chapter.example,
      t('lesson_try_it'),
      chapter.tryIt,
      t('lesson_key_idea'),
      chapter.takeaway,
    ].filter(Boolean).join('. ')
    : `${lesson.title}. ${lesson.content}`;

  return (
    <div className="lesson-reader">
      <div className="lesson-reader-top">
        <Link to="/subjects" className="lesson-back-link" aria-label={t('lesson_back')}><span aria-hidden="true">←</span> <span className="low-literacy-hide">{t('lesson_back')}</span></Link>
        <div className="lesson-reading-controls" role="group" aria-label={t('lesson_text_size')}>
          <span className="low-literacy-hide">{t('lesson_text_size')}</span>
          {readingSizes.map((size) => (
            <button
              key={size}
              type="button"
              className={readingSize === size ? 'active' : ''}
              aria-pressed={readingSize === size}
              aria-label={t(`lesson_text_${size}`)}
              onClick={() => setReadingSize(size)}
            >
              {size === 'small' ? 'A' : size === 'medium' ? 'A+' : 'A++'}
            </button>
          ))}
        </div>
      </div>

      <header className="lesson-reader-hero">
        <div className="lesson-reader-hero-copy">
          <span className="lesson-reader-kicker">{t('lesson_reader_kicker')}</span>
          <div className="lesson-reader-subject">{lesson.subject_name}</div>
          <h1>{lesson.title}</h1>
          <div className="lesson-reader-meta">
            <span>{chapterLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{t('lesson_chapter_count', { count: chapters.length })}</span>
          </div>
        </div>
        <div className="lesson-reader-hero-art" aria-hidden="true">✦</div>
      </header>

      {!lesson.chaptersTranslated && lang !== 'en' && (
        <p className="lesson-translation-notice low-literacy-secondary" role="status">{t('lesson_translation_fallback')}</p>
      )}

      <div className="lesson-reader-layout">
        <aside className="lesson-chapter-nav card">
          <h2><span aria-hidden="true">📚</span> <span className="low-literacy-hide">{t('lesson_chapters')}</span></h2>
          <div className="lesson-instruction-listen">
            <SpeakButton
              text={`${t('lesson_chapters')}. ${chapters.map((item, index) => `${index + 1}. ${item.title}`).join('. ')}. ${t('lesson_take_quiz')}`}
              className="btn btn-secondary"
            />
          </div>
          <ol>
            {chapters.map((item, index) => (
              <li key={`${item.title}-${index}`}>
                <button
                  type="button"
                  className={activeChapter === index ? 'active' : ''}
                  aria-current={activeChapter === index ? 'step' : undefined}
                  onClick={() => {
                    setActiveChapter(index);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span className="lesson-chapter-nav-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="low-literacy-hide">{item.title}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="lesson-chapter-nav-actions">
            <Link to={`/quiz/${lesson.id}`} className="btn btn-secondary" aria-label={t('lesson_take_quiz')}>
              <span aria-hidden="true">🎯</span>
              <span className="low-literacy-hide">{t('lesson_take_quiz')}</span>
            </Link>
          </div>
        </aside>

        {chapter ? (
          <article className={`lesson-chapter-content reading-${readingSize}`}>
            <div className="lesson-chapter-progress" aria-label={chapterLabel}>
              <div style={{ width: `${((activeChapter + 1) / chapters.length) * 100}%` }} />
            </div>
            <div className="lesson-chapter-content-tools">
              <span className="lesson-chapter-eyebrow">{chapterLabel}</span>
              <SpeakButton text={chapterReading} className="btn btn-secondary lesson-chapter-listen" />
            </div>
            <h2>{chapter.title}</h2>
            <p className="lesson-chapter-reading">{chapter.reading}</p>

            <section className="lesson-real-world">
              <span className="lesson-content-icon" aria-hidden="true">🌾</span>
              <div>
                <h3>{t('lesson_real_world')}</h3>
                <p>{chapter.example}</p>
              </div>
            </section>

            <section className="lesson-try-it">
              <span className="lesson-content-icon" aria-hidden="true">🧭</span>
              <div>
                <h3>{t('lesson_try_it')}</h3>
                <p>{chapter.tryIt}</p>
              </div>
            </section>

            <aside className="lesson-takeaway">
              <span>{t('lesson_key_idea')}</span>
              <p>{chapter.takeaway}</p>
            </aside>

            <div className="lesson-chapter-pager">
              <button
                type="button"
                className="btn btn-secondary"
                aria-label={t('lesson_previous')}
                disabled={activeChapter === 0}
                onClick={() => setActiveChapter((current) => current - 1)}
              >
                <span aria-hidden="true">←</span> <span className="low-literacy-hide">{t('lesson_previous')}</span>
              </button>
              {activeChapter < chapters.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  aria-label={t('lesson_next')}
                  onClick={() => {
                    setActiveChapter((current) => current + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span className="low-literacy-hide">{t('lesson_next')}</span> <span aria-hidden="true">→</span>
                </button>
              ) : (
                <Link to={`/quiz/${lesson.id}`} className="btn btn-primary" aria-label={t('lesson_take_quiz')}>
                  <span aria-hidden="true">🎯</span> <span className="low-literacy-hide">{t('lesson_take_quiz')}</span>
                </Link>
              )}
            </div>
          </article>
        ) : (
          <article className="lesson-chapter-content reading-medium">
            <div className="lesson-chapter-content-tools">
              <span className="lesson-chapter-eyebrow">{lesson.subject_name}</span>
              <SpeakButton text={chapterReading} className="btn btn-secondary lesson-chapter-listen" />
            </div>
            <h2>{lesson.title}</h2>
            <p className="lesson-chapter-reading">{lesson.content}</p>
          </article>
        )}
      </div>

      <aside className="lesson-ai-deep-dive">
        <div className="lesson-ai-icon" aria-hidden="true">✦</div>
        <div>
          <span className="lesson-reader-kicker">{t('lesson_ai_kicker')}</span>
          <h2>{t('lesson_deeper_title')}</h2>
          <p>{t('lesson_deeper_text')}</p>
        </div>
        <Link to={{ pathname: '/tutor', search: `?${tutorSearch}` }} className="btn btn-primary">
          {t('lesson_open_tutor')} <span aria-hidden="true">↗</span>
        </Link>
      </aside>
    </div>
  );
}
