import type { MdxEditorJsxAttribute } from "./mdx-editor-options";

/**
 * Reading and writing the string attributes of an authored JSX block.
 *
 * Every node editor needs the same two operations, and getting either subtly
 * wrong loses an attribute on save — which for a block whose attributes decide
 * what publishes is a silent, consequential defect. They live here so a
 * consuming application registering a block of its own reuses them rather than
 * writing a second copy.
 */

/**
 * The string values of the named attributes.
 *
 * A bare attribute (`emphasis` with no `=`) parses with a null value and means
 * "true" in JSX. Expression attributes (`prop={expr}`) carry an object rather
 * than a string and are skipped — reading one as a value would hand the
 * renderer something it has to reject.
 */
export function readJsxAttributes<Name extends string>(
  attributes: readonly MdxEditorJsxAttribute[] | undefined,
  names: readonly Name[],
): Partial<Record<Name, string>> {
  const read: Partial<Record<Name, string>> = {};
  for (const attribute of attributes ?? []) {
    if (attribute.type !== "mdxJsxAttribute") continue;
    const name = attribute.name;
    if (!name || !(names as readonly string[]).includes(name)) continue;
    if (typeof attribute.value === "string") read[name as Name] = attribute.value;
    else if (attribute.value === null || attribute.value === undefined) read[name as Name] = "true";
  }
  return read;
}

/**
 * The attribute list with one value replaced.
 *
 * An empty value removes the attribute rather than writing `name=""` — an empty
 * string is not a valid value for any of the enumerations these blocks carry,
 * and leaving one behind would make the renderer throw on a block the author
 * had merely cleared.
 */
export function writeJsxAttribute(
  attributes: readonly MdxEditorJsxAttribute[] | undefined,
  name: string,
  value: string,
): MdxEditorJsxAttribute[] {
  const others = (attributes ?? []).filter(
    (attribute) => !(attribute.type === "mdxJsxAttribute" && attribute.name === name),
  );
  if (value === "") return others;
  return [...others, { type: "mdxJsxAttribute", name, value }];
}
