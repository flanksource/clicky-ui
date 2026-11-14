import { createElementSelector } from "./create-element-selector.js";

export type GrabContextEntry = { selector: string; attributes: Record<string, string> };
export type GrabContext = { page: GrabContextEntry[]; elements: GrabContextEntry[] };

function attributes(element: Element): Record<string, string> {
  return Object.fromEntries([...element.attributes]
    .filter(attribute => attribute.name.startsWith("data-grab-") && attribute.name.length > "data-grab-".length)
    .map(attribute => [attribute.name.slice("data-grab-".length), attribute.value]));
}

export function getGrabContext(element: Element): GrabContext {
  const document = element.ownerDocument;
  const context: GrabContext = { page: [], elements: [] };
  for (const root of [document.documentElement, document.body]) {
    if (!root) continue;
    const values = attributes(root);
    if (Object.keys(values).length) context.page.push({ selector: root.tagName.toLowerCase(), attributes: values });
  }
  for (let current: Element | null = element; current && current !== document.documentElement && current !== document.body;) {
    const values = attributes(current);
    if (Object.keys(values).length) context.elements.unshift({ selector: createElementSelector(current), attributes: values });
    const root = current.getRootNode();
    current = current.parentElement ?? (root.nodeType === 11 && "host" in root ? root.host as Element : null);
  }
  return context;
}

export function formatGrabContext(context: GrabContext): string {
  return ([ ["Page context", context.page], ["Element context", context.elements] ] as const)
    .filter(([, entries]) => entries.length)
    .map(([label, entries]) => `## ${label}\n\n${entries.map(entry => `${entry.selector}\n${Object.entries(entry.attributes).map(([key, value]) => `- **${key}:** ${value}`).join("\n")}`).join("\n\n")}`)
    .join("\n\n");
}
