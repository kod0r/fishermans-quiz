# Fisherman's Quiz — Brain-Dump

## 1. Project Overview

Fisherman's Quiz ist eine browserbasierte Web-App zur Vorbereitung auf die staatliche Fischerprüfung (Bayerischer Fragenkatalog, Stand: 11.03.2026). Die App zeigt Multiple-Choice-Fragen aus sechs Themenbereichen an, verfolgt den Lernfortschritt über Sessions hinweg und bietet zwei Spielmodi (Arcade / Hardcore). Es gibt kein Backend — die App ist ein reiner Static-Site-Client mit JSON-Daten und localStorage-Persistenz.

## 2. Tech Stack & Versions

| Layer | Technologie | Version (repo-copy) | Version (working copy) |
|-------|-------------|---------------------|------------------------|
| Framework | React | ^19.2.0 | ^19.2.0 |
| Bundler | Vite | ^7.2.4 | ^8.0.9 |
| React-Plugin | @vitejs/plugin-react | ^5.1.1 | ^6.0.1 |
| Language | TypeScript | ~5.9.3 | ~5.9.3 |
| Styling | Tailwind CSS | ^3.4.19 | ^3.4.19 |
| Animation | tailwindcss-animate | (latest) | (latest) |
| UI Library | shadcn/ui (Radix primitives) | various ^1.x | various ^1.x |
| Icons | lucide-react | (latest) | (latest) |
| Validation | zod | (latest) | (latest) |
| Router | react-router (BrowserRouter) | (latest) | (latest) |
| Themes | next-themes | (latest) | (latest) |
| Testing | vitest | ^4.1.4 | ^4.1.4 |
| Testing | @testing-library/react + jest-dom | (latest) | (latest) |
| Linting | ESLint | ^9.39.1 | ^10.2.1 |
| Dev Plugin | kimi-plugin-inspect-react | ^1.0.3 | REMOVED |
| Charts | recharts | (latest) | (latest) |
| Toasts | sonner | (latest) | (latest) |
| Drawer | vaul | (latest) | (latest) |

