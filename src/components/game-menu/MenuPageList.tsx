import { MenuItem } from './MenuItem';
import type { MenuSectionConfig, MenuItemConfig } from './menuConfig';

interface MenuPageListProps {
  sections?: MenuSectionConfig[];
  onItemClick?: (item: MenuItemConfig) => void;
}

export function MenuPageList({ sections, onItemClick }: MenuPageListProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="py-2 space-y-6 px-4">
      {sections.map((section, sectionIndex) => (
        <section key={sectionIndex}>
          {section.title && (
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
              {section.title}
            </h3>
          )}
          <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
            {section.items.map((item) => {
              const detail = typeof item.detail === 'string' ? item.detail : undefined;
              return (
                <MenuItem
                  key={item.id}
                  icon={<item.icon className="w-5 h-5" />}
                  label={item.label}
                  detail={detail}
                  destructive={item.destructive}
                  onClick={onItemClick ? () => onItemClick(item) : undefined}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
