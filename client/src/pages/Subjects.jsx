import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../i18n/languages';
import SpeakButton from '../components/SpeakButton';
import './Subjects.css';

export default function Subjects() {
  const { t, lang } = useLanguage();
  const [ncertCatalog, setNcertCatalog] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Regional language subject state (defaults to app lang, allows instant switching)
  const [activeLangSubject, setActiveLangSubject] = useState(lang);

  // Interactivity states
  const [viewMode, setViewMode] = useState('ncert'); // 'ncert' | 'adaptive'
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setActiveLangSubject(lang);
  }, [lang]);

  useEffect(() => {
    const currentLang = activeLangSubject || lang || 'en';
    api.ncertCatalog(currentLang)
      .then(setNcertCatalog)
      .catch(() => setNcertCatalog({ classes: [], textbookUrl: 'https://ncert.nic.in/textbook.php' }));
  }, [activeLangSubject, lang]);

  useEffect(() => {
    api.subjects(lang)
      .then((data) => {
        setSubjects(data || []);
        if (data && data.length > 0 && !selected) {
          selectSubject(data[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [lang]);

  const selectSubject = async (id) => {
    setSelected(id);
    const data = await api.lessons(id, lang);
    setLessons(data || []);
  };

  const diffLabel = (d) => t(`diff_${d}`) || d;
  const grade = ncertCatalog?.classes.find((item) => item.grade === selectedGrade);

  // Compute selected class stats
  const classStats = useMemo(() => {
    if (!grade) return { totalChapters: 0, completedChapters: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    grade.subjects.forEach((s) => {
      s.chapters.forEach((c) => {
        total += 1;
        if (c.completed) completed += 1;
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { totalChapters: total, completedChapters: completed, percent };
  }, [grade]);

  // Compute recommended next chapter or lesson
  const recommendedItem = useMemo(() => {
    if (grade) {
      for (const subj of grade.subjects) {
        const nextChapter = subj.chapters.find((c) => !c.completed);
        if (nextChapter) {
          return {
            type: 'ncert',
            title: nextChapter.title,
            subjectName: subj.name,
            icon: subj.icon,
            grade: grade.grade,
            link: `/learn/ncert/${grade.grade}/${subj.id}/${nextChapter.id}`,
            tutorLink: `/tutor?topic=${encodeURIComponent(subj.name)}&chapter=${encodeURIComponent(nextChapter.title)}`,
          };
        }
      }
    }
    if (lessons.length > 0) {
      const nextLesson = lessons.find((l) => l.completed !== 1) || lessons[0];
      const subj = subjects.find((s) => s.id === selected);
      return {
        type: 'adaptive',
        title: nextLesson.title,
        subjectName: subj?.name || 'Subject Lesson',
        icon: subj?.icon || '📖',
        link: `/lesson/${nextLesson.id}`,
        quizLink: `/quiz/${nextLesson.id}`,
        tutorLink: `/tutor?topic=${encodeURIComponent(subj?.name || '')}&chapter=${encodeURIComponent(nextLesson.title)}`,
      };
    }
    return null;
  }, [grade, lessons, subjects, selected]);

  // Filter NCERT subjects & chapters by search query and subject filter
  const filteredNcertSubjects = useMemo(() => {
    if (!grade) return [];
    const q = searchQuery.trim().toLowerCase();

    return grade.subjects
      .filter((subj) => {
        if (subjectFilter !== 'all' && subj.id !== subjectFilter) return false;
        if (!q) return true;
        const subjectMatch = subj.name.toLowerCase().includes(q);
        const chapterMatch = subj.chapters.some((c) => c.title.toLowerCase().includes(q));
        return subjectMatch || chapterMatch;
      })
      .map((subj) => {
        if (!q) return subj;
        const matchingChapters = subj.chapters.filter(
          (c) => c.title.toLowerCase().includes(q) || subj.name.toLowerCase().includes(q)
        );
        return { ...subj, chapters: matchingChapters };
      })
      .filter((subj) => subj.chapters.length > 0);
  }, [grade, searchQuery, subjectFilter]);

  // Filter adaptive lessons by search, difficulty, and status
  const filteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lessons.filter((l) => {
      if (difficultyFilter !== 'all' && l.difficulty !== difficultyFilter) return false;
      if (statusFilter === 'completed' && l.completed !== 1) return false;
      if (statusFilter === 'todo' && l.completed === 1) return false;
      if (q && !l.title.toLowerCase().includes(q) && !l.content.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [lessons, searchQuery, difficultyFilter, statusFilter]);

  if (loading && !ncertCatalog) return <div className="loading">{t('loading')}</div>;

  return (
    <div className="subjects-page">
      {/* Interactive Hero Header */}
      <section className="learn-hero-card">
        <div className="learn-hero-content">
          <span className="hero-kicker">Interactive Curriculum & Adaptive Learning</span>
          <h1 className="learn-hero-title">Learn & Master 📖</h1>
          <p className="learn-hero-subtitle">
            Explore NCERT-aligned textbooks for Classes 1–8 with chapter reading guides and practice quizzes, or dive into adaptive subject mastery paths.
          </p>
        </div>

        {/* Recommended Lesson Spotlight Card */}
        {recommendedItem && (
          <div className="learn-spotlight-card">
            <div className="spotlight-badge">
              <span className="spotlight-sparkle">⭐</span>
              <span>Next Recommended Study</span>
            </div>
            <div className="spotlight-body">
              <span className="spotlight-icon">{recommendedItem.icon}</span>
              <div className="spotlight-info">
                <span className="spotlight-subject">
                  {recommendedItem.subjectName} {recommendedItem.grade ? `· Class ${recommendedItem.grade}` : ''}
                </span>
                <h4 className="spotlight-title">{recommendedItem.title}</h4>
              </div>
            </div>
            <div className="spotlight-actions">
              <Link to={recommendedItem.link} className="btn btn-primary btn-sm spotlight-cta">
                Continue Learning →
              </Link>
              <Link to={recommendedItem.tutorLink} className="btn btn-secondary btn-sm spotlight-tutor-btn" title="Ask AI Tutor for help on this chapter">
                🤖 Ask AI Tutor
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Interactive Controls Bar: Mode Switcher & Global Search */}
      <div className="learn-controls-panel">
        <div className="learn-mode-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'ncert'}
            className={`mode-tab-btn ${viewMode === 'ncert' ? 'active' : ''}`}
            onClick={() => setViewMode('ncert')}
          >
            <span className="tab-icon">📚</span>
            <span>NCERT Textbooks</span>
            <span className="tab-badge">Classes 1–8</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'adaptive'}
            className={`mode-tab-btn ${viewMode === 'adaptive' ? 'active' : ''}`}
            onClick={() => setViewMode('adaptive')}
          >
            <span className="tab-icon">🎯</span>
            <span>Adaptive Lessons</span>
            <span className="tab-badge">{subjects.length} Subjects</span>
          </button>
        </div>

        <div className="learn-search-box">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={viewMode === 'ncert' ? 'Search NCERT chapters or concepts...' : 'Search lessons and topics...'}
            aria-label="Search learning topics"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: NCERT Textbooks & Chapters (Classes 1–8)
          ========================================================================= */}
      {viewMode === 'ncert' && (
        <section className="ncert-library" aria-labelledby="ncert-library-title">
          {/* Class Selector Pills */}
          <div className="ncert-class-strip">
            <span className="strip-label">Select Class:</span>
            <div className="class-pills-row">
              {(ncertCatalog?.classes || Array.from({ length: 8 }, (_, i) => ({ grade: i + 1, title: `Class ${i + 1}` }))).map((c) => (
                <button
                  key={c.grade}
                  type="button"
                  className={`class-pill-btn ${selectedGrade === c.grade ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedGrade(c.grade);
                    setSubjectFilter('all');
                  }}
                >
                  <span className="pill-grade-num">{c.grade}</span>
                  <span className="pill-grade-label">Class {c.grade}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Regional Language Subject Selector */}
          <div className="ncert-language-subject-bar">
            <div className="lang-bar-left">
              <div className="lang-bar-badge">
                <span className="lang-bar-icon" aria-hidden="true">🌐</span>
                <span className="lang-bar-title">Language Subject</span>
              </div>
              <p className="lang-bar-desc">
                Currently showing <strong>{LANGUAGES.find((l) => l.code === (activeLangSubject || lang))?.native || activeLangSubject}</strong> subject for Class {selectedGrade}. Hindi is available as optional.
              </p>
            </div>

            <div className="lang-subject-quick-pills">
              {[
                { code: 'te', label: 'Telugu', native: 'తెలుగు', icon: 'తె' },
                { code: 'ta', label: 'Tamil', native: 'தமிழ்', icon: 'த' },
                { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', icon: 'ಕ' },
                { code: 'ml', label: 'Malayalam', native: 'മലയാളം', icon: 'മ' },
                { code: 'hi', label: 'Hindi', native: 'हिन्दी', icon: 'अ' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={`lang-pill-btn ${(activeLangSubject || lang) === item.code ? 'active' : ''}`}
                  onClick={() => {
                    setActiveLangSubject(item.code);
                    setSubjectFilter('all');
                  }}
                  title={`Show ${item.native} (${item.label}) Subject`}
                >
                  <span className="lang-pill-icon">{item.icon}</span>
                  <span>{item.native}</span>
                </button>
              ))}

              <div className="all-langs-select-wrapper">
                <select
                  className="all-langs-select"
                  value={activeLangSubject || lang}
                  onChange={(e) => {
                    setActiveLangSubject(e.target.value);
                    setSubjectFilter('all');
                  }}
                  aria-label="Select any of the 18 languages"
                >
                  <option value="" disabled>All 18 Languages...</option>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} ({l.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Class Overview & Stats Header */}
          <div className="ncert-class-header">
            <div className="class-header-left">
              <h2>Class {selectedGrade} Curriculum</h2>
              <p>NCERT textbooks with chapter summaries, vocabulary, and mixed-format practice quizzes.</p>
            </div>

            <div className="class-progress-card">
              <div className="class-progress-labels">
                <span className="progress-title">Class Progress</span>
                <span className="progress-fraction">
                  <strong>{classStats.completedChapters}</strong> / {classStats.totalChapters} Chapters ({classStats.percent}%)
                </span>
              </div>
              <div className="progress-bar class-progress-bar">
                <div className="progress-bar-fill" style={{ width: `${classStats.percent}%` }} />
              </div>
            </div>
          </div>

          {/* Quick Subject Filter Chips for this Class */}
          {grade && grade.subjects.length > 1 && (
            <div className="ncert-subject-filter-chips">
              <button
                type="button"
                className={`subject-chip ${subjectFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSubjectFilter('all')}
              >
                All Subjects ({grade.subjects.length})
              </button>
              {grade.subjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`subject-chip ${subjectFilter === s.id ? 'active' : ''}`}
                  onClick={() => setSubjectFilter(s.id)}
                >
                  <span aria-hidden="true">{s.icon}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search Result Indicator */}
          {searchQuery && (
            <div className="search-feedback-banner">
              <span>Showing search results for "<strong>{searchQuery}</strong>" in Class {selectedGrade}</span>
              <button type="button" className="btn-link" onClick={() => setSearchQuery('')}>Clear filter</button>
            </div>
          )}

          {/* Subject Books Grid */}
          {filteredNcertSubjects.length > 0 ? (
            <div className="ncert-subject-list">
              {filteredNcertSubjects.map((book) => {
                const completedInBook = book.chapters.filter((c) => c.completed).length;
                const bookPercent = book.chapters.length > 0 ? Math.round((completedInBook / book.chapters.length) * 100) : 0;

                return (
                  <section className="ncert-subject card" key={book.id}>
                    <header className="ncert-subject-heading">
                      <span className="book-icon-badge" aria-hidden="true">{book.icon}</span>
                      <div className="book-heading-text">
                        <h3>{book.name}</h3>
                        <div className="book-meta-line">
                          <span>{book.chapters.length} chapters · Class {selectedGrade}</span>
                          <span className="book-completion-tag">{completedInBook}/{book.chapters.length} done</span>
                        </div>
                      </div>
                    </header>

                    <ol className="ncert-chapter-list">
                      {book.chapters.map((chapter, index) => {
                        const tutorLink = `/tutor?topic=${encodeURIComponent(book.name)}&chapter=${encodeURIComponent(chapter.title)}`;
                        return (
                          <li key={chapter.id} className="ncert-chapter-item">
                            <div className="chapter-main-row">
                              <span className="ncert-chapter-number">{String(index + 1).padStart(2, '0')}</span>
                              <div className="chapter-info-col">
                                <span className="chapter-title-text">{chapter.title}</span>
                                <div className="chapter-sub-meta">
                                  {chapter.completed ? (
                                    <span className="ncert-chapter-status completed">
                                      ✓ Passed ({chapter.bestAccuracy}%)
                                    </span>
                                  ) : (
                                    <span className="ncert-chapter-status pending">Ready to study</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="chapter-actions-row">
                              <SpeakButton
                                text={`${book.name}, Chapter ${index + 1}: ${chapter.title}`}
                                className="btn btn-sm chapter-voice-btn"
                              />
                              <Link
                                to={tutorLink}
                                className="btn btn-sm chapter-tutor-btn"
                                title="Ask AI Tutor about this chapter"
                              >
                                <span>🤖</span>
                                <span className="low-literacy-hide">Tutor</span>
                              </Link>
                              <Link
                                to={`/learn/ncert/${selectedGrade}/${book.id}/${chapter.id}`}
                                className="btn btn-sm btn-primary chapter-study-btn"
                              >
                                <span>Study & Quiz</span>
                                <span aria-hidden="true">→</span>
                              </Link>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="empty-search-card">
              <span className="empty-icon">🔍</span>
              <h3>No chapters found matching "{searchQuery}"</h3>
              <p>Try searching for a different keyword or select "All Subjects".</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSearchQuery(''); setSubjectFilter('all'); }}>
                Reset Filters
              </button>
            </div>
          )}

          {/* Official NCERT Link footer */}
          <div className="ncert-footer-bar">
            <span>Official textbooks published by the National Council of Educational Research and Training (NCERT).</span>
            <a
              className="btn btn-secondary btn-sm"
              href={ncertCatalog?.textbookUrl || 'https://ncert.nic.in/textbook.php'}
              target="_blank"
              rel="noreferrer"
            >
              Open official NCERT portal ↗
            </a>
          </div>
        </section>
      )}

      {/* =========================================================================
          VIEW 2: Adaptive Competency Lessons
          ========================================================================= */}
      {viewMode === 'adaptive' && (
        <section className="existing-learning-library" aria-labelledby="other-lessons-title">
          <div className="subjects-header">
            <div>
              <h2 id="other-lessons-title" className="page-title">{t('subjects_title')} 📖</h2>
              <p className="page-subtitle">{t('subjects_sub')}</p>
            </div>
          </div>

          {/* Subject Cards Grid */}
          <div className="subjects-grid">
            {subjects.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`subject-select-card ${selected === s.id ? 'active' : ''}`}
                onClick={() => selectSubject(s.id)}
              >
                {selected === s.id && <span className="subject-active-indicator">✓</span>}
                <div className="subject-icon-box">{s.icon}</div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
              </button>
            ))}
          </div>

          {/* Lessons Section for selected subject */}
          <section className="lessons-section">
            <div className="lessons-section-header">
              <div className="lessons-header-left">
                <h2>{subjects.find((s) => s.id === selected)?.name || 'Lessons'}</h2>
                <span className="lessons-count-pill">{filteredLessons.length} {t('subjects_lessons')}</span>
              </div>

              {/* Lesson Filter Controls */}
              <div className="lesson-filters-bar">
                <div className="filter-group">
                  <label htmlFor="diff-filter">Difficulty:</label>
                  <select
                    id="diff-filter"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="status-filter">Status:</label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Lessons</option>
                    <option value="todo">To Do</option>
                    <option value="completed">Completed ✓</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredLessons.length > 0 ? (
              <div className="lessons-grid">
                {filteredLessons.map((l) => {
                  const subjectObj = subjects.find((s) => s.id === selected);
                  const tutorLink = `/tutor?topic=${encodeURIComponent(subjectObj?.name || '')}&chapter=${encodeURIComponent(l.title)}`;

                  return (
                    <div key={l.id} className="lesson-card">
                      <div className="lesson-card-top">
                        <span className="lesson-chapter-overline">
                          {t('subjects_chapter_number', { number: l.order_index })}
                        </span>
                        <span className={`badge-pill difficulty-${l.difficulty}`}>{diffLabel(l.difficulty)}</span>
                      </div>

                      <div className="lesson-header">
                        <h3>{l.title}</h3>
                      </div>

                      <p className="lesson-card-preview">{l.content}</p>

                      <div className="lesson-meta">
                        <span className="lesson-xp">⚡ +{l.xp_reward} XP</span>
                        {l.completed === 1 && (
                          <span className="completed-tag">✓ {t('subjects_completed')}</span>
                        )}
                      </div>

                      <div className="lesson-progress-wrap">
                        <div className="lesson-progress-header">
                          <span>{t('subjects_mastery')}</span>
                          <span>{Math.round(l.mastery)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${l.mastery}%` }} />
                        </div>
                      </div>

                      <div className="lesson-actions">
                        <Link to={`/lesson/${l.id}`} className="btn btn-secondary btn-sm">{t('read')}</Link>
                        <Link to={`/quiz/${l.id}`} className="btn btn-primary btn-sm">{t('subjects_quiz')}</Link>
                        <Link to={tutorLink} className="btn btn-sm lesson-tutor-btn" title="Ask AI Tutor for help on this lesson">
                          🤖 Tutor
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-search-card">
                <span className="empty-icon">📖</span>
                <h3>No lessons match the selected filters</h3>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setDifficultyFilter('all'); setStatusFilter('all'); setSearchQuery(''); }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </section>
        </section>
      )}
    </div>
  );
}
