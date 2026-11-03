import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeMistakes,
  createStorySession,
  generateStoryContinuation,
  generateStoryOpening,
  getKnowledgeGraph,
  normalizeStoryScene,
  STORY_CATALOG,
} from './personalization.js';
import { LANG_NAMES } from './gemini.js';

const createStore = (tables) => ({
  get: (name) => tables[name] || [],
  find: (name, predicate) => (tables[name] || []).find(predicate),
  filter: (name, predicate) => (tables[name] || []).filter(predicate),
});

const sceneJson = (overrides = {}) => JSON.stringify({
  scene: 'A curious group of friends arrives at the village garden and notices that the soil is dry.',
  fact: 'Plants need water, light, air, and nutrients to grow well.',
  choices: [
    { id: 'check-soil', label: 'Check the soil before watering' },
    { id: 'ask-farmer', label: 'Ask the farmer what the plants need' },
  ],
  ...overrides,
});

test('mistake analysis limits evidence and only accepts a focus subject from that evidence', async () => {
  const mistakes = Array.from({ length: 7 }, (_, index) => ({
    question: `Question ${index}`,
    expectedAnswer: '12',
    selectedAnswer: '10',
    lesson: 'Subtraction',
    subject: 'Mathematics',
  }));
  let prompt = '';
  const analysis = await analyzeMistakes(mistakes, 'en', async (value) => {
    prompt = value;
    return JSON.stringify({
      pattern: 'You may want to practice subtracting carefully.',
      storyOffer: 'Try a story about sharing grain at the market.',
      focusSubject: 'Mathematics',
    });
  });

  assert.equal((prompt.match(/"question"/g) || []).length, 5);
  assert.equal(analysis.basedOn, 7);
  assert.equal(analysis.focusSubject, 'Mathematics');

  const rejected = await analyzeMistakes(mistakes, 'en', async () => JSON.stringify({
    pattern: 'You may want to practice subtracting carefully.',
    storyOffer: 'Try a story about sharing grain at the market.',
    focusSubject: 'Unrelated subject',
  }));
  assert.equal(rejected, null);
});

test('story scenes reject malformed choices and reused choice identifiers', () => {
  assert.equal(normalizeStoryScene(sceneJson()).choices.length, 2);
  assert.equal(normalizeStoryScene(sceneJson({
    choices: [
      { id: 'same-choice', label: 'First safe choice' },
      { id: 'same-choice', label: 'Second safe choice' },
    ],
  })), null);
  assert.equal(normalizeStoryScene(sceneJson(), ['check-soil']), null);
  assert.equal(normalizeStoryScene(sceneJson({ scene: 'Too short.' })), null);
});

