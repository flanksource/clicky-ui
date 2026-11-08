import type { RuntimePolicy, RuntimeProfile } from "../schema.ts";
import { validateVersionRange } from "./versions.ts";

export function validateDependencies(value: unknown, path = "dependencies"): Record<string, string> {
  const dependencies = record(value, path);
  for (const [name, version] of Object.entries(dependencies)) {
    if (!/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(name) || typeof version !== "string") throw new Error(`${path}.${name}: expected package name and version range`);
    validateVersionRange(version);
  }
  return dependencies as Record<string, string>;
}

export function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path}: expected an object`);
  return value as Record<string, unknown>;
}

export function keys(value: Record<string, unknown>, allowed: string[], path: string): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${path}.${key}: unknown key`);
}

function strings(value: unknown, path: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item)) throw new Error(`${path}: expected strings`);
}

function choice(value: unknown, allowed: string[], path: string): void {
  if (typeof value !== "string" || !allowed.includes(value)) throw new Error(`${path}: expected ${allowed.join(" | ")}`);
}

function url(value: unknown, path: string, originOnly = false): void {
  if (typeof value !== "string") throw new Error(`${path}: expected URL`);
  const parsed = new URL(value);
  if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password || (originOnly && parsed.origin !== value)) throw new Error(`${path}: invalid URL ${value}`);
}

export function validateProfile(value: unknown): RuntimeProfile {
  const p = record(value, "profile");
  keys(p, ["runtimeDomain", "embedders", "packageOrigin", "registry", "managed", "dependencies", "policy", "convert", "minReleaseAgeDays", "network", "csp", "links", "sources", "readinessTimeoutMs"], "profile");
  if (typeof p.runtimeDomain !== "string" || !/^[a-z0-9.-]+(?::\d+)?$/i.test(p.runtimeDomain)) throw new Error("profile.runtimeDomain: invalid domain");
  url(p.packageOrigin, "packageOrigin");
  url(p.registry, "registry");
  strings(p.embedders, "embedders");
  p.embedders.forEach((v) => url(v, "embedders", true));
  const managed = record(p.managed, "managed");
  for (const [name, range] of Object.entries(managed)) if (!name || typeof range !== "string" || !range.trim()) throw new Error(`managed.${name}: expected range`);
  if (p.dependencies !== undefined) validateDependencies(p.dependencies, "profile.dependencies");
  validatePolicy(p.policy);
  if (p.convert !== undefined) {
    const convert = record(p.convert, "convert");
    keys(convert, ["origin"], "convert");
    url(convert.origin, "convert.origin", true);
  }
  const network = record(p.network, "network");
  keys(network, ["allow"], "network");
  strings(network.allow, "network.allow");
  network.allow.forEach((v) => url(v.replaceAll("*", "x"), "network.allow"));
  const csp = record(p.csp, "csp");
  keys(csp, ["add", "wasm"], "csp");
  if (csp.wasm !== undefined && typeof csp.wasm !== "boolean") throw new Error("csp.wasm: expected boolean");
  for (const [directive, sources] of Object.entries(record(csp.add, "csp.add"))) {
    if (!/^[a-z]+(?:-[a-z]+)*$/.test(directive)) throw new Error(`csp.add: invalid directive ${directive}`);
    strings(sources, `csp.add.${directive}`);
    if (sources.some((v) => /[;\r\n]/.test(v))) throw new Error(`csp.add.${directive}: invalid source`);
  }
  choice(p.links, ["allow", "deny"], "links");
  strings(p.sources, "sources");
  p.sources.forEach((v) => choice(v, ["host", "opfs", "folder", "url", "hash"], "sources"));
  for (const name of ["minReleaseAgeDays", "readinessTimeoutMs"] as const) {
    const n = p[name];
    if (typeof n !== "number" || !Number.isFinite(n) || n < (name === "readinessTimeoutMs" ? 1 : 0)) throw new Error(`${name}: invalid duration`);
  }
  return p as RuntimeProfile;
}

export function validatePolicy(value: unknown, path = "policy"): RuntimePolicy {
  const policy = record(value, path);
  keys(policy, ["dependencies", "allow"], path);
  choice(policy.dependencies, ["any", "ask", "strict"], `${path}.dependencies`);
  if (policy.allow !== undefined) {
    strings(policy.allow, `${path}.allow`);
    if (policy.dependencies === "any") throw new Error(`${path}.allow contradicts dependencies any`);
  }
  return policy as RuntimePolicy;
}

export function permitsNetwork(profile: RuntimeProfile, target: string): boolean {
  return profile.network.allow.some((pattern) => new RegExp(`^${pattern.split("*").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`).test(target));
}
