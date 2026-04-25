## [Unreleased]

### Features

* **keyboard:** global shortcuts — `1/2/3` answer selection, `←/→` navigation, `Space` reveal, `F` favorite toggle, `Esc` menu, `?` cheat-sheet modal ([#81](https://github.com/kod0r/fishermans-quiz/issues/81))
* **decks:** custom study decks — create named decks, add/remove questions, start quiz filtered by deck ([#83](https://github.com/kod0r/fishermans-quiz/issues/83))

### Code Quality

* **test:** deck hook tests (`src/test/decks.test.ts`) — 10 tests covering CRUD, membership, and localStorage persistence

---

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
