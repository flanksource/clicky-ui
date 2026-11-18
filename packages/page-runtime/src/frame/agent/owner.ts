import { parseStack } from "bippy/source";
import { getFiberFromHostInstance } from "bippy";
import { isPageSource, validateDocumentSource } from "../../host/agent-source.ts";
import type { AgentSourceContext } from "../../schema.ts";

export type OwnerFiber = {
  _debugSource?: { fileName: string; lineNumber: number; columnNumber?: number } | null;
  _debugOwner?: OwnerFiber | null;
  return?: OwnerFiber | null;
  _debugStack?: Error | null;
  stateNode?: Node | { containerInfo: Node } | null;
};

export function isPageElement(options: { element: Element; root: Element; fiber?: OwnerFiber | null }): boolean {
  if (!options.element.isConnected || options.element.ownerDocument !== options.root.ownerDocument) return false;
  for (let element: Element | null = options.element; element; ) {
    if (element.closest("[data-page-agent],[data-react-grab],[data-react-grab-ignore]")) return false;
    const tree = element.getRootNode();
    element = tree instanceof ShadowRoot ? tree.host : null;
  }
  if (options.root.contains(options.element)) return true;
  const visited = new Set<OwnerFiber>();
  for (let fiber: OwnerFiber | null | undefined = options.fiber === undefined ? getFiberFromHostInstance(options.element) : options.fiber; fiber && !visited.has(fiber); fiber = fiber.return) {
    visited.add(fiber);
    const node = fiber.stateNode;
    if (node instanceof Node && options.root.contains(node)) return true;
    if (node && "containerInfo" in node && node.containerInfo === options.root) return true;
  }
  return false;
}

export function resolvePageOwner(options: { element: Element; root: Element; componentName: string | null; fiber: OwnerFiber | null; sourceContext?: AgentSourceContext }) {
  if (!isPageElement(options)) throw new Error("picker selected outside the page root");
  if (options.sourceContext) {
    validateDocumentSource(options.sourceContext.url);
    return { element: options.element, source: options.sourceContext.url, componentName: options.componentName ?? options.element.tagName.toLowerCase() };
  }
  for (let element: Element | null = options.element; element && isPageElement({ element, root: options.root }); element = element.parentElement) {
    const source = element.getAttribute("data-source");
    if (source && isPageSource(source)) return { element, source, componentName: options.componentName ?? element.tagName.toLowerCase() };
  }
  const pending = [options.fiber];
  const visited = new Set<OwnerFiber>();
  while (pending.length) {
    const fiber = pending.shift();
    if (!fiber || visited.has(fiber)) continue;
    visited.add(fiber);
    const source = fiber._debugSource;
    const location = source ? `${source.fileName}:${source.lineNumber}:${source.columnNumber}` : "";
    if (isPageSource(location)) return { element: options.element, source: location, componentName: options.componentName ?? options.element.tagName.toLowerCase() };
    if (fiber._debugStack?.stack) {
      const frame = parseStack(fiber._debugStack.stack).find((frame) => isPageSource(`${frame.fileName}:${frame.lineNumber}:${frame.columnNumber}`));
      if (frame) return { element: options.element, source: `${frame.fileName}:${frame.lineNumber}:${frame.columnNumber}`, componentName: options.componentName ?? options.element.tagName.toLowerCase() };
    }
    pending.push(fiber._debugOwner ?? null, fiber.return ?? null);
  }
  throw new Error("picker could not resolve a page source location for the selected element");
}
