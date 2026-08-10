// The JSON→JSONPath tree model shared by the inline picker dropdown and the
// full playground dialog.
//
// The two want opposite things from the same walk. The dropdown is a *preview*
// of a row that has to render the instant it opens, so it builds eagerly and
// pays for that with caps: depth, property count, and one array element. The
// playground is a *browser* of the row, so it must have no caps at all — which
// is only affordable if the walk is lazy, materialising a level at a time as the
// operator opens it.

const SIMPLE_PROPERTY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export const DEFAULT_MAX_DEPTH = 12;
export const DEFAULT_MAX_OBJECT_PROPERTIES = 100;
/**
 * Entries the uncapped tree renders under one node before it stops and says so.
 *
 * Depth is what the playground removes the limit on; breadth still has to render
 * as DOM rows the moment a node opens, and a hundred-thousand-element array
 * would take the tab down. The remainder is reported in a visible row rather
 * than dropped quietly — an index past it is still reachable by typing it.
 */
export const DEFAULT_MAX_CHILDREN = 1000;

export type JSONPathNodeKind = "array" | "object" | "scalar" | "more";

export interface JSONPathNode {
  key: string;
  path: string;
  value: unknown;
  kind: JSONPathNodeKind;
  summary: string;
  children?: JSONPathNode[];
  /**
   * The top-level column this node's path is rooted at, set only inside a
   * subtree decoded out of a JSON-encoded string. Such a path cannot be read
   * from the row directly — the backend reaches it by way of the column's
   * `source`, so the two have to be committed together.
   */
  root?: string;
  /** Number of entries the node holds, before any paging. */
  childCount: number;
}

export interface BuildJSONPathNodeOptions {
  maxDepth?: number;
  maxObjectProperties?: number;
  /** "first" exposes only element [0] of an array; "all" exposes every element. */
  arrayMode?: "first" | "all";
}

export function jsonPathKind(value: unknown): JSONPathNodeKind {
  if (Array.isArray(value)) return "array";
  return value !== null && typeof value === "object" ? "object" : "scalar";
}

export function appendJSONPath(path: string, key: string | number): string {
  if (typeof key === "number") return `${path}[${key}]`;
  return SIMPLE_PROPERTY.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
}

