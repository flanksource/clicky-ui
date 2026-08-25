import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { duplicateIndex, moveItem, removeIndex, setIndex } from "../lib/collections";
import type { SizeToken } from "../lib/size";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiAdd, UiChevronDown, UiChevronRight, UiDotsVertical } from "../icons";
import { ItemActions } from "./ItemActions";
import { labelSizeClass } from "./json-schema-form-size";

// AccordionList renders a list of items as one-line rows, expanding one at a
// time into that item's own editor. It exists because a ten-field item stacked
// in full costs ~700px of screen each, and a column of them says nothing about
// which item is which.
//
// It knows nothing about what an item IS: `renderHeader` fills the collapsed
// row, `renderBody` fills the open panel, and everything structural — the
// disclosure, the aria pairing, roving arrow-key focus, the mutation buttons,
// the add row — belongs to the list. Every editing capability is opt-in, so the
// same component serves a read-only summary list and a full editor.
//
// "Add" is the list's own last row rather than a button beside it: the
// affordance sits exactly where the next item will appear, and at zero items
// that same row IS the empty state — one control, no separate screen.

/** Handed to every slot, describing one row. */
export interface AccordionListItemContext<T> {
  item: T;
  index: number;
  open: boolean;
  /** Replaces this item in place, committing the whole list through `onChange`. */
  onChange: (next: T) => void;
  /** The ids the disclosure/panel pair is wired with. */
  headerId: string;
  panelId: string;
}

export interface AccordionListProps<T> {
  items: T[];
  /** Receives the whole next list for every add, remove, duplicate, move or item edit. */
  onChange?: (next: T[]) => void;

  /** Row content, rendered inside the disclosure button after the chevron. */
  renderHeader: (ctx: AccordionListItemContext<T>) => ReactNode;
  /** Panel content. Rendered only while the row is open — never hidden with CSS. */
  renderBody: (ctx: AccordionListItemContext<T>) => ReactNode;
  /** Extra per-row actions, rendered before the built-in ones. */
  renderActions?: (ctx: AccordionListItemContext<T>) => ReactNode;
  /** Persistent row metadata rendered between the disclosure and actions. */
  renderMeta?: (ctx: AccordionListItemContext<T>) => ReactNode;
  /** Content above the list — typically the item count. */
  summary?: ReactNode;
  /** Names an item in its actions' accessible labels. Defaults to `Item <n>`. */
  itemLabel?: (ctx: { item: T; index: number }) => string;

  /** Offer the up/down reorder buttons. */
  allowReorder?: boolean;
  /**
   * Offer a grab handle at the head of every row, and drag-to-reorder across
   * the list. Arrow keys on a focused handle move the row too, so the gesture
   * is not mouse-only.
   */
  allowDrag?: boolean;
  /**
   * Whether a row takes part in dragging — as a source and as a destination.
   * Defaults to every row. A list holding rows that have no position of their
   * own (a filtered-out item, a soft-deleted one) says so here.
   */
  canDrag?: (ctx: { item: T; index: number }) => boolean;
  /**
   * Commits a completed drag or handle keypress. Defaults to the same move the
   * reorder buttons perform; a list whose order lives outside `items` (a
   * filtered view of a longer list) reorders the source through this instead.
   */
  onReorder?: (from: number, to: number) => void;
  /** Offer the duplicate button. */
  allowDuplicate?: boolean;
  /** Offer the remove button. */
  allowRemove?: boolean;
  /** Copy override for duplicate. Defaults to a one-level clone. */
  cloneItem?: (item: T) => T;
  /**
   * Reveal the per-row actions on hover/focus (the default). Pass false where an
   * action carries state the row has to show at rest — a visibility toggle whose
   * glyph says whether the item is hidden answers a question, not just offers a
   * click.
   */
  revealActions?: boolean;

  /** Seeds a new item. Supplying it is what adds the trailing add row. */
  onCreate?: () => T;
  /** Add-row text. Defaults to "Add item". */
  addLabel?: string;
  /** Add-row copy; grows into the empty state at zero items. */
  addDescription?: string;

  /** Controlled open row — an index, or null for none. */
  expanded?: number | null;
  /** Initially open row for uncontrolled usage. Defaults to none. */
  defaultExpanded?: number | null;
  onExpandedChange?: (index: number | null) => void;

  /** Hides the add row and every per-row action. Rows still open. */
  readOnly?: boolean;
  size?: SizeToken;
  /** Stem for the generated header/panel ids. */
  idPrefix?: string;
  /** Overrides the per-row id stem (e.g. with a JSON-Pointer instance path). */
  itemId?: (index: number) => string;
  /** Selector focused inside a freshly added row's panel. */
  focusSelector?: string;
  className?: string;
  listClassName?: string;
  rowClassName?: string;
  bodyClassName?: string;
}

const DEFAULT_FOCUS_SELECTOR = "[data-autofocus], input, select, textarea";

