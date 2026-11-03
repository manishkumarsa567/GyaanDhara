import { Router } from 'express';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { levelFromXp } from '../services/adaptive.js';
import {
  containsPersonalInformation,
  getMentorRewardStatus,
  reviewMentorAnswer,
  reviewMentorQuestion,
} from '../services/community.js';
import {
  createAllianceCode,
  findMemberVillageConflict,
  getAllianceSnapshot,
  getVillageTree,
  MAX_ALLIANCE_SIZE,
} from '../services/village-collective.js';
import { getLessonQuestionSet } from '../questionBank.js';

const router = Router();
const reviewingRequests = new Set();
const reviewingMentors = new Set();
const creatingQuestions = new Set();
const joiningAlliances = new Set();
const MAX_DAILY_QUESTIONS = 5;

router.get('/collective', auth, requireRole('student'), (req, res) => {
  const user = db.find('users', (item) => item.id === req.user.id && item.role === 'student');
  if (!user) return res.status(404).json({ error: 'Student account not found.' });
  res.json({
    villageTree: getVillageTree(user, db.get('users'), db.get('user_progress')),
    alliance: getAllianceSnapshot(user.id, db),
  });
});

router.post('/collective/alliances', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const user = db.find('users', (item) => item.id === req.user.id && item.role === 'student');
  if (!user) return res.status(404).json({ error: 'Student account not found.' });
  if (!user.village?.trim() || !user.district?.trim()) {
    return res.status(400).json({ error: 'Add your village and district to your profile before forming an alliance.' });
  }
  if (db.find('community_quest_members', (entry) => entry.user_id === user.id)) {
    return res.status(409).json({ error: 'You are already part of an alliance quest.' });
  }
  const joinCode = createAllianceCode(db);
  const quest = await db.insert('community_quests', {
    name: 'Math and Science Alliance Quest',
    creator_id: user.id,
    join_code: joinCode,
    created_at: new Date().toISOString(),
  });
  await db.insert('community_quest_members', {
    quest_id: quest.id,
    user_id: user.id,
    joined_at: new Date().toISOString(),
  });
  res.status(201).json(getAllianceSnapshot(user.id, db));
}));

router.post('/collective/alliances/join', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const user = db.find('users', (item) => item.id === req.user.id && item.role === 'student');
  if (!user) return res.status(404).json({ error: 'Student account not found.' });
  if (!user.village?.trim() || !user.district?.trim()) {
    return res.status(400).json({ error: 'Add your village and district to your profile before joining an alliance.' });
  }
  const joinCode = typeof req.body?.joinCode === 'string' ? req.body.joinCode.trim().toUpperCase() : '';
  if (!/^[A-F0-9]{10}$/.test(joinCode)) return res.status(400).json({ error: 'Enter a valid 10-character alliance code.' });
  if (db.find('community_quest_members', (entry) => entry.user_id === user.id)) {
    return res.status(409).json({ error: 'You are already part of an alliance quest.' });
  }
  if (joiningAlliances.has(user.id)) return res.status(429).json({ error: 'Please wait for your current alliance request.' });
  joiningAlliances.add(user.id);
  try {
    const quest = db.find('community_quests', (entry) => entry.join_code === joinCode);
    if (!quest) return res.status(404).json({ error: 'No alliance quest matches that code.' });
    const members = db.filter('community_quest_members', (entry) => entry.quest_id === quest.id);
    if (members.length >= MAX_ALLIANCE_SIZE) return res.status(409).json({ error: 'This alliance team is full.' });
    if (findMemberVillageConflict(user, members, db)) {
      return res.status(409).json({ error: 'This quest is for cross-village teams. Invite a student from a different village.' });
    }
    await db.insert('community_quest_members', {
      quest_id: quest.id,
      user_id: user.id,
      joined_at: new Date().toISOString(),
    });
    res.status(200).json(getAllianceSnapshot(user.id, db));
  } finally {
    joiningAlliances.delete(user.id);
  }
}));

router.get('/study-lessons', auth, requireRole('student'), (req, res) => {
  const lessons = db.get('lessons')
    .filter((lesson) => getLessonQuestionSet(lesson.id, 'mcq', 'easy')?.length)
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      subject: db.find('subjects', (item) => item.id === lesson.subject_id)?.name || '',
    }));
  res.json(lessons);
});

router.get('/mentor/status', auth, requireRole('student'), (req, res) => {
  const user = db.find('users', (item) => item.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User account not found.' });
  res.json(getMentorRewardStatus(user, db.get('mentor_answers')));
});

router.get('/mentor/requests', auth, requireRole('student'), (req, res) => {
  const requests = db.get('mentor_requests')
    .filter((request) => request.student_id !== req.user.id
      && !db.find('mentor_answers', (answer) => answer.request_id === request.id))
    .sort((left, right) => new Date(left.created_at) - new Date(right.created_at))
    .slice(0, 50)
    .map(({ id, question, subject_id, created_at }) => ({
      id,
      question,
      subject: db.find('subjects', (item) => item.id === subject_id)?.name || '',
      createdAt: created_at,
    }));
  res.json(requests);
});

router.get('/mentor/mine', auth, requireRole('student'), (req, res) => {
  const ownRequests = db.get('mentor_requests')
    .filter((request) => request.student_id === req.user.id)
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, 20)
    .map((request) => {
      const answer = db.find('mentor_answers', (item) => item.request_id === request.id);
      return {
        id: request.id,
        question: request.question,
        subject: db.find('subjects', (item) => item.id === request.subject_id)?.name || '',
        createdAt: request.created_at,
        answer: answer?.answer || null,
        answerCreatedAt: answer?.created_at || null,
      };
    });
  res.json(ownRequests);
});

