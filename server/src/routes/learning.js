import { Router } from 'express';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getRecommendedDifficulty,
  calculateXp,
  levelFromXp,
  masteryFromAttempts,
  getLearningPath,
  getContinueLearning,
} from '../services/adaptive.js';
import { translateEntityMap, translateLessonChapters, translateQuizQuestions } from '../services/content-i18n.js';
import { geminiTranslateBatch, isGeminiConfigured } from '../services/gemini.js';
import { getGameBySlug } from '../games/catalog.js';
import { findBankQuestion, getLessonHint, getLessonQuestionSet, quizDifficulties, quizTypes } from '../questionBank.js';
import { getQuizProgression, QUIZ_PASS_PERCENT } from '../services/quiz-progression.js';
import { buildLearnerPortfolio, translateLearnerPortfolio } from '../services/learner-impact.js';
import { GAMES_CATALOG } from '../games/catalog.js';
import { getLessonChapters } from '../chapter-content.js';
import { getActiveSeasonalContent } from '../services/teacher-studio.js';
import { getScopedLeaderboard, getVillageLeaderboard } from '../services/community.js';
import {
  awardBossRewards,
  buildNarrativeQuest,
  LOOT_ITEMS,
  openMysteryBox,
} from '../services/gamification.js';
import {
  analyzeMistakes,
  createStorySession,
  generateStoryContinuation,
  generateStoryOpening,
  getKnowledgeGraph,
  STORY_CATALOG,
} from '../services/personalization.js';
import { LANG_NAMES } from '../services/gemini.js';
import ncertRoutes from './ncert.js';

const router = Router();
router.use('/ncert', ncertRoutes);

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function normalizeFillAnswer(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s*\/\s*/g, '/')
    .replace(/[.,!?]$/, '');
}

function getLang(req) {
  return req.query.lang || req.user?.preferred_language || 'en';
}

router.get('/mistake-analysis', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const mistakes = db.filter('quiz_attempts', (attempt) => attempt.user_id === req.user.id && Array.isArray(attempt.mistakes))
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .flatMap((attempt) => attempt.mistakes.map((mistake) => ({ ...mistake, created_at: attempt.created_at })))
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, 5)
    .map((mistake) => ({
      question: mistake.question,
      expectedAnswer: mistake.expected_answer,
      selectedAnswer: mistake.selected_answer,
      lesson: db.find('lessons', (lesson) => lesson.id === mistake.lesson_id)?.title || 'Learning topic',
      subject: db.find('subjects', (subject) => subject.id === mistake.subject_id)?.name || 'General learning',
    }));
  if (!mistakes.length) return res.json({ analysis: null, wrongAnswerCount: 0 });
  const analysis = await analyzeMistakes(mistakes, getLang(req));
  if (!analysis) return res.status(503).json({ error: 'AI mistake analysis is temporarily unavailable. Please try again later.' });
  const translated = await translateEntityMap(getLang(req), 'mistake_analysis', [{ id: req.user.id, ...analysis }], ['pattern', 'storyOffer', 'focusSubject']);
  res.json({ analysis: translated[0], wrongAnswerCount: mistakes.length });
}));

router.get('/knowledge-graph', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const graph = getKnowledgeGraph(req.user.id, db);
  if (!graph) return res.status(404).json({ error: 'Learner not found.' });
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
}));

router.get('/stories', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const lang = getLang(req);
  if (!LANG_NAMES[lang]) return res.status(400).json({ error: 'Choose a supported story language.' });
  const sourceStories = STORY_CATALOG.map(({ id, subject, topic, learningTopic, grade, visual }, index) => ({
    id,
    subject,
    topic,
    learningTopic,
    grade,
    visual,
    index,
  }));
  const stories = await translateEntityMap(
    lang,
    'interactive_story_catalog_v2',
    sourceStories,
    ['subject', 'topic', 'learningTopic']
  );
  if (lang !== 'en' && stories.some((story, index) => (
    ['subject', 'topic', 'learningTopic'].some((field) => story[field] === sourceStories[index][field])
  ))) {
    return res.status(503).json({ error: 'Story translation is temporarily unavailable. Please try again.' });
  }
  res.json(stories.map(({ index, ...story }) => story));
}));

