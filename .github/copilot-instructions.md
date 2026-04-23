# Copilot Instructions

## Architecture

- React 19 SPA with custom hooks for state management.
- No Redux, no Zustand, no Context providers for state.
- Data flows: Views → Hooks → Stores → localStorage.
- Lazy-loaded JSON data with Zod runtime validation.

## Build & Test

```bash
npm run dev        # Port 3000
npm run lint       # ESLint
npm run test:run   # Vitest
npm run build      # tsc + vite build
```

## Conventions

- Functions ≤30 LOC, max 3 params, max 2 nesting levels.
- Guard-clauses first.
- Naming: `camelCase` (functions/vars), `PascalCase` (components), `UPPER_CASE` (constants).
- Functional components only, no inline styles.
- Default exports for views, named exports for UI/hooks.

## RTK Rule

Always prefix shell commands with `rtk`.
