import { type ReactNode } from "react";
import { JsonPathSampleRowsContext, useJsonPathSample } from "./jsonPathSample";

export function JsonPathProfileProvider({
  profile,
  children
}: {
  profile: unknown;
  children: ReactNode;
}) {
  const rows = useJsonPathSample(profile);
  return (
    <JsonPathSampleRowsContext.Provider value={rows}>
      {children}
    </JsonPathSampleRowsContext.Provider>
  );
}

