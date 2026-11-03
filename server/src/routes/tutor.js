import { Router } from 'express';
import db from '../db.js';
import { auth } from '../middleware/auth.js';
import { getTutorResponse } from '../services/tutor.js';
import { getRecommendedDifficulty } from '../services/adaptive.js';

const router = Router();

router.get('/history', auth, (req, res) => {
  const messages = db
    .filter('chat_messages', (m) => m.user_id === req.user.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-50)
    .map(({ role, content, created_at }) => ({ role, content, created_at }));
  res.json(messages);
});

router.delete('/history', auth, async (req, res) => {
  try {
    await db.deleteWhere('chat_messages', (m) => m.user_id === req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error clearing chat history:', err);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

router.post('/chat', auth, async (req, res) => {
  const { message, lang: bodyLang } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }

  try {
    const user = db.find('users', (u) => u.id === req.user.id);
    const lang = bodyLang || user?.preferred_language || 'en';
    const recent = db
      .filter('quiz_attempts', (a) => a.user_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((a) => ({ score: a.score, total: a.total }));

    await db.insert('chat_messages', {
      user_id: req.user.id,
      role: 'user',
      content: message.trim(),
      created_at: new Date().toISOString(),
    });

    const reply = await getTutorResponse(message.trim(), {
      xp: user?.xp ?? 0,
      level: user?.level ?? 1,
      streak: user?.streak ?? 0,
      district: user?.district || '',
      village: user?.village || '',
      recommendedDifficulty: getRecommendedDifficulty(recent),
    }, lang);

    await db.insert('chat_messages', {
      user_id: req.user.id,
      role: 'assistant',
      content: reply,
      created_at: new Date().toISOString(),
    });

    res.json({ reply });
  } catch (err) {
    console.error('Error in /api/tutor/chat:', err);
    res.status(500).json({ error: 'Failed to process chat message' });
  }

});

export default router;
