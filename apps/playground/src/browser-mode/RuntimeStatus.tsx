import { useState, useSyncExternalStore } from "react";
import { ActionError, Button, JsonView, Modal, Properties, ServerTimingBadge, StatusDot, Tabs, formatBytes, formatDuration, type PropertiesItem } from "@flanksource/clicky-ui";
import { BuildLog, RuntimeActivity, activityTimings, buildLog, summarizeActivity } from "@flanksource/page-runtime/host";
import { useBrowserSession, type BrowserSession, type RuntimeStatus } from "./session";
import { LocalOverrides } from "./LocalOverrides";
import { RuntimeProfileEditor } from "./RuntimeProfileEditor";
import { useRuntimeRoute } from "./runtime-route";

const LIBRARIES = [["clicky-ui", "@flanksource/clicky-ui"], ["facet", "@flanksource/facet"], ["React", "react"]] as const;
const TABS = [{ id: "summary", label: "Summary" }, { id: "profile", label: "Configuration" }, { id: "lock", label: "Lock" }, { id: "activity", label: "Activity" }, { id: "build", label: "Build log" },{ id: "overrides", label: "Local overrides" }];

/** The open frame's runtime status, or null outside browser mode. */
export function useRuntimeStatus(): RuntimeStatus | null | undefined {
  const session = useBrowserSession();
  return useSyncExternalStore(session?.subscribeRuntime ?? noSubscription, session ? session.getRuntime : noSession);
}
const noSubscription: BrowserSession["subscribeRuntime"] = () => () => {};
const noSession = () => undefined;

function frameDot(state: string) {
  return state === "ready" ? "success" : ["error", "failed", "blocked"].includes(state) ? "error" : "warning";
}

function policyLabel(profile: RuntimeStatus["profile"]) {
  if (!profile) return "Configuration has not loaded";
  const { policy, convert } = profile;
  return [policy.dependencies, policy.allow?.length ? `${policy.allow.length} allowed` : null, convert ? `converted via ${convert.origin}` : null].filter(Boolean).join(" · ");
}

function summaryItems(status: RuntimeStatus): PropertiesItem[] {
  const load = status.activity.current;
  const summary = load ? summarizeActivity(load) : null;
  return [
    { key: "Page", value: status.page },
    { key: "Frame", value: status.state },
    ...LIBRARIES.map(([label, name]) => ({ key: label, value: status.lock?.versions[name] ?? "not resolved" })),
    { key: "Package origin", value: status.profile?.packageOrigin ?? "not loaded" },
    { key: "Registry", value: status.profile?.registry ?? "not loaded" },
    { key: "Dependency policy", value: policyLabel(status.profile) },
    { key: "Library links", value: status.links ? `${status.links} linked` : "none" },
    ...(summary ? [
      { key: "Requests", value: `${summary.requests} · ${summary.cacheHits} from cache` },
      { key: "Transferred", value: summary.unknownTransfers ? `${formatBytes(summary.transferredBytes)} (+${summary.unknownTransfers} unmeasured)` : formatBytes(summary.transferredBytes) },
      { key: "Compile", value: formatDuration(summary.compileMs) },
      { key: "Ready after", value: summary.readyMs === null ? "not ready" : formatDuration(summary.readyMs) },
      ...(load?.editToVisibleMs === undefined ? [] : [{ key: "Edit to visible", value: formatDuration(load.editToVisibleMs) }]),
    ] : [{ key: "Activity", value: "Frame has not started; no frame requests recorded" }]),
    { key: "Problems", value: status.issues.length },
  ];
}

/** The current load's time to ready, with fetch, integrity, compile, rewrite and Tailwind work and a link to the build log on hover; nothing until the frame is ready. */
function LoadTiming({ status, onOpenBuildLog }: { status: RuntimeStatus; onOpenBuildLog: () => void }) {
  const load = status.activity.current;
  return load ? <ServerTimingBadge title="Page load" metrics={activityTimings(load)} footer={<Button size="sm" variant="link" className="h-auto p-0 text-xs" onClick={onOpenBuildLog}>Build log…</Button>} /> : null;
}

function StatusBuildLog({ status }: { status: RuntimeStatus }) {
  if (!status.build.length) return <p className="text-sm text-muted-foreground">No build steps have been recorded for this page yet.</p>;
  return <BuildLog entries={buildLog({ steps: status.build, load: status.activity.current })} live={!["ready", "blocked", "failed"].includes(status.state)} startedAt={status.build[0]!.at} className="max-h-[60dvh] overflow-auto" />;
}

