import { useEffect, useState } from 'react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import './TeacherStudio.css';

const EMPTY_QUESTION = { prompt: '', options: ['', '', '', ''], answerIndex: 0, explanation: '' };
const inputDateTime = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

function getDefaultDates() {
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + 30);
  return { startsAt: inputDateTime(startsAt), endsAt: inputDateTime(endsAt) };
}

export default function TeacherStudio() {
  const { t, lang } = useLanguage();
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [seasonalItems, setSeasonalItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', subjectId: '', questions: [{ ...EMPTY_QUESTION }] });
  const [studentIds, setStudentIds] = useState([]);
  const [seasonalForm, setSeasonalForm] = useState({ title: '', body: '', subjectId: '', ...getDefaultDates() });
  const [loading, setLoading] = useState(true);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [savingSeasonal, setSavingSeasonal] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.teacherSubjects(lang), api.teacherStudents(), api.teacherStudioQuizzes(), api.teacherSeasonalContent(), api.teacherMasteryGroups(lang)])
      .then(([subjectList, studentList, savedQuizzes, savedSeasonal, masteryGroups]) => {
        if (!active) return;
        setSubjects(subjectList);
        setStudents(studentList);
        setQuizzes(savedQuizzes);
        setSeasonalItems(savedSeasonal);
        setGroups(masteryGroups);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || t('studio_load_error'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [lang, t]);

  const updateQuestion = (index, updates) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) => (
        questionIndex === index ? { ...question, ...updates } : question
      )),
    }));
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setNotice('');
    try {
      if (file.size > 256 * 1024) throw new Error(t('studio_file_too_large'));
      const imported = JSON.parse(await file.text());
      if (!imported || typeof imported !== 'object' || Array.isArray(imported)) {
        throw new Error(t('studio_invalid_json'));
      }
      const rawQuestions = Array.isArray(imported.questions) ? imported.questions : [];
      if (rawQuestions.some((question) => !question || typeof question !== 'object' || Array.isArray(question))) {
        throw new Error(t('studio_invalid_json'));
      }
      const questions = rawQuestions.map((question) => ({
        prompt: question.prompt ?? question.question ?? '',
        options: Array.isArray(question.options) ? question.options : ['', '', '', ''],
        answerIndex: Number(question.answerIndex ?? question.correctIndex ?? 0),
        explanation: question.explanation || '',
      }));
      setQuizForm({
        title: typeof imported.title === 'string' ? imported.title : '',
        description: typeof imported.description === 'string' ? imported.description : '',
        subjectId: imported.subjectId ? String(imported.subjectId) : '',
        questions: questions.length ? questions : [{ ...EMPTY_QUESTION }],
      });
      setNotice(t('studio_json_loaded'));
    } catch (parseError) {
      setError(parseError.message || t('studio_invalid_json'));
    } finally {
      event.target.value = '';
    }
  };

  const saveQuiz = async (event) => {
    event.preventDefault();
    setSavingQuiz(true);
    setError('');
    setNotice('');
    const payload = {
      ...quizForm,
      studentIds,
      subjectId: quizForm.subjectId ? Number(quizForm.subjectId) : null,
      questions: quizForm.questions.map((question) => ({
        ...question,
        options: question.options.map((option) => option.trim()),
        answerIndex: Number(question.answerIndex),
      })),
    };
    try {
      const savedQuiz = await api.createTeacherQuiz(payload);
      setQuizzes((current) => [savedQuiz, ...current]);
      setQuizForm({ title: '', description: '', subjectId: '', questions: [{ ...EMPTY_QUESTION }] });
      setNotice(t('studio_quiz_created'));
    } catch (saveError) {
      setError(saveError.message || t('studio_save_error'));
    } finally {
      setSavingQuiz(false);
    }
  };

  const saveSeasonal = async (event) => {
    event.preventDefault();
    setSavingSeasonal(true);
    setError('');
    setNotice('');
    try {
      const publishedItem = await api.publishSeasonalContent({
        ...seasonalForm,
        subjectId: seasonalForm.subjectId ? Number(seasonalForm.subjectId) : null,
        startsAt: new Date(seasonalForm.startsAt).toISOString(),
        endsAt: new Date(seasonalForm.endsAt).toISOString(),
      });
      setSeasonalItems((current) => [...current, publishedItem].sort((left, right) => new Date(left.starts_at) - new Date(right.starts_at)));
      setSeasonalForm({ title: '', body: '', subjectId: '', ...getDefaultDates() });
      setNotice(t('studio_seasonal_published'));
    } catch (saveError) {
      setError(saveError.message || t('studio_save_error'));
    } finally {
      setSavingSeasonal(false);
    }
  };

  if (loading) return <section className="card teacher-studio-loading" aria-label={t('studio_title')}>{t('loading')}</section>;

  return (
    <div className="teacher-studio">
      <header className="teacher-studio-heading">
        <div>
          <p className="teacher-studio-eyebrow">🧰 {t('studio_eyebrow')}</p>
          <h2>{t('studio_title')}</h2>
          <p>{t('studio_subtitle')}</p>
        </div>
      </header>

      {error && <p className="studio-message error" role="alert">{error}</p>}
      {notice && <p className="studio-message success" role="status">{notice}</p>}

      <section className="card studio-panel">
        <div className="studio-panel-heading">
          <span aria-hidden="true">📝</span>
          <div><h3>{t('studio_quiz_title')}</h3><p>{t('studio_quiz_help')}</p></div>
        </div>
        <label className="studio-import">
          <span>📥 {t('studio_import_json')}</span>
          <input type="file" accept=".json,application/json" onChange={importJson} />
        </label>
        <form className="studio-form" onSubmit={saveQuiz}>
          <label>{t('studio_activity_name')}<input required minLength={3} maxLength={100} value={quizForm.title} onChange={(event) => setQuizForm((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>{t('studio_description')}<textarea maxLength={500} rows={2} value={quizForm.description} onChange={(event) => setQuizForm((current) => ({ ...current, description: event.target.value }))} /></label>
          <label>{t('studio_subject')}<select value={quizForm.subjectId} onChange={(event) => setQuizForm((current) => ({ ...current, subjectId: event.target.value }))}><option value="">{t('studio_any_subject')}</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
          <fieldset className="studio-question">
            <legend>{t('studio_quiz_audience')}</legend>
            <p>{t('studio_quiz_audience_help')}</p>
            {students.length ? (
              <div className="studio-student-list">
                {students.map((student) => (
                  <label key={student.id}>
                    <input
                      type="checkbox"
                      checked={studentIds.includes(student.id)}
                      onChange={(event) => setStudentIds((current) => (
                        event.target.checked
                          ? [...current, student.id]
                          : current.filter((id) => id !== student.id)
                      ))}
                    />
                    {student.name}
                  </label>
                ))}
              </div>
            ) : <p>{t('studio_no_students')}</p>}
          </fieldset>
          {quizForm.questions.map((question, index) => (
            <fieldset className="studio-question" key={index}>
              <legend>{t('studio_question_number', { number: index + 1 })}</legend>
              <label>{t('studio_question')}<textarea required minLength={5} maxLength={400} rows={2} value={question.prompt} onChange={(event) => updateQuestion(index, { prompt: event.target.value })} /></label>
              <div className="studio-options-grid">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex}>{t('studio_option_number', { number: optionIndex + 1 })}
                    <input maxLength={160} value={option} onChange={(event) => updateQuestion(index, { options: question.options.map((value, i) => i === optionIndex ? event.target.value : value) })} />
                  </label>
                ))}
              </div>
              <label>{t('studio_correct_answer')}
                <select value={question.answerIndex} onChange={(event) => updateQuestion(index, { answerIndex: Number(event.target.value) })}>
                  {question.options.map((_, optionIndex) => <option key={optionIndex} value={optionIndex}>{t('studio_option_number', { number: optionIndex + 1 })}</option>)}
                </select>
              </label>
              <label>{t('studio_explanation')}<input maxLength={500} value={question.explanation} onChange={(event) => updateQuestion(index, { explanation: event.target.value })} /></label>
              {quizForm.questions.length > 1 && <button type="button" className="btn btn-secondary btn-sm" onClick={() => setQuizForm((current) => ({ ...current, questions: current.questions.filter((_, i) => i !== index) }))}>{t('studio_remove_question')}</button>}
            </fieldset>
          ))}
          <div className="studio-form-actions">
            <button type="button" className="btn btn-secondary" disabled={quizForm.questions.length >= 20} onClick={() => setQuizForm((current) => ({ ...current, questions: [...current.questions, { ...EMPTY_QUESTION, options: [...EMPTY_QUESTION.options] }] }))}>＋ {t('studio_add_question')}</button>
            <button type="submit" className="btn btn-primary" disabled={savingQuiz}>{savingQuiz ? t('studio_publishing') : `🚀 ${t('studio_publish_quiz')}`}</button>
          </div>
        </form>
        <div className="studio-saved-list">
          <h4>{t('studio_published_quizzes')}</h4>
          {quizzes.length ? quizzes.map((quiz) => <p key={quiz.id}>✅ {quiz.title} <span>{quiz.questionCount} {t('studio_questions_count')}</span></p>) : <p>{t('studio_no_quizzes')}</p>}
        </div>
      </section>

      <section className="card studio-panel">
        <div className="studio-panel-heading">
          <span aria-hidden="true">🌦️</span>
          <div><h3>{t('studio_seasonal_title')}</h3><p>{t('studio_seasonal_help')}</p></div>
        </div>
        <form className="studio-form studio-seasonal-form" onSubmit={saveSeasonal}>
          <label>{t('studio_content_title')}<input required minLength={3} maxLength={120} value={seasonalForm.title} onChange={(event) => setSeasonalForm((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>{t('studio_subject')}<select value={seasonalForm.subjectId} onChange={(event) => setSeasonalForm((current) => ({ ...current, subjectId: event.target.value }))}><option value="">{t('studio_any_subject')}</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
          <label>{t('studio_content')}<textarea required minLength={10} maxLength={5000} rows={4} value={seasonalForm.body} onChange={(event) => setSeasonalForm((current) => ({ ...current, body: event.target.value }))} /></label>
          <div className="studio-options-grid">
            <label>{t('studio_starts')}<input type="datetime-local" required value={seasonalForm.startsAt} onChange={(event) => setSeasonalForm((current) => ({ ...current, startsAt: event.target.value }))} /></label>
            <label>{t('studio_ends')}<input type="datetime-local" required value={seasonalForm.endsAt} onChange={(event) => setSeasonalForm((current) => ({ ...current, endsAt: event.target.value }))} /></label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingSeasonal}>{savingSeasonal ? t('studio_publishing') : `📣 ${t('studio_publish_seasonal')}`}</button>
        </form>
        <div className="studio-saved-list">
          <h4>{t('studio_scheduled_content')}</h4>
          {seasonalItems.length ? seasonalItems.map((item) => <p key={item.id}>📅 {item.title} <span>{new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(item.starts_at))} – {new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(item.ends_at))}</span></p>) : <p>{t('studio_no_seasonal')}</p>}
        </div>
      </section>

      <section className="card studio-panel">
        <div className="studio-panel-heading">
          <span aria-hidden="true">🧠</span>
          <div><h3>{t('studio_groups_title')}</h3><p>{t('studio_groups_help')}</p></div>
        </div>
        {groups.length ? (
          <div className="studio-groups-grid">
            {groups.map((group) => (
              <article className={`studio-group group-${group.groupId}`} key={`${group.subjectId}-${group.groupId}`}>
                <span className="studio-group-subject">{group.subject}</span>
                <h4>{group.group}</h4>
                <p>{group.recommendation}</p>
                <strong>{group.students.length} {t('teacher_students')}</strong>
                <ul>{group.students.map((student) => <li key={student.studentId}>{student.name}<span>{student.mastery === null ? t('studio_no_mastery') : `${student.mastery}%`}</span></li>)}</ul>
              </article>
            ))}
          </div>
        ) : <p>{t('studio_no_groups')}</p>}
        <p className="studio-data-note">{t('studio_groups_note')}</p>
      </section>
    </div>
  );
}
