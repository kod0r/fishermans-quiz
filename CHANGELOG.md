# Changelog

> Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).
> Versionierung folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]

### Added
- #04: Staged Loading für Quiz-Daten – 420KB monolithische JSON aufgeteilt in:
  - `quiz_meta.json` (28KB): Meta-Daten + Fragen-Index (sofort geladen)
  - 6 Bereichs-Chunks in `data/bereiche/` (lazy geladen bei Quiz-Start)
  - `quizLoader.ts`: Cache, paralleles Laden, Fallback auf Hintergrund-Load
- #03b: Comprehensive Meta-Progress-Box im Hauptmenü (klappbar)
- #03a: Falsche Antworten in ProgressView klappbar gemacht
- #03: Sidebar-Navigation oben links verankert
- #02: AGENTS.md mit Projekt-Kontext und Conventions

### Fixed
- #03c: `useQuiz.starteQuiz()` navigierte bei fehlenden Daten in leere QuizView
- #02: Globale Variablen `gem`/`pct` in StartView.tsx korrigiert

### Changed
- `vite.config.ts`: `host: '0.0.0.0'` für DevContainer-Kompatibilität

---

## [0.0.0] – 2026-04-20

### Added
- Initiale Projekt-Einrichtung
- Vite + React 19 + TypeScript + Tailwind CSS Stack
- shadcn/ui Komponenten-Bibliothek
- Quiz-Run mit Session-Persistenz (localStorage)
- Meta-Progression mit Streak-System (3× richtig = gemeistert)
- 6 Bereiche: Biologie, Gewässerkunde, Gewässerpflege, Fanggeräte & Methoden, Recht, Bilderkennung
