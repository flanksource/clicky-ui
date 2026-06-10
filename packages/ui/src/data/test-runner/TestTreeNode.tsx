import { Icon } from "../Icon";
import { Badge } from "../Badge";
import { IconButton } from "../../components/IconButton";
import { UiRefresh, UiStop } from "../../icons";
import { cn } from "../../lib/utils";
import type { Test } from "./types";
import { useTestRunner } from "./context";
import {
  formatTestDuration,
  humanizeName,
  statusIconFor,
  sum,
  testStatus,
  totalDuration,
} from "./status";
import { frameworkIcon } from "./frameworkIcon";

const NAME_TONE: Record<string, string> = {
  failed: "text-red-600 dark:text-red-400",
  timedout: "text-amber-600 dark:text-amber-400",
  warned: "text-amber-600 dark:text-amber-400",
  running: "text-blue-600 dark:text-blue-400",
  skipped: "text-yellow-700 dark:text-yellow-500",
  pending: "text-muted-foreground",
  passed: "text-foreground",
};

/** Per-status roll-up count badges shown on a container row. */
function CountBadges({ node }: { node: Test }) {
  const s = sum(node);
  if (s.total === 0) return null;
  return (
    <span className="flex shrink-0 items-center gap-1">
      {s.passed > 0 && <Badge tone="success" variant="solid" size="xxs" count={s.passed} />}
      {s.failed > 0 && <Badge tone="danger" variant="solid" size="xxs" count={s.failed} />}
      {s.timedout > 0 && <Badge tone="warning" variant="solid" size="xxs" count={s.timedout} />}
      {s.skipped > 0 && <Badge tone="warning" variant="soft" size="xxs" count={s.skipped} />}
      {s.running > 0 && <Badge tone="info" variant="solid" size="xxs" count={s.running} />}
      {s.pending > 0 && <Badge tone="neutral" variant="soft" size="xxs" count={s.pending} />}
    </span>
  );
}

/**
 * Renders one test tree row: status icon, optional adapter decoration + framework
 * icon, status-colored name, duration, per-status count badges, and (when the
 * runner exposes the handlers) rerun/stop buttons. Designed as the `renderRow`
 * for the clicky `Tree`.
 */
export function TestTreeNode({ node, selected }: { node: Test; selected: boolean }) {
  const runner = useTestRunner();
  const hasChildren = (node.children?.length ?? 0) > 0;
  const status = testStatus(node);
  const fwIcon = frameworkIcon(node.framework);
  const fwAdapter = runner.adapters.resolveFrameworkIcon(node, runner);
  const fwNode = fwAdapter?.renderFrameworkIcon?.({ node, runner });
  const leadingAdapter = runner.adapters.resolveRowLeading(node, runner);
  const dur = node.duration || (hasChildren ? totalDuration(node) : 0);
  const canRerun = !!runner.onRerun && node.framework !== "task";
  const canStop = !!runner.onStop && !!node.can_stop && !!node.task_id;

  return (
    <>
      <Icon icon={statusIconFor(node)} className={cn("shrink-0", node.running && "animate-spin")} />

      {fwNode != null ? (
        <span className="flex shrink-0 items-center text-sm opacity-60">{fwNode}</span>
      ) : (
        fwIcon && <Icon icon={fwIcon} className="shrink-0 text-sm opacity-60" />
      )}

      {leadingAdapter?.renderRowLeading?.({ node, runner })}

      <span
        className={cn(
          "truncate",
          selected ? "font-semibold" : "font-medium",
          (status && NAME_TONE[status]) || "text-foreground",
        )}
      >
        {humanizeName(node.name, node.framework)}
      </span>

      <span className="flex-1" />

      {node.progress && node.progress.total > 0 && !node.passed && !node.failed && (
        <span className="flex shrink-0 items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
          {node.progress.phase && <span>{node.progress.phase}</span>}
          <span className="tabular-nums">
            {node.progress.done}/{node.progress.total}
          </span>
        </span>
      )}

      {dur > 0 && (
        <span className="shrink-0 text-xs text-muted-foreground">{formatTestDuration(dur)}</span>
      )}

      {hasChildren && <CountBadges node={node} />}

      {canStop && (
        <IconButton
          icon={UiStop}
          label="Stop"
          disabled={runner.busy.stop}
          onClick={(e) => {
            e.stopPropagation();
            runner.onStop!(node);
          }}
        />
      )}

      {canRerun && (
        <IconButton
          icon={UiRefresh}
          label="Rerun"
          disabled={runner.busy.rerun}
          onClick={(e) => {
            e.stopPropagation();
            runner.onRerun!(node);
          }}
        />
      )}
    </>
  );
}
