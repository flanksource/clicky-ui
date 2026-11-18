import { useMemo, type ReactNode } from "react";
import type { LookupFetcher } from "./json-schema-form-types";
import { FormLookupContext } from "./form-lookup-context";

const NO_HANDLERS: ReadonlyMap<string, LookupFetcher> = new Map();

// `handlers` are per-url lookup handlers (FormExtension.lookups): a lookup whose
// `x-clicky-lookup.url` is registered goes to its handler, every other one to
// `fetcher`.
export function FormLookupProvider({
  fetcher,
  handlers = NO_HANDLERS,
  children,
}: {
  fetcher?: LookupFetcher;
  handlers?: ReadonlyMap<string, LookupFetcher>;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ ...(fetcher ? { fetcher } : {}), handlers }), [fetcher, handlers]);
  return <FormLookupContext.Provider value={value}>{children}</FormLookupContext.Provider>;
}
