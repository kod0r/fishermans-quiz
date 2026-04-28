# Hardening Phase — Issue Bundle

## Meta
- Phase: hardening
- Feature freeze: active
- Mobile stores: out of scope
- PWA: in scope
- UI language: German (frozen)

## Execution Rules
1. Implement strictly in priority order. Do not start Issue N+1 until Issue N is closed.
2. If Issue 0 finds critical bugs, halt and create new [fix] issues before Issue 1.
3. If Issue 0 finds zero critical bugs, proceed directly to Issue 1.
4. No new features. No refactoring of working systems. Harden only.
5. All GitHub Issues, documentation, and code comments are written in English.
6. The German UI language is frozen. Do not modify any user-facing strings, labels, or aria-labels in src/views/, src/components/, or src/App.tsx.

---

## Issue 0: [qa] Pre-hardening bug hunt — vibecoded state logic audit

**Description:**
Time-boxed audit of AI-generated React state logic. Find bugs before documenting or testing them. Do not fix anything in this issue; file follow-up tickets only for critical findings (crash or data loss).

**Priority:** 0
**Type:** audit
**Blocks:** 1, 2, 3, 4, 5
**Time box:** 1 hour. Stop when time is up. Document what you did not get to.

**Files to read (do not modify):**
`src/hooks/useQuiz.ts`, `src/hooks/useGameMenu.ts`, `src/hooks/useKeyboardShortcuts.ts`, `src/store/quizRun.ts`, `src/utils/storage.ts`, `src/App.tsx`, `src/views/QuizView.tsx`, `src/views/FlashcardView.tsx`, `src/components/game-menu/HUD.tsx`

**Acceptance Criteria:**
- [ ] **useEffect dependency audit** — Read every `useEffect` in `src/hooks/` and `src/store/`. List any with missing or incorrect dependency arrays. Pay special attention to:
  - `useQuiz.ts`: the `logRunIfComplete` memoization and `beantworteFrage` callback
  - `useGameMenu.ts`: the global `keydown` listener and `registerOnActivate` wiring
  - `QuizView.tsx`: the `requestAnimationFrame` exam timer loop
- [ ] **Event listener cleanup** — Verify every `window.addEventListener` has a matching removal in the cleanup function. Check:
  - `App.tsx`: `storage:error` listener
  - `useKeyboardShortcuts.ts`: `keydown` listener
  - `useGameMenu.ts`: `keydown` listener
  - `HUD.tsx`: `keydown` listener for `h` toggle
- [ ] **Timer/animation leak check** — Verify cleanup exists for:
  - `requestAnimationFrame` in `QuizView.tsx` exam timer
  - `setInterval` in `HUD.tsx` exam timer (if still present after shuffle changes)
  - `setTimeout` in `FlashcardView.tsx` auto-advance
- [ ] **Stale closure check** — In `useQuiz.ts`, verify callbacks passed to child components (`beantworteFrage`, `starteQuiz`, `switchGameMode`) do not capture stale state from enclosing closures. AI often omits functional updates (`setRun(prev => ...)`).
- [ ] **localStorage error path** — Verify the `storage:error` custom event is actually dispatched in `storage.ts` and actually caught in `App.tsx`. Confirm the debounce logic works and does not suppress legitimate errors.
- [ ] **State desync on mode switch** — Trace `switchGameMode` in `useQuiz.ts`. Confirm that `gameMode` state, `RunStorage` key, and `MetaStorage` key all switch atomically. Look for any path where a run could be saved to the wrong mode key.
- [ ] **Output:** A markdown list in this issue's comments. Format: `File:line — problem — severity (critical/warning)`. No PR required for this issue; close when the list is complete.

---

## Issue 1: [docs] Architecture Decision Record — trace and document data flow end-to-end

**Description:**
Write a concise architecture document that proves comprehension of the AI-generated codebase. The goal is not a README rewrite, but a technical trace that a hiring manager (or you, in six months) can read to understand how data moves from user click to persisted state.

**Priority:** 1
**Type:** docs
**Depends:** 0
**Blocks:** 2

**Acceptance Criteria:**
- [ ] Create `docs/ARCHITECTURE.md` (or append to `RESEARCH.md` if `docs/` does not exist).
- [ ] **Section: Quiz Data Flow** — Trace the exact path:
  - `StartView` topic selection → `useQuiz.starteQuiz()` → `useQuizRun.starteRun()` → `RunStorage.save()` → `AnswerGrid` render → user click → `beantworteFrage()` → `useMetaProgress.recordAnswer()` → `MetaStorage.save()`.
  - Include where `useSRS`, `useFavorites`, and `useHistory` hook into this flow.
