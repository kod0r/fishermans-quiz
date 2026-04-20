# ROADMAP

> **Hinweis:** Diese Datei ist eine temporäre Übersicht. Sobald ein GitHub-Repository existiert, werden alle Tickets in **GitHub Issues** überführt. Diese Datei dient dann nur noch als grobe Roadmap.

---

## Offene Tickets

> **Jetzt auf GitHub:** [github.com/kod0r/fishermans-quiz/issues](https://github.com/kod0r/fishermans-quiz/issues)
> Neue Tickets bitte direkt als GitHub Issues anlegen. Diese Tabelle dient nur als Übersicht.

| # | Ticket | Beschreibung | Priorität | Status |
|---|--------|--------------|-----------|--------|
| #05 | Responsive Design | Mobile Layouts prüfen & optimieren (aktuell max-w-3xl/4xl) | medium | offen |
| #06 | Accessibility | ARIA-Labels, Keyboard-Navigation, Screenreader-Support | medium | offen |
| #07 | Antwort-Korrektur | Bereits beantwortete Fragen nachträglich ändern lassen | low | offen |
| #08 | Unit-Tests | Store-Logik (quizRun, metaProgress) mit vitest testen | low | offen |

---

## Erledigte Tickets

| # | Ticket | Beschreibung | Abgeschlossen |
|---|--------|--------------|---------------|
| #01 | Projekt-Initialisierung | ZIP entpackt, npm install, Build-Test | 2026-04-20 |
| #02 | AGENTS.md | Projekt-Kontext & Conventions dokumentiert | 2026-04-20 |
| #03 | Sidebar topleft | Navigation oben links verankert | 2026-04-20 |
| #03a | Falsche Antworten klappbar | ProgressView: Collapsible für falsche Antworten | 2026-04-20 |
| #03b | Meta-Progress-Box | Comprehensive Box zwischen Run & Bereichsauswahl | 2026-04-20 |
| #03c | Logik-Review | Bugfix: starteQuiz() ohne Daten-Schutz | 2026-04-20 |
| #04 | Lazy Loading Quiz-Daten | 420KB JSON → 28KB Meta + 6 Bereichs-Chunks | 2026-04-20 |

---

## Regeln

1. **Neues Ticket:** Nächste freie Nummer vergeben, in Tabelle eintragen
2. **Start:** Status auf "in Bearbeitung" setzen
3. **Erledigt:** In "Erledigte Tickets" verschieben, mit Datum versehen
4. **GitHub-Migration:** Bei Repo-Erstellung alle offenen Tickets als GitHub Issues anlegen und hier verlinken