router.post('/stories/start', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const storyId = typeof req.body?.storyId === 'string' ? req.body.storyId : '';
  const lang = req.body?.lang || req.user?.preferred_language || 'en';
  if (!LANG_NAMES[lang] || !STORY_CATALOG.some((story) => story.id === storyId)) {
    return res.status(400).json({ error: 'Choose a supported story and language.' });
  }
  const opening = await generateStoryOpening(storyId, lang);
  if (!opening) return res.status(503).json({ error: 'AI story creation is temporarily unavailable. Please try again.' });
  const session = createStorySession(req.user.id, storyId, lang, opening);
  const saved = await db.insert('story_sessions', session);
  res.status(201).json({
    sessionId: saved.session_key,
    storyId,
    turn: 0,
    ...opening,
  });
}));

router.post('/stories/:sessionId/choose', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const session = db.find('story_sessions', (entry) => entry.session_key === req.params.sessionId && entry.user_id === req.user.id);
  if (!session) return res.status(404).json({ error: 'Story session not found.' });
  if (session.turn >= 8) return res.status(409).json({ error: 'This story reached its maximum number of choices. Start a new story to continue.' });
  const choiceId = typeof req.body?.choiceId === 'string' ? req.body.choiceId : '';
  const choice = session.current.choices.find((item) => item.id === choiceId);
  if (!choice) return res.status(400).json({ error: 'Choose one of the options shown in the current story.' });
  const seed = STORY_CATALOG.find((story) => story.id === session.seed_id);
  const history = [...session.history, { ...session.current, choice: choice.label }];
  const next = await generateStoryContinuation(seed, history, choice, session.lang);
  if (!next) return res.status(503).json({ error: 'AI story continuation is temporarily unavailable. Your story choice was not lost.' });
  const updated = await db.update(
    'story_sessions',
    (entry) => entry.id === session.id && entry.user_id === req.user.id,
    { history, current: next, turn: session.turn + 1, updated_at: new Date().toISOString() }
  );
  if (!updated) return res.status(500).json({ error: 'Unable to save the story. Please try again.' });
  res.json({ sessionId: updated.session_key, storyId: updated.seed_id, turn: updated.turn, ...next });
}));

router.get('/gamification', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const boxes = db.filter('loot_boxes', (box) => box.user_id === req.user.id)
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
  const itemIds = new Set(boxes.map((box) => box.item?.id).filter(Boolean));
  const items = await translateEntityMap(
    getLang(req),
    'mystery_box_items',
    LOOT_ITEMS.filter((item) => itemIds.has(item.id)),
    ['name']
  );
  const itemMap = new Map(items.map((item) => [item.id, item]));
  res.json({
    streakFreezes: db.find('users', (user) => user.id === req.user.id)?.streak_freezes || 0,
    boxes: boxes.map((box) => ({
      id: box.id,
      difficulty: box.difficulty,
      opened: box.opened,
      created_at: box.created_at,
      item: box.item ? { ...box.item, name: itemMap.get(box.item.id)?.name || box.item.name } : null,
    })),
  });
}));

router.post('/gamification/boxes/:id/open', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const boxId = Number(req.params.id);
  if (!Number.isSafeInteger(boxId) || boxId < 1) return res.status(400).json({ error: 'A valid mystery box ID is required.' });
  const result = await openMysteryBox(req.user.id, boxId, db);
  if (result.error) return res.status(result.error.includes('not found') ? 404 : 409).json({ error: result.error });
  const [item] = await translateEntityMap(getLang(req), 'mystery_box_items', [result.box.item], ['name']);
  res.json({ ...result.box, item: { ...result.box.item, name: item?.name || result.box.item.name } });
}));

