import { useEffect, useRef } from 'react';
import type { MenuPageId } from '@/hooks/useGameMenu';
import { MenuPageRoot } from './MenuPageRoot';
import { MenuPageSettings } from './MenuPageSettings';
import { X, ChevronLeft } from 'lucide-react';

interface GameMenuOverlayProps {
  isOpen: boolean;
  stack: MenuPageId[];
  currentPage: MenuPageId;
  direction: 'forward' | 'back';
  onClose: () => void;
  onPop: () => void;
  onPush: (page: MenuPageId) => void;
}

const pageTitles: Record<MenuPageId, string> = {
  root: 'Menü',
  settings: 'Einstellungen',
  navigation: 'Navigation',
  'run-actions': 'Run-Aktionen',
};

export function GameMenuOverlay({
  isOpen,
  stack,
  currentPage,
  direction,
  onClose,
  onPop,
  onPush,
}: GameMenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isRoot = stack.length === 1;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderPage = (page: MenuPageId) => {
    switch (page) {
      case 'root':
        return <MenuPageRoot onPush={onPush} />;
      case 'settings':
        return <MenuPageSettings />;
      default:
        return <MenuPageRoot onPush={onPush} />;
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Menu Panel — bottom sheet on mobile, centered on desktop */}
      <div
        className={`
          relative w-full sm:max-w-md sm:max-h-[80vh]
          bg-white dark:bg-slate-900
          rounded-t-3xl sm:rounded-3xl
          shadow-2xl shadow-black/20
          overflow-hidden
          animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0
          fade-in zoom-in-95
          duration-300 ease-out
          flex flex-col
        `}
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={isRoot ? onClose : onPop}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isRoot ? 'Schließen' : 'Zurück'}
          >
            {isRoot ? (
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            )}
          </button>

          <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white">
            {pageTitles[currentPage]}
          </h2>

          <div className="w-8" /> {/* spacer for centering */}
        </div>

        {/* Swipe handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300/50 dark:bg-slate-600/50" />
        </div>

        {/* Page Content with iOS slide transition */}
        <div className="relative flex-1 overflow-y-auto">
          <div
            key={stack.join('-')}
            className={`
              animate-in
              ${direction === 'forward' ? 'slide-in-from-right-full' : 'slide-in-from-left-full'}
              duration-300 ease-out
            `}
          >
            {renderPage(currentPage)}
          </div>
        </div>
      </div>
    </div>
  );
}
