import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
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
    }),
    [quiz, theme]
  );

  const pageConfig = MENU_PAGES.find((p) => p.id === "settings");
  if (!pageConfig) return null;

  const handleModeSwitch = (mode: GameMode) => {
    // Exam confirmation required only when exam is currently active
    if (quiz.isActive && quiz.gameMode === "exam") {
      setPendingMode(mode);
      setShowExamConfirm(true);
      return;
    }
    // Otherwise switch immediately
    quiz.setGameMode(mode);
  };

  const handleConfirmExamSwitch = () => {
    if (pendingMode) {
      quiz.beendeExam();
      quiz.setGameMode(pendingMode);
    }
    setShowExamConfirm(false);
    setPendingMode(null);
  };

  const handleCancelExamSwitch = () => {
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
                  disabled={isItemDisabled(item)}
                  destructive={item.destructive}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Info */}
        <section className="px-4 py-2">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            Fisherman&apos;s Quiz v0.3.5
          </p>
        </section>
      </div>

      {/* Exam Mode Switch Confirmation Dialog */}
      {showExamConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-6 max-w-sm mx-4 border border-slate-200 dark:border-slate-700 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Laufende Prüfung beenden?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Der Moduswechsel beendet die aktuelle Prüfung. Bereits gegebene Antworten werden gewertet. Dies kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelExamSwitch}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirmExamSwitch}
                className="flex-1 py-2 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Prüfung beenden und wechseln
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
