import { Router } from 'express';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';
import { translateEntityMap } from '../services/content-i18n.js';
import { LANG_NAMES } from '../services/gemini.js';
import { buildLearnerPortfolio, generateWeeklyParentReport, getWeeklyImpactFacts, translateLearnerPortfolio } from '../services/learner-impact.js';
import { GAMES_CATALOG } from '../games/catalog.js';
import {
  getActiveSeasonalContent,
  addAIGroupRecommendations,
  getMasteryGroups,
  normalizeSeasonalContent,
  normalizeTeacherQuiz,
} from '../services/teacher-studio.js';
import { getKnowledgeGraph } from '../services/personalization.js';

const router = Router();

function getLang(req) {
  return req.query.lang || req.user?.preferred_language || 'en';
}

router.get('/stats', auth, requireRole('teacher'), async (req, res) => {
  try {
    const lang = getLang(req);
    const students = db.filter('users', (u) => u.role === 'student').length;
    const lessons = db.get('lessons').length;
    const attempts = db.get('quiz_attempts').length;
    const progress = db.get('user_progress');
    const avgMastery = progress.length
      ? progress.reduce((s, p) => s + (p.mastery || 0), 0) / progress.length
      : 0;

    const topStudents = db
      .filter('users', (u) => u.role === 'student')
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5)
      .map(({ name, email, xp, level, streak }) => ({ name, email, xp, level, streak }));

    let subjectStats = db.get('subjects').map((s) => {
      const subjectLessons = db.filter('lessons', (l) => l.subject_id === s.id);
      const lessonIds = subjectLessons.map((l) => l.id);
      const subjectProgress = progress.filter((p) => lessonIds.includes(p.lesson_id));
      const activeStudents = new Set(subjectProgress.map((p) => p.user_id)).size;
      const avg = subjectProgress.length
        ? subjectProgress.reduce((sum, p) => sum + (p.mastery || 0), 0) / subjectProgress.length
        : 0;
      return { id: s.id, name: s.name, active_students: activeStudents, avg_mastery: avg };
    });

    subjectStats = await translateEntityMap(lang, 'subjects', subjectStats, ['name']);

    res.json({
      students,
      lessons,
      attempts,
      avgMastery: Math.round(avgMastery),
      topStudents,
      subjectStats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/students', auth, requireRole('teacher'), (req, res) => {
  const students = db
    .filter('users', (u) => u.role === 'student')
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      xp: u.xp,
      level: u.level,
      streak: u.streak,
      lessons_completed: db.filter('user_progress', (p) => p.user_id === u.id && p.completed === 1).length,
    }))
    .sort((a, b) => b.xp - a.xp);
  res.json(students);
});

router.get('/students/:id/knowledge-graph', auth, requireRole('teacher'), async (req, res) => {
  const studentId = Number(req.params.id);
  if (!Number.isSafeInteger(studentId) || studentId < 1) {
    return res.status(400).json({ error: 'A valid student ID is required.' });
  }
  const graph = getKnowledgeGraph(studentId, db);
  if (!graph) return res.status(404).json({ error: 'Student not found.' });
  try {
    const lang = getLang(req);
    const subjects = await translateEntityMap(lang, 'knowledge_graph_subjects', graph.map(({ id, name }) => ({ id, name })), ['name']);
    const translatedSubjects = new Map(subjects.map((subject) => [subject.id, subject.name]));
    const nodes = graph.flatMap((subject) => subject.nodes.map((node) => ({ ...node, subjectId: subject.id })));
    const translatedNodes = await translateEntityMap(lang, 'knowledge_graph_nodes', nodes, ['title']);
    const nodeById = new Map(translatedNodes.map((node) => [node.id, node]));
    res.json(graph.map((subject) => ({
      ...subject,
      name: translatedSubjects.get(subject.id) || subject.name,
      nodes: subject.nodes.map((node) => nodeById.get(node.id) || node),
    })));
  } catch (error) {
    console.error('Teacher knowledge graph failed:', error.message);
    res.status(500).json({ error: 'Unable to load this student knowledge graph.' });
  }
});

router.get('/studio/quizzes', auth, requireRole('teacher'), (req, res) => {
  const quizzes = db
    .filter('teacher_quizzes', (quiz) => quiz.teacher_id === req.user.id)
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .map(({ questions, ...quiz }) => ({ ...quiz, questionCount: questions.length }));
  res.json(quizzes);
});

