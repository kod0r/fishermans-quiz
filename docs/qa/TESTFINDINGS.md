**DO NOT COMMIT THIS DOCUMENT EVER**

# Test Findings — Code QA

> Generated from full-code-qa review.  
> Status: **Fully addressed — archived to `docs/qa/`**

---

## 1. Defects in Existing Tests ✅ DONE

All 7 defects fixed. 299 → 414 tests green.

| #   | File:Line                                                  | Severity | Issue                                                                                                                                                                                                        | Status                                                                                                                                        |
| --- | ---------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/test/quizRun.test.ts:51`                              | Medium   | Shuffle test only asserts that all question IDs are _contained_ in `aktiveFragen`. It never verifies the order actually changed, so it would pass even if shuffle were a no-op.                                    | ✅ Fixed — added `expect(ids).not.toEqual(['1','2','3','4','5','6'])`                                                                         |
| 2   | `src/test/keyboardShortcuts.test.tsx:11`                   | Medium   | `window.removeEventListener('keydown', () => {})` in `beforeEach` is a no-op because the arrow function reference never matches a registered listener. It gives false confidence of cleanup.                       | ✅ Fixed — replaced with capture of real handlers via `addEventListener` spy + `afterEach` removal                                            |
| 3   | `src/test/gameMenuComponents.test.tsx:151`                 | Low      | Asserts on Tailwind CSS `className` (`translate-y-[calc(100%-12px)]`) — an implementation detail. Prefer testing visible behavior or ARIA attributes.                                                              | ✅ Fixed — added `aria-hidden={hidden}` to HUD bar, switched test to assert `aria-hidden` attribute                                           |
| 4   | `src/test/runEngine.test.ts:148` (also 192, 201, 212, 344) | Low      | `ignores second answer` asserts `next === run` (referential equality). This is an implementation detail; if the engine were refactored to always return a new object, the test would fail despite correct behavior. | ✅ Fixed — swapped 5 referential equality asserts (`.toBe(run)`) for deep equality (`.toEqual(run)`)                                          |
| 5   | `src/test/storage.test.ts:82`                              | Low      | `getStorageUsage` test only asserts `used >= 0`, which is trivial and would pass even if the function always returned `0`. The comment in the test acknowledges the mock limitation.                               | ✅ Fixed — enhanced `localStorageMock` with `length` getter and `key()` method; test now asserts deterministic non-zero usage (`used === 20`) |
| 6   | `src/test/modePolicies.test.ts:75`                         | Low      | `ArcadePolicy.onAbort` only tests `shouldLogHistory`; other abort effects are not exercised.                                                                                                                       | ✅ Fixed — added `expect(effect.topicResults).toBeUndefined()`                                                                                |
| 7   | `src/test/modePolicies.test.ts:151`                        | Low      | `HardcorePolicy.onModeSwitch` only tests with `rawRun: null`; the active-run path is untested.                                                                                                                     | ✅ Fixed — added active-run test for `HardcorePolicy.onModeSwitch` with `rawRun` populated                                                    |

---

## 1.5 Persistence Race Condition — FIXED (#272)

**Finding:** `useQuiz.switchGameMode` triggered a race where `usePersistentStatePerMode` save effect fired with the new mode's key but the old mode's run state, corrupting cross-mode localStorage.

**Root cause:** `usePersistentStatePerMode` key-change effect loads from the new key and calls `setState`, clobbering the functional updater queued by `beendeRun()`. The old `shouldSave` guard in `useQuizRun` was bypassed when `gameMode` was missing on runs.

**Fix:** Structural adapter boundary.
- `createRunAdapter(base, currentMode)` blocks cross-mode writes (`run.gameMode !== currentMode` → no-op)
- Auto-injects missing `gameMode` on save
- `useQuizRun` creates mode-aware adapter via `useMemo(() => createRunAdapter(adapter, gameMode), [adapter, gameMode])`
- `switchGameMode` uses same mode-aware adapter for manual saves

**Tests added:**
- `src/test/runAdapter.test.ts` — 8 tests (4 original + cross-mode block, same-mode allow, gameMode injection, undefined passthrough)
- `src/test/quizRun.test.ts` — `rerender({ mode: 'hardcore' })` asserts no cross-mode pollution
- `src/test/useQuiz.test.ts` — integration test: active run → `switchGameMode` → new mode key stays empty

**Status:** ✅ Closed.

---

## 2. Critical Untested Areas ✅ DONE

### 2.1 Stores

- ~~**`src/store/favorites.ts`**~~ — `toggleFavorite`, `isFavorite`, `resetFavorites`, `importFavorites` covered in `src/test/favorites.test.ts` (7 tests).

### 2.2 Hooks

- ~~**`src/hooks/useTutorialRun.ts`**~~ — Covered in `src/test/useTutorialRun.test.ts` (12 tests: init, answer, nav, bounds, end, stats, exam duration, empty/unknown ids).
- ~~**`src/hooks/useQuiz.ts`**~~ — Error paths covered in `src/test/useQuiz.test.ts` `describe('Fehlerpfade')` (4 tests: network fail, non-OK response, invalid meta JSON, `buildQuizData` failure).

### 2.3 Views

Component-level tests added for:

- ~~**`src/views/QuizView.tsx`**~~ — `src/test/QuizView.test.tsx` (9 tests: render, answer click, next/prev, favorite, exam submit button/dialog, keyboard shortcut registration).
- ~~**`src/views/StartView.tsx`**~~ — `src/test/StartView.test.tsx` (6 tests: render topics, select/deselect, start with topics, no-topic error, exam card, mode switch).
- ~~**`src/views/ProgressView.tsx`**~~ — `src/test/ProgressView.test.tsx` (7 tests: pass/fail states, toggle wrong/unanswered, jump to question, favorite toggle, empty wrong message).
- ~~**`src/views/HistoryView.tsx`**~~ — `src/test/HistoryView.test.tsx` (3 tests: empty state, stats render, clear history with confirm mock).
- ~~**`src/views/BrowseView.tsx`**~~ — `src/test/BrowseView.test.tsx` (3 tests: count, search filter, loading state).
- ~~**`src/views/FlashcardView.tsx`**~~ — `src/test/FlashcardView.test.tsx` (7 tests: render, reveal, grade auto-advance, answered state, keyboard shortcuts, favorite, cheat sheet modal).
- ~~**`src/views/HelpView.tsx`**~~ — `src/test/HelpView.test.tsx` (3 tests: landing render, mode switch, demo start calls `setIsTutorialDemoActive`).

### 2.4 Components

- ~~**`AnswerGrid`**~~ — `src/test/AnswerGrid.test.tsx` (7 tests: render, click, selected, correct/wrong feedback, pending badge, disabled, hideFeedback).
- ~~**`QuizCardShell`**~~ — `src/test/QuizCardShell.test.tsx` (7 tests: topic badge, Bilderkennung, favorite toggle, image alt, note hidden/show, note blur).
- ~~**`QuizHeader`**~~ — `src/test/QuizHeader.test.tsx` (8 tests: mode badges, stats aria-label, timer, red timer <5min, progress indicator, zero total).
- ~~**`QuizFooter`**~~ — `src/test/QuizFooter.test.tsx` (4 tests: prev/next disabled at boundaries, pending disables both, click handlers).
- ~~**`CheatSheetModal`**~~ — `src/test/CheatSheetModal.test.tsx` (2 tests: renders shortcuts when open, hidden when closed).
- `HUD`, `MenuItem`, `GameMenuOverlay` already tested.

### 2.5 Engine Edge Cases

- ~~**Timer / duration expiration**~~ — `isRunExpired(run)` helper added to `runEngine.ts` with tests covering no-duration, within-limit, at-limit, and over-limit.
- ~~**Empty states**~~ — Zero-question run test added to `runEngine.test.ts`.
- ~~**`src/utils/storage.ts`**~~ — `getStorageUsage` now meaningfully verified with realistic `localStorage` mock data.

---

## 3. Review Cycle #272–300

Issues #272–300 were filed from the code QA review. Agent fixes committed to `dev-refactor`. Post-fix verification found 2 false negatives (reviewer error):

| Issue | Initial Call | Correction |
|-------|--------------|------------|
| **#272** | FAIL — no `isSwitchingMode` ref | PASS — adapter boundary (`run.gameMode !== currentMode`) structurally blocks cross-mode writes |
| **#284** | FAIL — no atomic update | PASS — `logRunIfComplete` flashcard guard blocks logging until all self-assessments present |

All 29 issues closed. Final test count: **414/414 green**.

---

_Archived to `docs/qa/TESTFINDINGS.md` on 2026-04-30._
