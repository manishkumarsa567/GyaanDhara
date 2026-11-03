import test from 'node:test';
import assert from 'node:assert/strict';
import {
  awardBossRewards,
  buildNarrativeQuest,
  LOOT_ITEMS,
  openMysteryBox,
  updateDailyStreak,
} from './gamification.js';

function createStore(tables = {}) {
  const data = Object.fromEntries(Object.entries(tables).map(([key, rows]) => [key, rows.map((row) => ({ ...row }))]));
  const store = {
    get: (name) => data[name] || [],
    find: (name, predicate) => (data[name] || []).find(predicate),
    filter: (name, predicate) => (data[name] || []).filter(predicate),
    insert: async (name, row) => {
      const saved = { id: (data[name] || []).length + 1, ...row };
      (data[name] ||= []).push(saved);
      return saved;
    },
    upsert: async (name, predicate, row) => {
      const current = (data[name] || []).find(predicate);
      if (current) return current;
      return store.insert(name, row);
    },
    update: async (name, predicate, updates) => {
      const rows = data[name] || [];
      const index = rows.findIndex(predicate);
      if (index < 0) return null;
      rows[index] = { ...rows[index], ...updates };
      return rows[index];
    },
  };
  return store;
}

test('daily streak preserves same-day activity and increments on the next day', () => {
  const sameDay = updateDailyStreak({ streak: 5, streak_freezes: 1, last_active: '2026-10-27' }, '2026-10-27');
  assert.equal(sameDay.streak, 5);
  assert.equal(sameDay.streakFreezes, 1);
  const nextDay = updateDailyStreak({ streak: 5, last_active: '2026-10-27' }, '2026-10-28');
  assert.equal(nextDay.streak, 6);
});

test('earned streak freezes cover missed days, but insufficient freezes do not get consumed', () => {
  const protectedStreak = updateDailyStreak({
    streak: 10,
    streak_freezes: 2,
    last_active: '2026-10-24',
  }, '2026-10-27');
  assert.equal(protectedStreak.streak, 11);
  assert.equal(protectedStreak.streakFreezes, 0);
  assert.equal(protectedStreak.freezesUsed, 2);

  const brokenStreak = updateDailyStreak({
    streak: 10,
    streak_freezes: 1,
    last_active: '2026-10-24',
  }, '2026-10-27');
  assert.equal(brokenStreak.streak, 1);
  assert.equal(brokenStreak.streakFreezes, 1);
  assert.equal(brokenStreak.freezesUsed, 0);
});

test('hard and expert passing quizzes earn one box per lesson and perfect scores bank up to two freezes', async () => {
  const store = createStore({
    users: [{ id: 1, streak_freezes: 0 }],
    loot_boxes: [],
  });
  const user = store.find('users', (item) => item.id === 1);
  const first = await awardBossRewards({
    user, lessonId: 7, difficulty: 'hard', score: 4, total: 5, store,
  });
  assert.ok(first.mysteryBox);
  assert.equal(first.streakFreezeEarned, false);

  const repeat = await awardBossRewards({
    user, lessonId: 7, difficulty: 'hard', score: 5, total: 5, store,
  });
  assert.equal(repeat.mysteryBox, null);
  assert.equal(repeat.streakFreezeEarned, true);
  assert.equal(repeat.streakFreezes, 1);

  const expert = await awardBossRewards({
    user: store.find('users', (item) => item.id === 1),
    lessonId: 7,
    difficulty: 'expert',
    score: 5,
    total: 5,
    store,
  });
  assert.ok(expert.mysteryBox);
  assert.equal(expert.streakFreezes, 2);

  const capped = await awardBossRewards({
    user: store.find('users', (item) => item.id === 1),
    lessonId: 8,
    difficulty: 'expert',
    score: 5,
    total: 5,
    store,
  });
  assert.ok(capped.mysteryBox);
  assert.equal(capped.streakFreezeEarned, false);
  assert.equal(capped.streakFreezes, 2);

  const failed = await awardBossRewards({
    user, lessonId: 9, difficulty: 'expert', score: 3, total: 5, store,
  });
  assert.equal(failed.mysteryBox, null);
  assert.equal(store.get('loot_boxes').length, 3);
});

test('mystery boxes reveal a stored cosmetic once and are private to the owner', async () => {
  const store = createStore({
    loot_boxes: [{ id: 5, user_id: 1, opened: false, item: null }],
  });
  const notOwner = await openMysteryBox(2, 5, store);
  assert.match(notOwner.error, /not found/);

  const opened = await openMysteryBox(1, 5, store, (items) => items[0]);
  assert.equal(opened.box.opened, true);
  assert.deepEqual(opened.box.item, LOOT_ITEMS[0]);
  const repeated = await openMysteryBox(1, 5, store, (items) => items[0]);
  assert.match(repeated.error, /already been opened/);
});

test('village-doctor quest follows science lessons and derives completion from learner progress', () => {
  const store = createStore({
    subjects: [{ id: 2, name: 'Science' }],
    lessons: [
      { id: 20, subject_id: 2, order_index: 2, title: 'Plants' },
      { id: 10, subject_id: 2, order_index: 1, title: 'Water' },
    ],
    user_progress: [{ user_id: 1, lesson_id: 10, completed: 1 }],
  });
  const quest = buildNarrativeQuest(1, store);
  assert.equal(quest.id, 'village-doctor');
  assert.equal(quest.steps[0].lessonId, 10);
  assert.equal(quest.steps[0].completed, true);
  assert.equal(quest.currentStep, 1);
  assert.equal(quest.completed, false);
  store.get('user_progress').push({ user_id: 1, lesson_id: 20, completed: 1 });
  assert.equal(buildNarrativeQuest(1, store).completed, true);
});
