import type { HostMessage, JsonValue, OpenMessage } from "../schema.ts";

/**
 * The host message that takes a live form page from `before` to `after`: `sources` with only the changed files (and
 * the current data, which a source replacement remounts with) when only files differ, `open` when the manifest, the
 * source provider or the policy differ because a worker session cannot swap those, and null when nothing changed.
 */
export function formSourceUpdate(options: { before: OpenMessage; after: OpenMessage; data: JsonValue }): Extract<HostMessage, { type: "sources" | "open" }> | null {
  const { before, after, data } = options;
  if (after.page !== before.page) throw new Error(`formSourceUpdate: page changed from ${before.page} to ${after.page}; remount the form instead`);
  const same = (field: "manifest" | "sourceProvider" | "policy") => JSON.stringify(before[field]) === JSON.stringify(after[field]);
  if (!same("manifest") || !same("sourceProvider") || !same("policy")) return { type: "open", ...after };
  const files: Record<string, string | null> = {};
  for (const [path, source] of Object.entries(after.files)) if (before.files[path] !== source) files[path] = source;
  for (const path of Object.keys(before.files)) if (!Object.hasOwn(after.files, path)) files[path] = null;
  return Object.keys(files).length ? { type: "sources", files, data } : null;
}
