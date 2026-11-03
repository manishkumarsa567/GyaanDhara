# Adaptive Game Algorithms

GyaanDhara uses realistic learning algorithms for **55 educational games** across **3 difficulty levels** each.

## Pass / Fail Rule

| Condition | Result |
|-----------|--------|
| Accuracy **≥ 50%** | **Pass** — unlock next level |
| Accuracy **< 50%** | **Fail** — hints + optional manual |

The pass threshold is defined in `server/src/games/adaptiveEngine.js` as `PASS_THRESHOLD = 50`.

## Level Progression (1 → 3)

Each game has up to **3 levels**. Higher levels include more items and harder content (`getGameContent(game, level)`).

- **On pass:** level increases by 1 (max 3)
- **On fail:** level stays same; after **3 consecutive fails**, level drops by 1 (minimum 1)

## Mastery Score

Mastery uses an **exponential moving average (EMA)** of accuracy:

```
newMastery = oldMastery × (1 − α) + accuracy × α
```

- First attempt: α = 0.5
- Later attempts: α = 0.35

This produces a smooth, realistic learning curve instead of jumping wildly between attempts.

## XP Calculation

```
XP = baseXp × levelMultiplier × (accuracy / 100)
levelMultiplier = 1 + (level − 1) × 0.25
```

Bonuses:
- +20% base XP on pass
- +5 XP for 100% accuracy
- Minimum 3 XP on pass, 1 XP on fail

## Hints (< 50%)

When a student scores below 50%, the API returns:

1. **Engine-specific hints** (quiz, memory, math, etc.)
2. **General study suggestion** in the user's language
3. **Accuracy-based message** (e.g. "close!" if 40–49%)

Implemented in `server/src/games/hints.js`.

## Manual on Repeat Failure

If a student **fails the same game** (fail count ≥ 1), a **step-by-step manual** appears in their preferred language:

- Shown **before retry** when loading the game (if prior failures exist)
- Shown **after completion** when score < 50%

Manuals cover all 10 game engines and support **18 Indian languages** with fallback: `user lang → Hindi → English`.

Implemented in `server/src/games/manuals.js`.

## Data Stored

`game_progress` table per user per game:

| Field | Description |
|-------|-------------|
| `level` | Current level (1–3) |
| `attempts` | Total attempts |
| `fail_count` | Cumulative failures |
| `consecutive_fails` | Streak of failures |
| `mastery` | EMA mastery (0–100) |
| `best_accuracy` | Best score % |
| `passed_levels` | Count of levels passed |

## API Endpoints

```
GET  /api/games/:slug?lang=hi     — game content, progress, manual if needed
POST /api/games/:slug/complete    — { score, total, lang } → pass/fail, hints, manual, nextLevel
```

## AI Tutor (Multilingual)

The AI tutor responds in the user's **preferred language** (18 supported):

- OpenAI (if `OPENAI_API_KEY` set) with language-specific system prompt
- Rule-based fallback in `server/src/services/tutor-i18n.js`

Send `lang` in `POST /api/tutor/chat` body or use `user.preferred_language`.
