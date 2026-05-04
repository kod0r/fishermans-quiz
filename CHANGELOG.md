## [Unreleased]

## [0.4.2](https://github.com/kod0r/fishermans-quiz/compare/v0.4.1...v0.4.2) (2026-05-04)

### Data

* **dataset:** removed 22 redacted/truncated questions permanently from catalog
  * Biologie (1), Gewässerpflege (1), Recht (19), Bilderkennung (2)
  * `quiz_meta.json` synced: 938 total, 938 fragenIndex entries
  * `BAYERISCHE_FISCHEREI_GESETZ_IDS` filter set cleaned of removed IDs
  * deleted unused monolith `quiz_data.json` and 2 orphaned images
* **dataset:** fixed typo `Schlaufenverbindungskno ten` → `Schlaufenverbindungsknoten` in Bilderkennung

### UI

* **topics:** reordered topic selection list for all game modes
  * Biologie → Fanggeräte & Methoden → Gewässerkunde → Gewässerpflege → Recht → Bilderkennung
* **theme:** default to dark mode on first visit (`defaultTheme="dark"`)

### Settings

* **defaults:** shuffle answers ON, game mode arcade, backup reminders ON
* **hud:** removed swipe-to-hide gesture; HUD always visible

### Docs

* **readme:** generalized app description (State fishing exam), updated question count to 900+

## [0.4.1](https://github.com/kod0r/fishermans-quiz/compare/v0.4.0...v0.4.1) (2026-05-03)

### Features

* **scope:** removed bavarian questions for now!
  * 97 BY-scoped question IDs hardcoded in `quizLoader.ts` and filtered at load time
  * `quiz_meta.json` counts updated: 955 total, Recht 130, Biologie 316, Gewässerpflege 134
  * Topic data files untouched — questions are hidden, not removed

### UI

* **quiz:** fixed answer box height (`h-16 sm:h-[72px]`) to fit multi-line answer text
* **quiz:** removed `truncate` from answer text — full text now wraps inside fixed-height boxes
* **quiz:** single-line answer text vertically centered with A/B/C badge
* **card:** hardcoded card height to `h-[620px]` for consistent layout

## [0.4.0](https://github.com/kod0r/fishermans-quiz/compare/v0.3.8...v0.4.0) (2026-05-01)

### Features

