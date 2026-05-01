# Architecture — Fisherman's Quiz

## Layer Overview

```
Views (React)
  ├─ Components (UI primitives, game-menu, quiz chrome)
  ├─ Hooks (orchestration: useQuiz, useGameMenu, useKeyboardShortcuts, useTutorialRun)
  │     └─ Stores (React state + persistence)
  │          ├─ Engine (pure state transitions)
  │          ├─ Modes (policy objects)
  │          └─ Persistence (adapter layer)
  └─ Utils (quizLoader, filter, srs, topicLocks, csvExport)
```

## Quiz Data Flow

1. **Staged Loading** — `loadQuizMeta` (~360 bytes) loads immediately so `StartView` renders. `loadAllQuizData` (~420 KB) loads in background. If user starts faster, `buildQuizData` loads on-demand (`src/utils/quizLoader.ts`).
2. `StartView` selects topics → `useQuiz.starteQuiz()` (`src/hooks/useQuiz.ts`).
3. `starteQuiz` validates locks via the active `ModePolicy.canStartTopic`, loads `QuizData` (build or cache), applies optional filters (`favorites`, `weak`, `srs-due`), then calls `run.starteRun()` (`src/store/quizRun.ts`).
4. `starteRun` delegates to `RunEngine.createRun` or `RunEngine.extendRun` (`src/engine/runEngine.ts`), shuffles questions (Fisher-Yates), optionally builds `answerShuffle`, and persists via `usePersistentStatePerMode` + `runAdapter`.
5. `QuizView` renders `aktiveFragen` — a `useMemo` that calls `selectActiveQuestions(run, quizData)` (`src/engine/runSelectors.ts`) and applies the shuffle map.
6. User clicks an answer → `QuizView.handleAnswerClick` → `useQuiz.beantworteFrage` (`src/hooks/useQuiz.ts`).
7. `beantworteFrage` calls:
   - `run.beantworteFrage(frageId, antwort)` — delegates to `RunEngine.answerQuestion`.
   - `meta.recordAnswer(frageId, isCorrect)` — updates per-question stats.
   - `srs.recordAnswer(frageId, quality)` — updates SRS state.
   - The active `ModePolicy.onAnswer` computes mode-specific effects (e.g., hardcore immediate-fail, arcade star thresholds) which `useQuiz` applies to `meta`.
8. `logRunIfComplete` fires when every question has an entry in `run.antworten`, logs a `HistoryEntry`, and marks the run `completedAt`.
9. All stores auto-persist via `usePersistentState` / `usePersistentStatePerMode` hooks through typed adapters (`src/utils/persistence/`).

### Flashcard Flow

1. `StartView` can start a `flashcard` session via `sessionType: 'flashcard'`.
2. `QuizView` renders in flashcard mode: no multiple-choice grid, user reveals answer, then self-assesses (`again` | `hard` | `good` | `easy`).
3. `useQuiz.beantworteFlashcard(frageId, grade)`:
   - Stores the correct answer in the run.
   - Stores `selfAssessments` via `RunEngine.selfAssess`.
   - Updates `meta` and `srs` via `srs.recordSelfAssessment`.
   - `logRunIfComplete` checks both `antworten` and `selfAssessments` are complete.

### Hook Integration Points

- `useFavorites` — consumed by `StartView` (filter toggle), `BrowseView` (mastery filter), and `QuizCardShell` (heart icon). `starteQuiz` can filter the pool to favorites only.
- `useNotes` — consumed by `QuizCardShell` (per-question text note). No influence on quiz flow.
- `useHistory` — written by `logRunIfComplete` / `logCurrentRun`. Read by `HistoryView`.
- `useSRS` — written by `beantworteFrage` / `beantworteFlashcard`. Read by `StartView` (due count badge), `BrowseView` (mastery filter), and SRS-aware mastery checks.
- `useGameMenu` — stack-based overlay menu with keyboard navigation. Consumed by `QuizView` (in-game menu) and `StartView`.
- `useKeyboardShortcuts` — global keydown handler for `1/2/3`, arrows, `F`, `?`, `Space`, `Enter`, `Escape`. Skips when focus is on input elements.
- `useTutorialRun` — isolated quiz run for the `HelpView` tutorial demo. Loads demo questions, no persistence.

## State Partitioning

| Domain | Key Pattern | Content | Lifecycle |
|--------|-------------|---------|-----------|
| Session | `fmq:run:<mode>:v2` | `QuizRun` — active question IDs, answers, shuffle map, index, `sessionType`, `selfAssessments` | Created on start, wiped on completion |
| Persistent progress | `fmq:meta:<mode>:v2` | `MetaProgression` — per-question stats, topic locks, exam meta, arcade stars | Survives across sessions |
| Global user data | `fmq:favorites:v1`<br>`fmq:notes:v1`<br>`fmq:history:v1`<br>`fmq:meta:srs:v1` | Cross-mode data shared by all game modes | Never reset on mode switch |
| App settings | `fmq:settings:v1` | `AppSettings` — `gameMode`, `shuffleAnswers`, backup reminders | Loaded once at boot |

## Game Mode Policies

Mode-specific rules live in `src/modes/` as pure policy objects. `useQuiz` delegates to the active policy via `MODE_POLICIES[gameMode]`.

