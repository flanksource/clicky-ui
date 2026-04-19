import { Tree } from "../Tree";
import { Icon } from "../Icon";
import type { ProcessNode } from "./types";
import {
  countProcesses,
  formatBytes,
  processLabel,
  processStateColor,
  processStateIcon,
} from "./utils";

export type DiagnosticsTreeProps = {
  root?: ProcessNode;
  selectedPid?: number | null;
  expandAll?: boolean | null;
  onSelect: (pid: number) => void;
};

export function DiagnosticsTree({
  root,
  selectedPid,
  expandAll = null,
  onSelect,
}: DiagnosticsTreeProps) {
  if (!root) {
    return (
      <div className="p-density-6 text-center text-muted-foreground">
        <Icon name="svg-spinners:ring-resize" className="text-3xl text-blue-500" />
        <p className="mt-density-2">Waiting for process diagnostics...</p>
      </div>
    );
  }

  if (countProcesses(root) === 0) {
    return (
      <div className="p-density-6 text-center text-muted-foreground text-sm">
        No processes available
      </div>
    );
  }

  return (
    <Tree<ProcessNode>
      roots={[root]}
      getChildren={(n) => n.children}
      getKey={(n) => n.pid}
      expandAll={expandAll}
      defaultOpen={(n, depth) => !!n.is_root || depth < 1}
      onSelect={(n) => onSelect(n.pid)}
      renderRow={({ node }) => {
        const selected = node.pid === selectedPid;
        const cpu = node.cpu_percent || 0;
        return (
          <>
            <Icon
              name={node.is_root ? "codicon:server-process" : "codicon:debug-alt"}
              className={
                node.is_root ? "text-base text-blue-600" : "text-base text-muted-foreground"
              }
            />
            <span
              className={`truncate ${
                selected ? "font-semibold text-primary" : "font-medium text-foreground"
              }`}
            >
              {processLabel(node)}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">pid {node.pid}</span>
            <span className="flex-1" />
            {node.status && (
              <span
                className={`inline-flex items-center gap-1 text-xs shrink-0 ${processStateColor(
                  node.status,
                )}`}
              >
                <Icon name={processStateIcon(node.status)} />
                {node.status}
              </span>
            )}
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
              {cpu.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
              {formatBytes(node.rss)}
            </span>
          </>
        );
      }}
      rowClass={(node) =>
        node.pid === selectedPid ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-accent"
      }
    />
  );
}
