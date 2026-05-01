import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";

export type InlineErrorProps = {
  title: string;
  error: unknown;
  className?: string;
};

type ErrorDetails = {
  method?: string;
  url?: string;
  status?: number;
  responseBody?: string;
};

export function InlineError({ title, error, className }: InlineErrorProps) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const details = getErrorDetails(error);
  const hasDetails = Boolean(details.responseBody || details.status || details.url);

  return (
    <div
      className={cn("rounded-xl border border-dashed border-red-300 p-6 text-sm", className)}
    >
      <div className="text-center">
        <div className="font-medium text-red-600">{title}</div>
        {message && <div className="mt-1 text-muted-foreground">{message}</div>}
      </div>
      {hasDetails && (
        <details className="group mt-3">
          <summary className="flex cursor-pointer items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Icon
              name="codicon:chevron-right"
              className="transition-transform group-open:rotate-90"
            />
            More details
          </summary>
          <div className="mt-2 space-y-2 text-left font-mono text-xs">
            {(details.method || details.url || details.status) && (
              <div className="text-muted-foreground">
                {details.method && <span>{details.method} </span>}
                {details.url}
                {details.status != null && <span> - {details.status}</span>}
              </div>
            )}
            {details.responseBody && (
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 text-xs">
                {details.responseBody}
              </pre>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

function getErrorDetails(error: unknown): ErrorDetails {
  if (error == null || typeof error !== "object") return {};
  const record = error as Record<string, unknown>;
  const details: ErrorDetails = {};
  if (typeof record.method === "string") details.method = record.method;
  if (typeof record.url === "string") details.url = record.url;
  if (typeof record.status === "number") details.status = record.status;
  if (typeof record.responseBody === "string") details.responseBody = record.responseBody;
  return details;
}
