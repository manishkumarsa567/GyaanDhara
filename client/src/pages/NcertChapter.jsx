import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import SpeakButton from '../components/SpeakButton';
import './NcertChapter.css';

export default function NcertChapter() {
  const { grade, subjectId, chapterId } = useParams();
  const { t } = useLanguage();
  const [chapter, setChapter] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setAnswers({});
    setResult(null);
    setStarted(false);
    api.ncertChapter(grade, subjectId, chapterId)
      .then((data) => {
        if (active) setChapter(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load this chapter.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [grade, subjectId, chapterId]);

  const setAnswer = (questionId, answer) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  };

  const submitQuiz = async (event) => {
    event.preventDefault();
    if (!chapter || chapter.questions.some((question) => (
      answers[question.id] === undefined
      || (question.type === 'fill_blank' && !String(answers[question.id]).trim())
    ))) {
      setError('Answer each question before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await api.submitNcertQuiz(
        grade,
        subjectId,
        chapterId,
        chapter.questions.map((question) => ({ questionId: question.id, answer: answers[question.id] })),
      );
      setResult(response);
      setChapter((current) => ({ ...current, progress: response.progress }));
    } catch (requestError) {
      setError(requestError.message || 'Unable to submit your quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error && !chapter) {
    return (
      <section className="card ncert-chapter-error" role="alert">
        <h1>Chapter unavailable</h1>
        <p>{error}</p>
        <Link to="/subjects" className="btn btn-primary">Back to Learn</Link>
      </section>
    );
  }
  if (!chapter) return null;

  return (
    <article className="ncert-reader">
      <Link to="/subjects" className="ncert-back-link">← Back to Classes</Link>
      <header className="ncert-reader-header">
        <div className="ncert-reader-subject">{chapter.classTitle} · {chapter.subject.icon} {chapter.subject.name}</div>
        <h1>{chapter.chapter.title}</h1>
        <p>NCERT-aligned chapter guide</p>
        {chapter.progress.completed && (
          <span className="ncert-completion-badge">✓ Completed · Best score {chapter.progress.bestAccuracy}%</span>
        )}
      </header>

      <section className="ncert-reading-card card" aria-labelledby="ncert-reading-title">
        <div className="ncert-reading-heading">
          <h2 id="ncert-reading-title">Read and learn</h2>
          <SpeakButton text={chapter.chapter.reading} className="btn btn-secondary" />
        </div>
        <p className="ncert-reading-text">{chapter.chapter.reading}</p>
        <aside className="ncert-source-note">
          <span>📘</span>
          <p>For the complete textbook, open the official NCERT book listing. This guide and its practice questions are original study material.</p>
          <a href={chapter.textbookUrl} target="_blank" rel="noreferrer">Official NCERT textbooks ↗</a>
        </aside>
        {!started && (
          <button type="button" className="btn btn-primary ncert-start-quiz" onClick={() => setStarted(true)}>
            I’ve read this chapter — start quiz
          </button>
        )}
      </section>

      {started && (
        <section className="ncert-quiz card" aria-labelledby="ncert-quiz-title">
          <div className="ncert-quiz-heading">
            <div>
              <span className="ncert-kicker">CHAPTER CHECK</span>
              <h2 id="ncert-quiz-title">Show what you learned</h2>
            </div>
            <span>3 questions · MCQ, True/False, Fill in the blank</span>
          </div>
          {result ? (
            <div className="ncert-quiz-result" role="status">
              <div className="ncert-result-score">{result.score}/{result.total}</div>
              <h3>{result.completed ? 'Chapter complete — well done!' : 'Good practice. Read again and try once more.'}</h3>
              <p>{result.accuracy}% correct · Best score: {result.progress.bestAccuracy}%</p>
              <ol className="ncert-result-review">
                {chapter.questions.map((question) => {
                  const questionResult = result.results.find((item) => item.questionId === question.id);
                  return (
                    <li key={question.id}>
                      <strong>{questionResult?.correct ? '✓' : '↻'} {question.prompt}</strong>
                      <p>{question.explanation}</p>
                      {!questionResult?.correct && <span>Correct answer: {questionResult?.correctAnswer}</span>}
                    </li>
                  );
                })}
              </ol>
              <button type="button" className="btn btn-secondary" onClick={() => {
                setAnswers({});
                setResult(null);
              }}>
                Try quiz again
              </button>
            </div>
          ) : (
            <form onSubmit={submitQuiz}>
              <div className="ncert-questions">
                {chapter.questions.map((question, index) => (
                  <fieldset className="ncert-question" key={question.id}>
                    <legend><span>{String(index + 1).padStart(2, '0')}</span> {question.prompt}</legend>
                    {question.type === 'mcq' && (
                      <div className="ncert-answer-options">
                        {question.options.map((option, optionIndex) => (
                          <label className={answers[question.id] === optionIndex ? 'selected' : ''} key={`${question.id}-${optionIndex}`}>
                            <input
                              type="radio"
                              name={question.id}
                              checked={answers[question.id] === optionIndex}
                              onChange={() => setAnswer(question.id, optionIndex)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {question.type === 'true_false' && (
                      <div className="ncert-true-false">
                        {[true, false].map((value) => (
                          <button
                            type="button"
                            key={String(value)}
                            className={answers[question.id] === value ? 'selected' : ''}
                            aria-pressed={answers[question.id] === value}
                            onClick={() => setAnswer(question.id, value)}
                          >
                            {value ? 'True' : 'False'}
                          </button>
                        ))}
                      </div>
                    )}
                    {question.type === 'fill_blank' && (
                      <input
                        type="text"
                        value={answers[question.id] || ''}
                        onChange={(event) => setAnswer(question.id, event.target.value)}
                        aria-label="Fill in the blank answer"
                        placeholder="Type your answer"
                      />
                    )}
                  </fieldset>
                ))}
              </div>
              {error && <p className="ncert-form-error" role="alert">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Checking answers…' : 'Submit chapter quiz'}
              </button>
            </form>
          )}
        </section>
      )}
    </article>
  );
}
