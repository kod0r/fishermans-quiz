---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "*.config.*"
---

# React & TypeScript Conventions

## Core Principles

- **Single Responsibility**: Each function does exactly one thing.
- **Small Units**: `<= 30` LOC (`<= 40` for algorithmic complexity).
- **Deterministic**: No hidden side-effects.
- **Readability** over cleverness.

## Function Structure

Use linear, guard-clause-first functions:

```ts
function processAnswer(answer: string): Result {
  if (!answer) return { error: "Empty" };

  const normalized = answer.trim().toUpperCase();
  if (!isValidAnswer(normalized))
    return { error: "Invalid" };

  return { value: normalized };
}
```

### Rules

- Max `3` parameters. Use an `interface` / DTO otherwise.
- Max `2` nesting levels.
- Guard-clauses first — early returns over deep nesting.

## Naming

| Element | Style | Example |
|---------|-------|---------|
| Function | `camelCase` | `fetchQuizData` |
| Class / Component | `PascalCase` | `QuizView` |
| Variable | `camelCase` | `currentQuestion` |
| Constant | `UPPER_CASE` | `MAX_RETRY_COUNT` |
| Type / Interface | `PascalCase` | `QuizRun` |
| Enum | `PascalCase` | `GameMode` |
| Hook | `camelCase` + `use` prefix | `useQuizRun` |

## React Rules

- **Functional components only.** No class components.
- **No inline styles.** Use Tailwind classes or CSS variables.
- Props destructuring in function signature.
- `export default` for page/view components.
- Named exports for UI components, hooks, and utilities.
- Custom hooks for shared logic — no HOCs.

## TypeScript Rules

- Strict mode enabled (`strict: true`).
- No `any` — use `unknown` + type guards.
- Explicit return types on public APIs.
- Prefer `interface` over `type` for object shapes.
- No `// @ts-ignore` without comment explaining why.

## Import Order

1. React / framework
2. External libraries
3. Internal absolute imports (`@/...`)
4. Internal relative imports
5. Styles

## No Redundancy

- No duplicated logic across functions or branches.
- No duplicated control flow patterns.
- No duplicated mapping logic.
- No duplicated string literals with the same meaning.
- Extract shared logic into a single helper.
