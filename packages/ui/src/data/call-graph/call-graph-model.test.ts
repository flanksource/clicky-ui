import { describe, expect, it } from "vitest";
import {
  columnGap,
  expandCount,
  expansionDirection,
  hiddenNeighbours,
  mergeGraph,
  toDiagram,
  toggleAccess,
  visibleGraph,
  walkedTotals,
  type DiagramGlyphs,
  type DiagramOptions,
  type GraphView,
} from "./call-graph-model";
import { UIR_CALL_GRAPH_VOCABULARY, type CallGraphVocabulary } from "./call-graph-vocabulary";
import type { CallGraph, CallGraphNode } from "./types";

const LONG_GUARD = "a.very.long.condition(value) == expected";
const PKG = "example.com/mod/pkg";
const CMD = "example.com/mod/cmd/app";
const UIR = UIR_CALL_GRAPH_VOCABULARY;
const GO_LABELS = { call: "call", dispatch: "via interface", read: "read", write: "write" };

function node(id: string, depth: number, totals: { in: number; out: number }, extra: Partial<CallGraphNode> = {}): CallGraphNode {
  return { id, identifier: {}, kind: "func", label: id, group: PKG, depth, ...totals, location: { path: `${id}.go`, line: 1, column: 6 }, ...extra };
}

// far → caller → root → a → c, and root → b (unresolved), root and a → len (builtin), a → Errorf (external).
// As uir reports them: `out` is a total for the root and callees, `in` for the root and callers,
// and the other count is the edges in the response. `a` has two callees and `far` two callers beyond it.
const TINY: CallGraph = {
  roots: ["root"],
  nodes: [
    node("far", -2, { in: 2, out: 1 }, { group: CMD }),
    node("caller", -1, { in: 1, out: 1 }, { group: CMD }),
    node("root", 0, { in: 1, out: 3 }),
    node("a", 1, { in: 1, out: 5 }),
    { id: "b", identifier: {}, kind: "unresolved", label: "fn", group: PKG, depth: 1, in: 1, out: 0, unresolved: true },
    { id: "errorf", identifier: {}, kind: "func", label: "Errorf", group: "fmt", depth: 1, in: 1, out: 0 },
    { id: "len", identifier: {}, kind: "builtin", label: "len", group: "builtin", depth: 1, in: 2, out: 0 },
    node("c", 2, { in: 1, out: 0 }),
  ],
  edges: [
    { id: "far|caller|call", from: "far", to: "caller", type: "call", sites: [{ path: "far.go", line: 4 }] },
    { id: "caller|root|call", from: "caller", to: "root", type: "call", sites: [{ path: "caller.go", line: 7 }, { path: "caller.go", line: 8 }] },
    { id: "root|a|call", from: "root", to: "a", type: "call", sites: [
      { path: "root.go", line: 3, text: "a()", guards: ["x > 0"] },
      { path: "root.go", line: 5, text: "a()", guards: ["!(x > 0)", LONG_GUARD] },
    ] },
    { id: "root|b|call", from: "root", to: "b", type: "call", sites: [{ path: "root.go", line: 9, text: "fn()" }] },
    { id: "root|len|call", from: "root", to: "len", type: "call", sites: [{ path: "root.go", line: 2 }, { path: "root.go", line: 4, guards: ["x > 0"] }] },
    { id: "a|c|dispatch", from: "a", to: "c", type: "dispatch", sites: [{ path: "a.go", line: 2, guards: [LONG_GUARD] }] },
    { id: "a|errorf|call", from: "a", to: "errorf", type: "call", sites: [
      { path: "a.go", line: 5, column: 9, guards: ["err != nil"] },
      { path: "a.go", line: 9, column: 9, guards: ["y", "err != nil"] },
    ] },
    { id: "a|len|call", from: "a", to: "len", type: "call", sites: [{ path: "a.go", line: 3 }] },
  ],
  groups: [{ id: CMD, label: CMD }, { id: "fmt", label: "fmt" }, { id: PKG, label: PKG }, { id: "builtin", label: "builtin" }],
  omitted: { beyond_depth: 2 },
};

