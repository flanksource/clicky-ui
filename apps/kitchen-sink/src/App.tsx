import { useMemo, useState } from "react";
import {
  AppShell,
  DensityProvider,
  DensitySwitcher,
  RouterProvider,
  ThemeProvider,
  ThemeSwitcher,
  useBrowserRouter,
  useHistoryRoute,
  type AppShellNavSection,
} from "@flanksource/clicky-ui";
import {
  DEFAULT_DEMO_ID,
  DEMO_GROUPS,
  findDemoEntry,
  findDemoGroup,
} from "./demo-catalog";

export function App() {
  const [route] = useHistoryRoute<{ demo: string }>({
    parse: (_pathname, search) => {
      const params = new URLSearchParams(search);
      const candidate = params.get("demo");
      return {
        demo: findDemoEntry(candidate)?.id ?? DEFAULT_DEMO_ID,
      };
    },
    build: (next) => `?demo=${encodeURIComponent(next.demo)}`,
  });

  const [query, setQuery] = useState("");
  // Browser adapter renders nav items as client-side <a> links; clicking pushes
  // history + dispatches popstate, which useHistoryRoute above re-parses.
  const router = useBrowserRouter();

  const activeDemo =
    findDemoEntry(route.demo) ?? findDemoEntry(DEFAULT_DEMO_ID);
  const activeGroup =
    findDemoGroup(activeDemo?.id ?? DEFAULT_DEMO_ID) ?? DEMO_GROUPS[0];

  const navSections = useMemo<AppShellNavSection[]>(() => {
    const q = query.trim().toLowerCase();
    return DEMO_GROUPS.map((group) => ({
      label: group.title,
      items: group.items
        .filter((item) => !q || item.label.toLowerCase().includes(q))
        .map((item) => ({
          key: item.id,
          label: item.label,
          ...(item.icon ? { icon: item.icon } : {}),
          active: item.id === activeDemo?.id,
          to: `?demo=${encodeURIComponent(item.id)}`,
        })),
    })).filter((section) => section.items.length > 0);
  }, [query, activeDemo?.id]);

  if (!activeDemo || !activeGroup) {
    return null;
  }

  const ActiveDemoComponent = activeDemo.component;

  return (
    <ThemeProvider>
      <DensityProvider>
        <RouterProvider adapter={router}>
          <AppShell
            brand={
              <>
                <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  C
                </span>
                <span className="font-semibold tracking-tight">
                  Clicky UI · Kitchen Sink
                </span>
              </>
            }
            search={
              <input
                value={query}
                onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
                placeholder="Filter components…"
                aria-label="Filter components"
                className="w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none focus:border-ring"
              />
            }
            actions={
              <>
                <ThemeSwitcher />
                <DensitySwitcher />
              </>
            }
            navSections={navSections}
            collapsedStorageKey="kitchen-sink:sidebar:collapsed"
            bodyHeader={
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {activeGroup.title}
                </span>
                <span className="text-muted-foreground">›</span>
                <span className="font-medium">{activeDemo.label}</span>
              </div>
            }
          >
            <div
              id={`demo-panel-${activeDemo.id}`}
              role="tabpanel"
              className="min-w-0 p-density-4"
            >
              <ActiveDemoComponent />
            </div>
          </AppShell>
        </RouterProvider>
      </DensityProvider>
    </ThemeProvider>
  );
}
