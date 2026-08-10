import type { QueryBrowserDiagnostics } from "./QueryBrowser.types";

function JSONBlock({ label, value }: { label: string; value: unknown }) {
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
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-2 text-xs">
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
          <pre
            aria-label="Provider query"
            className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-2 text-xs"
          >
            {diagnostics.request.query || "(no query text)"}
          </pre>
          <JSONBlock label="Arguments" value={diagnostics.request.arguments} />
          <JSONBlock label="Options" value={diagnostics.request.options} />
          <JSONBlock label="Details" value={diagnostics.request.details} />
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
          <JSONBlock label="Summary" value={diagnostics.response} />
          {diagnostics.response?.preview && (
            <pre
              aria-label="Provider response preview"
              className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-2 text-xs"
            >
              {diagnostics.response.preview}
            </pre>
          )}
        </section>
      </div>
    </details>
  );
}
