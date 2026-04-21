import { cn } from "@flanksource/clicky-ui";

export type NavItem = { id: string; label: string };

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Foundations",
    items: [
      { id: "switchers", label: "Switchers" },
      { id: "button", label: "Button" },
      { id: "icon", label: "Icon" },
    ],
  },
  {
    title: "Display",
    items: [
      { id: "badge", label: "Badge" },
      { id: "avatar", label: "Avatar" },
      { id: "progress", label: "ProgressBar" },
      { id: "clicky", label: "Clicky" },
      { id: "json-view", label: "JsonView" },
      { id: "ansi-html", label: "AnsiHtml" },
      { id: "log-viewer", label: "LogViewer" },
      { id: "markdown", label: "Markdown" },
    ],
  },
  {
    title: "Controls",
    items: [
      { id: "filter-pill", label: "FilterPill" },
      { id: "sortable", label: "SortableHeader" },
      { id: "tab-gauge", label: "Tabs & Gauges" },
    ],
  },
  {
    title: "Layout",
    items: [
      { id: "section", label: "Section" },
      { id: "split-pane", label: "SplitPane" },
      { id: "tree", label: "Tree" },
      { id: "tree-group", label: "TreeGroupHeader" },
    ],
  },
  {
    title: "Overlay",
    items: [
      { id: "hover-card", label: "HoverCard" },
      { id: "modal", label: "Modal" },
    ],
  },
  {
    title: "Diagnostics",
    items: [
      { id: "diagnostics", label: "Process & Stack" },
      { id: "har-panel", label: "HarPanel" },
    ],
  },
];

export function Sidebar() {
  return (
    <nav className="sticky top-density-4 self-start w-56 shrink-0 text-sm">
      <ul className="space-y-density-4">
        {GROUPS.map((g) => (
          <li key={g.title}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-density-1 font-semibold">
              {g.title}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={cn(
                      "block px-density-2 py-0.5 rounded text-muted-foreground",
                      "hover:bg-accent hover:text-foreground transition-colors",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
