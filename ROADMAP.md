# ROADMAP

> **Lebendes Dokument:** Diese Datei verbindet strategische Planung mit operativem Tracking.
>
> **Workflow:** ROADMAP (Plan) → GitHub Issue (Tracking) → Branch/Commit (Umsetzung) → Changelog (Dokumentation)

---

## 🔄 Unser Entwicklungsprozess

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  ROADMAP    │────→│ GitHub Issue │────→│   Commit    │────→│  CHANGELOG  │
│  (Planung)  │     │ (Tracking)   │     │ (Umsetzung) │     │ (Release)   │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
```

### Schritt-für-Schritt

1. **Idee erfassen** → In ROADMAP unter "Geplante Features" oder "Backlog" eintragen
2. **Ticket erstellen** → [GitHub Issue anlegen](https://github.com/kod0r/fishermans-quiz/issues/new) mit Label (`enhancement`, `bug`, `docs`)
3. **Issue-Nummer notieren** → In ROADMAP die Issue-Nummer verlinken (`#42`)
4. **Entwickeln** → Branch erstellen (optional), Commits mit Conventional Commits + Issue-Referenz:
   ```bash
   git commit -m "feat(ui): add responsive grid for mobile (#5)"
   ```
5. **Abschließen** → Issue schließen, ROADMAP als "erledigt" markieren
6. **Changelog** → Eintrag in [CHANGELOG.md](./CHANGELOG.md) unter `[Unreleased]`

---

## 🚧 Aktueller Sprint

### In Bearbeitung

_Keine aktiven Tickets._

---

## 📋 Offene Tickets

| ROADMAP # | GitHub Issue                                            | Titel                                        | Priorität | Status |
| --------- | ------------------------------------------------------- | -------------------------------------------- | --------- | ------ |
| #05       | [#1](https://github.com/kod0r/fishermans-quiz/issues/1) | Responsive Design für mobile Geräte          | medium    | offen  |
| #06       | [#2](https://github.com/kod0r/fishermans-quiz/issues/2) | Accessibility (ARIA, Keyboard, Screenreader) | medium    | offen  |
| #07       | [#3](https://github.com/kod0r/fishermans-quiz/issues/3) | Antworten nachträglich korrigieren           | low       | offen  |
| #08       | [#4](https://github.com/kod0r/fishermans-quiz/issues/4) | Unit-Tests für Store-Logik                   | low       | offen  |

**→ [Neues Issue anlegen](https://github.com/kod0r/fishermans-quiz/issues/new)**

---

## ✅ Erledigte Tickets

| Sprint     | ROADMAP # | GitHub Issue | Titel                           | Datum      |
| ---------- | --------- | ------------ | ------------------------------- | ---------- |
| 2026-04-20 | #01       | —            | Projekt-Initialisierung         | 2026-04-20 |
| 2026-04-20 | #02       | —            | AGENTS.md & Conventions         | 2026-04-20 |
| 2026-04-20 | #03       | —            | Sidebar topleft verankern       | 2026-04-20 |
| 2026-04-20 | #03a      | —            | Falsche Antworten klappbar      | 2026-04-20 |
| 2026-04-20 | #03b      | —            | Meta-Progress-Box comprehensive | 2026-04-20 |
| 2026-04-20 | #03c      | —            | Logik-Review & Bugfix           | 2026-04-20 |
| 2026-04-20 | #04       | —            | Lazy Loading Quiz-Daten         | 2026-04-20 |

---

## 💡 Geplante Features (Backlog)

- [ ] Android- und iOS versions
- [ ] Dunkel-/Hell-Modus Umschaltung
- [ ] Fragen-Favoriten markieren
- [ ] Zeitgesteuerte Prüfungssimulation
- [ ] Statistik-Export (CSV/JSON)

---

## Regeln für dieses Dokument

- **Wöchentlich reviewen:** Was wurde geschafft? Was ist neu dazugekommen?
- **Issue-Nummern pflegen:** Sobald ein GitHub Issue existiert, hier verlinken
- **Nicht duplizieren:** Details gehören ins GitHub Issue, nicht in die ROADMAP
- **Sprint-Grenzen:** Erledigte Tickets nach 2–4 Wochen in "Archiv" verschieben
