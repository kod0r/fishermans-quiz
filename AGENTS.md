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

**Beispiele:**
```bash
git commit -m "feat(quiz): add collapsible wrong-answers section in ProgressView"
git commit -m "fix(hooks): prevent navigation to quiz without loaded data"
git commit -m "perf(data): implement staged loading for quiz questions"
git commit -m "docs(agents): add GitHub workflow conventions"
```

### Tickets & Planung
- **GitHub Issues** sind das primäre Tool für Bugs, Features und Tasks
- `ROADMAP.md` dient als lokale Übersicht, bis GitHub Issues existieren
- `CHANGELOG.md` wird manuell gepflegt (später automatisch aus Conventional Commits)

### Branching (empfohlen für später)
```
main        ← Produktions-Code
  ↑
develop     ← Integrations-Branch
  ↑
feat/xyz    ← Feature-Branches
fix/abc     ← Bugfix-Branches
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
