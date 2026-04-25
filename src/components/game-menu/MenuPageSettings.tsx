import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { MENU_PAGES, type MenuContext, type MenuItemConfig, type MenuPageId } from './menuConfig';
import { MenuItem } from './MenuItem';
import type { QuizContext } from '@/hooks/useQuiz';
import type { GameMode } from '@/types/quiz';

interface MenuPageSettingsProps {
  onPush: (page: MenuPageId) => void;
  quiz: QuizContext;
}

export function MenuPageSettings({ onPush, quiz }: MenuPageSettingsProps) {
  const { theme, setTheme } = useTheme();

  const context = useMemo<MenuContext>(
    () => ({
      isQuizActive: quiz.isActive,
      gameMode: quiz.gameMode,
      theme: (theme as 'light' | 'dark' | 'system') ?? 'system',
      currentView: quiz.view,
      historyCount: quiz.historyEntries.length,
    }),
    [quiz, theme]
  );

  const pageConfig = MENU_PAGES.find((p) => p.id === 'settings');
  if (!pageConfig) return null;

  const canChangeMode = !quiz.isActive;

  const handleItemClick = (item: MenuItemConfig) => {
    if (item.action === 'navigate' && item.target) {
      onPush(item.target as MenuPageId);
    } else if (item.action === 'toggle' && item.target) {
      const target = item.target as string;
      if (target === 'arcade' || target === 'hardcore' || target === 'exam') {
        if (canChangeMode) {
          quiz.setGameMode(target as GameMode);
        }
      } else if (target === 'light' || target === 'dark' || target === 'system') {
        setTheme(target);
      }
    }
  };

  const getDetail = (item: MenuItemConfig): string | undefined => {
    if (!item.detail) return undefined;
    return typeof item.detail === 'function' ? item.detail(context) : item.detail;
  };

  const isItemDisabled = (item: MenuItemConfig): boolean => {
    if (typeof item.disabled === 'function') return item.disabled(context);
    if (typeof item.disabled === 'boolean') return item.disabled;

    // Block mode switch during active run
    if (
      item.action === 'toggle' &&
      (item.target === 'arcade' || item.target === 'hardcore' || item.target === 'exam')
    ) {
      return !canChangeMode;
    }

    return false;
  };

  return (
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
          Fisherman&apos;s Quiz v0.1.0
        </p>
      </section>
    </div>
  );
}
