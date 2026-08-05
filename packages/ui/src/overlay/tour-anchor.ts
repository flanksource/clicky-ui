import type { TourRoot, TourRootSource, TourTarget } from "./tour-types";

/**
 * The ONLY place a tour touches the DOM. Everything else — Tour.tsx included —
 * goes through here, which is what makes shadow-root support structural rather
 * than a convention: there is no `document` reference to accidentally reintroduce.
 *
 * An anchor may not exist when its step is entered (lazy route, data still
 * loading, a collapsed panel), so resolution is a bounded wait: query, then
 * observe mutations and re-query on the next frame, until the element appears or
 * the budget expires.
 */

export type AnchorResolution =
  | { status: "found"; element: HTMLElement }
  | { status: "timeout" };

export type ResolveAnchorOptions = {
  root: TourRootSource;
  target: TourTarget;
  timeoutMs: number;
  signal?: AbortSignal | undefined;
};

/** How often a not-yet-attached root is retried; once attached the observer takes over. */
const ROOT_POLL_MS = 50;

/** Resolves a root source, returning `null` while a lazily attached root is absent. */
export function resolveTourRoot(source: TourRootSource): TourRoot | null {
  return (typeof source === "function" ? source() : source) ?? null;
}

function rootWindow(root: TourRoot): (Window & typeof globalThis) | null {
  if (root instanceof Document) return root.defaultView;
  return root.ownerDocument?.defaultView ?? null;
}

/** MutationObserver needs a Node; a Document must be observed via its element. */
function observableNode(root: TourRoot): Node {
  return root instanceof Document ? (root.documentElement ?? root) : root;
}

/**
 * "Displayed" rather than "laid out": deliberately not `getClientRects().length`,
 * because jsdom lays nothing out and every unit test would then time out. The
 * distinction we actually care about is whether the element is in the tree and
 * not hidden.
 */
function isDisplayed(element: HTMLElement): boolean {
  if (!element.isConnected || element.hidden) return false;
  const view = element.ownerDocument.defaultView;
  if (!view) return true;
  const style = view.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

/** One synchronous lookup. Throws when a resolver returns something unusable. */
export function queryAnchor(root: TourRoot, target: TourTarget): HTMLElement | null {
  if (typeof target === "string") return root.querySelector<HTMLElement>(target);
  if (typeof target !== "function") return target;

  const resolved = target(root) ?? null;
  const ElementCtor = rootWindow(root)?.HTMLElement ?? HTMLElement;
  if (resolved !== null && !(resolved instanceof ElementCtor)) {
    throw new Error(`Tour target resolver returned ${String(resolved)}, expected an HTMLElement`);
  }
  return resolved;
}

/** A displayed match under the current root, or null while it is still absent. */
function tryResolve(rootSource: TourRootSource, target: TourTarget): HTMLElement | null {
  const root = resolveTourRoot(rootSource);
  if (!root) return null;
  const element = queryAnchor(root, target);
  return element && isDisplayed(element) ? element : null;
}

/**
 * Watches for `target` under `root`, calling `onFound` once. Re-queries are
 * coalesced into one animation frame so a chatty React commit cannot run
 * `querySelector` hundreds of times, and a root that has not attached yet is
 * polled until it can be observed — so a late-mounting shadow root needs no
 * second waiting mechanism that could hang on its own.
 */
function watchForAnchor(
  rootSource: TourRootSource,
  target: TourTarget,
  onFound: (element: HTMLElement) => void,
): () => void {
  let frame: number | null = null;
  let observer: MutationObserver | null = null;
  let observedNode: Node | null = null;
  let stopped = false;

  const observeRoot = () => {
    const root = resolveTourRoot(rootSource);
    if (!root) return;
    const node = observableNode(root);
    if (observedNode === node) return;
    observer?.disconnect();
    observedNode = node;
    observer = new MutationObserver(attempt);
    observer.observe(node, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden", "data-state", "aria-hidden"],
    });
  };

  // Resolved lazily: with a late-attaching root there is no window to schedule
  // against until it exists, and the interval below carries us until then.
  const frameScheduler = () => {
    const root = resolveTourRoot(rootSource);
    return root ? rootWindow(root) : null;
  };

  function run() {
    frame = null;
    if (stopped) return;
    observeRoot();
    const element = tryResolve(rootSource, target);
    if (element) onFound(element);
  }

  function attempt() {
    if (stopped || frame !== null) return;
    const view = frameScheduler();
    frame = view?.requestAnimationFrame
      ? view.requestAnimationFrame(run)
      : (setTimeout(run, 16) as unknown as number);
  }

  observeRoot();
  const poll = setInterval(() => {
    if (!observedNode) attempt();
  }, ROOT_POLL_MS);

  return () => {
    stopped = true;
    clearInterval(poll);
    if (frame !== null) frameScheduler()?.cancelAnimationFrame?.(frame);
    observer?.disconnect();
  };
}

/** Waits for `target` under `root`, up to `timeoutMs`. */
export function resolveAnchor(options: ResolveAnchorOptions): Promise<AnchorResolution> {
  const { root, target, timeoutMs, signal } = options;

  const immediate = tryResolve(root, target);
  if (immediate) return Promise.resolve({ status: "found", element: immediate });
  if (signal?.aborted) return Promise.resolve({ status: "timeout" });

  return new Promise<AnchorResolution>((resolve) => {
    const disposers: Array<() => void> = [];
    let settled = false;

    const finish = (resolution: AnchorResolution) => {
      if (settled) return;
      settled = true;
      for (const dispose of disposers) dispose();
      resolve(resolution);
    };

    disposers.push(watchForAnchor(root, target, (element) => finish({ status: "found", element })));

    const timer = setTimeout(() => finish({ status: "timeout" }), timeoutMs);
    disposers.push(() => clearTimeout(timer));

    if (signal) {
      const onAbort = () => finish({ status: "timeout" });
      signal.addEventListener("abort", onAbort);
      disposers.push(() => signal.removeEventListener("abort", onAbort));
    }
  });
}
