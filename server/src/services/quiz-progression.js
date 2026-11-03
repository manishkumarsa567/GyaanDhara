import { quizDifficulties } from '../questionBank.js';

export const QUIZ_PASS_PERCENT = 75;
export const QUIZ_DIFFICULTY_ORDER = Object.keys(quizDifficulties);

function passedAttempt(attempt) {
  return Number(attempt.total) > 0
    && (Number(attempt.score) / Number(attempt.total)) * 100 >= QUIZ_PASS_PERCENT;
}

export function getQuizProgression(userId, lessonId, db) {
  const attempts = db
    .filter('quiz_attempts', (attempt) => attempt.user_id === userId && attempt.lesson_id === lessonId)
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
  const passedLevels = QUIZ_DIFFICULTY_ORDER.filter((difficulty) =>
    attempts.some((attempt) => attempt.difficulty === difficulty && passedAttempt(attempt))
  );

  let unlockedIndex = 0;
  while (unlockedIndex < QUIZ_DIFFICULTY_ORDER.length - 1
    && passedLevels.includes(QUIZ_DIFFICULTY_ORDER[unlockedIndex])) {
    unlockedIndex++;
  }

  const unlockedDifficulty = QUIZ_DIFFICULTY_ORDER[unlockedIndex];
  let consecutiveFailures = 0;
  for (const attempt of attempts) {
    if (passedAttempt(attempt)) break;
    consecutiveFailures++;
  }

  return {
    unlockedDifficulty,
    unlockedLevels: QUIZ_DIFFICULTY_ORDER.slice(0, unlockedIndex + 1),
    passedLevels,
    passPercent: QUIZ_PASS_PERCENT,
    consecutiveFailures,
    hintsUnlocked: consecutiveFailures >= 3,
  };
}
