# Architecture — Fisherman's Quiz

## Layer Overview

```
Views (React)
  └─ Hooks (orchestration)
       └─ Stores (React state + persistence)
            ├─ Engine (pure state transitions)
            ├─ Modes (policy objects)
            └─ Persistence (adapters)
```

## Quiz Data Flow

1. `StartView` selects topics → `useQuiz.starteQuiz()` (`src/hooks/useQuiz.ts`).
2. `starteQuiz` validates locks via the active `ModePolicy.canStartTopic`, loads `QuizData` (`buildQuizData` or cache), applies optional filters (`favorites`, `weak`, `srs-due`), then calls `run.starteRun()` (`src/store/quizRun.ts`).
3. `starteRun` delegates to `RunEngine.createRun` or `RunEngine.extendRun` (`src/engine/runEngine.ts`), shuffles questions (Fisher-Yates), optionally builds `answerShuffle`, and persists via `usePersistentStatePerMode` + `runAdapter`.
4. `QuizView` renders `aktiveFragen` — a `useMemo` that calls `selectActiveQuestions(run, quizData)` (`src/engine/runSelectors.ts`) and applies the shuffle map.
5. User clicks an answer → `QuizView.handleAnswerClick` → `useQuiz.beantworteFrage` (`src/hooks/useQuiz.ts`).
6. `beantworteFrage` calls:
   - `run.beantworteFrage(frageId, antwort)` — delegates to `RunEngine.answerQuestion`.
   - `meta.recordAnswer(frageId, isCorrect)` — updates per-question stats.
   - `srs.recordAnswer(frageId, quality)` — updates SRS state.
   - The active `ModePolicy.onAnswer` computes mode-specific effects (e.g., hardcore immediate-fail, arcade star thresholds) which `useQuiz` applies to `meta`.
7. `logRunIfComplete` fires when every question has an entry in `run.antworten`, logs a `HistoryEntry`, and marks the run `completedAt`.
8. All stores auto-persist via `usePersistentState` / `usePersistentStatePerMode` hooks.

### Hook Integration Points

- `useFavorites` — consumed by `StartView` (filter toggle) and `QuizCardShell` (heart icon). `starteQuiz` can filter the pool to favorites only.
- `useNotes` — consumed by `QuizCardShell` (per-question text note). No influence on quiz flow.
- `useHistory` — written by `logRunIfComplete` / `logCurrentRun`. Read by `HistoryView`.
- `useSRS` — written by `beantworteFrage` / `beantworteFlashcard`. Read by `StartView` (due count badge) and SRS-aware mastery checks.

## State Partitioning

| Domain | Key Pattern | Content | Lifecycle |
|--------|-------------|---------|-----------|
| Session | `fmq:run:<mode>:v2` | `QuizRun` — active question IDs, answers, shuffle map, index | Created on start, wiped on completion |
| Persistent progress | `fmq:meta:<mode>:v2` | `MetaProgression` — per-question stats, topic locks, exam meta, arcade stars | Survives across sessions |
| Global user data | `fmq:favorites:v1`<br>`fmq:notes:v1`<br>`fmq:history:v1`<br>`fmq:meta:srs:v1` | Cross-mode data shared by all game modes | Never reset on mode switch |
| App settings | `fmq:settings:v1` | `AppSettings` — `gameMode`, `shuffleAnswers`, backup reminders | Loaded once at boot |

## Game Mode Policies

Mode-specific rules live in `src/modes/` as pure policy objects. `useQuiz` delegates to the active policy via `MODE_POLICIES[gameMode]`.

| Mode | Policy | Key Behaviours |
|------|--------|----------------|
| **Arcade** | `ArcadePolicy` | Allows topic removal mid-run. `onAnswer` computes per-topic star ratings (1–3) on completion. No timer. |
| **Hardcore** | `HardcorePolicy` | `onAnswer` immediately fails a topic on any wrong answer. `onAbort` / `onModeSwitch` fail all loaded topics. Topic locks require 3 consecutive passes to unlock. |
| **Exam** | `ExamPolicy` | Fixed 60-question pool, 3600-second timer. `hideFeedback = true`. `onComplete` computes pass/fail at ≥60%. |

Policies implement `ModePolicy` with hooks: `onAnswer`, `onAbort`, `onComplete`, `onModeSwitch`, `canStartTopic`, `canRemoveTopic`, `getStartLimit`, `getDurationSeconds`.

## Engine Layer

`src/engine/` contains pure, deterministic state transitions with zero React dependencies.

- **`runEngine.ts`** — `createRun`, `extendRun`, `answerQuestion`, `selfAssess`, `nextQuestion`, `prevQuestion`, `jumpToQuestion`, `removeTopicFromRun`, `restartRun`, `interruptRun`, `completeRun`, `detectInconsistency`, `purgeMissingQuestions`.
- **`runSelectors.ts`** — `selectActiveQuestions`, `selectStatistics`.

`useQuizRun` (`src/store/quizRun.ts`) is a thin React wrapper: it holds state via `usePersistentStatePerMode`, delegates all mutations to `RunEngine`, and exposes memoised selectors.

## Shuffle Implementation Note

`shuffleAnswers` in `src/utils/quizShuffle.ts` returns a new `Frage` and an `order` array that records the permutation. At run creation an `answerShuffle` map is built: `{ [frageId]: order }`. The `aktiveFragen` derived list applies this map by remapping both `antworten` and `richtige_antwort`. Because the correct text is tracked to its new key, the existing correctness check (`antworten[id] === frage.richtige_antwort`) works unchanged.

## Why localStorage

Static hosting on GitHub Pages → no backend. Offline-first by default. All persistence is client-side JSON in `localStorage`. Topic data lives in lazy-loaded JSON files under `public/data/`.
