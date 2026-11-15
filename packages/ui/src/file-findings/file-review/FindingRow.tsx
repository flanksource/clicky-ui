import type { DropdownMenuItem } from "../../overlay/DropdownMenu";
import { ProblemActions } from "../../data/diagnostics/ProblemActions";
import { Icon } from "../../data/Icon";
import { cn } from "../../lib/utils";
import { messageAtValue } from "../finding-message";
import type { FileFinding } from "../types";
import { SEVERITY_MARK, severityOf } from "./marks";

/**
 * One finding listed under the line it is on: severity icon, the message as
 * read at that line, then source and rule. `truncate` keeps it to one row, for
 * hosts that reserve a fixed height per finding (an editor view zone).
 */
export function FindingRow({
  finding,
  selected,
  onSelect,
  getFindingActions,
  truncate = false,
}: {
  finding: FileFinding;
  selected: boolean;
  onSelect: (finding: FileFinding) => void;
  getFindingActions?: ((finding: FileFinding) => DropdownMenuItem[]) | undefined;
  truncate?: boolean;
}) {
  const mark = SEVERITY_MARK[severityOf(finding.severity)];
  return (
    <span data-source-finding={finding.line} className={cn("flex items-center gap-2", truncate && "h-5")}>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(finding)}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1.5 text-left font-sans text-[11px] hover:underline aria-pressed:font-semibold aria-pressed:underline",
          mark.tone,
        )}
      >
        <Icon icon={mark.icon} className="shrink-0" />
        <span className={cn("text-foreground", truncate && "min-w-0 truncate")}>{messageAtValue(finding)}</span>
        <span className="shrink-0 text-muted-foreground">{finding.source} {finding.rule}</span>
      </button>
      {getFindingActions && <ProblemActions items={getFindingActions(finding)} />}
    </span>
  );
}
