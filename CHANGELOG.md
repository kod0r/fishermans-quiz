# Changelog

> Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).
> Versionierung folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]

_Keine Änderungen._

---

## [0.1.0] – 2026-04-20

### Added

#### Core Features
- **Arcade-Modus** — Sofort-Feedback bei richtigen Antworten, 2nd-Chance-Dialog bei falschen Antworten
- **Hardcore-Modus** — Strenger Modus ohne Korrekturmöglichkeit (sofortiges Sperren)
- **Settings-Toggle** — Umschaltung zwischen Arcade und Hardcore im StartView
- **Mode-spezifische Speicherung** — Meta-Progress und Quiz-Run getrennt pro Modus (getrennte localStorage-Keys)

#### Quiz & Lernen
- **Staged Loading** für Quiz-Daten — 420KB monolithische JSON aufgeteilt in:
  - `quiz_meta.json` (28KB): Meta-Daten + Fragen-Index (sofort geladen)
  - 6 Bereichs-Chunks in `data/bereiche/` (lazy geladen bei Quiz-Start)
  - `quizLoader.ts`: Cache, paralleles Laden, Fallback auf Hintergrund-Load
- **Meta-Progression** — Persistentes Lern-Tracking über alle Sessions:
  - `correctStreak`: 3× richtig = Frage gemeistert
  - `bestStreak`, `currentStreak`, `totalRuns`
  - Pro-Bereich-Fortschrittsbalken im StartView
- **Comprehensive Meta-Progress-Box** — Klappbare Statistik-Übersicht im Hauptmenü

#### UI / UX
- **Responsive Design** — Touch-optimierte Targets (min. 44px), flexible Grids, reduzierte Padding auf kleinen Screens
- **Accessibility** — ARIA-Labels, Roles (radiogroup/checkbox), aria-expanded/aria-live, focus-visible Rings, vollständige Tastatur-Navigation
- **Sidebar-Navigation** — Fest oben links verankert, konsistent über alle Views
- **Klappbare Falsche-Antworten** — In ProgressView ein-/ausklappbar mit Sprung-zu-Frage Links
- **Schnellnavigation** — Kachel-Grid zum Sprung zwischen Fragen im Quiz

#### Testing
- **32 Unit-Tests** — Abdeckung für `useQuizRun`, `useMetaProgress`, `quizLoader`, `useSettings`
- **Vitest + jsdom** — Test-Infrastruktur mit localStorage-Mock

#### Projekt & Workflow
- **AGENTS.md** — Projekt-Kontext, Tech-Stack, Coding-Conventions, Git-Workflow
- **ROADMAP.md** — Klare Planung mit GitHub Issues als einzige Quelle der Wahrheit
- **Lazy Loading** — Quiz-Daten on-demand statt monolithisch

### Fixed
- `useQuiz.starteQuiz()` navigierte bei fehlenden Daten in leere QuizView
- Globale Variablen `gem`/`pct` in StartView.tsx korrigiert

### Changed
- `vite.config.ts`: `host: '0.0.0.0'` für DevContainer-Kompatibilität

---

## [0.0.0] – 2026-04-20

### Added
- Initiale Projekt-Einrichtung
- Vite 7 + React 19 + TypeScript 5.9 + Tailwind CSS 3.4 Stack
- shadcn/ui Komponenten-Bibliothek
- Quiz-Run mit Session-Persistenz (localStorage)
- Meta-Progression mit Streak-System (3× richtig = gemeistert)
- 6 Bereiche: Biologie, Gewässerkunde, Gewässerpflege, Fanggeräte & Methoden, Recht, Bilderkennung
- 1052 Prüfungsfragen aus dem Bayerischen Fragenkatalog (Stand 11.03.2026)
