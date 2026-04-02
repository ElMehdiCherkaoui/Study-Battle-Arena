# ⚔️ Study Battle Arena

> Real-time multiplayer classroom quiz battles for first-year students.

**Study Battle Arena** is a competitive, gamified study platform where students battle each other in real-time SQL quizzes. Answer faster, score higher, crush the competition.

---

## 🎮 Features (MVP)

- **Create / Join rooms** with a 6-character room code
- **Nickname + avatar** selection (8 fun emoji avatars)
- **Owner-controlled lobby settings**: topic, difficulty, rounds, timer, max players
- **SQL question bank** — 21 questions across 3 packs (Easy/Medium/Hard)
  - Multiple choice (MCQ)
  - True/False
  - Fill in the blank
  - Scenario-based "Maison Situation" questions
- **Progressive hint system** (Hint 1 @ 20s, Hint 2 @ 40s, Hint 3 @ 50s)
- **Scoring system**: Base 100 + Speed bonus (up to +50) + First correct bonus (+20) + Streak bonus (+30)
- **Live in-game mini scoreboard**
- **Streak tracking** with 🔥 indicator
- **Result feedback** after each answer with explanation
- **Final results screen** with:
  - Winner banner + confetti 🎉
  - Full leaderboard with score bars
  - Per-player stats (accuracy, correct count, avg speed, final rank)
  - Question-by-question breakdown
  - Rematch button

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Styling | Vanilla CSS (custom design system) |
| State | React Context (no backend yet) |
| Deployment | Vercel (static) |

---

## 🏗️ Folder Structure

```
src/
├── context/
│   └── GameContext.tsx       # Global game state & scoring logic
├── data/
│   └── questions.ts          # SQL question bank (21 questions)
├── pages/
│   ├── Home.tsx / Home.css   # Create/Join room screen
│   ├── Lobby.tsx / Lobby.css # Player list + settings + ready-up
│   ├── Game.tsx / Game.css   # Question + timer + hints + answers
│   └── Results.tsx / Results.css # Winner + leaderboard + analytics
├── App.tsx                   # Router + GameProvider wrapper
├── main.tsx                  # Entry point
└── index.css                 # Global CSS design system
```

---

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deploying to Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repo
4. Framework preset: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy!

The `vercel.json` file handles SPA routing automatically.

---

## 📋 Question Packs

| Pack | Difficulty | Topics |
|---|---|---|
| Pack A | 🟢 Easy | SELECT, WHERE, ORDER BY, LIMIT, Aliases |
| Pack B | 🟡 Medium | JOINs, GROUP BY, HAVING, Aggregates |
| Pack C | 🔴 Hard | Subqueries, Window Functions, CTEs, Transactions, Optimization |

---

## 🔮 Phase 2 Roadmap

- [ ] Backend: Node.js + Express + Socket.IO (real-time multiplayer)
- [ ] Database: PostgreSQL (persistent rooms, match history)
- [ ] Teacher mode: custom question packs, CSV export, session reports
- [ ] JavaScript topic pack
- [ ] OOP PHP topic pack
- [ ] Ranked mode + streak multiplier + tie-breaker
- [ ] XP system + avatar unlocks
- [ ] Anti-cheat + server-authoritative scoring

---

## 👥 Target Users

- First-year students (Première Année)
- Teachers who want a fun classroom revision tool
- Study groups preparing for exams

---

*Study Battle Arena — "Transforming SQL revision into measurable, competitive, and teacher-friendly learning sessions."*
