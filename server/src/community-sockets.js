import { randomUUID } from 'node:crypto';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import db from './db.js';
import { JWT_SECRET } from './middleware/auth.js';
import { getLessonQuestionSet } from './questionBank.js';
import { translateQuizQuestions } from './services/content-i18n.js';
import { LANG_NAMES } from './services/gemini.js';

const AVATARS = ['🌱', '🌻', '🦋', '🐝', '🌈', '⭐', '🪁', '🐦', '🍀', '🌼'];
const FLASH_QUESTION_SECONDS = 15;

function publicScoreboard(room) {
  return [...room.scores.values()]
    .map(({ avatar, score }) => ({ avatar, score }))
    .sort((left, right) => right.score - left.score);
}

function clearFlashTimer(room) {
  if (room.flash?.timer) clearTimeout(room.flash.timer);
  if (room.flash?.nextTimer) clearTimeout(room.flash.nextTimer);
}

function createFlashQuestions(lessonId) {
  const allQuestions = getLessonQuestionSet(lessonId, 'mcq', 'easy');
  if (!allQuestions?.length) return [];
  return [...allQuestions]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(5, allQuestions.length));
}

export function attachStudyRoomSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
  });
  const rooms = new Map();

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const user = jwt.verify(token, JWT_SECRET);
      if (user.role !== 'student') return next(new Error('Student account required'));
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('room:join', (payload, acknowledge = () => {}) => {
      const lessonId = Number(payload?.lessonId);
      const user = db.find('users', (item) => item.id === socket.data.user.id && item.role === 'student');
      const lesson = db.find('lessons', (item) => item.id === lessonId);
      if (!user || !lesson || !getLessonQuestionSet(lessonId, 'mcq', 'easy')) {
        acknowledge({ error: 'Choose a valid study-room lesson.' });
        return;
      }

      const requestedLanguage = typeof payload.language === 'string' && LANG_NAMES[payload.language]
        ? payload.language
        : user.preferred_language || 'en';
      socket.data.language = LANG_NAMES[requestedLanguage] ? requestedLanguage : 'en';
      const previousKey = socket.data.roomKey;
      if (previousKey && previousKey !== `lesson:${lessonId}`) {
        socket.leave(previousKey);
        const previousRoom = rooms.get(previousKey);
        if (previousRoom) {
          previousRoom.members.delete(socket.id);
          previousRoom.scores.delete(socket.id);
          if (!previousRoom.members.size) {
            clearFlashTimer(previousRoom);
            rooms.delete(previousKey);
          } else {
            io.to(previousKey).emit('room:presence', {
              members: [...previousRoom.members.values()],
              count: previousRoom.members.size,
            });
          }
        }
      }

      const key = `lesson:${lessonId}`;
      let room = rooms.get(key);
      if (!room) {
        room = { lessonId, members: new Map(), scores: new Map(), flash: null };
        rooms.set(key, room);
      }
      if (!room.members.has(socket.id) && room.members.size >= 30) {
        acknowledge({ error: 'This study room is full. Try another lesson room.' });
        return;
      }
      const member = room.members.get(socket.id) || {
        id: randomUUID(),
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      };
      room.members.set(socket.id, member);
      if (!room.scores.has(socket.id)) room.scores.set(socket.id, { avatar: member.avatar, score: 0 });
      socket.data.roomKey = key;
      socket.join(key);
      acknowledge({
        lessonId,
        members: [...room.members.values()],
        count: room.members.size,
        flashActive: Boolean(room.flash),
        scoreboard: publicScoreboard(room),
      });
      if (room.flash?.open) {
        const activeQuestion = room.flash.questions[room.flash.index];
        if (activeQuestion) {
          const translated = room.flash.translations?.get(socket.data.language)?.[room.flash.index];
          socket.emit('flash:question', {
            id: activeQuestion.id,
            number: room.flash.index + 1,
            total: room.flash.questions.length,
            question: translated?.question || activeQuestion.question,
            options: translated?.options || activeQuestion.options,
            closesAt: room.flash.questionClosesAt,
          });
        }
      }
      io.to(key).emit('room:presence', {
        members: [...room.members.values()],
        count: room.members.size,
      });
    });

    socket.on('flash:start', async (acknowledge = () => {}) => {
      const key = socket.data.roomKey;
      const room = key && rooms.get(key);
      if (!room) return acknowledge({ error: 'Join a study room first.' });
      if (room.flash) return acknowledge({ error: 'A flash quiz is already in progress.' });
      const questions = createFlashQuestions(room.lessonId);
      if (!questions.length) return acknowledge({ error: 'No flash quiz questions are available.' });
      for (const score of room.scores.values()) score.score = 0;
      room.flash = { questions, index: 0, answered: new Set(), timer: null, nextTimer: null, translations: new Map() };
      io.to(key).emit('flash:scoreboard', { scoreboard: publicScoreboard(room) });
      acknowledge({ started: true });

      const languages = new Set([...room.members.keys()].map((id) => io.sockets.sockets.get(id)?.data.language || 'en'));
      await Promise.all([...languages].filter((language) => language !== 'en').map(async (language) => {
        room.flash.translations.set(language, await translateQuizQuestions(questions, language));
      }));
      if (rooms.get(key) !== room || !room.flash) return;
      const advance = () => {
        const flash = room.flash;
        if (!flash) return;
        if (flash.index >= flash.questions.length) {
          io.to(key).emit('flash:complete', { scoreboard: publicScoreboard(room) });
          room.flash = null;
          return;
        }
        const question = flash.questions[flash.index];
        flash.answered.clear();
        flash.open = true;
        flash.questionClosesAt = Date.now() + FLASH_QUESTION_SECONDS * 1000;
        for (const [memberSocketId] of room.members) {
          const memberSocket = io.sockets.sockets.get(memberSocketId);
          const translated = flash.translations.get(memberSocket?.data.language)?.[flash.index];
          io.to(memberSocketId).emit('flash:question', {
            id: question.id,
            number: flash.index + 1,
            total: flash.questions.length,
            question: translated?.question || question.question,
            options: translated?.options || question.options,
            closesAt: flash.questionClosesAt,
          });
        }
        flash.timer = setTimeout(() => {
          flash.open = false;
          for (const [memberSocketId] of room.members) {
            const memberSocket = io.sockets.sockets.get(memberSocketId);
            const translated = flash.translations.get(memberSocket?.data.language)?.[flash.index];
            io.to(memberSocketId).emit('flash:reveal', {
              id: question.id,
              correctIndex: question.correct_index,
              explanation: translated?.explanation || question.explanation,
              scoreboard: publicScoreboard(room),
            });
          }
          flash.index += 1;
          flash.nextTimer = setTimeout(advance, 3000);
        }, FLASH_QUESTION_SECONDS * 1000);
      };
      advance();
    });

    socket.on('flash:answer', (payload, acknowledge = () => {}) => {
      const room = socket.data.roomKey && rooms.get(socket.data.roomKey);
      const flash = room?.flash;
      const question = flash?.questions[flash.index];
      const member = room?.members.get(socket.id);
      if (!flash || !flash.open || !question || !member) return acknowledge({ error: 'There is no active flash question.' });
      if (flash.answered.has(socket.id)) return acknowledge({ error: 'Your answer was already received.' });
      const optionIndex = payload?.optionIndex;
      if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= question.options.length) {
        return acknowledge({ error: 'Choose a valid answer.' });
      }
      flash.answered.add(socket.id);
      if (optionIndex === question.correct_index) room.scores.get(socket.id).score += 1;
      acknowledge({ received: true });
      io.to(socket.data.roomKey).emit('flash:scoreboard', { scoreboard: publicScoreboard(room) });
    });

    socket.on('disconnect', () => {
      const key = socket.data.roomKey;
      const room = key && rooms.get(key);
      if (!room) return;
      room.members.delete(socket.id);
      room.scores.delete(socket.id);
      if (!room.members.size) {
        clearFlashTimer(room);
        rooms.delete(key);
      } else {
        io.to(key).emit('room:presence', {
          members: [...room.members.values()],
          count: room.members.size,
        });
        io.to(key).emit('flash:scoreboard', { scoreboard: publicScoreboard(room) });
      }
    });
  });

  return io;
}
