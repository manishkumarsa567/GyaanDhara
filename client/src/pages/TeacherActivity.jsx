import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import './TeacherActivity.css';

export default function TeacherActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activity, setActivity] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.studentActivity(id)
      .then((data) => { if (active) setActivity(data); })
      .catch((requestError) => { if (active) setError(requestError.message || t('student_activity_load_error')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, t]);

  const submit = async (event) => {
    event.preventDefault();
    if (!activity || activity.questions.some((question) => answers[question.id] === undefined)) {
      setError(t('error_answer_all'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const score = await api.submitStudentActivity(Number(id), activity.questions.map((question) => ({
        questionId: question.id,
        selectedIndex: answers[question.id],
      })));
      setResult(score);
    } catch (requestError) {
      setError(requestError.message || t('student_activity_submit_error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error && !activity) {
    return <section className="card activity-error" role="alert"><p>{error}</p><Link className="btn btn-secondary" to="/dashboard">{t('nav_dashboard')}</Link></section>;
  }
  if (!activity) return null;

  return (
    <div className="teacher-activity-page">
      <Link to="/dashboard" className="activity-back-link">← {t('nav_dashboard')}</Link>
      <header className="activity-heading">
        <span aria-hidden="true">📝</span>
        <div><p>{activity.subject || t('studio_any_subject')}</p><h1>{activity.title}</h1>{activity.description && <p>{activity.description}</p>}</div>
      </header>
      {result ? (
        <section className="card activity-result">
          <span aria-hidden="true">{result.accuracy >= 60 ? '🎉' : '🌱'}</span>
          <h2>{t('student_activity_result')}</h2>
          <strong>{result.score}/{result.total}</strong>
          <p>{result.accuracy}%</p>
          <ol className="activity-results-list">
            {result.results.map((item, index) => (
              <li key={item.questionId} className={item.correct ? 'correct' : 'incorrect'}>
                <strong>{index + 1}. {item.correct ? `✓ ${t('ge_correct')}` : t('quiz_wrong')}</strong>
                {!item.correct && <span>{t('student_correct_option')}: {activity.questions[index].options[item.correctIndex]}</span>}
                {item.explanation && <p>{item.explanation}</p>}
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard')}>{t('student_back_dashboard')}</button>
        </section>
      ) : (
        <form className="activity-questions" onSubmit={submit}>
          {activity.questions.map((question, index) => (
            <fieldset className="card activity-question" key={question.id}>
              <legend>{t('studio_question_number', { number: index + 1 })}</legend>
              <h2>{question.prompt}</h2>
              <div className="activity-options">
                {question.options.map((option, optionIndex) => (
                  <label className={answers[question.id] === optionIndex ? 'selected' : ''} key={optionIndex}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optionIndex}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {error && <p className="activity-form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? t('studio_publishing') : `✅ ${t('student_submit_activity')}`}</button>
        </form>
      )}
    </div>
  );
}
