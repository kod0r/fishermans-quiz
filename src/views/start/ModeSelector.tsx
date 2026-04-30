import { Zap, Timer, Shield } from "lucide-react";
import type { GameMode } from "@/types/quiz";

interface ModeButtonProps {
  mode: GameMode;
  currentMode: GameMode;
  icon: typeof Zap;
  label: string;
  subtitle: string;
  activeClass: string;
  onClick: () => void;
}

function ModeButton({
  mode,
  currentMode,
  icon: Icon,
  label,
  subtitle,
  activeClass,
  onClick,
}: ModeButtonProps) {
  const isActive = mode === currentMode;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
        isActive
          ? `${activeClass} shadow-sm`
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      }`}
      aria-pressed={isActive}
      aria-label={`${label}${isActive ? " (aktiv)" : ""}`}
    >
      <span className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{label}</span>
      </span>
      {isActive && (
        <span className="hidden md:inline text-[9px] opacity-80 mt-0.5 max-w-[140px] truncate">
          {subtitle}
        </span>
      )}
    </button>
  );
}

interface ModeSelectorProps {
  currentMode: GameMode;
  onSwitchMode: (mode: GameMode) => void;
}

export function ModeSelector({ currentMode, onSwitchMode }: ModeSelectorProps) {
  return (
    <div className="flex items-center bg-slate-200/60 dark:bg-slate-700/40 rounded-lg p-0.5 shrink-0">
      <ModeButton
        mode="arcade"
        currentMode={currentMode}
        icon={Zap}
        label="Arcade"
        subtitle="Ein Retry pro Frage. Themen jederzeit änderbar."
        activeClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
        onClick={() => onSwitchMode("arcade")}
      />
      <ModeButton
        mode="exam"
        currentMode={currentMode}
        icon={Timer}
        label="Prüfung"
        subtitle="60 Fragen, 60 Minuten, 60 % zum Bestehen."
        activeClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
        onClick={() => onSwitchMode("exam")}
      />
      <ModeButton
        mode="hardcore"
        currentMode={currentMode}
        icon={Shield}
        label="Hardcore"
        subtitle="Ein Fehler sperrt das Thema. Keine Retries."
        activeClass="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
        onClick={() => onSwitchMode("hardcore")}
      />
    </div>
  );
}
