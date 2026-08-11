import { cn } from "../lib/utils";
import { Icon, LabelIcon } from "../data/Icon";
import { UiAsterisk, UiChevronDown, UiChevronUp, UiCopy, UiTrash } from "../icons";
import { controlHeightClass, type FormSize } from "./json-schema-form-size";
import { TONE_GLYPH_CLASS } from "./json-schema-form-tone";
import type { ArrayItemSummary } from "./json-schema-form-types";

// The parts an array item's identifying row is made of, shared by every
// object-array display. They read only from ArrayItemSummary — the derived,
// render-ready description of one item — so a display never learns what the
// item is, and `x-item` stays the single place a consumer says how to
// summarize one.

export function ItemGlyph({ glyph }: { glyph?: ArrayItemSummary["glyph"] }) {
  if (!glyph) return null;
  return (
    <span
      title={glyph.label}
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
        TONE_GLYPH_CLASS[glyph.tone],
      )}
    >
      {glyph.icon != null && <LabelIcon icon={glyph.icon} className="text-[13px]" />}
    </span>
  );
}

export function ItemBadge({ badge }: { badge?: ArrayItemSummary["badge"] }) {
  if (!badge) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
      {badge.icon != null && <LabelIcon icon={badge.icon} className="text-[13px]" />}
      {badge.label}
    </span>
  );
}

export function RequiredMark() {
  return (
    <span title="Required" className="inline-flex shrink-0 items-center text-destructive">
      <Icon icon={UiAsterisk} className="text-[11px]" />
    </span>
  );
}

export function ItemRowActions({
  index,
  title,
  size,
  onUp,
  onDown,
  onDuplicate,
  onRemove,
}: {
  index: number;
  title: string;
  size: FormSize;
  onUp?: () => void;
  onDown?: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  // Hidden until the row is hovered or something inside it takes focus, so a
  // long list is not a wall of permanently dim icons — but keyboard users see
  // them the moment they arrive. Needs `group` on the item container.
  const action = cn(
    "inline-flex aspect-square items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30",
    controlHeightClass[size],
  );
  return (
    <div className="ml-auto flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
      <button type="button" aria-label={`Move ${title} up`} disabled={!onUp} className={action} onClick={onUp}>
        <Icon icon={UiChevronUp} className="text-sm" />
      </button>
      <button
        type="button"
        aria-label={`Move ${title} down`}
        disabled={!onDown}
        className={action}
        onClick={onDown}
      >
        <Icon icon={UiChevronDown} className="text-sm" />
      </button>
      <button type="button" aria-label={`Duplicate ${title}`} className={action} onClick={onDuplicate}>
        <Icon icon={UiCopy} className="text-sm" />
      </button>
      <button
        type="button"
        aria-label={`Remove ${title}`}
        className={cn(action, "hover:bg-destructive/10 hover:text-destructive")}
        onClick={onRemove}
        data-item-index={index}
      >
        <Icon icon={UiTrash} className="text-sm" />
      </button>
    </div>
  );
}
