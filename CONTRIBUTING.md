# Coding Guidelines

These guidelines define the default coding style for this project.
They are intentionally strict and should be treated as implementation rules, not suggestions.

## 1. Core Principles

- **Single Responsibility**: Each function does exactly one thing.
- **Small Units**: `<= 30` LOC (`<= 40` for algorithmic complexity).
- **Deterministic**: No hidden side-effects.
- **Readability** over cleverness.

## 2. Function Structure

Use linear, guard-clause-first functions wherever possible:

```ts
function processAnswer(answer: string): Result {
  if (!answer) return { error: "Empty" };

  const normalized = answer.trim().toUpperCase();
  return { value: normalized };
}
```

### Rules

- Max `3` parameters. Use an `interface` / DTO otherwise.
- Max `2` nesting levels.
- Guard-clauses first — early returns over deep nesting.

## 3. Naming

### TypeScript / React

| Element           | Style               | Example           |
| ----------------- | ------------------- | ----------------- |
| Function          | `camelCase`         | `fetchQuizData`   |
| Class / Component | `PascalCase`        | `QuizView`        |
| Variable          | `camelCase`         | `currentQuestion` |
| Constant          | `UPPER_CASE`        | `MAX_RETRY_COUNT` |
| Type / Interface  | `PascalCase`        | `QuizRun`         |
| Hook              | `camelCase` + `use` | `useQuizRun`      |

## 4. No Redundancy

Avoid duplication in both behavior and representation:

- No duplicated logic across functions or branches.
- No duplicated control flow patterns.
- No duplicated mapping logic.
- No duplicated string literals with the same meaning.

### Rules

- Extract shared logic into a single helper.
- Each decision must exist in exactly one place.
- Avoid copy-paste patterns, even if they are short.

## 5. Architecture Constraints

- Store hooks contain no business logic — only state management.
- Utilities contain no UI code.
- Views contain no direct `localStorage` access — use store hooks.
- Components are reusable — no hardcoded data.

## 6. Testing

- Test observable behavior, not implementation details.
- One scenario per test.
- Mock external dependencies.
