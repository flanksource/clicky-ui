import { moveItem } from "@flanksource/clicky-ui/utils";
import type { AISpecRuntimeSpec } from "@flanksource/clicky-ui/ai";
import type {
  RuntimePresetSpec,
  RuntimeProfileRecord,
} from "./contract";

const PRESET_SPEC_FIELDS = new Set([
  "model",
  "backend",
  "sandbox",
  "temperature",
  "effort",
  "noCache",
  "fallbacks",
  "budget",
  "memory",
  "permissions",
  "toolPolicy",
  "setup",
]);
const PRESET_FIELDS = new Set(["id", "name", "description", "scope", "spec"]);
const PRESET_SETUP_FIELDS = new Set(["envVars", "connections", "checkout"]);
const PRESET_CHECKOUT_FIELDS = new Set(["mode", "depth", "worktree"]);
const PRESET_WORKTREE_FIELDS = new Set([
  "mode",
  "keep",
  "uncommitted",
  "ignored",
]);
const PRESET_CONNECTION_FIELDS = new Set([
  "fromConfigItem",
  "eksPodIdentity",
  "serviceAccount",
  "aws",
  "azure",
  "gcp",
  "kubernetes",
]);
const PRESET_PROVIDER_CONNECTION_FIELDS = new Set(["connection"]);

export function projectRuntimePresetSpec(
  spec: AISpecRuntimeSpec,
): RuntimePresetSpec {
  const projected = pickAllowed(spec, PRESET_SPEC_FIELDS);
  if (spec.setup) {
    const setup = pickAllowed(spec.setup, PRESET_SETUP_FIELDS);
    if (spec.setup.checkout) {
      const checkout = pickAllowed(spec.setup.checkout, PRESET_CHECKOUT_FIELDS);
      if (spec.setup.checkout.worktree) {
        checkout.worktree = pickAllowed(
          spec.setup.checkout.worktree,
          PRESET_WORKTREE_FIELDS,
        );
      }
      setup.checkout = checkout;
    }
    if (spec.setup.connections) {
      const connections = pickAllowed(
        spec.setup.connections,
        PRESET_CONNECTION_FIELDS,
      );
      for (const provider of ["aws", "azure", "gcp", "kubernetes"] as const) {
        const connection = spec.setup.connections[provider];
        if (connection) {
          connections[provider] = pickAllowed(
            connection,
            PRESET_PROVIDER_CONNECTION_FIELDS,
          );
        }
      }
      setup.connections = connections;
    }
    projected.setup = setup;
  }
  return projected as RuntimePresetSpec;
}

function pickAllowed(value: object, allowed: Set<string>) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => allowed.has(key))
      .map(([key, item]) => [key, structuredClone(item)]),
  );
}

export function assertRuntimePresetSpec(
  spec: RuntimePresetSpec,
  path: string,
): void {
  assertRecord(spec, path);
  assertAllowedKeys(spec, PRESET_SPEC_FIELDS, path);
  if (spec.setup === undefined) return;
  assertRecord(spec.setup, `${path}.setup`);
  assertAllowedKeys(spec.setup, PRESET_SETUP_FIELDS, `${path}.setup`);
  const checkout = spec.setup.checkout;
  if (checkout !== undefined) {
    assertRecord(checkout, `${path}.setup.checkout`);
    assertAllowedKeys(
      checkout,
      PRESET_CHECKOUT_FIELDS,
      `${path}.setup.checkout`,
    );
    if (checkout.worktree !== undefined) {
      assertRecord(checkout.worktree, `${path}.setup.checkout.worktree`);
      assertAllowedKeys(
        checkout.worktree,
        PRESET_WORKTREE_FIELDS,
        `${path}.setup.checkout.worktree`,
      );
    }
  }
  const connections = spec.setup.connections;
  if (connections === undefined) return;
  assertRecord(connections, `${path}.setup.connections`);
  assertAllowedKeys(
    connections,
    PRESET_CONNECTION_FIELDS,
    `${path}.setup.connections`,
  );
  for (const provider of ["aws", "azure", "gcp", "kubernetes"] as const) {
    const connection = connections[provider];
    if (connection === undefined) continue;
    assertRecord(connection, `${path}.setup.connections.${provider}`);
    assertAllowedKeys(
      connection,
      PRESET_PROVIDER_CONNECTION_FIELDS,
      `${path}.setup.connections.${provider}`,
    );
  }
}

export function assertRuntimePresetRecord(value: unknown, path: string): void {
  assertRecord(value, path);
  assertAllowedKeys(value, PRESET_FIELDS, path);
}

function assertRecord(value: unknown, path: string): asserts value is object {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`runtime preset field "${path}" must be an object`);
  }
}

function assertAllowedKeys(
  value: object,
  allowed: Set<string>,
  path: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new Error(`runtime preset field "${path}.${key}" is not allowed`);
    }
  }
}

export function reorderProfilePresets(
  profile: RuntimeProfileRecord,
  from: number,
  to: number,
): RuntimeProfileRecord {
  if (!profile.presets[from] || !profile.presets[to]) {
    throw new Error(`cannot reorder preset from ${from} to ${to}`);
  }
  return { ...profile, presets: moveItem(profile.presets, from, to) };
}

export function referencedBy(
  presetId: string,
  profiles: RuntimeProfileRecord[],
): string[] {
  return profiles
    .filter((profile) => profile.presets.includes(presetId))
    .map((profile) => profile.name);
}

export function duplicateName(name: string, existing: string[]): string {
  const occupied = new Set(existing.map((item) => item.trim().toLowerCase()));
  const base = `${name.trim()} copy`;
  if (!occupied.has(base.toLowerCase())) return base;
  let index = 2;
  while (occupied.has(`${base} ${index}`.toLowerCase())) index += 1;
  return `${base} ${index}`;
}

export function uniqueName(
  name: string,
  id: string,
  records: Array<{ id: string; name: string }>,
) {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return false;
  return !records.some(
    (record) =>
      record.id !== id && record.name.trim().toLowerCase() === normalized,
  );
}
