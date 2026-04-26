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

## ⚠️ ABSOLUTE BAN — PADDING, MARGIN & SPACING

**UNDER NO CIRCUMSTANCES** may any LLM agent modify, add, remove, or change any of the following on any element, component, or file:

- `padding` / `p-*` / `px-*` / `py-*` / `pt-*` / `pr-*` / `pb-*` / `pl-*` (Tailwind or CSS)
- `margin` / `m-*` / `mx-*` / `my-*` / `mt-*` / `mr-*` / `mb-*` / `ml-*` (Tailwind or CSS)
- `gap` / `gap-*` / `gap-x-*` / `gap-y-*` (Tailwind or CSS)
- `space-x-*` / `space-y-*` (Tailwind space utilities)
- Any shadcn/ui component's internal spacing defaults (e.g., Card `py-6`, `gap-6`, Content `px-6`)
- Any CSS `padding`, `margin`, `gap`, `row-gap`, `column-gap` properties
- Any equivalent spacing-related properties, classes, or inline styles

**This ban is UNIVERSAL, ABSOLUTE, and NON-NEGOTIABLE.**
It applies to ALL files, ALL components, ALL elements, ALL the time — including but not limited to `.tsx`, `.ts`, `.css`, `.scss`, `.html`, and config files.

**If spacing needs to change, the HUMAN must do it manually.**
Agents must NEVER "widen" layouts, "increase" dead space, or ADD padding/margin/gap for any reason whatsoever. Tightening layouts, reducing dead space, and removing excess padding/margin/gap is explicitly permitted and encouraged.

**NO EXCEPTIONS. DO NOT TOUCH SPACING. EVER.**
