import { describe, expect, it } from "vitest";
import {
  interfaceMethods,
  isBuiltin,
  isExternal,
  nodeTitle,
  requireGlyph,
  UIR_CALL_GRAPH_VOCABULARY as UIR,
  usedGlyphs,
} from "./call-graph-vocabulary";
import type { CallGraph, CallGraphEdge, CallGraphNode, CallGraphSite } from "./types";

const PKG = "example.com/mod/pkg";
const located = { location: { path: "x.go", line: 1 } };

function node(id: string, kind: string, extra: Partial<CallGraphNode> = {}): CallGraphNode {
  return { id, identifier: {}, kind, label: id, depth: 1, in: 1, out: 0, ...extra };
}

function edge(from: string, to: string, type: CallGraphEdge["type"], sites: CallGraphSite[]): CallGraphEdge {
  return { id: `${from}|${to}|${type}`, from, to, type, sites };
}

const at = (line: number): CallGraphSite => ({ path: "x.go", line, column: 3 });

// `caller` calls the interface method `iface` at line 7, which dispatches to `impl` from that same site.
const KINDS: CallGraph = {
  roots: ["caller"],
  nodes: [
    node("caller", "func", { ...located, depth: 0, group: PKG }),
    node("fn", "func", { ...located, group: PKG }),
    node("meth", "method", { ...located, group: PKG }),
    node("iface", "method", { ...located }),
    node("impl", "method", { ...located }),
    node("loop", "func", { ...located, group: PKG }),
    node("len", "builtin", { group: "builtin" }),
    node("scope", "package", { group: PKG }),
    node("typ", "type", { ...located }),
    node("fld", "field", { ...located }),
    node("v", "var", { ...located }),
    node("c", "const", { ...located }),
    node("extFn", "func", { group: "fmt" }),
    node("extMeth", "method", { group: "gorm.io/gorm" }),
    node("lost", "unresolved", { unresolved: true, group: PKG }),
    node("odd", "closure", { ...located }),
  ],
  edges: [
    edge("caller", "iface", "call", [at(7)]),
    edge("caller", "impl", "dispatch", [at(7)]),
    edge("caller", "fn", "call", [at(9)]),
    edge("loop", "loop", "call", [at(4)]),
  ],
  groups: [{ id: PKG, label: PKG }],
  omitted: {},
};
const each = <T>(read: (graph: CallGraph, node: CallGraphNode) => T) => Object.fromEntries(KINDS.nodes.map((entry) => [entry.id, read(KINDS, entry)]));

describe("the uir vocabulary", () => {
  it("finds the interface methods: call targets whose call site also dispatches", () => {
    expect([...interfaceMethods(KINDS)]).toEqual(["iface"]);
  });

  it("calls only a builtin kind a builtin", () => {
    expect(KINDS.nodes.filter(isBuiltin).map((entry) => entry.id)).toEqual(["len"]);
  });

  it("calls a node external when it has no source and is not a builtin, a package scope or unresolved", () => {
    expect(KINDS.nodes.filter(isExternal).map((entry) => entry.id)).toEqual(["extFn", "extMeth"]);
  });

  it("picks one glyph per node: unresolved, builtin and package scope first, then recursion, then the kind", () => {
    expect(each(UIR.glyphOf)).toEqual({
      caller: "func", fn: "func", meth: "method", iface: "interface_method", impl: "method", loop: "recursive",
      len: "builtin", scope: "package", typ: "type", fld: "field", v: "var", c: "const",
      extFn: "external_func", extMeth: "method", lost: "unresolved", odd: "symbol",
    });
  });

  it("says in words what a node is, keeping the kind its glyph may not show", () => {
    expect(each(UIR.kindOf)).toEqual({
      caller: "function", fn: "function", meth: "method", iface: "interface method", impl: "method",
      loop: "recursive function", len: "builtin", scope: "package scope", typ: "type", fld: "field",
      v: "variable", c: "constant", extFn: "external function", extMeth: "external method",
      lost: "unresolved call", odd: "closure",
    });
  });

  it("gives a source only to a located node, and dims the unresolved, builtin and external ones", () => {
    const sourced = KINDS.nodes.filter((entry) => UIR.hasSource(entry)).map((entry) => entry.id);
    const muted = KINDS.nodes.filter((entry) => UIR.muted(entry)).map((entry) => entry.id);
    expect({ sourced, muted }).toEqual({
      sourced: ["caller", "fn", "meth", "iface", "impl", "loop", "typ", "fld", "v", "c", "odd"],
      muted: ["len", "extFn", "extMeth", "lost"],
    });
  });

  it("titles a node with its kind, its label and its group's full label", () => {
    const titled = ["fn", "extMeth"].map((id) => nodeTitle(KINDS, KINDS.nodes.find((entry) => entry.id === id)!, UIR));
    expect(titled).toEqual([`function fn in ${PKG}`, "external method extMeth in gorm.io/gorm"]);
  });

  it("lists the glyphs a graph uses once each, in legend order", () => {
    expect(usedGlyphs(KINDS, UIR).map((glyph) => glyph.id)).toEqual([
      "func", "method", "interface_method", "recursive", "external_func", "builtin", "type", "field", "var", "const", "package", "unresolved", "symbol",
    ]);
  });

  it("fails for a glyph it does not list", () => {
    expect(() => requireGlyph(UIR, "copybook")).toThrow('call graph: the vocabulary has no glyph "copybook"');
  });
});

