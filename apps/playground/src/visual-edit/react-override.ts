import { EDITABLE_SOURCE_ATTRIBUTE } from "../../plugins/editable-source-marker";

type Fiber = {
  tag: number;
  type: unknown;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
  stateNode: unknown;
  memoizedProps: Record<string, unknown> | null;
};

const HOST_ROOT_TAG = 3;

type DevToolsRenderer = { overrideProps: (fiber: Fiber, path: Array<string | number>, value: unknown) => void };

type DevToolsHook = { renderers?: Map<number, Partial<DevToolsRenderer>> };

export type LiveOverrideSupport = { supported: true } | { supported: false; reason: string };

function devToolsHook(): DevToolsHook | undefined {
  return (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: DevToolsHook }).__REACT_DEVTOOLS_GLOBAL_HOOK__;
}

function findRenderer(): { renderer: DevToolsRenderer } | { reason: string } {
  const hook = devToolsHook();
  if (!hook?.renderers) {
    return {
      reason:
        "no React DevTools hook is installed; the playground-react-devtools-hook <head> script must run before react-dom is evaluated",
    };
  }
  if (hook.renderers.size === 0) {
    return { reason: "the React DevTools hook has no registered renderer; react-dom loaded before the hook" };
  }
  for (const renderer of hook.renderers.values()) {
    if (typeof renderer.overrideProps === "function") return { renderer: renderer as DevToolsRenderer };
  }
  return { reason: "react-dom is a production build without overrideProps; the playground must compile React's development build" };
}

export function liveOverrideSupport(): LiveOverrideSupport {
  const found = findRenderer();
  return "renderer" in found ? { supported: true } : { supported: false, reason: found.reason };
}

/**
 * Which of `fiber` and its alternate is committed. DOM nodes and `.return` chains can point at the
 * stale buffer, and overrideProps copies the given fiber's memoizedProps — a stale one resurrects
 * props from an earlier override. Only the root's current tree, walked down by child/sibling, is
 * reliably committed.
 */
function currentFiber(fiber: Fiber): Fiber {
  if (!fiber.alternate) return fiber;
  let top: Fiber = fiber;
  while (top.return) top = top.return;
  if (top.tag !== HOST_ROOT_TAG) throw new Error("fiber is detached from its React root");
  const stack: Fiber[] = [(top.stateNode as { current: Fiber }).current];
  for (let next = stack.pop(); next; next = stack.pop()) {
    if (next === fiber || next === fiber.alternate) return next;
    if (next.sibling) stack.push(next.sibling);
    if (next.child) stack.push(next.child);
  }
  throw new Error("fiber is not in the committed React tree");
}

function fiberOf(node: Element): Fiber {
  const key = Object.keys(node).find((name) => name.startsWith("__reactFiber$"));
  if (!key) throw new Error(`<${node.localName}> has no React fiber; it was not rendered by React`);
  return (node as unknown as Record<string, Fiber>)[key] as Fiber;
}

function isComposite(fiber: Fiber): boolean {
  return typeof fiber.type === "function" || (typeof fiber.type === "object" && fiber.type !== null);
}

function isHost(fiber: Fiber): boolean {
  return typeof fiber.type === "string";
}

/**
 * The topmost fiber whose props carry this marker: the call-site element, not the component it renders.
 * An intrinsic element written directly in a page (an SVG `<rect>`) has no component above it, so its
 * own host fiber is the call site.
 */
function callSiteFiber(node: Element, markerValue: string): Fiber {
  let match: Fiber | null = null;
  for (let fiber: Fiber | null = fiberOf(node); fiber; fiber = fiber.return) {
    if ((isComposite(fiber) || isHost(fiber)) && fiber.memoizedProps?.[EDITABLE_SOURCE_ATTRIBUTE] === markerValue) match = fiber;
  }
  if (!match) {
    throw new Error(`no component or element with ${EDITABLE_SOURCE_ATTRIBUTE}=${JSON.stringify(markerValue)} above <${node.localName}>`);
  }
  return currentFiber(match);
}

/**
 * Sets `props` on the call-site element of every node, re-rendering them without touching the source. An
 * `undefined` value removes the prop. All props go in one overrideProps call: each call starts from the
 * fiber's committed props, so a second call before the re-render would discard the first.
 */
export function readCallSiteProps(node: Element, markerValue: string): Record<string, unknown> {
  return { ...callSiteFiber(node, markerValue).memoizedProps };
}

export function overrideCallSite(nodes: Element[], markerValue: string, props: Record<string, unknown>): void {
  const found = findRenderer();
  if (!("renderer" in found)) throw new Error(`cannot override ${Object.keys(props).join(", ")} live: ${found.reason}`);
  for (const node of nodes) {
    const fiber = callSiteFiber(node, markerValue);
    // WORKAROUND(live-visual-edit-preview): re-render the edited facet node through the React DevTools renderer's overrideProps, because HMR/Fast Refresh are off in the playground.
    // Correct fix: enable Fast Refresh/HMR for page modules so written source re-renders itself.
    // Ref: discussed with user 2026-11-04
    found.renderer.overrideProps(fiber, [], { ...fiber.memoizedProps, ...props });
  }
}
