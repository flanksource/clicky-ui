import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, LabelIcon, type LabelIconSpec } from "../data/Icon";
import { UiQuestion } from "../icons";
import { HoverCard } from "../overlay/HoverCard";
import type {
  FieldControl,
  FormLayout,
  GridColumns,
  HelpDisplay,
} from "./json-schema-form-types";
import { DEFAULT_COLUMN_MIN_WIDTH } from "./json-schema-form-utils";
import {
  controlMinHeightClass,
  fieldInnerGapClass,
  inlineRowGapClass,
  labelSizeClass,
  stackedRowGapClass,
  type FormSize,
} from "./json-schema-form-size";

// FieldsGrid is the container every group of field rows renders into — the
// top-level form and each nested object/map. In inline mode it owns the single
// 2-column track definition: `fit-content(labelMaxWidth)` for the label column,
// `minmax(0, valueMaxWidth)` for the value column. Every field row is a
// `subgrid` that inherits these tracks, so all labels share one column width and
// every value lines up — a real form grid, not per-row independent grids.
// (`fit-content()` is the only valid CSS for "size to content, clamped to a max"
// — `min(w, max-content)` is rejected by the browser, which silently drops the
// whole declaration and collapses every row to a stacked-looking column. The
// template is an inline style because Tailwind can't interpolate runtime widths.)
// Stacked mode is a plain single-column grid.
export function FieldsGrid({
  layout,
  size,
  columns,
  columnMinWidth,
  columnsMaxWidth,
  className,
  children,
}: {
  layout: FormLayout;
  size: FormSize;
  // Object-level `x-columns`: split a stacked object into N equal columns, or
  // "auto" to fit as many `columnMinWidth`-wide columns as the container allows.
  // Fields span one column unless they set `x-col-span`. Ignored in inline mode
  // (which owns its own 2-track label/value layout).
  columns?: GridColumns;
  // `x-columns: "auto"` only: the minmax() floor for one column, and an optional
  // cap on the whole grid so controls don't stretch edge to edge on a wide
  // screen. CSS lengths, applied inline — a runtime width can't be a Tailwind
  // arbitrary class, because the scanner never sees it.
  columnMinWidth?: string;
  columnsMaxWidth?: string;
  // Object-level `x-classes`: extra classes merged onto the grid container
  // (e.g. `gap-2`, padding). Applied last so a standard utility wins over the
  // defaults via tailwind-merge.
  className?: string;
  children: ReactNode;
}) {
  if (layout.mode === "inline") {
    const labelMaxWidth = layout.labelMaxWidth ?? "40ch";
    const valueMaxWidth = layout.valueMaxWidth ?? "600px";
    return (
      <div
        className={cn("grid", inlineRowGapClass[size], className)}
        style={{ gridTemplateColumns: `fit-content(${labelMaxWidth}) minmax(0, ${valueMaxWidth})` }}
      >
        {children}
      </div>
    );
  }
  if (columns === "auto") {
    return (
      <div
        className={cn("grid gap-x-4", stackedRowGapClass[size], className)}
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${columnMinWidth ?? DEFAULT_COLUMN_MIN_WIDTH}, 1fr))`,
          ...(columnsMaxWidth ? { maxWidth: columnsMaxWidth } : {}),
        }}
      >
        {children}
      </div>
    );
  }
  if (columns && columns > 1) {
    return (
      <div
        className={cn("grid gap-x-3", stackedRowGapClass[size], className)}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    );
  }
  return <div className={cn("grid", stackedRowGapClass[size], className)}>{children}</div>;
}

// FieldWrapper lays out a single label + value (+ helper/error). In inline mode
// it is a `subgrid` row spanning the parent FieldsGrid's two columns, so its
// label and value snap to the shared label/value tracks (helper/error sit under
// the value column). In stacked mode the label sits tight above its control as
// one unit, capped at valueMaxWidth so controls don't stretch edge to edge.
export function FieldWrapper({
  label,
  value,
  helper,
  error,
  layout,
  size,
  maxWidth,
}: {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  layout: FormLayout;
  size: FormSize;
  // Overrides the stacked value-width cap. A field spanning the full row of a
  // multi-column grid passes "none", so it actually fills the row it was given
  // instead of stopping at the shared 600px cap.
  maxWidth?: string;
}) {
  if (layout.mode === "inline") {
    return (
      <div className="col-span-2 grid grid-cols-subgrid items-start gap-x-3 gap-y-0.5">
        <div className={cn("flex min-w-0 items-center", controlMinHeightClass[size])}>{label}</div>
        <div className="min-w-0">{value}</div>
        {helper && <p className="col-start-2 text-xs text-muted-foreground">{helper}</p>}
        {error && <p className="col-start-2 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
  return (
    <div
      className="flex w-full flex-col gap-1"
      style={{ maxWidth: maxWidth ?? layout.valueMaxWidth ?? "600px" }}
    >
      {label}
      {value}
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function FieldLabel({
  field,
  fieldId,
  size,
  helpDisplay,
}: {
  field: FieldControl;
  fieldId: string;
  size: FormSize;
  // When "hover", the description rides on the label as a `?` instead of being
  // rendered as a paragraph under the control by FieldWrapper.
  helpDisplay?: HelpDisplay;
}) {
  return (
    <label
      htmlFor={fieldId}
      className={cn("flex min-w-0 items-center gap-2 font-medium", labelSizeClass[size], field.labelClassName)}
    >
      <LabelIcon icon={field.labelIcon} className="shrink-0 text-[15px] text-muted-foreground" />
      <span className="truncate" title={field.label !== field.key ? field.key : undefined}>
        {field.label}
      </span>
      {field.required && <span className="shrink-0 text-destructive">*</span>}
      {field.badge && (
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {field.badge}
        </span>
      )}
      {helpDisplay === "hover" && field.helper && (
        <HelpHint label={field.label} helper={field.helper} />
      )}
    </label>
  );
}

// HelpHint is the `?` affordance that replaces a permanent description
// paragraph. HoverCard opens on focus as well as hover, so the text stays
// reachable from the keyboard rather than being mouse-only.
export function HelpHint({ label, helper }: { label: string; helper: string }) {
  return (
    <HoverCard
      placement="top"
      trigger={
        <button
          type="button"
          aria-label={`About ${label}`}
          className="shrink-0 cursor-help text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon icon={UiQuestion} className="text-sm" />
        </button>
      }
      cardClassName="max-w-xs whitespace-normal text-left text-xs font-normal text-foreground"
    >
      {helper}
    </HoverCard>
  );
}

// ObjectSection renders a nested object as a labelled section: a header row
// (the field label + required/badge) above its fields, which fill the full
// width below. It replaces the inline label + bordered box so nested objects
// read as flat, headed groups rather than indented sub-forms. `col-span-full`
// makes it span both tracks of an inline FieldsGrid (full width, not crammed
// into the value column); in a stacked single-column grid it is a no-op.
export function ObjectSection({
  label,
  required,
  size,
  badge,
  helper,
  labelIcon,
  helpDisplay,
  children,
}: {
  label: string;
  required: boolean;
  size: FormSize;
  badge?: string;
  helper?: string;
  labelIcon?: LabelIconSpec;
  helpDisplay?: HelpDisplay;
  children: ReactNode;
}) {
  const hoverHelp = helpDisplay === "hover" && !!helper;
  return (
    <div className={cn("col-span-full flex min-w-0 max-w-full flex-col", fieldInnerGapClass[size])}>
      <div className={cn("flex min-w-0 items-center gap-2 border-b border-border pb-1 font-semibold", labelSizeClass[size])}>
        <LabelIcon icon={labelIcon} className="shrink-0 text-[15px] text-muted-foreground" />
        <span className="min-w-0 truncate">{label}</span>
        {required && <span className="shrink-0 text-destructive">*</span>}
        {badge && (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {badge}
          </span>
        )}
        {hoverHelp && helper && <HelpHint label={label} helper={helper} />}
      </div>
      {helper && !hoverHelp && (
        <p className="min-w-0 break-words text-xs text-muted-foreground">{helper}</p>
      )}
      {children}
    </div>
  );
}
