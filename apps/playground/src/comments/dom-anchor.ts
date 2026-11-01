/**
 * Turns a clicked DOM node into an opaque `CommentAnchor` string, and back.
 *
 * The library's comment system keys everything on an anchor string that content
 * registers via `registerAnchor`. Playground artifacts are arbitrary TSX that
 * register nothing, so the anchor is a CSS selector computed at click time and
 * resolved again on load. Alongside it a comment stores further independent
 * locators (role and name, text under its heading, text in its landmark), so
 * one broken selector does not lose the element. A comment none of them can
 * find yields an *orphan* — kept and flagged, never silently dropped — and one
 * found by a fallback is reported as moved, never silently repositioned.
 * Rendered markdown is the exception: there the anchor is structural — the
 * block's heading path and text (see markdown-anchor.ts) — and is its only locator.
 */
import { attr as wordLikeAttr, finder } from "@medv/finder";
import { computeAccessibleName, getRole } from "dom-accessibility-api";

import {
  COMMENT_ELEMENT_HTML_TRUNCATION,
  COMMENT_LOCATOR_SELECTOR_LIMIT,
  COMMENT_LOCATOR_TEXT_LIMIT,
  type CommentLocator,
  type CommentLocatorHeading,
} from "../../plugins/comments-model";
import {
  MARKDOWN_ROOT,
  markdownAnchor,
  markdownLocator,
  markdownTarget,
  parseMarkdownAnchor,
  resolveMarkdown,
} from "./markdown-anchor";

export type Box = { left: number; top: number; width: number; height: number };

const ROOT_ANCHOR = ":scope";
const MAX_LABEL_TEXT = 60;
const OVERLAY_SEPARATOR = " >> ";
const OVERLAY_ANCHOR =
  /^\[role="dialog"\]\[aria-label="((?:[^"\\]|\\.)*)"\] >> /;

/** Page authors pin a comment target explicitly with this attribute. */
const OPT_IN_ATTR = "data-comment-anchor";
const STABLE_ATTRS = new Set([OPT_IN_ATTR, "data-testid"]);
const SEMANTIC_ATTRS = new Set(["role", "aria-label", "name"]);
/** Attributes the playground and React Grab add themselves; they say nothing about the artifact. */
const TOOLING_ATTR = /^data-(?:react-grab|review|comment|show-rejected)/;

/**
 * An empty `data-*` attribute marks a component's region (clicky-ui writes
 * e.g. `data-lint-filter-bar=""`), so it names the element wherever it moves.
 * A valued one carries state or row identity and would churn.
 */
function isMarkerAttr(name: string, value: string): boolean {
  return name.startsWith("data-") && value === "" && !TOOLING_ATTR.test(name);
}
const ANONYMOUS_ROLES = new Set(["generic", "presentation", "none"]);
const HEADING_SELECTORS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  '[role="heading"]',
  "figcaption",
  "legend",
];
const HEADING = HEADING_SELECTORS.join(",");
const CAPTION = "figcaption,legend";
/** Siblings that are blocks of their own: their heading titles them, not the target. */
const BLOCK = "section,article,figure,li";

const GENERATED_IDS = [
  // React useId, raw: :r1n7: (18), «r1» (19.0–19.1), _r_1n7_ (19.2)
  /^(?::r[0-9a-z]+:|«r[0-9a-z]+»|_r_[0-9a-z]+_)/i,
  // React useId with its delimiters stripped, as facet's Diagram does: r1n7-serve
  /^r[0-9a-v]{1,5}(?:-|$)/,
  /^(?:radix|headlessui|react-aria)[-:]/,
  /^mui-\d/,
];

/**
 * Whether an id was generated at render time and so moves whenever the tree
 * above it changes. A false positive only makes a selector longer.
 */
export function isGeneratedId(id: string): boolean {
  return GENERATED_IDS.some((pattern) => pattern.test(id));
}

