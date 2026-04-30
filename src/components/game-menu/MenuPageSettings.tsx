import { useMemo, useState } from "react";
import { version } from "../../../package.json";
import { useTheme } from "next-themes";
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
import {
  MENU_PAGES,
  type MenuContext,
  type MenuItemConfig,
  type MenuPageId,
} from "./menuConfig";
import { MenuItem } from "./MenuItem";
import type { QuizContext } from "@/hooks/useQuiz";
import type { GameMode } from "@/types/quiz";

interface MenuPageSettingsProps {
  onPush: (page: MenuPageId) => void;
  quiz: QuizContext;
}

export function MenuPageSettings({ onPush, quiz }: MenuPageSettingsProps) {
  const { theme, setTheme } = useTheme();
  const [showExamConfirm, setShowExamConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);

  const context = useMemo<MenuContext>(
    () => ({
      isQuizActive: quiz.isActive,
      gameMode: quiz.gameMode,
      theme: (theme as "light" | "dark" | "system") ?? "system",
      currentView: quiz.view,
      historyCount: quiz.historyEntries.length,
      shuffleAnswers: quiz.shuffleAnswers,
    }),
    [quiz, theme],
  );

  const pageConfig = MENU_PAGES.find((p) => p.id === "settings");
  if (!pageConfig) return null;

  const handleModeSwitch = (mode: GameMode) => {
    if (mode === quiz.gameMode) return;
    // Confirmation required when exam or hardcore is currently active
    if (
      quiz.isActive &&
      (quiz.gameMode === "exam" || quiz.gameMode === "hardcore")
    ) {
      setPendingMode(mode);
      setShowExamConfirm(true);
      return;
    }
    // Arcade or no active run: switch immediately
    quiz.switchGameMode(mode);
  };

  const handleConfirmSwitch = () => {
    if (pendingMode) {
      quiz.switchGameMode(pendingMode);
    }
    setShowExamConfirm(false);
    setPendingMode(null);
  };

  const handleCancelSwitch = () => {
    setShowExamConfirm(false);
    setPendingMode(null);
  };

  const handleItemClick = (item: MenuItemConfig) => {
    if (item.action === "navigate" && item.target) {
      onPush(item.target as MenuPageId);
    } else if (item.action === "toggle" && item.target) {
      const target = item.target as string;
      if (target === "arcade" || target === "hardcore" || target === "exam") {
        handleModeSwitch(target as GameMode);
      } else if (
        target === "light" ||
        target === "dark" ||
        target === "system"
      ) {
        setTheme(target);
      } else if (target === "shuffle-answers") {
        quiz.setShuffleAnswers?.(!quiz.shuffleAnswers);
      }
    }
  };

  const getDetail = (item: MenuItemConfig): string | undefined => {
    if (!item.detail) return undefined;
    return typeof item.detail === "function"
      ? item.detail(context)
      : item.detail;
  };

  const isItemDisabled = (item: MenuItemConfig): boolean => {
    if (typeof item.disabled === "function") return item.disabled(context);
    if (typeof item.disabled === "boolean") return item.disabled;
    return false;
  };

  return (
    <>
      <div className="py-2 space-y-6 px-4">
        {pageConfig.sections?.map((section, sectionIndex) => (
          <section key={sectionIndex}>
            {section.title && (
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
                {section.title}
              </h3>
            )}
            <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {section.items.map((item) => (
                <MenuItem
                  key={item.id}
                  icon={<item.icon className="w-5 h-5" />}
                  label={item.label}
                  detail={getDetail(item)}
                  onClick={() => handleItemClick(item)}
                  disabled={
                    item.target === "arcade" ||
                    item.target === "hardcore" ||
                    item.target === "exam"
                      ? false
                      : isItemDisabled(item)
                  }
                  destructive={item.destructive}
                  aria-pressed={item.target === "shuffle-answers" ? quiz.shuffleAnswers : undefined}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Info */}
        <section className="px-4 py-2">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            Fisherman&apos;s Quiz v{version}
          </p>
        </section>
      </div>

      {/* Mode Switch Confirmation Dialog */}
      <AlertDialog open={showExamConfirm} onOpenChange={(open) => !open && handleCancelSwitch()}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              {quiz.gameMode === "exam"
                ? "Laufende Prüfung beenden?"
                : "Hardcore-Run beenden?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              {quiz.gameMode === "exam"
                ? "Der Moduswechsel beendet die aktuelle Prüfung. Bereits gegebene Antworten werden gewertet. Dies kann nicht rückgängig gemacht werden."
                : "Der Moduswechsel beendet den aktiven Hardcore-Run. Alle Themen dieses Runs werden als nicht bestanden gewertet. Dies kann nicht rückgängig gemacht werden."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelSwitch}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSwitch}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {quiz.gameMode === "exam"
                ? "Prüfung beenden und wechseln"
                : "Run beenden und wechseln"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
