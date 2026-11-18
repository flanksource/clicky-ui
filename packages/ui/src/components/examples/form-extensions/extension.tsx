import type { ReactNode } from "react";
import {
  defineFormExtension,
  type BuiltFieldRow,
  type FieldOption,
  type FieldTypeProps,
} from "@flanksource/clicky-ui/components";

// This module is written the way a downstream author would write one: it imports
// only the public entry, so the same file loads as a plain module (Storybook, the
// unit test) and as a runtime-compiled ref inside a page-runtime frame. Its one
// export is the extension, so the renderers are lowerCamel render functions
// mounted by the form rather than exported components.

const TEAM: FieldOption[] = [
  { value: "ada", label: "Ada Lovelace" },
  { value: "grace", label: "Grace Hopper" },
  { value: "linus", label: "Linus Torvalds" },
];

// format "color": the swatches come from the field's own `examples`.
function colorSwatches({ field, value, onChange, fieldId, readOnly }: FieldTypeProps) {
  const swatches = (field.schema.examples ?? []).filter((example): example is string => typeof example === "string");
  return (
    <div id={fieldId} role="radiogroup" aria-label={field.label} data-example-color className="flex items-center gap-2">
      {swatches.map((swatch) => (
        <button
          key={swatch}
          type="button"
          role="radio"
          aria-checked={value === swatch}
          aria-label={swatch}
          disabled={readOnly}
          onClick={() => onChange(swatch)}
          style={{ backgroundColor: swatch }}
          className={
            value === swatch
              ? "size-6 rounded-full ring-2 ring-foreground ring-offset-2 ring-offset-background"
              : "size-6 rounded-full border border-border"
          }
        />
      ))}
    </div>
  );
}

// format "stepper": minus/plus bounded by the field's minimum/maximum, moving by multipleOf.
function stepper({ field, value, onChange, fieldId, readOnly }: FieldTypeProps) {
  const { minimum, maximum, multipleOf } = field.schema;
  const step = multipleOf ?? 1;
  const current = typeof value === "number" ? value : (minimum ?? 0);
  const clamp = (next: number) => Math.min(maximum ?? next, Math.max(minimum ?? next, next));
  return (
    <div id={fieldId} role="group" aria-label={field.label} data-example-stepper className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease"
        disabled={readOnly || (minimum !== undefined && current <= minimum)}
        onClick={() => onChange(clamp(current - step))}
        className="size-7 rounded-md border border-input bg-background text-sm disabled:opacity-50"
      >
        −
      </button>
      <output aria-label={`${field.label} value`} className="min-w-8 text-center text-sm tabular-nums">
        {current}
      </output>
      <button
        type="button"
        aria-label="Increase"
        disabled={readOnly || (maximum !== undefined && current >= maximum)}
        onClick={() => onChange(clamp(current + step))}
        className="size-7 rounded-md border border-input bg-background text-sm disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}

const messages = (row: BuiltFieldRow) =>
  row.messages.map((message, index) => (
    <p key={index} className="text-xs text-destructive">
      {message.message}
    </p>
  ));

// layout.mode "cards": every row is a card in a two-column grid.
const cardGrid = ({ children }: { children: ReactNode }) => (
  <div data-example-cards className="grid gap-3 md:grid-cols-2">
    {children}
  </div>
);

const card = (row: BuiltFieldRow) => (
  <section data-example-card={row.field.key} className="col-span-full flex flex-col gap-2 rounded-md border border-border bg-card p-3 md:col-span-1">
    <div className="text-sm font-medium">{row.label}</div>
    {row.value}
    {messages(row)}
  </section>
);

// x-layout "chips": one field's row as a dashed, pill-bordered group.
const chipGrid = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap gap-2">{children}</div>;

const chipRow = (row: BuiltFieldRow) => (
  <div data-example-chips={row.field.key} className="col-span-full flex flex-col gap-1 rounded-2xl border border-dashed border-border p-3">
    <div className="text-sm font-medium">{row.label}</div>
    {row.value}
    {messages(row)}
  </div>
);

const extension = defineFormExtension({
  name: "example",
  formats: { color: colorSwatches, stepper },
  lookups: {
    "ext:team-members": async ({ query }) =>
      TEAM.filter((member) => member.label.toLowerCase().includes(query.toLowerCase())),
  },
  layouts: {
    cards: { Grid: cardGrid, Row: card },
    chips: { Grid: chipGrid, Row: chipRow },
  },
  slots: {
    Title: ({ title }) => (
      <h2 data-example-title className="text-lg font-semibold">
        {title}
      </h2>
    ),
  },
  pre: [(field) => (field.key === "name" ? { ...field, badge: "id" } : field)],
  post: [
    (field, nodes) =>
      field.format === "color"
        ? {
            ...nodes,
            label: (
              <>
                {nodes.label}
                <span data-example-color-mark aria-hidden>
                  ●
                </span>
              </>
            ),
          }
        : nodes,
  ],
});

export default extension;