/** Builds a selector locating `target` within `root`, never keyed on a generated id or a styling class. */
export function cssPath(target: Element, root: Element): string {
  if (target === root) return ROOT_ANCHOR;
  const optIn = target.getAttribute(OPT_IN_ATTR);
  if (optIn) {
    const selector = `[${OPT_IN_ATTR}="${CSS.escape(optIn)}"]`;
    if (queryAll(root, selector).length === 1) return selector;
  }
  return finder(target, {
    root,
    idName: (id) => !isGeneratedId(id),
    className: () => false,
    attr: (name, value) =>
      STABLE_ATTRS.has(name) ||
      isMarkerAttr(name, value) ||
      (SEMANTIC_ATTRS.has(name) && wordLikeAttr(name, value)),
  });
}

function normalizeText(text: string | null): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function fitsText(text: string): boolean {
  return text !== "" && text.length <= COMMENT_LOCATOR_TEXT_LIMIT;
}

function single(elements: Element[]): Element | null {
  return elements.length === 1 ? (elements[0] ?? null) : null;
}

function headingOf(element: Element): CommentLocatorHeading | null {
  const selector = HEADING_SELECTORS.find((candidate) =>
    element.matches(candidate),
  );
  const text = normalizeText(element.textContent);
  return selector && fitsText(text) ? { selector, text } : null;
}

/**
 * The heading that titles the block `target` sits in: the nearest preceding
 * sibling heading (or wrapper led by one) at any level up to `root`, or the
 * caption of an enclosing figure or fieldset.
 */
export function nearestHeading(
  target: Element,
  root: Element,
): CommentLocatorHeading | null {
  for (
    let node: Element | null = target;
    node && node !== root;
    node = node.parentElement
  ) {
    for (
      let sibling = node.previousElementSibling;
      sibling;
      sibling = sibling.previousElementSibling
    ) {
      const lead = sibling.firstElementChild;
      const heading = sibling.matches(HEADING)
        ? sibling
        : !sibling.matches(BLOCK) && lead?.matches(HEADING)
          ? lead
          : null;
      const found = heading && headingOf(heading);
      if (found) return found;
    }
    const caption = node.parentElement
      ? [...node.parentElement.children].find(
          (child) => child !== node && child.matches(CAPTION),
        )
      : undefined;
    const found = caption && headingOf(caption);
    if (found) return found;
  }
  return null;
}

/** Selector of the nearest ancestor with a stable, unique id. */
function landmarkOf(target: Element, root: Element): string | null {
  for (
    let node = target.parentElement;
    node && node !== root;
    node = node.parentElement
  ) {
    const id = node.getAttribute("id");
    if (!id || isGeneratedId(id)) continue;
    const selector = `#${CSS.escape(id)}`;
    if (queryAll(root, selector).length === 1) return selector;
  }
  return null;
}

function textMatches(scope: Element, tag: string, text: string): Element[] {
  return [scope, ...queryAll(scope, tag)].filter(
    (element) =>
      element.tagName.toLowerCase() === tag &&
      normalizeText(element.textContent) === text,
  );
}

/** Finds the one element a locator describes, or null when none or several match. */
export function resolveLocator(
  root: Element,
  locator: CommentLocator,
): Element | null {
  switch (locator.kind) {
    case "css":
      return query(root, locator.selector);
    case "role":
      return single(
        queryAll(root, locator.tag).filter(
          (element) =>
            getRole(element) === locator.role &&
            computeAccessibleName(element) === locator.name,
        ),
      );
    case "text": {
      const scope = locator.scope ? query(root, locator.scope) : root;
      if (!scope) return null;
      const { heading } = locator;
      if (!heading) return single(textMatches(scope, locator.tag, locator.text));
      // Widen from the heading until the text turns up: the nearest block
      // holding it is the heading's own, so repeated text elsewhere is ignored.
      for (
        let block = single(
          queryAll(scope, heading.selector).filter(
            (element) => normalizeText(element.textContent) === heading.text,
          ),
        );
        block && scope.contains(block);
        block = block.parentElement
      ) {
        const found = textMatches(block, locator.tag, locator.text);
        if (found.length > 0) return single(found);
      }
      return null;
    }
    case "markdown": {
      const markdown = markdownRootIn(root);
      return markdown ? (resolveMarkdown(markdown, locator)?.element ?? null) : null;
    }
  }
}

