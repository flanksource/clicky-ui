import { useEffect, useRef, useState, type ComponentType } from "react";
import { ErrorWrapper, useDensity, useTheme } from "@flanksource/clicky-ui";
import { captureVocabularyPreviews } from "@flanksource/clicky-ui/comments";
import { PageFrame, type PageBridge } from "@flanksource/page-runtime/host";
import { loadBrowserProject, prepareBrowserProject } from "../browser-mode/load-project";
import { localOverrides } from "../browser-mode/local-overrides";
import { readBrowserRuntime } from "../browser-mode/dependency-defaults";
import type { PreviewJob } from "./previews";

const offscreen = { position: "fixed", left: -20000, top: 0, width: 1280, height: 800 } as const;

export function VocabularyPreviewGenerator({ job }: { job: PreviewJob }) {
  const { resolvedTheme } = useTheme();
  const { density } = useDensity();
  return import.meta.env.PLAYGROUND_BROWSER_MODE
    ? <BrowserGenerator job={job} theme={{ theme: resolvedTheme, density }} />
    : <DevGenerator job={job} />;
}

function DevGenerator({ job }: { job: PreviewJob }) {
  const root = useRef<HTMLDivElement>(null);
  const [Page, setPage] = useState<ComponentType | null>(null);
  useEffect(() => {
    let live = true;
    void import(/* @vite-ignore */ job.catalog.page).then(module => {
      if (typeof module.default !== "function") throw new Error(`${job.catalog.file} requires a default page component`);
      if (live) setPage(() => module.default);
    }).catch(job.reject);
    return () => { live = false; };
  }, [job]);
  useEffect(() => {
    if (!Page || !root.current) return;
    const container = root.current;
    let live = true;
    const controller = new AbortController();
    const timer = setTimeout(() => { controller.abort(); job.reject(new Error(`Vocabulary capture timed out: ${job.catalog.file}`)); }, Math.max(60000, job.count * 2000));
    void settle(container, controller.signal).then(() => captureVocabularyPreviews(container)).then(images => { if (live) job.resolve(images); }).catch(error => { if (live) job.reject(error); }).finally(() => clearTimeout(timer));
    return () => { live = false; controller.abort(); clearTimeout(timer); };
  }, [Page, job]);
  return <div style={offscreen} aria-hidden="true" tabIndex={-1} ref={root}><ErrorWrapper onError={job.reject} renderFallback={() => null}>{Page && <Page />}</ErrorWrapper></div>;
}

async function settle(root: HTMLElement, signal: AbortSignal) {
  await document.fonts.ready;
  let changed = performance.now();
  const observer = new MutationObserver(() => { changed = performance.now(); });
  observer.observe(root, { subtree: true, childList: true, attributes: true, characterData: true });
  try {
    while (!signal.aborted) {
      const error = root.querySelector("[data-facet-error]");
      if (error) throw new Error(error.getAttribute("data-facet-error")!);
      const diagrams = [...root.querySelectorAll("[data-facet-diagram]")].every(element => element.getAttribute("data-facet-ready") === "true");
      const arrows = [...root.querySelectorAll("[data-facet-arrow]")].every(element => element.getAttribute("data-facet-arrow-ready") === "true");
      if (diagrams && arrows && performance.now() - changed >= 300) return;
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
    throw new Error("Vocabulary generation cancelled");
  } finally { observer.disconnect(); }
}

function BrowserGenerator({ job, theme }: { job: PreviewJob; theme: { theme: "light" | "dark"; density: "compact" | "comfortable" | "spacious" } }) {
  const [runtime, setRuntime] = useState<(Awaited<ReturnType<typeof prepareBrowserProject>> & { project: Extract<Awaited<ReturnType<typeof loadBrowserProject>>["project"], { compatible: true }>; policy: import("@flanksource/page-runtime/schema").RuntimePolicy }) | null>(null);
  const bridge = useRef<PageBridge | null>(null);
  const capturing = useRef(false);
  const readyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    let live = true;
    let connected: Awaited<ReturnType<typeof prepareBrowserProject>>["connected"] | undefined;
    readyTimer.current = setTimeout(() => job.reject(new Error(`Vocabulary frame readiness timed out: ${job.catalog.file}`)), 120000);
    void (async () => {
      await localOverrides.restore();
      const { project, profile, effective, local } = await loadBrowserProject({ slug: job.catalog.slug, browser: readBrowserRuntime(job.catalog.slug), overrides: localOverrides.getSnapshot() });
      if (!project.compatible) throw new Error(`${job.catalog.file}: ${project.issues.map(issue => issue.reason).join("; ")}`);
      if (effective.policy.pending.length) throw new Error(`${job.catalog.file}: dependency policy ${effective.policy.dependencies} rejects ${effective.policy.pending.map(item => item.name).join(", ")}; open the page to allow or declare them`);
      const prepared = await prepareBrowserProject({ project, profile, local });
      connected = prepared.connected;
      if (live) setRuntime({ ...prepared, project, policy: profile.policy }); else await connected.close();
    })().catch(job.reject);
    return () => { live = false; clearTimeout(readyTimer.current); if (connected) void connected.close().catch(job.reject); };
  }, [job]);
  if (!runtime) return null;
  return <PageFrame style={offscreen} aria-hidden="true" tabIndex={-1} title={`Generate ${job.catalog.alias} previews`} runtimeOrigin={location.origin} origin="same-origin-local" open={{ page: runtime.project.page, files: runtime.project.files, manifest: runtime.project.manifest, lock: runtime.lock, policy: runtime.policy }} theme={theme} data={{ ...theme, annotations: "hidden", showRejected: false }} onBridge={value => { bridge.current = value; }} onError={job.reject} onMessage={message => {
    if (message.type === "error") job.reject(new Error(message.error.message));
    if (message.type !== "status" || message.state !== "ready" || capturing.current) return;
    clearTimeout(readyTimer.current);
    capturing.current = true;
    if (!bridge.current) { job.reject(new Error("Vocabulary frame has no bridge")); return; }
    void bridge.current.request({ type: "capture-vocabulary" }, { timeoutMs: Math.max(60000, job.count * 2000) }).then(result => {
      if (result.message.type !== "vocabulary-previews") throw new Error(`Unexpected vocabulary capture response: ${result.message.type}`);
      job.resolve(result.message.images);
    }).catch(job.reject);
  }} />;
}