* **persistence:** extract `usePersistentState` hook and typed storage adapters (`localStorageAdapter`, `memoryAdapter`, per-domain creators) ([#265](https://github.com/kod0r/fishermans-quiz/issues/265))
  * `AppSettings`, `History`, `Favorites`, `Notes`, `SRS`, `MetaProgress`, `QuizRun` all migrated to adapter-backed persistence
  * Adapters perform Zod runtime validation at the storage boundary
* **modes:** extract game-mode policy modules from `useQuiz` into pure policy objects (`ArcadePolicy`, `HardcorePolicy`, `ExamPolicy`) ([#268](https://github.com/kod0r/fishermans-quiz/issues/268))
  * `ModePolicy` interface: `onAnswer`, `onAbort`, `onComplete`, `onModeSwitch`, `canStartTopic`, `canRemoveTopic`, `getStartLimit`, `getDurationSeconds`
  * Flags: `hideFeedback`, `allowsPendingRetry`
* **engine:** extract `RunEngine` pure state-transition module from `useQuizRun` ([#266](https://github.com/kod0r/fishermans-quiz/issues/266))
  * Pure fns: `createRun`, `extendRun`, `answerQuestion`, `selfAssess`, `nextQuestion`, `prevQuestion`, `jumpToQuestion`, `removeTopicFromRun`, `restartRun`, `interruptRun`, `completeRun`, `isRunExpired`, `detectInconsistency`, `purgeMissingQuestions`

### Refactors

* **startview:** extract `ModeSelector`, `StatBox`, `TopicGrid`, `StartViewDialogs` into `src/views/start/` ([#299](https://github.com/kod0r/fishermans-quiz/issues/299))
* **quality:** cleanup assertions, unused params, barrel exports, tighten eslint rules ([#300](https://github.com/kod0r/fishermans-quiz/issues/300))

### Bug Fixes

* **persistence:** block cross-mode run writes and inject `gameMode` at adapter boundary ([#272](https://github.com/kod0r/fishermans-quiz/issues/272))
* **persistence:** restore missing `gameMode` param to `createRunAdapter` calls ([#272](https://github.com/kod0r/fishermans-quiz/issues/272))
* **persistence:** add Zod runtime validation to localStorage boundary ([#273](https://github.com/kod0r/fishermans-quiz/issues/273))
* **store:** memoize `useQuizRun` return object to stabilize callback refs ([#274](https://github.com/kod0r/fishermans-quiz/issues/274))
* **shuffle:** track correct key instead of text to handle duplicate answer texts ([#275](https://github.com/kod0r/fishermans-quiz/issues/275))
* **history:** fallback UUID for non-secure HTTP contexts (`crypto.randomUUID` unavailable) ([#276](https://github.com/kod0r/fishermans-quiz/issues/276))
* **guardrails:** edge-case hardening across persistence, modes, quiz, engine, store ([#277](https://github.com/kod0r/fishermans-quiz/issues/277) [#278](https://github.com/kod0r/fishermans-quiz/issues/278) [#279](https://github.com/kod0r/fishermans-quiz/issues/279) [#280](https://github.com/kod0r/fishermans-quiz/issues/280) [#281](https://github.com/kod0r/fishermans-quiz/issues/281) [#282](https://github.com/kod0r/fishermans-quiz/issues/282) [#283](https://github.com/kod0r/fishermans-quiz/issues/283) [#284](https://github.com/kod0r/fishermans-quiz/issues/284))
* **ui:** stale textarea note on navigate + leaked flashcard auto-advance timeout ([#285](https://github.com/kod0r/fishermans-quiz/issues/285) [#286](https://github.com/kod0r/fishermans-quiz/issues/286))
* **ui:** a11y dialogs, touch targets, Enter guards, menu remounts ([#287](https://github.com/kod0r/fishermans-quiz/issues/287) [#288](https://github.com/kod0r/fishermans-quiz/issues/288) [#289](https://github.com/kod0r/fishermans-quiz/issues/289) [#290](https://github.com/kod0r/fishermans-quiz/issues/290) [#291](https://github.com/kod0r/fishermans-quiz/issues/291) [#292](https://github.com/kod0r/fishermans-quiz/issues/292) [#293](https://github.com/kod0r/fishermans-quiz/issues/293) [#294](https://github.com/kod0r/fishermans-quiz/issues/294) [#295](https://github.com/kod0r/fishermans-quiz/issues/295) [#296](https://github.com/kod0r/fishermans-quiz/issues/296) [#297](https://github.com/kod0r/fishermans-quiz/issues/297) [#298](https://github.com/kod0r/fishermans-quiz/issues/298))
* **quiz:** require all self-assessments before logging flashcard run ([#284](https://github.com/kod0r/fishermans-quiz/issues/284))

### Docs

* **agents:** rewrite `AGENTS.md` — remove outdated multi-agent roles, add skills & tools ([#268](https://github.com/kod0r/fishermans-quiz/issues/268))
* **architecture:** update `ARCHITECTURE.md` with engine, modes, persistence adapters, game menu, keyboard shortcuts, flashcard flow, and data loading layers ([#268](https://github.com/kod0r/fishermans-quiz/issues/268))

## [0.3.8](https://github.com/kod0r/fishermans-quiz/compare/v0.3.7...v0.3.8) (2026-04-28)

### Features

* **pwa:** installable PWA with vite-plugin-pwa ([#226](https://github.com/kod0r/fishermans-quiz/issues/226))
  * `registerType: 'autoUpdate'` service worker
  * Manifest: `Fisherman's Quiz` / `Feeesh`, theme_color `#14b8a6`
  * Icons: `public/pwa-192x192.png`, `public/pwa-512x512.png`
  * Workbox caches JS/CSS/HTML/JSON topic chunks

### Bug Fixes

* **quiz:** mode-switch race condition — old run no longer persists to wrong storage key ([#222](https://github.com/kod0r/fishermans-quiz/issues/222))
  * `QuizRun` now tagged with `gameMode`; persist effect guards cross-key writes
* **shuffle:** `shuffleAnswers` correctly maps `richtige_antwort` to shuffled position ([#224](https://github.com/kod0r/fishermans-quiz/issues/224))
  * Previously returned original key instead of locating correct text after shuffle

### Hardening

* **mobile:** viewport audit and touch interaction fixes ([#227](https://github.com/kod0r/fishermans-quiz/issues/227))
  * `QuizCardShell`: flex/min-height replaces fixed `h-[520px]` to fit iPhone SE
  * `StartView`: `grid-cols-2 sm:grid-cols-3` prevents overflow on 375px viewports
  * `HUD`: swipe threshold 40px → 100px, 200ms tap grace period, safe-area inset
  * Lighthouse mobile: Accessibility 96, Best Practices 96, SEO 100
* **docs:** architecture decision record — `docs/ARCHITECTURE.md` ([#223](https://github.com/kod0r/fishermans-quiz/issues/223))
  * Data flow trace, state partitioning, game mode differences, shuffle note, localStorage rationale
* **test:** shuffle utility + QuizRun integration + useQuiz wiring tests ([#224](https://github.com/kod0r/fishermans-quiz/issues/224))
  * 224 tests passing
* **chore:** dead code audit and removal ([#225](https://github.com/kod0r/fishermans-quiz/issues/225))
  * Removed unused `QuestionNotes` interface, commented menu code in `menuConfig.ts`

## [0.3.7](https://github.com/kod0r/fishermans-quiz/compare/v0.3.6...v0.3.7) (2026-04-27)

### Features

* **shuffle:** per-run answer order randomization ([#218](https://github.com/kod0r/fishermans-quiz/issues/218))
  * `QuizRun` schema: `answerShuffle` permutation map; `QuizStartOptions.shuffleAnswers`
  * `shuffleAnswers` utility: pure Fisher-Yates with remapped keys and updated `richtige_antwort`
  * `aktiveFragen` derives shuffled `Frage` objects automatically; zero view-layer changes needed
  * `restarteRun` regenerates shuffle map; `removeTopic` prunes orphaned entries
  * `unterbrecheRun` now marks run inactive (preserves shuffle for post-run review)
* **settings:** global "Antworten mischen" toggle in Quiz-Verhalten menu ([#219](https://github.com/kod0r/fishermans-quiz/issues/219))
  * `AppSettings.shuffleAnswers` persisted via generic settings storage
  * `MenuItem` supports `aria-pressed`
* **progress:** wrong-answer review cards display shuffled answer texts consistently ([#220](https://github.com/kod0r/fishermans-quiz/issues/220))
* **flashcard:** zero view-layer changes; consumes already-shuffled `aktiveFragen`
* **hud:** exam-mode-aware pause menu labels, exam timer badge, and game-mode indicator ([#208](https://github.com/kod0r/fishermans-quiz/issues/208), [#209](https://github.com/kod0r/fishermans-quiz/issues/209), [#211](https://github.com/kod0r/fishermans-quiz/issues/211))
  * `MenuPageRunActions`: "Prüfung" terminology in exam mode; restart hidden during exam ([#210](https://github.com/kod0r/fishermans-quiz/issues/210))
  * `HUD`: compact mode badge (Arcade/Prüfung/Hardcore) and live exam countdown
* **progress:** favorite star toggle on wrong-answer cards in `ProgressView`

### Bug Fixes

* **quiz:** mode switch now correctly persists ended run / clears hardcore run before switching gameMode
* **menu:** hide Fragenkatalog menu item while an exam is active
* **ui:** `StartView` bottom padding prevents HUD overlap on start buttons
* **hud:** peeking grabber tab when hidden; improved swipe/tap logic with `touch-none` and invisible touch overlay for mobile/tablet

## [0.3.6](https://github.com/kod0r/fishermans-quiz/compare/v0.3.5...v0.3.6) (2026-04-27)

### Features

* **exam:** overhaul exam mode — 60 random questions across all topics, no topic selector
  * StartView hides topic grid in exam mode; shows fancy "Prüfung starten" card below progress card
  * Active exam shows "Prüfung fortsetzen" with answered count
  * Enter key starts exam directly when exam mode is selected
  * Active run info simplified for exam ("Alle Themen", no "hinzufügen" hint)
* **exam:** Prüfungsabgabe führt jetzt zum Ergebnis statt auf blank screen
  * `beendeRun()` im Store setzt `isActive = false` statt Run zu löschen — Daten bleiben für ProgressView erhalten
  * `beendeExam()` wechselt View aktiv auf `'progress'`
  * `App.tsx` zeigt ProgressView auch bei `!isQuizActive` wenn `rawRun` existiert
* **arcade:** per-topic star ratings, high-score table, and `arcadeRunsCompleted` stat
* **hardcore:** strict topic lock enforcement with `isTopicLocked` utility
* **exam:** isolate exam stats, enforce 60% pass threshold; always allow mode switch with warning
* **ui:** game mode switcher embedded in StartView progress card (Arcade / Prüfung / Hardcore)
* **ui:** rename user-facing "Bereich" → "Thema" across UI, errors, and CSV export
* **hud:** Fortschritt-Button (`BarChart3`) aus QuizView-Menüleiste entfernt
* **hud:** Play-Button auf ProgressView im Exam-Modus komplett unterdrückt — kein Zurück nach Abgabe
* **progress:** "Zur Frage"-Buttons in falschen/unbeantworteten Listen sind `disabled` wenn `!isActive`

### Bug Fixes

* **exam:** Timer-Ablauf und manuelle Abgabe zeigen jetzt konsistent das Ergebnis an
* **session:** flashcard score accuracy, duplicate answer guard, extension `startedAt`
* **history:** migrate legacy `bereiche` field to `topics`

## [0.3.5](https://github.com/kod0r/fishermans-quiz/compare/v0.3.0...v0.3.5) (2026-04-25)

### Features

* **game-menu:** overhaul menubar/settings into a video game menu system ([#138](https://github.com/kod0r/fishermans-quiz/issues/138))
  * Config schema, types, and static `MENU_PAGES` configuration ([#139](https://github.com/kod0r/fishermans-quiz/issues/139))
  * `useGameMenu` hook with stack-based navigation, keyboard arrows/Home/End/Enter/Esc, and focus management ([#140](https://github.com/kod0r/fishermans-quiz/issues/140))
  * `GameMenuOverlay` production shell — vaul drawer on mobile, centered panel on desktop, focus trap, scroll lock, aria-modal ([#141](https://github.com/kod0r/fishermans-quiz/issues/141))
  * `MenuPageRoot` and `MenuPageSettings` production implementations with config-driven rendering ([#142](https://github.com/kod0r/fishermans-quiz/issues/142))
  * `MenuPageNavigation` quick-jump question grid during active quiz ([#143](https://github.com/kod0r/fishermans-quiz/issues/143))
  * `MenuPageRunActions` pause menu with Continue / Restart / Exit actions ([#144](https://github.com/kod0r/fishermans-quiz/issues/144))
  * Migrate backup/restore UI from `StartView` into `MenuPageData` ([#145](https://github.com/kod0r/fishermans-quiz/issues/145))
  * `HUD` production polish — accepts `quiz` + `gameMenu` props, context-wired buttons, deletes obsolete `TopNavBar.tsx` ([#146](https://github.com/kod0r/fishermans-quiz/issues/146))
  * Keyboard shortcut gating (`!gameMenuOpen`) and Esc-wiring to pause menu in `QuizView` / `FlashcardView` ([#147](https://github.com/kod0r/fishermans-quiz/issues/147))
  * Tests: `useGameMenu` hook (16 tests) + HUD/MenuItem/GameMenuOverlay components (16 tests) ([#148](https://github.com/kod0r/fishermans-quiz/issues/148))
* **ui:** add unique Lucide icons for every Bereich (Fish, Waves, Heart, Crosshair, Scale, Eye)
* **ui:** quick navigation stays open after jumping to a question
* **ui:** quick navigation shows solid high-contrast colors for answered questions (green/red)
* **quiz:** `restarteRun()` — restart current quiz in-place with fresh shuffle, same settings

### Bug Fixes

* **flashcard:** cancel pending auto-advance timeout on unmount and before new grade ([#130](https://github.com/kod0r/fishermans-quiz/issues/130))
* **keyboard:** only prevent default on Space/Arrow keys when handler is registered ([#131](https://github.com/kod0r/fishermans-quiz/issues/131))
* **settings:** backup reminder effect now uses correct dependencies and timeout cleanup ([#132](https://github.com/kod0r/fishermans-quiz/issues/132))
* **a11y:** TopNavBar focus timeout now cancelled when menu closes rapidly ([#133](https://github.com/kod0r/fishermans-quiz/issues/133))
* **quiz:** disable Back button and keyboard nav during arcade retry to prevent input bricking ([#135](https://github.com/kod0r/fishermans-quiz/issues/135))
* **menu:** remove redundant items (Spielmodus, Statistiken, Quiz beenden) from root menu
* **menu:** pause button only visible when actively in quiz
* **menu:** inline confirmation rows replace AlertDialog popups in pause menu (fixes focus-trap/z-index blocking)
* **menu:** consistent HUD/menu button order and colors
* **ui:** fix text blurriness in dialogs, menu overlay, and HUD by removing `zoom-in-95` scale transforms and `translate-x/y-[-50%]` centering
* **ui:** fix meta-progress bar visual inconsistency — fixed-width left/right containers ensure uniform progress bar widths

# [0.3.0](https://github.com/kod0r/fishermans-quiz/compare/v0.2.1...v0.3.0) (2026-04-25)


### Bug Fixes

* **a11y:** improve QuizView touch targets and ARIA compliance ([#76](https://github.com/kod0r/fishermans-quiz/issues/76)) ([8894d1b](https://github.com/kod0r/fishermans-quiz/commit/8894d1bf50a37b2427225f2bbc90bcc32f409f96))
* **a11y:** improve TopNavBar menu toggle touch targets and ARIA ([#74](https://github.com/kod0r/fishermans-quiz/issues/74)) ([65ed1ca](https://github.com/kod0r/fishermans-quiz/commit/65ed1cad553ffd2cb94baf2a19bdab3ecbcfa8b5))
* **docs:** cleanup duplicate CONTRIBUTING, translate README to English, remove obsolete refs ([46c644d](https://github.com/kod0r/fishermans-quiz/commit/46c644dd9cf65f4c12bb4ce3d892f8dc6ed458dc))
* **quizRun:** apply question limit after shuffle (closes [#115](https://github.com/kod0r/fishermans-quiz/issues/115)) ([2444cf2](https://github.com/kod0r/fishermans-quiz/commit/2444cf2118f29ab7b3f395d7373acf25f4fc4789))
* **store:** move storage persistence out of React state updaters ([#65](https://github.com/kod0r/fishermans-quiz/issues/65)) ([e2c91af](https://github.com/kod0r/fishermans-quiz/commit/e2c91af29dd91fedb5de457a5a5e0393e27c5bfd)), closes [#71](https://github.com/kod0r/fishermans-quiz/issues/71)
* **theme:** add proper light/dark mode support to StartView ([eb8f826](https://github.com/kod0r/fishermans-quiz/commit/eb8f8263a2fb3e8b92e6a18d34a8da5dd02f4ccf))
* **theme:** resolve dark/light mode switching ([93b4d1b](https://github.com/kod0r/fishermans-quiz/commit/93b4d1ba405484b2a1717d08747e2d9305af7aaa))
* **types:** add loadError to useQuiz hook for PR [#108](https://github.com/kod0r/fishermans-quiz/issues/108) compatibility ([9e9dbf2](https://github.com/kod0r/fishermans-quiz/commit/9e9dbf2af2fdd7e9a499b8fd26b2ccff40fb9218))
* **ui:** improve loading text contrast in light mode ([#73](https://github.com/kod0r/fishermans-quiz/issues/73)) ([7f9dbe2](https://github.com/kod0r/fishermans-quiz/commit/7f9dbe2cd0be0df49e13c2488fd75678c9d6d99b))
* **ui:** improve loading text contrast in light mode ([#73](https://github.com/kod0r/fishermans-quiz/issues/73)) ([e8739f9](https://github.com/kod0r/fishermans-quiz/commit/e8739f9c26cf37334cbb4f7f745438e47751e768))
* **ui:** improve ProgressView contrast and focus rings in light mode ([#75](https://github.com/kod0r/fishermans-quiz/issues/75)) ([f89862f](https://github.com/kod0r/fishermans-quiz/commit/f89862f383fe576e00e87f118d0fbe6c2938d377))


### Features

* **study-modes:** restore lost features from backup ([4c37ca1](https://github.com/kod0r/fishermans-quiz/commit/4c37ca1220acc50a196db39a2f8d175cbc57cf13)), closes [#78](https://github.com/kod0r/fishermans-quiz/issues/78) [#79](https://github.com/kod0r/fishermans-quiz/issues/79) [#80](https://github.com/kod0r/fishermans-quiz/issues/80) [#77](https://github.com/kod0r/fishermans-quiz/issues/77) [#114](https://github.com/kod0r/fishermans-quiz/issues/114) [#77](https://github.com/kod0r/fishermans-quiz/issues/77) [#78](https://github.com/kod0r/fishermans-quiz/issues/78) [#79](https://github.com/kod0r/fishermans-quiz/issues/79) [#80](https://github.com/kod0r/fishermans-quiz/issues/80) [#112](https://github.com/kod0r/fishermans-quiz/issues/112) [#113](https://github.com/kod0r/fishermans-quiz/issues/113) [#114](https://github.com/kod0r/fishermans-quiz/issues/114) [#115](https://github.com/kod0r/fishermans-quiz/issues/115)

v0.2.1 Hotfix

Bug Fixes
build: remove kimi-plugin-inspect-react to fix CI (548c8c5), closes #37
lint: disable react-hooks/set-state-in-effect (8b05a9b), closes #38
nur padding zurückgesetzt, UI-Änderungen behalten (c8c136e), closes #54
QuizView Box feste Höhe (7dc1725)
QuizView Box min-h + Padding-Reduktion (d7bb9cc)
release: generate release notes directly in CI (#36) (dd2afb0)
storage,quizRun: resolve high-priority issues #14, #16, #17 (#25) (7fee224), closes hi#priority
v0.2.1 hotfix — arcade retry input block + duplicate resume button (71f2abd)
workflow: resolve all critical audit findings (13d5e98)
Features
implement issues #45 #47 #48 #49 (f57c8fb)
QuizView UI cleanup (8fb4031)

## [0.2.0](https://github.com/kod0r/fishermans-quiz/compare/v0.1.2...v0.2.0) (2026-04-21)

### Features

* **ui:** komplettes Layout-Redesign — Sidebar wird zu horizontaler Top-Menubar mit Moduswahl & Schnellnavigation
* **quiz:** fixe Card-Höhe (720px Desktop, 600px Tablet, 520px Mobile), kompakte Antwort-Boxen
* **quiz:** Favoriten-Stern rechtsbündig, 33% größer
* **quiz:** Arcade-Modus — "Noch ein Versuch"-Warnung direkt in der Antwort-Box statt Dialog
* **quiz:** Bereichs-Abschluss-Popup wenn letzte Frage eines Bereichs beantwortet ([#46](https://github.com/kod0r/fishermans-quiz/issues/46))
* **quiz:** Fragen-Favoriten mit Filter "Nur Favoriten" ([#8](https://github.com/kod0r/fishermans-quiz/issues/8))
* **meta:** Statistik-Export CSV/JSON + JSON-Import ([#10](https://github.com/kod0r/fishermans-quiz/issues/10))
* **progress:** optisches Overhaul, minimalistischer, Actions in Menubar verschoben

### Bug Fixes

* **dev:** Vite Dev-Server auf `0.0.0.0` für VS Code Dev Container Port-Forwarding
* **data:** `quizLoader.ts` fetch-Pfad mit `import.meta.env.BASE_URL` korrigiert

## [0.1.2](https://github.com/kod0r/fishermans-quiz/compare/v0.1.1...v0.1.2) (2026-04-20)


### Bug Fixes

* **storage,quizRun:** resolve high-priority issues [#14](https://github.com/kod0r/fishermans-quiz/issues/14), [#16](https://github.com/kod0r/fishermans-quiz/issues/16), [#17](https://github.com/kod0r/fishermans-quiz/issues/17) ([#25](https://github.com/kod0r/fishermans-quiz/issues/25)) ([7fee224](https://github.com/kod0r/fishermans-quiz/commit/7fee22414dac4fe7d1a5fc3310b655ed4612065a)), closes [hi#priority](https://github.com/hi/issues/priority)
* **workflow:** resolve all critical audit findings ([13d5e98](https://github.com/kod0r/fishermans-quiz/commit/13d5e980206d1e64d1c84b0a1ad9499a9e9eb14e))

## [0.1.1](https://github.com/kod0r/fishermans-quiz/compare/v0.1.0...v0.1.1) (2026-04-20)


### Bug Fixes

* **data:** Relative Pfade fuer GitHub Pages Kompatibilitaet ([53e09a2](https://github.com/kod0r/fishermans-quiz/commit/53e09a2ccd40542967375ade6cea554b98ae5676))

# [0.1.0](https://github.com/kod0r/fishermans-quiz/compare/895567553c72ebb6727a6fef428e13c81a77a031...v0.1.0) (2026-04-20)


### Features

* **app:** initial project setup with lazy loading and GitHub conventions ([8955675](https://github.com/kod0r/fishermans-quiz/commit/895567553c72ebb6727a6fef428e13c81a77a031))
* **gameplay:** Arcade-Modus mit 2nd-Chance + Settings-Toggle ([#3](https://github.com/kod0r/fishermans-quiz/issues/3)) ([23f2beb](https://github.com/kod0r/fishermans-quiz/commit/23f2bebe69e514154053ddf6d2da8a145353f33f))
* **ui,a11y:** implement responsive design and accessibility improvements ([bf5e8a9](https://github.com/kod0r/fishermans-quiz/commit/bf5e8a9a32eba1d8169c791fdf1833cec55164be)), closes [#1](https://github.com/kod0r/fishermans-quiz/issues/1) [#2](https://github.com/kod0r/fishermans-quiz/issues/2) [#1](https://github.com/kod0r/fishermans-quiz/issues/1) [#2](https://github.com/kod0r/fishermans-quiz/issues/2)
