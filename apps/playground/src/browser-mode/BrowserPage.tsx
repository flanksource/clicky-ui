import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Button, useCommentContext, useDensity, useTheme } from "@flanksource/clicky-ui";
import { CommentDraftPopover } from "@flanksource/clicky-ui/comments";
import { BuildLog, PageFrame, RuntimeActivity, appendActivity, buildLog, clearPageRuntimeCache, emptyActivity, validateHostMessage, type BuildStep, type PageBridge } from "@flanksource/page-runtime/host";
import type { AgentAnchorState, AgentSelection, DesignWriteResult, FrameMessage, PageLock, RuntimeProfile } from "@flanksource/page-runtime/schema";
import { postVisualEdit } from "../visual-edit/visual-edits-api";
import { screenshotCaptureSupported } from "../comments/screenshot";
import { changedSources, type BrowserProject } from "./project";
import { useBrowserSession } from "./session";
import { FrameAnchors } from "./FrameAnchors";
import { DesignPanel } from "./DesignPanel";
import { commentPins } from "./comment-pins";
import type { PageReload } from "../page-reload";
import { connectPageLinks, RUNTIME_WORKER_SCOPE } from "./links";
import { localOverrides, requiredOverrides } from "./local-overrides";
import { policyIssues, runtimeIssue, type RuntimeProblem } from "./problems";
import { RuntimeProblems } from "./RuntimeProblems";
import { RuntimeTimings } from "./RuntimeTimings";
import { RuntimeConfigurationDialog } from "./RuntimeStatus";
import { DependencyFix } from "./DependencyFix";
import { useRuntimeRoute } from "./runtime-route";
import type { StoredLink } from "@flanksource/page-runtime/host/link";
import { readBrowserRuntime, useBrowserRuntimeVersion, type DependencyScope } from "./dependency-defaults";
import { DependencyApproval } from "./DependencyApproval";
import type { EffectiveProfile } from "./runtime-profile";
import { loadBrowserProject, prepareBrowserProject, projectFor } from "./load-project";

