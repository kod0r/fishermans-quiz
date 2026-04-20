# Fisherman's Quiz – Projekt-Kontext

## Projektübersicht
Interaktive Web-App zum Lernen für die **staatliche Fischerprüfung** (Bayerischer Fragenkatalog, Stand 11.03.2026). 1052 Fragen in 6 Bereichen mit Bilderkennung, Progress-Tracking und Meta-Lernsystem.

## Tech-Stack
- **Framework:** Vite 7 + React 19 + TypeScript 5.9
- **Styling:** Tailwind CSS 3.4 + shadcn/ui (Radix-UI Primitives)
- **Routing:** Kein Router – View-State über `useState` (`start` | `quiz` | `progress`)
- **State:** React-Hooks (kein Redux/Zustand)
  - `useQuizRun` – Session-basiert (localStorage)
  - `useMetaProgress` – Persistentes Lern-Tracking (localStorage)
- **Icons:** lucide-react
- **Dev-Port:** 3000 (`vite.config.ts`)

## Projektstruktur
```
src/
├── views/           StartView, QuizView, ProgressView
├── components/      Sidebar + shadcn/ui Komponenten
├── hooks/           useQuiz (Orchestrierung), use-mobile
├── store/           quizRun.ts, metaProgress.ts
├── types/           quiz.ts (Interfaces für Frage, QuizRun, MetaProgression)
├── utils/           storage.ts (localStorage-Wrapper), quizLoader.ts (Lazy Loading)
└── lib/             utils.ts (cn-Helfer)
public/
├── images/          54 Bilder für Bilderkennungsfragen (page{NNN}_img{M}.jpeg)
└── data/
    ├── quiz_meta.json           Meta-Daten + Fragen-Index
    ├── bereiche/*.json          6 Bereichs-Chunks (lazy geladen)
    └── quiz_data.json           Original (Fallback)
```

## Kernkonzepte

### Frage-Struktur (`types/quiz.ts`)
```ts
interface Frage {
  id: string;
  bereich: string;          // z.B. "Biologie"
  frage: string;
  antworten: { A: string; B: string; C: string };
  richtige_antwort: string; // "A" | "B" | "C"
  bild?: boolean;
  bild_url?: string;
}
```

### Bereiche (6 Stück)
| ID | Label | Fragen |
|---|---|---|
| Biologie | Biologie | 319 |
| Gewässerkunde | Gewässerkunde | 129 |
| Gewässerpflege | Gewässerpflege | 136 |
| Fanggeräte und -methoden | Fanggeräte & Methoden | 192 |
| Recht | Recht | 222 |
| Bilderkennung | Bilderkennung | 54 |

### Meta-Progression-System
- **attempts:** Wie oft wurde die Frage beantwortet?
- **correctStreak:** Wie viele richtige Antworten in Folge?
- **Meister:** `correctStreak >= 3` → Frage als gemeistert markiert
- **Lern-Status:** `attempts > 0 && correctStreak < 3`
- **Stats:** totalRuns, totalQuestionsAnswered, totalCorrect, bestStreak, currentStreak

### Quiz-Run (Session)
- Bereichsauswahl → Fragen gemischt (Fisher-Yates)
- Läuft im lokalen State + localStorage
- Bereiche können während eines Runs hinzugefügt werden
- Navigation zwischen Fragen (vor/zurück, Sprung)

## Coding-Conventions
- **Sprache:** Deutsch für Domain-Begriffe (`starteQuiz`, `beantworteFrage`, `meisterCount`)
- **Imports:** `@/` Alias für `./src`
- **Komponenten:** Default exports für Views, Named exports für UI/Hooks
- **Tailwind:** Dunkles Theme (slate/blue/teal Farbpalette)
- **shadcn/ui:** Standard-Patterns für Card, Button, Progress, Tooltip etc.

## Git & GitHub Workflow

### Gesamtprozess

```
ROADMAP.md (Planung) → GitHub Issue (Tracking) → Commit (Umsetzung) → CHANGELOG.md (Doku)
```

