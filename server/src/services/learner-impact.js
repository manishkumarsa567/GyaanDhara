import { translateEntityMap } from './content-i18n.js';
import { geminiGenerate, LANG_NAMES } from './gemini.js';

function isWithin(timestamp, start, end) {
  const date = new Date(timestamp).getTime();
  return Number.isFinite(date) && date >= start && date < end;
}

function average(items) {
  if (!items.length) return null;
  return Math.round(items.reduce((sum, item) => sum + item.accuracy, 0) / items.length);
}

export function getWeeklyImpactFacts(studentId, store, now = new Date()) {
  const end = now.getTime() + 1;
  const weekStart = end - 7 * 24 * 60 * 60 * 1000;
  const previousStart = weekStart - 7 * 24 * 60 * 60 * 1000;
  const lessons = store.get('lessons');
  const subjects = store.get('subjects');
  const quizAttempts = store.filter(
    'quiz_attempts',
    (attempt) => attempt.user_id === studentId && Number(attempt.total) > 0
      && isWithin(attempt.created_at, previousStart, end)
  );
  const grouped = new Map();

  for (const attempt of quizAttempts) {
    const lesson = lessons.find((item) => item.id === attempt.lesson_id);
    const subject = subjects.find((item) => item.id === lesson?.subject_id);
    const name = subject?.name || 'General learning';
    const period = new Date(attempt.created_at).getTime() >= weekStart ? 'thisWeek' : 'previousWeek';
    if (!grouped.has(name)) grouped.set(name, { name, thisWeek: [], previousWeek: [] });
    grouped.get(name)[period].push({
      accuracy: Math.max(0, Math.min(100, Math.round((attempt.score / attempt.total) * 100))),
    });
  }

  const subjectProgress = [...grouped.values()].map((item) => {
    const currentAverage = average(item.thisWeek);
    const previousAverage = average(item.previousWeek);
    return {
      subject: item.name,
      quizzesThisWeek: item.thisWeek.length,
      averageThisWeek: currentAverage,
      quizzesPreviousWeek: item.previousWeek.length,
      averagePreviousWeek: previousAverage,
      changeInPercentagePoints: currentAverage === null || previousAverage === null
        ? null
        : currentAverage - previousAverage,
    };
  }).sort((left, right) => right.quizzesThisWeek - left.quizzesThisWeek);

  const weekPlays = store.filter(
    'game_plays',
    (play) => play.user_id === studentId && isWithin(play.created_at, weekStart, end)
  );
  const completedLessonsThisWeek = store.filter(
    'user_progress',
    (progress) => progress.user_id === studentId && progress.completed === 1
      && isWithin(progress.completed_at, weekStart, end)
  ).length;
  const activeSubjects = subjectProgress.filter((item) => item.averageThisWeek !== null);
  const focusSubject = activeSubjects.length
    ? [...activeSubjects].sort((left, right) => left.averageThisWeek - right.averageThisWeek)[0].subject
    : null;

  return {
    periodDays: 7,
    quizAttemptsThisWeek: subjectProgress.reduce((sum, item) => sum + item.quizzesThisWeek, 0),
    gamesPlayedThisWeek: weekPlays.length,
    completedLessonsThisWeek,
    subjects: subjectProgress,
    focusSubject,
  };
}

