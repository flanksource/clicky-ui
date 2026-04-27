import {
  Clicky,
  parseClickyData,
  type ClickyCommandRuntime,
  type ClickyDocument,
  type ClickyNode,
} from "../data/Clicky";
import { cn } from "../lib/utils";
import { parseJsonBody } from "./classify";
import type { ExecutionResponse } from "./types";

export type ExecutionResultProps = {
  response?: ExecutionResponse | null;
  emptyMessage?: string;
  ariaLabel?: string;
  className?: string;
  commandRuntime?: ClickyCommandRuntime;
};

export function ExecutionResult({
  response,
  emptyMessage = "No response yet.",
  ariaLabel = "Response body",
  className,
  commandRuntime,
}: ExecutionResultProps) {
  if (!response) {
    return <p className={cn("mt-3 text-sm text-muted-foreground", className)}>{emptyMessage}</p>;
  }

  const rawText = response.stdout || response.output || response.message || "";
  const parsedPayload = response.parsed ?? parseJsonBody(response);
  const clickyPayload: string | ClickyNode | ClickyDocument | undefined =
    typeof parsedPayload === "string" ||
    (parsedPayload != null && typeof parsedPayload === "object")
      ? (parsedPayload as ClickyNode | ClickyDocument)
      : rawText;
  const parsedClicky = clickyPayload === "" ? null : parseClickyData(clickyPayload);

  if (parsedClicky?.ok) {
    return (
      <div role="region" aria-label={ariaLabel} className={cn("mt-3", className)}>
        <Clicky
          data={parsedClicky.document}
          {...(response.requestUrl ? { url: response.requestUrl } : {})}
          {...(commandRuntime ? { commandRuntime } : {})}
        />
      </div>
    );
  }

  const renderedText = parsedPayload != null ? JSON.stringify(parsedPayload, null, 2) : rawText;

  if (!renderedText) {
    return (
      <p className={cn("mt-3 text-sm text-muted-foreground", className)}>
        Response completed with no body.
      </p>
    );
  }

  return (
    <pre
      aria-label={ariaLabel}
      className={cn("mt-3 overflow-auto rounded-md bg-muted p-4 text-xs", className)}
    >
      {renderedText}
    </pre>
  );
}
