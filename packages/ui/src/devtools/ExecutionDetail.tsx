import { useEffect, useState } from "react";
import { CodeBlock } from "../data/CodeBlock";
import { JsonView } from "../data/JsonView";
import type { QueryBrowserDiagnostics } from "../data/query-browser/QueryBrowser.types";
import { DebugClient, DetailEvictedError } from "./debugClient";
import type { ExecutionDetail as ExecutionDetailPayload, ExecutionSummary } from "./types";

/**
 * The pane behind one row: what the execution actually sent, what came back,
 * and the lines it wrote on the way.
 *
 * Everything here is fetched by record id — it is the run that already
 * happened, not a re-run of it. That is the whole point of the console: the old
 * "Debug" dialog answered "what does this URL run" by running it a second time,
 * so what you inspected was never the execution that misbehaved.
 */

export type ExecutionDetailProps = {
  record: ExecutionSummary;
  client?: DebugClient | undefined;
  /** Pre-loaded detail, for a story or a test that has no server. */
  detail?: ExecutionDetailPayload | undefined;
};

export function ExecutionDetail({ record, client, detail: provided }: ExecutionDetailProps) {
  const { detail, error, loading } = useExecutionDetail(record.id, client, provided);

  if (provided === undefined && loading) {
    return <div className="p-density-4 text-muted-foreground text-sm">Loading capture…</div>;
  }
  if (error) {
    return (
      <div className="p-density-4 text-sm">
        <p className="text-destructive">{error}</p>
        <RerunHint record={record} />
      </div>
    );
  }
  if (!detail) return null;

  const operations = detail.operations ?? [];
  return (
    <div className="flex flex-col gap-density-4 p-density-4">
      {record.error ? (
        <section>
          <SectionLabel>Error</SectionLabel>
          <p className="whitespace-pre-wrap font-mono text-destructive text-xs">{record.error}</p>
        </section>
      ) : null}

      {operations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          This request reached no provider — nothing ran that could be explained.
        </p>
      ) : (
        operations.map((diagnostics, index) => (
          <OperationDetail
            key={`${diagnostics.provider}-${index}`}
            index={index + 1}
            total={operations.length}
            diagnostics={diagnostics}
          />
        ))
      )}

      {detail.logs && detail.logs.length > 0 ? (
        <section>
          <SectionLabel>Log lines ({detail.logs.length})</SectionLabel>
          <div className="max-h-64 overflow-auto rounded border border-border bg-muted/30 p-density-2 font-mono text-xs">
            {detail.logs.map((line) => (
              <div key={`${line.source}-${line.sequence}`} className="whitespace-pre-wrap">
                <span className="text-muted-foreground">{line.level}</span> {line.message}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <RerunHint record={record} />
    </div>
  );
}

function OperationDetail({
  index,
  total,
  diagnostics,
}: {
  index: number;
  total: number;
  diagnostics: QueryBrowserDiagnostics;
}) {
  const request = diagnostics.request ?? {};
  const response = diagnostics.response ?? {};
  return (
    <section className="flex flex-col gap-density-3">
      <SectionLabel>
        {total > 1 ? `Operation ${index} of ${total} — ` : ""}
        {diagnostics.provider}
        {request.connection ? ` · ${request.connection}` : ""}
      </SectionLabel>

      {request.query ? <CodeBlock source={request.query} language="sql" /> : null}
      {/* Shown only when it differs: for most providers the two are equal, and a
          second identical block reads as a second query. */}
      {request.rendered && request.rendered !== request.query ? (
        <div>
          <SectionLabel>Rendered from the profile</SectionLabel>
          <CodeBlock source={request.rendered} language="sql" />
        </div>
      ) : null}

      {request.arguments && request.arguments.length > 0 ? (
        <div>
          <SectionLabel>Bound arguments</SectionLabel>
          <JsonView data={request.arguments} />
        </div>
      ) : null}

      {request.method || request.url ? (
        <p className="font-mono text-xs">
          {request.method} {request.url}
          {typeof response.status === "number" ? ` → ${response.status}` : ""}
        </p>
      ) : null}

      {request.options && Object.keys(request.options).length > 0 ? (
        <div>
          <SectionLabel>Options</SectionLabel>
          <JsonView data={request.options} />
        </div>
      ) : null}

      {response.preview ? (
        <div>
          <SectionLabel>
            Response preview
            {response.truncated ? " (truncated)" : ""}
          </SectionLabel>
          <CodeBlock source={response.preview} language="json" />
        </div>
      ) : null}

      {diagnostics.error ? (
        <p className="whitespace-pre-wrap font-mono text-destructive text-xs">{diagnostics.error}</p>
      ) : null}
    </section>
  );
}

/**
 * A run captured below the level needed for what you are looking for cannot be
 * enriched retroactively — the bodies were never buffered. Saying so, and
 * naming the level that would have them, is the honest answer.
 */
function RerunHint({ record }: { record: ExecutionSummary }) {
  if (record.level === "trace2" || record.level === "trace3" || record.level === "trace4") return null;
  return (
    <p className="text-muted-foreground text-xs">
      Captured at <span className="font-mono">{record.level}</span>. Response bodies are only
      buffered at <span className="font-mono">trace2</span> — raise the level and run it again to
      see them.
    </p>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-density-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
      {children}
    </p>
  );
}

function useExecutionDetail(
  id: string,
  client: DebugClient | undefined,
  provided: ExecutionDetailPayload | undefined,
) {
  const [detail, setDetail] = useState<ExecutionDetailPayload | undefined>(provided);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(provided === undefined);

  useEffect(() => {
    if (provided !== undefined) {
      setDetail(provided);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    (client ?? new DebugClient())
      .detail(id)
      .then((payload) => {
        if (!cancelled) setDetail(payload);
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        setError(
          failure instanceof DetailEvictedError
            ? `${failure.message}. The summary above is all that survives.`
            : failure instanceof Error
              ? failure.message
              : String(failure),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, client, provided]);

  return { detail, error, loading };
}
