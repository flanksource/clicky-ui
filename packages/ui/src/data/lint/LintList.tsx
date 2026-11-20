import { useMemo } from "react";
import { Icon } from "../Icon";
import { cn } from "../../lib/utils";
import { UiChevronRight } from "../../icons";
import { useProblemExpansion } from "../diagnostics/use-problem-expansion";
import { ProblemActions } from "../diagnostics/ProblemActions";
import { LintSeverityIcon, ToolIcon } from "../test-runner/MarkIcons";
import { toolMark } from "../test-runner/marks";
import { ViolationDetail, type HostActionProps } from "./LintDetail";
import { violationMenuItems } from "./violation-menu-items";
import type { FlatViolation } from "./grouping";
import { lintListGroups, NO_FILE } from "./list-grouping";
import { severityOf } from "./stats";
import type { LintFilters, LinterResult } from "./types";

function position(flat: FlatViolation): string {
  const { line, column } = flat.v;
  if (!line) return "";
  return column ? `:${line}:${column}` : `:${line}`;
}

/** A file path with its folders muted, so the filename stands out. */
function FilePath({ file }: { file: string }) {
  const slash = file.lastIndexOf("/") + 1;
  return (
    <>
      {slash > 0 && <span className="text-muted-foreground">{file.slice(0, slash)}</span>}
      <span className="text-blue-600 dark:text-blue-400">{file.slice(slash)}</span>
    </>
  );
}

export type LintListProps = HostActionProps & {
  results: readonly LinterResult[];
  filters: LintFilters;
  className?: string;
};

/**
 * The violations the filters keep, rendered like `gavel lint` on a terminal:
 * each linter with its count, then one `dir/file:line:col (rule)` line per
 * violation (folders muted) with its message beneath. Clicking a violation opens
 * its detail beneath it.
 */
export function LintList({ results, filters, className, ...host }: LintListProps) {
  const allKeys = useMemo(
    () => lintListGroups(results, { severity: new Map(), linter: new Map() }).flatMap((g) => g.files.flatMap((f) => f.violations.map((v) => v.id))),
    [results],
  );
  const [expanded, setExpanded] = useProblemExpansion(allKeys);
  const groups = useMemo(() => lintListGroups(results, filters), [results, filters]);
  const toggle = (id: string) =>
    setExpanded((current) => (current.includes(id) ? current.filter((key) => key !== id) : [...current, id]));

  if (groups.length === 0) {
    return <div className="p-6 text-center text-sm text-muted-foreground">No violations match the current filters</div>;
  }
  return (
    <ul className={cn("space-y-2 p-density-3 font-mono text-xs", className)} data-lint-list="">
      {groups.map((group) => (
        <li key={group.linter} data-lint-list-linter={group.linter}>
          <div className="flex items-center gap-1.5">
            <ToolIcon tool={group.linter} />
            <span className="font-semibold text-foreground">{toolMark(group.linter)?.label ?? group.linter}</span>
            <span className="text-muted-foreground">
              ({group.count} violation{group.count === 1 ? "" : "s"})
            </span>
          </div>
          <ul>
            {group.files.map(({ file, violations }) => (
              <li key={file} className="mt-0.5" data-lint-list-file={file}>
                <ul>
                  {violations.map(({ id, flat }) => {
                    const open = expanded.includes(id);
                    return (
                      <li key={id} data-lint-violation="">
                        <div className="group flex items-start gap-1 rounded hover:bg-accent/50">
                          <button
                            type="button"
                            aria-expanded={open}
                            data-lint-line=""
                            onClick={() => toggle(id)}
                            className="min-w-0 flex-1 py-0.5 text-left"
                          >
                            <span className="flex min-w-0 items-center gap-1.5">
                              <Icon
                                icon={UiChevronRight}
                                className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
                              />
                              <LintSeverityIcon severity={severityOf(flat.v)} className="shrink-0" />
                              <span className="min-w-0 truncate" title={file === NO_FILE ? undefined : `${file}${position(flat)}`} data-lint-location="">
                                {file !== NO_FILE && <FilePath file={file} />}
                                <span className="text-muted-foreground">{position(flat)}</span>
                                {flat.v.rule?.method && <span className="text-muted-foreground"> ({flat.v.rule.method})</span>}
                              </span>
                            </span>
                            <span className="block break-words pl-[18px] text-foreground" data-lint-message="">{flat.v.message ?? ""}</span>
                          </button>
                          <div className="-my-1 opacity-0 focus-within:opacity-100 group-hover:opacity-100">
                            <ProblemActions
                              items={violationMenuItems({ violation: flat.v, linter: flat.linter, file: flat.rawFile ?? "", workDir: flat.workDir ?? "", ...host })}
                            />
                          </div>
                        </div>
                        {open && (
                          <div className="mb-1 ml-[18px] font-sans">
                            <ViolationDetail
                              violation={flat.v}
                              linter={flat.linter}
                              file={flat.rawFile ?? ""}
                              workDir={flat.workDir ?? ""}
                              showMessage={false}
                              {...host}
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
