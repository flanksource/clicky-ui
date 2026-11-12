type Fiber = {
  tag: number; type: unknown; return: Fiber | null; child: Fiber | null; sibling: Fiber | null;
  alternate: Fiber | null; stateNode: unknown; memoizedProps: Record<string, unknown> | null;
};
type Renderer = { overrideProps: (fiber: Fiber, path: Array<string | number>, value: unknown) => void };
type Hook = { renderers?: Map<number, Partial<Renderer>> };

function renderer(): Renderer {
  const hook = (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: Hook }).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook?.renderers?.size) throw new Error("Design mode requires the DevTools hook before react-dom loads");
  const renderers = [...hook.renderers.values()].filter((value): value is Renderer => typeof value.overrideProps === "function");
  if (renderers.length !== 1) throw new Error("Design mode requires exactly one React development renderer with overrideProps");
  return renderers[0]!;
}

// DOM fibers and return chains may reference the alternate buffer. Overrides must start from committed props.
function currentFiber(fiber: Fiber): Fiber {
  if (!fiber.alternate) return fiber;
  let top = fiber;
  while (top.return) top = top.return;
  if (top.tag !== 3) throw new Error("fiber is detached from its React root");
  const stack: Fiber[] = [(top.stateNode as { current: Fiber }).current];
  for (let next = stack.pop(); next; next = stack.pop()) {
    if (next === fiber || next === fiber.alternate) return next;
    if (next.sibling) stack.push(next.sibling);
    if (next.child) stack.push(next.child);
  }
  throw new Error("fiber is not in the committed React tree");
}

export function fiberOf(node: Element): Fiber {
  const key = Object.keys(node).find((name) => name.startsWith("__reactFiber$"));
  if (!key) throw new Error(`<${node.localName}> was not rendered by React`);
  return (node as unknown as Record<string, Fiber>)[key]!;
}

function callSiteFiber(options: { node: Element; source: string }): Fiber {
  let match: Fiber | null = null;
  for (let fiber: Fiber | null = fiberOf(options.node); fiber; fiber = fiber.return) {
    if (fiber.memoizedProps?.["data-source"] === options.source) match = fiber;
  }
  if (!match) throw new Error(`no React call site for ${options.source} above <${options.node.localName}>`);
  return currentFiber(match);
}

export function readCallSiteProps(options: { node: Element; source: string }): Record<string, unknown> {
  renderer();
  return { ...callSiteFiber(options).memoizedProps };
}

export function overrideCallSite(options: { nodes: Element[]; source: string; props: Record<string, unknown> }): void {
  const active = renderer();
  const fibers = new Set(options.nodes.map((node) => callSiteFiber({ node, source: options.source })));
  for (const fiber of fibers) active.overrideProps(fiber, [], { ...fiber.memoizedProps, ...options.props });
}
