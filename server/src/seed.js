import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';

const hash = (p) => bcrypt.hashSync(p, 10);

await db.connect();
await db.reset();

await db.insert('users', { name: 'Rahul Kumar', email: 'student@demo.com', password: hash('student123'), role: 'student', xp: 120, level: 2, streak: 3, last_active: null, preferred_language: 'en', created_at: new Date().toISOString() });
await db.insert('users', { name: 'Priya Sharma', email: 'priya@demo.com', password: hash('student123'), role: 'student', xp: 450, level: 4, streak: 7, last_active: null, preferred_language: 'en', created_at: new Date().toISOString() });
await db.insert('users', { name: 'Anita Verma', email: 'teacher@demo.com', password: hash('teacher123'), role: 'teacher', xp: 0, level: 1, streak: 0, last_active: null, preferred_language: 'en', created_at: new Date().toISOString() });

const subjects = [
  ['Mathematics', 'गणित', 'Numbers, algebra, and problem solving for rural schools', '📐'],
  ['Science', 'विज्ञान', 'Physics, chemistry, and biology basics', '🔬'],
  ['English', 'अंग्रेज़ी', 'Reading, grammar, and communication skills', '📚'],
  ['Digital Literacy', 'डिजिटल साक्षरता', 'Computers, internet safety, and basic coding', '💻'],
];
for (const s of subjects) {
  await db.insert('subjects', { name: s[0], name_hi: s[1], description: s[2], icon: s[3] });
}

const lessons = [
  [1, 'Introduction to Fractions', 'A fraction represents parts of a whole. Numerator is top, denominator is bottom. Example: 1/2 means one part of two equal parts.', 'easy', 15, 1],
  [1, 'Algebra Basics', 'Variables like x represent unknown values. Solve equations by keeping both sides equal.', 'medium', 20, 2],
  [2, 'States of Matter', 'Matter exists as solid, liquid, and gas. Particles move faster when heated.', 'easy', 15, 1],
  [2, 'Photosynthesis', 'Plants use sunlight, water, and CO2 to make food and release oxygen.', 'medium', 20, 2],
  [3, 'Simple Present Tense', 'Use simple present for habits and facts. Example: She reads every day.', 'easy', 15, 1],
  [4, 'What is a Computer?', 'A computer processes data using input, processing, storage, and output.', 'easy', 15, 1],
  [4, 'Internet Safety', 'Never share passwords. Verify websites. Report cyberbullying to a trusted adult.', 'medium', 20, 2],
];
for (const l of lessons) {
  await db.insert('lessons', { subject_id: l[0], title: l[1], content: l[2], difficulty: l[3], xp_reward: l[4], order_index: l[5] });
}

const questions = [
  [1, 'What does 1/4 represent?', '["One part of four equal parts","Four wholes","One whole","Four parts of one"]', 0, 'easy', '1/4 means one part when a whole is divided into 4 equal parts.'],
  [1, 'Which is greater: 3/4 or 1/2?', '["3/4","1/2","Equal","Cannot tell"]', 0, 'easy', '3/4 = 0.75 and 1/2 = 0.5, so 3/4 is greater.'],
  [1, 'In 2/5, what is the numerator?', '["2","5","7","2/5"]', 0, 'medium', 'The numerator is the top number: 2.'],
  [2, 'If x + 5 = 12, what is x?', '["7","17","5","12"]', 0, 'easy', 'Subtract 5 from both sides: x = 7.'],
  [2, 'Solve: 2x = 10', '["5","20","8","2"]', 0, 'medium', 'Divide both sides by 2: x = 5.'],
  [3, 'Which state has fixed shape and volume?', '["Solid","Liquid","Gas","Plasma only"]', 0, 'easy', 'Solids have fixed shape and volume.'],
  [3, 'Water boils at 100°C at sea level. This is a:', '["Physical change","Chemical change","Biological change","Nuclear change"]', 0, 'medium', 'Boiling is a physical change of state.'],
  [4, 'What gas do plants release during photosynthesis?', '["Oxygen","Nitrogen","Carbon monoxide","Hydrogen"]', 0, 'easy', 'Plants release oxygen as a byproduct.'],
  [5, 'Choose correct form: She ___ to school daily.', '["goes","go","going","gone"]', 0, 'easy', 'Third person singular uses "goes".'],
  [5, 'Past tense of "run" is:', '["ran","runned","running","runs"]', 0, 'medium', 'Irregular verb: run → ran.'],
  [6, 'Which is an input device?', '["Keyboard","Monitor","Speaker","Printer"]', 0, 'easy', 'Keyboard sends data to the computer.'],
  [7, 'You should share your password with:', '["Nobody","Best friend","Teacher only","Classmates"]', 0, 'easy', 'Passwords must never be shared.'],
];
for (const q of questions) {
  await db.insert('questions', { lesson_id: q[0], question: q[1], options: q[2], correct_index: q[3], difficulty: q[4], explanation: q[5] });
}

const badges = [
  ['First Steps', 'Complete your first lesson', '🌱', 0],
  ['Quiz Master', 'Score 100% on any quiz', '🏆', 50],
  ['Week Warrior', 'Maintain a 7-day streak', '🔥', 100],
  ['Rural Champion', 'Earn 500 XP', '🏅', 500],
  ['Knowledge Seeker', 'Complete 5 lessons', '📖', 150],
];
for (const b of badges) {
  await db.insert('badges', { name: b[0], description: b[1], icon: b[2], xp_required: b[3] });
}

console.log('Database seeded successfully.');
console.log('Demo: student@demo.com / student123 | teacher@demo.com / teacher123');
