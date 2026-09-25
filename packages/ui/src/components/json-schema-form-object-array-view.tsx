import { useState } from "react";
import { UiCheck, UiDotsVertical } from "../icons";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { AccordionArray } from "./json-schema-form-accordion-array";
import { arrayViewOptions, defaultArrayView, type ArrayView } from "./json-schema-form-array-view";
import { TableArray } from "./json-schema-form-table-array";
import type { FieldControl, RenderContext } from "./json-schema-form-types";

const VIEW_LABELS: Record<ArrayView, string> = {
  grid: "Grid",
  stack: "Stack form",
  inline: "Inline form",
};

const VIEWS: ArrayView[] = ["grid", "stack", "inline"];

// ObjectArrayView renders an object-item array in the view it opens in (see
// defaultArrayView) and lets the author switch it: the grid is TableArray, and
// both item forms are AccordionArray, with each item's fields stacked under
// their labels or labelled inline. The value is the array's own, so an edit
// made in one view is there in the next. A presentation preview keeps the
// default view and shows no menu: it is a read-only summary, not an editor.
export function ObjectArrayView({
  field,
  ctx,
  readOnly,
}: {
  field: FieldControl;
  ctx: RenderContext;
  readOnly: boolean;
}) {
  const [view, setView] = useState<ArrayView>(() => defaultArrayView(field, arrayViewOptions(field, ctx)));
  const toolbar = ctx.presentation ? undefined : (
    <ArrayViewMenu label={field.label || field.key} view={view} onChange={setView} />
  );
  if (view === "grid") {
    return <TableArray field={field} ctx={ctx} readOnly={readOnly} {...(toolbar ? { toolbar } : {})} />;
  }
  const itemCtx: RenderContext = {
    ...ctx,
    layout: { ...ctx.layout, mode: view === "stack" ? "stacked" : "inline" },
  };
  return <AccordionArray field={field} ctx={itemCtx} readOnly={readOnly} {...(toolbar ? { toolbar } : {})} />;
}

// ArrayViewMenu is the ⋮ view switch on an object array's summary line.
export function ArrayViewMenu({
  label,
  view,
  onChange,
}: {
  /** Names the array in the trigger's accessible label. */
  label: string;
  view: ArrayView;
  onChange: (next: ArrayView) => void;
}) {
  const title = `View options for ${label}`;
  return (
    <DropdownMenu
      icon={UiDotsVertical}
      hideChevron
      variant="ghost"
      size="icon"
      align="right"
      title={title}
      menuLabel={title}
      items={VIEWS.map((option) => ({
        label:
          option === view ? (
            <>
              {VIEW_LABELS[option]}
              <span className="sr-only"> (current view)</span>
            </>
          ) : (
            VIEW_LABELS[option]
          ),
        onSelect: () => onChange(option),
        ...(option === view ? { icon: UiCheck } : {}),
      }))}
    />
  );
}
