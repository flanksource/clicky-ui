import { useRef, useState, type DragEvent, type HTMLAttributes } from "react";

// Drag-and-drop for the nav rail, kept structural: this module knows about rows,
// folders and a section root, never about what a consumer moves between them.
// Native HTML5 drag events are what a sidebar wants — a nav row is an <a>, which
// the browser already makes draggable, so the alternative is fighting it.

/** Which kind of nav row a drag endpoint is. */
export type AppShellNavDropKind = "item" | "group" | "section";

/** One end of a drag: a row's `key` plus what that row is. */
export type AppShellNavDropTarget = {
  key: string;
  kind: AppShellNavDropKind;
};

export type AppShellNavDrag = {
  /** Rows the user may pick up. Defaults to every row in the section. */
  canDrag?: (source: AppShellNavDropTarget) => boolean;
  /** Whether `source` may land on `target`. Defaults to any row but itself. */
  canDrop?: (
    source: AppShellNavDropTarget,
    target: AppShellNavDropTarget,
  ) => boolean;
  /** Commits the move. */
  onDrop: (
    source: AppShellNavDropTarget,
    target: AppShellNavDropTarget,
  ) => void;
  /**
   * Key reported for a drop on the section's own space (the heading and the
   * gaps around the rows) — the tree root in a tree-shaped section. Defaults
   * to the empty string.
   */
  rootKey?: string;
};

/**
 * Marks the payload as a nav drag so a row cannot be "dropped" from an
 * unrelated source; the key rides along for consumers that read the transfer.
 */
const NAV_DRAG_TYPE = "application/x-clicky-nav";

export type NavDragProps = HTMLAttributes<HTMLElement> & {
  /** What this row is — a stable hook for tests and consumer styling. */
  "data-nav-row": AppShellNavDropKind;
  // `| undefined` is deliberate — exactOptionalPropertyTypes forbids assigning
  // undefined to a plain optional, and both states are expressed by absence.
  "data-nav-drag"?: "source" | undefined;
  "data-nav-drop"?: "over" | undefined;
};

export type NavDragEndpoints = {
  /** Identity this row hands over when dragged. Omit for a drop-only zone. */
  drag?: AppShellNavDropTarget;
  /** Identity this row accepts drops as. Omit for a drag-only row. */
  drop?: AppShellNavDropTarget;
};

export type NavDragState = {
  /** Props for one row, or `undefined` when the section has no drag config. */
  props: (endpoints: NavDragEndpoints) => NavDragProps | undefined;
};

/** Row styling for both drag states; spread beside the row's own classes. */
export const NAV_DRAG_ROW_CLASS =
  "data-[nav-drag=source]:opacity-40 data-[nav-drop=over]:bg-sidebar-accent data-[nav-drop=over]:ring-1 data-[nav-drop=over]:ring-inset data-[nav-drop=over]:ring-sidebar-primary";

/** Section styling: a dashed outline so the root reads as a drop zone. */
export const NAV_DRAG_ZONE_CLASS =
  "data-[nav-drop=over]:rounded-md data-[nav-drop=over]:outline-1 data-[nav-drop=over]:outline-dashed data-[nav-drop=over]:outline-sidebar-primary";

function sameTarget(
  left: AppShellNavDropTarget | null,
  right: AppShellNavDropTarget | undefined,
): boolean {
  return (
    left !== null &&
    right !== undefined &&
    left.key === right.key &&
    left.kind === right.kind
  );
}

/**
 * Owns one section's drag state. Called once per section — the rail and the
 * mobile drawer each render their own, which is correct: a drag lives entirely
 * inside the rendering the pointer started in.
 *
 * There is no keyboard equivalent here: a move is a destructive-ish action, and
 * the row's context menu (right-click / Shift+F10) is the accessible path to it.
 */
export function useNavDrag(drag: AppShellNavDrag | undefined): NavDragState {
  // The ref decides, the state only paints. A browser can fire the first
  // dragover in the same frame as dragstart, so a drop that waited for the
  // re-render carrying the new source would be refused for the first stretch
  // of a fast drag — and refusing a dragover means no drop event at all.
  const sourceRef = useRef<AppShellNavDropTarget | null>(null);
  const [source, setSource] = useState<AppShellNavDropTarget | null>(null);
  const [over, setOver] = useState<AppShellNavDropTarget | null>(null);

  const reset = () => {
    sourceRef.current = null;
    setSource(null);
    setOver(null);
  };

  const props = ({
    drag: from,
    drop: to,
  }: NavDragEndpoints): NavDragProps | undefined => {
    // No endpoints means the row neither moves nor receives — nothing to wire.
    const identity = to ?? from;
    if (!drag || !identity) return undefined;
    const draggable = from !== undefined && (drag.canDrag?.(from) ?? true);
    /** The row being dragged, if it may land here — read at event time. */
    const accepted = (target: AppShellNavDropTarget) => {
      const dragged = sourceRef.current;
      return dragged !== null &&
        !sameTarget(dragged, target) &&
        (drag.canDrop?.(dragged, target) ?? true)
        ? dragged
        : null;
    };
    const enterOrOver =
      (target: AppShellNavDropTarget) => (event: DragEvent<HTMLElement>) => {
        // stopPropagation runs even for a refused row: the row under the
        // pointer is the answer, so a "no" here must not bubble up and let an
        // ancestor zone (the section root) accept the drop behind it.
        // preventDefault is what actually arms a drop, so it only runs for a
        // row that accepts.
        event.stopPropagation();
        if (!accepted(target)) {
          setOver(null);
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setOver(target);
      };

    return {
      "data-nav-row": identity.kind,
      ...(draggable && from
        ? {
            draggable: true,
            "data-nav-drag": sameTarget(source, from) ? "source" : undefined,
            onDragStart: (event: DragEvent<HTMLElement>) => {
              // A nested row must not also start its ancestor folder's drag.
              event.stopPropagation();
              event.dataTransfer.effectAllowed = "move";
              // Overwrites the URL payload the browser puts on an anchor drag.
              event.dataTransfer.setData(NAV_DRAG_TYPE, from.key);
              event.dataTransfer.setData("text/plain", from.key);
              sourceRef.current = from;
              setSource(from);
            },
            onDragEnd: reset,
          }
        : {}),
      ...(to !== undefined
        ? {
            "data-nav-drop": sameTarget(over, to) ? "over" : undefined,
            // A drop target has to cancel dragenter AND dragover — cancelling
            // only the latter leaves the row a drop target in Chrome but not
            // for every drag source, so both run the same admission check.
            onDragEnter: enterOrOver(to),
            onDragOver: enterOrOver(to),
            onDragLeave: (event: DragEvent<HTMLElement>) => {
              // dragleave also fires when the pointer crosses into a child of
              // this row; only a leave that exits the row should clear it.
              const next = event.relatedTarget;
              if (next instanceof Node && event.currentTarget.contains(next)) {
                return;
              }
              setOver((current) => (sameTarget(current, to) ? null : current));
            },
            onDrop: (event: DragEvent<HTMLElement>) => {
              event.preventDefault();
              event.stopPropagation();
              const dragged = accepted(to);
              if (dragged) drag.onDrop(dragged, to);
              reset();
            },
          }
        : {}),
    };
  };

  return { props };
}
