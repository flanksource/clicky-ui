import type { ReactNode } from "react";
import { ErrorDetails } from "./ErrorDetails";
import { normalizeErrorDiagnostics } from "./error-diagnostics";

/** An operation failure with the caller's identity and the original diagnostics. */
export function ActionError({ error, title = "Error", context = [], actions, className }: {
  error: unknown;
  title?: string;
  context?: Array<[string, string]>;
  actions?: ReactNode;
  className?: string;
}) {
  const diagnostics = normalizeErrorDiagnostics(error) ?? { message: String(error), context: [] };
  return <div role="alert" className={className}>
    <ErrorDetails
      title={title}
      diagnostics={{ ...diagnostics, context: [...context, ...diagnostics.context] }}
      {...(actions ? { actions } : {})}
    />
  </div>;
}
