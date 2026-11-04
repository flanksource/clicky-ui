import { useEffect, useSyncExternalStore } from "react";
import type { MarkdownPageEntry } from "../registry";
import { repositories, documentJson, workspaceURL } from "./api";
import { documentPath, type DocumentRepository } from "./types";

let catalog: DocumentRepository[] = [];
let catalogError: string | null = null;
let version = 0;
const listeners = new Set<() => void>();
const entries = new Map<string, MarkdownPageEntry>();
function emit() {
  version++;
  for (const listener of listeners) listener();
}
export async function refreshRepositories() {
  try {
    catalog = await repositories();
    catalogError = null;
    emit();
  } catch (cause) {
    catalogError = cause instanceof Error ? cause.message : String(cause);
    emit();
  }
}
export function repositoryById(id: string) {
  return catalog.find((repo) => repo.id === id);
}
export function repositoryFor(id: string) {
  return repositoryById(documentPath(id).repositoryId);
}
export function documentSourcePath(id: string): string {
  const parsed = documentPath(id);
  const repo = repositoryFor(id);
  if (!repo) throw new Error(`Repository ${parsed.repositoryId} is not loaded`);
  return `${repo.root}/${parsed.path}`;
}
export function repositoryPage(id: string): MarkdownPageEntry {
  const existing = entries.get(id);
  if (existing) return existing;
  const parsed = documentPath(id);
  const entry: MarkdownPageEntry = {
    kind: "markdown",
    slug: id,
    title: parsed.path.split("/").at(-1)!,
    group: "Repositories",
    file: parsed.path,
    loadGuidance: async () => ({ blocks: [] }),
    loadSource: async () => {
      const repo = repositoryFor(id);
      if (!repo) throw new Error("Repository not loaded");
      return (
        await documentJson<{ source: string }>(
          workspaceURL("file", repo.root, parsed.path),
        )
      ).source;
    },
  };
  entries.set(id, entry);
  return entry;
}
export function useRepositoryCatalog() {
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => version,
  );
  useEffect(() => {
    void refreshRepositories();
  }, []);
  return {
    repositories: catalog,
    error: catalogError,
    refresh: refreshRepositories,
  };
}