const view = (overrides: Partial<GraphView> = {}): GraphView => ({ direction: "both", depth: 1, revealed: [], ...overrides });
const ids = (items: readonly { id: string }[]) => items.map((item) => item.id);
const shown = (overrides: Partial<GraphView> = {}) => {
  const visible = visibleGraph(TINY, view(overrides));
  return { nodes: ids(visible.nodes), edges: ids(visible.edges) };
};
const requireIn = (graph: CallGraph, id: string) => graph.nodes.find((entry) => entry.id === id)!;

describe("visibleGraph", () => {
  it("keeps only the root and callees within the depth for the callees direction", () => {
    expect(shown({ direction: "callees" })).toEqual({
      nodes: ["root", "a", "b", "errorf", "len"],
      edges: ["root|a|call", "root|b|call", "root|len|call", "a|errorf|call", "a|len|call"],
    });
  });

  it("keeps only the root and callers within the depth for the callers direction", () => {
    expect(shown({ direction: "callers", depth: 2 })).toEqual({ nodes: ["far", "caller", "root"], edges: ["far|caller|call", "caller|root|call"] });
  });

  it("keeps a revealed node, and its edges, beyond the depth limit", () => {
    expect(shown({ revealed: ["c"] })).toEqual({
      nodes: ["caller", "root", "a", "b", "errorf", "len", "c"],
      edges: ["caller|root|call", "root|a|call", "root|b|call", "root|len|call", "a|c|dispatch", "a|errorf|call", "a|len|call"],
    });
  });
});

describe("expansion", () => {
  const at = (overrides: Partial<GraphView> = {}) => visibleGraph(TINY, view(overrides));
  const count = (id: string, overrides: Partial<GraphView> = {}, vocabulary: Pick<CallGraphVocabulary, "hasSource"> = UIR) =>
    expandCount(TINY, at(overrides), id, overrides.direction ?? "both", vocabulary);

  it("lists the hidden callees of a callee and the hidden callers of a caller", () => {
    expect([hiddenNeighbours(TINY, at(), "a"), hiddenNeighbours(TINY, at(), "caller")]).toEqual([["c"], ["far"]]);
  });

  it("counts the walked side's total minus the edges drawn there", () => {
    expect({ a: count("a"), aDeep: count("a", { depth: 2 }), caller: count("caller"), callerDeep: count("caller", { depth: 2 }), far: count("far", { depth: 2 }) })
      .toEqual({ a: 3, aDeep: 2, caller: 1, callerDeep: 0, far: 2 });
  });

  it("offers no expansion for a node the vocabulary says has no source, however many calls it has", () => {
    const busy = (id: string) => ({ ...TINY, nodes: TINY.nodes.map((entry) => (entry.id === id ? { ...entry, out: 4 } : entry)) });
    expect(["b", "errorf", "len"].map((id) => expandCount(busy(id), at(), id, "both", UIR))).toEqual([0, 0, 0]);
  });

  it("expands a node without a location when the vocabulary says it has a source", () => {
    const noLocations = { ...TINY, nodes: TINY.nodes.map((entry) => {
      const copy = { ...entry };
      delete copy.location;
      return copy;
    }) };
    const sourced = { hasSource: (entry: CallGraphNode) => !entry.unresolved };
    expect([expandCount(noLocations, at(), "a", "both", UIR), expandCount(noLocations, at(), "a", "both", sourced)]).toEqual([0, 3]);
  });

  it("offers no expansion on the side the direction filter hides", () => {
    expect(count("root", { direction: "callers" })).toBe(0);
  });

  it("never goes negative when a total is short of the edges drawn", () => {
    const short = { ...TINY, nodes: TINY.nodes.map((entry) => (entry.id === "a" ? { ...entry, out: 1 } : entry)) };
    expect(expandCount(short, visibleGraph(short, view({ depth: 2 })), "a", "both", UIR)).toBe(0);
  });

  it("walks an expansion toward the node's outer side: callers for a caller, callees for the root and callees", () => {
    expect(["far", "caller", "root", "a"].map((id) => expansionDirection(requireIn(TINY, id)))).toEqual(["callers", "callers", "callees", "callees"]);
  });
});

