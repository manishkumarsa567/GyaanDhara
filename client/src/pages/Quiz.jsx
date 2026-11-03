import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Quiz.css';

const questionTypes = [
  { id: 'mcq', icon: '◉', titleKey: 'quiz_type_multiple_choice', title: 'Multiple choice', description: 'Choose the best answer from four options.' },
  { id: 'true_false', icon: '✓', titleKey: 'engine_true_false', title: 'True or false', description: 'Read a statement and decide if it is correct.' },
  { id: 'fill_blank', icon: '✎', titleKey: 'engine_fill_blank', title: 'Fill in the blank', description: 'Recall the key word or number yourself.' },
];
const difficultyLevels = [
  { id: 'beginner', title: 'Beginner', description: 'Start with the core ideas.' },
  { id: 'easy', title: 'Easy', description: 'Build confidence with the basics.' },
  { id: 'medium', title: 'Medium', description: 'Practice applying what you learned.' },
  { id: 'hard', title: 'Hard', description: 'Try more challenging questions.' },
  { id: 'expert', title: 'Expert', description: 'Take on the toughest challenge.' },
];

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { t, lang } = useLanguage();
  const [quiz, setQuiz] = useState(null);
  const [questionType, setQuestionType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('beginner');
  const [progression, setProgression] = useState(null);
  const [progressionLoading, setProgressionLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const displayLabel = (key, fallback) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  const diffLabel = (value) => displayLabel(`diff_${value}`, value.charAt(0).toUpperCase() + value.slice(1));
  const typeLabel = (type) => displayLabel(type.titleKey, type.title);

  useEffect(() => {
    let active = true;
    setProgressionLoading(true);
    setError('');
    api.quizProgression(id)
      .then((data) => {
        if (!active) return;
        setProgression(data);
        setDifficulty(data.unlockedDifficulty);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your learning level.');
      })
      .finally(() => {
        if (active) setProgressionLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  const startQuiz = async () => {
    setLoading(true);
    setError('');
    setAnswers({});
    setResult(null);
    try {
      const data = await api.quiz(id, lang, questionType, difficulty);
      setProgression(data.progression);
      setQuiz(data);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, answer) => {
    setAnswers((previous) => ({ ...previous, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!quiz || quiz.questions.some((question) => (
      answers[question.id] === undefined
      || (question.type === 'fill_blank' && !String(answers[question.id]).trim())
    ))) {
      setError(t('error_answer_all'));
      return;
    }
    setError('');
    setSubmitting(true);
    const payload = quiz.questions.map((question) => ({
      questionId: question.id,
      selectedIndex: answers[question.id],
      answerText: answers[question.id],
    }));
    try {
      const response = await api.submitQuiz(id, {
        answers: payload,
        difficulty,
        questionType,
        lang,
      });
      setResult(response);
      refreshUser({ ...user, xp: response.newXp, level: response.newLevel });
    } catch (requestError) {
      setError(requestError.message || 'Unable to submit your answers.');
    } finally {
      setSubmitting(false);
    }
  };

  const returnToSetup = async () => {
    setProgressionLoading(true);
    setError('');
    try {
      const data = await api.quizProgression(id);
      setProgression(data);
      setDifficulty(data.unlockedDifficulty);
      setQuiz(null);
      setResult(null);
      setAnswers({});
    } catch (requestError) {
      setError(requestError.message || 'Unable to refresh your learning level.');
    } finally {
      setProgressionLoading(false);
    }
  };

  if (progressionLoading) return <div className="loading">{t('loading')}</div>;

  if (loading) return <div className="loading">{t('loading')}</div>;

  if (!quiz) {
    return (
      <div className="quiz-page quiz-setup">
        <Link to={`/lesson/${id}`}>← {t('back')}</Link>
        <div className="quiz-setup-heading">
          <span className="quiz-setup-kicker">YOUR PRACTICE, YOUR WAY</span>
          <h1 className="page-title">Choose your quiz</h1>
          <p className="page-subtitle">Pick a question style and a challenge level. Your quiz will have five questions.</p>
        </div>

        <section className="quiz-setup-section" aria-labelledby="question-style-title">
          <div className="quiz-section-heading">
            <span className="quiz-step">01</span>
            <div>
              <h2 id="question-style-title">How would you like to practice?</h2>
              <p>Choose the question format that works best for you.</p>
            </div>
          </div>
          <div className="quiz-type-grid">
            {questionTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`quiz-choice-card ${questionType === type.id ? 'active' : ''}`}
                aria-pressed={questionType === type.id}
                onClick={() => setQuestionType(type.id)}
              >
                <span className="quiz-choice-icon" aria-hidden="true">{type.icon}</span>
                <span className="quiz-choice-title">{typeLabel(type)}</span>
                <span className="quiz-choice-description">{type.description}</span>
                <span className="quiz-choice-check" aria-hidden="true">{questionType === type.id ? '✓' : '+'}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="quiz-setup-section" aria-labelledby="difficulty-title">
          <div className="quiz-section-heading">
            <span className="quiz-step">02</span>
            <div>
              <h2 id="difficulty-title">Set your challenge level</h2>
              <p>Higher levels earn more XP for correct answers.</p>
            </div>
          </div>
          <div className="quiz-level-list">
            {difficultyLevels.map((level, index) => (
              <button
                key={level.id}
                type="button"
                className={`quiz-level-option ${difficulty === level.id ? 'active' : ''} ${!progression?.unlockedLevels.includes(level.id) ? 'locked' : ''}`}
                aria-pressed={difficulty === level.id}
                disabled={!progression?.unlockedLevels.includes(level.id)}
                onClick={() => setDifficulty(level.id)}
              >
                <span className="quiz-level-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="quiz-level-copy">
                  <strong>{level.title} {['hard', 'expert'].includes(level.id) && <span className="boss-quiz-tag">{t('boss_quiz_badge')}</span>}</strong>
                  <span>{level.description}</span>
                </span>
                <span className="quiz-level-indicator" aria-hidden="true">
                  {!progression?.unlockedLevels.includes(level.id) ? '🔒' : difficulty === level.id ? '●' : '○'}
                </span>
              </button>
            ))}
          </div>
          <p className="quiz-progression-note">
            Score at least {progression?.passPercent ?? 75}% to unlock the next level. {t('boss_quiz_reward_note')}
          </p>
        </section>

        {error && <p className="quiz-error" role="alert">{error}</p>}
        <button type="button" className="btn btn-primary btn-lg quiz-start-button" onClick={startQuiz} disabled={!progression}>
          Start 5-question practice <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  if (result) {
    const percent = Math.round((result.score / result.total) * 100);
    return (
      <div className="quiz-result card">
        <h1 className="page-title">{t('quiz_complete')} 🎉</h1>
        <p className="quiz-result-mode">{typeLabel(questionTypes.find((type) => type.id === questionType))} · {diffLabel(difficulty)}</p>
        <div className="result-score">{percent}%</div>
        <p>{result.score}/{result.total} • +{result.xpEarned} XP</p>
        {result.passedLevel ? (
          <p className="quiz-level-feedback passed">
            {difficulty === 'expert'
              ? 'Expert level passed! You have completed every challenge level.'
              : `${diffLabel(difficulty)} level passed — ${diffLabel(result.progression.unlockedDifficulty)} is now unlocked.`}
          </p>
        ) : (
          <p className="quiz-level-feedback">
            Score at least {result.passPercent}% to unlock the next level.
            {result.progression.consecutiveFailures > 0 && result.progression.consecutiveFailures < 3
              ? ` Consecutive unsuccessful attempts: ${result.progression.consecutiveFailures}.`
              : ''}
          </p>
        )}
        {result.mysteryBox && <p className="quiz-level-feedback passed">🎁 {t('boss_box_earned')}</p>}
        {result.streakFreezeEarned && <p className="quiz-level-feedback passed">❄️ {t('boss_freeze_earned')}</p>}
        {result.hint && (
          <aside className="quiz-hint-panel" aria-label="Unlocked hint">
            <strong>💡 Hint unlocked after 3 consecutive unsuccessful attempts</strong>
            <p>{result.hint}</p>
          </aside>
        )}
        {error && <p className="quiz-error" role="alert">{error}</p>}
        <p>{t('quiz_mastery')}: {result.mastery}% {result.completed && `— ${t('quiz_lesson_done')}`}</p>
        <div className="result-breakdown">
          {result.results.map((item, index) => (
            <div key={item.questionId} className={`result-item ${item.correct ? 'correct' : 'wrong'}`}>
              <span>{t('quiz_q_short')}{index + 1}: {item.correct ? '✓' : '✗'}</span>
              {!item.correct && item.explanation && <p>{item.explanation}</p>}
            </div>
          ))}
        </div>
        <div className="quiz-result-actions">
          <button type="button" className="btn btn-primary" onClick={returnToSetup}>
            Try another format or level
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            {t('nav_dashboard')}
          </button>
          <Link to="/subjects" className="btn btn-secondary">{t('quiz_more')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <button
        type="button"
        className="quiz-back-button"
        onClick={() => {
          setQuiz(null);
          setAnswers({});
          setError('');
        }}
      >
        ← Change quiz settings
      </button>
      <div className="quiz-heading">
        <div>
          <h1 className="page-title" style={{ marginTop: '1rem' }}>{t('quiz_title')}</h1>
          <p className="page-subtitle">
            {typeLabel(questionTypes.find((type) => type.id === questionType))}
            {' · '}
            <span className={`badge-pill difficulty-${difficulty}`}>{diffLabel(difficulty)}</span>
          </p>
        </div>
        <span className="quiz-question-count">{Object.keys(answers).length}/{quiz.questions.length} answered</span>
      </div>

      {quiz.questions.map((question, index) => (
        <div key={question.id} className="card quiz-question">
          <h3><span className="quiz-question-index">{String(index + 1).padStart(2, '0')}</span>{question.question}</h3>
          {question.hint && (
            <aside className="quiz-hint-panel" aria-label="Unlocked hint">
              <strong>💡 Hint</strong>
              <p>{question.hint}</p>
            </aside>
          )}
          {question.type === 'fill_blank' ? (
            <label className="fill-blank-answer">
              <span>Your answer</span>
              <input
                type="text"
                value={answers[question.id] ?? ''}
                onChange={(event) => selectAnswer(question.id, event.target.value)}
                placeholder="Type your answer here"
                autoComplete="off"
              />
            </label>
          ) : (
            <div className="options">
              {question.options.map((option, optionIndex) => (
                <button
                  key={option}
                  type="button"
                  className={`option-btn ${answers[question.id] === optionIndex ? 'selected' : ''}`}
                  aria-pressed={answers[question.id] === optionIndex}
                  onClick={() => selectAnswer(question.id, optionIndex)}
                >
                  {question.type === 'true_false' && <span className="true-false-mark">{optionIndex === 0 ? '✓' : '✕'}</span>}
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {error && <p className="quiz-error" role="alert">{error}</p>}
      <button
        type="button"
        className="btn btn-primary btn-lg"
        onClick={handleSubmit}
        disabled={submitting}
        style={{ marginTop: '1rem' }}
      >
        {submitting ? t('quiz_submitting') : t('quiz_submit')}
      </button>
    </div>
  );
}
