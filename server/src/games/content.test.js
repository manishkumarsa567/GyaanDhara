import assert from 'node:assert/strict';
import test from 'node:test';
import { getGameBySlug, GAMES_CATALOG } from './catalog.js';
import { getGameContent } from './content.js';
import { generateMathSpeedQuestions } from './mathSpeed.js';

test('Village Farm Manager is catalogued and returns resource-management turns by level', () => {
  const game = getGameBySlug('village-farm-manager');
  assert.ok(game);
  assert.equal(game.engine, 'farm_sim');
  assert.ok(GAMES_CATALOG.length >= 55);

  const levelOne = getGameContent(game, 1);
  const levelThree = getGameContent(game, 3);
  assert.equal(levelOne.engine, 'farm_sim');
  assert.equal(levelOne.data.length, 4);
  assert.equal(levelThree.data.length, 6);
  assert.ok(levelOne.data.every((round) => (
    round.story
    && round.q
    && round.options.length === 3
    && round.options.every((option) => Number.isInteger(option.points) && option.effects && option.feedback)
  )));
});

test('procedural math-speed profiles generate 50 distinct sets from shared engine data', () => {
  const slugs = [
    'math-speed-drill',
    'times-table-rush',
    'decimal-dash',
    'money-math',
    'speed-math-tournament',
    'emoji-math',
    'solar-energy-calculator',
    'addition-speed-practice',
    'fraction-speed-practice',
  ];

  for (const slug of slugs) {
    const sets = new Set();
    for (let seed = 1; seed <= 50; seed += 1) {
      let state = seed;
      const random = () => {
        state = (state * 16807) % 2147483647;
        return (state - 1) / 2147483646;
      };
      const questions = generateMathSpeedQuestions(slug, 2, random);
      assert.equal(questions.length, 40);
      assert.ok(questions.every(({ q, answer }) => q && Number.isFinite(answer)));
      sets.add(JSON.stringify(questions));
    }
    assert.equal(sets.size, 50, `${slug} should produce distinct question sets`);
  }
});

test('math speed games use generated content for their configured operations', () => {
  const checks = [
    ['addition-speed-practice', /^[\d,]+ \+ [\d,]+$/],
    ['times-table-rush', /^\d+ × \d+$/],
    ['fraction-speed-practice', /^\d+\/\d+ of \d+$/],
  ];

  for (const [slug, pattern] of checks) {
    const game = getGameBySlug(slug);
    assert.ok(game, `${slug} should be catalogued`);
    const content = getGameContent(game, 2);
    assert.equal(content.engine, 'math_speed');
    assert.equal(content.data.length, 40);
    assert.ok(content.data.every((question) => pattern.test(question.q)));
  }
});

test('word, sentence, and state scrambles all share the generic scramble data contract', () => {
  for (const slug of ['word-scramble-english', 'sentence-scramble', 'indian-states-scramble']) {
    const game = getGameBySlug(slug);
    assert.ok(game, `${slug} should be catalogued`);
    const content = getGameContent(game, 2);
    assert.equal(content.engine, 'scramble');
    assert.ok(content.data.length >= 4);
    assert.ok(content.data.every((item) => item.answer && item.hint && ['letters', 'words'].includes(item.kind)));
  }
  assert.ok(getGameBySlug('sentence-scramble'));
  assert.ok(getGameBySlug('indian-states-scramble'));
});

test('17 new thematic games (IDs 72-88) in Agriculture, Finance, and Rural History have valid catalog and playable content', () => {
  const expectedSlugs = [
    // Agriculture
    'crop-rotation-master',
    'soil-nutrient-match',
    'monsoon-irrigation-quest',
    'natural-pest-defense',
    'millet-mission-india',
    'harvest-market-math',
    // Finance
    'kisan-credit-card-math',
    'village-bank-passbook',
    'shg-savings-circle',
    'crop-insurance-safety',
    'simple-interest-haat',
    'mandi-price-bargain',
    // Rural History
    'champaran-indigo-history',
    'bardoli-farmers-revolt',
    'ancient-stepwells-tanks',
    'rural-artisans-handicrafts',
    'chipko-forest-guardians',
  ];

  assert.equal(expectedSlugs.length, 17);
  assert.equal(GAMES_CATALOG.length, 88);

  for (const slug of expectedSlugs) {
    const game = getGameBySlug(slug);
    assert.ok(game, `Game ${slug} must exist in catalog`);
    assert.ok(game.id >= 72 && game.id <= 88, `Game ${slug} ID must be in 72..88`);
    const content = getGameContent(game, 1);
    assert.ok(content, `Game ${slug} must return content`);
    assert.equal(content.engine, game.engine, `Game ${slug} engine must match content engine`);

    if (content.engine === 'quiz') {
      assert.ok(Array.isArray(content.data), `${slug} quiz data should be array`);
      assert.ok(content.data.length >= 3, `${slug} quiz data should have at least 3 questions`);
      assert.ok(content.data.every((q) => q.q && Array.isArray(q.options) && typeof q.answer === 'number'));
    } else if (content.engine === 'true_false') {
      assert.ok(Array.isArray(content.data), `${slug} true_false data should be array`);
      assert.ok(content.data.length >= 3, `${slug} true_false data should have questions`);
      assert.ok(content.data.every((q) => q.q && typeof q.answer === 'boolean'));
    } else if (content.engine === 'sequence') {
      assert.ok(content.data && content.data.items && content.data.correct, `${slug} sequence data must have items and correct`);
      assert.equal(content.data.items.length, content.data.correct.length);
    } else if (content.engine === 'flashcard') {
      assert.ok(Array.isArray(content.data), `${slug} flashcard data should be array`);
      assert.ok(content.data.every((card) => card.front && card.back));
    } else if (content.engine === 'match_pairs') {
      assert.ok(Array.isArray(content.data), `${slug} match_pairs data should be array`);
      assert.ok(content.data.every((pair) => pair.left && pair.right));
    }
  }
});
