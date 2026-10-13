import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "../Icon";
import { Button } from "../../components/button";
import { SplitButton } from "../../components/SplitButton";
import { useCopyFlash } from "../../components/clipboard";
import type { DropdownMenuItem } from "../../overlay/DropdownMenu";
import { cn } from "../../lib/utils";
import { JsonView } from "../JsonView";
import { TabButton } from "../TabButton";
import {
  UiCheck,
  UiClass,
  UiClock,
  UiCopy,
  UiJson,
  UiRefresh,
  UiStop,
  UiWarningCircle,
} from "../../icons";
import type { Test } from "./types";
import { useTestRunner } from "./context";
import { buildNodeBrief, buildNodeJson, type CopyItem } from "./copy";
import { formatTestDuration, outcomeFor, sum } from "./status";
import { OutcomeIcon, ToolIcon } from "./MarkIcons";
import { TestAttempts, TestFailureDetail, TestOutput } from "./TestFailureDetail";

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

function copyMenuItem(item: CopyItem, copy: (text: string) => void): DropdownMenuItem {
  const icon = item.icon ? { icon: item.icon } : {};
  if ("reason" in item) {
    return { label: item.label, ...icon, disabled: true, title: item.reason, onSelect: () => {} };
  }
  return { label: item.label, ...icon, onSelect: () => copy(item.value) };
}

const COPY_LABEL = { idle: "Copy details", copied: "Copied", error: "Copy failed" } as const;
const COPY_ICON = { idle: UiCopy, copied: UiCheck, error: UiWarningCircle } as const;

/**
 * "Copy details" split button: the primary action copies a Markdown brief of
 * the generic sections plus every matching adapter's `copy` sections; the menu
 * offers the node as JSON and the adapters' items, disabled with a reason when
 * they have nothing to copy. The label flips to "Copied" or "Copy failed".
 */
function CopyDetailsButton({ node }: { node: Test }) {
  const runner = useTestRunner();
  const { state, copy } = useCopyFlash();
  const sections = useMemo(() => runner.adapters.resolveCopy(node, runner), [node, runner]);
  const items: DropdownMenuItem[] = [
    { label: "Copy as JSON", icon: UiJson, onSelect: () => copy(buildNodeJson(node)) },
    ...sections.items.map((item) => copyMenuItem(item, copy)),
  ];
  return (
    <SplitButton
      label={COPY_LABEL[state]}
      icon={COPY_ICON[state]}
      variant="outline"
      size="sm"
      align="right"
      title="More copy options"
      onClick={() => copy(buildNodeBrief(node, sections))}
      items={items}
    />
  );
}

function DetailHeader({ node, actions }: { node: Test; actions?: ReactNode }) {
  const runner = useTestRunner();
  const outcome = outcomeFor(node);
  const canRerun = !!runner.onRerun && node.framework !== "task";
  const canStop = !!runner.onStop && !!node.can_stop && !!node.task_id;
  const location = node.file ? `${node.file}${node.line ? `:${node.line}` : ""}` : undefined;
  return (
    <div
      className="flex min-w-0 items-center gap-2 border-b border-border px-density-4 py-density-2"
      data-detail-header=""
    >
      {outcome ? (
        <OutcomeIcon outcome={outcome} className="text-lg" />
      ) : (
        <Icon icon={UiClass} className="shrink-0 text-lg text-muted-foreground" />
      )}
      <h2 className="min-w-0 shrink truncate text-base font-semibold" title={node.name}>
        {node.name}
      </h2>
      {node.framework && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          <ToolIcon tool={node.framework} className="text-sm" />
          {node.framework}
        </span>
      )}
      {node.duration ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Icon icon={UiClock} className="text-xs" />
          {formatTestDuration(node.duration)}
        </span>
      ) : null}
      {location && (
        <span
          className="min-w-0 shrink-[100] truncate font-mono text-xs text-muted-foreground"
          title={location}
        >
          {location}
        </span>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {actions}
        <CopyDetailsButton node={node} />
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
  // Tab state is controlled when the host supplies activeTab (e.g. to mirror it
  // into the URL); otherwise the panel owns it. The render below tolerates an
  // unknown id by falling back to the built-in "detail" tab.
  const controlled = runner.activeTab !== undefined;
  const [internalTab, setInternalTab] = useState<string>("detail");
  const activeTab = controlled ? runner.activeTab! : internalTab;
  const setActiveTab = (id: string) => {
    if (controlled) runner.onTabChange?.(id);
    else setInternalTab(id);
  };

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

  // A size container, so log blocks can cap themselves at a share of the pane (cqh).
  const detailRegion = cn("min-h-0 flex-1 [container-type:size]", !ownsScroll && "overflow-y-auto");

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
