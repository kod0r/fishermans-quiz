# 🐟 Fisherman's Quiz

> Interactive web app for learning the **German state fishing exam** — based on the official Bavarian question catalog.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kod0r.github.io%2Ffishermans--quiz-blue)](https://kod0r.github.io/fishermans-quiz/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)

**[🎣 Try it live →](https://kod0r.github.io/fishermans-quiz/)**

## ✨ Features

- **900+ questions** across 6 areas (Biology, Water Science, Water Conservation, Fishing Gear & Methods, Law, Image Recognition)
- **Meta-learning system:** Questions are only marked "mastered" after **3 consecutive correct answers**
- **Session runs:** Areas can be combined and expanded during a run
- **Progress tracking:** Correct rate, best streak, per-area statistics
- **Lazy loading:** Quiz data loads in area chunks (~27KB meta initially instead of 420KB)
- **Responsive UI:** Dark theme with Tailwind CSS + shadcn/ui

---

## 🧪 Dataset Quality

The question catalog was validated with a custom audit pipeline:

- **1,052 questions** audited for schema correctness, duplicates, and truncation
- **Zero schema errors** — every question passes Zod validation
- **Zero missing image assets**
- **Severe defect rate: 1.24%** (13 questions) — below the 2% re-extraction threshold
- **8 exact duplicates** found and removed (4 clusters)
- **5 truncated options** fixed

Audit artifacts: `verify.py`, `audit_report.json`, `human_review.csv`

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/kod0r/fishermans-quiz.git
cd fishermans-quiz

# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev
```

**Production build:**

```bash
npm run build
```

---

## 🛠️ Tech Stack

| Area      | Technology                                                                        |
| --------- | --------------------------------------------------------------------------------- |
| Framework | [Vite](https://vitejs.dev) 8+ + [React](https://react.dev) 19                     |
| Language  | [TypeScript](https://www.typescriptlang.org) 5.9+                                 |
| Styling   | [Tailwind CSS](https://tailwindcss.com) 3.4+ + [shadcn/ui](https://ui.shadcn.com) |
| State     | React Hooks (Custom Stores)                                                       |
| Icons     | [Lucide React](https://lucide.dev)                                                |

---

## 🧠 How I Built This

I built this app entirely with AI assistance via **Kimi Code CLI** — I didn't write the code by hand, I wrote the prompts, scoped the features, and reviewed the output.

**What I actually did:**
- Scoped 300+ GitHub issues to track features, bugs, and refactors
- Used agent skills (`code-qa`, `diagnose`, `tdd`, `improve-codebase-architecture`) to maintain quality
- Wrote `AGENTS.md` and `BRAIN.md` so the agents could self-document conventions
- Managed 14 releases and 48 deployments in ~2 weeks
- Learned when to trust the AI, when to push back, and when to just ship

The codebase grew to 900+ questions, 3 game modes, SRS flashcards, PWA support, and 393 passing tests. Every commit follows Conventional Commits. Every feature started as a GitHub issue.

**Tech choices:**
- **No state library** — React hooks + localStorage adapters (extracted into `persistence/`)
- **No backend** — static JSON files, lazy-loaded by topic
- **Zod everywhere** — runtime validation at every persistence boundary
- **PWA** — works offline after first load

---

## 📁 Project Structure

```
src/
├── views/           # StartView, QuizView, FlashcardView, ProgressView
├── components/      # Quiz UI + shadcn/ui components
├── components/game-menu/  # HUD, menu overlay, navigation
├── hooks/           # useQuiz, useGameMenu, useKeyboardShortcuts
├── store/           # quizRun, metaProgress, settings, favorites, notes, history, srs
├── engine/          # runEngine.ts (pure state machine)
├── modes/           # arcade.ts, hardcore.ts, exam.ts (mode policies)
├── utils/persistence/  # localStorageAdapter, memoryAdapter, domain adapters
├── types/           # TypeScript interfaces + Zod schemas
└── lib/             # Utilities
```

---

## 📋 Roadmap & Tickets

- **Current planning:** See [ROADMAP.md](./ROADMAP.md)
- **Open tickets:** [GitHub Issues](https://github.com/kod0r/fishermans-quiz/issues)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)
- **Releases:** [GitHub Releases](https://github.com/kod0r/fishermans-quiz/releases)

---

## 🤝 Contributing

This project follows the **Conventional Commits** standard. Every commit should follow the format:

```
feat(ui): add new progress indicator
fix(hooks): prevent empty quiz navigation
perf(data): optimize chunk loading
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for coding guidelines.

---

## 📜 License

Private learning project — not yet intended for public distribution.

---

_All documentation is in English. The app UI is in German._
