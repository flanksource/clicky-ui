import { useMemo, type ReactNode } from "react";
import { StackDumpView } from "../diagnostics/StackDumpView";
import { GoProfileView } from "./GoProfileView";
import { stackCheckpoints } from "./stack-checkpoints";
import type { GoProfileRecord, StackRecord } from "./types";

/** Splits records by the `process_tree` key they belong to, in the order the keys first appear. */
function byProcess<T extends { key: string }>(records: T[]): Array<[string, T[]]> {
  const groups = new Map<string, T[]>();
  for (const record of records) groups.set(record.key, [...(groups.get(record.key) ?? []), record]);
  return [...groups];
}

/** One section per process; the key is only named when the records span several processes. */
function ProcessSections<T>({ processes, render }: { processes: Array<readonly [string, T]>; render: (key: string, own: T) => ReactNode }) {
  return (
    <div className="min-h-0 flex-1 space-y-density-3 overflow-auto p-density-2">
      {processes.map(([key, own]) => (
        <div key={key} data-trace-process={key}>
          {processes.length > 1 && <div className="mb-1 font-mono text-xs text-muted-foreground">{key}</div>}
          {render(key, own)}
        </div>
      ))}
    </div>
  );
}

/**
 * The `goprof` records of a trace window: one `GoProfileView` per process key,
 * because a profile view shows the checkpoints of one process.
 */
export function GoProfileTraceView({ rows }: { rows: GoProfileRecord[] }) {
  const processes = useMemo(() => byProcess(rows), [rows]);
  return <ProcessSections processes={processes} render={(key, own) => <GoProfileView records={own} processKey={key} />} />;
}

/**
 * The `stacks` records of a trace window: for each process, one `StackDumpView`
 * per checkpoint, latest first, each labelled with the transport it was taken by.
 */
export function StackTraceView({ rows }: { rows: StackRecord[] }) {
  const processes = useMemo(() => byProcess(rows).map(([key]) => [key, stackCheckpoints(rows, key).reverse()] as const), [rows]);
  return (
    <ProcessSections
      processes={processes}
      render={(_key, checkpoints) => (
        <div className="space-y-density-2">
          {checkpoints.map((checkpoint) => (
            <section key={checkpoint.checkpointId} className="rounded border border-border px-density-2" data-stack-checkpoint={checkpoint.checkpointId}>
              <StackDumpView
                records={checkpoint.records}
                headerActions={<span className="font-mono text-[11px] text-muted-foreground">{checkpoint.transport}</span>}
              />
            </section>
          ))}
        </div>
      )}
    />
  );
}
