// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

import {
  GAVEL_INSTALL_HINT,
  LINT_ROUTE,
  gavelLintArgs,
  playgroundGavelLint,
  runGavelLint,
  type ExecFile,
} from "./gavel-lint-server";

// A real `gavel lint --format json --linters vale,markdownlint` snapshot,
// trimmed to three violations and with the work dir replaced by /repo.
const SNAPSHOT = readFileSync(join(import.meta.dirname, "testing/gavel-lint-markdown.json"), "utf8");
const PROMPT_FILE = "/repo/apps/playground/prompts/markdown-review.prompt";
const FILE = "apps/playground/src/pages/notes.md";

function execFailure(fields: { code: number | string; stdout?: string; stderr?: string }): Error {
  return Object.assign(new Error(`Command failed: gavel (${fields.code})`), fields);
}

function run(exec: ExecFile, mode: "lint" | "prompt" = "lint") {
  return runGavelLint({ exec, cwd: "/repo", file: FILE, mode, promptFile: PROMPT_FILE });
}

describe("gavelLintArgs", () => {
  it.each([
    ["lint", ["lint", "--format", "json", "--linters", "vale,markdownlint", FILE]],
    ["prompt", ["lint", "prompt", "--format", "json", PROMPT_FILE, FILE]],
  ] as const)("builds the %s argv", (mode, args) => {
    expect(gavelLintArgs({ mode, file: FILE, promptFile: PROMPT_FILE })).toEqual(args);
  });
});

describe("runGavelLint", () => {
  it("runs gavel in the workspace root and returns the snapshot's lint results", async () => {
    const exec = vi.fn<ExecFile>(async () => ({ stdout: SNAPSHOT, stderr: "" }));

    const results = await run(exec);

    expect(exec).toHaveBeenCalledWith("gavel", gavelLintArgs({ mode: "lint", file: FILE, promptFile: PROMPT_FILE }), {
      cwd: "/repo",
      maxBuffer: expect.any(Number),
    });
    expect(results.map((result) => [result.linter, result.violations?.length ?? null])).toEqual([
      ["vale", 0],
      ["markdownlint", 3],
    ]);
    expect(results[1]?.violations?.[0]).toMatchObject({
      file: "apps/playground/README.md",
      line: 3,
      column: 81,
      rule: { method: "MD013/line-length" },
    });
  });

  it("treats exit 1 with a JSON snapshot as findings, not a failure", async () => {
    const exec = vi.fn<ExecFile>(async () => {
      throw execFailure({ code: 1, stdout: SNAPSHOT, stderr: "⚠ markdownlint (3 violations)" });
    });

    await expect(run(exec, "prompt")).resolves.toHaveLength(2);
  });

  it.each([
    ["exit 1 without output", { code: 1, stdout: "", stderr: "unknown flag: --linters" }, /exit 1\): unknown flag/],
    ["any other exit code", { code: 2, stdout: SNAPSHOT, stderr: "panic: boom" }, /exit 2\): panic: boom/],
  ])("fails with a 500 on %s", async (_, failure, message) => {
    const exec = vi.fn<ExecFile>(async () => {
      throw execFailure(failure);
    });

    await expect(run(exec)).rejects.toMatchObject({ statusCode: 500, message: expect.stringMatching(message) });
  });

  it.each([
    ["output that is not JSON", "Running linters…"],
    ["a snapshot without a lint array", JSON.stringify({ tests: [] })],
  ])("fails with a 500 on %s", async (_, stdout) => {
    const exec = vi.fn<ExecFile>(async () => ({ stdout, stderr: "" }));

    await expect(run(exec)).rejects.toMatchObject({ statusCode: 500 });
  });

  it("fails with a 503 and an install hint when gavel is not on PATH", async () => {
    const exec = vi.fn<ExecFile>(async () => {
      throw execFailure({ code: "ENOENT" });
    });

    await expect(run(exec)).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining(GAVEL_INSTALL_HINT),
    });
  });
});

describe("playground gavel lint API", () => {
  let root: string;
  let pagesDir: string;
  let server: Server;
  let baseUrl: string;
  const exec = vi.fn<ExecFile>(async () => ({ stdout: SNAPSHOT, stderr: "" }));

  // The plugin's middleware behind a bare HTTP server: Vite's own dev server
  // cannot start inside this test pool.
  beforeEach(async () => {
    root = mkdtempSync(join(tmpdir(), "playground-gavel-lint-"));
    pagesDir = join(root, "src/pages");
    mkdirSync(join(pagesDir, "docs"), { recursive: true });
    writeFileSync(join(pagesDir, "docs/guide.md"), "# Guide\n");
    writeFileSync(join(pagesDir, "welcome.tsx"), "export default () => null;\n");
    exec.mockClear();
    const routes = new Map<string, (req: IncomingMessage, res: ServerResponse) => void>();
    const plugin = playgroundGavelLint({ pagesDir, workspaceRoot: root, promptFile: PROMPT_FILE, exec });
    (plugin.configureServer as (server: unknown) => void)({
      middlewares: { use: (route: string, handler: (req: IncomingMessage, res: ServerResponse) => void) => routes.set(route, handler) },
      config: { logger: { error: () => undefined } },
    });
    server = createServer((req, res) => {
      const handler = routes.get(req.url ?? "");
      if (!handler) throw new Error(`no middleware for ${req.url}`);
      handler(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("gavel lint test server has no TCP address");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => server?.close(resolve));
    if (root) rmSync(root, { recursive: true, force: true });
  });

  function lint(body: unknown) {
    return fetch(`${baseUrl}${LINT_ROUTE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("lints the file behind the slug, relative to the workspace root", async () => {
    const response = await lint({ slug: "docs/guide", mode: "lint" });

    expect(response.status).toBe(200);
    expect(((await response.json()) as { results: unknown[] }).results).toHaveLength(2);
    expect(exec.mock.calls[0]?.[1].at(-1)).toBe(relative(root, join(pagesDir, "docs/guide.md")));
  });

  it.each([
    ["a missing page", { slug: "docs/missing", mode: "lint" }, 404],
    ["a .tsx page", { slug: "welcome", mode: "lint" }, 400],
    ["an unknown mode", { slug: "docs/guide", mode: "fix" }, 400],
    ["a path instead of a slug", { slug: "../../etc/passwd", mode: "lint" }, 400],
  ])("refuses %s without running gavel", async (_, body, status) => {
    const response = await lint(body);

    expect(response.status).toBe(status);
    expect(exec).not.toHaveBeenCalled();
  });
});