export function summarizeJSON(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length} item${value.length === 1 ? "" : "s"}]`;
  if (value !== null && typeof value === "object") {
    const count = Object.keys(value).length;
    return `{${count} ${count === 1 ? "property" : "properties"}}`;
  }
  if (typeof value === "string") return JSON.stringify(value.length > 80 ? `${value.slice(0, 77)}…` : value);
  return String(value);
}

function entryCount(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value !== null && typeof value === "object") return Object.keys(value).length;
  return 0;
}

/**
 * The eager, capped walk behind the inline dropdown. Deep, wide, or long values
 * are truncated on purpose: the dropdown opens on a click and cannot afford to
 * walk an arbitrary document first.
 */
export function buildJSONPathNode(
  value: unknown,
  path: string,
  depth: number,
  options: BuildJSONPathNodeOptions = {},
): JSONPathNode {
  const {
    maxDepth = DEFAULT_MAX_DEPTH,
    maxObjectProperties = DEFAULT_MAX_OBJECT_PROPERTIES,
    arrayMode = "first",
  } = options;
  const kind = jsonPathKind(value);
  const node: JSONPathNode = {
    key: path,
    path,
    value,
    kind,
    summary: summarizeJSON(value),
    childCount: entryCount(value),
  };
  if (kind === "scalar" || depth >= maxDepth) return node;
  const entries = Array.isArray(value)
    ? arrayMode === "all"
      ? value.map((entry, index) => [index, entry] as const)
      : value.length > 0
        ? [[0, value[0]] as const]
        : []
    : Object.entries(value as Record<string, unknown>).slice(0, maxObjectProperties);
  node.children = entries.map(([key, child]) =>
    buildJSONPathNode(child, appendJSONPath(path, key), depth + 1, options),
  );
  return node;
}

export interface LazyJSONPathTreeOptions {
  maxChildren?: number;
  /**
   * Namespaces every node key. Two trees over different documents share their
   * paths, and Tree keys its React elements by node key — without a distinct
   * prefix, swapping the document underneath reuses the old subtree along with
   * the children it had already loaded.
   */
  keyPrefix?: string;
  /**
   * Descend into a string that parses as JSON. Providers routinely hand back a
   * document as an encoded column, and the backend already decodes one when a
   * column names it as its `source` — without this the picker shows the single
   * most interesting column in such a row as an opaque blob.
   */
  parseEmbeddedJSON?: boolean;
}

export interface LazyJSONPathTree {
  roots: JSONPathNode[];
  /** Children already materialised, or undefined while the branch is unopened. */
  getChildren: (node: JSONPathNode) => JSONPathNode[] | undefined;
  hasMoreChildren: (node: JSONPathNode) => boolean;
  loadChildren: (node: JSONPathNode) => Promise<JSONPathNode[]>;
  /**
   * Materialise the branch a literal expression addresses and return its node,
   * so a tree can reveal the value it opened with. Returns undefined for an
   * expression that selects rather than addresses (a wildcard, a descent, a
   * filter) or for one the document does not carry.
   */
  materializePath: (expression: string) => JSONPathNode | undefined;
}

/**
 * An uncapped tree over `json`: every property, every array element, any depth.
 *
 * Nothing is walked until it is opened, so an arbitrarily deep or wide document
 * costs only what the operator actually looks at. Nodes are cached by path so
 * re-opening a branch returns the *same objects* — `TreeNode` compares the
 * selected node by identity, and a rebuilt node would silently lose the
 * highlight.
 */
export function createLazyJSONPathTree(
  json: unknown,
  options: LazyJSONPathTreeOptions = {},
): LazyJSONPathTree {
  const { maxChildren = DEFAULT_MAX_CHILDREN, parseEmbeddedJSON = true, keyPrefix = "" } = options;
  const nodes = new Map<string, JSONPathNode>();

  // hasMoreChildren runs on every render of every visible row, so the decode is
  // memoised per node rather than re-parsing a long string each time.
  const decoded = new Map<string, unknown>();

  function embedded(node: JSONPathNode): unknown {
    if (!parseEmbeddedJSON || typeof node.value !== "string") return undefined;
    if (decoded.has(node.key)) return decoded.get(node.key);
    const text = node.value.trim();
    let parsed: unknown = undefined;
    if (text.startsWith("{") || text.startsWith("[")) {
      try {
        const candidate: unknown = JSON.parse(text);
        if (jsonPathKind(candidate) !== "scalar") parsed = candidate;
      } catch {
        parsed = undefined;
      }
    }
    decoded.set(node.key, parsed);
    return parsed;
  }

  // What a node's children are drawn from: its own value, or the document
  // decoded out of it when it holds JSON as text. An embedded document restarts
  // at `$` because that is where the backend evaluates it from once the column
  // is named as a `source`.
  function contents(node: JSONPathNode): { value: unknown; path: string; root?: string } {
    const inner = embedded(node);
    const scope: { value: unknown; path: string; root?: string } =
      inner === undefined
        ? { value: node.value, path: node.path }
        : { value: inner, path: "$" };
    const root = inner === undefined ? node.root : node.root ?? sourceColumn(node.path);
    if (root !== undefined) scope.root = root;
    return scope;
  }

  function node(
    value: unknown,
    path: string,
    key: string,
    root: string | undefined,
  ): JSONPathNode {
    const cached = nodes.get(key);
    if (cached) return cached;
    const created: JSONPathNode = {
      key,
      path,
      value,
      kind: jsonPathKind(value),
      summary: summarizeJSON(value),
      childCount: entryCount(value),
    };
    if (root !== undefined) created.root = root;
    nodes.set(key, created);
    return created;
  }

  function entriesOf(value: unknown): Array<readonly [string | number, unknown]> {
    if (Array.isArray(value)) return value.map((entry, index) => [index, entry] as const);
    if (value !== null && typeof value === "object") return Object.entries(value as Record<string, unknown>);
    return [];
  }

  function materializeChildren(parent: JSONPathNode): JSONPathNode[] {
    if (parent.children) return parent.children;
    const scope = contents(parent);
    const entries = entriesOf(scope.value);
    const limit = Math.min(entries.length, maxChildren);
    const children = entries.slice(0, limit).map(([key, value]) => {
      const path = appendJSONPath(scope.path, key);
      // The key namespaces on the parent so an embedded document — which
      // restarts its paths at `$` — cannot collide with the outer row.
      return node(value, path, `${parent.key}>${path}`, scope.root);
    });
    if (limit < entries.length) {
      children.push({
        key: `${parent.key}>…`,
        path: scope.path,
        value: undefined,
        kind: "more",
        summary: `${entries.length - limit} more not shown — address them by index`,
        childCount: entries.length - limit,
      });
    }
    parent.children = children;
    return children;
  }

  function expandable(node: JSONPathNode): boolean {
    if (node.kind === "more") return false;
    if (node.kind !== "scalar") return node.childCount > 0;
    const inner = embedded(node);
    return inner !== undefined && entryCount(inner) > 0;
  }

  const rootNode = node(json, "$", `${keyPrefix}$`, undefined);

  return {
    roots: json === undefined ? [] : [rootNode],
    getChildren: (node) => node.children,
    hasMoreChildren: (node) => node.children === undefined && expandable(node),
    loadChildren: (parent) => Promise.resolve(materializeChildren(parent)),
    materializePath: (expression) => {
      const segments = literalSegments(expression);
      if (!segments) return undefined;
      let current = rootNode;
      for (const segment of segments) {
        const target = appendJSONPath(contents(current).path, segment);
        const next = materializeChildren(current).find((child) => child.path === target);
        if (!next) return undefined;
        current = next;
      }
      return current;
    },
  };
}

/** The top-level column a row-rooted path starts at, e.g. `$.payload.x` → `payload`. */
function sourceColumn(path: string): string | undefined {
  return literalSegments(path)?.slice(0, 1).map(String)[0];
}

/**
 * The literal key/index chain an expression addresses, or undefined when it
 * selects instead — a wildcard, a descent, or a filter matches a set whose shape
 * depends on the document, so there is no single branch to walk to.
 */
export function literalSegments(expression: string): Array<string | number> | undefined {
  let rest = expression.trim();
  if (rest === "") return undefined;
  if (!rest.startsWith("$")) return undefined;
  rest = rest.slice(1);
  const segments: Array<string | number> = [];
  while (rest.length > 0) {
    if (rest.startsWith("..")) return undefined;
    if (rest.startsWith(".")) {
      const match = /^\.([A-Za-z_$][A-Za-z0-9_$]*)/.exec(rest);
      if (!match) return undefined;
      segments.push(match[1]!);
      rest = rest.slice(match[0].length);
      continue;
    }
    if (rest.startsWith("[")) {
      const close = rest.indexOf("]");
      if (close < 0) return undefined;
      const inner = rest.slice(1, close).trim();
      if (/^\d+$/.test(inner)) segments.push(Number(inner));
      else if (/^"(?:[^"\\]|\\.)*"$/.test(inner)) segments.push(JSON.parse(inner) as string);
      else if (/^'[^']*'$/.test(inner)) segments.push(inner.slice(1, -1));
      else return undefined;
      rest = rest.slice(close + 1);
      continue;
    }
    return undefined;
  }
  return segments;
}
