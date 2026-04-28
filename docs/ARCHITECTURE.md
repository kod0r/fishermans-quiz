# Architecture — Fisherman's Quiz

## Quiz Data Flow

1. `StartView` selects topics → `useQuiz.starteQuiz()` (`src/hooks/useQuiz.ts:230`).
2. `starteQuiz` validates locks (`canSelectTopic`), loads `QuizData` (`buildQuizData` or cache), applies optional filters (`favorites`, `weak`, `srs-due`), then calls `run.starteRun()` (`src/store/quizRun.ts:20`).
3. `starteRun` creates a `QuizRun` object, shuffles questions (Fisher-Yates), optionally builds `answerShuffle`, and persists via `RunStorage.save()` (`src/utils/storage.ts:131`).
4. `QuizView` renders `aktiveFragen` (`src/store/quizRun.ts:293`) — a `useMemo` that maps `frageIds` to real questions and applies the shuffle map.
5. User clicks an answer → `QuizView.handleAnswerClick` → `useQuiz.beantworteFrage` (`src/hooks/useQuiz.ts:186`).
6. `beantworteFrage` calls:
   - `run.beantworteFrage(frageId, antwort)` — writes to `run.antworten`.
   - `meta.recordAnswer(frageId, isCorrect)` — updates per-question stats.
   - `srs.recordAnswer(frageId, quality)` — updates SRS state.
7. `logRunIfComplete` fires when every question has an entry in `run.antworten`, logs a `HistoryEntry`, and marks the run `completedAt`.
8. All stores auto-persist to `localStorage` in their respective `useEffect` hooks.

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

## Game Mode Differences

**Arcade** — `pendingWrongAnswer` allows one retry per question (`src/views/QuizView.tsx:147`). Topics can be added mid-run. On completion each topic gets a star rating (1–3) based on accuracy (`src/store/metaProgress.ts:128`).

**Hardcore** — A single wrong answer fails the entire topic. `meta.recordTopicResult(topicId, false)` locks the topic; unlocking requires 3 consecutive passes (`src/store/metaProgress.ts:74`). No retries.

**Exam** — Fixed pool of 60 questions, 60-minute timer (`src/views/QuizView.tsx:61`). No feedback until submit. 60% score required to pass. Result stored in `examMeta` (`src/store/metaProgress.ts:112`).

## Shuffle Implementation Note

`shuffleAnswers` in `src/utils/quizShuffle.ts` returns a new `Frage` and an `order` array that records the permutation. At run creation (`src/store/quizRun.ts:72`) an `answerShuffle` map is built: `{ [frageId]: order }`. The `aktiveFragen` derived list (`src/store/quizRun.ts:293`) applies this map by remapping both `antworten` and `richtige_antwort`. Because the correct text is tracked to its new key, the existing correctness check (`antworten[id] === frage.richtige_antwort`) works unchanged.

## Why localStorage

Static hosting on GitHub Pages → no backend. Offline-first by default. All persistence is client-side JSON in `localStorage`. Topic data lives in lazy-loaded JSON files under `public/data/`.