describe("mergeGraph", () => {
  // One hop around a: a is its root, so its depths count from a.
  const fromA: CallGraph = {
    roots: ["a"],
    nodes: [
      { ...requireIn(TINY, "a"), depth: 0 },
      { ...requireIn(TINY, "c"), depth: 1 },
      { ...requireIn(TINY, "errorf"), depth: 1 },
      node("d", 1, { in: 1, out: 4 }, { group: "example.com/mod/other" }),
    ],
    edges: [
      { id: "a|c|dispatch", from: "a", to: "c", type: "dispatch", sites: [{ path: "a.go", line: 2, guards: [LONG_GUARD] }], properties: { plans: "GL, CL" } },
      { id: "a|errorf|call", from: "a", to: "errorf", type: "call", sites: [
        { path: "a.go", line: 5, column: 9, guards: ["err != nil"] },
        { path: "a.go", line: 12, column: 9 },
      ] },
      { id: "a|d|call", from: "a", to: "d", type: "call", sites: [{ path: "a.go", line: 14 }] },
    ],
    groups: [{ id: PKG, label: PKG }, { id: "example.com/mod/other", label: "example.com/mod/other" }],
    omitted: {},
  };

  it("adds the new nodes at depths re-signed from the expanded node, keeping the held ones as they were", () => {
    const merged = mergeGraph(TINY, fromA);
    expect(merged.nodes.map(({ id, depth }) => [id, depth])).toEqual([...TINY.nodes.map(({ id, depth }) => [id, depth]), ["d", 2]]);
  });

  it("deduplicates edges by from, to and type, concatenating the call sites not already held", () => {
    const merged = mergeGraph(TINY, fromA);
    expect({
      edges: ids(merged.edges).slice(TINY.edges.length),
      errorf: merged.edges.find((edge) => edge.id === "a|errorf|call")!.sites.map((site) => site.line),
      dispatch: merged.edges.find((edge) => edge.id === "a|c|dispatch")!.sites.length,
    }).toEqual({ edges: ["a|d|call"], errorf: [5, 9, 12], dispatch: 1 });
  });

  it("keeps a held edge's properties, and takes the expansion's when the held edge has none", () => {
    const withPlans = { ...TINY, edges: TINY.edges.map((edge) => (edge.id === "a|errorf|call" ? { ...edge, properties: { plans: "GL" } } : edge)) };
    const expansion = { ...fromA, edges: fromA.edges.map((edge) => (edge.id === "a|errorf|call" ? { ...edge, properties: { plans: "CL" } } : edge)) };
    const merged = mergeGraph(withPlans, expansion);
    expect(["a|errorf|call", "a|c|dispatch"].map((id) => merged.edges.find((edge) => edge.id === id)!.properties)).toEqual([{ plans: "GL" }, { plans: "GL, CL" }]);
  });

  it("adds the groups the expansion brought and keeps the held response's other fields", () => {
    const merged = mergeGraph(TINY, fromA);
    expect({ groups: merged.groups?.map((group) => group.id), roots: merged.roots, omitted: merged.omitted })
      .toEqual({ groups: [CMD, "fmt", PKG, "builtin", "example.com/mod/other"], roots: ["root"], omitted: { beyond_depth: 2 } });
  });

  it("re-signs a caller expansion further left", () => {
    const fromCaller: CallGraph = { roots: ["caller"], omitted: {}, nodes: [
      { ...requireIn(TINY, "caller"), depth: 0 }, { ...requireIn(TINY, "far"), depth: -1 }, node("other", -1, { in: 0, out: 1 }),
    ], edges: [] };
    expect(mergeGraph(TINY, fromCaller).nodes.at(-1)).toMatchObject({ id: "other", depth: -2 });
  });

  it("keeps the host's own response fields on the held graph", () => {
    const held = { ...TINY, stages: ["resolved"] };
    expect(mergeGraph(held, fromA).stages).toEqual(["resolved"]);
  });

  it("fails when the expansion's root is not in the held graph", () => {
    expect(() => mergeGraph(TINY, { ...fromA, roots: ["missing"] })).toThrow(/expansion root "missing" is not in the held graph/);
  });
});

