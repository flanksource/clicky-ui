/**
 * The object-array pattern's rendering, as one component every page shares.
 *
 * `flanksource/patterns/object-arrays` is the page that settled this — variant B
 * from the object-array defaults study — and a consumer "uses the pattern" only
 * if it renders through the same code path rather than re-deriving the same four
 * props. The schema is the caller's; the frame, the layout and the preferences
 * menu are the pattern's.
 */

import { useState } from "react";
import {
  JsonSchemaForm,
  Panel,
  type FormLayout,
  type JsonSchemaObject,
  type PreExtension,
} from "@flanksource/clicky-ui";

/** Stacked bodies under collapsed rows: the collapsed list is what carries density. */
export const OBJECT_ARRAY_LAYOUT: FormLayout = { mode: "stacked" };

type Common = {
  schema: JsonSchemaObject;
  idPrefix: string;
  /** Only for pages comparing help treatments; the pattern's own default is stacked. */
  layout?: FormLayout;
  /**
   * Row content the schema cannot express — `JsonSchemaForm`'s own `pre` seam,
   * forwarded rather than withheld. `x-item` reads top-level scalars only, so a
   * row that has to name something nested has no declarative form; without this
   * the consumer's only way out is to stop using the pattern and hand-roll its
   * own JsonSchemaForm, which is the outcome this component exists to prevent.
   */
  pre?: PreExtension[];
};

/**
 * Uncontrolled by default, because a specimen owns nothing worth lifting.
 * A page that derives anything from the edits — a progress line, a second
 * surface rendering the same rows — passes `value`/`onChange` instead.
 */
type Owned = { initial: Record<string, unknown>; value?: never; onChange?: never };
type Controlled = {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  initial?: never;
};

export function ObjectArrayEditor({
  schema,
  idPrefix,
  layout = OBJECT_ARRAY_LAYOUT,
  pre,
  ...owner
}: Common & (Owned | Controlled)) {
  const [inner, setInner] = useState<Record<string, unknown>>(() => owner.initial ?? {});
  const controlled = owner.value !== undefined;
  const value = controlled ? owner.value : inner;

  return (
    <Panel padded>
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={(next) => (controlled ? owner.onChange?.(next) : setInner(next))}
        layout={layout}
        showPreferencesMenu={false}
        idPrefix={idPrefix}
        {...(pre ? { pre } : {})}
      />
    </Panel>
  );
}
