import { geminiGenerate, LANG_NAMES, parseJsonFromGemini } from './gemini.js';

const MAX_QUESTIONS = 20;

export function normalizeTeacherQuiz(input) {
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  if (title.length < 3 || title.length > 100) {
    return { error: 'Quiz title must be between 3 and 100 characters.' };
  }
  if (!Array.isArray(input?.questions) || input.questions.length < 1 || input.questions.length > MAX_QUESTIONS) {
    return { error: `A quiz must contain between 1 and ${MAX_QUESTIONS} questions.` };
  }

  const questions = [];
  for (const [index, raw] of input.questions.entries()) {
    const prompt = typeof raw?.prompt === 'string' ? raw.prompt.trim() : '';
    const options = Array.isArray(raw?.options)
      ? raw.options.map((option) => typeof option === 'string' ? option.trim() : '')
      : [];
    const answerIndex = raw?.answerIndex;
    if (prompt.length < 5 || prompt.length > 400) {
      return { error: `Question ${index + 1} must be between 5 and 400 characters.` };
    }
    if (options.length < 2 || options.length > 4 || options.some((option) => !option || option.length > 160)) {
      return { error: `Question ${index + 1} must have 2–4 non-empty options, each no longer than 160 characters.` };
    }
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
      return { error: `Question ${index + 1} must have a valid correct option.` };
    }
    questions.push({
      id: index + 1,
      prompt,
      options,
      answerIndex,
      explanation: typeof raw.explanation === 'string' ? raw.explanation.trim().slice(0, 500) : '',
    });
  }

  const subjectId = input.subjectId === '' || input.subjectId === null || input.subjectId === undefined
    ? null
    : Number(input.subjectId);
  if (subjectId !== null && (!Number.isSafeInteger(subjectId) || subjectId < 1)) {
    return { error: 'Choose a valid subject.' };
  }
  return {
    quiz: {
      title,
      description: typeof input.description === 'string' ? input.description.trim().slice(0, 500) : '',
      subjectId: Number.isSafeInteger(subjectId) && subjectId > 0 ? subjectId : null,
      questions,
    },
  };
}

export function getMasteryGroups(store) {
  const students = store.filter('users', (user) => user.role === 'student');
  const lessons = store.get('lessons');
  const subjects = store.get('subjects');
  const progress = store.get('user_progress');
  const groups = [];

  for (const subject of subjects) {
    const subjectLessons = lessons.filter((lesson) => lesson.subject_id === subject.id);
    if (!subjectLessons.length) continue;
    const masteryRows = students.map((student) => {
      const entries = progress.filter((item) => item.user_id === student.id
        && subjectLessons.some((lesson) => lesson.id === item.lesson_id)
        && (item.attempts > 0 || item.completed === 1));
      const mastery = entries.length
        ? Math.round(entries.reduce((sum, item) => sum + (item.mastery || 0), 0) / entries.length)
        : null;
      return { studentId: student.id, name: student.name, mastery };
    });
    const buckets = [
      { id: 'support', label: 'Needs support', description: 'Start with guided practice and foundational examples.', students: [] },
      { id: 'practice', label: 'Ready to practice', description: 'Build fluency with mixed practice and feedback.', students: [] },
      { id: 'extension', label: 'Ready for extension', description: 'Try challenge problems and explain reasoning.', students: [] },
    ];

    for (const student of masteryRows) {
      const bucket = student.mastery === null || student.mastery < 50
        ? buckets[0]
        : student.mastery >= 75
          ? buckets[2]
          : buckets[1];
      bucket.students.push(student);
    }

    for (const bucket of buckets) {
      if (bucket.students.length) {
        const knownMastery = bucket.students.filter((student) => student.mastery !== null);
        groups.push({
          subjectId: subject.id,
          subject: subject.name,
          groupId: bucket.id,
          group: bucket.label,
          recommendation: bucket.description,
          students: bucket.students,
          averageMastery: knownMastery.length
            ? Math.round(knownMastery.reduce((sum, student) => sum + student.mastery, 0) / knownMastery.length)
            : null,
        });
      }
    }
  }
  return groups;
}

export async function addAIGroupRecommendations(groups, lang, generate = geminiGenerate) {
  const languageName = LANG_NAMES[lang];
  if (!groups.length || !languageName) return groups;
  const groupFacts = groups.map((group, index) => ({
    key: String(index),
    subject: group.subject,
    group: group.group,
    studentCount: group.students.length,
    averageMastery: group.averageMastery,
    includesLearnersWithoutAttempts: group.students.some((student) => student.mastery === null),
  }));
  let raw;
  try {
    raw = await generate(
      `For each group, write exactly one short, practical teaching suggestion in ${languageName}. Use only the supplied group facts. Do not name or identify students. Do not change group membership, infer a specific learning difficulty, or claim progress. Return only a JSON object mapping each supplied key to a single sentence of at most 180 characters.\n${JSON.stringify(groupFacts)}`,
      'You are an experienced, supportive educator. Provide safe, age-appropriate, evidence-bounded classroom suggestions as valid JSON only.'
    );
  } catch (error) {
    console.warn('AI mastery-group suggestions unavailable:', error instanceof Error ? error.message : String(error));
    return groups;
  }
  const suggestions = parseJsonFromGemini(raw);
  if (!suggestions || typeof suggestions !== 'object' || Array.isArray(suggestions)) return groups;

  return groups.map((group, index) => {
    const suggestion = suggestions[String(index)];
    if (typeof suggestion !== 'string' || suggestion.trim().length < 8 || suggestion.trim().length > 180) {
      return group;
    }
    return { ...group, recommendation: suggestion.trim(), recommendationSource: 'ai' };
  });
}

export function getActiveSeasonalContent(entries, now = new Date()) {
  const current = now.getTime();
  return entries
    .filter((entry) => entry.published === true
      && new Date(entry.starts_at).getTime() <= current
      && new Date(entry.ends_at).getTime() >= current)
    .sort((left, right) => new Date(left.starts_at) - new Date(right.starts_at));
}

export function normalizeSeasonalContent(input) {
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  const body = typeof input?.body === 'string' ? input.body.trim() : '';
  const startsAt = Date.parse(input?.startsAt);
  const endsAt = Date.parse(input?.endsAt);
  const subjectId = input?.subjectId === '' || input?.subjectId === null || input?.subjectId === undefined
    ? null
    : Number(input.subjectId);
  if (title.length < 3 || title.length > 120) return { error: 'Title must be between 3 and 120 characters.' };
  if (body.length < 10 || body.length > 5000) return { error: 'Content must be between 10 and 5,000 characters.' };
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || endsAt <= startsAt) {
    return { error: 'Choose valid start and end dates; the end date must be later than the start date.' };
  }
  if (subjectId !== null && (!Number.isSafeInteger(subjectId) || subjectId < 1)) {
    return { error: 'Choose a valid subject.' };
  }
  return {
    content: {
      title,
      body,
      subjectId: Number.isSafeInteger(subjectId) && subjectId > 0 ? subjectId : null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
    },
  };
}
