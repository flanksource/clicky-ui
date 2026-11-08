import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { validateDependencies } from "@flanksource/page-runtime/sw";
import { readJsonBody, sendJson } from "./comments-server";
import { sourceHash } from "./source-hash";
import type { MiddlewareApp } from "./middleware";
import { parseProfileLayer, type DependencyDocument } from "../src/browser-mode/dependency-defaults";

type Options = { root: string; workspaceRoot?: string };
type Scope = DependencyDocument["scope"];

/** Names the workspace installs through its package manager; under `strict` and `ask` they are always allowed. */
function packageNames(source: string): string[] {
  const document = JSON.parse(source || "{}") as Record<string, unknown>;
  return [...new Set(["dependencies", "peerDependencies"].flatMap(field => document[field] === undefined ? [] : Object.keys(validateDependencies(document[field], `package.json.${field}`))))].sort();
}

export function readDependencyDocument(options: Options & { scope: Scope }): DependencyDocument {
  const workspaceRoot = options.workspaceRoot ?? resolve(options.root, "../..");
  const file = options.scope === "workspace" ? resolve(workspaceRoot, "package.json") : resolve(workspaceRoot, ".playground/runtime-profile.json");
  for (const path of [dirname(file), file]) if (existsSync(path) && lstatSync(path).isSymbolicLink()) throw new Error(`Dependency defaults cannot use a symbolic link: ${path}`);
  const source = existsSync(file) ? readFileSync(file, "utf8") : "";
  const layer = parseProfileLayer({ source, scope: options.scope });
  return { scope: options.scope, file, source, hash: sourceHash(source), ...layer, ...(options.scope === "workspace" ? { packageNames: packageNames(source) } : {}) };
}
export function writeDependencyDocument(options: Options & { scope: Scope; source: string; expectedHash: string }): DependencyDocument {
  const opened = readDependencyDocument(options);
  if (opened.hash !== options.expectedHash) throw Object.assign(new Error(`${opened.file} changed since preview; preview again`), { statusCode: 409 });
  parseProfileLayer({ source: options.source, scope: options.scope });
  if (options.scope === "workspace") packageNames(options.source);
  mkdirSync(dirname(opened.file), { recursive: true });
  writeFileSync(opened.file, options.source, "utf8");
  return readDependencyDocument(options);
}
export function readDependencyDefaults(options: Options) {
  const profile = readDependencyDocument({ ...options, scope: "profile" }); const workspace = readDependencyDocument({ ...options, scope: "workspace" });
  return { profile: profile.dependencies, workspace: workspace.dependencies, policies: { ...(profile.policy ? { profile: profile.policy } : {}), ...(workspace.policy ? { workspace: workspace.policy } : {}) }, packageNames: workspace.packageNames ?? [] };
}

export function registerDependencyDefaults({ middlewares, ...options }: Options & { middlewares: MiddlewareApp }) {
  middlewares.use("/__playground/runtime-dependencies", (request, response) => {
    void (async () => {
      const scope = new URL(request.url ?? "/", "http://playground").searchParams.get("scope");
      if (scope !== "workspace" && scope !== "profile") { sendJson(response, 400, { error: "scope must be workspace or profile" }); return; }
      if (request.method === "GET") { sendJson(response, 200, readDependencyDocument({ ...options, scope })); return; }
      if (request.method !== "PUT") { sendJson(response, 405, { error: "GET or PUT required" }); return; }
      const body = await readJsonBody(request) as { source?: unknown; expectedHash?: unknown };
      if (typeof body.source !== "string" || typeof body.expectedHash !== "string") { sendJson(response, 400, { error: "source and expectedHash are required" }); return; }
      sendJson(response, 200, writeDependencyDocument({ ...options, scope, source: body.source, expectedHash: body.expectedHash }));
    })().catch(error => sendJson(response, (error as { statusCode?: number }).statusCode ?? 400, { error: String(error) }));
  });
}
