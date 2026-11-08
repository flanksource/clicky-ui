import { Icon } from "../Icon";
import { cn } from "../../lib/utils";
import { UiBox, UiClock, UiFileCode, UiFolder, UiGlobe, UiQuestion, UiTag, UiWrench } from "../../icons";
import { LintSeverityIcon, OutcomeIcon, ToolIcon } from "../test-runner/MarkIcons";
import { toolMark } from "../test-runner/marks";
import { formatTestDuration } from "../test-runner/status";
import { linterToolName, lintNodeCount } from "./stats";
import { cachedAge, type LintAction, type LintNode } from "./types";
import { LintRowIgnoreMenu } from "./LintIgnoreMenu";
import type { IgnoreHandler } from "./ignore-menu-items";

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
    case "lint-target":
      return (
        <Icon
          icon={node.targetKind === "entity" ? UiBox : node.targetKind === "url" ? UiGlobe : UiQuestion}
          className="shrink-0 text-muted-foreground"
        />
      );
    case "linter-error":
      return <LintSeverityIcon severity="error" />;
  }
}

/** One lint tree row: kind glyph, name, trailing note, and a violation count coloured by worst severity. */
export function LintTreeNode({
  node,
  selected,
  actions = [],
  onIgnore,
  ignoreBusy = false,
}: {
  node: LintNode;
  selected: boolean;
  /** Ignore actions offered from the row's "⋯" and right-click menus; needs `onIgnore`. */
  actions?: readonly LintAction[];
  onIgnore?: IgnoreHandler | undefined;
  ignoreBusy?: boolean | undefined;
}) {
  const count = node.kind === "linter-error" ? 0 : lintNodeCount(node);
  const failedMessage = failedToRunMessage(node);
  const failedToRun = failedMessage !== undefined;
  const note = node.skipped ? node.message : failedToRun ? "failed to run" : undefined;
  const noteTitle = failedToRun ? failedMessage : note;
  const cached = node.kind === "linter" ? cachedAge(node.linter) : undefined;
  const duration = cached
    ? `cached · ${cached.replace(/ ago$/, "")}`
    : node.kind === "linter" && !node.linter?.status && node.linter?.duration
      ? formatTestDuration(node.linter.duration)
      : "";
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
          <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
        </span>
      )}
      {onIgnore && <LintRowIgnoreMenu actions={actions} onIgnore={onIgnore} busy={ignoreBusy} label={node.name} />}
    </>
  );
}
