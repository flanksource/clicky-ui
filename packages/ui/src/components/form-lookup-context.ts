import { createContext, useContext } from "react";
import type { LookupDescriptor, LookupFetcher } from "./json-schema-form-types";

// FormLookups is what the form provides to its lookup controls: the host's
// LookupFetcher plus the per-url handlers form extensions registered
// (FormExtension.lookups).
export interface FormLookups {
  fetcher?: LookupFetcher;
  handlers: ReadonlyMap<string, LookupFetcher>;
}

// FormLookupContext carries them down to the LookupControl rendered deep inside
// the form, so the form stays decoupled from any specific RPC client.
// FormLookupProvider provides it.
export const FormLookupContext = createContext<FormLookups>({ handlers: new Map() });

// useLookupFetcher resolves the fetcher for one lookup: the extension handler
// registered for the descriptor's `url`, else the host's lookupFetcher. Called
// without a descriptor it returns the host's lookupFetcher.
export function useLookupFetcher(descriptor?: LookupDescriptor): LookupFetcher | undefined {
  const { fetcher, handlers } = useContext(FormLookupContext);
  return (descriptor && handlers.get(descriptor.url)) || fetcher;
}

// readPath resolves a dotted path (e.g. "provider.type") against the form's root
// value, returning the string at that path or "" when absent/non-scalar.
function readPath(root: Record<string, unknown> | undefined, path: string): string {
  if (!root || !path) return "";
  let cur: unknown = root;
  for (const segment of path.split(".")) {
    if (cur == null || typeof cur !== "object") return "";
    cur = (cur as Record<string, unknown>)[segment];
  }
  return typeof cur === "string" || typeof cur === "number" ? String(cur) : "";
}

// resolveLookupScope computes the extra query params a lookup should send based
// on a sibling field's value (LookupScope). Returns an empty object when the
// descriptor has no scope or the source field is unset/unmapped — the lookup then
// returns the full, unscoped option set.
export function resolveLookupScope(
  descriptor: LookupDescriptor,
  rootValue: Record<string, unknown> | undefined,
): Record<string, string> {
  const scope = descriptor.scope;
  if (!scope) return {};
  const source = readPath(rootValue, scope.from);
  if (!source) return {};
  const values = scope.map ? (scope.map[source] ?? []) : [source];
  if (values.length === 0) return {};
  return { [scope.param]: values.join(scope.join ?? ",") };
}
