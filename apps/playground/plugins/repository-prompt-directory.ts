import { dirname, join } from "node:path";
import type { GavelEndpoint } from "./gavel-launch-server";
import { RepositoryDocuments } from "./repository-documents";
import { workspaceJson } from "./repository-folder";
import type { DirectoryEntry } from "../src/documents/types";

export async function repositoryPromptDirectory({
  dir,
  endpoint,
  page,
}: {
  dir: string;
  endpoint: GavelEndpoint;
  page: string;
}): Promise<string> {
  const target = new RepositoryDocuments(dir).document(page);
  const start = page.startsWith("folder:")
    ? target.absolutePath
    : dirname(target.absolutePath);
  let path = start;
  while (true) {
    const children = await workspaceJson<DirectoryEntry[]>({
      endpoint,
      path: `directories?${new URLSearchParams({ path })}`,
    });
    if (
      children.some((entry) => entry.directory && entry.name === ".captain")
    ) {
      const captain = await workspaceJson<DirectoryEntry[]>({
        endpoint,
        path: `directories?${new URLSearchParams({ path: join(path, ".captain") })}`,
      });
      if (captain.some((entry) => entry.directory && entry.name === "prompts"))
        return path;
    }
    if (path === target.repository.root) return start;
    const parent = dirname(path);
    if (
      parent === path ||
      (!parent.startsWith(`${target.repository.root}/`) &&
        parent !== target.repository.root)
    )
      throw new Error("Prompt discovery escaped its repository");
    path = parent;
  }
}
