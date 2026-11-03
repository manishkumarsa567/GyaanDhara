import { randomInt } from 'node:crypto';

export const MAX_STREAK_FREEZES = 2;
export const BOSS_DIFFICULTIES = new Set(['hard', 'expert']);
export const LOOT_ITEMS = [
  { id: 'sunrise-avatar', name: 'Sunrise Explorer', category: 'avatar', icon: '🌅' },
  { id: 'peacock-avatar', name: 'Peacock Friend', category: 'avatar', icon: '🦚' },
  { id: 'banyan-village', name: 'Banyan Village', category: 'village_skin', icon: '🌳' },
  { id: 'monsoon-village', name: 'Monsoon Village', category: 'village_skin', icon: '🌧️' },
  { id: 'curious-mind-badge', name: 'Curious Mind', category: 'badge', icon: '🔎' },
  { id: 'village-helper-badge', name: 'Village Helper', category: 'badge', icon: '🤝' },
];

export function updateDailyStreak(user, today) {
  const streak = Number.isSafeInteger(user.streak) ? user.streak : 0;
  const streakFreezes = Math.min(MAX_STREAK_FREEZES, Math.max(0, Number.isSafeInteger(user.streak_freezes) ? user.streak_freezes : 0));
  if (!user.last_active) return { streak: 1, streakFreezes, last_active: today, freezesUsed: 0 };

  const previousDate = new Date(`${user.last_active}T00:00:00.000Z`);
  const currentDate = new Date(`${today}T00:00:00.000Z`);
  if (!Number.isFinite(previousDate.getTime()) || !Number.isFinite(currentDate.getTime())) {
    throw new Error('Unable to calculate the daily streak from an invalid activity date.');
  }
  const daysSinceActive = Math.round((currentDate - previousDate) / 86_400_000);
  if (daysSinceActive <= 0) return { streak, streakFreezes, last_active: user.last_active, freezesUsed: 0 };
  if (daysSinceActive === 1) return { streak: streak + 1, streakFreezes, last_active: today, freezesUsed: 0 };

  const missedDays = daysSinceActive - 1;
  if (streakFreezes >= missedDays) {
    return {
      streak: streak + 1,
      streakFreezes: streakFreezes - missedDays,
      last_active: today,
      freezesUsed: missedDays,
    };
  }
  return { streak: 1, streakFreezes, last_active: today, freezesUsed: 0 };
}

export async function awardBossRewards({ user, lessonId, difficulty, score, total, store, now = new Date() }) {
  if (!BOSS_DIFFICULTIES.has(difficulty) || total < 1 || score / total < 0.75) {
    return { mysteryBox: null, streakFreezeEarned: false, streakFreezes: user.streak_freezes || 0 };
  }

  const alreadyEarned = store.find('loot_boxes', (box) => (
    box.user_id === user.id && box.lesson_id === lessonId && box.difficulty === difficulty
  ));
  let mysteryBox = null;
  if (!alreadyEarned) {
    mysteryBox = await store.upsert('loot_boxes', (box) => (
      box.user_id === user.id && box.lesson_id === lessonId && box.difficulty === difficulty
    ), {
      user_id: user.id,
      lesson_id: lessonId,
      difficulty,
      opened: false,
      item: null,
      created_at: now.toISOString(),
    });
  }

  const currentFreezes = Number.isSafeInteger(user.streak_freezes) ? user.streak_freezes : 0;
  const streakFreezeEarned = score === total && currentFreezes < MAX_STREAK_FREEZES;
  const streakFreezes = streakFreezeEarned ? currentFreezes + 1 : currentFreezes;
  if (streakFreezeEarned) await store.update('users', (entry) => entry.id === user.id, { streak_freezes: streakFreezes });
  return { mysteryBox, streakFreezeEarned, streakFreezes };
}

export async function openMysteryBox(userId, boxId, store, chooseItem = (items) => items[randomInt(items.length)]) {
  const box = store.find('loot_boxes', (entry) => entry.id === boxId && entry.user_id === userId);
  if (!box) return { error: 'Mystery box not found.' };
  if (box.opened) return { error: 'This mystery box has already been opened.' };
  const item = chooseItem(LOOT_ITEMS);
  const opened = await store.update('loot_boxes', (entry) => entry.id === box.id && entry.user_id === userId && !entry.opened, {
    opened: true,
    item,
    opened_at: new Date().toISOString(),
  });
  if (!opened) return { error: 'This mystery box has already been opened.' };
  return { box: opened };
}

export function buildNarrativeQuest(userId, store) {
  const science = store.find('subjects', (subject) => subject.name.toLocaleLowerCase() === 'science');
  if (!science) return null;
  const lessons = store.filter('lessons', (lesson) => lesson.subject_id === science.id)
    .sort((left, right) => left.order_index - right.order_index || left.id - right.id);
  if (!lessons.length) return null;

  const progress = new Map(
    store.filter('user_progress', (entry) => entry.user_id === userId)
      .map((entry) => [entry.lesson_id, entry])
  );
  const steps = lessons.map((lesson, index) => ({
    id: lesson.id,
    lessonId: lesson.id,
    title: lesson.title,
    chapter: index === 0
      ? 'A village clinic needs a curious helper. Learn the science behind the clues to guide the doctor.'
      : index === 1
        ? 'The village doctor found a new challenge. Use what you learned to care for the community.'
        : 'Bring your science knowledge to the next village challenge and help the doctor find a solution.',
    href: `/lesson/${lesson.id}`,
    completed: progress.get(lesson.id)?.completed === 1,
  }));
  const nextStepIndex = steps.findIndex((step) => !step.completed);
  return {
    id: 'village-doctor',
    title: 'Village Doctor: The Healthy Village Quest',
    premise: 'Become the village doctor’s science helper. Complete each science lesson to solve a new community health challenge.',
    steps,
    completed: nextStepIndex === -1,
    currentStep: nextStepIndex === -1 ? null : nextStepIndex,
  };
}

export function chooseMysteryItem(items) {
  return items[randomInt(items.length)];
}
