# ROADMAP

> **Living Document:** Overview of planned, ongoing, and completed work.
>
> **IMPORTANT:** GitHub Issues are the single source of truth for tracking.
> This ROADMAP is a readable overview — no separate numbering.

---

## 🔄 Workflow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│   Idea      │────→│ GitHub Issue │────→│   Commit    │────→│  CHANGELOG  │
│  (ROADMAP)  │     │ (Tracking)   │     │ (Implementation) │     │ (Release)   │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
```

### Rules

1. **Every feature starts as a GitHub Issue** — not as a ROADMAP entry with its own number
2. **ROADMAP has NO own IDs** — only links to GitHub Issues (`#1`, `#2`, …)
3. **Commits reference GitHub Issues** — `feat(ui): description (#42)`
4. **When an issue is completed:** Move to "Done" in ROADMAP + date
5. **When an issue becomes obsolete:** Close on GitHub + remove from ROADMAP

---

## 🚧 In Progress

#7

---

## 📋 Planned (Backlog)

| Topic | GitHub Issue | Priority |
|-------|-------------|-----------|
| Standalone offline Windows-Version | [#5](https://github.com/kod0r/fishermans-quiz/issues/5) | low |
| Android- und iOS-Version | [#6](https://github.com/kod0r/fishermans-quiz/issues/6) | low |
| Dunkel-/Hell-Modus Umschaltung | [#7](https://github.com/kod0r/fishermans-quiz/issues/7) | low |
| Zeitgesteuerte Prüfungssimulation | [#9](https://github.com/kod0r/fishermans-quiz/issues/9) | low |
| Multi-Language Support | [#55](https://github.com/kod0r/fishermans-quiz/issues/55) | medium |

**→ [Create new issue](https://github.com/kod0r/fishermans-quiz/issues/new)**

---

## ✅ Done

| Topic | GitHub Issue | Date |
|-------|-------------|-------|
| Upgrade zu Vite 8 + @vitejs/plugin-react 6 | [#37](https://github.com/kod0r/fishermans-quiz/issues/37) | 2026-04-21 |
| Upgrade zu ESLint 10 + @eslint/js 10 | [#38](https://github.com/kod0r/fishermans-quiz/issues/38) | 2026-04-21 |
| Evaluierung recharts 3.x Migration | [#39](https://github.com/kod0r/fishermans-quiz/issues/39) | 2026-04-21 |
| Verbesserung Antwortmodus im Arcade | [#45](https://github.com/kod0r/fishermans-quiz/issues/45) | 2026-04-21 |
| UI Elemente farblich abstimmen | [#47](https://github.com/kod0r/fishermans-quiz/issues/47) | 2026-04-21 |
| Fragen-Box Größe fixieren | [#48](https://github.com/kod0r/fishermans-quiz/issues/48) | 2026-04-21 |
| Quiz-Fortschritt Aktueller Durchlauf Redesign | [#49](https://github.com/kod0r/fishermans-quiz/issues/49) | 2026-04-21 |
| Fragen-Favoriten markieren | [#8](https://github.com/kod0r/fishermans-quiz/issues/8) | 2026-04-21 |
| Statistik-Export (CSV/JSON) | [#10](https://github.com/kod0r/fishermans-quiz/issues/10) | 2026-04-21 |
| Beenden des Themenbereichs | [#46](https://github.com/kod0r/fishermans-quiz/issues/46) | 2026-04-21 |
| Responsive Design | [#1](https://github.com/kod0r/fishermans-quiz/issues/1) | 2026-04-20 |
| Accessibility (ARIA, Keyboard) | [#2](https://github.com/kod0r/fishermans-quiz/issues/2) | 2026-04-20 |
| Unit-Tests für Store-Logik | [#4](https://github.com/kod0r/fishermans-quiz/issues/4) | 2026-04-20 |
| Arcade-Modus + Settings-Toggle | [#3](https://github.com/kod0r/fishermans-quiz/issues/3) | 2026-04-20 |
| Hardcore-Modus (sofortiges Sperren, keine 2nd-Chance) | [#3](https://github.com/kod0r/fishermans-quiz/issues/3) | 2026-04-20 |
| Erstes GitHub Release v0.1.0 | [#12](https://github.com/kod0r/fishermans-quiz/issues/12) | 2026-04-20 |
| App als Package publizieren | [#13](https://github.com/kod0r/fishermans-quiz/issues/13) | 2026-04-20 |
| Workflow-Audit: Kritische Fixes (CI, Vite, Zod) | [#14](https://github.com/kod0r/fishermans-quiz/issues/14) | 2026-04-20 |
| Workflow-Audit: High-Priority Fixes (Storage, Tests, QuizRun) | [#16](https://github.com/kod0r/fishermans-quiz/issues/16) | 2026-04-20 |
| Workflow-Audit: Daten-Inkonsistenz-Fix | [#17](https://github.com/kod0r/fishermans-quiz/issues/17) | 2026-04-20 |
| ZIP-Artefakte entfernt | [#18](https://github.com/kod0r/fishermans-quiz/issues/18) | 2026-04-20 |
| Node-Version-Lock (.nvmrc, engines) | [#19](https://github.com/kod0r/fishermans-quiz/issues/19) | 2026-04-20 |
| Dead Dependencies bereinigt | [#21](https://github.com/kod0r/fishermans-quiz/issues/21) | 2026-04-20 |
| Dependabot konfiguriert | [#22](https://github.com/kod0r/fishermans-quiz/issues/22) | 2026-04-20 |
| Release-Validation Scripts | [#23](https://github.com/kod0r/fishermans-quiz/issues/23) | 2026-04-20 |
| Kim-Hook durch verbale Approval-Workflow ersetzt | [#15](https://github.com/kod0r/fishermans-quiz/issues/15) | 2026-04-20 |
| ROADMAP.md Regeln konsolidiert | [#20](https://github.com/kod0r/fishermans-quiz/issues/20) | 2026-04-20 |

### Done (before GitHub Issue system)

> These tasks were completed before the project switched to GitHub Issues as the "single source of truth". They are documented here for completeness.

| Topic | Date |
|-------|-------|
| Projekt-Initialisierung | 2026-04-20 |
| AGENTS.md & Conventions | 2026-04-20 |
| Sidebar topleft verankern | 2026-04-20 |
| Falsche Antworten klappbar | 2026-04-20 |
| Meta-Progress-Box comprehensive | 2026-04-20 |
| Logik-Review & Bugfix | 2026-04-20 |
| Lazy Loading Quiz-Daten | 2026-04-20 |

---

## Rules for this document

- **NEVER assign own numbers** — always use GitHub Issue numbers
- **Review weekly:** What was accomplished? What is new?
- **Do not duplicate:** Details belong in the GitHub Issue, not in the ROADMAP
- **Sprint boundaries:** Move completed tickets to "Archive" after 2–4 weeks
