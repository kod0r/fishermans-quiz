# Epic Delivery Plan: #194 — Themenbereiche Lock Mechanism Overhaul

**Status:** In Progress

**Original Issue:** [#194](https://github.com/kod0r/fishermans-quiz/issues/194)

**Evaluated Complexity:** Medium

**Estimated Effort:** ~2–3 hours

**Prerequisites:** None

---

## Context

`StartView.getBereichStatus` currently mixes visual badge logic with implicit selection rules. Hardcore locking is inferred from status badges rather than enforced by a dedicated utility. Arcade and exam modes have no formal lock specification, leading to inconsistent UX and difficulty maintaining the selection logic as modes evolve.

This epic separates **selection gating** (pure logic) from **visual status** (UI), creating a single source of truth for "can this bereich be selected in this mode?"

---

## Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Pure utility in `src/utils/bereichLocks.ts` | Keeps business logic testable and reusable; no React dependency |
| Per-mode rule table | Makes mode-specific behavior explicit and easy to extend |
| Guard in `useQuiz.starteQuiz` | Defense in depth — UI + orchestration both validate |
| `getBereichStatus` returns only `{icon, label, cls}` | Clear separation: UI decides how it looks, utility decides if it's selectable |

---

## Sub-Tasks (The Delivery Grid)

| # | Sub-Task | Complexity | Files Touched | Effort | Issue |
|---|----------|------------|---------------|--------|-------|
| 1 | Create `canSelectBereich` utility | Low | `src/utils/bereichLocks.ts` (new) | ~30 min | — |
| 2 | Refactor `getBereichStatus` to pure badge logic | Low | `src/views/StartView.tsx` | ~30 min | — |
| 3 | Wire `canSelectBereich` into `StartView` selection | Medium | `src/views/StartView.tsx` | ~30 min | — |
| 4 | Add guard in `useQuiz.starteQuiz` | Low | `src/hooks/useQuiz.ts` | ~20 min | — |
| 5 | Tests for lock rules | Low | `src/test/bereichLocks.test.ts` (new) | ~30 min | — |
| 6 | Regression test run | Low | all test files | ~10 min | — |

---

## Pre-Coding Prep

1. [ ] Read `src/types/quiz.ts` to confirm `GameMode`, `MetaProgression`, `QuizMeta` shapes (~5 min)
2. [ ] Read `src/store/metaProgress.ts` to verify `BereichMeta` write logic (mastered vs passed) (~5 min)
3. [ ] Read `src/views/StartView.tsx` to locate current `getBereichStatus` and toggle logic (~10 min)

**Total prep:** ~20 min.

---

## Suggested Execution Order

```
Prep
  ├─ Read types + metaProgress store
  └─ Read StartView current implementation

Sub-Task 1 (~30 min) ──→ Create bereichLocks.ts with canSelectBereich
Sub-Task 2 (~30 min) ──→ Strip gating logic from getBereichStatus
Sub-Task 3 (~30 min) ──→ Import canSelectBereich in StartView toggle + render
Sub-Task 4 (~20 min) ──→ Guard in useQuiz.starteQuiz
Sub-Task 5 (~30 min) ──→ Unit tests for all mode/rule combos
Sub-Task 6 (~10 min) ──→ Full test suite + lint + build
```

**Total effort:** ~2.5 hours (with prep).

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `mastered` and `passed` desync in legacy data | `canSelectBereich` checks `!mastered && !passed` for lock; mastered always wins |
| StartView toggle logic has side effects (dialogs) | Keep dialog triggers in `toggle()`, only replace the boolean gate |
| Exam mode unexpectedly restricts selection | Exam rule is hardcoded `true`; test explicitly covers it |

---

## Acceptance Criteria (Epic Level)

- [x] `src/utils/bereichLocks.ts` exports `canSelectBereich` with exact signature
- [x] Arcade rule: always `true`
- [x] Exam rule: always `true`
- [x] Hardcore rule: locked only if `lastAttempt` exists AND `passed === false` (mastered remains `true`)
- [x] `StartView` imports `canSelectBereich`; `getBereichStatus` returns only badge data
- [x] `useQuiz.starteQuiz` rejects locked bereiche with `console.error`
- [x] `src/test/bereichLocks.test.ts` covers all rule combinations
- [x] `npm run test:run` passes
- [x] `npm run lint` passes
- [x] `npm run build` succeeds

---

## Actual Implementation Notes

> Filled in during/after execution.

### What Changed vs. Plan

Implementation was completed in commit `aa9ece9` prior to this epic plan. Plan created retroactively to document decisions and verify completeness.

### Final File List

- `src/utils/bereichLocks.ts` — `canSelectBereich` pure utility; per-mode selection rules
- `src/views/StartView.tsx` — `getBereichStatus` stripped to badge-only; selection uses `canSelectBereich`
- `src/hooks/useQuiz.ts` — guard in `starteQuiz` rejects locked bereiche
- `src/test/bereichLocks.test.ts` — 8 tests covering arcade, exam, hardcore mastered/passed/locked/attempted states

### Quality Gates

- ✅ `npm run test:run` — 203 tests passing (18 files)
- ✅ `npm run lint` — clean
- ✅ `npm run build` — successful

### Sub-Issues Created

- None (single-issue scope, fits within #194)
