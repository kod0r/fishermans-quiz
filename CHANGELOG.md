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
