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
  'aria-label'?: string;
  'aria-pressed'?: boolean;
}

export function MenuItem({
  icon,
  label,
  detail,
  onClick,
  destructive,
  disabled,
  isFocused,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
}: MenuItemProps) {
  return (
    <button
      data-menu-item
      onClick={onClick}
      disabled={disabled}
      tabIndex={isFocused === true ? 0 : isFocused === false ? -1 : undefined}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={`
        w-full flex items-center gap-3 px-4 py-3 text-left
        transition-colors duration-150
        focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none
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
