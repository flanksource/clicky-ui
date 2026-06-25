import type { ReactNode } from "react";
import type { LookupFetcher } from "./json-schema-form-types";
import { FormLookupContext } from "./form-lookup-context";

export function FormLookupProvider({
  fetcher,
  children,
}: {
  fetcher?: LookupFetcher;
  children: ReactNode;
}) {
  return <FormLookupContext.Provider value={fetcher}>{children}</FormLookupContext.Provider>;
}
