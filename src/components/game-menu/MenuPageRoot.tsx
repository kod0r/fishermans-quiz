import { Play, Settings, Search, History, BarChart3, LogOut, Timer } from 'lucide-react';
import { MenuItem } from './MenuItem';
import type { MenuPageId } from '@/hooks/useGameMenu';

interface MenuPageRootProps {
  onPush: (page: MenuPageId) => void;
}

export function MenuPageRoot({ onPush }: MenuPageRootProps) {
  return (
    <div className="py-2">
      {/* Primary Actions */}
      <div className="px-4 pb-3">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 text-white font-semibold text-[15px] hover:bg-teal-600 active:scale-[0.98] transition-all">
          <Play className="w-5 h-5" />
          Quiz fortsetzen
        </button>
      </div>

      {/* Menu Sections */}
      <div className="space-y-6 px-4">
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
            Modus
          </h3>
          <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden">
            <MenuItem icon={<Timer className="w-5 h-5" />} label="Arcade" detail="Aktiv" />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
            Allgemein
          </h3>
          <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
            <MenuItem
              icon={<Settings className="w-5 h-5" />}
              label="Einstellungen"
              onClick={() => onPush('settings')}
            />
            <MenuItem
              icon={<Search className="w-5 h-5" />}
              label="Fragenkatalog"
            />
            <MenuItem
              icon={<History className="w-5 h-5" />}
              label="Session-Verlauf"
            />
            <MenuItem
              icon={<BarChart3 className="w-5 h-5" />}
              label="Statistiken"
            />
          </div>
        </section>

        <section>
          <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden">
            <MenuItem
              icon={<LogOut className="w-5 h-5" />}
              label="Quiz beenden"
              destructive
            />
          </div>
        </section>
      </div>
    </div>
  );
}