- [ ] **Section: State Partitioning** — Document the four storage domains and their keys:
  - Session: `QuizRun` (`fmq:run:<mode>:v2`)
  - Persistent progress: `MetaProgression` (`fmq:meta:<mode>:v2`)
  - Global user data: `Favorites`, `Notes`, `History`, `SRS` (`fmq:*:v1`)
  - App settings: `AppSettings` (`fmq:settings:v1`)
- [ ] **Section: Game Mode Differences** — One paragraph per mode (Arcade, Hardcore, Exam) explaining what state rule distinguishes it (retries, topic locks, timer, fixed pool).
- [ ] **Section: Shuffle Implementation Note** — Briefly document how `answerShuffle` is generated in `QuizRun`, applied in `aktiveFragen`, and why it does not break correctness checks.
- [ ] **Section: Why localStorage** — One paragraph: static hosting, no backend, offline-first, GitHub Pages deployment.
- [ ] Keep it under 150 lines. Use code references (`src/store/quizRun.ts:42`) where helpful. No diagrams required.

**Files to touch:**
New file: `docs/ARCHITECTURE.md` (or `RESEARCH.md`)

---

## Issue 2: [test] Test coverage for answer shuffle utility and QuizRun integration

**Description:**
The shuffle feature is the most recent AI-generated surface area. Add targeted tests to prove it preserves correctness and integrates cleanly with the run lifecycle.

**Priority:** 2
**Type:** test
**Depends:** 0, 1

**Acceptance Criteria:**
- [ ] **Utility tests (`src/utils/quizShuffle.test.ts`):**
  - `shuffleAnswers` returns a new `Frage` object (no mutation of input).
  - The returned `richtige_antwort` correctly maps to the key that now holds the originally correct text.
  - All three answer keys (`A`, `B`, `C`) are present in the output; no data loss.
  - Two consecutive calls with the same input produce different permutations (non-deterministic).
- [ ] **QuizRun integration tests (`src/store/quizRun.test.ts`):**
  - When `starteRun` is called with `shuffleAnswers: true`, the resulting `QuizRun.answerShuffle` contains an entry for every `frageId`.
  - `aktiveFragen` (derived from the run) presents answers in the shuffled order when the map exists.
  - `restarteRun` generates a **new** `answerShuffle` map (do not assert exact values; assert `!==` old map).
  - `removeTopic` removes shuffle entries for removed question IDs.
  - `beantworteFrage` records the **displayed** letter key, and correctness checks (`antworten[id] === frage.richtige_antwort`) still evaluate correctly after shuffle.
- [ ] **Hook wiring test (`src/hooks/useQuiz.test.ts`):**
  - `starteQuiz` forwards the `shuffleAnswers` setting value into `run.starteRun`.
- [ ] All tests use the existing `src/test/setup.ts` mocks (localStorage, fetch). No new dependencies.

**Files to touch:**
`src/utils/quizShuffle.test.ts`, `src/store/quizRun.test.ts`, `src/hooks/useQuiz.test.ts`

---

## Issue 3: [harden] Dead code audit and removal

**Description:**
AI generation leaves unused exports, orphaned types, and imports that reference nothing. Remove only what is provably unreferenced. Do not touch working features.

**Priority:** 3
**Type:** cleanup
**Depends:** 0

**Acceptance Criteria:**
- [ ] Run `npx tsc --noEmit` and review all `TS6133` (unused variable/import) warnings. Remove or suppress each one with justification in a comment if suppression is safer.
- [ ] Check `src/hooks/useTutorialRun.ts`: if it is imported **only** by `src/views/help/TutorialDemo.tsx` and `src/views/help/ModeExplainer.tsx`, and those views are still reachable from `HelpView`, **keep it**. If it has additional orphaned exports (functions not used anywhere), remove those specific exports.
- [ ] Check `src/components/game-menu/menuConfig.ts`: remove any `MenuPageConfig` entries in `MENU_PAGES` that are commented out or have zero navigation paths to them (e.g., the commented `help` item in `root` sections).
- [ ] Check `src/utils/quizLoader.ts`: remove any Zod schemas that are defined but never imported anywhere in `src/` (excluding the file itself). If all schemas are used, document that in the issue closure comment.
- [ ] Check `src/types/quiz.ts`: remove any interfaces/types with zero references across the project. If unsure, leave them.
- [ ] Run `npm run build` after cleanup. Must pass with zero new errors.

**Files to touch:**
Scattered across `src/`; likely includes `src/utils/quizLoader.ts`, `src/components/game-menu/menuConfig.ts`, `src/types/quiz.ts`, and any hook files with unused exports.

