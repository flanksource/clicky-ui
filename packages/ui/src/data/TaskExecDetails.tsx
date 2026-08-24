import { JsonView } from "./JsonView";
import type { TaskExecDetails } from "./TaskSnapshot";

const EXEC_KEYS = new Set(["command", "args", "pid", "status", "exitCode", "started", "duration"]);

function formatExecDuration(nanoseconds: number): string {
  const milliseconds = nanoseconds / 1_000_000;
  if (milliseconds < 1000) return `${Number(milliseconds.toFixed(1))}ms`;
  const seconds = milliseconds / 1000;
  if (seconds < 60) return `${Number(seconds.toFixed(1))}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${Number((seconds % 60).toFixed(1))}s`;
}

export function TaskCommandLine({ command, args }: { command: string; args?: string[] }) {
  return (
    <>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Command and arguments
      </div>
      <code className="block overflow-x-auto whitespace-pre rounded border bg-background p-2 text-xs">
        {JSON.stringify([command, ...(args ?? [])])}
      </code>
    </>
  );
}

export function TaskExecDetailsView({ details }: { details: TaskExecDetails }) {
  const extra = Object.fromEntries(Object.entries(details).filter(([key]) => !EXEC_KEYS.has(key)));

  return (
    <section aria-label="Execution details" className="mb-3 space-y-2 rounded-md border bg-muted/20 p-3">
      <TaskCommandLine command={details.command} {...(details.args ? { args: details.args } : {})} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{details.status}</span>
        {details.pid !== undefined && <span className="font-mono text-foreground">pid {details.pid}</span>}
        <span className="font-mono text-foreground">exit {details.exitCode}</span>
        {details.duration !== undefined && <span>{formatExecDuration(details.duration)}</span>}
        {details.started && <span>started {details.started}</span>}
      </div>
      {Object.keys(extra).length > 0 && (
        <div className="rounded border bg-background p-2">
          <JsonView data={extra} defaultOpenDepth={3} />
        </div>
      )}
    </section>
  );
}
