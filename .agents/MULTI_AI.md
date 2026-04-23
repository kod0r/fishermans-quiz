# Multi-AI Orchestration

## Team

| Role | AI | Platform | Primary Task |
|------|-----|----------|-------------|
| **Senior Dev** | Kimi Code | VS Code | Implementation, refactoring, testing, CI/CD |
| **Product Owner** | k.2.6 thinking | Web UI | Architecture, planning, research, product decisions |
| **Praktikant** | llama.cpp (8B) | Local (Windows) | Documentation, small tasks, learning assistant |

## Senior Dev (Kimi Code)

**When:** Daily development, bugfixes, features, dependency updates.
**Context:** Full project context via `.agents/MASTER.md` + `dump_project.sh`.
**Workflow:**
1. Product Owner or User says "Implement X"
2. Check/create GitHub Issue
3. Create branch → develop → test → lint → build
4. Create PR
5. User approves/merges

## Product Owner (k.2.6 thinking)

**When:** Breaking changes, features >3h, backend/platform architecture, research.
**Context:** User shares `MASTER.md` + `dump_project.sh` + specific question.
**Workflow:**
1. User asks k.2.6: "How do we design the backend for OnlyFish?"
2. k.2.6 analyzes, researches, gives structured recommendation
3. User hands result to Kimi: "Implement per k.2.6's design"
4. Kimi executes

## Praktikant (llama.cpp, 8B on RTX 3070 Ti)

**Realistic capabilities:** Junior/Praktikant level. Good for repetitive, well-defined tasks.

**Do:**
- Read/understand documentation and summarize
- Write JSDoc/comments for simple functions
- Generate test cases for utility functions
- Explain code for learning purposes
- Write changelog entries from commits
- Suggest small refactorings (rename variables, extract functions)
- Generate simple code snippets (utils, helpers)
- Conversions (JSON → TypeScript interface)

**Don't:**
- Architecture reviews
- Complex bug hunting
- Security reviews
- Large features
- Design decisions
- Code review of senior dev code

**Setup:**
```bash
# Model: Gemma-4-E4B-it or Qwen2.5-Coder-7B-Q4_K_M
# Server: llama-server.exe -m model.gguf --n-gpu-layers 999 --ctx-size 8192 --port 8080
# Speed: ~50-80 tokens/s on RTX 3070 Ti
```

**Praktikant workflow:**
1. Senior Dev writes small, focused task + context (max 2-3 files)
2. Praktikant processes the task
3. Senior Dev reviews the result
4. Senior Dev integrates or discards

## Context Sharing Protocol

```
1. Sender-AI: "rtk summary dump_project.sh" → project_dump.txt
2. User copies relevant sections
3. Receiver-AI gets context + specific question
```

**For Praktikant:**
- Context max 2-3 files + task description
- 8B model has limited context (~4K-8K tokens effective)
- No full project dumps

## Research

Conducted by Product Owner (k.2.6), not Praktikant.
See `RESEARCH.md` for methodology.
