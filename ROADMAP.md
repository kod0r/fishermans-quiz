# ROADMAP

> **Lebendes Dokument:** Übersicht über geplante, laufende und erledigte Arbeit.
>
> **WICHTIG:** GitHub Issues sind die einzige Quelle der Wahrheit für Tracking.
> Diese ROADMAP ist eine lesbare Übersicht — keine separate Nummerierung.

---

## 🔄 Workflow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│   Idee      │────→│ GitHub Issue │────→│   Commit    │────→│  CHANGELOG  │
│  (ROADMAP)  │     │ (Tracking)   │     │ (Umsetzung) │     │ (Release)   │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
```

### Regeln

1. **Jedes Feature beginnt als GitHub Issue** — nicht als ROADMAP-Eintrag mit eigener Nummer
2. **ROADMAP hat KEINE eigenen IDs** — nur Links zu GitHub Issues (`#1`, `#2`, …)
3. **Commits referenzieren GitHub Issues** — `feat(ui): beschreibung (#42)`
4. **Wenn ein Issue erledigt ist:** In ROADMAP nach "Erledigt" verschieben + Datum
5. **Wenn ein Issue obsolet wird:** Auf GitHub schließen + aus ROADMAP entfernen

---

## 🚧 In Arbeit

_Keine aktiven Tickets._

---

## 📋 Geplant (Backlog)

| Thema | GitHub Issue | Priorität |
|-------|-------------|-----------|
| Erstes GitHub Release v0.1.0 | [#12](https://github.com/kod0r/fishermans-quiz/issues/12) | high |
| App als Package publizieren (Docker / GitHub Pages) | [#13](https://github.com/kod0r/fishermans-quiz/issues/13) | high |
| Standalone offline Windows-Version | [#5](https://github.com/kod0r/fishermans-quiz/issues/5) | low |
| Android- und iOS-Version | [#6](https://github.com/kod0r/fishermans-quiz/issues/6) | low |
| Dunkel-/Hell-Modus Umschaltung | [#7](https://github.com/kod0r/fishermans-quiz/issues/7) | low |
| Fragen-Favoriten markieren | [#8](https://github.com/kod0r/fishermans-quiz/issues/8) | low |
| Zeitgesteuerte Prüfungssimulation | [#9](https://github.com/kod0r/fishermans-quiz/issues/9) | low |
| Statistik-Export (CSV/JSON) | [#10](https://github.com/kod0r/fishermans-quiz/issues/10) | low |

**→ [Neues Issue anlegen](https://github.com/kod0r/fishermans-quiz/issues/new)**

---

## ✅ Erledigt

| Thema | GitHub Issue | Datum |
|-------|-------------|-------|
| Responsive Design | [#1](https://github.com/kod0r/fishermans-quiz/issues/1) | 2026-04-20 |
| Accessibility (ARIA, Keyboard) | [#2](https://github.com/kod0r/fishermans-quiz/issues/2) | 2026-04-20 |
| Unit-Tests für Store-Logik | [#4](https://github.com/kod0r/fishermans-quiz/issues/4) | 2026-04-20 |
| Arcade-Modus + Settings-Toggle | [#3](https://github.com/kod0r/fishermans-quiz/issues/3) | 2026-04-20 |
| Hardcore-Modus (sofortiges Sperren, keine 2nd-Chance) | [#3](https://github.com/kod0r/fishermans-quiz/issues/3) | 2026-04-20 |

### Erledigt (vor GitHub-Issue-System)

> Diese Arbeiten wurden erledigt bevor das Projekt auf GitHub-Issues als "single source of truth" umgestellt wurde. Sie sind hier zur Vollständigkeit dokumentiert.

| Thema | Datum |
|-------|-------|
| Projekt-Initialisierung | 2026-04-20 |
| AGENTS.md & Conventions | 2026-04-20 |
| Sidebar topleft verankern | 2026-04-20 |
| Falsche Antworten klappbar | 2026-04-20 |
| Meta-Progress-Box comprehensive | 2026-04-20 |
| Logik-Review & Bugfix | 2026-04-20 |
| Lazy Loading Quiz-Daten | 2026-04-20 |

---

## Regeln für dieses Dokument

- **NIE eigene Nummern vergeben** — immer GitHub Issue-Nummern verwenden
- **Wöchentlich reviewen:** Was wurde geschafft? Was ist neu?
- **Nicht duplizieren:** Details gehören ins GitHub Issue, nicht in die ROADMAP
- **Sprint-Grenzen:** Erledigte Tickets nach 2–4 Wochen in "Archiv" verschieben
