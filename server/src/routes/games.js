import { Router } from 'express';
import db from '../db.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { GAMES_CATALOG, GAME_CATEGORIES, getGameBySlug } from '../games/catalog.js';
import { getGameContent } from '../games/content.js';
import { levelFromXp } from '../services/adaptive.js';
import {
  PASS_THRESHOLD,
  MAX_GAME_LEVEL,
  updateMastery,
  resolveLevelAfterAttempt,
  calculateGameXp,
  shouldShowManual,
  getProgressRecord,
  upsertProgress,
} from '../games/adaptiveEngine.js';
import { getHints, getPassMessage } from '../games/hints.js';
import { getGameManual } from '../games/manuals.js';
import { translateEntityMap, translateGameContent, translateGameManual } from '../services/content-i18n.js';

const router = Router();

router.get('/catalog', auth, async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const userId = req.user.id;
    const plays = db.filter('game_plays', () => true);

    let categories = GAME_CATEGORIES.map((c) => ({ ...c, id: c.id }));
    categories = await translateEntityMap(lang, 'game_categories', categories, ['name']);

    let games = GAMES_CATALOG.map((g) => {
      const prog = getProgressRecord(db, userId, g.slug);
      return {
        ...g,
        totalPlays: plays.filter((p) => p.game_slug === g.slug).length,
        userLevel: prog?.level || 1,
        userMastery: prog?.mastery || 0,
      };
    });
    games = await translateEntityMap(lang, 'games', games, ['name']);

    res.json({
      categories,
      games: games.map((g) => ({
        ...g,
        description: `${g.name} — +${g.xp} XP`,
      })),
      totalGames: GAMES_CATALOG.length,
      passThreshold: PASS_THRESHOLD,
      lang,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats/overview', auth, (req, res) => {
  const plays = db.filter('game_plays', (p) => p.user_id === req.user.id);
  const progress = db.filter('game_progress', (p) => p.user_id === req.user.id);
  const uniqueGames = new Set(plays.map((p) => p.game_slug)).size;
  res.json({
    totalPlays: plays.length,
    uniqueGamesPlayed: uniqueGames,
    totalGames: GAMES_CATALOG.length,
    totalXpFromGames: plays.reduce((s, p) => s + (p.xp_earned || 0), 0),
    gamesPassed: progress.filter((p) => p.passed_levels > 0).length,
    recent: plays.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
  });
});

router.get('/:slug', auth, async (req, res) => {
  try {
    const game = getGameBySlug(req.params.slug);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const lang = req.query.lang || req.user.preferred_language || 'en';
    const userId = req.user.id;
    const prog = await upsertProgress(db, userId, game.slug, {
      last_opened_at: new Date().toISOString(),
    });

    let [translatedGame] = await translateEntityMap(lang, 'games', [game], ['name']);

    const level = prog.level || 1;
    let content = getGameContent(translatedGame || game, level);
    content = await translateGameContent(content, lang);

    const userPlays = db.filter('game_plays', (p) => p.user_id === userId && p.game_slug === game.slug);
    const lastFail = userPlays.find((p) => p.total > 0 && (p.score / p.total) * 100 < PASS_THRESHOLD);

    const showManualOnStart = Boolean(prog.fail_count >= 1 || lastFail);
    const gameName = translatedGame?.name || game.name;
    let manual = getGameManual(game.engine, lang, gameName, level, game.slug);
    if (manual) manual = await translateGameManual(manual, lang);

    res.json({
      game: { ...(translatedGame || game), currentLevel: level, maxLevel: MAX_GAME_LEVEL },
      content,
      progress: {
        level: prog.level,
        mastery: prog.mastery,
        attempts: prog.attempts,
        failCount: prog.fail_count,
        bestAccuracy: prog.best_accuracy,
        passedLevels: prog.passed_levels,
      },
      passThreshold: PASS_THRESHOLD,
      bestScore: Math.max(0, ...userPlays.map((p) => (p.total ? Math.round((p.score / p.total) * 100) : 0))),
      plays: userPlays.length,
      manual,
      showManualOnStart,
      lang,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:slug/complete', auth, asyncHandler(async (req, res) => {
  const game = getGameBySlug(req.params.slug);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const lang = req.body.lang || req.user.preferred_language || 'en';
  const { score, total, timeSeconds } = req.body;
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  const userId = req.user.id;
  let prog = getProgressRecord(db, userId, game.slug);
  if (!prog) prog = await upsertProgress(db, userId, game.slug, {});

  const currentLevel = prog.level || 1;
  const passed = accuracy >= PASS_THRESHOLD;
  const failCount = passed ? prog.fail_count : (prog.fail_count || 0) + 1;
  const consecutiveFails = passed ? 0 : (prog.consecutive_fails || 0) + 1;

  const levelResult = resolveLevelAfterAttempt(currentLevel, accuracy, consecutiveFails);
  const newMastery = updateMastery(prog.mastery || 0, accuracy, (prog.attempts || 0) + 1);
  const newBest = Math.max(prog.best_accuracy || 0, accuracy);

  let newLevel = currentLevel;
  let passedLevels = prog.passed_levels || 0;
  if (passed) {
    if (currentLevel >= MAX_GAME_LEVEL) {
      newLevel = MAX_GAME_LEVEL;
    } else {
      newLevel = levelResult.newLevel;
      passedLevels += 1;
    }
  } else {
    newLevel = levelResult.newLevel;
  }

  await upsertProgress(db, userId, game.slug, {
    level: newLevel,
    attempts: (prog.attempts || 0) + 1,
    fail_count: failCount,
    consecutive_fails: consecutiveFails,
    mastery: newMastery,
    best_accuracy: newBest,
    passed_levels: passedLevels,
  });

  const xpEarned = calculateGameXp(game.xp, currentLevel, accuracy, passed);
  const user = db.find('users', (u) => u.id === userId);
  const newXp = user.xp + xpEarned;
  const newLevelUser = levelFromXp(newXp);
  await db.update('users', (u) => u.id === userId, { xp: newXp, level: newLevelUser });

  await db.insert('game_plays', {
    user_id: userId,
    game_slug: game.slug,
    game_name: game.name,
    engine: game.engine,
    score: score || 0,
    total: total || 0,
    accuracy,
    game_level: currentLevel,
    passed: passed ? 1 : 0,
    xp_earned: xpEarned,
    time_seconds: timeSeconds || 0,
    created_at: new Date().toISOString(),
  });

  const showManual = shouldShowManual(failCount, accuracy);
  let manual = showManual ? getGameManual(game.engine, lang, game.name, currentLevel, game.slug) : null;
  if (manual) manual = await translateGameManual(manual, lang);
  const hintData = !passed ? getHints(game.engine, lang, accuracy) : { hints: [], suggestion: null };

  const atMaxLevel = passed && currentLevel >= MAX_GAME_LEVEL;
  const message = passed
    ? getPassMessage(lang, levelResult.levelUnlocked, atMaxLevel)
    : hintData.suggestion;

  res.json({
    xpEarned,
    newXp,
    newLevel: newLevelUser,
    accuracy,
    passed,
    passThreshold: PASS_THRESHOLD,
    gameLevel: currentLevel,
    nextLevel: passed ? newLevel : currentLevel,
    levelUnlocked: passed && currentLevel < MAX_GAME_LEVEL,
    atMaxLevel,
    mastery: newMastery,
    hints: hintData.hints,
    suggestion: hintData.suggestion,
    manual,
    showManual,
    message,
    lang,
  });
}));

export default router;
