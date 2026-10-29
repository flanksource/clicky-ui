import { Icon } from "../Icon";
import { Badge } from "../Badge";
import { cn } from "../../lib/utils";
import { UiClock, UiFileCode, UiFolder, UiTag, UiWrench } from "../../icons";
import { LintSeverityIcon, OutcomeIcon, ToolIcon } from "../test-runner/MarkIcons";
import { toolMark } from "../test-runner/marks";
import { formatTestDuration } from "../test-runner/status";
import { linterToolName, lintNodeCount, lintNodeSeverity } from "./stats";
import type { LintNode, LintSeverity } from "./types";

const COUNT_TONE = { error: "danger", warning: "warning", info: "info" } as const satisfies Record<
  LintSeverity,
  "danger" | "warning" | "info"
>;

/** The error of a linter that failed to run: its error leaf's text. */
function failedToRunMessage(node: LintNode): string | undefined {
  if (node.kind !== "linter") return undefined;
  return node.children?.find((c) => c.kind === "linter-error")?.message;
}

function NodeIcon({ node }: { node: LintNode }) {
  switch (node.kind) {
    case "linter":
      if (node.linter?.status === "running") return <OutcomeIcon outcome="running" />;
      if (node.linter?.status === "pending") {
        return <Icon icon={UiClock} title="Pending" className="shrink-0 text-muted-foreground" />;
      }
      if (failedToRunMessage(node) !== undefined) return <LintSeverityIcon severity="error" />;
      return toolMark(linterToolName(node)) ? (
        <ToolIcon tool={linterToolName(node)} />
      ) : (
        <Icon icon={UiWrench} className="shrink-0 text-muted-foreground" />
      );
    case "lint-folder":
      return <Icon icon={UiFolder} className="shrink-0 text-muted-foreground" />;
    case "lint-file":
      return <Icon icon={UiFileCode} className="shrink-0 text-muted-foreground" />;
    case "lint-rule":
    case "lint-rule-group":
      return <Icon icon={UiTag} className="shrink-0 text-muted-foreground" />;
    case "linter-error":
      return <LintSeverityIcon severity="error" />;
  }
}

/** One lint tree row: kind glyph, name, trailing note, and a violation count coloured by worst severity. */
export function LintTreeNode({ node, selected }: { node: LintNode; selected: boolean }) {
  const count = node.kind === "linter-error" ? 0 : lintNodeCount(node);
  const failedMessage = failedToRunMessage(node);
  const failedToRun = failedMessage !== undefined;
  const note = node.skipped ? node.message : failedToRun ? "failed to run" : undefined;
  const noteTitle = failedToRun ? failedMessage : note;
  const duration = node.kind === "linter" && !node.linter?.status && node.linter?.duration ? formatTestDuration(node.linter.duration) : "";
  return (
    <>
      <NodeIcon node={node} />
      <span
        className={cn(
          "min-w-0 truncate",
          selected ? "font-semibold" : "font-medium",
          node.kind === "linter-error" || failedToRun ? "text-red-600 dark:text-red-400" : "text-foreground",
          (node.skipped || (node.kind === "linter" && node.linter?.status === "pending")) && "text-muted-foreground",
        )}
        title={node.name}
      >
        {node.name}
      </span>
      <span className="flex-1" />
      {note && (
        <span
          className={cn(
            "min-w-0 shrink-[100] truncate text-xs",
            failedToRun ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
          )}
          title={noteTitle}
        >
          {note}
        </span>
      )}
      {duration && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{duration}</span>}
      {count > 0 && (
        <span className="flex shrink-0" title={`${count} violation${count === 1 ? "" : "s"}`}>
          <Badge tone={COUNT_TONE[lintNodeSeverity(node)]} variant="solid" size="xxs" count={count} />
        </span>
      )}
    </>
  );
}
