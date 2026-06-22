import { cn } from '@shared/lib/utils';

export type PageSectionDockItem = {
  id: string;
  label: string;
};

type PageSectionDockProps = {
  sections: readonly PageSectionDockItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  className?: string;
};

export function PageSectionDock({
  sections,
  activeId,
  onSelect,
  className,
}: PageSectionDockProps) {
  if (sections.length < 2) {
    return null;
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:bottom-5',
        className,
      )}
    >
      <nav
        aria-label="Навигация по разделам страницы"
        className="pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-border bg-background/92 p-1 shadow-lg backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section) => {
          const isActive = activeId === section.id;

          return (
            <button
              key={section.id}
              type="button"
              aria-current={isActive ? 'true' : undefined}
              onClick={() => onSelect(section.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {section.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
