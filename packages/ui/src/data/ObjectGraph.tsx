import { useMemo, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";
import { UiCheck, UiEllipsis, UiFullscreen } from "../icons";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import { Modal } from "../overlay/Modal";
import {
  countObjectGraphNodes,
  pruneNullNodes,
  type ObjectGraphNode,
} from "./object-graph-nodes";
import { Tree } from "./Tree";

export type { ObjectGraphNode };

// ObjectGraph renders a generic, type-agnostic expandable object/value
// inspector — a bean's fields, a map's entries, a list's elements, a scalar
// leaf. It is the shared home for what used to be per-feature object viewers
// (e.g. an OGNL inspector): any producer maps its data into ObjectGraphNode and
// gets the same tree, search, and lazy-expansion behaviour.

export type ObjectGraphProps<T extends ObjectGraphNode = ObjectGraphNode> = {
  roots: T[];
  className?: string;
  empty?: ReactNode;
  showControls?: boolean;
  /** Open nodes shallower than this depth on first render (default 2). */
  defaultOpenDepth?: number;
  /** Override the row label rendering. */
  renderLabel?: (node: T) => ReactNode;
  /**
   * Override how a node's value is rendered. Return `null`/`undefined` to fall
   * back to the default scalar/raw span, so a caller only has to handle the
   * nodes it recognises (e.g. a Java exception leaf).
   */
  renderValue?: (node: T) => ReactNode;
  /**
   * Lazily fetch a node's children the first time an `expandable` node opens.
   * When omitted, only inline `children` are shown.
   */
  loadChildren?: (node: T) => Promise<T[]>;
  /**
   * Called when a node's label is clicked. This makes the label an actionable
   * target (e.g. copy/drill its `path`) **without toggling expansion** — the
   * chevron stays the only expand/collapse control. Omit for a static tree.
   */
  onNodeSelect?: (node: T) => void;
  /** `id` of the currently-selected node; its label is highlighted. */
  selectedId?: string;
  /** Render a ⋮ display-options menu in the toolbar. Defaults to `false`. */
  showOptionsMenu?: boolean;
  /**
   * Initial state of the options menu's "Hide null values" toggle. Off by
   * default so existing consumers keep seeing every node.
   */
  defaultHideNulls?: boolean;
  /** Extra entries appended to the options menu. */
  menuActions?: DropdownMenuItem[];
  /**
   * Render a fullscreen toggle in the toolbar. When clicked, the graph
   * re-renders inside a full-viewport Modal. Defaults to `false`.
   */
  showFullscreenControl?: boolean;
  /** Title of the fullscreen modal. */
  fullscreenTitle?: ReactNode;
  /** Accessible name of the fullscreen button. */
  fullscreenButtonLabel?: string;
};

export function ObjectGraph<T extends ObjectGraphNode = ObjectGraphNode>({
  roots,
  className,
  empty,
  showControls,
  defaultOpenDepth = 2,
  renderLabel,
  renderValue,
  loadChildren,
  onNodeSelect,
  selectedId,
  showOptionsMenu = false,
  defaultHideNulls = false,
  menuActions,
  showFullscreenControl = false,
  fullscreenTitle = "Object",
  fullscreenButtonLabel = "Open object browser full screen",
}: ObjectGraphProps<T>) {
  const [hideNulls, setHideNulls] = useState(defaultHideNulls);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const visibleRoots = useMemo(
    () => (hideNulls ? pruneNullNodes(roots) : roots),
    [hideNulls, roots],
  );
  const hiddenCount = useMemo(
    () => (hideNulls ? countObjectGraphNodes(roots) - countObjectGraphNodes(visibleRoots) : 0),
    [hideNulls, roots, visibleRoots],
  );

  const items: DropdownMenuItem[] = [
    {
      label: hideNulls && hiddenCount > 0 ? `Hide null values (${hiddenCount})` : "Hide null values",
      onSelect: () => setHideNulls((current) => !current),
      ...(hideNulls ? { icon: UiCheck } : {}),
      title: "Drop fields whose value is null or blank",
    },
    ...(menuActions ?? []),
  ];

  const renderGraph = ({ inFullscreen }: { inFullscreen: boolean }) => {
    const actions =
      showOptionsMenu || (showFullscreenControl && !inFullscreen) ? (
        <>
          {showFullscreenControl && !inFullscreen && (
            <ToolbarButton label={fullscreenButtonLabel} onClick={() => setFullscreenOpen(true)}>
              <Icon icon={UiFullscreen} className="text-sm" />
            </ToolbarButton>
          )}
          {showOptionsMenu && (
            <DropdownMenu
              items={items}
              align="right"
              menuLabel="Display options"
              trigger={
                <ToolbarButton label="Display options">
                  <Icon icon={UiEllipsis} className="text-sm" />
                </ToolbarButton>
              }
            />
          )}
        </>
      ) : undefined;

    return (
      <Tree<T>
        roots={visibleRoots}
        getKey={(n) => n.id}
        getChildren={(n) => n.children as T[] | undefined}
        defaultOpen={(_n, depth) => depth < defaultOpenDepth}
        {...(className !== undefined && !inFullscreen ? { className } : {})}
        {...(actions !== undefined ? { actions } : {})}
        empty={
          hideNulls && roots.length > 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">All values are null.</div>
          ) : (
            empty
          )
        }
        {...(showControls !== undefined ? { showControls } : {})}
        {...(loadChildren ? { loadChildren, hasMoreChildren: (n: T) => n.expandable === true } : {})}
        renderRow={({ node, loading, error }) => (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 font-mono text-xs">
            {renderLabel ? (
              renderLabel(node)
            ) : (
              <DefaultObjectLabel
                node={node}
                selected={selectedId != null && node.id === selectedId}
                {...(renderValue ? { renderValue } : {})}
                {...(onNodeSelect ? { onSelect: onNodeSelect } : {})}
              />
            )}
            {loading && <span className="shrink-0 text-muted-foreground">…</span>}
            {error != null && (
              <span className="break-all text-red-600">
                {error instanceof Error ? error.message : String(error)}
              </span>
            )}
          </div>
        )}
      />
    );
  };

  if (!showFullscreenControl) return renderGraph({ inFullscreen: false });

  return (
    <>
      {renderGraph({ inFullscreen: false })}
      <Modal
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        title={fullscreenTitle}
        size="full"
        className="h-[95vh]"
        scrollBody={false}
      >
        <div className="flex h-full min-h-0 flex-col">{renderGraph({ inFullscreen: true })}</div>
      </Modal>
    </>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      {...(onClick ? { onClick } : {})}
    >
      {children}
    </button>
  );
}

function DefaultObjectLabel<T extends ObjectGraphNode>({
  node,
  onSelect,
  renderValue,
  selected = false,
}: {
  node: T;
  onSelect?: (node: T) => void;
  renderValue?: (node: T) => ReactNode;
  selected?: boolean;
}) {
  const label = onSelect ? (
    // A button so the label is a first-class click target; stopPropagation keeps
    // the row's onClick (which toggles the node) from firing, so selecting a node
    // never expands or collapses it.
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node);
      }}
      title="Select this path"
      className={cn(
        "rounded px-0.5 text-left text-muted-foreground hover:text-foreground hover:underline",
        selected && "bg-primary/15 text-foreground",
      )}
    >
      {node.label}
    </button>
  ) : (
    <span className="text-muted-foreground">{node.label}</span>
  );
  const custom = renderValue?.(node);
  return (
    <>
      {label}
      {node.type && <span className="text-muted-foreground/60">@{node.type}</span>}
      {custom != null ? (
        custom
      ) : node.value != null ? (
        <span className="break-all text-foreground">{String(node.value)}</span>
      ) : node.raw && !node.children ? (
        <span className="break-all italic text-muted-foreground/70">{node.raw}</span>
      ) : null}
    </>
  );
}