test('story catalog has one original curriculum-aligned story per subject for every class 1-8', () => {
  const subjects = [...new Set(STORY_CATALOG.map((story) => story.subject))];
  assert.equal(subjects.length, 5);
  assert.equal(STORY_CATALOG.length, 40);
  assert.ok(subjects.includes('English'));
  assert.ok(subjects.includes('Hindi'));
  assert.ok(subjects.includes('Science'));
  assert.ok(subjects.includes('Social Studies'));
  assert.ok(subjects.includes('Mathematics'));

  for (const subject of subjects) {
    const gradeStories = STORY_CATALOG.filter((story) => story.subject === subject);
    assert.deepEqual(gradeStories.map((story) => story.grade), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(new Set(gradeStories.map((story) => story.id)).size, 8);
    assert.ok(gradeStories.every((story) => story.learningTopic && story.visual));
  }
});

test('story opening and continuation use the selected language and preserve branching', async () => {
  let openingPrompt = '';
  const opening = await generateStoryOpening('science-class-1-seedling-watch', 'en', async (prompt) => {
    openingPrompt = prompt;
    return sceneJson();
  });
  assert.ok(openingPrompt.includes('English'));
  assert.ok(openingPrompt.includes('class 1'));
  assert.ok(openingPrompt.includes('what plants need to grow'));
  assert.ok(openingPrompt.includes('do not copy'));
  assert.equal(opening.choices.length, 2);

  let continuationPrompt = '';
  const continuation = await generateStoryContinuation(
    { setting: 'village garden', topic: 'seedling story', learningTopic: 'plant needs', grade: 1 },
    [{ ...opening, choice: 'Check the soil', choices: opening.choices }],
    opening.choices[0],
    'en',
    async (prompt) => {
      continuationPrompt = prompt;
      return sceneJson({
        choices: [
          { id: 'water-plants', label: 'Water the plants carefully' },
          { id: 'collect-rain', label: 'Collect rainwater for later' },
        ],
      });
    }
  );
  assert.ok(continuationPrompt.includes('Check the soil'));
  assert.equal(continuation.choices[0].id, 'water-plants');
});

test('all supported languages are used for story openings and continuations regardless of subject', async () => {
  for (const [languageCode, languageName] of Object.entries(LANG_NAMES)) {
    let openingPrompt = '';
    const opening = await generateStoryOpening('english-class-1-sound-hunt', languageCode, async (prompt) => {
      openingPrompt = prompt;
      return sceneJson();
    });
    assert.ok(openingPrompt.includes(`in ${languageName}`), `opening should request ${languageName}`);
    assert.ok(openingPrompt.includes(`every student-facing field (scene, fact, and choice labels) in ${languageName}`));

    let continuationPrompt = '';
    const continued = await generateStoryContinuation(
      STORY_CATALOG.find((story) => story.id === 'hindi-class-1-swar-ki-khoj'),
      [{ ...opening, choice: 'Check the clue', choices: opening.choices }],
      opening.choices[0],
      languageCode,
      async (prompt) => {
        continuationPrompt = prompt;
        return sceneJson({
          choices: [
            { id: 'check-next-clue', label: 'Check the next clue' },
            { id: 'ask-a-friend', label: 'Ask a friend for help' },
          ],
        });
      }
    );
    assert.ok(continuationPrompt.includes(`in ${languageName}`), `continuation should request ${languageName}`);
    assert.ok(continuationPrompt.includes(`every new student-facing field (scene, fact, and choice labels) in ${languageName}`));
    assert.equal(continued.choices.length, 2);
  }
});

test('English is the source language for all story catalog labels, including Hindi subject stories', () => {
  const hindiSubjectStories = STORY_CATALOG.filter((story) => story.subject === 'Hindi');
  assert.equal(hindiSubjectStories.length, 8);
  assert.ok(hindiSubjectStories.every((story) => !/[\u0900-\u097F]/.test(`${story.topic} ${story.learningTopic}`)));
});

test('story session starts with private, bounded per-user state', () => {
  const createdAt = new Date('2026-01-02T03:04:05.000Z');
  const session = createStorySession(42, 'monsoon-garden', 'en', normalizeStoryScene(sceneJson()), createdAt);
  assert.equal(session.user_id, 42);
  assert.equal(session.seed_id, 'monsoon-garden');
  assert.equal(session.turn, 0);
  assert.deepEqual(session.history, []);
  assert.equal(session.created_at, createdAt.toISOString());
  assert.match(session.session_key, /^[0-9a-f-]{36}$/i);
});

test('knowledge graph derives statuses from learner mastery and quiz evidence', () => {
  const store = createStore({
    users: [{ id: 1, role: 'student' }, { id: 2, role: 'teacher' }],
    subjects: [{ id: 10, name: 'Math' }],
    lessons: [
      { id: 101, subject_id: 10, order_index: 1, title: 'Addition' },
      { id: 102, subject_id: 10, order_index: 2, title: 'Subtraction' },
      { id: 103, subject_id: 10, order_index: 3, title: 'Multiplication' },
      { id: 104, subject_id: 10, order_index: 4, title: 'Division' },
    ],
    user_progress: [
      { user_id: 1, lesson_id: 101, attempts: 2, mastery: 80 },
      { user_id: 1, lesson_id: 102, attempts: 1, mastery: 60 },
    ],
    quiz_attempts: [{ user_id: 1, lesson_id: 103, score: 2, total: 10 }],
  });

  const graph = getKnowledgeGraph(1, store);
  assert.deepEqual(graph[0].nodes.map((node) => node.status), [
    'mastered', 'practicing', 'struggling', 'not_started',
  ]);
  assert.equal(getKnowledgeGraph(2, store), null);
  assert.equal(getKnowledgeGraph(99, store), null);
});
