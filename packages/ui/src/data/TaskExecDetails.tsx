import { CopyButton } from "../components/CopyButton";
import { shellCommandLine } from "../lib/shell-command";
import { ElapsedDuration } from "./ElapsedDuration";
import { JsonView } from "./JsonView";
import type { TaskExecDetails } from "./TaskSnapshot";

const EXEC_KEYS = new Set([
  "command",
  "args",
  "cwd",
  "pid",
  "status",
  "exitCode",
  "started",
  "finished",
]);

export function TaskCommandLine({
  command,
  args,
  cwd,
}: {
  command: string;
  args?: string[];
  cwd?: string;
}) {
  const line = shellCommandLine({ command, ...(args ? { args } : {}), ...(cwd ? { cwd } : {}) });
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Command
        </div>
        <CopyButton value={line} label="Copy command" />
      </div>
      <code className="block whitespace-pre-wrap break-all rounded border bg-background p-2 text-xs font-mono">
        {line}
      </code>
    </>
  );
}

export function TaskExecDetailsView({ details }: { details: TaskExecDetails }) {
  const extra = Object.fromEntries(Object.entries(details).filter(([key]) => !EXEC_KEYS.has(key)));

  return (
    <section aria-label="Execution details" className="mb-3 space-y-2 rounded-md border bg-muted/20 p-3">
      <TaskCommandLine
        command={details.command}
        {...(details.args ? { args: details.args } : {})}
        {...(details.cwd ? { cwd: details.cwd } : {})}
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{details.status}</span>
        {details.pid !== undefined && <span className="font-mono text-foreground">pid {details.pid}</span>}
        <span className="font-mono text-foreground">exit {details.exitCode}</span>
        <ElapsedDuration startedAt={details.started} finishedAt={details.finished} />
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
