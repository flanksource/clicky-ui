import { useSyncExternalStore } from "react";
import { validateDependencies } from "@flanksource/page-runtime/sw";
import type { DependencyPolicy } from "@flanksource/page-runtime/schema";

/** Profile layers may set the dependency policy; the other scopes only add or pin dependencies. */
export type ProfileScope = "browser-default" | "profile" | "workspace";
export type DependencyScope = "page" | "browser-page" | "browser-workspace" | ProfileScope;
export type ProfileLayer = { dependencies: Record<string, string>; policy?: DependencyPolicy };
export type DependencyDocument = ProfileLayer & { scope: "workspace" | "profile"; file: string; source: string; hash: string; packageNames?: string[] };
export type Approvals = { workspace: string[]; pages: Record<string, string[]> };
/** The browser-stored layers for one page. */
export type BrowserRuntime = { default: ProfileLayer; workspace: Record<string, string>; page: Record<string, string>; approvals: Approvals };

export const BROWSER_PROFILE_KEY = "playground.runtime.profile";
export const BROWSER_WORKSPACE_KEY = "playground.runtime.dependencies";
export const browserPageKey = (slug: string) => `playground.runtime.dependencies.page:${slug}`;
export const APPROVALS_KEY = "playground.runtime.approvals";
const changed = "playground-dependency-defaults";
const POLICIES: DependencyPolicy[] = ["any", "ask", "strict"];

