/**
 * The DSL a specification compiles to. The server compiles it — the same code
 * path a query runs through — so the preview is the query, not a re-derivation
 * of it that could drift.
 */

import type { EsCompilation } from "./esQueryCompile";

export function EsQueryPreview({
  compilation,
  className
}: {
  compilation: EsCompilation;
  className?: string;
}) {
  const { query, size, from, error, loading } = compilation;
  return (
    <section className={className}>
      <header className="flex items-center gap-2">
        <h3 className="text-xs font-medium text-muted-foreground">Compiled DSL</h3>
        {size === undefined ? null : (
          <span className="text-xs text-muted-foreground">
            size {size}
            {from ? ` · from ${from}` : ""}
          </span>
        )}
        {loading ? (
          <span className="text-xs text-muted-foreground">compiling…</span>
        ) : null}
      </header>
      {error ? (
        <p
          role="alert"
          className="mt-1 whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-2 font-mono text-xs text-destructive"
        >
          {error}
        </p>
      ) : (
        <pre className="mt-1 max-h-64 overflow-auto rounded-md border bg-muted/40 p-2 font-mono text-xs">
          {query}
        </pre>
      )}
    </section>
  );
}
