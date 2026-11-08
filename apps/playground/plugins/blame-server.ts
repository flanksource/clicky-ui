import type { MiddlewareApp } from "./middleware";
import { execFile } from "node:child_process";
import { isAbsolute } from "node:path";
import { promisify } from "node:util";
import type { Plugin } from "vite";

import { sendJson } from "./comments-server";

export const BLAME_ROUTE = "/__playground/blame";

/** Mirrors `BlameRange` from `@flanksource/clicky-ui/file-findings`. */
export type BlameRange = {
  startLine: number;
  lineCount: number;
  commit: { sha: string; author: string; date: string; summary: string };
};

/** A file as `git blame` saw it (the working tree), with who last changed each run of lines. */
export type FileBlame = { path: string; source: string; ranges: BlameRange[] };

const run = promisify(execFile);
const MAX_BUFFER = 64 * 1024 * 1024;
const HEADER = /^([0-9a-f]{40}) \d+ (\d+)(?: (\d+))?$/;

/**
 * Parses `git blame --porcelain`: a group header (`<sha> <orig> <final> <count>`)
 * opens each run of lines, a commit's fields follow only the first time its sha
 * appears, and every line's text comes after a tab. Adjacent runs from one
 * commit are merged.
 */
export function parseBlamePorcelain(output: string): { source: string; ranges: BlameRange[] } {
  const commits = new Map<string, BlameRange["commit"]>();
  const groups: { sha: string; startLine: number; lineCount: number }[] = [];
  const lines: string[] = [];
  let sha: string | null = null;
  for (const record of output.split("\n")) {
    if (record.startsWith("\t")) {
      lines.push(record.slice(1));
      continue;
    }
    const header = HEADER.exec(record);
    if (header) {
      sha = header[1]!;
      if (!commits.has(sha)) commits.set(sha, { sha, author: "", date: "", summary: "" });
      if (header[3]) groups.push({ sha, startLine: Number(header[2]), lineCount: Number(header[3]) });
      continue;
    }
    if (!sha) continue;
    const commit = commits.get(sha)!;
    const space = record.indexOf(" ");
    const key = space < 0 ? record : record.slice(0, space);
    const value = space < 0 ? "" : record.slice(space + 1);
    if (key === "author") commit.author = value;
    else if (key === "author-time") commit.date = new Date(Number(value) * 1000).toISOString();
    else if (key === "summary") commit.summary = value;
  }
  const ranges: BlameRange[] = [];
  for (const group of groups) {
    const last = ranges.at(-1);
    if (last && last.commit.sha === group.sha && last.startLine + last.lineCount === group.startLine) {
      last.lineCount += group.lineCount;
    } else {
      ranges.push({ startLine: group.startLine, lineCount: group.lineCount, commit: commits.get(group.sha)! });
    }
  }
  return { source: lines.join("\n"), ranges };
}

/** A repository-relative path that stays inside the checkout; throws for anything else. */
export function assertRepoPath(path: string | null): string {
  if (!path) throw new BlameRequestError("blame needs ?path=<file relative to the repository root>");
  if (isAbsolute(path) || path.split(/[\\/]/).includes("..")) {
    throw new BlameRequestError(`blame path ${JSON.stringify(path)} must be relative to the repository root, without ".."`);
  }
  return path;
}

export class BlameRequestError extends Error {}

export async function blameFile(cwd: string, path: string): Promise<FileBlame> {
  const { stdout } = await run("git", ["-C", cwd, "blame", "--porcelain", "--", path], { maxBuffer: MAX_BUFFER });
  return { path, ...parseBlamePorcelain(stdout) };
}

/** Serves `git blame` of a workspace file, so a review can show who last changed each line. */
export function registerBlameMiddleware({ middlewares, cwd }: { middlewares: MiddlewareApp; cwd: string }): void {
  middlewares.use(BLAME_ROUTE, (req, res) => {
    if (req.method !== "GET") {
      sendJson(res, 405, { error: `${req.method} is not allowed; GET ${BLAME_ROUTE}?path= blames a file` });
      return;
    }
    let path: string;
    try {
      path = assertRepoPath(new URL(req.url ?? "/", "http://playground.local").searchParams.get("path"));
    } catch (error) {
      sendJson(res, 400, { error: (error as Error).message });
      return;
    }
    blameFile(cwd, path).then(
      (blame) => sendJson(res, 200, blame),
      (error: unknown) => {
        const stderr = (error as { stderr?: string }).stderr?.trim();
        sendJson(res, 422, { error: `git blame ${path}: ${stderr || (error instanceof Error ? error.message : String(error))}` });
      },
    );
  });
}

export function playgroundBlame({ cwd }: { cwd: string }): Plugin {
  return {
    name: "playground-blame",
    configureServer(server) {
      registerBlameMiddleware({ middlewares: server.middlewares, cwd });
    },
    configurePreviewServer(server) {
      registerBlameMiddleware({ middlewares: server.middlewares, cwd });
    },
  };
}
