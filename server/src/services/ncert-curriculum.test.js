import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getNcertCatalog,
  getNcertChapter,
  NCERT_GRADES,
  scoreNcertQuiz,
} from './ncert-curriculum.js';

test('NCERT-aligned catalog covers classes 1 through 8 with subject and chapter paths', () => {
  const catalog = getNcertCatalog();
  assert.deepEqual(NCERT_GRADES, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(catalog.classes.length, 8);
  assert.match(catalog.textbookUrl, /^https:\/\/ncert\.nic\.in\//);
  for (const course of catalog.classes) {
    assert.ok(course.subjects.length >= 4);
    assert.ok(course.subjects.every((item) => item.chapters.length >= 3));
  }
});

test('each chapter provides an original reading and a mixed-format quiz without answer keys', () => {
  const catalog = getNcertCatalog();
  const correctPositions = new Set();
  for (const course of catalog.classes) {
    for (const book of course.subjects) {
      for (const listedChapter of book.chapters) {
        const detail = getNcertChapter(course.grade, book.id, listedChapter.id);
        assert.ok(detail.chapter.reading.length > 30);
        assert.deepEqual(detail.questions.map((question) => question.type), ['mcq', 'true_false', 'fill_blank']);
        assert.ok(detail.questions.every((question) => !('correctIndex' in question) && !('correctValue' in question)));
        assert.ok(detail.questions.every((question) => !('answer' in question)));
        correctPositions.add(detail.answers[0].correctIndex);
        assert.equal(detail.answers.length, 3);
      }
    }
  }
  assert.ok(correctPositions.size > 1, 'MCQ answer positions should not always be the first option');
});

test('quiz scoring validates all formats and records pass status', () => {
  const chapter = getNcertChapter(1, 'mathematics', 'counting-to-10');
  const correctMcqIndex = chapter.answers[0].correctIndex;
  const passed = scoreNcertQuiz(chapter, [
    { questionId: 'check-understanding', answer: correctMcqIndex },
    { questionId: 'true-or-false', answer: false },
    { questionId: 'fill-the-blank', answer: '4' },
  ]);
  assert.equal(passed.score, 3);
  assert.equal(passed.completed, true);

  const partial = scoreNcertQuiz(chapter, [
    { questionId: 'check-understanding', answer: (correctMcqIndex + 1) % 4 },
    { questionId: 'true-or-false', answer: false },
    { questionId: 'fill-the-blank', answer: '4' },
  ]);
  assert.equal(partial.completed, true);
  assert.equal(partial.accuracy, 67);

  assert.match(scoreNcertQuiz(chapter, []).error, /Answer every question/);
  assert.match(scoreNcertQuiz(chapter, [
    { questionId: 'check-understanding', answer: 8 },
    { questionId: 'true-or-false', answer: false },
    { questionId: 'fill-the-blank', answer: '4' },
  ]).error, /valid option/);
});

test('catalog progress is keyed to the exact class, subject, and chapter', () => {
  const catalog = getNcertCatalog([
    { chapter_key: '1:mathematics:counting-to-10', completed: true, best_accuracy: 100 },
  ]);
  const math = catalog.classes[0].subjects.find((book) => book.id === 'mathematics');
  assert.equal(math.chapters[0].completed, true);
  assert.equal(math.chapters[0].bestAccuracy, 100);
  assert.equal(math.chapters[1].completed, false);
});

test('selected regional languages (Telugu, Tamil, Kannada, Malayalam, etc.) appear in place of Hindi with Hindi as optional', () => {
  const southLanguages = ['te', 'ta', 'kn', 'ml'];
  for (const lang of southLanguages) {
    const catalog = getNcertCatalog([], lang);
    for (const course of catalog.classes) {
      const subjectIds = course.subjects.map((s) => s.id);
      // Regional subject must be present
      assert.ok(subjectIds.includes(lang === 'te' ? 'telugu' : lang === 'ta' ? 'tamil' : lang === 'kn' ? 'kannada' : 'malayalam'));
      // Regional subject is in 3rd position (index 2)
      assert.equal(course.subjects[2].id, lang === 'te' ? 'telugu' : lang === 'ta' ? 'tamil' : lang === 'kn' ? 'kannada' : 'malayalam');
      // Hindi is kept as optional
      const hindiOpt = course.subjects.find((s) => s.id === 'hindi');
      assert.ok(hindiOpt);
      assert.match(hindiOpt.name, /Optional/i);
    }
  }
});

test('all 18 languages have working NCERT curricula, chapters, and quizzes across grades 1-8', () => {
  const all18Langs = [
    'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'ur', 'as', 'mai', 'bho', 'sa', 'ne', 'ks',
  ];

  for (const lang of all18Langs) {
    const catalog = getNcertCatalog([], lang);
    assert.equal(catalog.classes.length, 8, `Catalog for ${lang} must have 8 classes`);

    for (const course of catalog.classes) {
      assert.ok(course.subjects.length >= 4, `Class ${course.grade} in ${lang} must have >= 4 subjects`);

      for (const book of course.subjects) {
        assert.ok(book.chapters.length >= 3, `Subject ${book.id} in Class ${course.grade} (${lang}) must have >= 3 chapters`);

        for (const ch of book.chapters) {
          const detail = getNcertChapter(course.grade, book.id, ch.id);
          assert.ok(detail, `Chapter ${ch.id} in ${book.id} class ${course.grade} must load`);
          assert.ok(detail.chapter.reading.length > 30, `Chapter ${ch.id} reading must be > 30 chars`);
          assert.equal(detail.questions.length, 3);

          // Verify quiz scoring works
          const quizResult = scoreNcertQuiz(detail, [
            { questionId: 'check-understanding', answer: detail.answers[0].correctIndex },
            { questionId: 'true-or-false', answer: false },
            { questionId: 'fill-the-blank', answer: String(detail.answers[2].correctValue) },
          ]);
          assert.equal(quizResult.completed, true);
        }
      }
    }
  }
});
