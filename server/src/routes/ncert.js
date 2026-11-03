import { Router } from 'express';
import db from '../db.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getNcertCatalog, getNcertChapter, scoreNcertQuiz } from '../services/ncert-curriculum.js';

const router = Router();

router.use(auth);

router.get('/catalog', (req, res) => {
  const lang = req.query.lang || req.user?.preferred_language || 'en';
  const progress = db.filter('ncert_progress', (entry) => entry.user_id === req.user.id);
  res.json(getNcertCatalog(progress, lang));
});

router.get('/:grade/:subjectId/:chapterId', (req, res) => {
  const chapter = getNcertChapter(req.params.grade, req.params.subjectId, req.params.chapterId);
  if (!chapter) return res.status(404).json({ error: 'NCERT chapter not found.' });
  const key = `${chapter.grade}:${chapter.subject.id}:${chapter.chapter.id}`;
  const progress = db.find('ncert_progress', (entry) => entry.user_id === req.user.id && entry.chapter_key === key);
  res.json({
    grade: chapter.grade,
    classTitle: chapter.classTitle,
    subject: chapter.subject,
    chapter: chapter.chapter,
    textbookUrl: chapter.textbookUrl,
    questions: chapter.questions,
    progress: {
      attempts: progress?.attempts || 0,
      completed: Boolean(progress?.completed),
      bestAccuracy: progress?.best_accuracy || 0,
    },
  });
});

router.post('/:grade/:subjectId/:chapterId/submit', asyncHandler(async (req, res) => {
  const chapter = getNcertChapter(req.params.grade, req.params.subjectId, req.params.chapterId);
  if (!chapter) return res.status(404).json({ error: 'NCERT chapter not found.' });
  const result = scoreNcertQuiz(chapter, req.body?.answers);
  if (result.error) return res.status(400).json({ error: result.error });

  const chapterKey = `${chapter.grade}:${chapter.subject.id}:${chapter.chapter.id}`;
  const current = db.find('ncert_progress', (entry) => (
    entry.user_id === req.user.id && entry.chapter_key === chapterKey
  ));
  const progress = {
    user_id: req.user.id,
    chapter_key: chapterKey,
    grade: chapter.grade,
    subject_id: chapter.subject.id,
    chapter_id: chapter.chapter.id,
    attempts: (current?.attempts || 0) + 1,
    completed: Boolean(current?.completed || result.completed),
    best_accuracy: Math.max(current?.best_accuracy || 0, result.accuracy),
    last_accuracy: result.accuracy,
    updated_at: new Date().toISOString(),
  };
  await db.upsert(
    'ncert_progress',
    (entry) => entry.user_id === req.user.id && entry.chapter_key === chapterKey,
    progress,
  );

  res.json({ ...result, progress: { completed: progress.completed, attempts: progress.attempts, bestAccuracy: progress.best_accuracy } });
}));

export default router;
