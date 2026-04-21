import { useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";
import { TreeNode, type TreeNodeProps } from "./TreeNode";

export type TreeProps<T> = Omit<TreeNodeProps<T>, "node" | "depth" | "expandAll"> & {
  roots: T[];
  empty?: ReactNode;
  className?: string;
  /**
   * Render the Expand all / Collapse all toolbar above the tree. Enabled by
   * default. Set to false to suppress when the tree is tiny or the controls
   * are owned externally.
   */
  showControls?: boolean;
  /**
   * Externally controlled expand-all state. When provided together with
   * `onExpandAllChange`, the tree is controlled; otherwise it manages the
   * toolbar state internally.
   */
  expandAll?: boolean | null;
  onExpandAllChange?: (next: boolean | null) => void;
  toolbarClassName?: string;
};

export function Tree<T>({
  roots,
  empty,
  className,
  showControls = true,
  expandAll: controlledExpandAll,
  onExpandAllChange,
  toolbarClassName,
  ...nodeProps
}: TreeProps<T>) {
  const [internalExpandAll, setInternalExpandAll] = useState<boolean | null>(null);
  const isControlled = onExpandAllChange !== undefined;
  const expandAll = isControlled ? (controlledExpandAll ?? null) : internalExpandAll;
  const setExpandAll = (next: boolean | null) => {
    if (isControlled) onExpandAllChange?.(next);
    else setInternalExpandAll(next);
  };

  if (roots.length === 0) return <>{empty ?? null}</>;

  return (
    <div className={cn("flex flex-col min-h-0", className)}>
      {showControls && (
        <div
          className={cn(
            "flex items-center gap-1 border-b border-border px-2 py-1 text-xs text-muted-foreground",
            toolbarClassName,
          )}
        >
          <button
            type="button"
            onClick={() => setExpandAll(true)}
            aria-pressed={expandAll === true}
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-accent hover:text-accent-foreground",
              expandAll === true && "bg-accent text-accent-foreground",
            )}
          >
            <Icon name="codicon:expand-all" className="text-xs" />
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setExpandAll(false)}
            aria-pressed={expandAll === false}
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-accent hover:text-accent-foreground",
              expandAll === false && "bg-accent text-accent-foreground",
            )}
          >
            <Icon name="codicon:collapse-all" className="text-xs" />
            Collapse all
          </button>
        </div>
      )}
      <div role="tree" className="min-h-0 flex-1 overflow-auto">
        {roots.map((root) => (
          <TreeNode<T>
            key={nodeProps.getKey(root)}
            node={root}
            expandAll={expandAll}
            {...nodeProps}
          />
        ))}
      </div>
    </div>
  );
}