export function BrowserPage({ slug, designing, annotations, showRejected, comments, onAnchors, onPending, onOpenSource, sourceDirty = false }: { slug: string; designing: boolean; annotations: "visible" | "hidden"; showRejected: boolean; comments: import("../comments/useComments").PageComment[]; onAnchors: (anchors: AgentAnchorState[]) => void; onPending: (pending: boolean) => void; onOpenSource: (target: { file: string; line: number }) => void; sourceDirty?: boolean }) {
  const session = useBrowserSession();
  if (!session) throw new Error("BrowserPage requires a browser session");
  const context = useCommentContext();
  const { resolvedTheme } = useTheme();
  const { density } = useDensity();
  const wrapper = useRef<HTMLDivElement>(null);
  const [project, setProject] = useState<BrowserProject | null>(null);
  const [lock, setLock] = useState<PageLock>();
  const [profile, setProfile] = useState<RuntimeProfile>();
  const [bridge, setBridge] = useState<PageBridge | null>(null);
  const [state, setState] = useState("connecting");
  const [failure, setFailure] = useState<Error | null>(null);
  const [anchors, setAnchors] = useState<AgentAnchorState[]>([]);
  const [selection, setSelection] = useState<AgentSelection | null>(null);
  const [draft, setDraft] = useState(false);
  const [draftReference, setDraftReference] = useState<HTMLSpanElement | null>(null);
  const [design, setDesign] = useState<Extract<FrameMessage, { type: "design-selection" }> | null>(null);
  const [designError, setDesignError] = useState("");
  const [designResult, setDesignResult] = useState<DesignWriteResult | null>(null);
  const [pending, setPending] = useState(false);
  const [activity, setActivity] = useState(emptyActivity);
  const [steps, setSteps] = useState<BuildStep[]>([]);
  const step = useCallback((label: string, source: BuildStep["source"] = "host", error?: string) => setSteps(previous => source === "frame" && !error && previous.at(-1)?.label === label ? previous : [...previous, { label, source, at: performance.timeOrigin + performance.now(), ...(error ? { error } : {}) }]), []);
  const restartSteps = useCallback((label: string) => setSteps([{ label, source: "host", at: performance.timeOrigin + performance.now() }]), []);
  const overrides = useSyncExternalStore(localOverrides.subscribe, localOverrides.getSnapshot);
  const browserDefaults = useBrowserRuntimeVersion(slug);
  const [effective, setEffective] = useState<EffectiveProfile | null>(null);
  const baseProfile = useRef<RuntimeProfile | null>(null);
  const overridesRef = useRef(overrides); overridesRef.current = overrides;
  const [revision, setRevision] = useState(0);
  const [clearing, setClearing] = useState(false);
  const [inspector, setInspector] = useRuntimeRoute("inspect");
  const [, setInspectorTab] = useRuntimeRoute("tab");
  const [fix, setFix] = useState<{ problem: RuntimeProblem; scope?: DependencyScope; remove?: boolean } | null>(null);
  const [localUpdate, setLocalUpdate] = useState<string[] | null>(null);
  const local = requiredOverrides({ links: overrides.links, packages: [...(project?.requiredPackages ?? []), ...Object.keys(project?.manifest.dependencies ?? {})] });
  const overrideKey = JSON.stringify(local.map(link => [link.id, link.build, overrides.permissions[link.id]]));
  const activeLocal = useRef<StoredLink[]>([]);
  const localUpdateRef = useRef(localUpdate); localUpdateRef.current = localUpdate;
  const openInspector = (tab: string) => { setInspectorTab(tab); setInspector("open"); };
  const links = useRef<Awaited<ReturnType<typeof connectPageLinks>> | null>(null);
  const publishedLock = useRef<PageLock | null>(null);
  const editStarted = useRef<number | undefined>(undefined);
  const pendingReload = useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(null);
  const lifecycle = useRef(0);
  const theme = useMemo(() => ({ theme: resolvedTheme, density }), [resolvedTheme, density]);
  const data = useMemo(() => ({ ...theme, annotations, showRejected }), [theme, annotations, showRejected]);

  useEffect(() => { void localOverrides.restore(); }, []);
  useEffect(() => {
    if (!overrides.loaded) return;
    lifecycle.current++;
    let live = true;
    setState("checking"); setFailure(null); setLock(undefined);
    restartSteps("Resolve page dependencies");
    void (async () => {
      const { project: next, profile, effective: layered, base, local: selected } = await loadBrowserProject({ slug, overrides: overridesRef.current, browser: readBrowserRuntime(slug) });
      if (!live) return;
      setProject(next);
      setProfile(profile); setEffective(layered); baseProfile.current = base;
      if (!next.compatible) { setState("blocked"); step("Blocked by incompatible dependencies", "host", `${next.issues.length} problem(s)`); return; }
      const rejected = layered.policy.pending.map(item => item.name).join(", ");
      if (rejected && layered.policy.dependencies === "ask") { setState("approval"); step("Waiting for dependency approval", "host", rejected); return; }
      if (rejected) { setState("blocked"); step(`Blocked by dependency policy ${layered.policy.dependencies}`, "host", rejected); return; }
      activeLocal.current = selected;
      setState("starting");
      step("Prepare runtime and links");
      const { publishedLock: resolved, connected, lock: linked } = await prepareBrowserProject({ project: next, profile, local: selected });
      if (!live) { await connected.close(); return; }
      publishedLock.current = resolved;
      links.current = connected;
      step("Open frame");
      if (live) { setProfile(profile); setLock(linked); setProject(next); }
    })().catch(error => { if (live) { const failed = error instanceof Error ? error : new Error(String(error)); step("Load failed", "host", failed.message); setFailure(failed); setState("failed"); } });
    return () => { live = false; lifecycle.current++; pendingReload.current?.reject(new Error("Page closed during reload")); pendingReload.current = null; const connected = links.current; links.current = null; if (connected) void connected.close().catch(setFailure); };
  }, [slug, revision, overrides.loaded, overrideKey, browserDefaults, step, restartSteps]);

  const reload = useCallback<PageReload>(async request => {
    if (request.reason === "packages") {
      if (sourceDirty) throw new Error("Save or revert source edits before refreshing");
      if (pendingReload.current) throw new Error("Frame reload is already pending");
      const generation = lifecycle.current;
      setState("updating"); setFailure(null); setLock(undefined); setBridge(null);
      restartSteps("Resolve updated page dependencies");
      try {
        const loaded = await loadBrowserProject({ slug, overrides: overridesRef.current, browser: readBrowserRuntime(slug) });
        if (!loaded.project.compatible) throw new Error("Updated page dependencies are incompatible; inspect the runtime configuration");
        if (loaded.effective.policy.pending.length) throw new Error(`Dependency policy ${loaded.effective.policy.dependencies} rejects ${loaded.effective.policy.pending.map(item => item.name).join(", ")}; recheck the page to resolve it`);
        setEffective(loaded.effective); baseProfile.current = loaded.base;
        step("Prepare runtime and links");
        const prepared = await prepareBrowserProject({ project: loaded.project, profile: loaded.profile, local: loaded.local });
        if (lifecycle.current !== generation) { await prepared.connected.close(); throw new Error("Page changed during refresh"); }
        const previous = links.current;
        links.current = prepared.connected;
        activeLocal.current = loaded.local;
        publishedLock.current = prepared.publishedLock;
        if (previous) await previous.close();
        step("Open frame");
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => { pendingReload.current = null; reject(new Error("Frame refresh readiness timed out")); }, 20000);
          pendingReload.current = { resolve: () => { clearTimeout(timer); resolve(); }, reject: error => { clearTimeout(timer); reject(error); } };
          setProfile(loaded.profile); setProject(loaded.project); setLock(prepared.lock);
        });
      } catch (cause) {
        const error = cause instanceof Error ? cause : new Error(String(cause));
        step("Refresh failed", "host", error.message);
        setFailure(error); setState("failed"); throw error;
      }
      return;
    }
    if (localUpdateRef.current) { setLocalUpdate(null); setRevision(value => value + 1); return; }
    if (!project?.compatible || !bridge || !lock) { setRevision(value => value + 1); return; }
    if (!baseProfile.current) throw new Error("Runtime profile has not loaded");
    const { project: next } = await projectFor({ slug, packages: overridesRef.current.links.map(link => link.build.library), base: baseProfile.current, browser: readBrowserRuntime(slug) });
    if (!next.compatible) { setProject(next); setState("blocked"); setFailure(null); return; }
    const files = changedSources({ before: project.hashes, after: next.hashes });
    if (!Object.keys(files).length) return;
    const connected = links.current;
    if (!connected) throw new Error("Source link connection is unavailable");
    if (pendingReload.current) throw new Error("Frame reload is already pending");
    editStarted.current = performance.timeOrigin + performance.now();
    setState("updating"); setDraft(false); setSelection(null); setDesign(null);
    restartSteps(`Invalidate ${Object.keys(files).length} changed source(s)`);
    for (const link of project.links) {
      const paths = Object.keys(files).filter(path => path.startsWith(`/link/${link.id}/`)).map(path => path.slice(`/link/${link.id}/`.length));
      if (paths.length) await connected.host.invalidate(link.id, paths);
    }
    if (!publishedLock.current) throw new Error("Published runtime lock is unavailable");
    if (JSON.stringify(next.manifest) !== JSON.stringify(project.manifest)) { setRevision(value => value + 1); return; }
    step("Install changed sources");
    const updatedLock = await connected.install(next, publishedLock.current, activeLocal.current);
    setLock(updatedLock);
    step("Reopen frame");
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { pendingReload.current = null; reject(new Error("Frame reload readiness timed out")); }, 20000);
      pendingReload.current = { resolve: () => { clearTimeout(timer); setProject(next); resolve(); }, reject: error => { clearTimeout(timer); reject(error); } };
      bridge.send({ type: "open", page: next.page, files: next.files, manifest: next.manifest, lock: updatedLock, ...(profile ? { policy: profile.policy } : {}) });
    });
  }, [project, bridge, lock, profile, slug, sourceDirty, step, restartSteps]);

  useEffect(() => {
    const connection = links.current;
    if (state !== "ready" || !connection || !activeLocal.current.length) return;
    const unregister = connection.host.registerFrame({ id: slug, links: activeLocal.current.map(link => link.id), reload: () => { setLocalUpdate(activeLocal.current.map(link => link.build.library)); window.dispatchEvent(new CustomEvent("playground-local-change", { detail: `local-${crypto.randomUUID()}` })); } });
    const watchers = activeLocal.current.map(link => connection.host.watch(link.id));
    let disposed = false;
    void (async () => { for (const watcher of watchers) { if (disposed) return; await watcher.start({ onError: error => setFailure(new Error(String(error))) }); } })().catch(error => setFailure(new Error(String(error))));
    return () => { disposed = true; unregister(); void Promise.all(watchers.map(watcher => watcher.stop())).catch(error => setFailure(new Error(String(error)))); };
  }, [state === "ready", overrideKey, slug]);

  useEffect(() => {
    session.attach({ bridge, frame: wrapper.current?.querySelector("iframe") ?? null, reload });
  }, [session, bridge, reload]);
  useEffect(() => () => session.attach({ bridge: null, frame: null, reload: null }), [session]);
  useEffect(() => {
    session.publishRuntime({ page: slug, state: failure ? "failed" : state, build: steps, profile: profile ?? null, lock: lock ?? null, activity, links: (project?.compatible ? project.links.length : 0) + local.length, dependencies: project?.manifest.dependencies ?? {}, issues: [...(project?.issues ?? []), ...(failure ? [runtimeIssue(failure, slug)] : [])], usedPackages: local.map(link => link.build.library), configuration: project?.configuration ?? null, dependencySources: effective?.declared ?? null, policy: effective?.policy ?? null });
  }, [session, project, profile, effective, lock, state, activity, failure, overrideKey, slug, steps]);
  useEffect(() => () => session.publishRuntime(null), [session]);
  useEffect(() => { if (state === "ready") bridge?.send({ type: "mode", mode: annotations === "hidden" ? "off" : designing ? "design" : "off" }); }, [bridge, state, designing, annotations]);
  useEffect(() => {
    if (state !== "ready" || !bridge) return;
    bridge.send({ type: "pins", anchors: annotations === "hidden" ? [] : commentPins(comments), focus: context.focusedAnchor });
    bridge.send({ type: "highlight", anchor: context.highlightAnchor });
  }, [bridge, state, comments, annotations, context.focusedAnchor, context.highlightAnchor]);
  useEffect(() => {
    const anchor = context.focusedAnchor;
    if (state === "ready" && anchor && anchors.some(item => item.anchor === anchor && item.state !== "orphaned")) bridge?.send({ type: "scroll", anchor, behavior: "smooth", block: "center" });
  }, [context.focusedAnchor, bridge, state]);

  const receive = (message: FrameMessage) => {
    session.receive(message);
    if (message.type === "activity") setActivity(previous => appendActivity({ state: previous, message, ...(editStarted.current === undefined ? {} : { editStartedAt: editStarted.current }) }));
    else if (message.type === "status") { step(message.state, "frame"); setState(message.state); if (message.state === "ready") { pendingReload.current?.resolve(); pendingReload.current = null; } }
    else if (message.type === "error") { step("Frame error", "frame", message.error.message); const error = Object.assign(new Error(message.error.message), { pageRuntime: message.error }); pendingReload.current?.reject(error); pendingReload.current = null; setFailure(error); setState("failed"); }
    else if (message.type === "anchors") { setAnchors(message.anchors); onAnchors(message.anchors); }
    else if (message.type === "selection") { const consumed = session.accept(message.selection); setSelection(message.selection); if (!consumed) setDraft(true); }
    else if (message.type === "focus") context.focusAnchor(message.anchor);
    else if (message.type === "keys" && message.key === "c") bridge?.send({ type: "pick" });
    else if (message.type === "keys" && message.key === "Escape") setDraft(false);
    else if (message.type === "design-selection") { if (pending) { setDesignError("Save or discard the current visual edit before selecting another element"); return; } setDesign(message); session.accept(message.selection); setDesignError(""); setDesignResult(null); }
    else if (message.type === "design-override-result" && !message.ok) setDesignError(message.error);
    else if (message.type === "design-write-request") void (async () => {
      try {
        const result = await postVisualEdit(message.request);
        bridge!.send(validateHostMessage({ type: "design-write-result", requestId: message.requestId, result }));
        setDesignResult(result);
        if (result.status === "applied") { setPending(false); onPending(false); await reload({ reason: "review", page: slug }); }
        else setDesignError(result.error);
      } catch (error) { setDesignError(String(error)); }
    })();
  };
  const exportHtml = async () => {
    if (!bridge) throw new Error("Export needs a ready frame");
    const result = await bridge.request({ type: "export", format: "html" });
    if (result.message.type !== "snapshot") throw new Error("Frame did not return an HTML snapshot");
    const url = URL.createObjectURL(new Blob([result.message.html], { type: "text/html" }));
    const link = document.createElement("a"); link.href = url; link.download = `${slug.replaceAll("/", "-")}.html`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const blockedByPolicy = state === "blocked" && effective?.policy.pending.length ? policyIssues({ pending: effective.policy.pending, policy: effective.policy.dependencies, file: project?.entryFile ?? slug }) : [];
  const issues = [...(project?.issues ?? []), ...blockedByPolicy, ...(failure ? [runtimeIssue(failure, slug)] : [])];
  const errored = Boolean(failure) || state === "failed" || state === "blocked";
  const clearCacheAndRecheck = () => {
    setClearing(true);
    void clearPageRuntimeCache({ runtimeOrigin: location.origin, scope: RUNTIME_WORKER_SCOPE })
      .then(() => setRevision(value => value + 1))
      .catch(cause => {
        const error = cause instanceof Error ? cause : new Error(String(cause));
        step("Clearing the page runtime cache failed", "host", error.message);
        setFailure(new Error(`Could not clear the page runtime cache: ${error.message}`));
      })
      .finally(() => setClearing(false));
  };
  const loading = !failure && !["ready", "blocked", "failed", "approval"].includes(state);
  const log = loading && steps.length ? <BuildLog entries={buildLog({ steps, load: activity.current })} live startedAt={steps[0]!.at} /> : null;
  return <section className="flex h-full min-h-0 flex-col" aria-label="Browser page">
    <div data-package-updates className="shrink-0" />
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border p-2 text-xs"><span role="status">{failure ? "failed" : state}</span><Button size="sm" variant="outline" onClick={() => openInspector("activity")}>Runtime activity</Button><Button size="sm" variant="outline" onClick={() => openInspector("profile")}>Configuration</Button><Button size="sm" variant="outline" disabled={sourceDirty} onClick={() => setRevision(value => value + 1)}>Recheck</Button>{errored && <Button size="sm" variant="outline" disabled={sourceDirty || clearing} onClick={clearCacheAndRecheck}>Clear page runtime cache and try again</Button>}<Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(JSON.stringify({ page: slug, issues, profile, lock, activity }, null, 2)).catch(error => setFailure(new Error(String(error)))); }}>Copy diagnostics</Button></div>
    {localUpdate && <div role="status" className="flex flex-wrap items-center gap-2 border-b border-border p-2 text-xs">Local packages changed: {localUpdate.join(", ")}<Button size="sm" disabled={sourceDirty} onClick={() => { setLocalUpdate(null); setRevision(value => value + 1); }}>Reload local changes</Button></div>}
    {issues.length > 0 && <RuntimeProblems issues={issues} slug={slug} policy={effective?.policy.dependencies ?? null} sources={effective?.sources ?? {}} onFix={(problem, options) => setFix({ problem, ...options })} onLink={() => openInspector("overrides")} onInspect={openInspector} onClearCache={clearCacheAndRecheck} />}
    {issues.length > 0 && <RuntimeTimings steps={steps} load={activity.current} />}
    {!project?.compatible || !lock ? !issues.length && <div aria-label="Page build" className="min-h-0 flex-1 overflow-auto p-4"><p role="status" className="mb-2 text-sm">Checking page dependencies and preparing the runtime…</p>{log}</div> : <>
    {!issues.length && <div className="flex shrink-0 items-center gap-2 border-b border-border p-2"><span role="status" data-testid="playground-frame-status" className="mr-auto text-xs">{state}</span><Button size="sm" variant="outline" disabled={state !== "ready"} onClick={() => bridge!.send({ type: "mode", mode: "comment" })}>Comment on element</Button><Button size="sm" variant="outline" disabled={state !== "ready"} onClick={() => { void exportHtml().catch(setFailure); }}>Export HTML</Button><Button size="sm" variant="outline" disabled={state !== "ready"} onClick={() => { void bridge!.request({ type: "export", format: "print" }).catch(setFailure); }}>Print page</Button></div>}
    <div ref={wrapper} className={issues.length ? "hidden" : "relative min-h-0 flex-1"}><PageFrame runtimeOrigin={location.origin} origin="same-origin-local" open={{ page: project.page, files: project.files, manifest: project.manifest, lock, ...(profile ? { policy: profile.policy } : {}) }} theme={theme} data={data} onBridge={setBridge} onMessage={receive} onError={setFailure} title={`Page: ${slug}`} className="h-full w-full border-0" /><FrameAnchors anchors={anchors} selection={selection} />{log && <div aria-label="Page build" className="absolute inset-0 overflow-auto bg-background/95 p-4"><p className="mb-2 text-sm">Building page…</p>{log}</div>}{selection && <span ref={setDraftReference} aria-hidden="true" className="pointer-events-none absolute" style={{ left: selection.rect.left, top: selection.rect.top, width: selection.rect.width, height: selection.rect.height }} />}</div>
    {designing && design && bridge && <DesignPanel key={design.source} page={slug} target={design} bridge={bridge} result={designResult} error={designError} onOpenSource={onOpenSource} onPending={value => { setPending(value); onPending(value); }} />}
    <details className="shrink-0 border-t border-border"><summary className="cursor-pointer px-3 py-2 text-xs">Runtime activity</summary><RuntimeActivity activity={activity} className="h-80" /></details>
    </>}
    <RuntimeConfigurationDialog open={Boolean(inspector)} onClose={() => setInspector("")} onAddDependency={() => { setInspector(""); setFix({ problem: { id: "add-dependency", package: null, message: "Add dependency", kind: "external-package", locations: [], fix: "" } }); }} />
    {state === "approval" && effective && !fix && <DependencyApproval slug={slug} pending={effective.policy.pending} onAddToPackageJson={name => setFix({ problem: { id: `policy:${name}`, package: name, message: name, kind: "policy", locations: [], fix: "" }, scope: "workspace" })} onDeny={() => setState("blocked")} />}
    {fix && project && baseProfile.current && <DependencyFix project={project} problem={fix.problem} base={baseProfile.current} links={local} slug={slug} sourceDirty={sourceDirty} {...(fix.scope ? { initialScope: fix.scope } : {})} remove={fix.remove ?? false} onClose={() => setFix(null)} onApplied={() => { setFix(null); setRevision(value => value + 1); }} />}
    {draft && selection && draftReference && <CommentDraftPopover reference={draftReference} anchor={selection.anchor} label={selection.label} config={context.config} onDiscard={() => setDraft(false)} createActions={[{ id: "plain", label: "Post comment" }, ...(screenshotCaptureSupported() ? [{ id: "screenshot", label: "Post with screenshot" }] : [])]} onCreate={async (input, action) => { if (!context.callbacks.onCreate) throw new Error("Comment creation is not configured"); await context.callbacks.onCreate(input, action); setDraft(false); context.focusAnchor(selection.anchor); }} />}
  </section>;
}
