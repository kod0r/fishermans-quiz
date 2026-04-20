# 🐟 Fisherman's Quiz

> Interaktive Web-App zum Lernen für die **staatliche Fischerprüfung** – Bayerischer Fragenkatalog (Stand: 11.03.2026).

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/kod0r/fishermans-quiz)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev)

---

## ✨ Features

- **1.052 Fragen** in 6 Bereichen (Biologie, Gewässerkunde, Gewässerpflege, Fanggeräte & Methoden, Recht, Bilderkennung)
- **Meta-Lernsystem:** Fragen werden erst als "gemeistert" markiert, wenn sie **3× hintereinander richtig** beantwortet wurden
- **Session-Runs:** Bereiche können kombiniert und während eines Laufs erweitert werden
- **Fortschritts-Tracking:** Korrektrate, Beste Serie, Bereichs-Statistiken
- **Lazy Loading:** Quiz-Daten werden in Bereichs-Chunks geladen (~27KB Meta initial statt 420KB)
- **Responsive UI:** Dunkles Theme mit Tailwind CSS + shadcn/ui

---

## 🚀 Schnellstart

```bash
# Repository klonen
git clone https://github.com/kod0r/fishermans-quiz.git
cd fishermans-quiz

# Dependencies installieren
npm install

# Dev-Server starten (Port 3000)
npm run dev
```

**Build für Production:**
```bash
npm run build
```

---

## 🛠️ Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Framework | [Vite](https://vitejs.dev) 7 + [React](https://react.dev) 19 |
| Sprache | [TypeScript](https://www.typescriptlang.org) 5.9 |
| Styling | [Tailwind CSS](https://tailwindcss.com) 3.4 + [shadcn/ui](https://ui.shadcn.com) |
| State | React Hooks (Custom Stores) |
| Icons | [Lucide React](https://lucide.dev) |

---

## 📁 Projektstruktur

```
src/
├── views/           # StartView, QuizView, ProgressView
├── components/      # Sidebar + shadcn/ui Komponenten
├── hooks/           # useQuiz (Orchestrierung)
├── store/           # quizRun.ts, metaProgress.ts
├── types/           # TypeScript-Interfaces
├── utils/           # storage.ts, quizLoader.ts
└── lib/             # Utilities
```

---

## 📋 Roadmap & Tickets

- **Aktuelle Planung:** Siehe [ROADMAP.md](./ROADMAP.md)
- **Offene Tickets:** [GitHub Issues](https://github.com/kod0r/fishermans-quiz/issues)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

## 🤝 Mitwirken

Dieses Projekt folgt dem **Conventional Commits** Standard. Jeder Commit sollte dem Format folgen:

```
feat(ui): add new progress indicator
fix(hooks): prevent empty quiz navigation
perf(data): optimize chunk loading
```

Siehe [AGENTS.md](./AGENTS.md) für detaillierte Conventions und Projekt-Kontext.

---

## 📜 Lizenz

Privates Lernprojekt – noch nicht für öffentliche Verbreitung vorgesehen.

---

> 🎣 *"Gut vorbereitet ist halb bestanden."* – Bayerische Fischerprüfung 2026
