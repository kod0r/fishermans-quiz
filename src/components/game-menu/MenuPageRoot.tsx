import { useState, useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MENU_PAGES, type MenuContext, type MenuItemConfig, type MenuPageId } from './menuConfig';
import { MenuItem } from './MenuItem';
import type { QuizContext } from '@/hooks/useQuiz';
import type { AppView } from '@/types/quiz';

interface MenuPageRootProps {
  onPush: (page: MenuPageId) => void;
  onClose: () => void;
  quiz: QuizContext;
}

export function MenuPageRoot({ onPush, onClose, quiz }: MenuPageRootProps) {
  const [showExitDialog, setShowExitDialog] = useState(false);

  const context = useMemo<MenuContext>(
    () => ({
      isQuizActive: quiz.isActive,
      gameMode: quiz.gameMode,
      theme: 'system',
      currentView: quiz.view,
      historyCount: quiz.historyEntries.length,
      runStatus: quiz.isActive
        ? `${quiz.statistiken?.beantwortet ?? 0}/${quiz.statistiken?.gesamt ?? 0}`
        : undefined,
    }),
    [quiz]
  );

  const pageConfig = MENU_PAGES.find((p) => p.id === 'root');
  if (!pageConfig) return null;

  const handleContinueQuiz = () => {
    if (quiz.isActive) {
      onClose();
    }
  };

  const handleExitQuiz = () => {
    setShowExitDialog(true);
  };

  const confirmExitQuiz = () => {
    setShowExitDialog(false);
    quiz.unterbrecheRun();
    onClose();
  };

  const handleItemClick = (item: MenuItemConfig) => {
    if (item.action === 'navigate' && item.target) {
      onPush(item.target as MenuPageId);
    } else if (item.action === 'view' && item.target) {
      quiz.goToView(item.target as AppView);
      onClose();
    } else if (item.action === 'action' && item.target) {
      if (item.target === 'continue-quiz') {
        handleContinueQuiz();
      } else if (item.target === 'exit-quiz') {
        handleExitQuiz();
      }
    }
  };

  const getDetail = (item: MenuItemConfig): string | undefined => {
    if (!item.detail) return undefined;
    return typeof item.detail === 'function' ? item.detail(context) : item.detail;
  };

  const isItemVisible = (item: MenuItemConfig): boolean => {
    if (!item.condition) return true;
    return item.condition(context);
  };

  return (
    <div className="py-2">
      {pageConfig.sections?.map((section, sectionIndex) => {
        const visibleItems = section.items.filter(isItemVisible);
        if (visibleItems.length === 0) return null;

        const isPrimaryCtaSection =
          sectionIndex === 0 &&
          visibleItems.length === 1 &&
          visibleItems[0].id === 'continue-quiz';

        if (isPrimaryCtaSection) {
          const item = visibleItems[0];
          return (
            <div key={sectionIndex} className="px-4 pb-3">
              <button
                data-menu-item
                onClick={() => handleItemClick(item)}
                disabled={!quiz.isActive}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 text-white font-semibold text-[15px] hover:bg-teal-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            </div>
          );
        }

        return (
          <section key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
            {section.title && (
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
                {section.title}
              </h3>
            )}
            <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {visibleItems.map((item) => (
                <MenuItem
                  key={item.id}
                  icon={<item.icon className="w-5 h-5" />}
                  label={item.label}
                  detail={getDetail(item)}
                  onClick={() => handleItemClick(item)}
                  destructive={item.destructive}
                />
              ))}
            </div>
          </section>
        );
      })}

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Quiz beenden?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Meta-Fortschritt bleibt erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowExitDialog(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExitQuiz}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Beenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
