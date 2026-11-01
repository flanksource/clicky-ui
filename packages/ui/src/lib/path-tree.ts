// Turns a flat list of items that each carry a path into a tree, without
// knowing anything about what the items are. Two independent surfaces need
// exactly this shape — a session's changed-file list and a backend's
// hierarchical nav surfaces — so the walker lives here rather than a third
// time inside a component.

/** The wire separator for a joined path. Matches clicky's entity.PathSeparator. */
export const PATH_SEPARATOR = "/";

export interface PathTreeNode<T> {
  /** The joined path — stable across rebuilds, so it works as a React/Tree key. */
  key: string;
  /** The node's own last segment. */
  label: string;
  /** Every segment from the root down to and including this node. */
  path: string[];
  /**
   * The items whose *full* path lands on this node. Empty means a pure folder
   * — a node that exists only because something below it does. More than one
   * means several items share a path (e.g. a file that was both read and
   * written), which is why this is a list rather than a single value.
   */
  items: T[];
  children: PathTreeNode<T>[];
}

export interface BuildPathTreeOptions<T> {
  /**
   * Orders siblings at every level. Defaults to the order items were first
   * seen, which preserves a already-sorted backend list as-is.
   */
  compare?: (left: PathTreeNode<T>, right: PathTreeNode<T>) => number;
}

/**
 * Splits `value` into path segments on any character in `delimiters`, dropping
 * empty segments so leading, trailing and repeated separators are harmless.
 *
 * Characters outside `delimiters` are never separators: with `delimiters="."`,
 * `"remote-debugger.sql-xevent"` yields two segments, not four — a hyphen is an
 * ordinary name character.
 */
export function splitPath(value: string, delimiters: string): string[] {
  if (!value) return [];
  if (!delimiters) return [value];
  const segments: string[] = [];
  let current = "";
  for (const character of value) {
    if (delimiters.includes(character)) {
      if (current) segments.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  if (current) segments.push(current);
  return segments;
}

/**
 * Builds a forest from items keyed by path.
 *
 * A node is created for every path prefix, and an item's full path *binds* to
 * whichever node it lands on — creating it if needed, reusing it if a
 * descendant already forced it into existence. That is what lets a node be both
 * a folder and a leaf: `["jms"]` and `["jms", "incoming"]` produce one `jms`
 * node that is simultaneously selectable and expandable.
 *
 * Items whose path is empty are skipped — they have no position in the tree.
 */
export function buildPathTree<T>(
  items: readonly T[],
  getPath: (item: T) => readonly string[],
  options: BuildPathTreeOptions<T> = {},
): PathTreeNode<T>[] {
  const roots: PathTreeNode<T>[] = [];
  const byKey = new Map<string, PathTreeNode<T>>();

  for (const item of items) {
    const path = getPath(item);
    if (path.length === 0) continue;

    let siblings = roots;
    let key = "";
    let node: PathTreeNode<T> | undefined;
    path.forEach((segment, index) => {
      key = key ? `${key}${PATH_SEPARATOR}${segment}` : segment;
      let existing = byKey.get(key);
      if (!existing) {
        existing = {
          key,
          label: segment,
          path: path.slice(0, index + 1),
          items: [],
          children: [],
        };
        byKey.set(key, existing);
        siblings.push(existing);
      }
      siblings = existing.children;
      node = existing;
    });
    node?.items.push(item);
  }

  if (options.compare) sortTree(roots, options.compare);
  return roots;
}

function sortTree<T>(
  nodes: PathTreeNode<T>[],
  compare: (left: PathTreeNode<T>, right: PathTreeNode<T>) => number,
): void {
  nodes.sort(compare);
  for (const node of nodes) sortTree(node.children, compare);
}

/** True when the node exists only to hold descendants — nothing binds to it. */
export function isPathTreeFolder<T>(node: PathTreeNode<T>): boolean {
  return node.items.length === 0;
}

/**
 * A `compare` that puts nodes with children before plain leaves, then orders
 * each run alphabetically — the conventional file-explorer ordering.
 */
export function foldersFirst<T>(
  left: PathTreeNode<T>,
  right: PathTreeNode<T>,
): number {
  const leftIsParent = left.children.length > 0;
  const rightIsParent = right.children.length > 0;
  if (leftIsParent !== rightIsParent) return leftIsParent ? -1 : 1;
  return left.label.localeCompare(right.label);
}

/** Include/exclude state keyed by a node's joined path; neutral nodes are absent. */
export type TreeSelection = Record<string, "include" | "exclude">;

/**
 * Decides whether `path` passes a tree include/exclude selection, where a
 * selection key stands for that path *and everything beneath it*.
 *
 * The deepest selected ancestor-or-self decides, so excluding `a/b` under an
 * included `a` carves `a/b` back out, and including `a/b/c` under an excluded
 * `a/b` restores it. When no ancestor-or-self is selected the path matches only
 * if the selection has no includes at all: with no includes everything matches
 * except excluded subtrees, with any include only included subtrees match.
 *
 * Keys match on whole segments — `acme/bill` does not select `acme/billing`.
 */
export function matchesTreeSelection(
  path: string,
  selection: TreeSelection,
  separator: string = PATH_SEPARATOR,
): boolean {
  const segments = splitPath(path, separator);
  for (let depth = segments.length; depth > 0; depth--) {
    const mode = selection[segments.slice(0, depth).join(separator)];
    if (mode !== undefined) return mode === "include";
  }
  return !Object.values(selection).includes("include");
}
