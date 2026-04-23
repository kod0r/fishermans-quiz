# .agents — How We Work Here

Copy this entire `.agents/` directory into any new project.
Then customize `MASTER.md` for the project.

## What's Inside

```
.agents/
├── README.md              # This file
├── MASTER.md              # Project overview (CUSTOMIZE per project)
├── MASTER.local.md        # Your personal settings (NEVER commit)
├── MULTI_AI.md            # Team roles: Kimi / k.2.6 / llama.cpp
├── settings.json          # Tool permissions
├── settings.local.json    # Local overrides (NEVER commit)
├── jimmy-prompt.md        # Junior dev intern system prompt
├── dump_project.sh        # Export project context for AI sharing
├── llama-setup.sh         # Install llama.cpp in WSL2
├── wsl-vpn-dns.sh         # WSL2 DNS + VPN config
├── test-llama.sh          # Test llama.cpp connection
├── agents/                # Agent personas
├── commands/              # Slash commands
├── rules/                 # Coding conventions
└── hooks/                 # Safety guardrails
```

## Setup for New Project

```bash
# 1. Copy this template into your new project
cp -r /path/to/feeesh/.agents ./.agents

# 2. Edit MASTER.md for your project
# 3. Adjust hooks/ if needed
# 4. Commit everything EXCEPT *.local.* files
```

## Files That Stay The Same

These are reusable across all projects:
- `agents/*.md`
- `commands/*.md`
- `rules/*.md`
- `jimmy-prompt.md`

## Files You Customize Per Project

- `MASTER.md` — Project name, tech stack, architecture
- `hooks/*.sh` — Protect project-specific files
- `settings.json` — Project-specific permissions

## Files NEVER Committed

Already in `.gitignore`:
- `MASTER.local.md`
- `settings.local.json`
