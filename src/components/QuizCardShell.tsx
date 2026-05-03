import { Star, StickyNote } from 'lucide-react';
import type { Frage } from '@/types/quiz';
import type { ReactNode } from 'react';

interface Props {
  frage: Frage;
  aktuellerIndex: number;
  children: ReactNode;
  hasAnswered: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  note?: string;
  onNoteChange?: (value: string) => void;
}

export function QuizCardShell({
  frage,
  aktuellerIndex,
  children,
  hasAnswered,
  isFavorite,
  onToggleFavorite,
  note = '',
  onNoteChange,
}: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 min-h-[680px] flex flex-col dark:bg-slate-800/60 dark:border-slate-700/50">
      {/* Topic + Favorite */}
      <div className="mb-2 flex items-center justify-between">
        {frage.bild ? (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-600 border border-purple-300/50 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
            Bilderkennung
          </span>
        ) : (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-teal-100 text-teal-600 border border-teal-300/50 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20">
            {frage.topic}
          </span>
        )}
        <button
          onClick={onToggleFavorite}
          aria-label={
            isFavorite
              ? 'Aus Favoriten entfernen'
              : 'Zu Favoriten hinzufügen'
          }
          className={`p-2.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${isFavorite ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-amber-400 dark:text-slate-500'} min-w-[44px] min-h-[44px]`}
        >
          <Star
            className={`w-5 h-5 sm:w-6 sm:h-6 ${isFavorite ? 'fill-current' : ''}`}
          />
        </button>
      </div>

      <h2 className="text-slate-900 text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 leading-snug flex-shrink-0 dark:text-white">
        {frage.frage}
      </h2>

      <div className={`mb-2 sm:mb-3 flex justify-center flex-shrink-0 ${frage.bild_url ? '' : 'h-0 overflow-hidden'}`}>
        {frage.bild_url && (
          <img
            src={frage.bild_url}
            alt={`Bild zur Frage ${aktuellerIndex + 1}: ${frage.frage}`}
            className="max-w-full h-28 sm:h-36 md:h-44 object-contain rounded-lg border border-slate-300/50 bg-slate-100/50 dark:border-slate-600/50 dark:bg-slate-900/50"
            loading="lazy"
          />
        )}
      </div>

      {/* Dynamic answer area */}
      <div className="flex-1 min-h-0">
        {children}
      </div>

      {/* Notiz — immer gleiche Höhe reserviert */}
      <div className={`mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex-shrink-0 ${hasAnswered ? '' : 'invisible'}`}>
        <label
          htmlFor={`note-${frage.id}`}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5 dark:text-slate-400"
        >
          <StickyNote className="w-3.5 h-3.5" aria-hidden="true" />
          Persönliche Notiz
        </label>
        <textarea
          key={frage.id}
          id={`note-${frage.id}`}
          defaultValue={note}
          onBlur={(e) => onNoteChange?.(e.target.value)}
          placeholder="Merksatz, Eselsbrücke, Hinweis …"
          className="w-full rounded-lg border border-slate-300/50 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600/50 dark:bg-slate-900/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus-visible:ring-offset-slate-900 resize-none"
          rows={2}
        />
      </div>
    </div>
  );
}
