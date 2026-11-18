import { createHash } from "node:crypto";
import type { GavelEndpoint } from "./gavel-launch-server";
import { LaunchHttpError } from "./launch-client";
import { RepositoryDocuments } from "./repository-documents";
import type { DirectoryEntry } from "../src/documents/types";

export async function workspaceJson<T>({
  endpoint,
  path,
  body,
}: {
  endpoint: GavelEndpoint;
  path: string;
  body?: unknown;
}): Promise<T> {
  const response = await fetch(
    new URL(`/api/workspace/${path}`, await endpoint.url()),
    body === undefined
      ? undefined
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const value = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw new LaunchHttpError(
      response.status,
      value.error ?? `Cannot read workspace ${path}`,
    );
  return value;
}

export async function prepareRepositoryFolder({
  dir,
  endpoint,
  page,
}: {
  dir: string;
  endpoint: GavelEndpoint;
  page: string;
}) {
  if (!page.startsWith("folder:"))
    throw new Error("Expected a repository folder");
  const target = new RepositoryDocuments(dir).document(page);
  const folder = target.repository.folders
    .filter(
      (entry) =>
        entry.path === "." ||
        entry.path === target.path ||
        target.path.startsWith(`${entry.path}/`),
    )
    .sort((a, b) => b.path.length - a.path.length)[0];
  if (!folder) throw new Error("Folder has no sidebar root");
  const pending = [target.path];
  const files: string[] = [];
  while (pending.length) {
    const path = pending.shift()!;
    const entries = await workspaceJson<DirectoryEntry[]>({
      endpoint,
      path: "entries",
      body: {
        root: target.repository.root,
        path,
        overrides: folder.overrides,
        overrideDirectory: folder.path,
      },
    });
    for (const entry of entries.filter((entry) => entry.visible)) {
      if (entry.directory) pending.push(entry.path);
      else if (/\.(md|mdx|markdown)$/i.test(entry.path)) files.push(entry.path);
    }
  }
  files.sort();
  if (!files.length)
    throw new Error("This folder has no visible Markdown files to lint");
  const hash = createHash("sha256").update(JSON.stringify(folder));
  for (const path of files) {
    const file = await workspaceJson<{ revision: string }>({
      endpoint,
      path: `file?${new URLSearchParams({ root: target.repository.root, path })}`,
    });
    if (!file.revision) throw new Error(`Missing source revision for ${path}`);
    hash.update(JSON.stringify([path, file.revision]));
  }
  return { ...target, files, revision: hash.digest("hex") };
}