**Wichtiger Hinweis:** `kimi-plugin-inspect-react@1.0.3` hat `peer vite@"^7.2.0"` — das blockiert ein Upgrade auf Vite 8. In der Working-Copy (alle PRs ab #43) wurde das Plugin entfernt, ESLint auf v10 und Vite auf v8 gehoben.

## 3. Architecture & Design Patterns

- **Single-Page-App (SPA)** mit `BrowserRouter` — der Router wird aktuell nur als Wrapper genutzt, interne Navigation läuft über einen eigenen View-State (`AppView = 'start' | 'quiz' | 'progress'`).
- **Custom-Hook-Architektur** statt externer State-Libraries (kein Redux, kein Zustand). State lebt in drei Store-Hooks (`useQuizRun`, `useMetaProgress`, `useSettings`), die jeweils `localStorage` syncen.
- **Orchestrator-Pattern:** `useQuiz` in `src/hooks/useQuiz.ts` agiert als zentraler Controller. Er lädt Metadaten, koordiniert Lazy-Loading der Fragen, synchronisiert Run + Meta bei Antworten und exponiert ein einheitliches `QuizContext`.
- **Staged Loading:** Beim App-Start wird zuerst nur `quiz_meta.json` (~360 Bytes) geladen → App wird sofort nutzbar. Alle Fragen (~420 KB) werden danach im Hintergrund nachgeladen. Falls der User schneller ist, wird on-demand geladen.
- **Runtime-Validierung** aller geladenen JSON-Daten via Zod-Schemas (`FrageSchema`, `QuizMetaSchema`, `BereichDataSchema`).
- **Dunkles Theme als Default:** `:root` und `.dark` verwenden identische dunkle HSL-Werte. Das ist beabsichtigt — es gibt keinen Light-Mode.

## 4. Key Features & Logic

### Spielmodi
| Modus | Kennzeichen | Verhalten bei falscher Antwort |
|-------|-------------|-------------------------------|
| **Arcade** | Amber-Badge | Sofort-Feedback, "Sicher?"-Dialog (2nd-Chance). Erst bei Bestätigung wird die Antwort als falsch gespeichert. |
| **Hardcore** | Red-Badge | Antwort wird sofort gespeichert (kein Zurück, keine 2nd-Chance). |

### Quiz-Run (Session)
- Fragen werden beim Start per **Fisher-Yates-Shuffle** gemischt.
- Aktive Runs können um neue Bereiche erweitert werden (ohne bestehende Fragen zu verlieren).
- Navigation: Vorwärts, Rückwärts, Schnellnavigation (Fragen-Grid).
- Unterbrechung möglich — der Run bleibt in `localStorage` erhalten und kann fortgesetzt werden.
- Daten-Inkonsistenz-Check (Issue #17): Wenn Fragen aus dem Katalog entfernt werden, werden sie automatisch aus dem Run bereinigt.

### Meta-Progression (Persistent)
- Pro Frage: `attempts`, `correctStreak`, `lastResult`, `firstSeen`, `lastAttempt`
- **"Gemeistert"** = `correctStreak >= 3`
- **"In Lernung"** = `attempts > 0 && correctStreak < 3`
- Globale Stats: `totalRuns`, `totalQuestionsAnswered`, `totalCorrect`, `totalIncorrect`, `bestStreak`, `currentStreak`
- Storage ist **modus-separiert** (arcade/hardcore haben getrennte Keys).

### Legacy-Migration
- Beim ersten App-Start werden alte `fmq:run:v2` / `fmq:meta:v2` Keys in Arcade-Mode-Keys migriert.

## 5. State Management

### Store-Hooks (direkt in `localStorage`)

```
useQuizRun(quizData, gameMode)
├── RunStorage.load(gameMode)  →  fmq:run:{mode}:v2
├── state: QuizRun | null
├── actions: starteRun, beantworteFrage, naechsteFrage, vorherigeFrage, springeZuFrage, unterbrecheRun
└── derived: aktiveFragen, aktuelleFrage, statistiken

useMetaProgress(gameMode)
├── MetaStorage.load(gameMode)  →  fmq:meta:{mode}:v2
├── state: MetaProgression
├── actions: recordAnswer, recordRunStart, reset
└── derived: meisterCount, lernCount, getFrageMeta

useSettings()
├── SettingsStorage.load()  →  fmq:settings:v1
├── state: AppSettings
└── actions: setGameMode
```

### Orchestrator: `useQuiz`
- Bündelt alle drei Stores + View-State + Lazy-Loading-Logik.
- Exponiert `QuizContext` als ReturnType — alle Views bekommen ein einziges Objekt.
- `beantworteFrage` schreibt **synchron** in Run und Meta.

## 6. Routing & Navigation

| Interner View | Bedingung | Komponente |
|---------------|-----------|------------|
| `start` | Default / kein aktiver Run | `StartView` |
| `quiz` | `isActive && currentView === 'quiz'` | `QuizView` |
| `progress` | `isActive && currentView === 'progress'` | `ProgressView` |

- **Kein URL-Routing** für Views — die `BrowserRouter`-Wrappung ist historisch/forward-compatibel, wird aber aktuell nicht für View-Routing genutzt.
- Navigation erfolgt via `goToView('start' | 'quiz' | 'progress')`.
- Sidebar (fixed links oben) zeigt bedingte Buttons: Home (immer), Resume (nur auf Start wenn aktiv), Progress (nur auf Quiz wenn aktiv).

## 7. Component Hierarchy

```
BrowserRouter
└── StrictMode
    └── App (useQuiz — Orchestrator)
        ├── Sidebar (fixed nav buttons)
        │   ├── HomeButton
        │   ├── ResumeButton (conditional)
        │   └── ProgressButton (conditional)
        ├── StartView (default)
        │   ├── Meta-Progress Card (collapsible)
        │   ├── GameMode Toggle Card
        │   └── Area Selection Card
        │       └── AreaItem (×6)
        ├── QuizView
        │   ├── TopBar (mode badge + stats + stop)
        │   ├── ProgressBar
        │   ├── QuestionBox
        │   │   ├── AreaBadge
        │   │   ├── QuestionText
        │   │   ├── Image (conditional)
        │   │   ├── AnswerButtons (A/B/C)
        │   │   ├── Pending-Wrong Dialog (Arcade only)
        │   │   └── Correct-Answer reveal
        │   ├── Navigation (Back/Next)
        │   └── Schnellnavigation (collapsible grid)
        └── ProgressView
            ├── Result Card (pass/fail, 60% threshold)
            ├── Per-Area Breakdown
            ├── Wrong Answers List (collapsible)
            └── Unanswered List (collapsible)
```

## 8. Data Flow & API/Storage

### Datenquellen
| Quelle | Format | Größe | Ladestrategie |
|--------|--------|-------|---------------|
| `data/quiz_meta.json` | QuizMeta | ~360 B | Sofort (App-Start) |
| `data/bereiche/*.json` | BereichData[] | ~420 KB gesamt | Lazy / Background |

### Bereichs-Dateien
```
data/bereiche/
├── biologie.json
├── gewaesserkunde.json
├── gewaesserpflege.json
├── fanggeraete_und__methoden.json
├── recht.json
└── bilderkennung.json
```

### localStorage Keys
```
fmq:settings:v1          → AppSettings
fmq:run:arcade:v2        → QuizRun (Arcade)
fmq:run:hardcore:v2      → QuizRun (Hardcore)
fmq:meta:arcade:v2       → MetaProgression (Arcade)
fmq:meta:hardcore:v2     → MetaProgression (Hardcore)
```

### Datenfluss beim Beantworten
```
User klickt Antwort
    → QuizView.handleAnswerClick
    → useQuiz.beantworteFrage
        → useQuizRun.beantworteFrage (setState + localStorage)
        → useMetaProgress.recordAnswer (setState + localStorage)
    → React re-render
```

## 9. Testing Strategy

| Testdatei | Was wird getestet |
|-----------|-------------------|
| `src/test/useQuiz.test.ts` | Orchestrator-Hook: Laden, Starten, Beantworten, View-Wechsel |
| `src/test/quizRun.test.ts` | useQuizRun: Starten, Erweitern, Navigieren, Unterbrechen, Inkonsistenzbereinigung |
| `src/test/metaProgress.test.ts` | useMetaProgress: recordAnswer, Streak-Logik, Reset, meisterCount/lernCount |
| `src/test/settings.test.ts` | useSettings: Laden, Modus-Wechsel, Legacy-Migration |
| `src/test/storage.test.ts` | Storage-Utils: loadJson, saveJson, Fehlerbehandlung, QuotaExceeded |
| `src/test/quizLoader.test.ts` | quizLoader: Meta-Laden, Bereichs-Laden, Cache-Verhalten, Zod-Validierung |

### Test-Setup (`src/test/setup.ts`)
- `@testing-library/jest-dom` matchers
- `localStorage` Mock (In-Memory-Store)
- `fetch` Mock (URL → Response-Mapping via `fetchMock`)
- `afterEach`: cleanup + localStorage.clear + fetchMock.clear

### Vitest-Konfiguration
- Via `vite.config.ts` (keine separate `vitest.config.ts`)
- `test.environment = 'jsdom'`
- `test.globals = true`
- `test.setupFiles = ['./src/test/setup.ts']`

## 10. Build & Deployment

### Scripts
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

### CI/CD (GitHub Actions)
- **Trigger:** Push auf `main`, PRs
- **Jobs:** lint → test → build → deploy (GitHub Pages)
- **Base-URL:** `base: './'` in `vite.config.ts` (notwendig für GitHub Pages)

### Bekannte Build-Probleme & Fixes
| Problem | Ursache | Fix |
|---------|---------|-----|
| Vite 8 Peer-Dep-Fehler | `kimi-plugin-inspect-react` erfordert Vite 7 | Plugin entfernen (PR #43) |
| CSS-Minify-Fehler | lightningcss (Vite 8 Default) kann Tailwind-Nested-Vars nicht parsen | `build.cssMinify: 'esbuild'` in Vite 8 Config |
| ESLint `set-state-in-effect` | Neue Regel in eslint-plugin-react-hooks 7.1.1 | `'react-hooks/set-state-in-effect': 'off'` |

---

*Letzte Aktualisierung: 2026-04-20*
