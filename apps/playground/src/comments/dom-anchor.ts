/**
 * Turns a clicked DOM node into an opaque `CommentAnchor` string, and back.
 *
 * The library's comment system keys everything on an anchor string that content
 * registers via `registerAnchor`. Playground artifacts are arbitrary TSX that
 * register nothing, so the anchor is a CSS path computed at click time and
 * resolved again on load. A path that no longer matches yields an *orphan* —
 * the comment is kept and flagged, never silently dropped or repositioned.
 */

export type Box = { left: number; top: number; width: number; height: number };

const SAFE_ID = /^[A-Za-z][\w-]*$/;
const ROOT_ANCHOR = ":scope";
const MAX_LABEL_TEXT = 60;

function childIndex(parent: Element, child: Element): number {
  return Array.prototype.indexOf.call(parent.children, child) + 1;
}

function uniqueId(root: Element, element: Element): string | null {
  const id = element.getAttribute("id");
  if (!id || !SAFE_ID.test(id)) return null;
  return root.querySelectorAll(`#${id}`).length === 1 ? id : null;
}

/** Builds a selector locating `target` within `root`. */
export function cssPath(target: Element, root: Element): string {
  if (target === root) return ROOT_ANCHOR;

  const segments: string[] = [];
  let node: Element | null = target;

  while (node && node !== root) {
    const id = uniqueId(root, node);
    if (id) {
      segments.unshift(`#${id}`);
      return segments.join(" > ");
    }
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    segments.unshift(`${node.tagName.toLowerCase()}:nth-child(${childIndex(parent, node)})`);
    node = parent;
  }

  segments.unshift(ROOT_ANCHOR);
  return segments.join(" > ");
}

/** Resolves a stored anchor, returning null when the node is gone (orphaned). */
export function resolveAnchor(root: Element, anchor: string): Element | null {
  if (anchor === ROOT_ANCHOR) return root;
  try {
    return root.querySelector(anchor);
  } catch {
    // A selector stored against an older DOM can be unparseable. Treating that
    // as an orphan is the visible, domain-meaningful outcome — the sidebar says
    // so — whereas throwing would take the whole comment layer down.
    return null;
  }
}

/** Short human description of an element, used as the anchor's sidebar label. */
export function describeElement(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const classes = (element.getAttribute("class") ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const head = classes.length > 0 ? `${tag}.${classes.join(".")}` : tag;

  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text === "") return head;
  const clipped = text.length > MAX_LABEL_TEXT ? `${text.slice(0, MAX_LABEL_TEXT)}…` : text;
  return `${head} "${clipped}"`;
}

/** Re-expresses a viewport rect in the scrollable coordinate space of `root`. */
export function boxWithin(target: Box, root: Box, scroll: { left: number; top: number }): Box {
  return {
    left: target.left - root.left + scroll.left,
    top: target.top - root.top + scroll.top,
    width: target.width,
    height: target.height,
  };
}

/** DOM wrapper around `boxWithin` for a live element. */
export function elementBoxWithin(element: Element, root: HTMLElement): Box {
  return boxWithin(element.getBoundingClientRect(), root.getBoundingClientRect(), {
    left: root.scrollLeft,
    top: root.scrollTop,
  });
}
