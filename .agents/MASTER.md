# feeesh — Fisherman's Quiz

React 19 + TypeScript + Vite SPA for learning the Bavarian state fishing exam. 1,052 questions across 6 areas, with image recognition, progress tracking, and a meta-learning system.

**Project root:** `/workspaces/kod0r/00_coding/webdev/02_projects/feeesh`

---

## Build & Run

```bash
npm install
npm run dev        # Port 3000
npm run build      # tsc + vite build → dist/
npm run lint       # ESLint
npm run test:run   # Vitest CI mode
npm run preview    # dist/ preview
npm run release -- <patch|minor|major>  # Full release pipeline
```

**Node:** >= 22.0.0 (locked via `.nvmrc` and `engines`)

---

## Architecture

```
Views        views/         StartView, QuizView, ProgressView
Components   components/    UI primitives + shadcn/ui
Orchestrator hooks/         useQuiz (loads data, wires stores)
State        store/         useQuizRun, useMetaProgress, useSettings, useFavorites
Types        types/         quiz.ts (Frage, QuizRun, MetaProgression)
Utils        utils/         quizLoader.ts (lazy + Zod), storage.ts (localStorage)
```

**State:** Custom hooks only — no Redux, no Zustand. Everything syncs to `localStorage`.
**Data:** Staged loading — `quiz_meta.json` (~360B) loads instantly, area chunks (~420KB) lazy/background.
**Validation:** All JSON validated via Zod schemas at runtime.

---

## Directory Structure

```
feeesh/
├── .agents/        AI agent configuration (this dir)
├── .github/        Workflows (pages.yml, release.yml, dependabot.yml)
├── public/
│   ├── images/     54 JPEGs for image recognition
│   └── data/       quiz_meta.json, bereiche/*.json (lazy-loaded chunks)
├── src/
│   ├── views/      StartView.tsx, QuizView.tsx, ProgressView.tsx
│   ├── components/ TopNavBar.tsx, ui/ (~50 shadcn components)
│   ├── hooks/      useQuiz.ts, use-mobile.ts
│   ├── store/      quizRun.ts, metaProgress.ts, settings.ts, favorites.ts
│   ├── types/      quiz.ts
│   ├── utils/      quizLoader.ts, storage.ts
│   ├── test/       6 test suites + setup.ts
│   ├── lib/        utils.ts (cn helper)
│   ├── main.tsx    Entry point
│   ├── App.tsx     Root + view switcher
│   └── index.css   Global styles + CSS variables
├── index.html
├── package.json
├── vite.config.ts    base: './', port 3000, cssMinify: 'esbuild'
├── vitest.config.ts  jsdom, globals, setupFiles
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── components.json   shadcn/ui config
├── eslint.config.js
├── AGENTS.md         Detailed agent handbook (357 lines)
├── BRAIN.md          Architecture deep-dive (229 lines)
├── ROADMAP.md        GitHub Issue-linked planning board
├── CHANGELOG.md      Auto-generated from conventional commits
├── README.md         Human-facing overview
└── RTK.md            Token-optimized CLI rules
```

---

## Data Model

### Frage
```ts
interface Frage {
  id: string;
  bereich: string;          // e.g. "Biologie"
  frage: string;
  antworten: { A: string; B: string; C: string };
  richtige_antwort: string; // "A" | "B" | "C"
  bild?: boolean;
  bild_url?: string;
}
```

### Meta-Progression
- `attempts` — times answered
- `correctStreak` — consecutive correct answers
- **Mastered** = `correctStreak >= 3`
- **Learning** = `attempts > 0 && correctStreak < 3`

### localStorage Keys
```
fmq:settings:v1
fmq:run:{mode}:v2        // arcade | hardcore
fmq:meta:{mode}:v2
fmq:favorites:v1
```

---

## API / Endpoints

No backend. Static site deployed to GitHub Pages.
Future platform will add REST API (see ROADMAP).

---

## Coding Conventions

See `.agents/rules/` for path-scoped conventions.
Key rules:
- Functions ≤30 LOC (≤40 for algorithmic complexity)
- Max 3 parameters
- Guard-clauses first, max 2 nesting levels
- Naming: `camelCase` (functions/vars), `PascalCase` (classes/components), `UPPER_CASE` (constants)
- No redundancy — extract shared logic
- React: functional components only, no inline styles

Full conventions: `.agents/rules/react-conventions.md`

---

## Agent Working Rules

- Prefer one focused sub-agent over multi-agent chains.
- Avoid repo-wide analysis when the task is local.
- Stop when the concrete task is solved.
- Do not expand tests beyond the smallest useful verification.
- Do not grow issue scope during execution.
- **Always prefix shell commands with `rtk`.** See `RTK.md`.

---

## Tests

6 test suites in `src/test/`:
- `useQuiz.test.ts` — Orchestrator
- `quizRun.test.ts` — Session logic
- `metaProgress.test.ts` — Streak/mastered logic
- `settings.test.ts` — Settings + migration
- `storage.test.ts` — Storage utilities
- `quizLoader.test.ts` — Lazy loading + Zod validation

Run: `npm run test:run`

---

## Known Gotchas

- No real router — `BrowserRouter` is a wrapper; views switch via `useState` (`start` | `quiz` | `progress`)
- `cssMinify: 'esbuild'` in Vite config — workaround for Tailwind + lightningcss issues
- Dark theme only — `:root` and `.dark` use identical values
- Quiz data in `public/data/` is readonly — never edit at runtime
- Legacy migration runs once on first load (v2 keys)

---

## Documentation

| File | Purpose |
|------|---------|
| `AGENTS.md` | AI agent handbook: workflows, Git conventions, autonomy matrix, commit standards |
| `BRAIN.md` | Architecture: state diagrams, component hierarchy, data flow, build issues |
| `ROADMAP.md` | Living planning board — links to GitHub Issues only |
| `RTK.md` | CLI proxy rules: always prefix shell commands with `rtk` |
| `README.md` | Human overview |
| `CHANGELOG.md` | Auto-generated from conventional commits |

---

## Roadmap

**Stage 1 — App Polish (current):** Responsive design, PWA, offline support, code quality.
**Stage 2 — Online Platform:** User accounts, backend, leaderboard, multiplayer.
**Stage 3 — OnlyFish Ecosystem:** Social features, content platform, monetization.

See `ROADMAP.md` for GitHub Issue links.
