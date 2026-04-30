import { useEffect, useRef, useCallback } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { FocusScope } from '@radix-ui/react-focus-scope';
import type { MenuPageId } from '@/hooks/useGameMenu';
import type { QuizContext } from '@/hooks/useQuiz';
import { useIsMobile } from '@/hooks/use-mobile';
import { MENU_PAGES } from './menuConfig';
import { MenuPageRoot } from './MenuPageRoot';
import { MenuPageSettings } from './MenuPageSettings';
import { MenuPageData } from './MenuPageData';
import { MenuPageList } from './MenuPageList';
import { X, ChevronLeft } from 'lucide-react';

interface GameMenuOverlayProps {
  isOpen: boolean;
  stack: MenuPageId[];
  currentPage: MenuPageId;
  direction: 'forward' | 'back';
  onClose: () => void;
  onPop: () => void;
  onPush: (page: MenuPageId) => void;
  registerOnActivate: (cb: ((index: number) => void) | null) => void;
  quiz: QuizContext;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function GameMenuOverlay({
  isOpen,
  stack,
  currentPage,
  direction,
  onClose,
  onPop,
  onPush,
  registerOnActivate,
  quiz,
}: GameMenuOverlayProps) {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const isRoot = stack.length === 1;

  const pageConfig = MENU_PAGES.find((p) => p.id === currentPage);
  const title = pageConfig?.title ?? '';

  // Store previously focused element when opening, restore on close
  useEffect(() => {
    if (isOpen) {
      const active = document.activeElement;
      if (active instanceof HTMLElement) {
        lastFocusedRef.current = active;
      }
    } else if (lastFocusedRef.current) {
      lastFocusedRef.current.focus();
      lastFocusedRef.current = null;
    }
  }, [isOpen]);

  // Focus first focusable item when opening or changing page
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      focusable?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen, currentPage]);

  // Wire Enter/Space activation to the focused menu item
  useEffect(() => {
    registerOnActivate((index) => {
      const panel = panelRef.current;
      if (!panel) return;
      const items = panel.querySelectorAll<HTMLElement>('[data-menu-item]');
      if (index >= 0 && index < items.length) {
        items[index].click();
      }
    });
    return () => registerOnActivate(null);
  }, [registerOnActivate]);

  // Body scroll lock on desktop (vaul handles mobile)
  useEffect(() => {
    if (isMobile || !isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const renderPage = useCallback(
    (page: MenuPageId) => {
      const config = MENU_PAGES.find((p) => p.id === page);

      if (config?.customComponent) {
        const Component = config.customComponent;
        return <Component quiz={quiz} onClose={onClose} onPop={onPop} onPush={onPush} />;
      }

      // Known pages with dedicated components take precedence over generic section rendering
      switch (page) {
        case 'root':
          return <MenuPageRoot onPush={onPush} onClose={onClose} quiz={quiz} />;
        case 'settings':
          return <MenuPageSettings onPush={onPush} quiz={quiz} />;
        case 'data':
          return <MenuPageData quiz={quiz} />;
        default:
          break;
      }

      if (config?.sections) {
        return <MenuPageList sections={config.sections} />;
      }

      return <MenuPageRoot onPush={onPush} onClose={onClose} quiz={quiz} />;
    },
    [onPush, onClose, onPop, quiz]
  );

  const header = (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/60 shrink-0 flex-shrink-0">
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
        {title}
      </h2>

      <div className="w-8" />
    </div>
  );

  const swipeHandle = (
    <div className="flex justify-center pt-2 pb-1 shrink-0">
      <div className="w-10 h-1 rounded-full bg-slate-300/50 dark:bg-slate-600/50" />
    </div>
  );

  const pageContent = (
    <div className="relative flex-1 overflow-y-auto">
      <div
        className={`
          animate-in
          ${direction === 'forward' ? 'slide-in-from-right-full' : 'slide-in-from-left-full'}
          duration-300 ease-out
        `}
      >
        {renderPage(currentPage)}
      </div>
    </div>
  );

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <DrawerPrimitive.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        dismissible
      >
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
          <DrawerPrimitive.Content
            ref={panelRef}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-black/20 max-h-[85vh]"
            aria-modal="true"
            role="dialog"
            aria-label={title}
          >
            {swipeHandle}
            {header}
            {pageContent}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>
    );
  }

  return (
    <FocusScope trapped loop>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Menu Panel */}
        <div
          ref={panelRef}
          className="
            relative w-full max-w-md max-h-[80vh]
            bg-white dark:bg-slate-900
            rounded-3xl
            shadow-2xl shadow-black/20
            overflow-hidden
            animate-in fade-in
            duration-300 ease-out
            flex flex-col
          "
          aria-modal="true"
          role="dialog"
          aria-label={title}
        >
          {header}
          {pageContent}
        </div>
      </div>
    </FocusScope>
  );
}
