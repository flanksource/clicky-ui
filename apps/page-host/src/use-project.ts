import { useCallback, useEffect, useRef, useState } from "react";
import type { PageLock } from "@flanksource/page-runtime/schema";
import { manifestOf, parseProject, persistableLocks, type Project } from "./project";
import { STARTER } from "./starter";
import { bufferProvider } from "./providers/buffers";
import { hashProvider } from "./providers/hash";
import type { SourceProvider } from "./providers/types";

export function useProject() {
  const [project, setProject] = useState<Project | null>(null);
  const [provider, setProvider] = useState<SourceProvider | null>(null);
  const [savedFiles, setSavedFiles] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const current = useRef({ project, provider, savedFiles });
  current.current = { project, provider, savedFiles };
  const writes = useRef<Promise<void>>(Promise.resolve());
  const dirty = project !== null && JSON.stringify(project.files) !== savedFiles;
  const fail = useCallback((failure: unknown) => setError(failure instanceof Error ? failure.message : String(failure)), []);

  const load = useCallback(async (source: SourceProvider) => {
    const loaded = await source.read();
    const next = loaded ?? structuredClone(STARTER);
    if (!loaded) await source.save(next);
    setProject(next); setProvider(source); setSavedFiles(JSON.stringify(next.files)); setRevision((value) => value + 1);
    setError("");
  }, []);

  useEffect(() => {
    void load(new URLSearchParams(location.hash.slice(1)).has("page") ? hashProvider() : bufferProvider()).catch(fail);
  }, [load, fail]);
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty]);

  async function run(action: () => Promise<void>) {
    setBusy(true); setError("");
    try { await action(); } catch (failure) { fail(failure); } finally { setBusy(false); }
  }

  function updateProject(project: Project) {
    current.current = { ...current.current, project };
    setProject(project);
  }

  function edit(options: { path: string; source: string }) {
    const previous = current.current.project;
    if (!previous) throw new Error("project is not open");
    updateProject({ ...previous, files: { ...previous.files, [options.path]: options.source }, ...(options.path === "package.json" ? { locks: {} } : {}) });
  }

  function replace(next: Project) {
    parseProject(next); updateProject(next);
  }

  function recordLock(lock: PageLock) {
    const snapshot = current.current;
    if (!snapshot.project || !snapshot.provider) throw new Error("received lock without an open project");
    const next = { ...snapshot.project, locks: { ...snapshot.project.locks, [lock.page]: lock } };
    updateProject(next);
    const locks = persistableLocks({ project: next, savedFiles: JSON.parse(snapshot.savedFiles) as Record<string, string> });
    if (!locks) return;
    writes.current = writes.current.then(() => snapshot.provider!.saveLocks(locks));
    void writes.current.catch(fail);
  }

  async function save() {
    if (!project || !provider) throw new Error("project is not open");
    parseProject(project); manifestOf(project.files);
    await writes.current;
    await provider.save(project);
    setSavedFiles(JSON.stringify(project.files));
  }

  async function open(source: () => Promise<SourceProvider>) {
    if (dirty) throw new Error("Save the current source buffers or create a share URL before opening another project");
    await writes.current;
    await load(await source());
  }

  async function share() {
    if (!project) throw new Error("project is not open");
    await writes.current;
    const source = hashProvider();
    await source.save(project);
    setProvider(source); setSavedFiles(JSON.stringify(project.files));
  }

  return { project, provider, busy, dirty, error, fail, run, save, open, share, edit, replace, recordLock, revision };
}