/** Compact runtime details for the playground status menu; null outside browser mode. `tab` opens the configuration on that tab. */
export function RuntimeStatusSection({ onOpenConfiguration }: { onOpenConfiguration: (tab?: string) => void }) {
  const status = useRuntimeStatus();
  if (status === undefined) return null;
  return <section aria-label="Page runtime" className="space-y-2 border-b border-border pb-3">
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-semibold">Page runtime</h2>
      {status && <div className="flex items-center gap-2"><LoadTiming status={status} onOpenBuildLog={() => onOpenConfiguration("build")} /><StatusDot status={frameDot(status.state)} label={status.state} /></div>}
    </div>
    {status ? <>
      <Properties density="compact" items={summaryItems(status).filter(item => ["clicky-ui", "facet", "React", "Requests", "Transferred", "Edit to visible"].includes(item.key))} />
      <Button size="sm" variant="link" className="h-auto p-0" onClick={() => onOpenConfiguration()}>Runtime configuration…</Button>
    </> : <p role="status" className="text-muted-foreground">No page frame is open.</p>}
  </section>;
}

/** Full runtime configuration: profile, lock, import map and the request activity of the open frame. */
export function RuntimeConfigurationDialog({ open, onClose, onAddDependency }: { open: boolean; onClose: () => void; onAddDependency?: () => void }) {
  const status = useRuntimeStatus();
  const session = useBrowserSession();
  const [failure, setFailure] = useState<Error | null>(null);
  const [requestedTab, setTab] = useRuntimeRoute("tab");
  const tab = requestedTab || "summary";
  if (!status) return null;
  const { lock } = status;
  return <Modal open={open} onClose={onClose} size="xl" expandable title="Runtime configuration" subtitle={status.page}>
    <Tabs tabs={TABS} value={tab} onChange={setTab} />
    <div className="pt-3">
      {tab === "summary" && <div className="space-y-2"><LoadTiming status={status} onOpenBuildLog={() => setTab("build")} /><Properties items={summaryItems(status)} /></div>}
      {tab === "profile" && <div className="space-y-3"><RuntimeProfileEditor slug={status.page} policy={status.policy} onApplied={() => { void session?.reload({ reason: "packages", revision: `policy-${crypto.randomUUID()}`, packages: [] }).catch(setFailure); }} />{failure && <ActionError title="Recheck failed" error={failure} />}<div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">Effective dependencies</h3>{onAddDependency && <Button size="sm" variant="outline" onClick={onAddDependency}>Add dependency…</Button>}</div><JsonView data={status.dependencies} format="yaml" /><p className="text-xs text-muted-foreground">Precedence, lowest first: browser runtime default → runtime-profile.json → package.json → browser override for every page → browser override for this page → page header. Local folder overrides take precedence for matching packages.</p><h3 className="text-sm font-semibold">Dependency declarations by scope</h3><JsonView data={status.dependencySources} format="yaml" /><h3 className="text-sm font-semibold">Effective resolver configuration</h3><JsonView data={status.profile} format="json" /><h3 className="text-sm font-semibold">Source roots and aliases</h3><JsonView data={status.configuration} format="json" /></div>}
      {tab === "lock" && (lock ? <div className="space-y-3">
        <Properties<unknown> items={[
          ...Object.entries(lock.versions).map(([name, version]) => ({ key: name, value: version })),
          { key: "Integrity entries", value: Object.keys(lock.integrity).length },
          { key: "Import-map scopes", value: Object.keys(lock.map.scopes).length },
          { key: "Indexed barrels", value: `${Object.keys(lock.barrels.barrels).length} over ${lock.barrels.modules.length} modules` },
        ]} />
        <JsonView data={lock.map} format="json" />
      </div> : <p className="text-sm text-muted-foreground">No lock was resolved. Inspect the runtime problems and configuration, then recheck the page.</p>)}
      {tab === "activity" && (status.activity.current ? <RuntimeActivity activity={status.activity} className="h-[60dvh]" /> : <p className="text-sm text-muted-foreground">The frame has not started. No frame requests have been recorded; the page is {status.state}.</p>)}
      {tab === "build" && <StatusBuildLog status={status} />}
      {tab === "overrides" && <LocalOverrides usedPackages={status.usedPackages} />}
    </div>
  </Modal>;
}
