import { cn } from "../lib/utils";
import { Icon, LabelIcon } from "../data/Icon";
import { UiAsterisk, UiWarningCircle } from "../icons";
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

// A collapsed row hides the controls that would carry a validation message, so
// it says how many errors are inside it instead — an error the reader cannot
// see is an error they cannot fix.
export function ItemErrorMark({ count }: { count: number }) {
  if (count <= 0) return null;
  const label = count === 1 ? "1 error" : `${count} errors`;
  return (
    <span
      title={label}
      className="inline-flex shrink-0 items-center gap-1 text-xs text-destructive"
    >
      <Icon icon={UiWarningCircle} className="text-sm" />
      {label}
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

