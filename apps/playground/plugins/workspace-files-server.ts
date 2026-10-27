import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Connect, Plugin } from "vite";

import { sendJson } from "./comments-server";

export const WORKSPACE_FILES_ROUTE = "/__playground/workspace-files";

/** A file in the workspace checkout; `status` is its `git status --porcelain` code when it has changes. */
export type WorkspaceFile = { path: string; status?: string };

const run = promisify(execFile);
const MAX_BUFFER = 64 * 1024 * 1024;

async function git(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await run("git", ["-C", cwd, ...args], { maxBuffer: MAX_BUFFER });
  return stdout;
}

/** Porcelain v1 `-z` records: `XY path\0`, with a rename's original path as an extra record. */
export function parseStatus(output: string): Map<string, string> {
  const records = output.split("\0");
  const changed = new Map<string, string>();
  for (let index = 0; index < records.length; index++) {
    const record = records[index] ?? "";
    if (record.length < 4) continue;
    const code = record.slice(0, 2);
    changed.set(record.slice(3), code.trim());
    if (code.startsWith("R") || code.startsWith("C")) index++;
  }
  return changed;
}

/**
 * The workspace's tracked and untracked (not ignored) files, paths relative to
 * the repository root, changed files first.
 */
export async function listWorkspaceFiles(cwd: string): Promise<WorkspaceFile[]> {
  const [listed, status] = await Promise.all([
    git(cwd, ["ls-files", "-z", "--cached", "--others", "--exclude-standard"]),
    git(cwd, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]),
  ]);
  const changed = parseStatus(status);
  const paths = new Set(listed.split("\0").filter(Boolean));
  for (const path of changed.keys()) paths.add(path);
  return [...paths]
    .map((path) => {
      const code = changed.get(path);
      return code ? { path, status: code } : { path };
    })
    .sort((a, b) => Number(Boolean(b.status)) - Number(Boolean(a.status)) || a.path.localeCompare(b.path));
}

/** Serves the workspace's file list to the prompt dialog's file / git picker. */
export function playgroundWorkspaceFiles({ cwd }: { cwd: string }): Plugin {
  const register = (middlewares: Connect.Server) => {
    middlewares.use(WORKSPACE_FILES_ROUTE, (req, res) => {
      if (req.method !== "GET") {
        sendJson(res, 405, { error: `${req.method} is not allowed; GET lists the workspace files` });
        return;
      }
      listWorkspaceFiles(cwd).then(
        (files) => sendJson(res, 200, { files }),
        (error: unknown) =>
          sendJson(res, 500, { error: `git could not list ${cwd}: ${error instanceof Error ? error.message : String(error)}` }),
      );
    });
  };
  return {
    name: "playground-workspace-files",
    configureServer(server) {
      register(server.middlewares);
    },
    configurePreviewServer(server) {
      register(server.middlewares);
    },
  };
}
