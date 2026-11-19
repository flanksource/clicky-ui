import { useMemo } from "react";
import { Icon } from "../Icon";
import { cn } from "../../lib/utils";
import { UiChevronRight, UiFileText } from "../../icons";
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

export type LintListProps = HostActionProps & {
  results: readonly LinterResult[];
  filters: LintFilters;
  className?: string;
};

/**
 * The violations the filters keep, rendered like `gavel lint` on a terminal:
 * each linter with its count, its files beneath, and one `:line:col message (rule)`
 * line per violation. Clicking a violation opens its detail beneath it.
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
          <ul className="ml-2 border-l border-border pl-3">
            {group.files.map(({ file, violations }) => (
              <li key={file} className="mt-0.5" data-lint-list-file={file}>
                {file !== NO_FILE && (
                  <div className="flex min-w-0 items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Icon icon={UiFileText} className="shrink-0" />
                    <span className="truncate" title={file}>{file}</span>
                  </div>
                )}
                <ul className={cn(file !== NO_FILE && "ml-4")}>
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
                            className="flex min-w-0 flex-1 items-start gap-1.5 py-0.5 text-left"
                          >
                            <Icon
                              icon={UiChevronRight}
                              className={cn("mt-0.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
                            />
                            <LintSeverityIcon severity={severityOf(flat.v)} className="mt-0.5 shrink-0" />
                            <span className="min-w-0 break-words">
                              <span className="text-muted-foreground">{position(flat)}</span>{" "}
                              <span className="text-foreground">{flat.v.message ?? ""}</span>
                              {flat.v.rule?.method && <span className="text-muted-foreground"> ({flat.v.rule.method})</span>}
                            </span>
                          </button>
                          <div className="-my-1 opacity-0 focus-within:opacity-100 group-hover:opacity-100">
                            <ProblemActions
                              items={violationMenuItems({ violation: flat.v, linter: flat.linter, file: flat.rawFile ?? "", workDir: flat.workDir ?? "", ...host })}
                            />
                          </div>
                        </div>
                        {open && (
                          <div className="mb-1 ml-5 font-sans">
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