router.get('/seasonal-content', auth, async (req, res) => {
  try {
    const active = getActiveSeasonalContent(db.get('seasonal_content'));
    const publicContent = active.map(({ id, title, body, subjectId, starts_at, ends_at }) => ({
      id,
      title,
      body,
      subjectId,
      starts_at,
      ends_at,
      subject: db.find('subjects', (subject) => subject.id === subjectId)?.name || '',
    }));
    const translatedContent = await translateEntityMap(getLang(req), 'seasonal_content', publicContent, ['title', 'body', 'subject']);
    res.json(translatedContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activities', auth, requireRole('student'), (req, res) => {
  const activities = db
    .filter('teacher_quizzes', (quiz) => quiz.published
      && (!quiz.student_ids?.length || quiz.student_ids.includes(req.user.id)))
    .map((quiz) => {
      const attempts = db.filter(
        'teacher_quiz_attempts',
        (attempt) => attempt.user_id === req.user.id && attempt.quiz_id === quiz.id
      );
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        subjectId: quiz.subjectId,
        subject: db.find('subjects', (subject) => subject.id === quiz.subjectId)?.name || '',
        questionCount: quiz.questions.length,
        attempts: attempts.length,
        bestScore: attempts.length ? Math.max(...attempts.map((attempt) => attempt.score)) : null,
        createdAt: quiz.created_at,
      };
    })
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  res.json(activities);
});

router.get('/activities/:id', auth, requireRole('student'), (req, res) => {
  const quizId = Number(req.params.id);
  const quiz = db.find('teacher_quizzes', (item) => item.id === quizId && item.published
    && (!item.student_ids?.length || item.student_ids.includes(req.user.id)));
  if (!quiz) return res.status(404).json({ error: 'Activity not found' });
  const subject = db.find('subjects', (item) => item.id === quiz.subjectId);
  res.json({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    subject: subject?.name || '',
    questions: quiz.questions.map(({ id, prompt, options }) => ({ id, prompt, options })),
  });
});

router.post('/activities/:id/submit', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const quizId = Number(req.params.id);
  const quiz = db.find('teacher_quizzes', (item) => item.id === quizId && item.published
    && (!item.student_ids?.length || item.student_ids.includes(req.user.id)));
  if (!quiz) return res.status(404).json({ error: 'Activity not found' });
  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    return res.status(400).json({ error: 'Answer every question before submitting.' });
  }
  const submittedIds = new Set();
  for (const answer of answers) {
    if (!Number.isSafeInteger(answer?.questionId) || submittedIds.has(answer.questionId)
      || !Number.isInteger(answer?.selectedIndex)) {
      return res.status(400).json({ error: 'Submitted answers are invalid.' });
    }
    submittedIds.add(answer.questionId);
  }
  if (quiz.questions.some((question) => {
    const submitted = answers.find((answer) => answer.questionId === question.id);
    return !submitted || submitted.selectedIndex < 0 || submitted.selectedIndex >= question.options.length;
  })) {
    return res.status(400).json({ error: 'Choose a valid option for every question.' });
  }

  const score = quiz.questions.reduce((total, question) => {
    const selected = answers.find((answer) => answer.questionId === question.id);
    return total + (selected.selectedIndex === question.answerIndex ? 1 : 0);
  }, 0);
  const attempt = await db.insert('teacher_quiz_attempts', {
    quiz_id: quiz.id,
    user_id: req.user.id,
    score,
    total: quiz.questions.length,
    created_at: new Date().toISOString(),
  });
  res.json({
    score,
    total: quiz.questions.length,
    accuracy: Math.round((score / quiz.questions.length) * 100),
    results: quiz.questions.map((question) => ({
      questionId: question.id,
      correct: answers.find((answer) => answer.questionId === question.id).selectedIndex === question.answerIndex,
      correctIndex: question.answerIndex,
      explanation: question.explanation,
    })),
    attemptId: attempt.id,
  });
}));

