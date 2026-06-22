import { createContext, useContext, type ReactNode } from "react";
import type { LookupDescriptor, LookupFetcher } from "./json-schema-form-types";

// FormLookupContext carries the host-provided LookupFetcher down to the
// LookupControl rendered deep inside the form, so the form stays decoupled from
// any specific RPC client. JsonSchemaForm provides it when given a lookupFetcher.
const FormLookupContext = createContext<LookupFetcher | undefined>(undefined);

export function FormLookupProvider({
  fetcher,
  children,
}: {
  fetcher?: LookupFetcher;
  children: ReactNode;
}) {
  return <FormLookupContext.Provider value={fetcher}>{children}</FormLookupContext.Provider>;
}

export function useLookupFetcher(): LookupFetcher | undefined {
  return useContext(FormLookupContext);
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
