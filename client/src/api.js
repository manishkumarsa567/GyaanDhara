const API = '/api';

function headers() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers(), ...options.headers } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  currentUser: () => request('/auth/me'),
  dashboard: (lang = 'en') => request(`/learning/dashboard?lang=${lang}`),
  subjects: (lang = 'en') => request(`/learning/subjects?lang=${lang}`),
  lessons: (subjectId, lang = 'en') => request(`/learning/subjects/${subjectId}/lessons?lang=${lang}`),
  ncertCatalog: (lang = 'en') => request(`/learning/ncert/catalog?lang=${encodeURIComponent(lang)}`),
  ncertChapter: (grade, subjectId, chapterId) =>
    request(`/learning/ncert/${grade}/${encodeURIComponent(subjectId)}/${encodeURIComponent(chapterId)}`),
  submitNcertQuiz: (grade, subjectId, chapterId, answers) =>
    request(`/learning/ncert/${grade}/${encodeURIComponent(subjectId)}/${encodeURIComponent(chapterId)}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
  lesson: (id, lang = 'en') => request(`/learning/lessons/${id}?lang=${lang}`),
  saveLessonProgress: (id) => request(`/learning/lessons/${id}/progress`, { method: 'POST' }),
  quizProgression: (lessonId) => request(`/learning/lessons/${lessonId}/quiz/progression`),
  quiz: (lessonId, lang = 'en', type, difficulty) => {
    const params = new URLSearchParams({ lang });
    if (type) params.set('type', type);
    if (difficulty) params.set('difficulty', difficulty);
    return request(`/learning/lessons/${lessonId}/quiz?${params.toString()}`);
  },
  submitQuiz: (lessonId, body) =>
    request(`/learning/lessons/${lessonId}/quiz/submit`, { method: 'POST', body: JSON.stringify(body) }),
  mistakeAnalysis: (lang = 'en') => request(`/learning/mistake-analysis?lang=${encodeURIComponent(lang)}`),
  knowledgeGraph: (lang = 'en') => request(`/learning/knowledge-graph?lang=${encodeURIComponent(lang)}`),
  stories: (lang = 'en') => request(`/learning/stories?lang=${encodeURIComponent(lang)}`),
  startStory: (storyId, lang = 'en') => request('/learning/stories/start', { method: 'POST', body: JSON.stringify({ storyId, lang }) }),
  chooseStory: (sessionId, choiceId) => request(`/learning/stories/${encodeURIComponent(sessionId)}/choose`, { method: 'POST', body: JSON.stringify({ choiceId }) }),
  gamification: (lang = 'en') => request(`/learning/gamification?lang=${encodeURIComponent(lang)}`),
  openMysteryBox: (boxId, lang = 'en') => request(`/learning/gamification/boxes/${boxId}/open?lang=${encodeURIComponent(lang)}`, { method: 'POST' }),
  leaderboard: (scope = 'global') => request(`/learning/leaderboard?scope=${encodeURIComponent(scope)}`),
  updateLocation: (body) => request('/auth/me/location', { method: 'PATCH', body: JSON.stringify(body) }),
  communityStudyLessons: () => request('/community/study-lessons'),
  mentorStatus: () => request('/community/mentor/status'),
  mentorRequests: () => request('/community/mentor/requests'),
  myMentorRequests: () => request('/community/mentor/mine'),
  createMentorRequest: (body) => request('/community/mentor/requests', { method: 'POST', body: JSON.stringify(body) }),
  answerMentorRequest: (id, answer) => request(`/community/mentor/requests/${id}/answer`, { method: 'POST', body: JSON.stringify({ answer }) }),
  communityCollective: () => request('/community/collective'),
  createAlliance: () => request('/community/collective/alliances', { method: 'POST' }),
  joinAlliance: (joinCode) => request('/community/collective/alliances/join', { method: 'POST', body: JSON.stringify({ joinCode }) }),
  tutorHistory: () => request('/tutor/history'),
  tutorClear: () => request('/tutor/history', { method: 'DELETE' }),
  tutorChat: (message, lang = 'en') =>
    request('/tutor/chat', { method: 'POST', body: JSON.stringify({ message, lang }) }),
  teacherStats: (lang = 'en') => request(`/teacher/stats?lang=${lang}`),
  teacherStudents: () => request('/teacher/students'),
  teacherWeeklyReport: (studentId, lang) =>
    request(`/teacher/students/${studentId}/weekly-report`, { method: 'POST', body: JSON.stringify({ lang }) }),
  teacherStudentPortfolio: (studentId, lang = 'en') => request(`/teacher/students/${studentId}/portfolio?lang=${lang}`),
  teacherKnowledgeGraph: (studentId, lang = 'en') => request(`/teacher/students/${studentId}/knowledge-graph?lang=${encodeURIComponent(lang)}`),
  teacherSubjects: (lang = 'en') => request(`/learning/subjects?lang=${lang}`),
  teacherStudioQuizzes: () => request('/teacher/studio/quizzes'),
  createTeacherQuiz: (body) => request('/teacher/studio/quizzes', { method: 'POST', body: JSON.stringify(body) }),
  teacherSeasonalContent: () => request('/teacher/studio/seasonal-content'),
  publishSeasonalContent: (body) => request('/teacher/studio/seasonal-content', { method: 'POST', body: JSON.stringify(body) }),
  teacherMasteryGroups: (lang = 'en') => request(`/teacher/studio/groups?lang=${lang}`),
  studentPortfolio: (lang = 'en') => request(`/learning/portfolio?lang=${lang}`),
  studentActivities: () => request('/learning/activities'),
  studentActivity: (id) => request(`/learning/activities/${id}`),
  submitStudentActivity: (id, answers) => request(`/learning/activities/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
  seasonalContent: (lang = 'en') => request(`/learning/seasonal-content?lang=${lang}`),
  gamesCatalog: (lang = 'en') => request(`/games/catalog?lang=${lang}`),
  gamePlay: (slug, lang = 'en') => request(`/games/${slug}?lang=${lang}`),
  gameComplete: (slug, body) => request(`/games/${slug}/complete`, { method: 'POST', body: JSON.stringify(body) }),
  gamesStats: () => request('/games/stats/overview'),
  getLocale: (lang, refresh = false) => request(`/i18n/${lang}${refresh ? '?refresh=1' : ''}`),
};
