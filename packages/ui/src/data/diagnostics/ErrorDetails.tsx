import { type ReactNode } from "react";
import { Icon } from "../Icon";
import {
  compactStackPath,
  isApplicationStackFrame,
  parseDiagnosticsStackTrace,
  parseInlineJsonContextValue,
  type ErrorDiagnostics,
  type ErrorStackFrame,
} from "./error-diagnostics";

export type ErrorDetailsProps = {
  diagnostics: ErrorDiagnostics;
  // Optional renderer for context values that parse as JSON. Defaults to a
  // CopyBadge with the raw string. MC's playbook view passes a richer JsonView
  // here; smaller consumers (plugin iframes) can leave it unset.
  renderJsonContext?: (entry: { label: string; value: string; data: unknown }) => ReactNode;
};

export function ErrorDetails({ diagnostics, renderJsonContext }: ErrorDetailsProps) {
  const scalarContext = diagnostics.context.filter(([, value]) => !parseInlineJsonContextValue(value));
  const jsonContext = diagnostics.context
    .map(([label, value]) => ({ label, value, data: parseInlineJsonContextValue(value) }))
    .filter((entry): entry is { label: string; value: string; data: unknown } => entry.data !== null);
  return (
    <details className="group rounded-md border border-destructive/30 bg-destructive/5">
      <summary className="flex cursor-pointer list-none items-start gap-2 p-3">
        <Icon name="lucide:triangle-alert" className="mt-0.5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-destructive">Error</div>
          <div className="mt-1 whitespace-pre-wrap text-sm text-destructive">{diagnostics.message}</div>
        </div>
        <Icon name="lucide:chevron-right" className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
      </summary>
      <div className="grid gap-3 border-t border-destructive/20 p-3 pt-2">
        {(diagnostics.trace || diagnostics.time) && (
          <div className="flex min-w-0 flex-wrap gap-2">
            {diagnostics.trace && (
              <CopyBadge label="Trace" value={diagnostics.trace} className="max-w-full" />
            )}
            {diagnostics.time && (
              <span className="inline-flex max-w-full items-center overflow-hidden rounded-md border border-border bg-background/80 text-xs">
                <span className="shrink-0 bg-muted px-2 py-1 font-medium text-muted-foreground">Time</span>
                <span className="min-w-0 truncate px-2 py-1 font-mono text-foreground">{diagnostics.time}</span>
              </span>
            )}
          </div>
        )}
        {diagnostics.context.length > 0 && (
          <div className="min-w-0">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Context</div>
            {scalarContext.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {scalarContext.map(([label, value]) => (
                  <CopyBadge key={`${label}:${value}`} label={label} value={value} />
                ))}
              </div>
            )}
            {jsonContext.length > 0 && (
              <div className="mt-2 grid gap-2">
                {jsonContext.map((entry) =>
                  renderJsonContext ? (
                    <span key={`${entry.label}:${entry.value}`}>{renderJsonContext(entry)}</span>
                  ) : (
                    <CopyBadge key={`${entry.label}:${entry.value}`} label={entry.label} value={entry.value} />
                  ),
                )}
              </div>
            )}
          </div>
        )}
        {diagnostics.stacktrace && (
          <div className="min-w-0">
            <div className="mb-1.5 flex min-w-0 items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stack trace</div>
              <button
                type="button"
                onClick={() => copyText(diagnostics.stacktrace ?? "")}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Icon name="lucide:copy" />
                copy
              </button>
            </div>
            <PrettyStackTrace stacktrace={diagnostics.stacktrace} />
          </div>
        )}
      </div>
    </details>
  );
}

export function PrettyStackTrace({ stacktrace }: { stacktrace: string }) {
  const parsed = parseDiagnosticsStackTrace(stacktrace);
  if (parsed.frames.length === 0) {
    return (
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 font-mono text-xs leading-5 text-slate-200">
        {stacktrace}
      </pre>
    );
  }

  return (
    <div className="max-h-96 min-h-40 overflow-auto rounded-md border border-border bg-background p-2">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">error</span>
          <span>{parsed.frames.length} frames</span>
        </div>
      </div>
      {parsed.headline && (
        <div className="mb-2 rounded-md bg-red-50 px-2 py-1.5 font-mono text-[11px] leading-4 text-red-700">
          {parsed.headline}
        </div>
      )}
      <div className="space-y-0.5">
        {parsed.frames.map((frame, index) => (
          <StackFrameRow key={`${frame.file}:${frame.line}:${index}`} frame={frame} index={index} />
        ))}
      </div>
      {parsed.unparsed.length > 0 && (
        <pre className="mt-2 whitespace-pre-wrap rounded bg-muted p-2 font-mono text-[11px] leading-4 text-muted-foreground">
          {parsed.unparsed.join("\n")}
        </pre>
      )}
    </div>
  );
}

function StackFrameRow({ frame, index }: { frame: ErrorStackFrame; index: number }) {
  const appFrame = isApplicationStackFrame(frame.file);
  return (
    <button
      type="button"
      onClick={() => copyText(frame.raw)}
      title="Copy stack frame"
      className={["block w-full rounded px-1.5 py-1 text-left hover:bg-accent/50", appFrame ? "text-foreground" : "text-muted-foreground"].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-1.5">
        <Icon
          name={appFrame ? "codicon:symbol-method" : "codicon:debug-step-over"}
          className="mt-0.5 shrink-0 text-[11px]"
        />
        <div className="min-w-0">
          <div className="break-all font-mono text-[11px] font-semibold leading-4">
            <span className="mr-2 text-[10px] font-normal opacity-60">#{index + 1}</span>
            {frame.functionName || "unknown function"}
            <span className="ml-2 text-[10px] font-normal opacity-80">
              {compactStackPath(frame.file)}:{frame.line}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function CopyBadge({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => copyText(value)}
      title={`Copy ${label}`}
      className={["inline-flex max-w-full items-center overflow-hidden rounded-md border border-border bg-background/80 text-left text-xs hover:border-primary/40 hover:bg-background", className].filter(Boolean).join(" ")}
    >
      <span className="shrink-0 bg-muted px-2 py-1 font-medium text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate px-2 py-1 font-mono text-foreground">{value}</span>
      <Icon name="lucide:copy" className="mr-1.5 h-3 w-3 shrink-0 text-muted-foreground" />
    </button>
  );
}

function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(value);
  }
}
