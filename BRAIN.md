# Fisherman's Quiz — Brain-Dump

## 1. Project Overview

Fisherman's Quiz is a browser-based web app for preparing for the state fishing exam (Bavarian question catalog, as of: 11.03.2026). The app displays multiple-choice questions from six subject areas, tracks learning progress across sessions, and offers two game modes (Arcade / Hardcore). There is no backend — the app is a pure static-site client with JSON data and localStorage persistence.

## 2. Tech Stack & Versions

| Layer | Technology | Version (repo-copy) | Version (working copy) |
|-------|------------|---------------------|------------------------|
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

**Important Note:** `kimi-plugin-inspect-react@1.0.3` has `peer vite@"^7.2.0"` — this blocks an upgrade to Vite 8. In the working copy (all PRs from #43 onward) the plugin was removed, ESLint bumped to v10 and Vite bumped to v8.

## 3. Architecture & Design Patterns

- **Single-Page-App (SPA)** with `BrowserRouter` — the router is currently only used as a wrapper, internal navigation runs via a custom view state (`AppView = 'start' | 'quiz' | 'progress'`).
- **Custom-Hook architecture** instead of external state libraries (no Redux, no Zustand). State lives in three store hooks (`useQuizRun`, `useMetaProgress`, `useSettings`), each syncing to `localStorage`.
- **Orchestrator-Pattern:** `useQuiz` in `src/hooks/useQuiz.ts` acts as a central controller. It loads metadata, coordinates lazy-loading of questions, synchronizes Run + Meta on answers, and exposes a unified `QuizContext`.
- **Staged Loading:** At app startup, only `quiz_meta.json` (~360 bytes) is loaded first → the app becomes usable immediately. All questions (~420 KB) are then loaded in the background. If the user is faster, on-demand loading occurs.
- **Runtime validation** of all loaded JSON data via Zod schemas (`FrageSchema`, `QuizMetaSchema`, `BereichDataSchema`).
- **Dark theme as default:** `:root` and `.dark` use identical dark HSL values. This is intentional — there is no light mode.

## 4. Key Features & Logic

### Game Modes
| Mode | Badge | Behavior on wrong answer |
|------|-------|--------------------------|
| **Arcade** | Amber-Badge | Instant feedback, "Sure?"-dialog (2nd chance). Only upon confirmation is the answer saved as wrong. |
| **Hardcore** | Red-Badge | Answer is saved immediately (no going back, no 2nd chance). |

### Quiz-Run (Session)
- Questions are shuffled at startup using **Fisher-Yates shuffle**.
- Active runs can be extended with new areas (without losing existing questions).
- Navigation: Forward, Backward, Quick Navigation (question grid).
- Interruption possible — the run persists in `localStorage` and can be resumed.
- Data inconsistency check (Issue #17): When questions are removed from the catalog, they are automatically cleaned from the run.

### Meta-Progression (Persistent)
- Per question: `attempts`, `correctStreak`, `lastResult`, `firstSeen`, `lastAttempt`
- **"Mastered"** = `correctStreak >= 3`
- **"Learning"** = `attempts > 0 && correctStreak < 3`
- Global stats: `totalRuns`, `totalQuestionsAnswered`, `totalCorrect`, `totalIncorrect`, `bestStreak`, `currentStreak`
- Storage is **mode-separated** (arcade/hardcore have separate keys).

### Legacy-Migration
- On first app start, old `fmq:run:v2` / `fmq:meta:v2` keys are migrated to arcade-mode keys.

## 5. State Management

### Store-Hooks (directly in `localStorage`)

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
- Bundles all three stores + view state + lazy-loading logic.
- Exposes `QuizContext` as ReturnType — all views receive a single object.
- `beantworteFrage` writes **synchronously** to Run and Meta.

## 6. Routing & Navigation

| Internal View | Condition | Component |
|---------------|-----------|-----------|
| `start` | Default / no active run | `StartView` |
| `quiz` | `isActive && currentView === 'quiz'` | `QuizView` |
| `progress` | `isActive && currentView === 'progress'` | `ProgressView` |

- **No URL routing** for views — the `BrowserRouter` wrapping is historical/forward-compatible, but is currently not used for view routing.
- Navigation happens via `goToView('start' | 'quiz' | 'progress')`.
- Sidebar (fixed links at top) shows conditional buttons: Home (always), Resume (only on start when active), Progress (only on quiz when active).

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

### Data Sources
| Source | Format | Size | Loading Strategy |
|--------|--------|------|------------------|
| `data/quiz_meta.json` | QuizMeta | ~360 B | Immediately (app startup) |
| `data/bereiche/*.json` | BereichData[] | ~420 KB total | Lazy / Background |

### Area Files
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

### Data Flow When Answering
```
User clicks answer
    → QuizView.handleAnswerClick
    → useQuiz.beantworteFrage
        → useQuizRun.beantworteFrage (setState + localStorage)
        → useMetaProgress.recordAnswer (setState + localStorage)
    → React re-render
```

## 9. Testing Strategy

| Test File | What is tested |
|-----------|----------------|
| `src/test/useQuiz.test.ts` | Orchestrator-Hook: loading, starting, answering, view switching |
| `src/test/quizRun.test.ts` | useQuizRun: starting, extending, navigating, interrupting, inconsistency cleanup |
| `src/test/metaProgress.test.ts` | useMetaProgress: recordAnswer, streak logic, reset, meisterCount/lernCount |
| `src/test/settings.test.ts` | useSettings: loading, mode switching, legacy migration |
| `src/test/storage.test.ts` | Storage-Utils: loadJson, saveJson, error handling, QuotaExceeded |
| `src/test/quizLoader.test.ts` | quizLoader: meta loading, area loading, cache behavior, Zod validation |

### Test Setup (`src/test/setup.ts`)
- `@testing-library/jest-dom` matchers
- `localStorage` Mock (In-Memory-Store)
- `fetch` Mock (URL → Response-Mapping via `fetchMock`)
- `afterEach`: cleanup + localStorage.clear + fetchMock.clear

### Vitest Configuration
- Via `vite.config.ts` (no separate `vitest.config.ts`)
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
- **Trigger:** Push to `main`, PRs
- **Jobs:** lint → test → build → deploy (GitHub Pages)
- **Base-URL:** `base: './'` in `vite.config.ts` (required for GitHub Pages)

### Known Build Issues & Fixes
| Issue | Cause | Fix |
|-------|-------|-----|
| Vite 8 Peer-Dep Error | `kimi-plugin-inspect-react` requires Vite 7 | Remove plugin (PR #43) |
| CSS Minify Error | lightningcss (Vite 8 default) cannot parse Tailwind nested vars | `build.cssMinify: 'esbuild'` in Vite 8 Config |
| ESLint `set-state-in-effect` | New rule in eslint-plugin-react-hooks 7.1.1 | `'react-hooks/set-state-in-effect': 'off'` |

---

*Last Updated: 2026-04-20*