1. **Idee** in `ROADMAP.md` unter "Geplante Features" oder "Backlog" eintragen
2. **GitHub Issue** anlegen mit Label (`enhancement`, `bug`, `docs`)
3. **Issue-Nummer** in `ROADMAP.md` verlinken (z.B. `[#1](...)`)
4. **Entwickeln** → Code schreiben und testen
5. **Commit & Push erst nach expliziter Erlaubnis** → Siehe unten
6. **Issue schließen** → In `ROADMAP.md` als "erledigt" markieren
7. **Changelog** → Eintrag in `[Unreleased]` (vor Release in Version verschieben)

### ⚠️ Wichtig: Commit & Push nur nach Erlaubnis

> **Der Nutzer möchte, dass Kimi vor jedem `git commit` und `git push` explizit um Erlaubnis fragt.**
>
> Das gilt auch für:
> - `git commit` (alle Varianten)
> - `git push` (auch `--force`)
> - `git push --set-upstream`
> - Uploads via GitHub API / MCP
>
> **Ablauf:**
> 1. Kimi zeigt die geänderten Dateien und die vorgeschlagene Commit-Message
> 2. Kimi fragt: "Soll ich committen und pushen?"
> 3. Erst nach Bestätigung des Nutzers wird ausgeführt
>
> **Ausnahme:** `git add` und lokale `git status` sind ohne Erlaubnis erlaubt (nur Vorbereitung).

### Commit-Messages: Conventional Commits
Alle Commits folgen dem [Conventional Commits](https://www.conventionalcommits.org/)-Standard:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Typen:**
| Type | Wann verwenden |
|------|----------------|
| `feat` | Neue Features |
| `fix` | Bugfixes |
| `docs` | Dokumentation |
| `style` | Formatierung, Semikolons, etc. (keine Code-Änderung) |
| `refactor` | Code-Refactoring (weder feat noch fix) |
| `test` | Tests hinzufügen/ändern |
| `chore` | Build-Prozess, Dependencies, etc. |

**Scope:** Modul/Komponente (z.B. `ui`, `quiz`, `hooks`, `data`, `agents`)

**Beispiele:**
```bash
git commit -m "feat(quiz): add collapsible wrong-answers section in ProgressView (#2)"
git commit -m "fix(hooks): prevent navigation to quiz without loaded data"
git commit -m "perf(data): implement staged loading for quiz questions"
git commit -m "docs(agents): add GitHub workflow conventions"
git commit -m "chore(deps): update vite to 7.3.0"
```

### GitHub Issues
- **Erstellen:** [github.com/kod0r/fishermans-quiz/issues/new](https://github.com/kod0r/fishermans-quiz/issues/new)
- **Labels:** `enhancement` (Feature), `bug` (Fehler), `docs` (Doku)
- **Verknüpfung:** In Commits `#1`, `#2` etc. referenzieren – GitHub verlinkt automatisch

### Branching (für Ein-Personen-Projekt optional)
Für kleine Features direkt auf `main` committen. Bei größeren Änderungen:
```bash
git checkout -b feat/responsive-design
# ... arbeiten ...
git commit -m "feat(ui): add responsive breakpoints (#1)"
git push -u origin feat/responsive-design
# GitHub → Pull Request → Merge
```

## Wichtige Dateien
- `src/hooks/useQuiz.ts` – Haupt-Hook, orchestriert Run + Meta + Datenladung
- `src/store/quizRun.ts` – Session-Logik (Start, Antworten, Navigation)
- `src/store/metaProgress.ts` – Lern-Tracking über Sessions hinweg
- `src/utils/quizLoader.ts` – Lazy Loading der Quiz-Daten
- `ROADMAP.md` – Aktuelle Planung (wird in GitHub Issues überführt)
- `CHANGELOG.md` – Versionshistorie

## Scripts
```bash
npm run dev      # Port 3000
npm run build    # tsc + vite build → dist/
npm run preview  # dist/ preview
```

## Bekannte Einschränkungen
- Kein Backend – alles client-seitig
- Bilderkennungsfragen referenzieren lokale JPEGs in `public/images/`
- Kein echter Router – View-Switching über State