// A rule that reads and writes AsPolicy and calls a procedure, which writes a column.
const DATA: CallGraph = {
  roots: ["r"],
  nodes: [
    node("r", 0, { in: 0, out: 3 }),
    { id: "table:AsPolicy", identifier: {}, kind: "table", label: "AsPolicy", group: "Database", depth: 1, in: 2, out: 0 },
    { id: "procedure:P", identifier: {}, kind: "procedure", label: "P", group: "Database", depth: 1, in: 1, out: 1 },
    { id: "column:AsClassGroup.STATUSCODE", identifier: {}, kind: "column", label: "STATUSCODE", group: "AsClassGroup", depth: 2, in: 1, out: 0 },
  ],
  edges: [
    { id: "r|table:AsPolicy|read", from: "r", to: "table:AsPolicy", type: "read", kind: "sql", sites: [{ path: "r", line: 3, text: "SELECT PLANGUID FROM AsPolicy" }], properties: { columns: "PLANGUID, STATUSCODE" } },
    { id: "r|table:AsPolicy|write", from: "r", to: "table:AsPolicy", type: "write", kind: "copyto", sites: [{ path: "r", line: 9, guards: ["IsGroupScheme = 'Y'"] }], properties: { columns: "STATUSCODE" } },
    { id: "r|procedure:P|call", from: "r", to: "procedure:P", type: "call", kind: "exec", sites: [{ path: "r", line: 12, text: "EXEC P" }] },
    { id: "procedure:P|column:AsClassGroup.STATUSCODE|write", from: "procedure:P", to: "column:AsClassGroup.STATUSCODE", type: "write", kind: "sql", sites: [{ path: "P", line: 4 }] },
  ],
  groups: [{ id: PKG, label: PKG }, { id: "Database", label: "Database" }, { id: "AsClassGroup", label: "AsClassGroup" }],
  omitted: {},
};
const DATA_LABELS = { call: "call", dispatch: "dispatch", read: "reads", write: "writes" };

describe("graph facts", () => {
  it("reports a node's totals only on the side the response walked", () => {
    const calleesOnly = { ...TINY, nodes: TINY.nodes.filter((entry) => entry.depth >= 0) };
    expect([
      walkedTotals(TINY, requireIn(TINY, "root"), UIR),
      walkedTotals(TINY, requireIn(TINY, "a"), UIR),
      walkedTotals(TINY, requireIn(TINY, "caller"), UIR),
      walkedTotals(calleesOnly, requireIn(calleesOnly, "root"), UIR),
    ]).toEqual([{ callers: 1, callees: 3 }, { callees: 5 }, { callers: 1 }, { callees: 3 }]);
  });

  it("counts a data node's readers, writers and callers by the type of the edges into it, leaving out none", () => {
    expect(["table:AsPolicy", "procedure:P", "column:AsClassGroup.STATUSCODE"].map((id) => walkedTotals(DATA, requireIn(DATA, id), UIR))).toEqual([
      { readers: 1, writers: 1 },
      { callers: 1 },
      { writers: 1 },
    ]);
  });
});

describe("toggleAccess", () => {
  it("turns an access type off or back on in the usual order", () => {
    expect([toggleAccess(["call", "read", "write"], "read"), toggleAccess(["write"], "call"), toggleAccess(["call", "write"], "read")]).toEqual([
      ["call", "write"], ["call", "write"], ["call", "read", "write"],
    ]);
  });

  it("refuses to turn the last access type off", () => {
    expect(() => toggleAccess(["write"], "write")).toThrow("call graph: write is the only access type on");
  });
});

describe("mergeGraph of data access", () => {
  it("keeps a read and a write between the same nodes apart, each gaining its own new sites", () => {
    const expansion: CallGraph = {
      roots: ["r"],
      nodes: [{ ...requireIn(DATA, "r"), depth: 0 }, { ...requireIn(DATA, "table:AsPolicy"), depth: 1 }],
      edges: [
        { id: "r|table:AsPolicy|write", from: "r", to: "table:AsPolicy", type: "write", kind: "copyto", sites: [{ path: "r", line: 20 }] },
        { id: "r|table:AsPolicy|read", from: "r", to: "table:AsPolicy", type: "read", kind: "sql", sites: [{ path: "r", line: 3, text: "SELECT PLANGUID FROM AsPolicy" }] },
      ],
      omitted: {},
    };
    const merged = mergeGraph(DATA, expansion);
    expect(merged.edges.filter((edge) => edge.to === "table:AsPolicy").map((edge) => [edge.id, edge.sites.map((site) => site.line), edge.properties?.columns])).toEqual([
      ["r|table:AsPolicy|read", [3], "PLANGUID, STATUSCODE"],
      ["r|table:AsPolicy|write", [9, 20], "STATUSCODE"],
    ]);
  });
});

