import type { ToolMeta } from "../chat/types";

/** Splits a tool name / operation id into human words, handling snake_case,
 *  kebab-case, dotted, and camelCase identifiers alike. */
function toolNameSegments(name: string): string[] {
  return name
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .split(/[\s._/:-]+/)
    .filter(Boolean);
}

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** The humanized parent path of a tool — e.g. `xero_transactions_split` →
 *  "Xero Transactions". Used to disambiguate short action labels ("Split",
 *  "Void") in a flat tool list.
 *
 *  Returns undefined when the name has no parent segment, or when the label
 *  already carries the immediate parent word (so we never render a redundant
 *  prefix like "Accounts" in front of "List Xero accounts"). */
export function toolParentLabel(tool: ToolMeta): string | undefined {
  const segments = toolNameSegments(tool.name);
  if (segments.length < 2) return undefined;
  const parentSegments = segments.slice(0, -1);
  const immediateParent = parentSegments[parentSegments.length - 1] ?? "";
  const label = (tool.label ?? "").trim();
  if (!label || label.toLowerCase().includes(immediateParent.toLowerCase())) {
    return undefined;
  }
  return parentSegments.map(titleCase).join(" ");
}
