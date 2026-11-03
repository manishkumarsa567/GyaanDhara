/** Adaptive difficulty: adjusts based on recent quiz performance */
export function getRecommendedDifficulty(recentAttempts) {
  if (!recentAttempts?.length) return 'easy';
  const last5 = recentAttempts.slice(0, 5);
  const avgAccuracy = last5.reduce((sum, a) => sum + (a.score / Math.max(a.total, 1)), 0) / last5.length;
  if (avgAccuracy >= 0.85) return 'hard';
  if (avgAccuracy >= 0.6) return 'medium';
  return 'easy';
}

export function calculateXp(score, total, difficulty, streak) {
  const base = { beginner: 5, easy: 10, medium: 20, hard: 35, expert: 50 }[difficulty] || 10;
  const accuracy = score / Math.max(total, 1);
  const bonus = Math.round(accuracy * base);
  const streakBonus = Math.min(streak, 7) * 2;
  return bonus + streakBonus;
}

export function levelFromXp(xp) {
  return Math.floor(xp / 100) + 1;
}

export function masteryFromAttempts(attempts) {
  if (!attempts.length) return 0;
  const best = Math.max(...attempts.map((a) => a.score / Math.max(a.total, 1)));
  const count = attempts.length;
  return Math.min(100, Math.round(best * 70 + Math.min(count, 5) * 6));
}

export function getLearningPath(userId, db) {
  const lessons = db.get('lessons').sort((a, b) => a.subject_id - b.subject_id || a.order_index - b.order_index);
  const subjects = db.get('subjects');
  const progress = db.filter('user_progress', (p) => p.user_id === userId);
  const attempts = db.filter('quiz_attempts', (attempt) => attempt.user_id === userId);
  const progressByLesson = new Map(progress.map((entry) => [entry.lesson_id, entry]));
  const attemptedLessonIds = new Set(attempts.map((attempt) => attempt.lesson_id));
  const lastOpened = progress
    .filter((entry) => entry.last_opened_at && !entry.completed)
    .sort((a, b) => new Date(b.last_opened_at) - new Date(a.last_opened_at))[0];

  const recommendations = [];
  const lastAttempt = attempts
    .filter((attempt) => !progressByLesson.get(attempt.lesson_id)?.completed)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  const resumeLessonId = lastOpened?.lesson_id || lastAttempt?.lesson_id;
  if (resumeLessonId) {
    const lesson = lessons.find((candidate) => candidate.id === resumeLessonId);
    if (lesson) {
      const subject = subjects.find((candidate) => candidate.id === lesson.subject_id);
      const mastery = progressByLesson.get(lesson.id)?.mastery || 0;
      recommendations.push({
        lessonId: lesson.id,
        title: lesson.title,
        subject: subject?.name,
        subjectId: lesson.subject_id,
        reasonKey: mastery < 40 ? 'path_reason_foundation' : 'path_reason_continue',
        priority: mastery < 40 ? 'high' : 'medium',
      });
    }
  }

  const hasLearningHistory = progress.length > 0 || attempts.length > 0;
  if (!hasLearningHistory) return recommendations;

  for (const l of lessons) {
    if (recommendations.some((item) => item.lessonId === l.id)) continue;
    const p = progressByLesson.get(l.id);
    const mastery = p?.mastery || 0;
    const completed = p?.completed || 0;
    if (!completed && (p || attemptedLessonIds.has(l.id))) {
      const subject = subjects.find((s) => s.id === l.subject_id);
      recommendations.push({
        lessonId: l.id,
        title: l.title,
        subject: subject?.name,
        subjectId: l.subject_id,
        reasonKey: mastery < 40 ? 'path_reason_foundation' : 'path_reason_continue',
        priority: mastery < 40 ? 'high' : 'medium',
      });
      if (recommendations.length >= 3) break;
    }
  }

  if (recommendations.length < 3) {
    const completedLessons = lessons.filter((lesson) => progressByLesson.get(lesson.id)?.completed);
    const lastCompleted = completedLessons.at(-1);
    for (const lesson of lessons) {
      if (recommendations.length >= 3) break;
      if (recommendations.some((item) => item.lessonId === lesson.id)) continue;
      const lessonProgress = progressByLesson.get(lesson.id);
      if (lessonProgress?.completed) continue;
      if (lastCompleted && lesson.subject_id < lastCompleted.subject_id) continue;
      const subject = subjects.find((entry) => entry.id === lesson.subject_id);
      recommendations.push({
        lessonId: lesson.id,
        title: lesson.title,
        subject: subject?.name,
        subjectId: lesson.subject_id,
        reasonKey: 'path_reason_continue',
        priority: 'medium',
      });
    }
  }
  return recommendations;
}

export function getContinueLearning(userId, db, learningPath) {
  const lessonProgress = db
    .filter('user_progress', (entry) => entry.user_id === userId && !entry.completed && entry.last_opened_at)
    .map((entry) => ({ kind: 'lesson', id: entry.lesson_id, at: entry.last_opened_at }));
  const attempts = db
    .filter('quiz_attempts', (entry) => {
      if (entry.user_id !== userId) return false;
      const progress = db.find('user_progress', (item) => item.user_id === userId && item.lesson_id === entry.lesson_id);
      return !progress?.completed;
    })
    .map((entry) => ({ kind: 'lesson', id: entry.lesson_id, at: entry.created_at }));
  const games = db
    .filter('game_progress', (entry) => entry.user_id === userId && entry.last_opened_at)
    .map((entry) => ({ kind: 'game', slug: entry.game_slug, at: entry.last_opened_at }));
  const lastActivity = [...lessonProgress, ...attempts, ...games]
    .filter((entry) => entry.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))[0];

  if (lastActivity?.kind === 'game') {
    const gamePlay = db
      .filter('game_plays', (entry) => entry.user_id === userId && entry.game_slug === lastActivity.slug)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return {
      kind: 'game',
      href: `/games/${lastActivity.slug}`,
      title: gamePlay?.game_name || lastActivity.slug,
    };
  }

  const lesson = lastActivity?.kind === 'lesson'
    ? db.find('lessons', (entry) => entry.id === lastActivity.id)
    : null;
  const nextLesson = lesson || (learningPath.length
    ? db.find('lessons', (entry) => entry.id === learningPath[0].lessonId)
    : null);

  return nextLesson
    ? { kind: 'lesson', href: `/lesson/${nextLesson.id}`, title: nextLesson.title }
    : null;
}
