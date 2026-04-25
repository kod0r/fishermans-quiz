import { Sun, Moon, Monitor, Zap, Shield, Timer, Download, Upload, Trash2 } from 'lucide-react';
import { MenuItem } from './MenuItem';
import type { MenuPageId } from './menuConfig';

export function MenuPageSettings({ onPush }: { onPush: (page: MenuPageId) => void }) {
  return (
    <div className="py-2 space-y-6 px-4">
      {/* Game Mode */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
          Spielmodus
        </h3>
        <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
          <MenuItem icon={<Zap className="w-5 h-5" />} label="Arcade" detail="Aktiv" />
          <MenuItem icon={<Shield className="w-5 h-5" />} label="Hardcore" />
          <MenuItem icon={<Timer className="w-5 h-5" />} label="Prüfungsmodus" />
        </div>
      </section>

      {/* Theme */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
          Erscheinungsbild
        </h3>
        <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
          <MenuItem icon={<Sun className="w-5 h-5" />} label="Hell" />
          <MenuItem icon={<Moon className="w-5 h-5" />} label="Dunkel" detail="Aktiv" />
          <MenuItem icon={<Monitor className="w-5 h-5" />} label="System" />
        </div>
      </section>

      {/* Data */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
          Daten
        </h3>
        <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
          <MenuItem icon={<Download className="w-5 h-5" />} label="Backup erstellen" onClick={() => onPush('data')} />
          <MenuItem icon={<Upload className="w-5 h-5" />} label="Backup wiederherstellen" onClick={() => onPush('data')} />
          <MenuItem icon={<Trash2 className="w-5 h-5" />} label="Alle Daten löschen" destructive onClick={() => onPush('data')} />
        </div>
      </section>

      {/* Info */}
      <section className="px-4 py-2">
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          Fisherman&apos;s Quiz v0.1.0
        </p>
      </section>
    </div>
  );
}
