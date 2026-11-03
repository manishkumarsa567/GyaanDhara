import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'node:http';
import jwt from 'jsonwebtoken';
import { io as createClient } from 'socket.io-client';
import { attachStudyRoomSockets } from './community-sockets.js';
import { JWT_SECRET } from './middleware/auth.js';
import db from './db.js';

let server;
let socketServer;
let url;

before(async () => {
  server = createServer();
  socketServer = attachStudyRoomSockets(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (socketServer) await new Promise((resolve) => socketServer.close(resolve));
});

test('study room sockets reject missing or non-student sessions', async () => {
  for (const auth of [{}, { token: jwt.sign({ id: 77, role: 'teacher' }, JWT_SECRET) }]) {
    const socket = createClient(url, { auth, autoConnect: false, reconnection: false });
    const error = new Promise((resolve) => socket.once('connect_error', resolve));
    socket.connect();
    const result = await error;
    assert.match(result.message, /Authentication required|Student account required/);
    socket.disconnect();
  }
});

test('study room join checks that the signed-in student account exists', async () => {
  const token = jwt.sign({ id: Number.MAX_SAFE_INTEGER, role: 'student' }, JWT_SECRET);
  const socket = createClient(url, { auth: { token }, autoConnect: false, reconnection: false });
  const joined = new Promise((resolve, reject) => {
    socket.once('connect_error', reject);
    socket.once('connect', () => {
      socket.emit('room:join', { lessonId: 1 }, resolve);
    });
  });
  socket.connect();
  const result = await joined;
  assert.equal(result.error, 'Choose a valid study-room lesson.');
  socket.disconnect();
});

test('active rooms use anonymous avatars and never send flash answer keys to players', async () => {
  const originalFind = db.find;
  const studentId = 987654321;
  db.find = (table, predicate) => {
    if (table === 'users') return predicate({ id: studentId, role: 'student', preferred_language: 'en' })
      ? { id: studentId, role: 'student', preferred_language: 'en' }
      : undefined;
    if (table === 'lessons') return predicate({ id: 1 }) ? { id: 1 } : undefined;
    return originalFind.call(db, table, predicate);
  };
  const token = jwt.sign({ id: studentId, role: 'student' }, JWT_SECRET);
  const socket = createClient(url, { auth: { token }, autoConnect: false, reconnection: false });
  try {
    socket.connect();
    await new Promise((resolve, reject) => {
      socket.once('connect_error', reject);
      socket.once('connect', resolve);
    });
    const joined = await new Promise((resolve) => socket.emit('room:join', { lessonId: 1 }, resolve));
    assert.equal(joined.count, 1);
    assert.equal(joined.members[0].id === String(studentId), false);
    assert.ok(joined.members[0].avatar);

    const questionReady = new Promise((resolve) => socket.once('flash:question', resolve));
    await new Promise((resolve, reject) => {
      socket.emit('flash:start', (result) => result.error ? reject(new Error(result.error)) : resolve());
    });
    const question = await questionReady;
    assert.equal(typeof question.question, 'string');
    assert.equal(Array.isArray(question.options), true);
    assert.equal('correctIndex' in question, false);
    assert.equal('correct_index' in question, false);
    const answer = await new Promise((resolve) => socket.emit('flash:answer', { optionIndex: 0 }, resolve));
    assert.equal(answer.received, true);
  } finally {
    socket.disconnect();
    db.find = originalFind;
  }
});
