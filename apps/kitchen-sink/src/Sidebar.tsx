import { cn } from "@flanksource/clicky-ui";
import type { DemoGroup } from "./demo-catalog";

export type SidebarProps = {
  groups: DemoGroup[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function Sidebar({ groups, activeId, onSelect }: SidebarProps) {
  return (
    <nav className="sticky top-density-4 self-start w-56 shrink-0 text-sm">
      <ul className="space-y-density-4">
        {groups.map((g) => (
          <li key={g.title}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-density-1 font-semibold">
              {g.title}
            </p>
            <ul className="space-y-0.5" role="tablist" aria-label={`${g.title} components`}>
              {g.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={item.id === activeId}
                    aria-controls={`demo-panel-${item.id}`}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "block w-full rounded px-density-2 py-1 text-left transition-colors",
                      item.id === activeId
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
