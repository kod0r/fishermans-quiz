# RTK — CLI Proxy Rule

> **All shell commands MUST be prefixed with `rtk`.**
>
> This is enforced by the project rule: no bare `npm`, `git`, `ls`, etc.

## Why

`rtk` is a CLI proxy that provides:
- Token-optimized output (removes noise, keeps essentials)
- Automatic error summarization
- Consistent formatting across tools
- Safety guardrails (prevents destructive operations)

## Installation

```bash
# Via Homebrew (recommended)
brew tap rtk/tap && brew install rtk

# Or download binary
# https://github.com/rtk-cli/rtk/releases
```

## Usage

| Without RTK (FORBIDDEN) | With RTK (REQUIRED) |
|------------------------|---------------------|
| `npm run dev` | `rtk npm run dev` |
| `git status` | `rtk git status` |
| `ls src/` | `rtk ls src/` |
| `grep -r "foo" src/` | `rtk grep -r "foo" src/` |

## Configuration

```toml
# ~/.config/rtk/config.toml
[output]
format = "compact"
max_lines = 50

[errors]
summarize = true
show_fix_suggestions = true
```

## In Scripts

When writing shell scripts or documentation, always use `rtk`:

```bash
# Good
rtk npm run build
rtk git log --oneline -10

# Bad — never do this
npm run build
git log --oneline -10
```

## Agent Reminder

If an agent outputs a shell command without `rtk`, prepend it automatically.
This is a hard rule — no exceptions.
