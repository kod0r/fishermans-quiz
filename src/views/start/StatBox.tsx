import type { LucideIcon } from "lucide-react";

interface StatBoxProps {
  icon: LucideIcon;
  iconColor: string;
  value: number;
  label: string;
}

export function StatBox({ icon: Icon, iconColor, value, label }: StatBoxProps) {
  return (
    <div
      className="text-center p-1 sm:p-1.5 rounded-lg bg-slate-200/50 dark:bg-slate-700/30"
      aria-label={`${label}: ${value}`}
    >
      <Icon
        className={`w-4 h-4 ${iconColor} mx-auto mb-0.5`}
        aria-hidden="true"
      />
      <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight dark:text-white">
        {value}
      </p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
