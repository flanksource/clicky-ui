import type { AgentFrameMessage, AgentSelection, DesignHostMessage, JsonValue } from "../../schema.ts";
import { parseEditableSource } from "../../markers.ts";
import { isPageSource } from "../../host/agent-source.ts";
import { fiberOf, overrideCallSite, readCallSiteProps } from "./react-override.ts";

export function resolveDesignTarget(options: { element: Element; root: Element }): { element: Element; source: string } {
  for (let element: Element | null = options.element; element && options.root.contains(element); element = element.parentElement) {
    const source = element.getAttribute("data-source");
    if (source?.includes("#") && isPageSource(source)) { parseEditableSource(source); return { element, source }; }
  }
  for (let fiber: ReturnType<typeof fiberOf> | null = fiberOf(options.element); fiber; fiber = fiber.return) {
    const source = fiber.memoizedProps?.["data-source"];
    if (typeof source === "string" && source.includes("#") && isPageSource(source)) { parseEditableSource(source); return { element: options.element, source }; }
  }
  throw new Error("Design selection has no editable page call site");
}

// The panel receives scalar authored props, not React children, event handlers or renderer internals.
function panelProps(props: Record<string, unknown>): Record<string, JsonValue> {
  return Object.fromEntries(Object.entries(props).filter(([name, value]) => name !== "data-source" && !name.startsWith("on") && (value === null || typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))))) as Record<string, JsonValue>;
}

export function createDesignAgent(options: { root: HTMLElement; page: string; send: (message: AgentFrameMessage) => void }) {
  let selected: { node: Element; source: string } | undefined;
  const pending = new Set<string>();
  function nodes(source: string): Element[] {
    if (!selected || selected.source !== source || !options.root.contains(selected.node)) throw new Error("Design request does not match the live selection");
    return [...new Set([selected.node, ...[...options.root.querySelectorAll("[data-source]")].filter((node) => node.getAttribute("data-source") === source)])];
  }
  return {
    select(target: { element: Element; source: string }, selection: AgentSelection) {
      const props = panelProps(readCallSiteProps({ node: target.element, source: target.source }));
      selected = { node: target.element, source: target.source };
      options.send({ type: "design-selection", selection, source: target.source, props });
    },
    receive(message: DesignHostMessage) {
      if (message.type === "design-write-result") {
        if (!pending.delete(message.requestId)) throw new Error(`unexpected Design write result ${message.requestId}`);
        options.send(message); return;
      }
      if (message.type === "design-override") {
        try {
          overrideCallSite({ nodes: nodes(message.source), source: message.source, props: Object.fromEntries(Object.entries(message.props).map(([name, value]) => [name, value === null ? undefined : value])) });
          options.send({ type: "design-override-result", requestId: message.requestId, source: message.source, ok: true });
        } catch (error) { options.send({ type: "design-override-result", requestId: message.requestId, source: message.source, ok: false, error: error instanceof Error ? error.message : String(error) }); }
        return;
      }
      nodes(message.source);
      if (pending.has(message.requestId)) throw new Error(`duplicate Design write ${message.requestId}`);
      pending.add(message.requestId);
      options.send({ type: "design-write-request", requestId: message.requestId, request: { page: message.page, source: message.source, edit: message.edit, ...(message.choose === undefined ? {} : { choose: message.choose }) } });
    },
    dispose() { selected = undefined; pending.clear(); },
  };
}
