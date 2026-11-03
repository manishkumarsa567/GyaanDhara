import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAllianceCode,
  findMemberVillageConflict,
  getAllianceSnapshot,
  getVillageTree,
  MAX_ALLIANCE_SIZE,
} from './village-collective.js';

function createStore(tables = {}) {
  const data = Object.fromEntries(Object.entries(tables).map(([key, rows]) => [key, rows.map((row) => ({ ...row }))]));
  return {
    get: (name) => data[name] || [],
    find: (name, predicate) => (data[name] || []).find(predicate),
    filter: (name, predicate) => (data[name] || []).filter(predicate),
  };
}

test('village tree uses anonymized village totals and hides small-cohort activity', () => {
  const learners = [
    { id: 1, role: 'student', village: 'Riverbend', district: 'North' },
    { id: 2, role: 'student', village: 'RIVERBEND', district: 'north' },
    { id: 3, role: 'student', village: 'Riverbend', district: 'North' },
    { id: 4, role: 'student', village: 'Hillview', district: 'North' },
  ];
  const progress = Array.from({ length: 5 }, (_, index) => ({
    user_id: index < 3 ? index + 1 : 4,
    lesson_id: index + 1,
    completed: 1,
  }));
  const tree = getVillageTree(learners[0], learners, progress);
  assert.equal(tree.privacyThresholdMet, true);
  assert.equal(tree.contributors, 3);
  assert.equal(tree.completedLessons, 3);
  assert.equal(tree.milestones[0].unlocked, false);

  const smallVillage = getVillageTree(learners[1], learners, progress.slice(0, 2));
  assert.equal(smallVillage.privacyThresholdMet, false);
  assert.equal(smallVillage.contributors, null);
  assert.equal(smallVillage.completedLessons, null);
  assert.equal(smallVillage.milestones.every((milestone) => !milestone.unlocked), true);

  const noLocation = getVillageTree({ id: 1, role: 'student' }, learners, progress);
  assert.equal(noLocation.requiresLocation, true);
});

test('alliance codes are unique, normalized, and limited to five generation attempts', () => {
  const store = createStore({
    community_quests: [{ join_code: 'AABBCCDDEE' }],
  });
  const codes = ['AABBCCDDEE', '1122334455'];
  assert.equal(createAllianceCode(store, () => codes.shift()), '1122334455');
  let attempts = 0;
  assert.throws(() => createAllianceCode(store, () => {
    attempts++;
    return 'AABBCCDDEE';
  }), /unique alliance code/);
  assert.equal(attempts, 5);
});

test('alliance teams require distinct villages and expose anonymous cross-subject progress', () => {
  const store = createStore({
    community_quests: [{ id: 8, name: 'Math and Science Alliance Quest', join_code: '1234567890' }],
    community_quest_members: [
      { id: 1, quest_id: 8, user_id: 1, joined_at: '2026-10-01T00:00:00.000Z' },
      { id: 2, quest_id: 8, user_id: 2, joined_at: '2026-10-02T00:00:00.000Z' },
      { id: 3, quest_id: 8, user_id: 3, joined_at: '2026-10-03T00:00:00.000Z' },
    ],
    users: [
      { id: 1, role: 'student', village: 'Riverbend', district: 'North' },
      { id: 2, role: 'student', village: 'Hillview', district: 'North' },
      { id: 3, role: 'student', village: 'Lakeside', district: 'South' },
    ],
    subjects: [{ id: 1, name: 'Mathematics' }, { id: 2, name: 'Science' }],
    lessons: [
      { id: 11, subject_id: 1 },
      { id: 12, subject_id: 2 },
    ],
    user_progress: [
      { user_id: 1, lesson_id: 11, completed: 1 },
      { user_id: 2, lesson_id: 12, completed: 1 },
    ],
  });
  const members = store.get('community_quest_members');
  assert.equal(findMemberVillageConflict(store.get('users')[0], members.slice(0, 1), store), true);
  assert.equal(findMemberVillageConflict(store.get('users')[1], members.slice(0, 1), store), false);
  assert.equal(MAX_ALLIANCE_SIZE, 4);

  const alliance = getAllianceSnapshot(1, store);
  assert.equal(alliance.joinCode, '1234567890');
  assert.deepEqual(alliance.members.map((member) => member.label), ['You', 'Teammate 1', 'Teammate 2']);
  assert.deepEqual(
    getAllianceSnapshot(2, store).members.map((member) => member.label),
    ['Teammate 1', 'You', 'Teammate 2'],
  );
  assert.equal(alliance.members.some((member) => 'joinedVillage' in member || 'userId' in member), false);
  assert.deepEqual(alliance.progress, { math: true, science: true, completed: true });

  const oneLearnerDoingBoth = createStore({
    community_quests: store.get('community_quests'),
    community_quest_members: [members[0]],
    users: store.get('users'),
    subjects: store.get('subjects'),
    lessons: store.get('lessons'),
    user_progress: [
      { user_id: 1, lesson_id: 11, completed: 1 },
      { user_id: 1, lesson_id: 12, completed: 1 },
    ],
  });
  assert.equal(getAllianceSnapshot(1, oneLearnerDoingBoth).progress.completed, false);
});