export function AccordionList<T>({
  items,
  onChange,
  renderHeader,
  renderBody,
  renderActions,
  renderMeta,
  summary,
  itemLabel,
  allowReorder = false,
  allowDrag = false,
  canDrag,
  onReorder,
  allowDuplicate = false,
  allowRemove = false,
  revealActions = true,
  cloneItem,
  onCreate,
  addLabel = "Add item",
  addDescription,
  expanded: expandedProp,
  defaultExpanded = null,
  onExpandedChange,
  readOnly = false,
  size = "md",
  idPrefix = "accordion",
  itemId,
  focusSelector = DEFAULT_FOCUS_SELECTOR,
  className,
  listClassName,
  rowClassName,
  bodyClassName,
}: AccordionListProps<T>) {
  // Which row is open is transient view state, deliberately local and never
  // persisted. The INDEX is the key, not the item: an editor typically replaces
  // the item object on every keystroke, so any identity-based map would die on
  // the first character typed. That makes it the mutators' job to keep this
  // pointing at the same row.
  const isControlled = expandedProp !== undefined;
  const [innerExpanded, setInnerExpanded] = useState<number | null>(defaultExpanded);
  const expanded = isControlled ? expandedProp : innerExpanded;

  // The in-flight drag: the row being dragged and the row the pointer is over.
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const addRef = useRef<HTMLButtonElement | null>(null);
  const pendingFocus = useRef<{ kind: "panel" | "row" | "add"; index: number } | null>(null);

  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    if (pending.kind === "add") {
      addRef.current?.focus();
      return;
    }
    const row = rowRefs.current[pending.index];
    if (pending.kind === "row") {
      row?.focus();
      return;
    }
    // Land in the new item's first editable control, so adding an item leaves
    // the caret where the author is about to type.
    const panel = document.getElementById(panelId(pending.index));
    (panel?.querySelector<HTMLElement>(focusSelector) ?? row)?.focus();
  });

  function rowId(index: number): string {
    return itemId ? itemId(index) : `${idPrefix}-${index}`;
  }
  function panelId(index: number): string {
    return `${rowId(index)}-panel`;
  }
  function headerId(index: number): string {
    return `${rowId(index)}-header`;
  }

  function expand(next: number | null) {
    if (!isControlled) setInnerExpanded(next);
    onExpandedChange?.(next);
  }
  // A mutator moves the open row without the caller having asked to expand
  // anything, so it maps the current index rather than setting an absolute one.
  function reindexExpanded(map: (open: number | null) => number | null) {
    const next = map(expanded);
    if (next !== expanded) expand(next);
  }

  function commit(next: T[]) {
    onChange?.(next);
  }

  function add() {
    if (!onCreate) return;
    pendingFocus.current = { kind: "panel", index: items.length };
    expand(items.length);
    commit([...items, onCreate()]);
  }

  function remove(index: number) {
    reindexExpanded((open) =>
      open === index ? null : open !== null && open > index ? open - 1 : open,
    );
    pendingFocus.current =
      items.length === 1
        ? { kind: "add", index: 0 }
        : { kind: "row", index: Math.max(index - 1, 0) };
    commit(removeIndex(items, index));
  }

  function duplicate(index: number) {
    reindexExpanded((open) => (open !== null && open > index ? open + 1 : open));
    pendingFocus.current = { kind: "row", index: index + 1 };
    commit(duplicateIndex(items, index, cloneItem));
  }

  /** Where a drag would land, so the row can draw the insertion line. */
  function dropEdge(index: number): "top" | "bottom" | null {
    if (dragFrom === null || dragOver !== index || dragFrom === index) return null;
    return dragFrom < index ? "bottom" : "top";
  }

  function endDrag() {
    setDragFrom(null);
    setDragOver(null);
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    if (onReorder) onReorder(from, to);
    else move(from, to);
  }

  function move(index: number, to: number) {
    if (to < 0 || to >= items.length) return;
    // Follow the item, not the slot — otherwise moving an open row silently
    // expands whichever row took its place.
    reindexExpanded((open) => (open === index ? to : open === to ? index : open));
    pendingFocus.current = { kind: "row", index: to };
    commit(moveItem(items, index, to));
  }

  // Roving focus across the headers, with the add row as the final stop.
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const stops = rowRefs.current.length;
    const focusAt = (i: number) => {
      e.preventDefault();
      (i >= stops ? addRef.current : rowRefs.current[i])?.focus();
    };
    if (e.key === "ArrowDown") focusAt(Math.min(index + 1, stops));
    else if (e.key === "ArrowUp" && index > 0) focusAt(index - 1);
    else if (e.key === "Home") focusAt(0);
    else if (e.key === "End") focusAt(stops);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {summary !== undefined && (
        <p className={cn("text-muted-foreground", labelSizeClass[size])}>{summary}</p>
      )}
      <div
        className={cn("divide-y divide-border rounded-lg border border-border", listClassName)}
      >
        {items.map((item, i) => {
          const open = expanded === i;
          const slotCtx: AccordionListItemContext<T> = {
            item,
            index: i,
            open,
            onChange: (next) => commit(setIndex(items, i, next)),
            headerId: headerId(i),
            panelId: panelId(i),
          };
          const label = itemLabel?.({ item, index: i }) ?? `Item ${i + 1}`;
          const actions = renderActions?.(slotCtx);
          const meta = renderMeta?.(slotCtx);
          const dragEnabled = allowDrag && !readOnly && (canDrag?.({ item, index: i }) ?? true);
          const droppable = dragEnabled && dragFrom !== null && dragFrom !== i;
          const edge = droppable ? dropEdge(i) : null;
          return (
            <div key={i} className="group">
              {/* The row is a plain element, NOT a button: the actions beside it
                  are buttons, and nesting interactive content is invalid DOM
                  with undefined click targeting. Only the disclosure toggles. */}
              <div
                data-accordion-row
                data-drop-edge={edge ?? undefined}
                onDragOver={(e) => {
                  if (!droppable) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOver(i);
                }}
                onDrop={(e) => {
                  if (!droppable || dragFrom === null) return;
                  e.preventDefault();
                  reorder(dragFrom, i);
                  endDrag();
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 hover:bg-accent/40",
                  i % 2 === 0 ? "bg-card" : "bg-muted/20",
                  open && "bg-accent/30",
                  dragFrom === i && "opacity-40",
                  edge === "top" && "shadow-[inset_0_2px_0_0_var(--color-primary)]",
                  edge === "bottom" && "shadow-[inset_0_-2px_0_0_var(--color-primary)]",
                  rowClassName,
                )}
              >
                {allowDrag && !readOnly && (
                  <button
                    type="button"
                    aria-label={`Reorder ${label}`}
                    title={`Reorder ${label}`}
                    disabled={!dragEnabled}
                    draggable={dragEnabled}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(i));
                      // Drag the row, not the handle glyph the pointer grabbed.
                      const row = e.currentTarget.closest("[data-accordion-row]");
                      if (row instanceof HTMLElement) e.dataTransfer.setDragImage(row, 12, 12);
                      setDragFrom(i);
                    }}
                    onDragEnd={endDrag}
                    onKeyDown={(e) => {
                      const to = e.key === "ArrowUp" ? i - 1 : e.key === "ArrowDown" ? i + 1 : i;
                      if (to === i || to < 0 || to >= items.length) return;
                      e.preventDefault();
                      reorder(i, to);
                    }}
                    className="shrink-0 cursor-grab rounded text-muted-foreground hover:text-foreground active:cursor-grabbing disabled:cursor-default disabled:opacity-30"
                  >
                    <Icon icon={UiDotsVertical} className="text-sm" />
                  </button>
                )}
                <button
                  type="button"
                  id={headerId(i)}
                  aria-expanded={open}
                  aria-controls={panelId(i)}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onClick={() => expand(open ? null : i)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon
                    icon={open ? UiChevronDown : UiChevronRight}
                    className="shrink-0 text-sm text-muted-foreground"
                  />
                  {renderHeader(slotCtx)}
                </button>
                {meta}
                {!readOnly && (allowReorder || allowDuplicate || allowRemove || actions) && (
                  <ItemActions
                    label={label}
                    index={i}
                    count={items.length}
                    size={size}
                    reveal={revealActions}
                    {...(actions ? { leading: actions } : {})}
                    {...(allowReorder ? { onMove: (to: number) => move(i, to) } : {})}
                    {...(allowDuplicate ? { onDuplicate: () => duplicate(i) } : {})}
                    {...(allowRemove ? { onRemove: () => remove(i) } : {})}
                  />
                )}
              </div>
              {open && (
                <div
                  id={panelId(i)}
                  role="region"
                  aria-labelledby={headerId(i)}
                  className={cn("border-t border-border bg-muted/20 p-3", bodyClassName)}
                >
                  {renderBody(slotCtx)}
                </div>
              )}
            </div>
          );
        })}
        {!readOnly && onCreate && (
          <AddItemRow
            buttonRef={addRef}
            label={addLabel}
            empty={items.length === 0}
            onAdd={add}
            onKeyDown={(e) => handleKeyDown(e, items.length)}
            {...(addDescription ? { copy: addDescription } : {})}
          />
        )}
      </div>
    </div>
  );
}

// AddItemRow is the list's own final row. At zero items it grows to carry the
// explanation of what an item is — so the empty state is the same control the
// author will use, not a separate screen they have to leave.
function AddItemRow({
  label,
  copy,
  empty,
  onAdd,
  onKeyDown,
  buttonRef,
}: {
  label: string;
  copy?: string;
  empty: boolean;
  onAdd: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: MutableRefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      type="button"
      ref={(el) => {
        buttonRef.current = el;
      }}
      onClick={onAdd}
      onKeyDown={onKeyDown}
      className={cn(
        "group/add flex w-full items-center gap-2 px-3 py-2 text-left text-muted-foreground hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        empty && "items-start py-5",
      )}
    >
      {/* Holds the chevron column, so this row lines up with the ones above it. */}
      <Icon icon={UiChevronRight} className="shrink-0 text-sm opacity-0" />
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-foreground/60 group-hover/add:border-primary group-hover/add:text-primary">
        <Icon icon={UiAdd} className="text-[13px]" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {copy && (
          <span className={cn("text-xs", empty ? "max-w-xl leading-snug" : "truncate")}>{copy}</span>
        )}
      </span>
    </button>
  );
}
