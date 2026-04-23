---
paths:
  - ".github/workflows/*"
---

# CI/CD Conventions

## GitHub Actions

- One workflow file per concern.
- All workflows must pass before merge.
- Use `npm ci` for reproducible installs.
- Cache `node_modules` between runs.

## Workflow Rules

- `pages.yml`: Lint → Test → Build → Deploy to GitHub Pages.
- `release.yml`: Trigger on `v*` tags. Build → ZIP → Release notes.
- `dependabot-track-closed.yml`: Auto-create issues for closed Dependabot PRs.

## Secrets

- No hardcoded tokens in workflow files.
- Use `secrets.GITHUB_TOKEN` or repository secrets.
