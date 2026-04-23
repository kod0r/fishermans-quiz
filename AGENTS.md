# Agent Handbook

> **Project context:** See `.agents/MASTER.md`
> **Coding conventions:** See `.agents/rules/`
> **Agent personas:** See `.agents/agents/`
> **RTK rules:** See `RTK.md`
> **Multi-AI setup:** See `.agents/MULTI_AI.md`

## Team Roles

| Role | AI | Platform | Responsibility |
|------|-----|----------|---------------|
| **Senior Dev** | Kimi Code | VS Code | Implementation, refactoring, testing, CI/CD |
| **Product Owner** | k.2.6 thinking | Web UI | Architecture, planning, research, product decisions |
| **Intern** | llama.cpp (8B) | Local (Windows) | Documentation, small tasks, code drafts |

## Git & GitHub Workflow

### The Most Important Principle

> **GitHub Issues are the single source of truth.**
>
> - ROADMAP.md has **NO own numbers** — only links to GitHub Issues
> - Commits reference **only GitHub Issue numbers** (`#1`, `#2`, …)
> - Never run two numbering systems in parallel

### Process

```
Idea ──→ GitHub Issue ──→ Feature Branch ──→ PR ──→ CI green ──→ Merge
            ↑                                               ↓
            └────────────── Close issue ←─────────────────────┘
```

1. **Have an idea?** → Create a GitHub Issue
2. **Create feature branch** → `git checkout -b feat/description`
3. **Develop** → Write code, test, build
4. **Commit** → `type(scope): description (#issue)`
5. **Push branch** → `git push -u origin feat/description`
6. **Create Pull Request** → On GitHub with issue link
7. **CI must be green** → Lint + Test + Build
8. **Merge** → squash or rebase merge to `main`
9. **Close issue** → Move to "Done" in ROADMAP

### Push Rules

> **Never push directly to `main`.** Every change goes through a feature branch + PR.

| Situation | Procedure |
|-----------|-----------|
| Normal feature / refactor / docs | Feature branch → Commit → Push → PR → Merge |
| Hotfix / critical bug | `hotfix/...` branch → PR → merge quickly |
| ROADMAP / CHANGELOG only | Direct push to main OK (no code change) |

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

| Level | Action | Kimi may... | User input needed |
|-------|--------|-------------|-------------------|
| **A1** | Lint/format fixes | Fix & commit | ❌ No |
| **A1** | Test updates | Adjust & commit | ❌ No |
| **A1** | ROADMAP sync | Auto-sync & commit | ❌ No |
| **A1** | Dependabot PRs (patch/minor) | Review, merge, update ROADMAP | ❌ No |
| **A2** | Feature branches | Create, develop, create PR | ⚠️ Only "Merge" or "Change" |
| **A2** | Bugfix hotfixes | Branch, fix, PR — ping user | ⚠️ Merge approval |
| **A3** | Breaking changes | Create plan, DO NOT implement | ✅ User approval |
| **A3** | Security changes | Create plan, DO NOT implement | ✅ User approval |
| **A3** | Release | Prepare, ping user | ✅ User executes |

### Auto-Merge Rules for Dependabot

Kimi may merge when:
- ✅ Patch or Minor version
- ✅ CI is green
- ✅ Only package files changed

Kimi may NOT merge when:
- ❌ Major version
- ❌ Peer-dependency conflict
- ❌ CI red
- ❌ Source code files changed

### Pre-PR Checklist

- [ ] `npm run lint` clean
- [ ] `npm run test:run` all tests green
- [ ] `npm run build` clean
- [ ] No unintended files in diff
- [ ] Commit follows Conventional Commits
- [ ] Issue referenced in commit and PR

### When Kimi Must Ping the User

- Before every release (version bump is final)
- For major dependency upgrades (before implementation)
- When CI stays red after 2 fix attempts
- For architecture changes
- When an issue requires >3 hours of effort
- When k.2.6 and Kimi disagree on implementation
