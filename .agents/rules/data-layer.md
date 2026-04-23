---
paths:
  - "src/store/**"
  - "src/utils/**"
---

# Data Layer Conventions

## State Management

- **Custom hooks only** — no Redux, Zustand, or context providers for state.
- Each store hook owns one domain: `useQuizRun`, `useMetaProgress`, `useSettings`, `useFavorites`.
- Hooks sync to `localStorage` via `storage.ts` utilities.

## localStorage Rules

- Keys are namespaced: `fmq:<domain>:<version>`.
- Never read `localStorage` directly in components — use store hooks.
- Always handle `QuotaExceededError`.
- Migration logic lives in the store hook, not scattered.

## Data Loading

- `quizLoader.ts` is the single source of truth for data fetching.
- All JSON validated via Zod before use.
- Lazy loading: fetch area chunks on demand, cache in memory.

## No Raw Storage Access

Components must not call `localStorage.getItem` / `setItem` directly.
Always route through `storage.ts` or store hooks.
