import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';
import ncertRoutes from './ncert.js';
import { JWT_SECRET } from '../middleware/auth.js';

let server;
let baseUrl;

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/learning/ncert', ncertRoutes);
  server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/learning/ncert`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

function authHeader(userId = 987654321) {
  const token = jwt.sign({ id: userId, role: 'student', preferred_language: 'en' }, JWT_SECRET);
  return { Authorization: `Bearer ${token}` };
}

test('NCERT catalog and chapter endpoints require authentication', async () => {
  const catalog = await fetch(`${baseUrl}/catalog`);
  assert.equal(catalog.status, 401);

  const chapter = await fetch(`${baseUrl}/1/mathematics/counting-to-10`);
  assert.equal(chapter.status, 401);
});

test('chapter endpoint returns mixed practice without exposing answer keys', async () => {
  const response = await fetch(`${baseUrl}/1/mathematics/counting-to-10`, {
    headers: authHeader(),
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.chapter.title, 'Counting to 10');
  assert.equal(data.questions.length, 3);
  assert.equal('answers' in data, false);
  assert.ok(data.questions.every((question) => (
    !('correctIndex' in question) && !('correctValue' in question) && !('answer' in question)
  )));
});

test('invalid submissions are rejected without creating progress', async () => {
  const response = await fetch(`${baseUrl}/1/mathematics/counting-to-10/submit`, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: [] }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Answer every question/);
});
