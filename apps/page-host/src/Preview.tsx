import { useEffect, useRef, useState, type ReactNode } from "react";
import { PageFrame, RuntimeActivity, appendActivity, emptyActivity, type PageBridge } from "@flanksource/page-runtime/host";
import type { FrameMessage, PageLock, Theme } from "@flanksource/page-runtime/schema";
import type { ActivityMessage } from "@flanksource/page-runtime/host";
import { Button } from "@flanksource/clicky-ui";
import { manifestOf, type Project } from "./project";
import { previewUpdate } from "./preview-update";
import { LibraryLinks } from "./LibraryLinks";

function saveHtml(options: { html: string; filename: string }) {
  const url = URL.createObjectURL(new Blob([options.html], { type: "text/html" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = options.filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Preview({ project, runtimeOrigin, theme, onLock, onError, onMessage, onBridge, toolbar }: { project: Project; runtimeOrigin: string; theme: Theme; onLock: (lock: PageLock) => void; onError: (error: Error) => void; onMessage?: (message: FrameMessage) => void; onBridge?: (bridge: PageBridge | null) => void; toolbar?: ReactNode }) {
  const [bridge, setBridge] = useState<PageBridge | null>(null);
  const [state, setState] = useState("connecting");
  const [failure, setFailure] = useState("");
  const [pendingExport, setPendingExport] = useState(false);
  const [activated, setActivated] = useState(false);
  const [activity, setActivity] = useState(emptyActivity);
  const [activityOpen, setActivityOpen] = useState(false);
  const activityQueue = useRef<Array<{ message: ActivityMessage; editStartedAt?: number }>>([]);
  const activityTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const editStarted = useRef<number | undefined>(undefined);
  const editorInput = useRef<number | undefined>(undefined);
  const [linkedLock, setLinkedLock] = useState<PageLock | undefined>();
  const pendingReload = useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(null);
  const sent = useRef(project.files);
  const lock = linkedLock ?? project.locks[project.entry];
  const open = { page: project.entry, files: project.files, manifest: manifestOf(project.files), ...(lock ? { lock } : {}) };

  useEffect(() => {
    const input = (event: Event) => { if (event.target instanceof Element && event.target.closest(".monaco-editor")) editorInput.current = performance.timeOrigin + performance.now(); };
    document.addEventListener("input", input, true);
    return () => document.removeEventListener("input", input, true);
  }, []);

  useEffect(() => () => {
    clearTimeout(activityTimer.current);
    pendingReload.current?.reject(new Error("Preview closed before readiness")); pendingReload.current = null;
  }, []);

  useEffect(() => {
    if (!bridge || state === "connecting") return;
    const message = previewUpdate({ project, previous: sent.current, reopen: state === "error", ...(linkedLock ? { sessionLock: linkedLock } : {}) });
    if (!message) return;
    sent.current = project.files; setState("updating"); setFailure(""); editStarted.current = editorInput.current ?? performance.timeOrigin + performance.now(); editorInput.current = undefined;
    bridge.send(message);
  }, [project, bridge, state, linkedLock]);

  function receive(message: FrameMessage) {
    onMessage?.(message);
    if (message.type === "activity") {
      activityQueue.current.push({ message, ...(editStarted.current !== undefined ? { editStartedAt: editStarted.current } : {}) });
      activityTimer.current ??= setTimeout(() => {
        activityTimer.current = undefined;
        const pending = activityQueue.current; activityQueue.current = [];
        setActivity((state) => pending.reduce((state, entry) => appendActivity({ state, ...entry }), state));
      }, 40);
      return;
    }
    if (message.type === "status" && message.state === "ready") { setActivated(true); pendingReload.current?.resolve(); pendingReload.current = null; }
    if (message.type === "status") setState(message.state);
    if (message.type === "lock") {
      setActivated(true);
      if (!Object.values(message.lock.map.imports).some((url) => url.startsWith("/link/"))) onLock(message.lock);
    }
    if (message.type === "error") {
      setState("error"); setFailure(`${message.error.phase}: ${message.error.file}${message.error.line ? `:${message.error.line}` : ""}: ${message.error.message}`);
      pendingReload.current?.reject(new Error(message.error.message)); pendingReload.current = null;
    }
  }

  async function reload(options: { type: "open" | "reload"; lock?: PageLock }): Promise<void> {
    if (!bridge) throw new Error("preview bridge is unavailable");
    if (pendingReload.current) throw new Error("Preview reload is already pending");
    const targetLock = options.lock ?? project.locks[project.entry];
    if (!targetLock) throw new Error(`Published lock for ${project.entry} is unavailable`);
    if (options.type === "open") setLinkedLock(options.lock);
    setState("updating"); setFailure("");
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { pendingReload.current = null; reject(new Error("Linked preview readiness timed out")); }, 15000);
      pendingReload.current = { resolve: () => { clearTimeout(timer); resolve(); }, reject: (error) => { clearTimeout(timer); reject(error); } };
      try { bridge.send(options.type === "reload" ? { type: "reload" } : { type: "open", ...open, lock: targetLock }); }
      catch (error) { pendingReload.current.reject(error instanceof Error ? error : new Error(String(error))); pendingReload.current = null; }
    });
  }

  async function output(format: "html" | "print") {
    if (!bridge) throw new Error("preview bridge is unavailable");
    setPendingExport(true);
    try {
      const response = await bridge.request({ type: "export", format });
      if (format === "html") {
        if (response.message.type !== "snapshot") throw new Error("frame did not return an HTML snapshot");
        saveHtml({ html: response.message.html, filename: `${project.entry.replace(/\.[^.]+$/, "")}.html` });
      }
    } catch (error) { onError(error instanceof Error ? error : new Error(String(error))); }
    finally { setPendingExport(false); }
  }

  return <section className="flex h-full min-h-0 flex-col" aria-label="Page preview">
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
      <span role="status" data-testid="preview-status" className="mr-auto text-sm">{state}</span>
      {toolbar}
      <Button size="sm" variant="outline" disabled={state !== "ready" || pendingExport} onClick={() => { void output("html"); }}>Export HTML</Button>
      <Button size="sm" variant="outline" disabled={state !== "ready" || pendingExport} onClick={() => { void output("print"); }}>Print</Button>
    </div>
    {failure && <p role="alert" className="break-words border-b border-border p-3 text-sm text-destructive">{failure}</p>}
    <LibraryLinks runtimeOrigin={runtimeOrigin} activated={activated} lock={project.locks[project.entry]} reload={reload} onError={onError} />
    <PageFrame runtimeOrigin={runtimeOrigin} open={open} theme={theme} data={null} onBridge={(value) => { setBridge(value); onBridge?.(value); }} onMessage={receive} onError={onError}
      title="Page preview" className="min-h-0 w-full flex-1 border-0 bg-background" />
    <details className="shrink-0 border-t border-border" data-testid="runtime-activity" onToggle={(event) => setActivityOpen(event.currentTarget.open)}><summary className="cursor-pointer px-density-3 py-density-2 text-sm font-medium">Runtime activity</summary>{activityOpen && <RuntimeActivity activity={activity} className="h-80" />}</details>
  </section>;
}
