# 🐟 Fisherman's Quiz

> Interactive web app for learning the **Bavarian state fishing exam** — based on the official question catalog (as of: 2026-03-11).

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/kod0r/fishermans-quiz)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)

---

## ✨ Features

- **1,052 questions** across 6 areas (Biology, Water Science, Water Conservation, Fishing Gear & Methods, Law, Image Recognition)
- **Meta-learning system:** Questions are only marked "mastered" after **3 consecutive correct answers**
- **Session runs:** Areas can be combined and expanded during a run
- **Progress tracking:** Correct rate, best streak, per-area statistics
- **Lazy loading:** Quiz data loads in area chunks (~27KB meta initially instead of 420KB)
- **Responsive UI:** Dark theme with Tailwind CSS + shadcn/ui

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/kod0r/fishermans-quiz.git
cd fishermans-quiz

# Install dependencies
npm install

# Start dev server (port 3000)
rtk npm run dev
```

**Production build:**

```bash
rtk npm run build
```

---

## 🛠️ Tech Stack

| Area      | Technology                                                                       |
| --------- | -------------------------------------------------------------------------------- |
| Framework | [Vite](https://vitejs.dev) 8 + [React](https://react.dev) 19                     |
| Language  | [TypeScript](https://www.typescriptlang.org) 5.9                                 |
| Styling   | [Tailwind CSS](https://tailwindcss.com) 3.4 + [shadcn/ui](https://ui.shadcn.com) |
| State     | React Hooks (Custom Stores)                                                      |
| Icons     | [Lucide React](https://lucide.dev)                                               |

---

## 📁 Project Structure

```
src/
├── views/           # StartView, QuizView, ProgressView
├── components/      # Sidebar + shadcn/ui components
├── hooks/           # useQuiz (orchestration)
├── store/           # quizRun.ts, metaProgress.ts
├── types/           # TypeScript interfaces
├── utils/           # storage.ts, quizLoader.ts
└── lib/             # Utilities
```

---

## 📋 Roadmap & Tickets

- **Current planning:** See [ROADMAP.md](./ROADMAP.md)
- **Open tickets:** [GitHub Issues](https://github.com/kod0r/fishermans-quiz/issues)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

## 🤝 Contributing

This project follows the **Conventional Commits** standard. Every commit should follow the format:

```
feat(ui): add new progress indicator
fix(hooks): prevent empty quiz navigation
perf(data): optimize chunk loading
```

See [AGENTS.md](./AGENTS.md) for detailed conventions and project context.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for coding guidelines.

---

## 📜 License

Private learning project — not yet intended for public distribution.

---

*All documentation is in English. The app UI is in German.*
