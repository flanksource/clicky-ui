import { useState, type ReactNode } from "react";
import { Icon } from "../Icon";
import { Button } from "../../components/button";
import { JsonView } from "../JsonView";
import { TabButton } from "../TabButton";
import { cn } from "../../lib/utils";
import { UiClass, UiClock, UiRefresh, UiStop } from "../../icons";
import type { Test } from "./types";
import { useTestRunner } from "./context";
import { formatTestDuration, statusIconFor, statusToneFor, sum } from "./status";
import { frameworkIcon } from "./frameworkIcon";
import { TestAttempts, TestFailureDetail, TestOutput } from "./TestFailureDetail";

const ICON_TONE = {
  danger: "rose",
  warning: "amber",
  success: "emerald",
  info: "sky",
  neutral: "neutral",
} as const;

/** Built-in detail body — used when no adapter contributes `renderDetail`. */
function DefaultDetailBody({ node }: { node: Test }) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const counts = hasChildren ? sum(node) : null;
  return (
    <div className="space-y-4 p-density-4">
      {node.message && !node.failure_detail && (
        <p className="whitespace-pre-wrap break-words text-sm">{node.message}</p>
      )}
      {node.failure_detail && <TestFailureDetail failure={node.failure_detail} />}
      <TestOutput node={node} />
      {node.attempts && node.attempts.length > 0 && <TestAttempts attempts={node.attempts} />}
      {counts && counts.total > 0 && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{counts.total} total</span>
          {counts.passed > 0 && <span>{counts.passed} passed</span>}
          {counts.failed > 0 && <span>{counts.failed} failed</span>}
          {counts.skipped > 0 && <span>{counts.skipped} skipped</span>}
        </div>
      )}
      {node.detail != null && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Detail</div>
          <JsonView data={node.detail} />
        </div>
      )}
    </div>
  );
}

function DetailHeader({ node, actions }: { node: Test; actions?: ReactNode }) {
  const runner = useTestRunner();
  const fwIcon = frameworkIcon(node.framework);
  const canRerun = !!runner.onRerun && node.framework !== "task";
  const canStop = !!runner.onStop && !!node.can_stop && !!node.task_id;
  return (
    <div className="flex items-start gap-2 border-b border-border p-density-4">
      <Icon
        icon={statusIconFor(node)}
        className={cn("mt-0.5 shrink-0 text-2xl", node.running && "animate-spin")}
        tone={ICON_TONE[statusToneFor(node)]}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="break-words text-base font-semibold">{node.name}</h2>
          <div className="flex shrink-0 items-center gap-1">
            {actions}
            {canRerun && (
              <Button
                size="sm"
                disabled={runner.busy.rerun}
                onClick={() => runner.onRerun!(node)}
                title="Rerun this test or subtree"
              >
                <Icon icon={UiRefresh} className="mr-1 text-sm" />
                {runner.busy.rerun ? "Running..." : "Rerun"}
              </Button>
            )}
            {canStop && (
              <Button
                size="sm"
                variant="destructive"
                disabled={runner.busy.stop}
                onClick={() => runner.onStop!(node)}
                title="Stop this running task"
              >
                <Icon icon={UiStop} className="mr-1 text-sm" />
                {runner.busy.stop ? "Stopping..." : "Stop"}
              </Button>
            )}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {fwIcon && (
            <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5">
              <Icon icon={fwIcon} className="text-sm" />
              {node.framework}
            </span>
          )}
          {node.duration ? (
            <span className="inline-flex items-center gap-1">
              <Icon icon={UiClock} className="text-xs" />
              {formatTestDuration(node.duration)}
            </span>
          ) : null}
          {node.file && (
            <span className="font-mono">
              {node.file}
              {node.line ? `:${node.line}` : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The right pane. Resolves the node's adapter for body / tabs / header actions,
 * falling back to the built-in default body. Shows an empty state when nothing
 * is selected.
 */
export function TestDetailPanel() {
  const runner = useTestRunner();
  const node = runner.selected;
  const [activeTab, setActiveTab] = useState<string>("detail");

  if (!node) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <div className="text-center">
          <Icon icon={UiClass} className="mb-2 block text-4xl" />
          Select a test to view its details.
        </div>
      </div>
    );
  }

  const detailAdapter = runner.adapters.resolveDetail(node, runner);
  const actionAdapter = runner.adapters.resolveActions(node, runner);
  const tabs = runner.adapters.resolveTabs(node, runner);
  const ownsScroll = runner.adapters.ownsScroll(node, runner);

  const body = detailAdapter?.renderDetail
    ? detailAdapter.renderDetail({ node, runner })
    : <DefaultDetailBody node={node} />;
  const actions = actionAdapter?.nodeActions?.({ node, runner });

  const detailRegion = ownsScroll ? "min-h-0 flex-1" : "min-h-0 flex-1 overflow-y-auto";

  // No extra tabs → just the body under the header.
  if (tabs.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <DetailHeader node={node} actions={actions} />
        <div className={detailRegion}>{body}</div>
      </div>
    );
  }

  const detailTab = { id: "detail", label: "Detail", render: () => body };
  const allTabs = [detailTab, ...tabs];
  const active = allTabs.find((t) => t.id === activeTab) ?? detailTab;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DetailHeader node={node} actions={actions} />
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-density-2 py-density-1">
        {allTabs.map((t) => (
          <TabButton
            key={t.id}
            active={active.id === t.id}
            onClick={() => setActiveTab(t.id)}
            label={t.label}
          />
        ))}
      </div>
      <div className={detailRegion}>{active.render()}</div>
    </div>
  );
}
