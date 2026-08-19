import { createElement, type ComponentType, type ReactNode } from "react";
import { CalloutJsxEditor, InsertCalloutButton } from "./MdxEditorCallout";
import { CALLOUT_JSX_PROPS } from "./mdx-editor-callout-model";
import type {
  MdxEditorCalloutOptions,
  MdxEditorJsxComponentDescriptor,
  MdxEditorJsxEditorProps,
  MdxEditorRuntime,
} from "./mdx-editor-options";

/**
 * The tag a callout is authored as.
 *
 * A JSX descriptor is keyed on the tag name and the name travels back out on
 * save, so this is the one string that has to agree with whatever the document
 * corpus already contains.
 */
export const CALLOUT_JSX_NAME = "CalloutBox";

/**
 * Bound components are cached per MDXEditor module.
 *
 * A descriptor's `Editor` and a toolbar entry are component *types*. Rebuilding
 * them on every render gives React a new type each time, which unmounts and
 * remounts every callout node in the document — losing focus and selection
 * mid-keystroke.
 */
const editorCache = new WeakMap<MdxEditorRuntime, ComponentType<MdxEditorJsxEditorProps>>();
const buttonCache = new WeakMap<MdxEditorRuntime, Map<string, () => ReactNode>>();

function boundCalloutEditor(mdx: MdxEditorRuntime): ComponentType<MdxEditorJsxEditorProps> {
  const cached = editorCache.get(mdx);
  if (cached) return cached;
  const bound = ({ mdastNode }: MdxEditorJsxEditorProps) =>
    createElement(CalloutJsxEditor, { mdastNode, mdx });
  editorCache.set(mdx, bound);
  return bound;
}

/**
 * A toolbar button inserting an empty note callout at the cursor.
 *
 * Takes the MDXEditor module rather than importing it, for the same reason as
 * {@link calloutJsxDescriptor}.
 */
export function calloutToolbarButton(
  mdx: MdxEditorRuntime,
  options: MdxEditorCalloutOptions = {},
): () => ReactNode {
  const name = options.name ?? CALLOUT_JSX_NAME;
  const byName = buttonCache.get(mdx) ?? new Map<string, () => ReactNode>();
  buttonCache.set(mdx, byName);
  const cached = byName.get(name);
  if (cached) return cached;
  const bound = () => createElement(InsertCalloutButton, { mdx, name });
  byName.set(name, bound);
  return bound;
}

/**
 * A descriptor registering `<CalloutBox>` with a real node editor.
 *
 * Takes the MDXEditor module rather than importing it, matching
 * `createMdxEditorPlugins` — `@mdxeditor/editor` is an optional peer dependency
 * and importing it here would make it mandatory for anyone who touches this
 * entry point.
 */
export function calloutJsxDescriptor(
  mdx: MdxEditorRuntime,
  options: MdxEditorCalloutOptions = {},
): MdxEditorJsxComponentDescriptor {
  return {
    name: options.name ?? CALLOUT_JSX_NAME,
    kind: "flow",
    ...(options.source ? { source: options.source } : {}),
    props: CALLOUT_JSX_PROPS,
    hasChildren: true,
    Editor: boundCalloutEditor(mdx),
  };
}