function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be a JSON object`);
  return value as Record<string, unknown>;
}

/** The `{ policy?: { dependencies }, dependencies? }` layer of a profile document; package.json keeps it under `pageRuntime`. */
export function parseProfileLayer(options: { source: string; scope: ProfileScope }): ProfileLayer {
  const document = object(JSON.parse(options.source || "{}"), "Dependency defaults");
  const target = options.scope === "workspace" ? (document.pageRuntime === undefined ? {} : object(document.pageRuntime, "package.json.pageRuntime")) : document;
  const dependencies = validateDependencies(target.dependencies === undefined ? {} : target.dependencies, `${options.scope}.dependencies`);
  if (target.policy === undefined) return { dependencies };
  const policy = object(target.policy, `${options.scope}.policy`);
  for (const key of Object.keys(policy)) if (key !== "dependencies") throw new Error(`${options.scope}.policy.${key}: unknown key`);
  if (!POLICIES.includes(policy.dependencies as DependencyPolicy)) throw new Error(`${options.scope}.policy.dependencies: expected ${POLICIES.join(" | ")}`);
  return { dependencies, policy: policy.dependencies as DependencyPolicy };
}

function profileTarget(document: Record<string, unknown>, scope: ProfileScope): Record<string, unknown> {
  if (scope !== "workspace") return document;
  const target = document.pageRuntime === undefined ? {} : object(document.pageRuntime, "package.json.pageRuntime");
  document.pageRuntime = target;
  return target;
}
const serialize = (document: unknown, scope: DependencyScope) => JSON.stringify(document, null, 2) + (scope === "workspace" || scope === "profile" ? "\n" : "");

/** Adds (`version`) or removes (`null`) one dependency in a JSON document of `scope`. */
export function updateDependencyDocument(options: { source: string; scope: DependencyScope; name: string; version: string | null }): string {
  if (options.version !== null) validateDependencies({ [options.name]: options.version });
  if (options.scope === "page") throw new Error("Page dependencies use the YAML header writer");
  const document = object(JSON.parse(options.source || "{}"), "Dependency defaults");
  const change = (current: unknown) => {
    const dependencies = { ...validateDependencies(current === undefined ? {} : current) };
    if (options.version === null) delete dependencies[options.name]; else dependencies[options.name] = options.version;
    return dependencies;
  };
  if (options.scope === "browser-workspace" || options.scope === "browser-page") return serialize(change(document), options.scope);
  const target = profileTarget(document, options.scope);
  target.dependencies = change(target.dependencies);
  return serialize(document, options.scope);
}

/** Sets (`policy`) or clears (`null`, inherit the layer below) the dependency policy of a profile layer document. */
export function updatePolicyDocument(options: { source: string; scope: ProfileScope; policy: DependencyPolicy | null }): string {
  const document = object(JSON.parse(options.source || "{}"), "Dependency defaults");
  const target = profileTarget(document, options.scope);
  if (options.policy === null) delete target.policy; else target.policy = { dependencies: options.policy };
  parseProfileLayer({ source: JSON.stringify(document), scope: options.scope });
  return serialize(document, options.scope);
}

export function browserStorageKey(scope: "browser-default" | "browser-workspace" | "browser-page", slug: string): string {
  return scope === "browser-default" ? BROWSER_PROFILE_KEY : scope === "browser-workspace" ? BROWSER_WORKSPACE_KEY : browserPageKey(slug);
}
export const readStored = (key: string) => localStorage.getItem(key) ?? "{}";

function readApprovals(source = localStorage.getItem(APPROVALS_KEY) ?? '{"workspace":[],"pages":{}}'): Approvals {
  const value = object(JSON.parse(source), "Dependency approvals");
  const names = (list: unknown, path: string) => { if (!Array.isArray(list) || list.some(item => typeof item !== "string")) throw new Error(`${path} must be a list of package names`); return list as string[]; };
  return { workspace: names(value.workspace, "approvals.workspace"), pages: Object.fromEntries(Object.entries(object(value.pages, "approvals.pages")).map(([slug, list]) => [slug, names(list, `approvals.pages.${slug}`)])) };
}

export function readBrowserRuntime(slug: string): BrowserRuntime {
  return {
    default: parseProfileLayer({ source: readStored(BROWSER_PROFILE_KEY), scope: "browser-default" }),
    workspace: validateDependencies(JSON.parse(readStored(BROWSER_WORKSPACE_KEY)), "browser workspace dependencies"),
    page: validateDependencies(JSON.parse(readStored(browserPageKey(slug))), "browser page dependencies"),
    approvals: readApprovals(),
  };
}

/** Saves a previewed browser document; refuses when storage changed since the preview was made. */
export function saveBrowserDocument(options: { key: string; source: string; expected: string }) {
  if (readStored(options.key) !== options.expected) throw new Error("Browser runtime defaults changed since preview; preview again");
  JSON.parse(options.source);
  localStorage.setItem(options.key, options.source); window.dispatchEvent(new Event(changed));
}

export function approveDependencies(options: { names: string[]; scope: "workspace" | "page"; slug: string }) {
  const approvals = readApprovals();
  if (options.scope === "workspace") approvals.workspace = [...new Set([...approvals.workspace, ...options.names])].sort();
  else approvals.pages[options.slug] = [...new Set([...(approvals.pages[options.slug] ?? []), ...options.names])].sort();
  localStorage.setItem(APPROVALS_KEY, JSON.stringify(approvals)); window.dispatchEvent(new Event(changed));
}

export function revokeApproval(options: { name: string; scope: "workspace" | "page"; slug: string }) {
  const approvals = readApprovals();
  if (options.scope === "workspace") approvals.workspace = approvals.workspace.filter(name => name !== options.name);
  else approvals.pages[options.slug] = (approvals.pages[options.slug] ?? []).filter(name => name !== options.name);
  localStorage.setItem(APPROVALS_KEY, JSON.stringify(approvals)); window.dispatchEvent(new Event(changed));
}

function subscribe(listener: () => void) {
  window.addEventListener(changed, listener); window.addEventListener("storage", listener);
  return () => { window.removeEventListener(changed, listener); window.removeEventListener("storage", listener); };
}
/** A snapshot key that changes whenever any browser layer for `slug` changes; use it as an effect dependency. */
export function useBrowserRuntimeVersion(slug: string): string {
  return useSyncExternalStore(subscribe, () => [BROWSER_PROFILE_KEY, BROWSER_WORKSPACE_KEY, browserPageKey(slug), APPROVALS_KEY].map(key => localStorage.getItem(key) ?? "").join("\u0000"), () => "");
}

export async function dependencyDocument(scope: "workspace" | "profile", update?: { source: string; expectedHash: string }): Promise<DependencyDocument> {
  const response = await fetch(`/__playground/runtime-dependencies?scope=${scope}`, update ? { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) } : { cache: "no-store" });
  const payload = await response.json() as DependencyDocument & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? `Dependency defaults: HTTP ${response.status}`);
  return payload;
}