/** The rendered markdown inside (or at) `root`, if the page is a markdown document. */
function markdownRootIn(root: Element): Element | null {
  return root.matches(MARKDOWN_ROOT) ? root : root.querySelector(MARKDOWN_ROOT);
}

/**
 * Every locator that singles `target` out within `root` right now, strongest
 * first. Candidates that are ambiguous at capture time are dropped, so a stored
 * locator always pointed at exactly this element once.
 */
export function captureLocators(
  target: Element,
  root: Element,
): CommentLocator[] {
  if (target === root || !root.contains(target)) return [];
  const markdown = markdownTarget(target);
  if (markdown) return [markdownLocator(markdown.block, markdown.root)];
  const tag = target.tagName.toLowerCase();
  const candidates: CommentLocator[] = [];

  const selector = cssPath(target, root);
  if (selector.length <= COMMENT_LOCATOR_SELECTOR_LIMIT) {
    candidates.push({ kind: "css", selector });
  }
  const role = getRole(target);
  const name = computeAccessibleName(target);
  if (role && !ANONYMOUS_ROLES.has(role) && fitsText(name)) {
    candidates.push({ kind: "role", tag, role, name });
  }
  const text = normalizeText(target.textContent);
  if (fitsText(text)) {
    const heading = nearestHeading(target, root);
    if (heading) candidates.push({ kind: "text", tag, text, heading });
    const scope = landmarkOf(target, root);
    if (scope) candidates.push({ kind: "text", tag, text, scope });
    candidates.push({ kind: "text", tag, text });
  }
  return candidates.filter(
    (locator) => resolveLocator(root, locator) === target,
  );
}

/**
 * Locators for a comment stored before locators were captured, read back from
 * the element HTML it kept. Truncated HTML has lost its text, so yields none.
 */
export function legacyLocators(html: string): CommentLocator[] {
  if (html.endsWith(COMMENT_ELEMENT_HTML_TRUNCATION)) return [];
  const template = document.createElement("template");
  template.innerHTML = html;
  const element = template.content.firstElementChild;
  const text = normalizeText(element?.textContent ?? null);
  if (!element || !fitsText(text)) return [];
  const tag = element.tagName.toLowerCase();
  const inner = element.querySelector(HEADING);
  const heading = inner && headingOf(inner);
  return [
    ...(heading ? [{ kind: "text" as const, tag, text, heading }] : []),
    { kind: "text", tag, text },
  ];
}

export type CommentMatch = {
  element: Element;
  /** "anchor" when the stored anchor itself won; otherwise the fallback that did. */
  matchedBy: "anchor" | CommentLocator;
  /** True when the anchor and locators point at different elements. */
  conflict: boolean;
};

/**
 * Resolves a comment through its anchor and every stored locator. The element
 * most of them agree on wins (ties go to the earlier, stronger one), so a
 * stale `nth-child` anchor that now hits a sibling is outvoted rather than
 * trusted.
 */
export function resolveComment(
  root: Element,
  anchor: string,
  locators: readonly CommentLocator[],
): CommentMatch | null {
  const matches: { by: CommentMatch["matchedBy"]; element: Element }[] = [];
  const anchored = resolveAnchor(root, anchor);
  if (anchored) matches.push({ by: "anchor", element: anchored });
  for (const locator of locators) {
    const element = resolveLocator(root, locator);
    if (element) matches.push({ by: locator, element });
  }
  const first = matches[0];
  if (!first) return null;

  const votes = new Map<Element, number>();
  for (const { element } of matches) {
    votes.set(element, (votes.get(element) ?? 0) + 1);
  }
  const winner = matches.reduce((best, match) =>
    (votes.get(match.element) ?? 0) > (votes.get(best.element) ?? 0)
      ? match
      : best,
  first);
  return {
    element: winner.element,
    matchedBy: winner.by,
    conflict: votes.size > 1,
  };
}

