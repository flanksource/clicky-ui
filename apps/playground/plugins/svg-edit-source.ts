import { setAttributes, setText, type SetTextOutcome } from "./visual-edit-source";
import ts from "typescript";
import { editableOpeningNodes, parseTsx } from "./editable-jsx";

export function setSvgAttributes({ files, callSiteFile, ordinal, values, choose, textFrom }: {
  files: ReadonlyMap<string, string>;
  callSiteFile: string;
  ordinal: number;
  values: Record<string, string | number | null>;
  choose?: string;
  textFrom?: string;
}): { outcome: SetTextOutcome; patches: Map<string, string> } {
  const source = files.get(callSiteFile);
  if (source === undefined) throw new Error(`Missing call-site source ${callSiteFile}`);
  const direct = setAttributes(source, ordinal, values);
  const patches = new Map<string, string>();
  if (direct.status === "edited") {
    patches.set(callSiteFile, direct.source);
    return { outcome: { ...direct, file: callSiteFile }, patches };
  }
  if (direct.attribute !== "children" || direct.reason !== "computed" || typeof values.children !== "string") {
    return { outcome: { ...direct, file: callSiteFile }, patches };
  }
  const opening = editableOpeningNodes(parseTsx(source, callSiteFile))[ordinal];
  if (!opening || !ts.isJsxElement(opening.node.parent) || opening.node.parent.children.some(child => ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) || textFrom === undefined) {
    return { outcome: { ...direct, file: callSiteFile }, patches };
  }
  const text = setText({ files, callSiteFile, ordinal, prop: "children", from: textFrom, to: values.children, ...(choose === undefined ? {} : { choose }) });
  if (text.status !== "edited") return { outcome: text, patches };
  patches.set(text.file, text.source);
  const attributes = Object.fromEntries(Object.entries(values).filter(([name]) => name !== "children"));
  if (Object.keys(attributes).length) {
    const updated = setAttributes(patches.get(callSiteFile) ?? source, ordinal, attributes);
    if (updated.status === "refused" && updated.reason !== "unchanged") return { outcome: { ...updated, file: callSiteFile }, patches: new Map() };
    if (updated.status === "edited") patches.set(callSiteFile, updated.source);
  }
  return { outcome: text, patches };
}
