import { Fragment, useMemo, useState } from "react";
import { Select } from "../../components/select";
import { UiChevronDown, UiChevronRight } from "../../icons";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import {
  aggregateProfile,
  formatProfileValue,
  profileValueTypes,
  stacksThrough,
  type ProfileFunctionRow,
} from "./profile-aggregate";
import { formatProcessTimestamp } from "./process-tree";
import type { GoProfileRecord, ProfileSample, StackFrame } from "./types";

const DEFAULT_TOP_N = 20;
const DRILL_DOWN_STACKS = 5;

type SortKey = "flat" | "cum";

function frameLocation(frame: StackFrame): string {
  return frame.file ? `${frame.file}${frame.line ? `:${frame.line}` : ""}` : "";
}

function Percent({ value, total }: { value: number; total: number }) {
  return <span className="text-muted-foreground">{total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "—"}</span>;
}

function DrillDown({
  samples,
  sampleType,
  unit,
  func,
  total,
}: {
  samples: ProfileSample[];
  sampleType: string;
  unit: string;
  func: string;
  total: number;
}) {
  const stacks = stacksThrough(samples, sampleType, func, DRILL_DOWN_STACKS);
  return (
    <div className="space-y-density-2" data-profile-stacks={func}>
      {stacks.map((stack, index) => (
        <div key={index} className="rounded border border-border bg-muted/30 p-density-2">
          <div className="mb-1 text-[11px] text-muted-foreground">
            {formatProfileValue(stack.value, unit)} <Percent value={stack.value} total={total} />
          </div>
          <ol className="space-y-0.5 font-mono text-[11px] leading-4">
            {stack.frames.map((frame, depth) => (
              <li key={depth} className={cn("break-all", frame.func === func ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {frame.func}
                {frameLocation(frame) && <span className="ml-2 text-[10px] font-normal opacity-80">{frameLocation(frame)}</span>}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export type ProfileTopTableProps = {
  /** Samples of any profile: a value of some type and unit attributed to a stack, innermost frame first. */
  samples: ProfileSample[];
  /** Functions shown before "Show all"; defaults to 20. */
  topN?: number;
  className?: string;
};

/**
 * The heaviest functions of a profile: a table by flat value (the innermost
 * frame) and cumulative value (anywhere in the stack), sortable by either, per
 * sample type, with a drill-down from a function to the stacks that reach it.
 * Not specific to Go: any samples of a value, a unit and a stack fit.
 */
export function ProfileTopTable({ samples, topN = DEFAULT_TOP_N, className }: ProfileTopTableProps) {
  const types = useMemo(() => profileValueTypes(samples), [samples]);
  // pprof's default sample index is its last value type: cpu, inuse_space.
  const [picked, setPicked] = useState<string | null>(null);
  const sampleType = types.find((type) => type.sampleType === picked)?.sampleType ?? types[types.length - 1]?.sampleType;
  const [sortKey, setSortKey] = useState<SortKey>("flat");
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const aggregate = useMemo(() => (sampleType ? aggregateProfile(samples, sampleType) : undefined), [samples, sampleType]);

  if (!sampleType || !aggregate) {
    return <div className="text-sm text-muted-foreground">The profile has no samples</div>;
  }

  const sorted: ProfileFunctionRow[] =
    sortKey === "flat" ? aggregate.functions : [...aggregate.functions].sort((a, b) => b.cum - a.cum || b.flat - a.flat);
  const shown = showAll ? sorted : sorted.slice(0, topN);
  const sortHeader = (key: SortKey, label: string) => (
    <th scope="col" className="px-2 py-1 text-right font-medium" aria-sort={sortKey === key ? "descending" : "none"}>
      <button type="button" className={cn("hover:text-foreground", sortKey === key && "text-foreground")} onClick={() => setSortKey(key)}>
        {label}
      </button>
    </th>
  );

  return (
    <div className={cn("space-y-density-2", className)} data-profile-top="">
      <div className="flex flex-wrap items-center justify-between gap-density-2 text-xs text-muted-foreground">
        <span>
          Total {formatProfileValue(aggregate.total, aggregate.unit)} across {aggregate.functions.length} functions
        </span>
        {types.length > 1 && (
          <div className="min-w-[12rem]">
            <Select
              aria-label="Sample type"
              value={sampleType}
              onChange={(event) => {
                setPicked(event.target.value);
                setOpen(null);
              }}
              options={types.map((type) => ({ value: type.sampleType, label: `${type.sampleType} (${type.unit})` }))}
            />
          </div>
        )}
      </div>
      <table className="w-full table-fixed border-collapse text-xs">
        <thead className="text-muted-foreground">
          <tr className="border-b border-border">
            <th scope="col" className="px-2 py-1 text-left font-medium">
              Function
            </th>
            {sortHeader("flat", "Flat")}
            <th scope="col" className="w-16 px-2 py-1 text-right font-medium">
              Flat %
            </th>
            {sortHeader("cum", "Cum")}
            <th scope="col" className="w-16 px-2 py-1 text-right font-medium">
              Cum %
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((row) => {
            const expanded = open === row.func;
            return (
              <Fragment key={row.func}>
                <tr className="border-b border-border/60 hover:bg-muted/40" data-profile-function={row.func}>
                  <td className="px-2 py-1">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      className="flex w-full items-start gap-1 text-left"
                      onClick={() => setOpen(expanded ? null : row.func)}
                    >
                      <Icon icon={expanded ? UiChevronDown : UiChevronRight} className="mt-0.5 shrink-0 text-[11px]" />
                      <span className="min-w-0">
                        <span className="block break-all font-mono text-[11px] font-semibold">{row.func}</span>
                        {frameLocation(row) && (
                          <span className="block break-all text-[10px] text-muted-foreground">{frameLocation(row)}</span>
                        )}
                      </span>
                    </button>
                  </td>
                  <td className="px-2 py-1 text-right tabular-nums">{formatProfileValue(row.flat, aggregate.unit)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">
                    <Percent value={row.flat} total={aggregate.total} />
                  </td>
                  <td className="px-2 py-1 text-right tabular-nums">{formatProfileValue(row.cum, aggregate.unit)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">
                    <Percent value={row.cum} total={aggregate.total} />
                  </td>
                </tr>
                {expanded && (
                  <tr>
                    <td colSpan={5} className="px-2 py-density-2">
                      <DrillDown
                        samples={samples}
                        sampleType={sampleType}
                        unit={aggregate.unit}
                        func={row.func}
                        total={aggregate.total}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {!showAll && sorted.length > shown.length && (
        <button type="button" className="text-xs text-primary hover:underline" onClick={() => setShowAll(true)}>
          Show all {sorted.length} functions
        </button>
      )}
    </div>
  );
}

export type GoProfileViewProps = {
  /** `goprof` records, possibly of several checkpoints and processes; those of one process are shown. */
  records: GoProfileRecord[];
  /** The `process_tree` key whose profiles to show; required when the records span processes. */
  processKey?: string;
  topN?: number;
  className?: string;
};

type ProfileCheckpoint = { checkpointId: string; takenAt: string; reason: string; source: string; profile: string; records: GoProfileRecord[] };

function profileCheckpoints(records: GoProfileRecord[]): ProfileCheckpoint[] {
  const groups = new Map<string, GoProfileRecord[]>();
  for (const record of records) groups.set(record.checkpointId, [...(groups.get(record.checkpointId) ?? []), record]);
  return [...groups]
    .map(([checkpointId, group]): ProfileCheckpoint => {
      const [first] = group as [GoProfileRecord, ...GoProfileRecord[]];
      return {
        checkpointId,
        takenAt: first.takenAt,
        reason: first.reason,
        source: first.source,
        profile: first.profile,
        records: group,
      };
    })
    .sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt));
}

/**
 * A Go pprof profile as the `goprof` kind stores it: the checkpoint chooser
 * (profile type, source and time; the latest by default) over a top-N table of
 * functions by flat and cumulative value with a frames drill-down. Props-only.
 */
export function GoProfileView({ records, processKey, topN, className }: GoProfileViewProps) {
  const keys = useMemo(() => new Set(records.map((record) => record.key)), [records]);
  if (keys.size > 1 && processKey === undefined) {
    throw new Error(`GoProfileView got records of ${keys.size} processes; pass processKey to choose one`);
  }
  const own = useMemo(
    () => (processKey === undefined ? records : records.filter((record) => record.key === processKey)),
    [records, processKey],
  );
  const checkpoints = useMemo(() => profileCheckpoints(own), [own]);
  const [picked, setPicked] = useState<string | null>(null);
  const selected = checkpoints.find((checkpoint) => checkpoint.checkpointId === picked) ?? checkpoints[checkpoints.length - 1];

  if (!selected) return <div className="text-sm text-muted-foreground">No profile collected yet</div>;

  return (
    <div className={cn("space-y-density-2", className)} data-go-profile={selected.profile}>
      {checkpoints.length > 1 ? (
        <div className="max-w-md">
          <Select
            aria-label="Profile checkpoint"
            value={selected.checkpointId}
            onChange={(event) => setPicked(event.target.value)}
            options={[...checkpoints].reverse().map((checkpoint) => ({
              value: checkpoint.checkpointId,
              label: [formatProcessTimestamp(checkpoint.takenAt), checkpoint.profile, checkpoint.reason, checkpoint.source]
                .filter(Boolean)
                .join(" · "),
            }))}
          />
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          {[selected.profile, formatProcessTimestamp(selected.takenAt), selected.reason, selected.source].filter(Boolean).join(" · ")}
        </div>
      )}
      <ProfileTopTable key={selected.checkpointId} samples={selected.records} {...(topN !== undefined ? { topN } : {})} />
    </div>
  );
}
