import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { GameMode } from "@/types/quiz";
import type { QuizContext } from "@/hooks/useQuiz";

export type DialogState =
  | { type: "remove-arcade"; topicId: string; fragenCount: number }
  | { type: "end-hardcore"; topicId: string }
  | { type: "confirm-mode-switch"; targetMode: GameMode }
  | null;

interface StartViewDialogsProps {
  dialog: DialogState;
  gameMode: GameMode;
  onClose: () => void;
  quiz: QuizContext;
  onRemoveTopic: (topicId: string) => void;
  onEndHardcore: (topicId: string) => void;
  onConfirmSwitch: (targetMode: GameMode) => void;
}

export function StartViewDialogs({
  dialog,
  gameMode,
  onClose,
  quiz,
  onRemoveTopic,
  onEndHardcore,
  onConfirmSwitch,
}: StartViewDialogsProps) {
  return (
    <>
      <AlertDialog
        open={dialog?.type === "remove-arcade"}
        onOpenChange={onClose}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Thema entfernen
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Dies entfernt{" "}
              {dialog?.type === "remove-arcade" ? dialog.fragenCount : 0}{" "}
              ursprüngliche Fragen aus dem aktiven Quiz und beendet den
              aktuellen Durchlauf.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dialog?.type === "remove-arcade") {
                  quiz.removeTopicFromRun(dialog.topicId);
                  onRemoveTopic(dialog.topicId);
                }
                onClose();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Entfernen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={dialog?.type === "end-hardcore"}
        onOpenChange={onClose}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Hardcore-Run beenden
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Im Hardcore-Modus wird der gesamte Run unterbrochen, wenn du ein
              Thema abwählst. Alle Fortschritte dieses Runs gehen verloren.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dialog?.type === "end-hardcore") {
                  quiz.unterbrecheRun();
                  onEndHardcore(dialog.topicId);
                }
                onClose();
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Run beenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={dialog?.type === "confirm-mode-switch"}
        onOpenChange={onClose}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              {gameMode === "exam"
                ? "Laufende Prüfung beenden?"
                : "Hardcore-Run beenden?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              {gameMode === "exam"
                ? "Der Moduswechsel beendet die aktuelle Prüfung. Bereits gegebene Antworten werden gewertet. Dies kann nicht rückgängig gemacht werden."
                : "Im Hardcore-Modus endet der gesamte Run beim Moduswechsel. Alle Themen dieses Runs werden als nicht bestanden gewertet. Dies kann nicht rückgängig gemacht werden."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dialog?.type === "confirm-mode-switch") {
                  onConfirmSwitch(dialog.targetMode);
                }
                onClose();
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {gameMode === "exam"
                ? "Prüfung beenden und wechseln"
                : "Run beenden und wechseln"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
