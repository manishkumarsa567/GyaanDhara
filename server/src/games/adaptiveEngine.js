/** Adaptive game progression — pass threshold 50%, level 1–3 */
export const PASS_THRESHOLD = 50;
export const MAX_GAME_LEVEL = 3;

/** Smoothed mastery using exponential moving average (realistic learning curve) */
export function updateMastery(currentMastery, accuracyPercent, attemptCount) {
  const alpha = attemptCount <= 1 ? 0.5 : 0.35;
  const next = currentMastery * (1 - alpha) + accuracyPercent * alpha;
  return Math.round(Math.min(100, Math.max(0, next)));
}

/** Recommend next in-game level after attempt */
export function resolveLevelAfterAttempt(currentLevel, accuracyPercent, consecutiveFails) {
  if (accuracyPercent >= PASS_THRESHOLD) {
    return {
      passed: true,
      newLevel: Math.min(currentLevel + 1, MAX_GAME_LEVEL),
      levelUnlocked: currentLevel < MAX_GAME_LEVEL,
      message: 'pass',
    };
  }
  return {
    passed: false,
    newLevel: Math.max(1, currentLevel - (consecutiveFails >= 3 ? 1 : 0)),
    levelUnlocked: false,
    message: 'fail',
  };
}

/** XP scales with level difficulty and accuracy */
export function calculateGameXp(baseXp, level, accuracyPercent, passed) {
  const levelMultiplier = 1 + (level - 1) * 0.25;
  const accuracyFactor = accuracyPercent / 100;
  let xp = Math.round(baseXp * levelMultiplier * accuracyFactor);
  if (passed && accuracyPercent >= PASS_THRESHOLD) xp += Math.round(baseXp * 0.2);
  if (accuracyPercent === 100) xp += 5;
  return Math.max(passed ? 3 : 1, xp);
}

/** Show manual after any failed attempt on same game (repeat failure) */
export function shouldShowManual(failCount, accuracyPercent) {
  return accuracyPercent < PASS_THRESHOLD && failCount >= 1;
}

export function getProgressRecord(db, userId, slug) {
  return db.find('game_progress', (p) => p.user_id === userId && p.game_slug === slug);
}

export async function upsertProgress(db, userId, slug, updates) {
  const existing = getProgressRecord(db, userId, slug);
  if (existing) {
    return db.update('game_progress', (p) => p.id === existing.id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }
  return db.insert('game_progress', {
    user_id: userId,
    game_slug: slug,
    level: 1,
    attempts: 0,
    fail_count: 0,
    mastery: 0,
    best_accuracy: 0,
    consecutive_fails: 0,
    passed_levels: 0,
    ...updates,
    updated_at: new Date().toISOString(),
  });
}
