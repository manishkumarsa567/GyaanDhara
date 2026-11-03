import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';
import learningRoutes from './learning.js';
import teacherRoutes from './teacher.js';
import communityRoutes from './community.js';
import authRoutes from './auth.js';
import { JWT_SECRET } from '../middleware/auth.js';

let server;
let baseUrl;

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/learning', learningRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/auth', authRoutes);
  server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

function authHeader(role) {
  const token = jwt.sign({ id: 987654321, role, preferred_language: 'en' }, JWT_SECRET);
  return { Authorization: `Bearer ${token}` };
}

test('portfolio endpoints require an authenticated learner or teacher role', async () => {
  const unauthenticated = await fetch(`${baseUrl}/learning/portfolio`);
  assert.equal(unauthenticated.status, 401);

  const teacherOnLearnerPortfolio = await fetch(`${baseUrl}/learning/portfolio`, {
    headers: authHeader('teacher'),
  });
  assert.equal(teacherOnLearnerPortfolio.status, 403);

  const studentOnTeacherPortfolio = await fetch(`${baseUrl}/teacher/students/1/portfolio`, {
    headers: authHeader('student'),
  });
  assert.equal(studentOnTeacherPortfolio.status, 403);
});

test('weekly parent reports are restricted to teachers', async () => {
  const response = await fetch(`${baseUrl}/teacher/students/1/weekly-report`, {
    method: 'POST',
    headers: { ...authHeader('student'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang: 'en' }),
  });

  assert.equal(response.status, 403);
});

test('personalization endpoints enforce learner and teacher roles', async () => {
  const studentOnlyPaths = [
    '/learning/mistake-analysis',
    '/learning/knowledge-graph',
    '/learning/stories',
    '/learning/gamification',
  ];
  for (const path of studentOnlyPaths) {
    const response = await fetch(`${baseUrl}${path}`, { headers: authHeader('teacher') });
    assert.equal(response.status, 403, `${path} should reject teacher accounts`);
  }

  const teacherGraph = await fetch(`${baseUrl}/teacher/students/1/knowledge-graph`, {
    headers: authHeader('student'),
  });
  assert.equal(teacherGraph.status, 403);

  const invalidTeacherGraph = await fetch(`${baseUrl}/teacher/students/not-an-id/knowledge-graph`, {
    headers: authHeader('teacher'),
  });
  assert.equal(invalidTeacherGraph.status, 400);

  const invalidBoxId = await fetch(`${baseUrl}/learning/gamification/boxes/nope/open`, {
    method: 'POST',
    headers: { ...authHeader('student'), 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(invalidBoxId.status, 400);
});

test('story catalog exposes eight grade-specific stories for each requested subject', async () => {
  const response = await fetch(`${baseUrl}/learning/stories?lang=en`, {
    headers: authHeader('student'),
  });
  assert.equal(response.status, 200);
  const stories = await response.json();
  assert.equal(stories.length, 40);

  for (const subject of ['English', 'Hindi', 'Science', 'Social Studies', 'Mathematics']) {
    const subjectStories = stories.filter((story) => story.subject === subject);
    assert.equal(subjectStories.length, 8, `${subject} should have one story for every class`);
    assert.deepEqual(subjectStories.map((story) => story.grade), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.ok(subjectStories.every((story) => story.visual && story.learningTopic));
  }
});

test('story catalog rejects unsupported language selections instead of silently showing English', async () => {
  const response = await fetch(`${baseUrl}/learning/stories?lang=xx`, {
    headers: authHeader('student'),
  });
  assert.equal(response.status, 400);
});

test('story sessions validate story selections and remain scoped to the signed-in learner', async () => {
  const invalidStory = await fetch(`${baseUrl}/learning/stories/start`, {
    method: 'POST',
    headers: { ...authHeader('student'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyId: 'not-a-story', lang: 'en' }),
  });
  assert.equal(invalidStory.status, 400);

  const unknownSession = await fetch(`${baseUrl}/learning/stories/not-a-session/choose`, {
    method: 'POST',
    headers: { ...authHeader('student'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ choiceId: 'choose-this' }),
  });
  assert.equal(unknownSession.status, 404);
});

test('teacher-created activities are restricted to student accounts', async () => {
  const paths = [
    '/learning/activities',
    '/learning/activities/1',
    '/learning/activities/1/submit',
  ];
  for (const path of paths) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: path.endsWith('/submit') ? 'POST' : 'GET',
      headers: {
        ...authHeader('teacher'),
        ...(path.endsWith('/submit') ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(path.endsWith('/submit') ? { body: JSON.stringify({ answers: [] }) } : {}),
    });
    assert.equal(response.status, 403, `${path} should reject teacher accounts`);
  }
});

test('community mentoring endpoints require student role', async () => {
  const response = await fetch(`${baseUrl}/community/mentor/status`, {
    headers: authHeader('teacher'),
  });
  assert.equal(response.status, 403);
});

test('village collective endpoints are student-only', async () => {
  for (const [path, method] of [
    ['/community/collective', 'GET'],
    ['/community/collective/alliances', 'POST'],
    ['/community/collective/alliances/join', 'POST'],
  ]) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...authHeader('teacher'),
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(method === 'POST' ? { body: JSON.stringify({ joinCode: '0000000000' }) } : {}),
    });
    assert.equal(response.status, 403, `${path} should reject teacher accounts`);
  }
});

test('locality profile updates are student-only and validate field lengths', async () => {
  const teacherUpdate = await fetch(`${baseUrl}/auth/me/location`, {
    method: 'PATCH',
    headers: { ...authHeader('teacher'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ village: 'Riverbank', district: 'North' }),
  });
  assert.equal(teacherUpdate.status, 403);

  const invalidLocation = await fetch(`${baseUrl}/auth/me/location`, {
    method: 'PATCH',
    headers: { ...authHeader('student'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ village: 'v'.repeat(81), district: 'North' }),
  });
  assert.equal(invalidLocation.status, 400);
});

test('shared mentoring requests reject contact information before persistence', async () => {
  const response = await fetch(`${baseUrl}/community/mentor/requests`, {
    method: 'POST',
    headers: { ...authHeader('student'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'Please call me at 9876543210' }),
  });
  assert.equal(response.status, 400);
});

test('teacher portfolio rejects malformed student identifiers', async () => {
  const response = await fetch(`${baseUrl}/teacher/students/not-an-id/portfolio`, {
    headers: authHeader('teacher'),
  });

  assert.equal(response.status, 400);
});
