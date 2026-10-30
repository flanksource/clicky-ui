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
import { MonacoProvider } from "@flanksource/clicky-ui/monaco";
import { getMonacoWorker } from "./monaco-workers";
import {
  DEFAULT_DEMO_ID,
  DEMO_GROUPS,
  findDemoEntry,
  findDemoGroup,
} from "./demo-catalog";
import {
  ViewportPicker,
  ViewportStage,
  parseViewportMode,
  type ViewportMode,
} from "./ViewportStage";

type Route = { demo: string; viewport: ViewportMode };

function demoHref({ demo, viewport }: Route): string {
  const viewportParam = viewport === "fit" ? "" : `&viewport=${encodeURIComponent(viewport)}`;
  return `?demo=${encodeURIComponent(demo)}${viewportParam}`;
}

// `?frame=1` is what ViewportStage's iframes load: the demo alone, so the
// frame's width is the demo's width.
function FramedDemo({ demoId }: { demoId: string }) {
  const Demo = (findDemoEntry(demoId) ?? findDemoEntry(DEFAULT_DEMO_ID))?.component;
  if (!Demo) throw new Error(`kitchen-sink: no demo "${demoId}"`);
  return (
    <ThemeProvider>
      <DensityProvider>
        <MonacoProvider getWorker={getMonacoWorker}>
          <div id={`demo-panel-${demoId}`} className="min-h-dvh min-w-0 bg-background p-density-4 text-foreground">
            <Demo />
          </div>
        </MonacoProvider>
      </DensityProvider>
    </ThemeProvider>
  );
}

export function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("frame") === "1") {
    return <FramedDemo demoId={params.get("demo") ?? DEFAULT_DEMO_ID} />;
  }
  return <KitchenSink />;
}

function KitchenSink() {
  const [route, setRoute] = useHistoryRoute<Route>({
    parse: (_pathname, search) => {
      const params = new URLSearchParams(search);
      return {
        demo: findDemoEntry(params.get("demo"))?.id ?? DEFAULT_DEMO_ID,
        viewport: parseViewportMode(params.get("viewport")),
      };
    },
    build: demoHref,
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
          to: demoHref({ demo: item.id, viewport: route.viewport }),
        })),
    })).filter((section) => section.items.length > 0);
  }, [query, activeDemo?.id, route.viewport]);

  if (!activeDemo || !activeGroup) {
    return null;
  }

  const ActiveDemoComponent = activeDemo.component;

  return (
    <ThemeProvider>
      <DensityProvider>
        <MonacoProvider getWorker={getMonacoWorker}>
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
                  <ViewportPicker
                    value={route.viewport}
                    onChange={(viewport) => setRoute({ viewport })}
                  />
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
              {route.viewport === "fit" ? (
                <div
                  id={`demo-panel-${activeDemo.id}`}
                  role="tabpanel"
                  className="min-w-0 p-density-4"
                >
                  <ActiveDemoComponent />
                </div>
              ) : (
                <ViewportStage demoId={activeDemo.id} mode={route.viewport} />
              )}
            </AppShell>
          </RouterProvider>
        </MonacoProvider>
      </DensityProvider>
    </ThemeProvider>
  );
}
