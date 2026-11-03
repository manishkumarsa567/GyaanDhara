import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import './TeacherDashboard.css';
import TeacherStudio from './TeacherStudio';
import KnowledgeGraph from '../components/KnowledgeGraph';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reportingStudentId, setReportingStudentId] = useState(null);
  const [parentReport, setParentReport] = useState(null);
  const [reportError, setReportError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentGraph, setStudentGraph] = useState([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState('');

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }
    Promise.all([api.teacherStats(lang), api.teacherStudents()])
      .then(([s, st]) => {
        setStats(s);
        setStudents(st);
      })
      .catch((error) => setLoadError(error.message || t('teacher_load_error')))
      .finally(() => setLoading(false));
  }, [user, navigate, lang, t]);

  useEffect(() => {
    if (!students.length) {
      setSelectedStudentId('');
      return;
    }
    setSelectedStudentId((current) => (
      students.some((student) => String(student.id) === current)
        ? current
        : String(students[0].id)
    ));
  }, [students]);

  useEffect(() => {
    if (!selectedStudentId) {
      setStudentGraph([]);
      return undefined;
    }
    let active = true;
    setGraphLoading(true);
    setGraphError('');
    api.teacherKnowledgeGraph(selectedStudentId, lang)
      .then((graph) => { if (active) setStudentGraph(graph); })
      .catch(() => { if (active) setGraphError(t('teacher_knowledge_error')); })
      .finally(() => { if (active) setGraphLoading(false); });
    return () => { active = false; };
  }, [selectedStudentId, lang, t]);

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (loadError || !stats) {
    return <section className="card teacher-load-error" role="alert">{loadError || t('teacher_load_error')}</section>;
  }

  const generateParentReport = async (student) => {
    setReportingStudentId(student.id);
    setParentReport(null);
    setReportError('');
    try {
      const result = await api.teacherWeeklyReport(student.id, lang);
      setParentReport({ ...result, studentName: student.name });
    } catch (error) {
      setReportError(error.message || t('teacher_report_error'));
    } finally {
      setReportingStudentId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">{t('teacher_title')} 👩‍🏫</h1>
      <p className="page-subtitle">{t('teacher_sub')}</p>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="value">{stats.students}</div>
          <div className="label">{t('teacher_students')}</div>
        </div>
        <div className="card stat-card">
          <div className="value">{stats.lessons}</div>
          <div className="label">{t('teacher_lessons')}</div>
        </div>
        <div className="card stat-card">
          <div className="value">{stats.attempts}</div>
          <div className="label">{t('teacher_attempts')}</div>
        </div>
        <div className="card stat-card">
          <div className="value">{stats.avgMastery}%</div>
          <div className="label">{t('teacher_mastery')}</div>
        </div>
      </div>

      <section className="card teacher-knowledge-section">
        <div className="teacher-knowledge-controls">
          <div>
            <h2>{t('teacher_knowledge_graph')}</h2>
            <p>{t('teacher_knowledge_select')}</p>
          </div>
          {students.length > 0 && (
            <label>
              <span>{t('teacher_name')}</span>
              <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        {graphLoading && <p role="status">{t('teacher_knowledge_loading')}</p>}
        {graphError && <p className="teacher-report-error" role="alert">{graphError}</p>}
        {!students.length
          ? <p>{t('teacher_knowledge_empty')}</p>
          : !graphLoading && !graphError && (
            <KnowledgeGraph
              graph={studentGraph}
              title={students.find((student) => String(student.id) === selectedStudentId)?.name || t('teacher_knowledge_graph')}
              interactive={false}
            />
          )}
      </section>

      <div className="grid-2">
        <section className="card">
          <h2 style={{ marginBottom: '1rem' }}>{t('teacher_subject_perf')}</h2>
          {stats.subjectStats.map((s) => (
            <div key={s.name} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{s.name}</span>
                <span>{Math.round(s.avg_mastery || 0)}%</span>
              </div>
              <div className="progress-bar" style={{ marginTop: '0.35rem' }}>
                <div className="progress-bar-fill" style={{ width: `${s.avg_mastery || 0}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="card">
          <h2 style={{ marginBottom: '1rem' }}>{t('teacher_top')}</h2>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>{t('teacher_name')}</th>
                <th>{t('leaderboard_xp')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.topStudents.map((s) => (
                <tr key={s.email}>
                  <td>{s.name}</td>
                  <td>{s.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>{t('teacher_all')}</h2>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>{t('teacher_name')}</th>
              <th>{t('teacher_email')}</th>
              <th>{t('leaderboard_xp')}</th>
              <th>{t('dash_level_label')}</th>
              <th>{t('leaderboard_streak')}</th>
              <th>{t('teacher_completed')}</th>
              <th>{t('teacher_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.xp}</td>
                <td>{t('level_short')}{s.level}</td>
                <td>🔥 {s.streak}</td>
                <td>{s.lessons_completed}</td>
                <td>
                  <div className="teacher-student-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => generateParentReport(s)}
                      disabled={reportingStudentId !== null}
                    >
                      {reportingStudentId === s.id ? t('teacher_report_loading') : `✨ ${t('teacher_generate_report')}`}
                    </button>
                    <Link className="btn btn-secondary btn-sm" to={`/portfolio?studentId=${s.id}`}>
                      {t('portfolio_view')}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {(parentReport || reportError) && (
        <section className="card teacher-parent-report" aria-live="polite" aria-busy={reportingStudentId !== null}>
          <div className="teacher-report-heading">
            <div>
              <h2>{t('teacher_parent_report')}</h2>
              {parentReport && <p>{parentReport.studentName} · {new Intl.DateTimeFormat(parentReport.language, { dateStyle: 'medium' }).format(new Date(parentReport.generatedAt))}</p>}
            </div>
            <span aria-hidden="true">✦</span>
          </div>
          {parentReport && <p className="teacher-report-copy">{parentReport.report}</p>}
          {reportError && <p className="teacher-report-error" role="alert">{reportError}</p>}
        </section>
      )}
      <TeacherStudio />
    </div>
  );
}
