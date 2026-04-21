import { DensityProvider, TabButton, ThemeProvider, useHistoryRoute } from "@flanksource/clicky-ui";
import { Sidebar } from "./Sidebar";
import { DEFAULT_DEMO_ID, DEMO_GROUPS, findDemoEntry, findDemoGroup } from "./demo-catalog";

export function App() {
  const [route, navigate] = useHistoryRoute<{ demo: string }>({
    parse: (_pathname, search) => {
      const params = new URLSearchParams(search);
      const candidate = params.get("demo");
      return {
        demo: findDemoEntry(candidate)?.id ?? DEFAULT_DEMO_ID,
      };
    },
    build: (next) => `?demo=${encodeURIComponent(next.demo)}`,
  });

  const activeDemo = findDemoEntry(route.demo) ?? findDemoEntry(DEFAULT_DEMO_ID);
  const activeGroup = findDemoGroup(activeDemo?.id ?? DEFAULT_DEMO_ID) ?? DEMO_GROUPS[0];

  if (!activeDemo || !activeGroup) {
    return null;
  }

  const ActiveDemoComponent = activeDemo.component;

  return (
    <ThemeProvider>
      <DensityProvider>
        <div className="mx-auto flex max-w-6xl gap-density-6 p-density-4">
          <Sidebar groups={DEMO_GROUPS} activeId={activeDemo.id} onSelect={(demo) => navigate({ demo })} />
          <main className="min-w-0 flex-1 space-y-density-5">
            <header className="space-y-density-2">
              <h1 className="text-2xl font-bold">Clicky UI — Kitchen Sink</h1>
              <p className="text-muted-foreground text-sm">
                One component per tab. Preact-hosted via{" "}
                <code>preact/compat</code>.
              </p>
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {activeGroup.title}
                </div>
                <div className="flex flex-wrap gap-2" role="tablist" aria-label={`${activeGroup.title} tabs`}>
                  {activeGroup.items.map((item) => (
                    <TabButton
                      key={item.id}
                      active={item.id === activeDemo.id}
                      onClick={() => navigate({ demo: item.id })}
                      label={item.label}
                      className="rounded-full"
                    />
                  ))}
                </div>
              </div>
            </header>

            <div
              id={`demo-panel-${activeDemo.id}`}
              role="tabpanel"
              className="min-w-0"
            >
              <ActiveDemoComponent />
            </div>
          </main>
        </div>
      </DensityProvider>
    </ThemeProvider>
  );
}
