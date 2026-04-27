import { Zap, Shield, Timer, ChevronRight } from "lucide-react";

interface HelpLandingProps {
  onSelectMode: (mode: "arcade" | "hardcore" | "exam") => void;
}

const MODES = [
  {
    id: "arcade" as const,
    title: "Arcade",
    hook: "Lerne in deinem Tempo — mit Sicherheitsnetz.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    hoverBg: "hover:bg-amber-500/5",
  },
  {
    id: "exam" as const,
    title: "Prüfung",
    hook: "Realistische Prüfungssituation unter ''Zeitdruck''.",
    icon: Timer,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    hoverBg: "hover:bg-blue-500/5",
  },
  {
    id: "hardcore" as const,
    title: "Hardcore",
    hook: "Ein Fehler reicht — Thema gesperrt.",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    hoverBg: "hover:bg-red-500/5",
  },
];

export default function HelpLanding({ onSelectMode }: HelpLandingProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Wähle einen Spielmodus, um die Regeln und Besonderheiten zu erkunden.
      </p>
      {MODES.map((m) => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border ${m.border} ${m.bg} ${m.hoverBg} transition-all text-left active:scale-[0.98]`}
          >
            <div className={`p-2 rounded-lg bg-white/60 dark:bg-slate-800/60`}>
              <Icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {m.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {m.hook}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
