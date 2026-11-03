import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLearnerPortfolio,
  generateWeeklyParentReport,
  getWeeklyImpactFacts,
  normalizeThreeSentenceReport,
} from './learner-impact.js';

const now = new Date('2026-10-27T06:00:00.000Z');
const storeFrom = (tables) => ({
  get: (table) => tables[table] || [],
  find: (table, predicate) => (tables[table] || []).find(predicate),
  filter: (table, predicate) => (tables[table] || []).filter(predicate),
});

test('weekly facts compare this week with the prior week and identify a practice subject', () => {
  const store = storeFrom({
    subjects: [{ id: 1, name: 'Math' }, { id: 2, name: 'Science' }],
    lessons: [{ id: 10, subject_id: 1 }, { id: 20, subject_id: 2 }],
    quiz_attempts: [
      { user_id: 7, lesson_id: 10, score: 6, total: 10, created_at: '2026-10-16T08:00:00.000Z' },
      { user_id: 7, lesson_id: 10, score: 8, total: 10, created_at: '2026-10-24T08:00:00.000Z' },
      { user_id: 7, lesson_id: 20, score: 3, total: 10, created_at: '2026-10-25T08:00:00.000Z' },
      { user_id: 99, lesson_id: 10, score: 0, total: 10, created_at: '2026-10-25T08:00:00.000Z' },
      { user_id: 7, lesson_id: 10, score: 10, total: 10, created_at: '2026-10-01T08:00:00.000Z' },
    ],
    game_plays: [
      { user_id: 7, created_at: '2026-10-26T08:00:00.000Z' },
      { user_id: 7, created_at: '2026-10-15T08:00:00.000Z' },
    ],
    user_progress: [
      { user_id: 7, completed: 1, completed_at: '2026-10-25T08:00:00.000Z' },
      { user_id: 7, completed: 0, completed_at: '2026-10-26T08:00:00.000Z' },
    ],
  });

  const facts = getWeeklyImpactFacts(7, store, now);
  const math = facts.subjects.find((subject) => subject.subject === 'Math');

  assert.equal(facts.quizAttemptsThisWeek, 2);
  assert.equal(facts.gamesPlayedThisWeek, 1);
  assert.equal(facts.completedLessonsThisWeek, 1);
  assert.equal(math.averagePreviousWeek, 60);
  assert.equal(math.averageThisWeek, 80);
  assert.equal(math.changeInPercentagePoints, 20);
  assert.equal(facts.focusSubject, 'Science');
});

test('weekly facts do not invent a focus subject when there is no quiz activity', () => {
  const store = storeFrom({
    subjects: [],
    lessons: [],
    quiz_attempts: [],
    game_plays: [],
    user_progress: [],
  });

  const facts = getWeeklyImpactFacts(7, store, now);
  assert.equal(facts.quizAttemptsThisWeek, 0);
  assert.equal(facts.focusSubject, null);
  assert.deepEqual(facts.subjects, []);
});

test('portfolio includes only the learner’s actual completed lessons, badges, and passed games', () => {
  const store = storeFrom({
    users: [{ id: 7, role: 'student', name: 'Rahul', xp: 140, level: 2 }],
    subjects: [{ id: 1, name: 'Math' }],
    lessons: [{ id: 10, title: 'Fractions', subject_id: 1 }],
    user_progress: [
      { user_id: 7, lesson_id: 10, completed: 1, mastery: 82, completed_at: '2026-10-26T08:00:00.000Z' },
      { user_id: 7, lesson_id: 11, completed: 0, mastery: 40 },
    ],
    user_badges: [{ user_id: 7, badge_id: 2, earned_at: '2026-10-25T08:00:00.000Z' }],
    badges: [{ id: 2, name: 'Quiz Master', icon: '🏆' }],
    game_progress: [
      { user_id: 7, game_slug: 'village-market', passed_levels: 2, mastery: 88 },
      { user_id: 7, game_slug: 'not-passed', passed_levels: 0, mastery: 40 },
    ],
  });
  const catalog = [{ slug: 'village-market', name: 'Village Market' }];

  const portfolio = buildLearnerPortfolio(7, store, catalog);

  assert.equal(portfolio.student.name, 'Rahul');
  assert.deepEqual(portfolio.totals, { lessons: 1, badges: 1, games: 1 });
  assert.equal(portfolio.completedLessons[0].title, 'Fractions');
  assert.equal(portfolio.completedLessons[0].mastery, 82);
  assert.equal(portfolio.earnedBadges[0].name, 'Quiz Master');
  assert.equal(portfolio.completedGames[0].name, 'Village Market');
  assert.equal(buildLearnerPortfolio(99, store, catalog), null);
});

test('report normalization accepts exactly three sentences and rejects other output shapes', () => {
  assert.equal(
    normalizeThreeSentenceReport('Math improved this week. Science needs practice. Keep learning!'),
    'Math improved this week. Science needs practice. Keep learning!'
  );
  assert.equal(
    normalizeThreeSentenceReport('गणित में सुधार हुआ। विज्ञान का अभ्यास करें। सीखते रहें।'),
    'गणित में सुधार हुआ। विज्ञान का अभ्यास करें। सीखते रहें।'
  );
  assert.equal(normalizeThreeSentenceReport('Only two sentences. Try again.'), null);
  assert.equal(normalizeThreeSentenceReport('One. Two. Three. Four.'), null);
});

test('AI report generation receives only activity facts and requests the selected language', async () => {
  let prompt;
  let systemInstruction;
  const facts = { quizAttemptsThisWeek: 0, focusSubject: null, subjects: [] };
  const report = await generateWeeklyParentReport(facts, 'hi', async (request, instruction) => {
    prompt = request;
    systemInstruction = instruction;
    return 'इस सप्ताह गतिविधि दर्ज नहीं हुई। साथ में एक छोटा पाठ चुनें। नियमित अभ्यास से प्रगति होगी।';
  });

  assert.match(prompt, /Hindi/);
  assert.match(prompt, /Do not invent progress/);
  assert.match(prompt, /"quizAttemptsThisWeek":0/);
  assert.doesNotMatch(prompt, /student name/i);
  assert.match(systemInstruction, /Never infer facts/);
  assert.equal(report, 'इस सप्ताह गतिविधि दर्ज नहीं हुई। साथ में एक छोटा पाठ चुनें। नियमित अभ्यास से प्रगति होगी।');
  assert.equal(await generateWeeklyParentReport(facts, 'unsupported', async () => 'One. Two. Three.'), null);
});
