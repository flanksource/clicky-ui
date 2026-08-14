import type { QueryBrowserDiagnostics } from "./QueryBrowser.types";

function JSONBlock({
  label,
  value,
  ariaLabel,
}: {
  label: string;
  value: unknown;
  ariaLabel?: string;
}) {
  if (value == null) return null;
  if (Array.isArray(value) && value.length === 0) return null;
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return null;
  }
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <pre
        aria-label={ariaLabel ?? label}
        className="max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-2 text-xs"
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function QueryBrowserDiagnosticsPanel({
  diagnostics,
}: {
  diagnostics: QueryBrowserDiagnostics;
}) {
  const { request, response } = diagnostics;
  // Where the request went is not in the profile and not in the query: the
  // connection names a host and the provider builds the path, so this line is
  // the only place a reader can see the call they would have to reproduce.
  const endpoint = [request.method, request.url ?? request.connection]
    .filter(Boolean)
    .join(" ");
  return (
    <details open className="shrink-0 rounded-md border bg-background">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
        Provider debug
        <span className="ml-2 font-normal text-muted-foreground">
          {diagnostics.provider}
        </span>
      </summary>
      <div className="grid gap-3 border-t p-3 lg:grid-cols-2">
        <section className="min-w-0 space-y-2" aria-label="Provider request">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Request
          </h3>
          {endpoint && (
            <pre
              aria-label="Provider endpoint"
              className="overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-2 text-xs"
            >
              {endpoint}
            </pre>
          )}
          <pre
            aria-label="Provider query"
            className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-2 text-xs"
          >
            {request.query || "(no query text)"}
          </pre>
          <JSONBlock label="Arguments" value={request.arguments} />
          <JSONBlock label="Options" value={request.options} />
          <JSONBlock label="Details" value={request.details} />
          <JSONBlock
            label="Headers"
            value={request.headers}
            ariaLabel="Provider request headers"
          />
        </section>
        <section className="min-w-0 space-y-2" aria-label="Provider response">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Response
          </h3>
          {diagnostics.error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
              {diagnostics.error}
            </div>
          )}
          <JSONBlock
            label="Summary"
            value={responseSummary(response)}
            ariaLabel="Response summary"
          />
          <JSONBlock
            label="Headers"
            value={response?.headers}
            ariaLabel="Provider response headers"
          />
          {response?.preview && (
            <pre
              aria-label="Provider response preview"
              className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-2 text-xs"
            >
              {response.preview}
            </pre>
          )}
        </section>
      </div>
    </details>
  );
}

// responseSummary drops what the panel renders as itself: the body preview,
// which is the response and not a fact about it, and the headers, which read as
// a list rather than as a field of a summary.
function responseSummary(response: QueryBrowserDiagnostics["response"]) {
  if (!response) return undefined;
  const { preview: _preview, headers: _headers, ...summary } = response;
  return summary;
}
