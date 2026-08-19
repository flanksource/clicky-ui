import { CALLOUT_TONES, CALLOUT_VARIANTS } from "../data/callout-tones";
import { readJsxAttributes } from "./mdx-editor-jsx-attributes";
import type { MdxEditorJsxAttribute } from "./mdx-editor-options";

/** The attributes a callout carries, in the order the control strip presents them. */
export const CALLOUT_ATTRIBUTES = [
  "variant",
  "icon",
  "title",
  "label",
  "badge",
  "source",
  "emphasis",
] as const;

export type CalloutAttribute = (typeof CALLOUT_ATTRIBUTES)[number];

/** The descriptor `props` list, matching {@link CALLOUT_ATTRIBUTES}. */
export const CALLOUT_JSX_PROPS = CALLOUT_ATTRIBUTES.map((name) => ({ name, type: "string" as const }));

/** The choices each enumerated attribute offers, for the node editor's selects. */
export const CALLOUT_ATTRIBUTE_OPTIONS: Partial<Record<CalloutAttribute, readonly string[]>> = {
  variant: CALLOUT_VARIANTS,
  icon: CALLOUT_TONES,
};

/** The callout's attributes, read from the mdast node. */
export function readCalloutAttributes(
  attributes: readonly MdxEditorJsxAttribute[] | undefined,
): Partial<Record<CalloutAttribute, string>> {
  return readJsxAttributes(attributes, CALLOUT_ATTRIBUTES);
}
