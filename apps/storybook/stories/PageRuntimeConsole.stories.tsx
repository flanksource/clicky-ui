import { useEffect, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../../packages/ui/src/components/button";
import { registerDebugRuntime } from "../../../packages/ui/src/data/debugRuntime";
import { registerDebugConsole } from "../../../packages/ui/src/data/debugConsoleSignal";
import { RuntimeIndicatorBadge } from "../../../packages/ui/src/devtools/RuntimeIndicatorBadge";
import { DebugConsole } from "../../../packages/ui/src/devtools/DebugConsole";
import { DebugStore } from "../../../packages/ui/src/devtools/debugStore";
import type { DebugTab } from "../../../packages/ui/src/devtools/types";
import RuntimeDebugPanel from "../../../packages/page-runtime/src/host/RuntimeDebugPanel.tsx";
import { createRuntimeDiagnostics } from "../../../packages/page-runtime/src/host/runtime-diagnostics.ts";
import { createRequestActivity } from "../../../packages/page-runtime/src/sw/activity.ts";

function PageRuntimeConsole() {
  const store = useMemo(() => new DebugStore(), []);
  const sources = useMemo(() => [
    { id: "facet", page: "Report.tsx", library: "@flanksource/facet" },
    { id: "clicky", page: "Dashboard.mdx", library: "@flanksource/clicky-ui" },
  ].map(runtime => ({ ...runtime, source: createRuntimeDiagnostics({ capture: () => true }) })), []);
  const [tab, setTab] = useState<DebugTab>("runtimes");
  useEffect(() => {
    const releaseConsole = registerDebugConsole(request => { if (request.tab) setTab(request.tab as DebugTab); });
    const releases = sources.map(({ id, page, library, source }) => {
      const release = registerDebugRuntime({ id, label: page, state: source, clear: source.clear, content: <RuntimeDebugPanel source={source} page={page} origin="https://runtime.example" /> });
      source.receive({ type: "status", state: "booting" });
      source.receive({ type: "activity", load: id, navigationStart: Date.now(), records: [{ ...createRequestActivity(`https://runtime.example/src/${page}`), source: "compiled", compileMs: 8, totalMs: 12, outputBytes: 512, status: 200 }], timeline: [{ phase: "mounted", atMs: 12 }, { phase: "ready", atMs: 20 }], tailwind: [], runtime: { versions: { [library]: "1.0.0" }, managed: [library], base: {}, scopes: 1, importMapBytes: 256 } });
      source.receive({ type: "status", state: "ready" });
      return release;
    });
    return () => { releaseConsole(); releases.forEach(release => release()); };
  }, [sources]);
  return <div className="flex h-dvh min-h-0 flex-col bg-background text-foreground">
    <div className="flex shrink-0 gap-2 border-b border-border p-3">
      <RuntimeIndicatorBadge />
      <Button size="sm" variant="outline" onClick={() => sources[0]!.source.receive({ type: "error", error: { phase: "compile", message: "Unexpected token", file: "Report.tsx", line: 8 } })}>Fail Facet build</Button>
      <Button size="sm" variant="outline" onClick={() => sources[0]!.source.receive({ type: "status", state: "booting" })}>Rebuild Facet page</Button>
    </div>
    <DebugConsole state={store.getSnapshot()} store={store} tab={tab} onTabChange={setTab} />
  </div>;
}

const meta: Meta<typeof PageRuntimeConsole> = { title: "Devtools/Page runtimes", component: PageRuntimeConsole, parameters: { layout: "fullscreen" } };
export default meta;
export const FacetAndClicky: StoryObj<typeof PageRuntimeConsole> = {};
