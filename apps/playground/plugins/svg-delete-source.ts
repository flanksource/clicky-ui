import ts from "typescript";
import { isSvgEditableTag } from "../src/visual-edit/svg-schemas";
import { editableOpeningNodes, parseTsx } from "./editable-jsx";
import { validSource } from "./reviewable-source";
import type { VisualEdited } from "./visual-edit-source";

export function deleteSvgElement(source: string, ordinal: number): VisualEdited {
  const file = parseTsx(source, "page.tsx");
  const opening = editableOpeningNodes(file)[ordinal];
  if (!opening || !isSvgEditableTag(opening.tag)) throw new Error("Deletion requires an editable SVG element");
  const node = ts.isJsxOpeningElement(opening.node) ? opening.node.parent : opening.node;
  const replacement = ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent) ? "" : "null";
  let start = node.getStart(file);
  let end = node.end;
  const lineStart = source.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = source.indexOf("\n", end);
  if (replacement === "" && lineEnd !== -1 && source.slice(lineStart, start).trim() === "" && source.slice(end, lineEnd).trim() === "") {
    start = lineStart;
    end = lineEnd + 1;
  }
  return {
    status: "edited",
    source: validSource(`${source.slice(0, start)}${replacement}${source.slice(end)}`),
    line: opening.line,
    column: opening.column,
  };
}
