import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
} from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiAdd, UiChevronDown, UiChevronRight } from "../icons";
import { appendInstancePath } from "./json-schema-form-errors";
import {
  ItemBadge,
  ItemGlyph,
  ItemRowActions,
  RequiredMark,
} from "./json-schema-form-item-row";
import {
  addItemLabel,
  emptyItemsCopy,
  itemCountLabel,
  itemSummaryFor,
  noItemsLabel,
  resolveItemSpec,
} from "./json-schema-form-item-summary";
import { labelSizeClass } from "./json-schema-form-size";
import {
  duplicateIndex,
  fieldInputId,
  moveItem,
  removeIndex,
  seedFromSchema,
  setIndex,
} from "./json-schema-form-utils";
import type { FieldControl, RenderContext } from "./json-schema-form-types";

// AccordionArray renders an object-item array as a list of one-line summary
// rows, expanding one at a time into the item's own sub-form. It exists because
// a ten-property item stacked in full costs ~700px of screen each, and a list of
// them says nothing about which item is which.
//
// "Add" is the list's own last row rather than a button beside it: the
// affordance sits exactly where the next item will appear, and at zero items
// that same row IS the empty state — one control, no separate screen.
export function AccordionArray({
  field,
  ctx,
  readOnly,
}: {
  field: FieldControl;
  ctx: RenderContext;
  readOnly: boolean;
}) {
  const items = Array.isArray(field.value) ? field.value : [];
  const itemSchema = field.itemSchema ?? { type: "object" };
  const spec = field.itemSpec ?? resolveItemSpec(field.schema, itemSchema);
  const emptyCopy = emptyItemsCopy(spec, field.schema);
  // The array's help mode governs its whole subtree. Without this the fields
  // inside an expanded row keep the form-level default, so an accordion that
  // resolved to "hover" would still stack a two-line paragraph under every
  // control — the exact height the summary rows exist to reclaim.
  const childCtx: RenderContext = {
    ...ctx,
    readOnly,
    depth: ctx.depth + 1,
    ...(field.helpDisplay
      ? { layout: { ...ctx.layout, help: field.helpDisplay } }
      : {}),
  };

  // Which row is open is transient view state, like the form's field filter —
  // it is deliberately local and never persisted. The INDEX is the key, not the
  // item: every keystroke replaces the item object (setIndex returns a fresh
  // one), so any identity-based map would die on the first character typed.
  // That makes it the mutators' job to keep this pointing at the same row.
  const [expanded, setExpanded] = useState<number | null>(null);
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
    const input = panel?.querySelector<HTMLElement>("[data-jsf-input]");
    (input ?? row)?.focus();
  });

  function panelId(index: number): string {
    return `${fieldInputId(appendInstancePath(ctx.instancePath, index), ctx.idPrefix)}-panel`;
  }
  function headerId(index: number): string {
    return `${fieldInputId(appendInstancePath(ctx.instancePath, index), ctx.idPrefix)}-header`;
  }

  function commit(next: unknown[]) {
    field.onChange(next);
  }

  function add() {
    pendingFocus.current = { kind: "panel", index: items.length };
    setExpanded(items.length);
    commit([...items, seedFromSchema(itemSchema)]);
  }

  function remove(index: number) {
    setExpanded((open) => (open === index ? null : open !== null && open > index ? open - 1 : open));
    pendingFocus.current =
      items.length === 1 ? { kind: "add", index: 0 } : { kind: "row", index: Math.max(index - 1, 0) };
    commit(removeIndex(items, index));
  }

  function duplicate(index: number) {
    setExpanded((open) => (open !== null && open > index ? open + 1 : open));
    pendingFocus.current = { kind: "row", index: index + 1 };
    commit(duplicateIndex(items, index));
  }

  function move(index: number, to: number) {
    // Follow the item, not the slot — otherwise moving an open row silently
    // expands whichever row took its place.
    setExpanded((open) => (open === index ? to : open === to ? index : open));
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
    <div className="flex flex-col gap-2">
      <p className={cn("text-muted-foreground", labelSizeClass[ctx.size])}>
        {items.length === 0 ? noItemsLabel(spec) : itemCountLabel(spec, items.length)}
      </p>
      <div className="divide-y divide-border rounded-lg border border-border">
        {items.map((item, i) => {
          const open = expanded === i;
          const summary =
            field.itemSummary?.({ item, index: i }) ??
            itemSummaryFor({ item, index: i, spec, itemSchema });
          return (
            <div key={i} className="group">
              {/* The row is a plain element, NOT a button: the actions beside it
                  are buttons, and nesting interactive content is invalid DOM
                  with undefined click targeting. Only the disclosure toggles. */}
              <div
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 hover:bg-accent/40",
                  open && "bg-accent/30",
                )}
              >
                <button
                  type="button"
                  id={headerId(i)}
                  aria-expanded={open}
                  aria-controls={panelId(i)}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onClick={() => setExpanded(open ? null : i)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon
                    icon={open ? UiChevronDown : UiChevronRight}
                    className="shrink-0 text-sm text-muted-foreground"
                  />
                  <ItemGlyph glyph={summary.glyph} />
                  <span className="shrink-0 text-sm font-medium">{summary.title}</span>
                  <ItemBadge badge={summary.badge} />
                  {summary.flagged && <RequiredMark />}
                  {summary.summary && (
                    <code className="truncate font-mono text-xs text-muted-foreground">
                      {summary.summary}
                    </code>
                  )}
                </button>
                {!readOnly && (
                  <ItemRowActions
                    index={i}
                    title={summary.title}
                    size={ctx.size}
                    {...(i > 0 ? { onUp: () => move(i, i - 1) } : {})}
                    {...(i < items.length - 1 ? { onDown: () => move(i, i + 1) } : {})}
                    onDuplicate={() => duplicate(i)}
                    onRemove={() => remove(i)}
                  />
                )}
              </div>
              {open && (
                <div
                  id={panelId(i)}
                  role="region"
                  aria-labelledby={headerId(i)}
                  className="border-t border-border bg-muted/20 p-3"
                >
                  {/* Recurse through the shared pipeline so consumer pre/post
                      extensions still apply to the item and its properties. */}
                  {ctx.render.renderFieldNodes(
                    {
                      key: `${field.key}[${i}]`,
                      prop: itemSchema,
                      required: false,
                      value: item,
                      onChange: (next) => commit(setIndex(items, i, next)),
                      instancePath: appendInstancePath(ctx.instancePath, i),
                    },
                    childCtx,
                  )?.value ?? null}
                </div>
              )}
            </div>
          );
        })}
        {!readOnly && (
          <AddItemRow
            buttonRef={addRef}
            label={addItemLabel(spec)}
            empty={items.length === 0}
            onAdd={add}
            onKeyDown={(e) => handleKeyDown(e, items.length)}
            {...(emptyCopy ? { copy: emptyCopy } : {})}
          />
        )}
      </div>
    </div>
  );
}

// AddItemRow is the list's own final row. At zero items it grows to carry the
// schema's explanation of what an item is — so the empty state is the same
// control the author will use, not a separate screen they have to leave.
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
