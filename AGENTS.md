# Fisherman's Quiz – Agent Handbook

> **Tech context, architecture, and build info:** See `.agents/MASTER.md`
> **Coding conventions:** See `.agents/rules/`
> **Agent personas:** See `.agents/agents/`
> **RTK rules:** See `RTK.md`

This file contains the project-specific workflow, autonomy matrix, and Git conventions.

## Project Identity

Interactive web app for learning the **Bavarian state fishing exam** (Staatliche Fischerprüfung). 1,052 questions across 6 areas with image recognition, progress tracking, and meta-learning.

## Git & GitHub Workflow

### 🔑 The Most Important Principle

> **GitHub Issues are the single source of truth.**
>
> - ROADMAP.md has **NO own numbers** — only links to GitHub Issues
> - Commits reference **only GitHub Issue numbers** (`#1`, `#2`, …)
> - Never run two numbering systems in parallel

### Overall Process (GitHub Flow)

```
Idea ──→ GitHub Issue ──→ Feature Branch ──→ PR ──→ CI green ──→ Merge ──→ Deploy
            ↑                                                      ↓
            └────────────── Close issue ←──────────────────────────┘
```

1. **Have an idea?** → Create a [GitHub Issue](https://github.com/kod0r/fishermans-quiz/issues/new) directly
2. **Create feature branch** → `git checkout -b feat/kurzbeschreibung`
3. **Develop** → Write code, test, build
4. **Commit** → Message with issue reference: `feat(ui): description (#42)`
5. **Push branch** → `git push -u origin feat/kurzbeschreibung`
6. **Create Pull Request** → On GitHub: PR with issue link
7. **CI must be green** → Lint + Test + Build must pass
8. **Merge** → squash or rebase merge to `main`
9. **Close issue** → Move to "Done" in ROADMAP
10. **Auto-Deploy** → GitHub Pages deploys after merge to `main`

### ⚠️ Important: Push Rules

> **Never push directly to `main`.** Every change goes through a feature branch + PR.

| Situation | Procedure |
|-----------|-----------|
| **Normal feature / refactor / docs** | Feature branch → Commit → Push branch → PR → Merge |
| **Hotfix / critical bug** | Feature branch `hotfix/...` → PR → merge quickly |
| **ROADMAP / CHANGELOG only** | Direct push to main OK (no code change) |

**Why no direct main pushes?**
- `main` is always deployable (GitHub Pages)
- CI must be green before code goes live
- PR history documents every decision
- Rollback possible at any time via Revert

**Procedure:**
1. Kimi develops on feature branch
2. Kimi pushes branch: `git push -u origin feat/...`
3. Kimi creates PR on GitHub (or shows URL)
4. User merges PR on GitHub (or tells Kimi: "merge PR")
5. GitHub Actions deploys automatically after merge

### Commit Messages: Conventional Commits

All commits follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<scope>): <description> (#<issue-nummer>)

[optional body]
```

**Types:**
| Type | When to use |
|------|-------------|
| `feat` | New features |
| `fix` | Bug fixes |
| `docs` | Documentation |
| `style` | Formatting, semicolons |
| `refactor` | Code refactoring |
| `test` | Add/change tests |
| `chore` | Build, dependencies |

**Scope:** Module/component (`ui`, `quiz`, `hooks`, `data`, `store`)

**Examples:**
```bash
git commit -m "feat(quiz): add arcade mode with 2nd-chance dialog (#3)"
git commit -m "fix(hooks): prevent navigation without loaded data (#1)"
git commit -m "test(store): add settings hook tests (#4)"
```

### Changelog — Automatic

> **The changelog is generated fully automatically from Conventional Commits.**
> No manual maintenance needed. Language/format doesn't matter.

**How it works:**
- `conventional-changelog-cli` reads all commits since the last tag
- Groups by `feat` → Features, `fix` → Bug Fixes, `BREAKING` → Breaking Changes
- Writes the result to `CHANGELOG.md`

**Release process (validated & automated):**

Instead of manual `git tag`, we use `npm version` with automatic validation:

```
npm run release -- <patch|minor|major>
```

1. `npm run lint` → must be clean
2. `npm run test:run` → must pass
3. `npm run build` → must build cleanly
4. `npm run changelog` → generates changelog
5. `npm version` → bumps package.json + creates commit + tag
6. `git push --follow-tags` → pushes commit + tag
7. GitHub Action triggers on tag:
   - Builds `dist/` → ZIP
   - Creates release with changelog + asset

**Important:** Never create `git tag` manually — always use `npm run release`.

**SemVer decision:**
| What happens | Command |
|-------------|---------|
| Bugfix / Patch | `npm run release -- patch` (0.1.1 → 0.1.2) |
| New feature | `npm run release -- minor` (0.1.1 → 0.2.0) |
| Breaking change | `npm run release -- major` (0.1.1 → 1.0.0) |

### ROADMAP.md — Rules

- **No own IDs** — only GitHub issue links (`[#3](...)`)
- **Three sections:** "In Progress", "Planned", "Done"
- **No details** — those belong in the GitHub issue
- **Review weekly:** Archive done items after 2–4 weeks

### GitHub Issues — Rules

- **Create:** [github.com/kod0r/fishermans-quiz/issues/new](https://github.com/kod0r/fishermans-quiz/issues/new)
- **Labels:** `enhancement`, `bug`, `docs`
- **Title format:** `<type>(<scope>): short description`
- **NEVER reuse** — when an issue becomes obsolete, close it and create a new one

### Branching — Standard Workflow

**Every change goes through a feature branch:**

```bash
# 1. Create branch (from current main)
git checkout -b feat/responsive-design

# 2. Develop & commit
git commit -m "feat(ui): add responsive breakpoints (#1)"

# 3. Push branch
git push -u origin feat/responsive-design

# 4. On GitHub: Create Pull Request
# 5. CI must be green
# 6. Merge on GitHub (or via gh CLI)
```

**Branch names:**
| Prefix | Usage |
|--------|-------|
| `feat/` | New feature |
| `fix/` | Bugfix |
| `hotfix/` | Critical bug (quick merge) |
| `docs/` | Documentation |
| `refactor/` | Code refactoring |
| `test/` | Tests |
| `chore/` | Dependencies, build, CI |

**Examples:**
```bash
git checkout -b feat/arcade-mode
git checkout -b fix/quiz-loader-validation
git checkout -b hotfix/vite-security-patch
```

## Important Files
- `src/hooks/useQuiz.ts` – Main hook, orchestrates run + meta + data loading
- `src/store/quizRun.ts` – Session logic (start, answers, navigation)
- `src/store/metaProgress.ts` – Learning tracking across sessions
- `src/utils/quizLoader.ts` – Lazy loading of quiz data
- `ROADMAP.md` – Current planning (being migrated to GitHub Issues)
- `CHANGELOG.md` – Version history

## Scripts
```bash
npm run dev      # Port 3000
npm run build    # tsc + vite build → dist/
npm run preview  # dist/ preview
```

## 🤖 Kimi Auto-Mode & Autonomy Matrix

> **Goal:** Kimi should handle as much as possible independently. The user only gives direction — implementation runs autonomously.

### Autonomy Levels

| Level | Action | Kimi may... | User input needed |
|-------|--------|-------------|-------------------|
| **A1** | Lint/format fixes | Fix immediately & commit | ❌ No |
| **A1** | Test updates during refactor | Adjust & commit | ❌ No |
| **A1** | ROADMAP.md sync (/feierabend) | Sync automatically & commit | ❌ No |
| **A1** | Dependabot PRs (patch/minor) | Review, merge, update ROADMAP | ❌ No |
| **A1** | Changelog generation | Fully automatic in CI | ❌ No |
| **A2** | Dependency upgrades (major) | Create plan, comment on issue | ⚠️ Only "Go" for implementation |
| **A2** | Feature branches | Create, develop, create PR | ⚠️ Only "Merge" or "Change" |
| **A2** | Bugfix hotfixes | Branch, fix, PR — then ping user | ⚠️ Merge approval |
| **A3** | Breaking changes (API, architecture) | Create plan, DO NOT implement | ✅ User approval needed |
| **A3** | Security-critical changes | Create plan, DO NOT implement | ✅ User approval needed |
| **A3** | Release (`npm run release`) | Prepare, ping user | ✅ User executes |

### Standard Workflow for Dependency Upgrades

```
Dependabot PR detected
        ↓
┌─────────────────┐
│ Patch or Minor? │──Yes──→ Auto-review → CI green → Auto-merge → ROADMAP sync
└─────────────────┘
        ↓ No (Major)
┌─────────────────┐
│ Peer-dep conflict? │──Yes──→ Create issue with plan → User waits for "Go"
└─────────────────┘
        ↓ No
┌─────────────────┐
│ Breaking changes? │──Yes──→ Evaluation branch → Collect test data → User decides
└─────────────────┘
        ↓ No
Auto-review → CI green → Auto-merge
```

### Auto-Merge Rules for Dependabot

Kimi may merge IMMEDIATELY when:
- ✅ Patch version (e.g. 1.2.3 → 1.2.4)
- ✅ Minor version (e.g. 1.2.3 → 1.3.0) WITHOUT peer-dep changes
- ✅ CI is green (lint + test + build)
- ✅ Only package.json + package-lock.json changed

Kimi may NOT merge when:
- ❌ Major version (e.g. 1.x → 2.x)
- ❌ Peer-dependency conflict
- ❌ New sub-dependencies with >10KB bundle impact
- ❌ CI red
- ❌ Source code files outside package.json changed

### Feature Development Auto-Workflow

```
User: "Implement X"
        ↓
Kimi: Check / create issue → Branch `feat/x` → Develop
        ↓
Kimi: Test (npm run test:run) → Lint (npm run lint) → Build (npm run build)
        ↓
Kimi: Create PR with description + test results
        ↓
User: "Merge" or "Change Y"
        ↓
Kimi: Merge (or change → re-PR)
        ↓
Auto: GitHub Pages deploy + ROADMAP sync
```

### Kimi Internal Checklist Before Every PR

- [ ] `npm run lint` clean
- [ ] `npm run test:run` all 59+ tests green
- [ ] `npm run build` clean (tsc + vite)
- [ ] No unintended files in diff
- [ ] Commit message follows Conventional Commits
- [ ] Issue referenced in commit and PR

### When Kimi Must Ping the User

- Before every `npm run release` (version bump is final)
- For major dependency upgrades (before implementation)
- When CI stays red after 2 fix attempts
- For architecture changes (state management, routing, etc.)
- When an issue requires >3 hours of effort

## Known Limitations
- No backend – everything client-side
- Image recognition questions reference local JPEGs in `public/images/`
- No real router – view switching via state