export function buildLearnerPortfolio(studentId, store, gamesCatalog) {
  const student = store.find('users', (user) => user.id === studentId && user.role === 'student');
  if (!student) return null;

  const completedLessons = store
    .filter('user_progress', (progress) => progress.user_id === studentId && progress.completed === 1)
    .map((progress) => {
      const lesson = store.find('lessons', (item) => item.id === progress.lesson_id);
      if (!lesson) return null;
      const subject = store.find('subjects', (item) => item.id === lesson.subject_id);
      return {
        id: lesson.id,
        title: lesson.title,
        subjectId: subject?.id ?? null,
        subject: subject?.name || '',
        mastery: progress.mastery || 0,
        completedAt: progress.completed_at || null,
      };
    })
    .filter(Boolean)
    .sort((left, right) => new Date(right.completedAt || 0) - new Date(left.completedAt || 0));

  const earnedBadges = store
    .filter('user_badges', (entry) => entry.user_id === studentId)
    .map((entry) => {
      const badge = store.find('badges', (item) => item.id === entry.badge_id);
      return badge ? { ...badge, earnedAt: entry.earned_at } : null;
    })
    .filter(Boolean)
    .sort((left, right) => new Date(right.earnedAt || 0) - new Date(left.earnedAt || 0));

  const completedGames = store
    .filter('game_progress', (progress) => progress.user_id === studentId && progress.passed_levels > 0)
    .map((progress) => {
      const game = gamesCatalog.find((item) => item.slug === progress.game_slug);
      return {
        slug: progress.game_slug,
        name: game?.name || progress.game_slug,
        passedLevels: progress.passed_levels,
        mastery: progress.mastery || 0,
      };
    });

  return {
    student: { id: student.id, name: student.name, xp: student.xp || 0, level: student.level || 1 },
    completedLessons,
    earnedBadges,
    completedGames,
    totals: {
      lessons: completedLessons.length,
      badges: earnedBadges.length,
      games: completedGames.length,
    },
  };
}

export async function translateLearnerPortfolio(portfolio, lang) {
  const subjectEntities = [...new Map(
    portfolio.completedLessons
      .filter((lesson) => lesson.subjectId !== null)
      .map((lesson) => [lesson.subjectId, { id: lesson.subjectId, name: lesson.subject }])
  ).values()];
  const gameEntities = portfolio.completedGames.map((game) => ({ ...game, id: game.slug }));
  const lessons = await translateEntityMap(lang, 'lessons', portfolio.completedLessons, ['title']);
  const badges = await translateEntityMap(lang, 'badges', portfolio.earnedBadges, ['name', 'description']);
  const subjects = await translateEntityMap(lang, 'subjects', subjectEntities, ['name']);
  const games = await translateEntityMap(lang, 'games', gameEntities, ['name']);
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]));
  const gameNames = new Map(games.map((game) => [game.slug, game.name]));

  return {
    ...portfolio,
    completedLessons: lessons.map((lesson) => ({
      ...lesson,
      subject: subjectNames.get(lesson.subjectId) || lesson.subject,
    })),
    earnedBadges: badges,
    completedGames: portfolio.completedGames.map((game) => ({
      ...game,
      name: gameNames.get(game.slug) || game.name,
    })),
  };
}

export async function generateWeeklyParentReport(facts, lang, generate = geminiGenerate) {
  const languageName = LANG_NAMES[lang];
  if (!languageName) return null;
  const prompt = `Write exactly three short, parent-friendly sentences in ${languageName}.
Use only the supplied activity data. Do not invent progress or claim improvement unless both weeks have quiz averages for the same subject. When a subject has no activity this week, do not say the learner is weak in it. If there was no activity, say so gently and suggest one simple next step.
Sentence 1: summarize this week's learning activity and any supported improvement.
Sentence 2: identify a subject to practice only if this week's data supports it; otherwise mention the lack of evidence/activity honestly.
Sentence 3: give one warm, practical encouragement.
Do not include a heading, bullets, a learner's name, or extra sentences. Use percentage points when describing a difference.
Activity data: ${JSON.stringify(facts)}`;
  const generated = await generate(
    prompt,
    'You are a careful multilingual school teacher writing a factual, supportive weekly note for a parent. Never infer facts that are not in the supplied data.'
  );
  return normalizeThreeSentenceReport(generated);
}

export function normalizeThreeSentenceReport(report) {
  if (typeof report !== 'string') return null;
  const normalized = report
    .replace(/^```(?:text)?\s*/i, '')
    .replace(/\s*```$/, '')
    .replace(/^\s*(?:[-*]\s*|\d+[.)]\s*)/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return null;

  const sentences = normalized.match(/[^.!?।！？]+[.!?।！？]+(?=\s|$)|[^.!?।！？]+$/gu) || [];
  return sentences.length === 3 ? normalized : null;
}
