# GyaanDhara

**An AI-Enhanced Adaptive Gamified Learning System for Rural Education**

BTech CSE Final Year Project — Full-stack web application with adaptive quizzes, 55 educational games, gamification (XP, badges, streaks), and a multilingual AI learning assistant.

## Features

- **Adaptive Learning** — Quiz difficulty adjusts based on performance (easy → medium → hard)
- **55 Educational Games** — 10 game engines, 3 levels each, 50% pass threshold to unlock next level
- **Smart Game Feedback** — Hints when score < 50%; multilingual manuals on repeat failure
- **Gamification** — XP, levels, badges, daily streaks, leaderboard
- **Community Learning** — Opt-in district/village leaderboards, Level 10 peer mentors with AI-screened answers and capped bonus XP, and anonymous Socket.io study rooms with synchronized flash quizzes
- **AI Tutor** — Works in **18 Indian languages** (rule-based + optional OpenAI)
- **Multilingual UI** — English, Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Odia, Punjabi, Urdu, Assamese, Maithili, Bhojpuri, Sanskrit, Nepali, Kashmiri
- **Rural-first UX** — Low-bandwidth friendly, offline-capable PWA
- **Role-based access** — Student and Teacher dashboards

## Game Progression Algorithm

| Score | What happens |
|-------|----------------|
| **≥ 50%** | Pass — next level unlocked, bonus XP |
| **< 50%** | Fail — hints + suggestions in your language |
| **Repeat fail** | Step-by-step **manual** in your language to pass the level |

See [docs/ADAPTIVE_ALGORITHMS.md](docs/ADAPTIVE_ALGORITHMS.md) for mastery EMA, XP formula, and level drop rules.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/PROJECT_MANUAL.md](docs/PROJECT_MANUAL.md) | Complete user & technical manual — how to use the website, all algorithms |
| [docs/ADAPTIVE_ALGORITHMS.md](docs/ADAPTIVE_ALGORITHMS.md) | Game & quiz algorithm reference |
| [major/PROJECT_REPORT.md](major/PROJECT_REPORT.md) | BTech major project report (Abstract, Introduction, Literature Review, etc.) |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (includes npm)

## Quick Start

```bash
cd GyaanDhara
npm run install:all
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Demo Accounts

| Role    | Email              | Password   |
|---------|--------------------|------------|
| Student | student@demo.com   | student123 |
| Teacher | teacher@demo.com   | teacher123 |

## Project Structure

```
GyaanDhara/
├── client/                 # React + Vite frontend
│   └── src/i18n/locales/   # 18 language files
├── server/                 # Express API
│   └── src/games/          # catalog, content, adaptiveEngine, hints, manuals
├── docs/
│   ├── PROJECT_MANUAL.md       # Full project manual
│   └── ADAPTIVE_ALGORITHMS.md
├── major/
│   └── PROJECT_REPORT.md       # Academic major project report
├── package.json
└── README.md
```

## Optional: OpenAI AI Tutor

Set in `server/.env`:

```
OPENAI_API_KEY=your_key_here
```

Without a key, the built-in **multilingual rule-based tutor** still works in all 18 languages.

## MongoDB Setup

Create a MongoDB database user and copy the Node.js driver connection string from MongoDB Atlas (**Connect → Drivers**). The Atlas console URL and an Atlas API key are not database connection strings.

Create `server/.env` from `server/.env.example` and set:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/?retryWrites=true&w=majority
MONGODB_DB_NAME=gyaandhara
```

Keep the URI and database password private; `.env` files are excluded from version control. Ensure the database user has read/write access and the server's IP is permitted by the cluster network access rules. On first connection to an empty MongoDB database, the app migrates existing records from `server/data/db.json`. Once configured, new users, learning progress, quiz attempts, tutor messages, and game progress are stored in MongoDB. Without `MONGODB_URI`, development uses the local JSON store; `/api/health` reports the active data store.

## Production Build

```bash
npm run build
npm start
```

Serve the built client from `client/dist` via the Express server.

## Community Learning

Students can add an optional village and district in their profile and choose a matching local leaderboard; locality is not shown on the global leaderboard. At Level 10, students can earn a mentor badge and 5 XP for each AI-approved peer answer, up to 5 answers / 25 XP per day. Questions and responses are screened before sharing; students should not submit names, contact details, or personal stories. AI screening is a safety check, not a guarantee of factual correctness.

Study rooms use authenticated Socket.io connections and anonymized avatars. Presence and flash-quiz scores are held in server memory and are cleared when the room empties or the server restarts; rooms do not provide private chat or persistent room history.

## Tech Stack

- **Frontend:** React 18, Vite, React Router, CSS, i18n (18 languages)
- **Backend:** Node.js, Express, JWT
- **Database:** MongoDB via the official Node.js driver, with automatic migration from the existing JSON store