/**
 * The element a click comments on: inside rendered markdown, the block holding
 * it (or the whole page between blocks); elsewhere the clicked element itself.
 */
export function commentTarget(target: Element, content: Element): Element {
  if (!content.contains(target) || !target.closest(MARKDOWN_ROOT)) return target;
  return markdownTarget(target)?.block ?? content;
}

/**
 * Builds the anchor for a clicked element. Elements inside the artifact get a
 * path from `content`. Overlays (e.g. `Modal`) portal into `document.body`, so
 * an element inside a titled dialog is keyed on that dialog's `aria-label`
 * followed by a path within it. Anything else is not commentable (null).
 */
export function commentAnchor(
  target: Element,
  content: Element,
): string | null {
  if (content.contains(target)) {
    const element = commentTarget(target, content);
    const markdown = markdownTarget(element);
    return markdown
      ? markdownAnchor(markdownLocator(markdown.block, markdown.root))
      : cssPath(element, content);
  }
  const dialog = target.closest('[role="dialog"][aria-label]');
  const label = dialog?.getAttribute("aria-label");
  if (!dialog || !label) return null;
  const quoted = label.replace(/["\\]/g, "\\$&");
  return `[role="dialog"][aria-label="${quoted}"]${OVERLAY_SEPARATOR}${cssPath(target, dialog)}`;
}

/** The dialog title an overlay anchor is keyed on, or null for artifact anchors. */
export function overlayLabel(anchor: string): string | null {
  const match = OVERLAY_ANCHOR.exec(anchor);
  return match?.[1] ? match[1].replace(/\\(["\\])/g, "$1") : null;
}

/** Resolves a stored anchor, returning null when the node is gone (orphaned). */
export function resolveAnchor(root: Element, anchor: string): Element | null {
  if (anchor === ROOT_ANCHOR) return root;
  const markdown = parseMarkdownAnchor(anchor);
  if (markdown) {
    // The anchor only names the block as it was; a reworded or relocated
    // block is the locator's to find, and reported as moved.
    const scope = markdownRootIn(root);
    const found = scope && resolveMarkdown(scope, markdown);
    return found?.how === "exact" ? found.element : null;
  }
  const separator = anchor.indexOf(OVERLAY_SEPARATOR);
  if (separator !== -1) {
    const dialog = query(root.ownerDocument, anchor.slice(0, separator));
    const path = anchor.slice(separator + OVERLAY_SEPARATOR.length);
    return dialog && (path === ROOT_ANCHOR ? dialog : query(dialog, path));
  }
  return query(root, anchor);
}

function queryAll(root: ParentNode, selector: string): Element[] {
  try {
    return [...root.querySelectorAll(selector)];
  } catch {
    // A selector stored against an older DOM can be unparseable. Treating that
    // as an orphan is the visible, domain-meaningful outcome — the sidebar says
    // so — whereas throwing would take the whole comment layer down.
    return [];
  }
}

function query(root: ParentNode, selector: string): Element | null {
  return single(queryAll(root, selector));
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
  const clipped =
    text.length > MAX_LABEL_TEXT ? `${text.slice(0, MAX_LABEL_TEXT)}…` : text;
  return `${head} "${clipped}"`;
}

/** Re-expresses a viewport rect in the scrollable coordinate space of `root`. */
export function boxWithin(
  target: Box,
  root: Box,
  scroll: { left: number; top: number },
): Box {
  return {
    left: target.left - root.left + scroll.left,
    top: target.top - root.top + scroll.top,
    width: target.width,
    height: target.height,
  };
}

/** DOM wrapper around `boxWithin` for a live element. */
export function elementBoxWithin(element: Element, root: HTMLElement): Box {
  return boxWithin(
    element.getBoundingClientRect(),
    root.getBoundingClientRect(),
    {
      left: root.scrollLeft,
      top: root.scrollTop,
    },
  );
}
