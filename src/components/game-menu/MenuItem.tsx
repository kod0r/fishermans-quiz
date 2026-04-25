import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface MenuItemProps {
  icon?: ReactNode;
  label: string;
  detail?: string;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  isFocused?: boolean;
}

export function MenuItem({
  icon,
  label,
  detail,
  onClick,
  destructive,
  disabled,
  isFocused,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-3 text-left
        transition-colors duration-150
        focus:outline-none focus-visible:bg-accent
        active:scale-[0.98]
        ${isFocused ? 'bg-accent' : 'bg-transparent hover:bg-accent/50'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${destructive ? 'text-red-500 dark:text-red-400' : 'text-foreground'}
      `}
    >
      {icon && (
        <span className={`flex-shrink-0 ${destructive ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`}>
          {icon}
        </span>
      )}
      <span className="flex-1 text-[15px] font-medium leading-tight">{label}</span>
      {detail && (
        <span className="text-sm text-muted-foreground">{detail}</span>
      )}
      {onClick && (
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      )}
    </button>
  );
}