describe("data nodes in the uir vocabulary", () => {
  const data = (id: string, kind: string, label: string, group: string, properties?: Record<string, string>): CallGraphNode =>
    node(id, kind, { label, group, ...(properties ? { properties } : {}) });
  const DATA = [
    data("table:AsPolicy", "table", "AsPolicy", "Database"),
    data("column:AsPolicy.STATUSCODE", "column", "STATUSCODE", "AsPolicy"),
    data("procedure:Update_ClassGroup", "procedure", "Update_ClassGroup", "Database"),
    data("entity:Policy", "entity", "Policy", "Fields"),
    data("field:Policy.PolicyStatus", "field", "PolicyStatus", "Policy", { column: "AsPolicy.STATUSCODE" }),
    data("field:Policy.SchemeNumber", "field", "SchemeNumber", "Policy", { storage: "AsPolicyField" }),
  ];
  const GRAPH: CallGraph = { roots: ["table:AsPolicy"], nodes: DATA, edges: [], omitted: {} };
  const read = <T>(fn: (entry: CallGraphNode) => T) => Object.fromEntries(DATA.map((entry) => [entry.id, fn(entry)]));

  it("knows a table, column, procedure, entity and field as data, a struct field included, and nothing else", () => {
    expect([DATA.every((entry) => UIR.isData(entry)), KINDS.nodes.filter((entry) => UIR.isData(entry)).map((entry) => entry.id)]).toEqual([true, ["fld"]]);
  });

  it("calls each data kind by its own words", () => {
    expect(read((entry) => UIR.kindOf(GRAPH, entry))).toEqual({
      "table:AsPolicy": "table", "column:AsPolicy.STATUSCODE": "column", "procedure:Update_ClassGroup": "stored procedure",
      "entity:Policy": "entity", "field:Policy.PolicyStatus": "field", "field:Policy.SchemeNumber": "field",
    });
  });

  it("never dims a data node or calls it external, though it has no location", () => {
    expect({ muted: DATA.filter((entry) => UIR.muted(entry)), external: DATA.filter(isExternal) }).toEqual({ muted: [], external: [] });
  });

  it("lets a data node be a root without a source, and keeps a located node rootable", () => {
    expect({
      data: read((entry) => [UIR.canRoot(entry), UIR.hasSource(entry)]),
      located: UIR.canRoot(KINDS.nodes.find((entry) => entry.id === "fn")!),
      external: UIR.canRoot(KINDS.nodes.find((entry) => entry.id === "extFn")!),
    }).toMatchObject({ data: { "table:AsPolicy": [true, false], "field:Policy.SchemeNumber": [true, false] }, located: true, external: false });
  });

  it("gives each data kind its own glyph and status words", () => {
    expect({ glyphs: read((entry) => UIR.glyphOf(GRAPH, entry)), status: read((entry) => UIR.status(entry)) }).toEqual({
      glyphs: {
        "table:AsPolicy": "table", "column:AsPolicy.STATUSCODE": "column", "procedure:Update_ClassGroup": "procedure",
        "entity:Policy": "entity", "field:Policy.PolicyStatus": "field", "field:Policy.SchemeNumber": "field",
      },
      status: {
        "table:AsPolicy": "Table AsPolicy",
        "column:AsPolicy.STATUSCODE": "Column AsPolicy.STATUSCODE",
        "procedure:Update_ClassGroup": "Stored procedure Update_ClassGroup",
        "entity:Policy": "Policy fields",
        "field:Policy.PolicyStatus": "Policy field → AsPolicy.STATUSCODE",
        "field:Policy.SchemeNumber": "Policy field, dynamic, stored in AsPolicyField",
      },
    });
  });

  it("names the column behind a field, and nothing behind a dynamic field or a column", () => {
    expect(read((entry) => UIR.backing?.(entry))).toEqual({
      "table:AsPolicy": undefined,
      "column:AsPolicy.STATUSCODE": undefined,
      "procedure:Update_ClassGroup": undefined,
      "entity:Policy": undefined,
      "field:Policy.PolicyStatus": { id: "column:AsPolicy.STATUSCODE", label: "AsPolicy.STATUSCODE" },
      "field:Policy.SchemeNumber": undefined,
    });
  });
});