router.get('/subjects', auth, async (req, res) => {
  try {
    const lang = getLang(req);
    let subjects = db.get('subjects').sort((a, b) => a.id - b.id);
    subjects = await translateEntityMap(lang, 'subjects', subjects, ['name', 'description']);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subjects/:id/lessons', auth, async (req, res) => {
  try {
    const lang = getLang(req);
    const subjectId = Number(req.params.id);
    let lessons = db.filter('lessons', (l) => l.subject_id === subjectId).sort((a, b) => a.order_index - b.order_index);
    const progress = db.filter('user_progress', (p) => p.user_id === req.user.id);

    lessons = await translateEntityMap(lang, 'lessons', lessons, ['title', 'content']);

    res.json(
      lessons.map((l) => {
        const p = progress.find((up) => up.lesson_id === l.id);
        return { ...l, completed: p?.completed || 0, mastery: p?.mastery || 0 };
      })
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/lessons/:id/progress', auth, asyncHandler(async (req, res) => {
  const lessonId = Number(req.params.id);
  const lesson = db.find('lessons', (candidate) => candidate.id === lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  const lastOpenedAt = new Date().toISOString();
  const progress = db.find(
    'user_progress',
    (entry) => entry.user_id === req.user.id && entry.lesson_id === lessonId
  );

  const savedProgress = progress
    ? await db.update('user_progress', (entry) => entry.id === progress.id, { last_opened_at: lastOpenedAt })
    : await db.insert('user_progress', {
      user_id: req.user.id,
      lesson_id: lessonId,
      completed: 0,
      score: 0,
      attempts: 0,
      mastery: 0,
      completed_at: null,
      last_opened_at: lastOpenedAt,
    });

  res.json({ lessonId, lastOpenedAt: savedProgress.last_opened_at });
}));

router.get('/lessons/:id', auth, async (req, res) => {
  try {
    const lang = getLang(req);
    let lesson = db.find('lessons', (l) => l.id === Number(req.params.id));
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    const subject = db.find('subjects', (s) => s.id === lesson.subject_id);

    [lesson] = await translateEntityMap(lang, 'lessons', [lesson], ['title', 'content']);
    let [subj] = await translateEntityMap(lang, 'subjects', [subject], ['name']);

    const translatedChapters = await translateLessonChapters(
      lesson.id,
      getLessonChapters(lesson.id),
      lang
    );
    res.json({
      ...lesson,
      subject_name: subj?.name || subject?.name,
      chapters: translatedChapters.chapters,
      chaptersTranslated: translatedChapters.translated,
      contentLanguage: lang,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/lessons/:id/quiz/progression', auth, (req, res) => {
  const lessonId = Number(req.params.id);
  if (!db.find('lessons', (lesson) => lesson.id === lessonId)) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  res.json(getQuizProgression(req.user.id, lessonId, db));
});

router.get('/lessons/:id/quiz', auth, async (req, res) => {
  try {
    const lang = getLang(req);
    const lessonId = Number(req.params.id);
    const questionType = req.query.type;
    const progression = getQuizProgression(req.user.id, lessonId, db);
    const difficulty = req.query.difficulty || progression.unlockedDifficulty;
    if (!db.find('lessons', (lesson) => lesson.id === lessonId)) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    if (!quizTypes.includes(questionType) || !quizDifficulties[difficulty]) {
      return res.status(400).json({ error: 'Choose a valid question type and difficulty.' });
    }
    if (!progression.unlockedLevels.includes(difficulty)) {
      return res.status(403).json({
        error: `Score at least ${QUIZ_PASS_PERCENT}% at the current level to unlock the next one.`,
        progression,
      });
    }
    let questions = getLessonQuestionSet(lessonId, questionType, difficulty);
    if (!questions) return res.status(404).json({ error: 'No questions are available for this lesson.' });
    questions = shuffle(questions).map(({ correct_index, correct_answer, ...question }) => ({
      ...question,
      ...(progression.hintsUnlocked ? { hint: getLessonHint(lessonId) } : {}),
    }));
    questions = await translateQuizQuestions(questions, lang);
    res.json({ difficulty, questionType, questions, progression });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/lessons/:id/quiz/submit', auth, async (req, res) => {
  try {
    const { answers, difficulty, questionType, lang: bodyLang } = req.body;
    const lang = bodyLang || req.user?.preferred_language || 'en';
    const lessonId = Number(req.params.id);
    const lesson = db.find('lessons', (l) => l.id === lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    if (!Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({ error: 'Submit answers for all five questions.' });
    }
    if (!quizTypes.includes(questionType) || !quizDifficulties[difficulty]) {
      return res.status(400).json({ error: 'Choose a valid question type and difficulty.' });
    }
    const progressionBeforeAttempt = getQuizProgression(req.user.id, lessonId, db);
    if (!progressionBeforeAttempt.unlockedLevels.includes(difficulty)) {
      return res.status(403).json({
        error: `Score at least ${QUIZ_PASS_PERCENT}% at the current level to unlock the next one.`,
        progression: progressionBeforeAttempt,
      });
    }

    let score = 0;
    const results = [];
    const mistakes = [];
    const seenQuestionIds = new Set();
    for (const answer of answers) {
      if (!answer || typeof answer !== 'object' || answer.questionId === undefined) {
        return res.status(400).json({ error: 'Every answer must include its question.' });
      }
      const { questionId, selectedIndex, answerText } = answer;
      if (questionType === 'fill_blank' && !String(answerText || '').trim()) {
        return res.status(400).json({ error: 'Fill in every answer before submitting.' });
      }
      if (seenQuestionIds.has(String(questionId))) {
        return res.status(400).json({ error: 'Each question can only be answered once.' });
      }
      seenQuestionIds.add(String(questionId));
      const q = findBankQuestion(lessonId, questionId, questionType, difficulty);
      const correct = q && (questionType === 'fill_blank'
        ? normalizeFillAnswer(answerText) === normalizeFillAnswer(q.correct_answer)
        : q.correct_index === selectedIndex);
      if (!q) return res.status(400).json({ error: 'A submitted question does not belong to this quiz.' });
      if (correct) score++;
      else {
        const selectedAnswer = questionType === 'fill_blank'
          ? String(answerText).trim().slice(0, 160)
          : q.options[selectedIndex] || '';
        const expectedAnswer = questionType === 'fill_blank'
          ? q.correct_answer
          : q.options[q.correct_index];
        mistakes.push({
          lesson_id: lessonId,
          subject_id: lesson.subject_id,
          question: q.question.slice(0, 300),
          expected_answer: String(expectedAnswer).slice(0, 160),
          selected_answer: String(selectedAnswer).slice(0, 160),
        });
      }
      results.push({
        questionId,
        correct,
        correctIndex: q?.correct_index,
        explanation: q?.explanation,
      });
    }

    const total = answers.length;
    const scorePercent = score / total * 100;
    const shouldShowHint = scorePercent < QUIZ_PASS_PERCENT
      && progressionBeforeAttempt.consecutiveFailures + 1 >= 3;
    let hint = shouldShowHint ? getLessonHint(lessonId) : null;

    if (lang !== 'en' && isGeminiConfigured()) {
      const expMap = {};
      results.forEach((r, i) => {
        if (r.explanation) expMap[`exp${i}`] = r.explanation;
      });
      if (hint) expMap.hint = hint;
      if (Object.keys(expMap).length > 0) {
        const translated = await geminiTranslateBatch(expMap, lang);
        results.forEach((r, i) => {
          if (translated[`exp${i}`]) r.explanation = translated[`exp${i}`];
        });
        if (translated.hint) hint = translated.hint;
      }
    }

    const user = db.find('users', (u) => u.id === req.user.id);
    const xpEarned = calculateXp(score, total, difficulty || 'easy', user.streak);
    const newXp = user.xp + xpEarned;
    const newLevel = levelFromXp(newXp);

    await db.update('users', (u) => u.id === req.user.id, { xp: newXp, level: newLevel });
    const bossRewards = await awardBossRewards({
      user: { ...user, xp: newXp, level: newLevel },
      lessonId,
      difficulty,
      score,
      total,
      store: db,
    });
    const attempt = await db.insert('quiz_attempts', {
      user_id: req.user.id,
      lesson_id: lessonId,
      difficulty,
      question_type: questionType,
      score,
      total,
      mistakes,
      xp_earned: xpEarned,
      created_at: new Date().toISOString(),
    });
    const progression = getQuizProgression(req.user.id, lessonId, db);
    const passedLevel = scorePercent >= QUIZ_PASS_PERCENT;

    const attempts = db.filter('quiz_attempts', (a) => a.user_id === req.user.id && a.lesson_id === lessonId);
    const mastery = masteryFromAttempts(attempts);
    const completed = mastery >= 60 ? 1 : 0;

    const existing = db.find('user_progress', (p) => p.user_id === req.user.id && p.lesson_id === lessonId);
    if (existing) {
      await db.update('user_progress', (p) => p.id === existing.id, {
        score: Math.max(existing.score, score),
        attempts: existing.attempts + 1,
        mastery,
        completed,
        completed_at: completed ? new Date().toISOString() : existing.completed_at,
        last_opened_at: new Date().toISOString(),
      });
    } else {
      const lastOpenedAt = new Date().toISOString();
      await db.insert('user_progress', {
        user_id: req.user.id,
        lesson_id: lessonId,
        completed,
        score,
        attempts: 1,
        mastery,
        completed_at: completed ? new Date().toISOString() : null,
        last_opened_at: lastOpenedAt,
      });
    }

    await checkAndAwardBadges(req.user.id, newXp, score, total, completed);

    res.json({
      score,
      total,
      xpEarned,
      newXp,
      newLevel,
      mastery,
      completed: completed === 1,
      results,
      passedLevel,
      passPercent: QUIZ_PASS_PERCENT,
      progression,
      mysteryBox: bossRewards.mysteryBox
        ? { id: bossRewards.mysteryBox.id, difficulty: bossRewards.mysteryBox.difficulty }
        : null,
      streakFreezeEarned: bossRewards.streakFreezeEarned,
      streakFreezes: bossRewards.streakFreezes,
      ...(hint ? { hint } : {}),
      attemptId: attempt.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function checkAndAwardBadges(userId, xp, score, total, lessonCompleted) {
  const award = async (badgeId) => {
    if (!db.find('user_badges', (b) => b.user_id === userId && b.badge_id === badgeId)) {
      await db.insert('user_badges', { user_id: userId, badge_id: badgeId, earned_at: new Date().toISOString() });
    }
  };

  const completedCount = db.filter('user_progress', (p) => p.user_id === userId && p.completed === 1).length;
  if (lessonCompleted) await award(1);
  if (total > 0 && score === total) await award(2);
  const user = db.find('users', (u) => u.id === userId);
  if (user.streak >= 7) await award(3);
  if (xp >= 500) await award(4);
  if (completedCount >= 5) await award(5);
}

router.get('/dashboard', auth, async (req, res) => {
  try {
    const lang = getLang(req);
    const user = db.find('users', (u) => u.id === req.user.id);
    const { password, ...safeUser } = user;

    const recentAttempts = db
      .filter('quiz_attempts', (a) => a.user_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((a) => {
        const lesson = db.find('lessons', (l) => l.id === a.lesson_id);
        return { ...a, lesson_title: lesson?.title };
      });

    const lessonTitles = await translateEntityMap(
      lang,
      'lessons',
      recentAttempts.map((a, i) => ({ id: a.lesson_id || i, title: a.lesson_title })).filter((x) => x.title),
      ['title']
    );
    const titleMap = Object.fromEntries(lessonTitles.map((l) => [l.id, l.title]));

    const badgeIds = db.filter('user_badges', (b) => b.user_id === req.user.id).map((b) => b.badge_id);
    let badges = db.get('badges').filter((b) => badgeIds.includes(b.id));
    badges = await translateEntityMap(lang, 'badges', badges, ['name', 'description']);

    const path = getLearningPath(req.user.id, db);
    const continueLearning = getContinueLearning(req.user.id, db, path);
    let gameProgress = null;
    if (continueLearning?.kind === 'game') {
      const progress = db.find(
        'game_progress',
        (entry) => entry.user_id === req.user.id && entry.game_slug === continueLearning.slug
      );
      gameProgress = progress
        ? { level: progress.level, mastery: progress.mastery }
        : null;

      const game = getGameBySlug(continueLearning.slug);
      if (game) {
        const [translatedGame] = await translateEntityMap(lang, 'games', [game], ['name']);
        continueLearning.title = translatedGame?.name || game.name;
      }
    }
    const pathLessons = await translateEntityMap(
      lang,
      'lessons',
      path.map((p) => ({ id: p.lessonId, title: p.title })),
      ['title']
    );
    const pathSubjIds = [...new Set(path.map((p) => p.subjectId).filter(Boolean))];
    const pathSubjectsRaw = pathSubjIds.map((id) => db.find('subjects', (s) => s.id === id)).filter(Boolean);
    const pathSubjects = await translateEntityMap(lang, 'subjects', pathSubjectsRaw, ['name']);
    const pathTitleMap = Object.fromEntries(pathLessons.map((l) => [l.id, l.title]));
    const pathSubjectMap = Object.fromEntries(pathSubjects.map((s) => [s.id, s.name]));

    const translatedPath = path.map((p) => ({
      ...p,
      title: pathTitleMap[p.lessonId] || p.title,
      subject: pathSubjectMap[p.subjectId] || p.subject,
    }));
    const narrativeQuest = req.user.role === 'student' ? buildNarrativeQuest(req.user.id, db) : null;
    if (narrativeQuest) {
      const [translatedQuest] = await translateEntityMap(lang, 'narrative_quests', [narrativeQuest], ['title', 'premise']);
      const translatedSteps = await translateEntityMap(lang, 'narrative_quest_steps', narrativeQuest.steps, ['title', 'chapter']);
      narrativeQuest.title = translatedQuest?.title || narrativeQuest.title;
      narrativeQuest.premise = translatedQuest?.premise || narrativeQuest.premise;
      const translatedStepsById = new Map(translatedSteps.map((step) => [step.id, step]));
      narrativeQuest.steps = narrativeQuest.steps.map((step) => ({
        ...step,
        title: translatedStepsById.get(step.id)?.title || step.title,
        chapter: translatedStepsById.get(step.id)?.chapter || step.chapter,
      }));
    }

    const recent = db
      .filter('quiz_attempts', (a) => a.user_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((a) => ({ score: a.score, total: a.total }));

    const total = db.get('lessons').length;
    const completed = db.filter('user_progress', (p) => p.user_id === req.user.id && p.completed === 1).length;

    res.json({
      user: {
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        role: safeUser.role,
        xp: safeUser.xp,
        level: safeUser.level,
        streak: safeUser.streak,
        streakFreezes: safeUser.streak_freezes || 0,
        preferred_language: safeUser.preferred_language,
      },
      recentAttempts: recentAttempts.map((a) => ({
        ...a,
        lesson_title: titleMap[a.lesson_id] || a.lesson_title,
      })),
      badges,
      learningPath: translatedPath,
      continueLearning,
      narrativeQuest,
      gameProgress,
      recommendedDifficulty: getRecommendedDifficulty(recent),
      overallProgress: { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/portfolio', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Student portfolio access required' });
    const portfolio = buildLearnerPortfolio(req.user.id, db, GAMES_CATALOG);
    if (!portfolio) return res.status(404).json({ error: 'Learner not found' });
    res.json(await translateLearnerPortfolio(portfolio, getLang(req)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leaderboard', auth, (req, res) => {
  const scope = req.query.scope || 'global';
  const currentUser = db.find('users', (user) => user.id === req.user.id);
  if (!currentUser) return res.status(404).json({ error: 'User account not found.' });

  if (scope === 'villages') {
    const result = getVillageLeaderboard({
      villages: db.get('villages'),
      users: db.get('users'),
      progress: db.get('user_progress'),
      villageLeaderboards: db.get('village_leaderboards'),
      district: req.query.district || null,
      period: req.query.period || 'all_time',
    });
    return res.json(result);
  }

  const result = getScopedLeaderboard(db.get('users'), currentUser, scope, {
    villages: db.get('villages'),
    progress: db.get('user_progress'),
    villageLeaderboards: db.get('village_leaderboards'),
    district: req.query.district || null,
    period: req.query.period || 'all_time',
  });
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

router.get('/leaderboard/villages', auth, (req, res) => {
  const result = getVillageLeaderboard({
    villages: db.get('villages'),
    users: db.get('users'),
    progress: db.get('user_progress'),
    villageLeaderboards: db.get('village_leaderboards'),
    district: req.query.district || null,
    period: req.query.period || 'all_time',
  });
  res.json(result);
});

export default router;