router.post('/mentor/requests', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  const subjectId = req.body?.subjectId === '' || req.body?.subjectId == null
    ? null
    : Number(req.body.subjectId);
  if (question.length < 10 || question.length > 500) {
    return res.status(400).json({ error: 'Write a question between 10 and 500 characters.' });
  }
  if (containsPersonalInformation(question)) {
    return res.status(400).json({ error: 'Remove contact details or links before sharing your question.' });
  }
  if (subjectId !== null && (!Number.isSafeInteger(subjectId) || !db.find('subjects', (item) => item.id === subjectId))) {
    return res.status(400).json({ error: 'Choose a valid subject.' });
  }
  const today = new Date().toISOString().slice(0, 10);
  const submittedToday = db.filter('mentor_requests', (item) => item.student_id === req.user.id
    && item.created_at.slice(0, 10) === today).length;
  if (submittedToday >= MAX_DAILY_QUESTIONS) {
    return res.status(429).json({ error: 'You have reached today’s question limit. Try again tomorrow.' });
  }
  if (creatingQuestions.has(req.user.id)) {
    return res.status(429).json({ error: 'Please wait for your current question to finish review.' });
  }
  creatingQuestions.add(req.user.id);
  try {
    const reviewed = await reviewMentorQuestion(question);
    if (!reviewed.available) {
      return res.status(503).json({ error: 'The AI privacy review is temporarily unavailable. Your question was not shared.' });
    }
    if (!reviewed.approved) {
      return res.status(422).json({ error: reviewed.feedback || 'Please remove personal details and keep the question focused on learning.' });
    }
    const request = await db.insert('mentor_requests', {
      student_id: req.user.id,
      subject_id: subjectId,
      question,
      created_at: new Date().toISOString(),
    });
    res.status(201).json({ id: request.id, question: request.question, createdAt: request.created_at });
  } finally {
    creatingQuestions.delete(req.user.id);
  }
}));

router.post('/mentor/requests/:id/answer', auth, requireRole('student'), asyncHandler(async (req, res) => {
  const requestId = Number(req.params.id);
  const answer = typeof req.body?.answer === 'string' ? req.body.answer.trim() : '';
  if (!Number.isSafeInteger(requestId) || requestId < 1) {
    return res.status(400).json({ error: 'Choose a valid question.' });
  }
  if (answer.length < 20 || answer.length > 800) {
    return res.status(400).json({ error: 'Write a helpful response between 20 and 800 characters.' });
  }
  if (containsPersonalInformation(answer)) {
    return res.status(400).json({ error: 'Remove contact details or links before sharing your response.' });
  }
  const user = db.find('users', (item) => item.id === req.user.id && item.role === 'student');
  if (!user || (user.level || 1) < 10) {
    return res.status(403).json({ error: 'Reach Level 10 to unlock peer mentoring.' });
  }
  const request = db.find('mentor_requests', (item) => item.id === requestId);
  if (!request || request.student_id === user.id) {
    return res.status(404).json({ error: 'This question is unavailable for mentoring.' });
  }
  if (reviewingRequests.has(requestId) || db.find('mentor_answers', (item) => item.request_id === requestId)) {
    return res.status(409).json({ error: 'Another mentor has already answered this question.' });
  }
  const status = getMentorRewardStatus(user, db.get('mentor_answers'));
  if (status.answersToday >= status.dailyAnswerLimit || status.xpToday + status.xpPerAnswer > status.dailyXpLimit) {
    return res.status(429).json({ error: 'You have reached today’s mentor reward limit.' });
  }

  if (reviewingMentors.has(user.id)) {
    return res.status(429).json({ error: 'Please wait for your current mentor response to finish review.' });
  }
  reviewingRequests.add(requestId);
  reviewingMentors.add(user.id);
  try {
    const reviewed = await reviewMentorAnswer(request.question, answer);
    if (!reviewed.available) {
      return res.status(503).json({ error: 'The AI review is temporarily unavailable. Your response was not shared or rewarded.' });
    }
    if (!reviewed.approved) {
      return res.status(422).json({ error: reviewed.feedback || 'Please revise your response to make it safe and helpful.' });
    }
    if (db.find('mentor_answers', (item) => item.request_id === requestId)) {
      return res.status(409).json({ error: 'Another mentor has already answered this question.' });
    }
    const createdAt = new Date().toISOString();
    const mentorAnswer = await db.insert('mentor_answers', {
      request_id: requestId,
      mentor_id: user.id,
      answer,
      xp_awarded: status.xpPerAnswer,
      created_at: createdAt,
    });
    const newXp = (user.xp || 0) + status.xpPerAnswer;
    await db.update('users', (item) => item.id === user.id, { xp: newXp, level: levelFromXp(newXp) });
    res.status(201).json({
      answer: mentorAnswer.answer,
      feedback: reviewed.feedback,
      xpAwarded: mentorAnswer.xp_awarded,
      mentorXp: newXp,
      mentorLevel: levelFromXp(newXp),
    });
  } finally {
    reviewingRequests.delete(requestId);
    reviewingMentors.delete(user.id);
  }
}));

export default router;
