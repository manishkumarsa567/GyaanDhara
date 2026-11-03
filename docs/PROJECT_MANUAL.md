# GyaanDhara — Complete Project Manual

**AI-Enhanced Adaptive Gamified Learning System for Rural Education**

This manual explains what GyaanDhara is, how to install and use the website, and all algorithms used in the project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Requirements](#2-system-requirements)
3. [Installation Guide](#3-installation-guide)
4. [How to Use the Website](#4-how-to-use-the-website)
5. [User Roles](#5-user-roles)
6. [Algorithms Used](#6-algorithms-used)
7. [Multilingual Support](#7-multilingual-support)
8. [API Overview](#8-api-overview)
9. [Project File Structure](#9-project-file-structure)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Project Overview

**GyaanDhara** (ज्ञानधारा — “Stream of Knowledge”) is a BTech CSE final-year web application designed for **rural Indian education**. It combines:

- Adaptive lesson quizzes
- 55 educational games with level progression
- Gamification (XP, levels, badges, streaks, leaderboard)
- Multilingual AI tutor (18 Indian languages)
- Teacher dashboard for monitoring students

**Tech stack:** React 18 + Vite (frontend), Node.js + Express (backend), JSON file database, JWT authentication.

---

## 2. System Requirements

| Requirement | Minimum |
|-------------|---------|
| Operating System | Windows 10+, Linux, macOS |
| Node.js | Version 18 or higher |
| RAM | 4 GB |
| Browser | Chrome, Firefox, Edge (latest) |
| Internet | Required for first setup; low-bandwidth friendly after load |

---

## 3. Installation Guide

### Step 1 — Open project folder

```bash
cd GyaanDhara
```

### Step 2 — Install all dependencies

```bash
npm run install:all
```

This installs packages for the root project, `client/`, and `server/`.

### Step 3 — Start development servers

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Website (Frontend) | http://localhost:5173 |
| Backend API | http://localhost:5000 |

### Step 4 — Optional OpenAI tutor

Create or edit `server/.env`:

```
OPENAI_API_KEY=your_openai_key_here
```

If no key is set, the built-in multilingual rule-based tutor still works.

### Step 5 — Production build

```bash
npm run build
npm start
```

---

## 4. How to Use the Website

### 4.1 First Visit — Landing Page

1. Open http://localhost:5173
2. Click **Sign In** or **Create Account**

### 4.2 Registration

1. Enter full name, email, and password (minimum 6 characters)
2. Select role: **Student** or **Teacher**
3. Choose **Preferred Language** (18 options)
4. Click **Create Account**

### 4.3 Login

**Demo accounts (for testing):**

| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.com | student123 |
| Teacher | teacher@demo.com | teacher123 |

1. Enter email and password
2. Use the **language switcher** (top corner) to change UI language anytime
3. Click **Sign In**

### 4.4 Student Dashboard

After login, students see:

- **Total XP** and **Level**
- **Daily streak** count
- **Recommended difficulty** (easy / medium / hard)
- **Learning path** — next lessons to complete
- **Badges earned**
- **Recent quiz results**

**Navigation menu:**

| Menu | Purpose |
|------|---------|
| Dashboard | Overview of progress |
| Learn | Browse subjects and lessons |
| Games | Play 88 educational games |
| AI Tutor | Ask doubts in your language |
| Leaderboard | Compare XP with other learners & villages |

### 4.5 Learning Flow (Subjects → Lessons → Quiz)

1. Go to **Learn** from the menu
2. Select a **subject** (e.g., Mathematics, Science, English)
3. Open a **lesson** and read the content
4. Click **Take Adaptive Quiz**
5. Answer 5 questions — difficulty is chosen automatically based on your past performance
6. Submit quiz — earn XP, update mastery, and unlock badges if eligible

**Lesson completion:** Mastery ≥ 60% marks the lesson as completed.

### 4.6 Games Flow

1. Go to **Games** from the menu
2. Search or filter by category (Math, Science, English, Digital, Logic, Social, Languages)
3. Click a game card to start (88 cataloged games across 10 interactive engines)
4. Complete the game activity
5. View your result:

| Your Score | What Happens |
|------------|--------------|
| **≥ 50%** | **Pass** — next level unlocks, bonus XP |
| **< 50%** | **Fail** — hints and suggestions shown |
| **Fail again (same game)** | Step-by-step **manual** in your language |

6. If you pass and a new level is unlocked, click **Play Next Level**
7. If stuck, click **Ask AI Tutor** for help

### 4.7 AI Tutor

1. Go to **AI Tutor**
2. Type your question in any supported language
3. Use **Quick Questions** for common topics (fractions, science, grammar, online safety, XP)
4. The tutor responds in your selected UI language

### 4.8 Leaderboard & Village Rankings

1. Go to **Leaderboard**
2. Choose between **Leaderboard Areas**:
   - **Global**: Nationwide rankings across all active students.
   - **All Villages**: Village-level competition ranking rural communities by collective XP, active learner participation, and completed lessons.
   - **My District**: Student rankings strictly within the user's registered district.
   - **My Village**: Local student rankings within the user's specific village.
3. View the top 3 on the Olympic podium stand and see your personal or village standing highlighted in the leaderboard table.

### 4.9 Teacher Dashboard

Teachers (login with teacher account):

1. Go to **Teacher** from the menu
2. View total students, lessons, quiz attempts, average mastery
3. See subject-wise performance charts
4. View top students and full student list with progress

### 4.10 Changing Language

- On **Login / Register** page — use language dropdown
- After login — use **Language Switcher** in the header
- Urdu automatically switches layout to **RTL** (right-to-left)

---

## 5. User Roles

| Feature | Student | Teacher |
|---------|---------|---------|
| Dashboard | ✅ | ✅ (Teacher view) |
| Subjects & Lessons | ✅ | ❌ |
| Adaptive Quizzes | ✅ | ❌ |
| Games | ✅ | ❌ |
| AI Tutor | ✅ | ✅ |
| Leaderboard | ✅ | ✅ |
| Monitor all students | ❌ | ✅ |

---

## 6. Algorithms Used

### 6.1 Adaptive Quiz Difficulty Algorithm

**File:** `server/src/services/adaptive.js`

Based on the **last 5 quiz attempts**, average accuracy is calculated:

```
avgAccuracy = average(score / total) for last 5 attempts
```

| Average Accuracy | Recommended Difficulty |
|------------------|------------------------|
| ≥ 85% | Hard |
| ≥ 60% | Medium |
| < 60% | Easy |

Questions are randomly selected from the pool matching the recommended difficulty.

---

### 6.2 Quiz XP Calculation

```
base XP = { easy: 10, medium: 20, hard: 35 }
accuracy = score / total
bonus = round(accuracy × base)
streakBonus = min(streak, 7) × 2
total XP earned = bonus + streakBonus
```

---

### 6.3 User Level from XP

```
User Level = floor(XP / 100) + 1
```

Example: 250 XP → Level 3

---

### 6.4 Lesson Mastery Algorithm

```
bestAccuracy = max(score/total) across all attempts on a lesson
mastery = min(100, round(bestAccuracy × 70 + min(attemptCount, 5) × 6))
```

- Lesson marked **completed** when mastery ≥ **60%**

---

### 6.5 Learning Path Recommendation

**File:** `server/src/services/adaptive.js` → `getLearningPath()`

1. Iterate lessons in subject order
2. Find incomplete lessons for the user
3. Prioritize lessons with mastery < 40% as **high priority**
4. Return top 3 recommendations with reason text

---

### 6.6 Game Pass / Fail Algorithm

**File:** `server/src/games/adaptiveEngine.js`

```
PASS_THRESHOLD = 50%

accuracy = (score / total) × 100

if accuracy ≥ 50%  → PASS (unlock next level)
if accuracy < 50%  → FAIL (show hints)
```

---

### 6.7 Game Level Progression (Levels 1–3)

| Event | Action |
|-------|--------|
| Pass (≥ 50%) | Level + 1 (maximum level 3) |
| Fail (< 50%) | Level unchanged |
| 3 consecutive fails | Level − 1 (minimum level 1) |

Higher levels serve **more items** and **harder content** via `getGameContent(game, level)`.

---

### 6.8 Game Mastery — Exponential Moving Average (EMA)

```
α = 0.5  (first attempt)
α = 0.35 (later attempts)

newMastery = oldMastery × (1 − α) + accuracy × α
```

Result is clamped between 0 and 100. This gives a smooth, realistic learning curve.

---

### 6.9 Game XP Calculation

```
levelMultiplier = 1 + (level − 1) × 0.25
XP = round(baseXp × levelMultiplier × (accuracy / 100))

Bonuses:
  + 20% of baseXp on pass
  + 5 XP for 100% accuracy

Minimum: 3 XP (pass), 1 XP (fail)
```

---

### 6.10 Hints Algorithm (Score < 50%)

**File:** `server/src/games/hints.js`

When a student fails a game:

1. Return **3 engine-specific hints** (quiz, memory, math, etc.)
2. Add **1 general study tip**
3. Return **suggestion message** based on accuracy:
   - Below 40% → “Study hints and manual, then retry”
   - 40–49% → “You are close! One more focused attempt”

All text is returned in the user's language (with English fallback).

---

### 6.11 Manual on Repeat Failure

**File:** `server/src/games/manuals.js`

```
if fail_count ≥ 1 AND accuracy < 50% → show manual
```

Manual includes:
- Title
- Step-by-step instructions (4 steps)
- Pass tip (“Score at least 50% to unlock next level”)

Language fallback chain: **user language → Hindi → English**

---

### 6.12 AI Tutor — Topic Detection & Response

**Files:** `server/src/services/tutor-i18n.js`, `server/src/services/tutor.js`

**Topic detection** uses keyword matching on user message:

| Keywords | Topic |
|----------|-------|
| fraction, math, algebra | Fractions / Math |
| science, plant, photosynthesis | Science |
| english, grammar, tense | English |
| password, OTP, cyber | Digital literacy |
| xp, badge, streak, game | Gamification |
| (default) | General welcome |

**Response modes:**

1. **OpenAI** (if API key set) — responds in user's language via system prompt
2. **Rule-based fallback** — pre-written responses in 18 languages + difficulty/streak suffix

---

### 6.13 Badge Award Algorithm

Badges are awarded automatically when:

| Badge | Condition |
|-------|-----------|
| First lesson complete | Complete any lesson |
| Perfect score | 100% on a quiz |
| Week warrior | 7-day streak |
| XP champion | Total XP ≥ 500 |
| Dedicated learner | 5 lessons completed |

### 6.14 The 17 Thematic Games (Agriculture, Finance, and Rural History)

GyaanDhara includes **17 specialized rural-context games** (Catalog IDs 72 to 88, expanding the catalog from 71 to 88 total educational games):

| ID | Slug | Game Title | Category | Engine | Base XP | Focus Theme |
|:---|:-----|:-----------|:---------|:-------|:--------|:------------|
| 72 | `crop-rotation-master` | Crop Rotation Master | Social | `sequence` | 22 | Agriculture: Legume-cereal-tuber crop cycles & nitrogen fixation |
| 73 | `soil-nutrient-match` | Soil & Nutrient Chemistry | Science | `match_pairs` | 20 | Agriculture: N-P-K, Zinc, and organic carbon soil balance |
| 74 | `monsoon-irrigation-quest` | Monsoon & Drip Irrigation | Science | `quiz` | 18 | Agriculture: Drip lines, check dams, rainwater harvesting & tensiometers |
| 75 | `natural-pest-defense` | Natural Pest & Neem Defense | Science | `true_false` | 16 | Agriculture: Neem kernel extract, predator bugs, and trap crops |
| 76 | `millet-mission-india` | Shree Anna: Millets & Supergrains | Social | `flashcard` | 18 | Agriculture: Ragi, Bajra, and Jowar nutritional & climate resilience |
| 77 | `harvest-market-math` | Harvest Yield & Bag Math | Math | `quiz` | 24 | Agriculture: Quintals, bags, acreage, seed math & storage loss |
| 78 | `kisan-credit-card-math` | Kisan Credit Card (KCC) Math | Math | `quiz` | 22 | Finance: Subsidized 4% interest, loan limits & Khasra land verification |
| 79 | `village-bank-passbook` | Passbook & Ledger Reader | Digital | `match_pairs` | 18 | Finance: Debit, Credit, IFSC code, account balance, cheque clearance |
| 80 | `shg-savings-circle` | Self-Help Group (SHG) Savings | Social | `quiz` | 20 | Finance: Mahila Bachat Gat pooling, internal credit, NRLM revolving fund |
| 81 | `crop-insurance-safety` | PM Fasal Bima (Crop Insurance) | Social | `true_false` | 18 | Finance: 2% Kharif premium, 72-hour peril notice, non-loanee rights |
| 82 | `simple-interest-haat` | Haat Bazaar Simple Interest | Math | `quiz` | 25 | Finance: Calculating SI = (P × R × T) / 100 on local artisan loans |
| 83 | `mandi-price-bargain` | APMC Mandi & MSP Price Check | Social | `flashcard` | 18 | Finance: MSP price floor, e-NAM portal, moisture grades & weigh slips |
| 84 | `champaran-indigo-history` | Champaran Satyagraha 1917 | Social | `sequence` | 24 | Rural History: Tinkathia abolition, Raj Kumar Shukla, Gandhi's first satyagraha |
| 85 | `bardoli-farmers-revolt` | Bardoli Farmers Movement | Social | `quiz` | 22 | Rural History: 1928 non-violent tax revolt, Sardar Patel, peasant victory |
| 86 | `ancient-stepwells-tanks` | Ancient Water Heritage & Baolis | Social | `match_pairs` | 20 | Rural History: Baolis, Johads, Ahar-Pynes, Kuhls, and Eri tank systems |
| 87 | `rural-artisans-handicrafts` | Rural Handloom & Folk Crafts | Social | `match_pairs` | 18 | Rural History: Madhubani, Pashmina, Terracotta, Bidriware, Dhokra casting |
| 88 | `chipko-forest-guardians` | Chipko & Forest Rights Legacy | Social | `true_false` | 18 | Rural History: Gaura Devi, tree hugging, Sunderlal Bahuguna eco-philosophy |

---

## 7. Database Schema & Village-Level Leaderboards

### 7.1 Architecture & Storage Modes

GyaanDhara provides a unified JSON/Document database layer (`server/src/db.js`):
- **Local Storage:** `server/data/db.json` with asynchronous queue-protected persistence and atomic saves.
- **Enterprise Storage:** Automatic MongoDB migration when `MONGODB_URI` is provided, retaining counter integrity.

### 7.2 Core Collections & Schemas

#### 1. `villages` (Rural Settlements Master)
Stores primary demographic, administrative, and aggregated academic metrics per village:

```typescript
interface Village {
  id: number;                 // Auto-increment primary key
  name: string;               // Village name (e.g., "Rampur", "Shivpur")
  district: string;           // District jurisdiction (e.g., "Varanasi", "Patna")
  block: string;              // Administrative block / taluka
  state: string;              // State (e.g., "Uttar Pradesh", "Bihar")
  pincode: string;            // 6-digit postal code
  total_students: number;     // Registered students count
  total_xp: number;           // Total collective XP earned by village learners
  lessons_completed: number;  // Cumulative count of passed lessons
  created_at: string;         // ISO 8601 creation timestamp
}
```

#### 2. `village_leaderboards` (Aggregated & Periodic Village Rankings)
Stores aggregated performance snapshots across timeframes:

```typescript
interface VillageLeaderboardEntry {
  id: number;                 // Unique record ID
  village_id: number;         // Reference to villages.id
  village_name: string;       // Normalized village display name
  district: string;           // District name
  state: string;              // State name
  period: string;             // 'all_time' | 'monthly' | 'weekly'
  rank: number;               // Village standing rank
  total_xp: number;           // Aggregated XP
  active_students: number;    // Count of active participating students
  avg_xp_per_student: number; // Mean XP per active student
  lessons_completed: number;  // Lessons mastered by village students
  updated_at: string;         // ISO timestamp of snapshot recalculation
}
```

#### 3. `users` (Location-Enhanced Learner Schema)
Students and teachers support optional geographic scoping:

| Field | Type | Description |
|:------|:-----|:------------|
| `id` | number | Unique user ID |
| `name` | string | Full name |
| `email` | string | Login email |
| `password` | string | Bcrypt hashed password |
| `role` | string | `'student'` or `'teacher'` |
| `village` | string | Learner's home village |
| `village_id` | number | Optional foreign key to `villages.id` |
| `district` | string | Learner's district |
| `block` | string | Sub-district administrative block |
| `state` | string | Indian state or Union Territory |
| `xp` | number | Cumulative experience points |
| `level` | number | Calculated user level |
| `streak` | number | Daily consecutive login streak |
| `preferred_language` | string | 1 of 18 supported languages |

#### 4. Additional Schema Tables
- `subjects`: Academic subjects with multilingual translations (`name_hi`, etc.).
- `lessons`: Curricular lessons with difficulty ratings, order indices, and chapter content.
- `questions`: Question banks per lesson with difficulty and answers.
- `user_progress`: Per-learner lesson tracking (`completed`, `mastery`, `score`, `attempts`).
- `game_plays` & `game_progress`: Game attempts, EMA mastery, fail streaks, and level unlocks.
- `badges` & `user_badges`: Gamified achievement awards.
- `community_quests` & `community_quest_members`: Cross-village learning alliances.
- `ncert_progress`: Class 1–8 chapter-wise NCERT mastery records.

---

### 7.3 Village-Level Leaderboard Mechanics

The leaderboard system (`server/src/services/community.js`) exposes 4 distinct competition scopes:

1. **`scope = 'global'`**: Individual student rankings across all regions (top 10 + learner's own rank).
2. **`scope = 'villages'`**: Inter-village competition! Aggregates student XP, active learners, and completed lessons across rural settlements to rank villages collectively.
3. **`scope = 'district'`**: Intra-district individual student rankings for local peer motivation.
4. **`scope = 'village'`**: Intra-village peer rankings among students in the same village and district.

**Real-time Aggregation Logic:**
- Live XP earned by students belonging to a village is dynamically summed.
- High-performing villages earn Olympic podium honors in the UI with collective statistics (`👥 active_students`, `📚 lessons_completed`, `⚡ total_xp`).
- Learner's own village is highlighted automatically with a distinct badge.

---

## 8. Multilingual Support

**18 supported languages:**

English, Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Odia, Punjabi, Urdu, Assamese, Maithili, Bhojpuri, Sanskrit, Nepali, Kashmiri

| Component | Multilingual? |
|-----------|---------------|
| UI (menus, buttons) | ✅ All 18 |
| AI Tutor | ✅ All 18 |
| Game hints | ✅ en, hi, te, bn (+ fallback) |
| Game manuals | ✅ All 18 |
| NCERT Chapters & Quizzes | ✅ All 18 |
| Lesson content | English (primary) |

---

## 9. API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/learning/dashboard` | Student dashboard data |
| GET | `/api/learning/subjects` | List subjects |
| GET | `/api/learning/subjects/:id/lessons` | Lessons in subject |
| GET | `/api/learning/lessons/:id` | Lesson content |
| GET | `/api/learning/lessons/:id/quiz` | Adaptive quiz questions |
| POST | `/api/learning/lessons/:id/quiz/submit` | Submit quiz answers |
| GET | `/api/learning/leaderboard` | Scoped leaderboards (`scope=global|villages|district|village`) |
| GET | `/api/learning/leaderboard/villages` | Dedicated Village-level rankings |
| GET | `/api/games/catalog?lang=hi` | All 88 educational games |
| GET | `/api/games/:slug?lang=hi` | Game session + manual |
| POST | `/api/games/:slug/complete` | Submit game result |
| POST | `/api/tutor/chat` | Chat with AI tutor |
| GET | `/api/teacher/stats` | Teacher statistics |
| GET | `/api/teacher/students` | Student list |

All protected routes require `Authorization: Bearer <token>` header.

---

## 10. Project File Structure

```
GyaanDhara/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                   # Dashboard, Games, Tutor, Quiz, Leaderboard, etc.
│   │   ├── games/GameEngine.jsx     # 10 game engines UI
│   │   ├── i18n/locales/            # 18 language files
│   │   ├── context/                 # Auth, Language contexts
│   │   └── api.js                   # API client
│   └── dist/                        # Production build output
├── server/
│   ├── src/
│   │   ├── routes/                  # auth, learning, games, tutor, teacher, ncert
│   │   ├── games/
│   │   │   ├── catalog.js           # 88 games list (including 17 thematic rural games)
│   │   │   ├── content.js           # Game content per level (88 games, 10 engines)
│   │   │   ├── adaptiveEngine.js    # Pass/fail, mastery, XP
│   │   │   ├── hints.js             # Multilingual hints
│   │   │   └── manuals.js           # Multilingual manuals
│   │   ├── services/
│   │   │   ├── community.js         # Scoped & Village-level leaderboards
│   │   │   ├── adaptive.js          # Quiz difficulty, XP, mastery
│   │   │   ├── tutor.js             # AI tutor main logic
│   │   │   └── tutor-i18n.js        # Multilingual tutor responses
│   │   └── db.js                    # Database layer with villages & leaderboards
│   └── data/db.json                 # JSON database with villages & leaderboards tables
├── docs/
│   ├── PROJECT_MANUAL.md            # This file
│   └── ADAPTIVE_ALGORITHMS.md       # Algorithm reference
├── major/
│   └── PROJECT_REPORT.md            # Academic project report
├── README.md
└── package.json
```

---

## 11. Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm` not found | Install Node.js 18+ from https://nodejs.org |
| Port 5173 in use | Stop other Vite apps or change port in `client/vite.config.js` |
| Login fails | Use demo credentials or register a new account |
| AI tutor generic replies | OpenAI quota may be exceeded; rule-based tutor still works |
| Games not loading | Ensure backend is running on port 5000 |
| Language not changing | Refresh page after switching language |

---

## Quick Reference Card

```
INSTALL:     npm run install:all && npm run dev
WEBSITE:     http://localhost:5173
STUDENT:     student@demo.com / student123
TEACHER:     teacher@demo.com / teacher123
PASS GAME:   Score ≥ 50%
PASS LESSON: Mastery ≥ 60%
LANGUAGES:   18 Indian languages supported
GAMES:       88 games across Agriculture, Finance, Rural History, Math, Science & English
LEADERBOARD: Global, All Villages (Village-Level Leaderboard), District, and Village scopes
```

---

*GyaanDhara — Empowering rural learners through adaptive, gamified, multilingual education.*

