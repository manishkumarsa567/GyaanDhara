import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addAIGroupRecommendations,
  getActiveSeasonalContent,
  getMasteryGroups,
  normalizeSeasonalContent,
  normalizeTeacherQuiz,
} from './teacher-studio.js';

const createStore = (tables) => ({
  get: (name) => tables[name] || [],
  find: (name, predicate) => (tables[name] || []).find(predicate),
  filter: (name, predicate) => (tables[name] || []).filter(predicate),
});

test('teacher quiz validator accepts valid questions and rejects exposed answer shape errors', () => {
  const result = normalizeTeacherQuiz({
    title: 'Daily math drill',
    subjectId: '4',
    questions: [{
      prompt: 'What is 6 × 7?',
      options: ['36', '42'],
      answerIndex: 1,
      explanation: 'Six groups of seven make forty-two.',
    }],
  });
  assert.equal(result.quiz.subjectId, 4);
  assert.equal(result.quiz.questions[0].answerIndex, 1);
  assert.equal(normalizeTeacherQuiz({ title: 'No', questions: [] }).error !== undefined, true);
  assert.equal(normalizeTeacherQuiz({
    title: 'Daily math drill',
    questions: [{ prompt: 'Choose', options: ['Only one'], answerIndex: 0 }],
  }).error !== undefined, true);
  assert.equal(normalizeTeacherQuiz(undefined).error !== undefined, true);
  assert.equal(normalizeTeacherQuiz({
    title: 'Daily math drill',
    questions: [{ prompt: 'Choose one', options: ['First', '', 'Third'], answerIndex: 2 }],
  }).error !== undefined, true);
  assert.equal(normalizeTeacherQuiz({
    title: 'Daily math drill',
    subjectId: '4x',
    questions: [{ prompt: 'Choose one', options: ['First', 'Second'], answerIndex: 0 }],
  }).error, 'Choose a valid subject.');
});

test('mastery grouping sorts students into evidence-based support, practice, and extension buckets', () => {
  const store = createStore({
    users: [
      { id: 1, name: 'Anu', role: 'student' },
      { id: 2, name: 'Bala', role: 'student' },
      { id: 3, name: 'Chitra', role: 'student' },
      { id: 4, name: 'Dev', role: 'student' },
      { id: 5, name: 'Teacher', role: 'teacher' },
    ],
    subjects: [{ id: 10, name: 'Mathematics' }],
    lessons: [{ id: 100, subject_id: 10 }, { id: 101, subject_id: 10 }],
    user_progress: [
      { user_id: 1, lesson_id: 100, attempts: 2, mastery: 30 },
      { user_id: 2, lesson_id: 100, attempts: 1, mastery: 60 },
      { user_id: 3, lesson_id: 100, attempts: 1, mastery: 90 },
      { user_id: 4, lesson_id: 100, attempts: 0, mastery: 0, completed: 0 },
      { user_id: 5, lesson_id: 100, attempts: 1, mastery: 100 },
    ],
  });

  const groups = getMasteryGroups(store);
  assert.equal(groups.length, 3);
  assert.deepEqual(groups.find((group) => group.groupId === 'support').students.map((student) => student.studentId), [1, 4]);
  assert.deepEqual(groups.find((group) => group.groupId === 'practice').students.map((student) => student.studentId), [2]);
  assert.deepEqual(groups.find((group) => group.groupId === 'extension').students.map((student) => student.studentId), [3]);
  assert.equal(groups.find((group) => group.groupId === 'support').averageMastery, 30);
});

test('AI may enrich teaching recommendations but cannot change deterministic group memberships', async () => {
  const groups = [{
    subjectId: 1,
    subject: 'Mathematics',
    groupId: 'support',
    group: 'Needs support',
    recommendation: 'Start with guided practice and foundational examples.',
    students: [{ studentId: 3, name: 'Learner', mastery: 25 }],
    averageMastery: 25,
  }];
  const enriched = await addAIGroupRecommendations(groups, 'en', async (prompt) => {
    assert.match(prompt, /Do not change group membership/);
    return '{"0":"Use counters to model the operation together."}';
  });
  assert.equal(enriched[0].recommendation, 'Use counters to model the operation together.');
  assert.equal(enriched[0].recommendationSource, 'ai');
  assert.equal(enriched[0].students[0].studentId, 3);
  const fallback = await addAIGroupRecommendations(groups, 'en', async () => { throw new Error('offline'); });
  assert.equal(fallback[0].recommendation, groups[0].recommendation);
});

test('seasonal content is published only during its configured date window', () => {
  const now = new Date('2026-06-15T12:00:00.000Z');
  const { content, error } = normalizeSeasonalContent({
    title: 'Monsoon farming',
    body: 'Prepare fields and protect the young crops.',
    startsAt: '2026-06-01T00:00:00.000Z',
    endsAt: '2026-06-30T23:59:59.000Z',
  });
  assert.equal(error, undefined);
  assert.equal(getActiveSeasonalContent([{ ...content, published: true }], now).length, 1);
  assert.equal(getActiveSeasonalContent([{ ...content, published: false }], now).length, 0);
  assert.equal(normalizeSeasonalContent({ title: 'Bad', body: 'Short', startsAt: 'bad', endsAt: 'bad' }).error !== undefined, true);
  assert.equal(normalizeSeasonalContent({
    title: 'Valid title',
    body: 'A seasonal learning note for students.',
    subjectId: '-1',
    startsAt: '2026-06-01T00:00:00.000Z',
    endsAt: '2026-06-30T00:00:00.000Z',
  }).error, 'Choose a valid subject.');
});
