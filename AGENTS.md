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

### 🔑 Das wichtigste Prinzip

> **GitHub Issues sind die einzige Quelle der Wahrheit.**
>
> - ROADMAP.md hat **KEINE eigenen Nummern** — nur Links zu GitHub Issues
> - Commits referenzieren **nur GitHub Issue-Nummern** (`#1`, `#2`, …)
> - Nie zwei Nummerierungssysteme parallel führen

### Gesamtprozess (GitHub Flow)

```
Idee ──→ GitHub Issue ──→ Feature Branch ──→ PR ──→ CI grün ──→ Merge ──→ Deploy
            ↑                                                      ↓
            └────────────── Issue schließen ←────────────────────────┘
```

1. **Idee hat?** → Direkt [GitHub Issue anlegen](https://github.com/kod0r/fishermans-quiz/issues/new)
2. **Feature Branch erstellen** → `git checkout -b feat/kurzbeschreibung`
3. **Entwickeln** → Code schreiben, testen, bauen
4. **Commit** → Message mit Issue-Referenz: `feat(ui): description (#42)`
5. **Push Branch** → `git push -u origin feat/kurzbeschreibung`
6. **Pull Request erstellen** → Auf GitHub: PR mit Issue-Link
7. **CI muss grün sein** → Lint + Test + Build passen
8. **Merge** → squash oder rebase merge auf `main`
9. **Issue schließen** → In ROADMAP nach "Erledigt" verschieben
10. **Auto-Deploy** → GitHub Pages deployt nach Merge auf `main`

### ⚠️ Wichtig: Push-Regeln

> **Nie direkt auf `main` pushen.** Jede Änderung läuft über einen Feature-Branch + PR.

| Situation | Vorgehen |
|-----------|----------|
| **Normales Feature / Refactor / Docs** | Feature-Branch → Commit → Push Branch → PR → Merge |
| **Hotfix / kritischer Bug** | Feature-Branch `hotfix/...` → PR → schnell mergen |
| **ROADMAP / CHANGELOG nur** | Direkt auf main OK (kein Code-Änderung) |

**Warum keine direkten main-Pushes?**
- `main` ist immer deploy-fähig (GitHub Pages)
- CI muss grün sein bevor Code live geht
- PR-History dokumentiert jede Entscheidung
- Jederzeit rollback-fähig via Revert

**Ablauf:**
1. Kimi entwickelt auf Feature-Branch
2. Kimi pusht Branch: `git push -u origin feat/...`
3. Kimi erstellt PR auf GitHub (oder zeigt URL)
4. User merged PR auf GitHub (oder sagt Kimi: "merge PR")
5. GitHub Actions deployt automatisch nach Merge

### Commit-Messages: Conventional Commits

Alle Commits folgen dem [Conventional Commits](https://www.conventionalcommits.org/)-Standard:

```
<type>(<scope>): <description> (#<issue-nummer>)

[optional body]
```

**Typen:**
| Type | Wann verwenden |
|------|----------------|
| `feat` | Neue Features |
| `fix` | Bugfixes |
| `docs` | Dokumentation |
| `style` | Formatierung, Semikolons |
| `refactor` | Code-Refactoring |
| `test` | Tests hinzufügen/ändern |
| `chore` | Build, Dependencies |

**Scope:** Modul/Komponente (`ui`, `quiz`, `hooks`, `data`, `store`)

**Beispiele:**
```bash
git commit -m "feat(quiz): add arcade mode with 2nd-chance dialog (#3)"
git commit -m "fix(hooks): prevent navigation without loaded data (#1)"
git commit -m "test(store): add settings hook tests (#4)"
```

### Changelog — Automatisch

> **Der Changelog wird vollautomatisch aus Conventional Commits generiert.**
> Kein manuelles Pflegen nötig. Sprache/Format sind egal.

**Wie es funktioniert:**
- `conventional-changelog-cli` liest alle Commits seit dem letzten Tag
- Gruppiert nach `feat` → Features, `fix` → Bug Fixes, `BREAKING` → Breaking Changes
- Schreibt das Ergebnis in `CHANGELOG.md`

**Release-Prozess (validiert & automatisiert):**

Statt manuellem `git tag` verwenden wir `npm version` mit automatischer Validierung:

```
npm run release -- <patch|minor|major>
```

1. `npm run lint` → muss sauber sein
2. `npm run test:run` → muss passen
3. `npm run build` → muss sauber bauen
4. `npm run changelog` → generiert Changelog
5. `npm version` → bumped package.json + erstellt Commit + Tag
6. `git push --follow-tags` → pusht Commit + Tag
7. GitHub Action triggert auf Tag:
   - Baut `dist/` → ZIP
   - Erstellt Release mit Changelog + Asset

**Wichtig:** Nie mehr manuell `git tag` erstellen — immer `npm run release` verwenden.

**SemVer-Entscheidung:**
| Was passiert | Befehl |
|-------------|--------|
| Bugfix / Patch | `npm run release -- patch` (0.1.1 → 0.1.2) |
| Neues Feature | `npm run release -- minor` (0.1.1 → 0.2.0) |
| Breaking Change | `npm run release -- major` (0.1.1 → 1.0.0) |

### ROADMAP.md — Regeln

- **Keine eigenen IDs** — nur GitHub Issue-Links (`[#3](...)`)
- **Drei Sektionen:** "In Arbeit", "Geplant", "Erledigt"
- **Keine Details** — die gehören ins GitHub Issue
- **Wöchentlich reviewen:** Erledigtes nach 2–4 Wochen archivieren

### GitHub Issues — Regeln

- **Erstellen:** [github.com/kod0r/fishermans-quiz/issues/new](https://github.com/kod0r/fishermans-quiz/issues/new)
- **Labels:** `enhancement`, `bug`, `docs`
- **Titel-Format:** `<type>(<scope>): Kurzbeschreibung`
- **NIE wiederverwenden** — wenn ein Issue obsolet wird, schließen und neues anlegen

### Branching — Standard Workflow

**Jede Änderung läuft über einen Feature-Branch:**

```bash
# 1. Branch erstellen (ausgehend von aktuellem main)
git checkout -b feat/responsive-design

# 2. Entwickeln & commiten
git commit -m "feat(ui): add responsive breakpoints (#1)"

# 3. Branch pushen
git push -u origin feat/responsive-design

# 4. Auf GitHub: Pull Request erstellen
# 5. CI muss grün sein
# 6. Merge auf GitHub (oder via gh CLI)
```

**Branch-Namen:**
| Präfix | Verwendung |
|--------|-----------|
| `feat/` | Neues Feature |
| `fix/` | Bugfix |
| `hotfix/` | Kritischer Bug (schneller Merge) |
| `docs/` | Dokumentation |
| `refactor/` | Code-Refactoring |
| `test/` | Tests |
| `chore/` | Dependencies, Build, CI |

**Beispiele:**
```bash
git checkout -b feat/arcade-mode
git checkout -b fix/quiz-loader-validation
git checkout -b hotfix/vite-security-patch
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

## 🤖 Kimi Auto-Mode & Autonomie-Matrix

> **Ziel:** Kimi soll so viel wie möglich selbstständig erledigen. Der User gibt nur noch Richtung vor — Umsetzung läuft autonom.

### Autonomie-Levels

| Level | Aktion | Kimi darf... | User-Input nötig |
|-------|--------|--------------|-----------------|
| **A1** | Lint/Format fixes | Sofort fixen & commiten | ❌ Nein |
| **A1** | Test-Updates bei Refactor | Anpassen & commiten | ❌ Nein |
| **A1** | ROADMAP.md Sync (/feierabend) | Automatisch abgleichen & commiten | ❌ Nein |
| **A1** | Dependabot PRs (Patch/Minor) | Reviewen, mergen, ROADMAP updaten | ❌ Nein |
| **A1** | Changelog-Generation | Vollautomatisch in CI | ❌ Nein |
| **A2** | Dependency Upgrades (Major) | Plan erstellen, Issue kommentieren | ⚠️ Nur "Go" für Umsetzung |
| **A2** | Feature-Branches | Erstellen, entwickeln, PR erstellen | ⚠️ Nur "Merge" oder "Ändern" |
| **A2** | Bugfix-Hotfixes | Branch, Fix, PR — dann User pingen | ⚠️ Merge-Approval |
| **A3** | Breaking Changes (API, Architektur) | Plan erstellen, NICHT umsetzen | ✅ User-Approval nötig |
| **A3** | Security-Critical Changes | Plan erstellen, NICHT umsetzen | ✅ User-Approval nötig |
| **A3** | Release (`npm run release`) | Vorbereiten, User pingen | ✅ User führt aus |

### Standard-Workflow für Dependency-Upgrades

```
Dependabot PR erkannt
        ↓
┌─────────────────┐
│ Patch oder Minor?│──Yes──→ Auto-review → CI grün → Auto-merge → ROADMAP sync
└─────────────────┘
        ↓ No (Major)
┌─────────────────┐
│ Peer-Dep Konflikt?│──Yes──→ Issue erstellen mit Plan → User wartet auf "Go"
└─────────────────┘
        ↓ No
┌─────────────────┐
│ Breaking Changes? │──Yes──→ Evaluations-Branch → Test-Daten sammeln → User entscheidet
└─────────────────┘
        ↓ No
Auto-review → CI grün → Auto-merge
```

### Auto-Merge-Regeln für Dependabot

Kimi darf SOFORT mergen wenn:
- ✅ Patch-Version (z.B. 1.2.3 → 1.2.4)
- ✅ Minor-Version (z.B. 1.2.3 → 1.3.0) OHNE Peer-Dep-Änderungen
- ✅ CI ist grün (lint + test + build)
- ✅ Nur package.json + package-lock.json geändert

Kimi darf NICHT mergen wenn:
- ❌ Major-Version (z.B. 1.x → 2.x)
- ❌ Peer-Dependency-Conflict
- ❌ Neue Sub-Dependencies mit >10KB Bundle-Impact
- ❌ CI rot
- ❌ Source-Code-Dateien außerhalb von package.json geändert

### Feature-Entwicklung Auto-Workflow

```
User: "Implementiere X"
        ↓
Kimi: Issue prüfen / erstellen → Branch `feat/x` → Entwickeln
        ↓
Kimi: Testen (npm run test:run) → Lint (npm run lint) → Build (npm run build)
        ↓
Kimi: PR erstellen mit Beschreibung + Test-Ergebnissen
        ↓
User: "Merge" oder "Änder Y"
        ↓
Kimi: Merge (oder Ändern → Re-PR)
        ↓
Auto: GitHub Pages Deploy + ROADMAP sync
```

### Kimi-interne Checkliste vor jedem PR

- [ ] `npm run lint` sauber
- [ ] `npm run test:run` alle 59+ Tests grün
- [ ] `npm run build` sauber (tsc + vite)
- [ ] Keine unbeabsichtigten Dateien im Diff
- [ ] Commit-Message folgt Conventional Commits
- [ ] Issue referenziert in Commit und PR

### Wann Kimi den User PINGEN muss

- Vor jedem `npm run release` (Version-Bump ist final)
- Bei Major Dependency-Upgrades (vor Umsetzung)
- Wenn CI rot bleibt nach 2 Fix-Versuchen
- Bei Architektur-Änderungen (State-Management, Routing, etc.)
- Wenn ein Issue >3 Stunden Aufwand braucht

## Bekannte Einschränkungen
- Kein Backend – alles client-seitig
- Bilderkennungsfragen referenzieren lokale JPEGs in `public/images/`
- Kein echter Router – View-Switching über State
