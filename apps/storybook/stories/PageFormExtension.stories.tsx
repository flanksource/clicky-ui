import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageForm as RuntimeForm } from "../../../packages/page-runtime/src/host/PageForm.tsx";
import type { FolderManifest, JsonValue } from "../../../packages/page-runtime/src/schema.ts";
import { IconButton } from "../../../packages/ui/src/components/IconButton";
import { DropdownMenu } from "../../../packages/ui/src/overlay/DropdownMenu";
import { UiEllipsisBold } from "../../../packages/ui/src/icons";
import { useDensity, useTheme } from "../../../packages/ui/src/hooks";
import { registerDebugConsole, revealDebugConsole, setDebugCaptureLevel, setDebugConsoleOpen } from "../../../packages/ui/src/data/debugConsoleSignal";
import { DebugConsole } from "../../../packages/ui/src/devtools/DebugConsole";
import { DebugStore } from "../../../packages/ui/src/devtools/debugStore";
import { RuntimeIndicatorBadge } from "../../../packages/ui/src/devtools/RuntimeIndicatorBadge";
import type { DebugTab } from "../../../packages/ui/src/devtools/types";
import schema from "../../../packages/ui/src/components/examples/form-extensions/schema.json";
import initialValue from "../../../packages/ui/src/components/examples/form-extensions/value.json";
import extensionSource from "../../../packages/ui/src/components/examples/form-extensions/extension.tsx?raw";

const files = { "examples/form-extensions/extension.tsx": extensionSource };
const extensions: [] = [];
const formProps = { title: "Service", layout: { mode: "cards" }, showPreferencesMenu: false, persistPreferences: false };
type RuntimeConfig = { runtimeOrigin: string; manifest: FolderManifest };

function Demo() {
  const { resolvedTheme } = useTheme();
  const { density } = useDensity();
  const [config, setConfig] = useState<RuntimeConfig>();
  const [error, setError] = useState<Error | null>(null);
  const [value, setValue] = useState<JsonValue>(initialValue);
  const [revision, setRevision] = useState(0);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [tab, setTab] = useState<DebugTab>("runtimes");
  const store = useMemo(() => new DebugStore(), []);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/__page-runtime", { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error(`Local page runtime: ${response.status} ${await response.text()}`);
      const config: RuntimeConfig = await response.json();
      if (!config.runtimeOrigin || !config.manifest?.dependencies?.["@flanksource/clicky-ui"]) throw new Error("Local page runtime did not provide its origin and Clicky UI publication");
      setConfig(config);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error : new Error(String(error)));
    });
    return () => controller.abort();
  }, []);
  useEffect(() => registerDebugConsole(request => {
    setConsoleOpen(current => request.toggle ? !current : true);
    if (request.tab) setTab(request.tab as DebugTab);
  }), []);
  useEffect(() => {
    setDebugConsoleOpen(consoleOpen);
    setDebugCaptureLevel(consoleOpen ? state.level : "off");
    return () => { setDebugConsoleOpen(false); setDebugCaptureLevel("off"); };
  }, [consoleOpen, state.level]);

  return <div className="flex h-full min-h-0 flex-col">
    <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
      <div><h1 className="text-lg font-semibold">Form extensions · PageForm</h1><p className="text-sm text-muted-foreground">The extension TSX compiles in an isolated browser runtime. Edits flow back to the host.</p></div>
      <DropdownMenu
        trigger={<IconButton icon={UiEllipsisBold} label="Page form options" className="size-8" />}
        menuLabel="Page form options"
        header={<RuntimeIndicatorBadge />}
        items={[
          { label: "Open runtime diagnostics", onSelect: () => revealDebugConsole({ tab: "runtimes" }) },
          { label: "Reload form runtime", disabled: !config, onSelect: () => { setError(null); setRevision(current => current + 1); } },
        ]}
      />
    </header>
    <main className="min-h-0 flex-1 overflow-auto p-6">
      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error.message}</p>}
      {!config && !error && <p role="status">Starting local page runtime…</p>}
      {config && <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <RuntimeForm key={revision} title="Service form runtime" className="block min-h-96 w-full border-0" runtimeOrigin={config.runtimeOrigin} manifest={config.manifest} schema={schema} value={value} onChange={setValue} formProps={formProps} extensions={extensions} files={files} theme={{ theme: resolvedTheme, density }} onError={setError} />
        <section aria-label="Host value"><h2 className="mb-2 text-sm font-semibold">Host value</h2><output className="block whitespace-pre-wrap break-words rounded border border-border p-3 font-mono text-xs">{JSON.stringify(value, null, 2)}</output></section>
      </div>}
    </main>
    {consoleOpen && <section aria-label="Page runtime console" className="flex h-96 shrink-0 flex-col border-t border-border"><DebugConsole state={state} store={store} tab={tab} onTabChange={setTab} onClose={() => setConsoleOpen(false)} /></section>}
  </div>;
}

const meta = {
  title: "Extensions/FormExtension",
  component: Demo,
  tags: ["browser"],
  parameters: { layout: "fullscreen", docs: { description: { component: "Runs the shared form-extension schema, value and raw TSX through PageForm. Start Storybook with `pnpm --filter storybook dev` after `make build` and `pnpm --filter @flanksource/page-runtime build`. The three-dot menu shows live runtime status, opens the console, and reloads the frame without resetting its value. Runtime captures come from the browser; server capture tabs have no backend in this story." } } },
} satisfies Meta<typeof Demo>;
export default meta;
export const PageForm: StoryObj<typeof meta> = {};