| Mode | Policy | Key Behaviours |
|------|--------|----------------|
| **Arcade** | `ArcadePolicy` | Allows topic removal mid-run. `onAnswer` computes per-topic star ratings (1–3) on completion. No timer. `canRemoveTopic = true`. |
| **Hardcore** | `HardcorePolicy` | `onAnswer` immediately fails a topic on any wrong answer. `onAbort` / `onModeSwitch` fail all loaded topics. Topic locks require 3 consecutive passes to unlock. `canRemoveTopic = false`. |
| **Exam** | `ExamPolicy` | Fixed 60-question pool, 3600-second timer. `hideFeedback = true`. `allowsPendingRetry = false`. `onComplete` computes pass/fail at ≥60%. `canRemoveTopic = false`. |

Policies implement `ModePolicy` with hooks: `onAnswer`, `onAbort`, `onComplete`, `onModeSwitch`, `canStartTopic`, `canRemoveTopic`, `getStartLimit`, `getDurationSeconds`, plus flags `hideFeedback` and `allowsPendingRetry`.

Topic lock logic is delegated to `canSelectTopic` in `src/utils/topicLocks.ts`.

## Engine Layer

`src/engine/` contains pure, deterministic state transitions with zero React dependencies.

- **`runEngine.ts`** — `createRun`, `extendRun`, `answerQuestion`, `selfAssess`, `nextQuestion`, `prevQuestion`, `jumpToQuestion`, `removeTopicFromRun`, `restartRun`, `interruptRun`, `completeRun`, `isRunExpired`, `detectInconsistency`, `purgeMissingQuestions`.
- **`runSelectors.ts`** — `selectActiveQuestions`, `selectStatistics`.

`useQuizRun` (`src/store/quizRun.ts`) is a thin React wrapper: it holds state via `usePersistentStatePerMode`, delegates all mutations to `RunEngine`, exposes memoised selectors, and auto-purges missing questions on data updates (Issue #17).

## Persistence Adapters

`src/utils/persistence/` provides typed, testable adapters over `localStorage` (or `memoryAdapter` in tests).

| Adapter | Purpose |
|---------|---------|
| `localStorageAdapter` | Raw get/set/clear over `localStorage` |
| `createRunAdapter` | Zod-validated `QuizRun` persistence per mode |
| `createMetaAdapter` | Zod-validated `MetaProgression` persistence |
| `createSettingsAdapter` | Zod-validated `AppSettings` |
| `createHistoryAdapter` | Zod-validated `HistoryEntry[]` |
| `createSRSAdapter` | Zod-validated `SRSMeta` map |
| `createFavoritesAdapter` | String array persistence |
| `createNotesAdapter` | Record persistence |

`usePersistentState` / `usePersistentStatePerMode` (`src/hooks/usePersistentState.ts`) sync React state to storage with adapter-validated round-trips.

## Game Menu System

`src/components/game-menu/` implements a stack-based overlay menu navigable by keyboard (arrows, Enter, Escape).

- `menuConfig.ts` — defines `MenuPageId` and page registry.
- `useGameMenu.ts` — hook managing `isOpen`, page stack, `direction` (forward/back), and `focusedIndex`.
- Pages: `root`, `data`, `list`, `navigation`, `runActions`, `settings`.
- Used in `QuizView` (in-game pause menu) and `StartView`.

## Keyboard Shortcuts

`useKeyboardShortcuts` (`src/hooks/useKeyboardShortcuts.ts`) attaches a global `keydown` listener. Ignores events when focus is on `INPUT`, `TEXTAREA`, `SELECT`, or `contenteditable`.

| Key | Action |
|-----|--------|
| `1` / `2` / `3` | Select first / second / third answer button |
| `←` / `→` | Previous / next question |
| `Enter` | Next question |
| `Space` | Reveal answer (flashcard) or trigger primary action |
| `F` | Toggle favorite |
| `?` | Open cheat sheet |
| `Escape` | Close modals / pop menu |

## Data Loading & Filtering

- **`quizLoader.ts`** — Staged loading with Zod schemas (`FrageSchema`, `QuizMetaSchema`, `TopicDataSchema`). Builds `QuizData` from lazy-loaded per-topic JSON files under `public/data/topics/`.
- **`filter.ts`** — `filterFragen` (text, topic, image, favorite, mastery), `filterQuizDataByFavorites`, `filterQuizDataByWeakness`, `filterQuizDataBySRSDue`.
- **`quizShuffle.ts`** — Fisher-Yates question shuffle + per-question answer shuffle with permutation tracking.
- **`csvExport.ts`** — Export history or filtered question sets to CSV.

## Backup & Import

`useQuiz` exposes `exportFullBackup` and `importFullBackup` for full app state snapshot/restore as JSON. Includes settings, all mode metas, favorites, notes, history, and SRS. Triggered manually or via periodic backup reminder (7-day interval).

## Shuffle Implementation Note

`shuffleAnswers` in `src/utils/quizShuffle.ts` returns a new `Frage` and an `order` array that records the permutation. At run creation an `answerShuffle` map is built: `{ [frageId]: order }`. The `aktiveFragen` derived list applies this map by remapping both `antworten` and `richtige_antwort`. Because the correct text is tracked to its new key, the existing correctness check (`antworten[id] === frage.richtige_antwort`) works unchanged.

## Why localStorage

Static hosting on GitHub Pages → no backend. Offline-first by default. All persistence is client-side JSON in `localStorage`. Topic data lives in lazy-loaded JSON files under `public/data/`.
