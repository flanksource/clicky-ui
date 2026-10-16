import { Icon } from "../Icon";
import { Badge } from "../Badge";
import { cn } from "../../lib/utils";
import { UiFileCode, UiFolder, UiTag, UiWrench } from "../../icons";
import { LintSeverityIcon, ToolIcon } from "../test-runner/MarkIcons";
import { toolMark } from "../test-runner/marks";
import { lintNodeCount, lintNodeSeverity } from "./stats";
import type { LintNode, LintSeverity } from "./types";

const COUNT_TONE = { error: "danger", warning: "warning", info: "info" } as const satisfies Record<
  LintSeverity,
  "danger" | "warning" | "info"
>;

function NodeIcon({ node }: { node: LintNode }) {
  switch (node.kind) {
    case "linter":
      return toolMark(node.linterName) ? (
        <ToolIcon tool={node.linterName} />
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
  const failedToRun = node.kind === "linter" && node.children?.some((c) => c.kind === "linter-error");
  const note = node.skipped ? node.message : failedToRun ? "failed to run" : undefined;
  return (
    <>
      <NodeIcon node={node} />
      <span
        className={cn(
          "min-w-0 truncate",
          selected ? "font-semibold" : "font-medium",
          node.kind === "linter-error" ? "text-red-600 dark:text-red-400" : "text-foreground",
          node.skipped && "text-muted-foreground",
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
          title={note}
        >
          {note}
        </span>
      )}
      {count > 0 && (
        <span className="flex shrink-0" title={`${count} violation${count === 1 ? "" : "s"}`}>
          <Badge tone={COUNT_TONE[lintNodeSeverity(node)]} variant="solid" size="xxs" count={count} />
        </span>
      )}
    </>
  );
}