describe("toDiagram of data access", () => {
  const glyphs: DiagramGlyphs = { node: (glyph) => `[${glyph}]`, edge: (type) => (type === "call" ? undefined : `[${type}]`), group: (caption) => caption };
  const diagram = toDiagram({
    graph: DATA, visible: visibleGraph(DATA, view({ depth: 2 })), direction: "both",
    options: { guardLabel: "innermost", truncateAt: 24, grouped: true }, glyphs, vocabulary: UIR, edgeLabels: DATA_LABELS,
  });

  it("draws a read green and a write amber, each with its icon and words, and an exec as a plain call", () => {
    expect(diagram.edges).toEqual([
      { id: "r|table:AsPolicy|read", from: "r", to: "table:AsPolicy", dashed: false, tone: "success", icon: "[read]", iconLabel: "reads", title: "columns: PLANGUID, STATUSCODE" },
      { id: "r|table:AsPolicy|write", from: "r", to: "table:AsPolicy", dashed: true, tone: "warning", icon: "[write]", iconLabel: "writes", label: "IsGroupScheme = 'Y'", title: "IsGroupScheme = 'Y'\ncolumns: STATUSCODE" },
      { id: "r|procedure:P|call", from: "r", to: "procedure:P", dashed: false },
      { id: "procedure:P|column:AsClassGroup.STATUSCODE|write", from: "procedure:P", to: "column:AsClassGroup.STATUSCODE", dashed: false, tone: "warning", icon: "[write]", iconLabel: "writes" },
    ]);
  });

  it("never dims a data node, though it has no location", () => {
    expect(diagram.nodes.filter((entry) => entry.muted).map((entry) => entry.id)).toEqual([]);
  });

  it("draws a data node without a body of its own compact, unless it is the root, and every other node at the regular size", () => {
    const sized = (vocabulary: CallGraphVocabulary) =>
      toDiagram({ graph: DATA, visible: visibleGraph(DATA, view({ depth: 2 })), direction: "both", options: { guardLabel: "innermost", truncateAt: 24, grouped: true }, glyphs, vocabulary, edgeLabels: DATA_LABELS })
        .nodes.map((entry) => [entry.id, entry.size ?? "regular"]);
    const procedureHasBody = { ...UIR, hasSource: (entry: CallGraphNode) => entry.kind === "procedure" || UIR.hasSource(entry) };
    expect({ uir: sized(UIR), procedureHasBody: sized(procedureHasBody) }).toEqual({
      uir: [["r", "regular"], ["table:AsPolicy", "compact"], ["procedure:P", "compact"], ["column:AsClassGroup.STATUSCODE", "compact"]],
      procedureHasBody: [["r", "regular"], ["table:AsPolicy", "compact"], ["procedure:P", "regular"], ["column:AsClassGroup.STATUSCODE", "compact"]],
    });
  });
});

