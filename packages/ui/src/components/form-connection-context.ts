import { createContext, useContext } from "react";

// FormConnectionContext carries the connections service base (`connectionApiBase`
// on JsonSchemaForm) down to the connection picker rendered deep inside the
// form. Like the lookup fetcher, JsonSchemaForm always installs it — with
// `undefined` when the host gave none — so a form never inherits an outer one.
export const FormConnectionContext = createContext<string | undefined>(undefined);

/** The connections service base the surrounding form was given, if any. */
export function useConnectionApiBase(): string | undefined {
  return useContext(FormConnectionContext);
}
