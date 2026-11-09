import type { HostMessage, PageLock } from "@flanksource/page-runtime/schema";
import { manifestOf, type Project } from "./project";

export function previewUpdate({ project, previous, reopen, sessionLock }: { project: Project; previous: Record<string, string>; reopen: boolean; sessionLock?: PageLock }): HostMessage | null {
  const files: Record<string, string | null> = {};
  for (const [path, source] of Object.entries(project.files)) if (previous[path] !== source) files[path] = source;
  for (const path of Object.keys(previous)) if (project.files[path] === undefined) files[path] = null;
  if (!Object.keys(files).length) return null;
  if (reopen || Object.hasOwn(files, "package.json")) {
    const lock = Object.hasOwn(files, "package.json") ? undefined : sessionLock ?? project.locks[project.entry];
    return { type: "open", page: project.entry, manifest: manifestOf(project.files), files: project.files, ...(lock ? { lock } : {}) };
  }
  return { type: "sources", files };
}
