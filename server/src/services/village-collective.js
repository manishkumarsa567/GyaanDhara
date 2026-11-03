import { randomBytes } from 'node:crypto';

export const MAX_ALLIANCE_SIZE = 4;
export const VILLAGE_TREE_MILESTONES = [
  { id: 'reading-challenge', goal: 5, rewardKey: 'collective_reward_reading' },
  { id: 'teacher-celebration', goal: 15, rewardKey: 'collective_reward_teacher' },
  { id: 'science-day', goal: 30, rewardKey: 'collective_reward_science' },
];

function normalized(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

function sameVillage(left, right) {
  return normalized(left.village) === normalized(right.village)
    && normalized(left.district) === normalized(right.district);
}

export function getVillageTree(currentUser, users, progress) {
  if (!currentUser.village?.trim() || !currentUser.district?.trim()) {
    return { requiresLocation: true, growth: 8, contributors: null, completedLessons: null, milestones: [] };
  }
  const villageUsers = users.filter((user) => user.role === 'student' && sameVillage(user, currentUser));
  const villageUserIds = new Set(villageUsers.map((user) => user.id));
  const completedEntries = progress.filter((entry) => villageUserIds.has(entry.user_id) && entry.completed === 1);
  const contributors = new Set(completedEntries.map((entry) => entry.user_id)).size;
  const privacyThresholdMet = contributors >= 3;
  const completedLessons = completedEntries.length;
  return {
    requiresLocation: false,
    privacyThresholdMet,
    growth: privacyThresholdMet ? Math.min(100, 8 + Math.round((completedLessons / 30) * 92)) : 8,
    contributors: privacyThresholdMet ? contributors : null,
    completedLessons: privacyThresholdMet ? completedLessons : null,
    minimumContributors: 3,
    milestones: VILLAGE_TREE_MILESTONES.map((milestone) => ({
      id: milestone.id,
      goal: milestone.goal,
      unlocked: privacyThresholdMet && completedLessons >= milestone.goal,
      rewardKey: milestone.rewardKey,
    })),
  };
}

export function createAllianceCode(store, generateCode = () => randomBytes(5).toString('hex').toUpperCase()) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    if (/^[A-F0-9]{10}$/.test(code) && !store.find('community_quests', (quest) => quest.join_code === code)) return code;
  }
  throw new Error('Unable to create a unique alliance code. Please try again.');
}

function getSubjectId(subjects, term) {
  return subjects.find((subject) => normalized(subject.name).includes(term))?.id ?? null;
}

export function getAllianceSnapshot(userId, store) {
  const membership = store.find('community_quest_members', (entry) => entry.user_id === userId);
  if (!membership) return null;
  const alliance = store.find('community_quests', (entry) => entry.id === membership.quest_id);
  if (!alliance) return null;
  const members = store.filter('community_quest_members', (entry) => entry.quest_id === alliance.id)
    .sort((left, right) => left.joined_at.localeCompare(right.joined_at));
  const users = store.get('users');
  const subjects = store.get('subjects');
  const mathSubjectId = getSubjectId(subjects, 'math');
  const scienceSubjectId = getSubjectId(subjects, 'science');
  const progress = store.filter('user_progress', (entry) => entry.completed === 1);
  let teammateNumber = 0;
  const enrichedMembers = members.map((member) => {
    const learner = users.find((user) => user.id === member.user_id);
    const completedMath = Boolean(mathSubjectId && progress.some((entry) => (
      entry.user_id === member.user_id
      && store.find('lessons', (lesson) => lesson.id === entry.lesson_id)?.subject_id === mathSubjectId
    )));
    const completedScience = Boolean(scienceSubjectId && progress.some((entry) => (
      entry.user_id === member.user_id
      && store.find('lessons', (lesson) => lesson.id === entry.lesson_id)?.subject_id === scienceSubjectId
    )));
    return {
      userId: member.user_id,
      label: member.user_id === userId ? 'You' : `Teammate ${++teammateNumber}`,
      completedMath,
      completedScience,
      joinedVillage: learner?.village || '',
    };
  });
  const mathContributors = enrichedMembers.filter((member) => member.completedMath);
  const scienceContributors = enrichedMembers.filter((member) => member.completedScience);
  const completed = mathContributors.some((mathMember) => scienceContributors.some((scienceMember) => (
    mathMember.userId !== scienceMember.userId
  )));
  return {
    id: alliance.id,
    name: alliance.name,
    joinCode: alliance.join_code,
    maxMembers: MAX_ALLIANCE_SIZE,
    memberCount: members.length,
    members: enrichedMembers.map(({ userId: _userId, joinedVillage: _joinedVillage, ...member }) => member),
    progress: {
      math: mathContributors.length > 0,
      science: scienceContributors.length > 0,
      completed,
    },
    availableSubjects: {
      math: Boolean(mathSubjectId),
      science: Boolean(scienceSubjectId),
    },
  };
}

export function findMemberVillageConflict(user, members, store) {
  return members.some((member) => {
    const other = store.find('users', (entry) => entry.id === member.user_id);
    return other && sameVillage(other, user);
  });
}
