import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Home,
  Star,
} from "lucide-react";
import type { QuizContext } from "@/hooks/useQuiz";

interface Props {
  quiz: QuizContext;
}

export default function QuizView({ quiz }: Props) {
  const {
    aktuelleFrage,
    aktuellerIndex,
    aktiveFragen,
    antworten,
    beantworteFrage,
    naechsteFrage,
    vorherigeFrage,
    gameMode,
    toggleFavorite,
    isFavorite,
  } = quiz;

  const [pendingWrongAnswer, setPendingWrongAnswer] = useState<string | null>(
    null,
  );
  const [bereichComplete, setBereichComplete] = useState<string | null>(null);

  // Prüfe ob ein Bereich komplett beantwortet wurde
  const checkBereichComplete = useCallback((frageId: string) => {
    const frage = aktiveFragen.find(f => f.id === frageId);
    if (!frage) return;

    const bereichFragen = aktiveFragen.filter(f => f.bereich === frage.bereich);
    const alleBeantwortet = bereichFragen.every(f => antworten[f.id] !== undefined || f.id === frageId);

    if (alleBeantwortet) {
      setBereichComplete(frage.bereich);
    }
  }, [aktiveFragen, antworten]);

  if (!aktuelleFrage) return null;

  const userAntwort = antworten[aktuelleFrage.id];
  const hasAnswered = userAntwort !== undefined;
  const isPending = pendingWrongAnswer !== null;
  const fortschritt = ((aktuellerIndex + 1) / aktiveFragen.length) * 100;
  const korrekt = aktiveFragen.filter(
    (f) => antworten[f.id] === f.richtige_antwort,
  ).length;
  const falsch = aktiveFragen.filter(
    (f) => antworten[f.id] && antworten[f.id] !== f.richtige_antwort,
  ).length;
  const offen = aktiveFragen.filter((f) => !antworten[f.id]).length;

  // ── Arcade-Modus: Antwort-Logik ──
  const handleAnswerClick = (buchstabe: string) => {
    if (hasAnswered) return;
    // Bereits als falsch markierte Antwort ignorieren
    if (pendingWrongAnswer === buchstabe) return;

    const isCorrect = buchstabe === aktuelleFrage.richtige_antwort;

    if (isCorrect) {
      beantworteFrage(aktuelleFrage.id, buchstabe);
      setPendingWrongAnswer(null);
      checkBereichComplete(aktuelleFrage.id);
    } else if (gameMode === "arcade" && !isPending) {
      // Erster Fehlversuch im Arcade → "Noch ein Versuch"
      setPendingWrongAnswer(buchstabe);
    } else {
      // Hardcore-Modus ODER zweiter Fehlversuch im Arcade
      beantworteFrage(aktuelleFrage.id, buchstabe);
      setPendingWrongAnswer(null);
      checkBereichComplete(aktuelleFrage.id);
    }
  };

  return (
    <TooltipProvider delayDuration={800}>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-4xl pt-14 sm:pt-16">
          {/* Top Bar — Run-Stats */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${gameMode === "arcade" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
              >
                {gameMode === "arcade" ? "Arcade" : "Hardcore"}
              </span>
            </div>
            <div
              className="flex items-center gap-1.5"
              aria-label={`${korrekt} richtig, ${falsch} falsch, ${offen} offen`}
            >
              <span className="text-emerald-400 font-bold text-sm">
                {korrekt}
              </span>
              <span className="text-slate-500 text-xs">/</span>
              <span className="text-red-400 font-bold text-sm">{falsch}</span>
              <span className="text-slate-500 text-xs">/</span>
              <span className="text-slate-400 text-sm">{offen}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3 sm:mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span id="progress-label">
                Frage {aktuellerIndex + 1} / {aktiveFragen.length}
              </span>
              <span aria-hidden="true">{Math.round(fortschritt)}%</span>
            </div>
            <Progress
              value={fortschritt}
              className="h-1.5 bg-slate-700"
              aria-labelledby="progress-label"
              aria-valuenow={Math.round(fortschritt)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Frage — FIXE HÖHE */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 h-[520px] sm:h-[600px] md:h-[720px] flex flex-col overflow-hidden">
            {/* Themenbereich + Favorit */}
            <div className="mb-2 flex items-center justify-between">
              {aktuelleFrage.bild ? (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Bilderkennung
                </span>
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {aktuelleFrage.bereich}
                </span>
              )}
              <button
                onClick={() => toggleFavorite(aktuelleFrage.id)}
                aria-label={isFavorite(aktuelleFrage.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                className={`p-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${isFavorite(aktuelleFrage.id) ? 'text-amber-400 hover:text-amber-300' : 'text-slate-500 hover:text-amber-400'}`}
              >
                <Star className={`w-5 h-5 sm:w-6 sm:h-6 ${isFavorite(aktuelleFrage.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h2 className="text-white text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 leading-snug line-clamp-3">
              {aktuelleFrage.frage}
            </h2>

            {aktuelleFrage.bild_url && (
              <div className="mb-2 sm:mb-3 flex justify-center flex-shrink-0">
                <img
                  src={aktuelleFrage.bild_url}
                  alt={`Bild zur Frage ${aktuellerIndex + 1}: ${aktuelleFrage.frage}`}
                  className="max-w-full h-28 sm:h-36 md:h-44 object-contain rounded-lg border border-slate-600/50 bg-slate-900/50"
                  loading="lazy"
                />
              </div>
            )}

            {/* Antworten — flex-grow um verfügbaren Raum zu füllen */}
            <div
              className="space-y-2 flex-1 flex flex-col justify-center"
              role="radiogroup"
              aria-label="Antwortmöglichkeiten"
            >
              {(["A", "B", "C"] as const).map((buchstabe) => {
                const isSelected = userAntwort === buchstabe;
                const isCorrect = aktuelleFrage.richtige_antwort === buchstabe;
                const isPendingSelection = pendingWrongAnswer === buchstabe;

                let cls =
                  "border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 hover:border-slate-500/50";
                if (hasAnswered) {
                  if (isSelected && isCorrect)
                    cls = "border-emerald-500 bg-emerald-500/10";
                  else if (isSelected && !isCorrect)
                    cls = "border-red-500 bg-red-500/10";
                  else if (isCorrect)
                    cls = "border-emerald-500/50 bg-emerald-500/5";
                } else if (isPendingSelection) {
                  // Arcade: Pending wrong answer — ausgegraut mit Warnung
                  cls = "border-red-500 bg-red-500/10 opacity-80";
                } else if (isSelected) {
                  cls = "border-teal-400 bg-teal-400/10";
                }

                const isDisabled = hasAnswered || isPendingSelection;

                return (
                  <button
                    key={buchstabe}
                    onClick={() => handleAnswerClick(buchstabe)}
                    disabled={isDisabled}
                    aria-pressed={isSelected || isPendingSelection}
                    aria-disabled={isDisabled}
                    aria-label={`Antwort ${buchstabe}: ${aktuelleFrage.antworten[buchstabe]}`}
                    className={`w-full text-left h-12 sm:h-14 rounded-lg border transition-all flex items-center gap-3 px-3 ${cls} ${isDisabled ? "cursor-default opacity-50" : "cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"}`}
                  >
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${hasAnswered && isCorrect ? "bg-emerald-500 text-white" : hasAnswered && isSelected && !isCorrect ? "bg-red-500 text-white" : isPendingSelection ? "bg-red-500 text-white" : isSelected ? "bg-teal-400 text-slate-900" : "bg-slate-600/50 text-slate-300"}`}
                      aria-hidden="true"
                    >
                      {buchstabe}
                    </span>
                    <span
                      className={`flex-1 leading-snug text-sm truncate ${hasAnswered && isCorrect ? "text-emerald-300" : hasAnswered && isSelected && !isCorrect ? "text-red-300" : isPendingSelection ? "text-red-300" : "text-slate-200"}`}
                    >
                      {aktuelleFrage.antworten[buchstabe]}
                    </span>

                    {/* Arcade-Pending: "Noch ein Versuch" + Warnzeichen */}
                    {isPendingSelection && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs text-amber-400 font-medium">
                          Noch ein Versuch
                        </span>
                        <AlertTriangle
                          className="w-4 h-4 text-amber-400"
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    {hasAnswered && isCorrect && (
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Live-Region für Feedback */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {userAntwort &&
                userAntwort === aktuelleFrage.richtige_antwort &&
                "Richtig!"}
              {userAntwort &&
                userAntwort !== aktuelleFrage.richtige_antwort &&
                "Falsch."}
            </div>
          </div>

          {/* Navigation: Zurück + Weiter, näher zur Mitte */}
          <div className="flex items-center justify-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={vorherigeFrage}
                  disabled={aktuellerIndex === 0}
                  variant="outline"
                  aria-label="Vorherige Frage"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 text-xs sm:text-sm py-2 px-4"
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Zurück</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vorherige Frage</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={naechsteFrage}
                  disabled={
                    aktuellerIndex === aktiveFragen.length - 1 || isPending
                  }
                  variant="outline"
                  aria-label="Nächste Frage"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 text-xs sm:text-sm py-2 px-4"
                >
                  <span className="hidden sm:inline">Weiter</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Nächste Frage</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Bereichs-Abschluss Dialog (Issue #46) */}
          <Dialog open={bereichComplete !== null} onOpenChange={(open) => !open && setBereichComplete(null)}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Bereich abgeschlossen!
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm">
                  Du hast alle Fragen im Bereich <span className="text-teal-400 font-medium">{bereichComplete}</span> beantwortet.
                </DialogDescription>
              </DialogHeader>
              <p className="text-slate-300 text-sm">
                Du kannst über die Startansicht einen weiteren Bereich hinzufügen.
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => setBereichComplete(null)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  Weiterlernen
                </Button>
                <Button
                  onClick={() => { setBereichComplete(null); quiz.goToView('start'); }}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-xs"
                >
                  <Home className="w-3.5 h-3.5 mr-1" />
                  Zur Startseite
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}