describe("toDiagram", () => {
  const options: DiagramOptions = { guardLabel: "innermost", truncateAt: 24, grouped: true };
  const glyphs: DiagramGlyphs = {
    node: (glyph, words) => `[${glyph}|${words}]`,
    edge: (type) => (type === "dispatch" ? "[dispatch]" : undefined),
    group: (caption) => `[group|${caption}]`,
  };
  const diagram = (overrides: Partial<DiagramOptions> = {}, viewOverrides: Partial<GraphView> = { revealed: ["c"] }) =>
    toDiagram({ graph: TINY, visible: visibleGraph(TINY, view(viewOverrides)), direction: "both", options: { ...options, ...overrides }, glyphs, vocabulary: UIR, edgeLabels: GO_LABELS });
  const FUNC = "[func|function]";

  it("maps nodes to icons, tooltips, levels, groups, tones, muting and expand counts", () => {
    expect(diagram().nodes).toEqual([
      { id: "root", label: "root", icon: FUNC, title: `function root in ${PKG}`, level: 0, group: PKG, tone: "info" },
      { id: "a", label: "a", icon: FUNC, title: `function a in ${PKG}`, level: 1, group: PKG, expandCount: 2 },
      { id: "b", label: "fn", icon: "[unresolved|unresolved call]", title: `unresolved call fn in ${PKG}`, level: 1, group: PKG, tone: "warning", muted: true },
      { id: "c", label: "c", icon: FUNC, title: `function c in ${PKG}`, level: 2, group: PKG },
      { id: "caller", label: "caller", icon: FUNC, title: `function caller in ${CMD}`, level: -1, group: CMD, expandCount: 1 },
      { id: "errorf", label: "Errorf", icon: "[external_func|external function]", title: "external function Errorf in fmt", level: 1, group: "fmt", muted: true },
      { id: "len", label: "len", icon: "[builtin|builtin]", title: "builtin len in builtin", level: 1, group: "builtin", muted: true },
    ]);
  });

  it("orders nodes so the root's group comes first, then groups with sources, then the others", () => {
    expect(diagram({}, { depth: 2 }).nodes.map((entry) => entry.group)).toEqual([PKG, PKG, PKG, PKG, CMD, CMD, "fmt", "builtin"]);
  });

  it("maps edges to dashed, labelled and titled diagram edges, with the host's words on a dispatch edge", () => {
    expect(diagram().edges).toEqual([
      { id: "caller|root|call", from: "caller", to: "root", dashed: false, label: "×2" },
      { id: "root|a|call", from: "root", to: "a", dashed: true, label: "2 conditions ×2", title: `x > 0\n!(x > 0) ∧ ${LONG_GUARD}` },
      { id: "root|b|call", from: "root", to: "b", dashed: false },
      { id: "root|len|call", from: "root", to: "len", dashed: false, label: "×2", title: "x > 0" },
      { id: "a|c|dispatch", from: "a", to: "c", dashed: true, tone: "info", icon: "[dispatch]", iconLabel: "via interface", label: "a.very.long.conditio…", title: LONG_GUARD },
      { id: "a|errorf|call", from: "a", to: "errorf", dashed: true, label: "err != nil ×2", title: "err != nil\ny ∧ err != nil" },
      { id: "a|len|call", from: "a", to: "len", dashed: false },
    ]);
  });

  it("captions each group with its shortened label and keeps the full label as its tooltip", () => {
    expect(diagram().groups).toEqual([
      { id: CMD, label: "[group|cmd/app]", title: CMD },
      { id: "fmt", label: "[group|fmt]", title: "fmt" },
      { id: PKG, label: "[group|mod/pkg]", title: PKG },
      { id: "builtin", label: "[group|builtin]", title: "builtin" },
    ]);
  });

  it("drops groups when grouping is off", () => {
    const ungrouped = diagram({ grouped: false });
    expect({ groups: ungrouped.groups, grouped: ungrouped.nodes.filter((entry) => entry.group !== undefined) }).toEqual({ groups: [], grouped: [] });
  });
});

describe("columnGap", () => {
  const nodes = [{ id: "root", level: 0 }, { id: "a", level: 1 }, { id: "b", level: 1 }];
  const twentyChars = "x".repeat(20);

  it("fits the longest pill between two columns: 5.2px a character plus 22px", () => {
    expect(columnGap({ nodes, edges: [{ id: "root-a", from: "root", to: "a", label: "short" }, { id: "root-b", from: "root", to: "b", label: twentyChars }] })).toBe(126);
  });

  it("ignores the pill of an edge inside one column, which hangs outside the column instead", () => {
    expect(columnGap({ nodes, edges: [{ id: "root-a", from: "root", to: "a", label: twentyChars }, { id: "a-b", from: "a", to: "b", label: "x".repeat(40) }] })).toBe(126);
  });

  it("counts an edge's icon as three characters", () => {
    expect(columnGap({ nodes, edges: [{ id: "root-a", from: "root", to: "a", label: twentyChars, icon: "[dispatch]" }] })).toBe(142);
  });

  it("is never narrower than 96px, the room an edge needs to curve", () => {
    expect(columnGap({ nodes, edges: [{ id: "root-a", from: "root", to: "a" }] })).toBe(96);
  });
});