---

## Issue 4: [feat] PWA support — vite-plugin-pwa and manifest

**Description:**
Add installable PWA support. This is the only "feature" in the hardening phase, and it is a deployment standard, not an app behavior change. It demonstrates production deployment knowledge.

**Priority:** 4
**Type:** deploy
**Depends:** 3

**Acceptance Criteria:**
- [ ] Install `vite-plugin-pwa` as a dev dependency.
- [ ] Update `vite.config.ts` to include the plugin with:
  - `registerType: 'autoUpdate'`
  - `manifest` object containing:
    - `name`: `Fisherman's Quiz`
    - `short_name`: `Feeesh`
    - `start_url: '.'`
    - `display: 'standalone'`
    - `theme_color` and `background_color` matching your Tailwind primary teal (`#14b8a6` or equivalent hex)
    - `icons`: array referencing 192×192 and 512×512 PNGs
- [ ] Add icon assets to `public/`:
  - `pwa-192x192.png`
  - `pwa-512x512.png`
  - If you do not have branded icons, generate simple colored squares with the app initials or use a placeholder service; do not block the issue on graphic design.
- [ ] Ensure `index.html` has `<link rel="manifest" href="/manifest.json" />` (plugin may inject this; verify).
- [ ] Verify the service worker caches the lazy-loaded JSON topic files. If `vite-plugin-pwa` does not cache `public/data/` automatically, add a `workbox` glob pattern in the plugin config:
  ```js
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
  }
  ```
- [ ] Run `npm run build`. Verify `dist/sw.js` and `dist/manifest.json` exist.
- [ ] Test in Chrome DevTools → Lighthouse → PWA audit. Must pass "Installable" category.

**Files to touch:**
`vite.config.ts`, `index.html`, `public/pwa-192x192.png`, `public/pwa-512x512.png`

---

## Issue 5: [harden] Mobile viewport audit and touch interaction fixes

**Description:**
AI-generated CSS often assumes desktop viewport sizes. Audit the app on a real mobile viewport (or Chrome DevTools mobile emulation) and fix overflow, fixed heights, and touch target issues. The HUD swipe-to-hide gesture is a user-valued feature and must be hardened, not removed.

**Priority:** 5
**Type:** harden
**Depends:** 0, 3

**Acceptance Criteria:**
- [ ] **QuizCardShell (`src/components/QuizCardShell.tsx`):**
  - The fixed height classes (`h-[520px] sm:h-[600px] md:h-[720px]`) must not cause overflow or unreachable content on screens shorter than 520px (e.g., iPhone SE).
  - Change to `min-h-[...]` or use flex-based height (`flex-1` inside a flex parent with `max-h-[calc(100dvh-...)]`). The card should fit within the viewport without forcing page scroll.
- [ ] **AnswerGrid (`src/components/AnswerGrid.tsx`):**
  - Verify all buttons already meet `min-h-[44px]` (they do in current code). Confirm on mobile emulation that they are not clipped by parent overflow.
- [ ] **HUD (`src/components/game-menu/HUD.tsx`):**
  - Add `pb-[env(safe-area-inset-bottom)]` to the bottom bar container to respect iPhone home indicator.
  - **Harden the swipe-to-hide gesture (do not remove):**
    - Increase the swipe threshold from 40px to 100px to prevent accidental triggers during answer selection.
    - Add a 200ms grace period after any button tap inside the HUD where swipe detection is ignored (prevents tap-and-drag from being misread as a swipe).
    - Keep the invisible touch strip when hidden for swipe-up recovery.
    - Keep the `H` keyboard toggle.
- [ ] **GameMenuOverlay (`src/components/game-menu/GameMenuOverlay.tsx`):**
  - On mobile (`isMobile`), verify the drawer does not exceed viewport height. The current `max-h-[85vh]` is acceptable, but ensure the content area scrolls (`overflow-y-auto`) and the header does not get pushed off-screen.
- [ ] **StartView (`src/views/StartView.tsx`):**
  - Ensure the topic selection list and stat boxes do not cause horizontal overflow on 375px-wide viewports. If `grid-cols-3` stat boxes overflow, change to `grid-cols-2` on small screens.
- [ ] **Run Lighthouse mobile audit.** Fix any "Content wider than screen" or "Tap targets are not sized appropriately" warnings. Target score: 90+ on mobile.

**Files to touch:**
`src/components/QuizCardShell.tsx`, `src/components/game-menu/HUD.tsx`, `src/views/StartView.tsx`, possibly `src/components/AnswerGrid.tsx` (verification only)
