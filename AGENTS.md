# Agent Handbook

> **Project context:** See `.agents/MASTER.md`  
> **Coding conventions:** See `.agents/rules/`

## Agent Setup

Agent setup is flexible — spawn subagents, delegate to skills, or work solo as the situation demands. Use the `Agent` tool for focused subtasks. Use skills for repeatable workflows.

## Git & GitHub Workflow

### The Most Important Principle

> **GitHub Issues are the single source of truth.**
>
> - ROADMAP.md has **NO own numbers** — only links to GitHub Issues
> - Commits reference **only GitHub Issue numbers** (`#1`, `#2`, …)
> - Never run two numbering systems in parallel

### Branch Strategy

| Context | Branch | Notes |
|---------|--------|-------|
| Long-running refactor / architecture work | `dev-refactor` | Commit directly. Do not create sub-branches. |
| Normal feature / fix / docs | `feat/description` or `fix/description` | Branch from `main`, PR back to `main`. |
| Hotfix | `hotfix/description` | PR to `main`, merge quickly. |
| ROADMAP / CHANGELOG only | `main` | Direct push OK if no code changes. |

> **Never push directly to `main` for code changes.**

### Process

```
Idea ──→ GitHub Issue ──→ Branch ──→ Develop ──→ CI green ──→ PR ──→ Merge
            ↑                                                  ↓
            └────────────── Close issue ←────────────────────────┘
```

1. **Have an idea?** → Create a GitHub Issue
2. **Pick branch** → `dev-refactor` for refactor work; feature branch for everything else
3. **Develop** → Write code, test, build
4. **Commit** → `type(scope): description (#issue)`
5. **Push**
6. **Create Pull Request** (if feature branch) → On GitHub with issue link
7. **CI must be green** → Lint + Test + Build
8. **After completing work** → Add `pending-review` label + comment with summary
9. **Close issue** → Move to "Done" in ROADMAP

### Commit Messages: Conventional Commits

```
<type>(<scope>): <description> (#<issue-number>)
```

| Type | When |
|------|------|
| `feat` | New features |
| `fix` | Bug fixes |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code refactoring |
| `test` | Tests |
| `chore` | Build, dependencies |

### Branch Names

| Prefix | Usage |
|--------|-------|
| `feat/` | New feature |
| `fix/` | Bugfix |
| `hotfix/` | Critical bug |
| `docs/` | Documentation |
| `refactor/` | Refactoring |
| `test/` | Tests |
| `chore/` | Dependencies, build, CI |

## Autonomy Matrix

| Level | Action | May proceed without user? |
|-------|--------|---------------------------|
| **A1** | Lint/format fixes, test updates, ROADMAP sync, Dependabot patches | ✅ Yes |
| **A2** | Feature branches, bugfix branches, refactor on `dev-refactor` | ⚠️ Ping after PR ready; user merges |
| **A3** | Breaking changes, security changes, releases, major deps | ❌ Stop. Create plan, wait for approval. |

### Auto-Merge Rules for Dependabot

May merge when:
- ✅ Patch or Minor version
- ✅ CI is green
- ✅ Only package files changed

May NOT merge when:
- ❌ Major version
- ❌ Peer-dependency conflict
- ❌ CI red
- ❌ Source code files changed

### Pre-Commit / Pre-Push Checklist

- [ ] `npm run lint` clean
- [ ] `npm run test:run` all green
- [ ] `npm run build` clean
- [ ] No unintended files in diff
- [ ] Commit follows Conventional Commits
- [ ] Issue referenced in commit

### When to Ping the User

- Before every release (version bump is final)
- For major dependency upgrades (before implementation)
- When CI stays red after 2 fix attempts
- For architecture changes requiring >3 hours
- Before A3-level actions

## Available Skills

Trigger by name or ask the agent to use them.

| Skill | Use When |
|-------|----------|
| `caveman` | Ultra-terse mode. Say "caveman mode" or "less tokens". |
| `code-qa` | Code review, diff critique, UI/UX audit, debugging. |
| `diagnose` | Hard bugs, performance regressions. Reproduce → minimise → hypothesise → instrument → fix → regression-test. |
| `domain-model` | Stress-test a plan against documented domain language. |
| `github-triage` | Triage issues, manage labels, prepare issues for work. |
| `grill-me` | Stress-test a design or plan via relentless questioning. |
| `improve-codebase-architecture` | Find refactoring opportunities informed by domain docs. |
| `jimmy` | JSDoc, comments, small utils, TS interfaces, simple React components (<50 lines), test stubs, changelog drafts. |
| `setup-matt-pocock-skills` | One-time setup for issue-tracker / triage / domain doc layout. |
| `setup-pre-commit` | Add Husky + lint-staged hooks. |
| `tdd` | Red-green-refactor loop for features or bugs. |
| `to-issues` | Convert a plan/PRD into independently-grabbable GitHub issues. |
| `to-prd` | Turn conversation context into a PRD on the issue tracker. |
| `triage-issue` | Explore codebase to find root cause, then create issue with TDD fix plan. |
| `zoom-out` | Need broader context or higher-level perspective on a section. |

## Tools

- **GitHub MCP** — Issues, PRs, branches, repos
- **Playwright MCP** — Browser automation, screenshots, snapshots
- **Context7** — Library documentation lookup

## Project Docs

- **Issue tracker:** GitHub Issues. See `docs/agents/issue-tracker.md`.
- **Triage labels:** See `docs/agents/triage-labels.md`.
- **Domain docs:** Single-context layout. See `docs/agents/domain.md`.