router.post('/studio/quizzes', auth, requireRole('teacher'), async (req, res) => {
  const normalized = normalizeTeacherQuiz(req.body);
  if (normalized.error) return res.status(400).json({ error: normalized.error });

  const requestedStudents = req.body.studentIds;
  if (requestedStudents !== undefined && (!Array.isArray(requestedStudents)
    || requestedStudents.some((id) => !Number.isSafeInteger(id) || id < 1))) {
    return res.status(400).json({ error: 'Student IDs must be a list of valid IDs.' });
  }
  const targetStudentIds = [...new Set(requestedStudents || [])];
  if (targetStudentIds.some((id) => !db.find('users', (user) => user.id === id && user.role === 'student'))) {
    return res.status(400).json({ error: 'One or more selected students do not exist.' });
  }
  if (normalized.quiz.subjectId && !db.find('subjects', (subject) => subject.id === normalized.quiz.subjectId)) {
    return res.status(400).json({ error: 'Choose a valid subject.' });
  }

  try {
    const quiz = await db.insert('teacher_quizzes', {
      ...normalized.quiz,
      teacher_id: req.user.id,
      student_ids: targetStudentIds,
      published: true,
      created_at: new Date().toISOString(),
    });
    const { questions, ...safeQuiz } = quiz;
    res.status(201).json({ ...safeQuiz, questionCount: questions.length });
  } catch (err) {
    console.error('Teacher quiz creation failed:', err.message);
    res.status(500).json({ error: 'Unable to save the quiz. Please try again.' });
  }
});

router.get('/studio/seasonal-content', auth, requireRole('teacher'), (req, res) => {
  const entries = db
    .filter('seasonal_content', (entry) => entry.teacher_id === req.user.id)
    .sort((left, right) => new Date(left.starts_at) - new Date(right.starts_at));
  res.json(entries);
});

router.post('/studio/seasonal-content', auth, requireRole('teacher'), async (req, res) => {
  const normalized = normalizeSeasonalContent(req.body);
  if (normalized.error) return res.status(400).json({ error: normalized.error });
  if (normalized.content.subjectId && !db.find('subjects', (subject) => subject.id === normalized.content.subjectId)) {
    return res.status(400).json({ error: 'Choose a valid subject.' });
  }

  try {
    const entry = await db.insert('seasonal_content', {
      ...normalized.content,
      teacher_id: req.user.id,
      published: true,
      created_at: new Date().toISOString(),
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error('Seasonal content creation failed:', err.message);
    res.status(500).json({ error: 'Unable to publish seasonal content. Please try again.' });
  }
});

router.get('/studio/groups', auth, requireRole('teacher'), async (req, res) => {
  const lang = getLang(req);
  try {
    const groups = await addAIGroupRecommendations(getMasteryGroups(db), lang);
    const subjects = [...new Map(groups.map((group) => [group.subjectId, {
      id: group.subjectId,
      name: group.subject,
    }])).values()];
    const translatedSubjects = await translateEntityMap(lang, 'subjects', subjects, ['name']);
    const translatedGroups = await translateEntityMap(
      lang,
      'teacher_groups',
      groups.map((group, index) => ({ ...group, id: index + 1 })),
      ['group', 'recommendation']
    );
    const subjectNames = new Map(translatedSubjects.map((subject) => [subject.id, subject.name]));
    res.json(translatedGroups.map(({ id, ...group }) => ({
      ...group,
      subject: subjectNames.get(group.subjectId) || group.subject,
    })));
  } catch (err) {
    console.error('Student grouping suggestions failed:', err.message);
    res.status(500).json({ error: 'Unable to calculate mastery groups. Please try again.' });
  }
});

router.post('/students/:id/weekly-report', auth, requireRole('teacher'), async (req, res) => {
  const studentId = Number(req.params.id);
  if (!Number.isSafeInteger(studentId) || studentId < 1) {
    return res.status(400).json({ error: 'A valid student ID is required' });
  }
  const student = db.find('users', (user) => user.id === studentId && user.role === 'student');
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const requestedLang = req.body?.lang;
  if (requestedLang && !LANG_NAMES[requestedLang]) {
    return res.status(400).json({ error: 'Unsupported report language' });
  }
  const lang = student.preferred_language || requestedLang || req.user.preferred_language || 'en';
  const languageName = LANG_NAMES[lang];
  if (!languageName) return res.status(400).json({ error: 'Unsupported report language' });

  try {
    const facts = getWeeklyImpactFacts(studentId, db);
    const report = await generateWeeklyParentReport(facts, lang);
    if (!report) {
      return res.status(502).json({ error: 'The AI could not produce a valid three-sentence report. Please try again.' });
    }

    res.json({
      report,
      language: lang,
      generatedAt: new Date().toISOString(),
      periodDays: facts.periodDays,
    });
  } catch (err) {
    console.error('Weekly parent report generation failed:', err.message);
    res.status(502).json({ error: 'Unable to generate the weekly report right now. Please try again.' });
  }
});

router.get('/students/:id/portfolio', auth, requireRole('teacher'), async (req, res) => {
  const studentId = Number(req.params.id);
  if (!Number.isSafeInteger(studentId) || studentId < 1) {
    return res.status(400).json({ error: 'A valid student ID is required' });
  }
  try {
    const portfolio = buildLearnerPortfolio(studentId, db, GAMES_CATALOG);
    if (!portfolio) return res.status(404).json({ error: 'Student not found' });
    res.json(await translateLearnerPortfolio(portfolio, getLang(req)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
