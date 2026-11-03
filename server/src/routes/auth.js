import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { auth, JWT_SECRET } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { updateDailyStreak } from '../services/gamification.js';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student', preferred_language = 'en', village = '', district = '' } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string') {
    return res.status(400).json({ error: 'Name, email, and password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student or teacher' });
  }
  if ([village, district].some((value) => typeof value !== 'string' || value.trim().length > 80)) {
    return res.status(400).json({ error: 'Village and district must be text no longer than 80 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }
  if (db.find('users', (u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const user = await db.insert('users', {
    name: name.trim(),
    email: normalizedEmail,
    password: bcrypt.hashSync(password, 10),
    role,
    xp: 0,
    level: 1,
    streak: 0,
    streak_freezes: 0,
    last_active: null,
    preferred_language,
    village: role === 'student' ? village.trim() : '',
    district: role === 'student' ? district.trim() : '',
    created_at: new Date().toISOString(),
  });

  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: 0,
      level: 1,
      streak: 0,
      streakFreezes: 0,
      preferred_language: user.preferred_language,
      village: user.village,
      district: user.district,
    },
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.find('users', (u) => u.email.toLowerCase() === normalizedEmail);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const streakUpdate = updateDailyStreak(user, today);
  const updatedUser = await db.update('users', (u) => u.id === user.id, {
    last_active: streakUpdate.last_active,
    streak: streakUpdate.streak,
    streak_freezes: streakUpdate.streakFreezes,
  });

  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      level: user.level,
      streak: updatedUser.streak,
      streakFreezes: updatedUser.streak_freezes || 0,
      preferred_language: user.preferred_language,
      village: user.village || '',
      district: user.district || '',
    },
  });
}));

router.get('/me', auth, (req, res) => {
  const user = db.find('users', (candidate) => candidate.id === req.user.id);
  if (!user) return res.status(401).json({ error: 'User account not found' });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    streakFreezes: user.streak_freezes || 0,
    preferred_language: user.preferred_language,
    village: user.village || '',
    district: user.district || '',
  });
});

router.patch('/me/location', auth, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Student profile updates only.' });
  const { village = '', district = '' } = req.body || {};
  if ([village, district].some((value) => typeof value !== 'string' || value.trim().length > 80)) {
    return res.status(400).json({ error: 'Village and district must be text no longer than 80 characters.' });
  }
  const updated = await db.update('users', (user) => user.id === req.user.id, {
    village: village.trim(),
    district: district.trim(),
  });
  if (!updated) return res.status(404).json({ error: 'User account not found.' });
  res.json({ village: updated.village, district: updated.district });
}));

export default router;
