---
paths:
  - "src/test/**/*.test.ts"
  - "src/test/**/*.test.tsx"
---

# Test Conventions

## Structure

- One test file per module: `<module>.test.ts`
- Mirror the source structure under `src/test/`.
- Group related tests with `describe` blocks.

## Rules

- Test **observable behavior**, not implementation details.
- One scenario per test — no giant `it("does everything")`.
- Mock external dependencies (fetch, localStorage, timers).
- Use `@testing-library/jest-dom` matchers.
- Clean up in `afterEach`.

## Naming

```ts
describe("useQuizRun", () => {
  it("starts a new run with shuffled questions", () => { ... });
  it("records a correct answer and increments streak", () => { ... });
  it("handles interruption and resumes from localStorage", () => { ... });
});
```

## Setup

- `src/test/setup.ts` mocks `localStorage`, `fetch`, and runs cleanup.
- Add new mocks there, not in individual test files.
