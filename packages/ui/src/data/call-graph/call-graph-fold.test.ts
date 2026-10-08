import { describe, expect, it } from "vitest";
import { collapsibleGroups, toDiagram, type DiagramGlyphs } from "./call-graph-model";
import { DATA_CLIENT_COLUMNS, DATA_IDS, oipaDataGraph, OIPA_VOCABULARY } from "./call-graph.fixtures";
import type { CallGraph } from "./types";

const LABELS = { call: "call", dispatch: "dispatch", read: "reads", write: "writes" };
const glyphs: DiagramGlyphs = {
  node: (glyph) => `[${glyph}]`,
  edge: (type) => (type === "call" ? undefined : `[${type}]`),
  group: (caption) => caption,
  access: (access) => `<${access}>`,
};
// SchemeInstall → packet, which reads ten AsClient columns in one SQL site, reads two AsPolicy columns,
// reads and writes Policy:PolicyStatus, reads Policy:SchemeNumber, reads AsActivity and calls a procedure
// that writes AsClassGroup.STATUSCODE. The root's group is the plan.
const GRAPH: CallGraph = oipaDataGraph({ access: ["call", "read", "write"], columns: true });
const PLAN = GRAPH.nodes.find((node) => node.id === DATA_IDS.install)?.group ?? "";
const draw = (collapsed?: readonly string[], graph: CallGraph = GRAPH) =>
  toDiagram({
    graph, visible: graph, direction: "both", options: { grouped: true, guardLabel: "none", truncateAt: 24 }, glyphs, vocabulary: OIPA_VOCABULARY, edgeLabels: LABELS,
    ...(collapsed ? { collapsed } : {}),
  });

describe("collapsibleGroups", () => {
  it("lists every drawn group but the root's", () => {
    expect(collapsibleGroups(GRAPH, GRAPH).sort()).toEqual(["AsClassGroup", "AsClient", "AsPolicy", "Database", "Policy"]);
  });
});

describe("toDiagram of collapsed groups", () => {
  it("folds a collapsed table into one stand-in whose merged read lists every column it stands for", () => {
    const diagram = draw(["AsClient"]);
    const read = diagram.drawn.visible.edges.find((edge) => edge.to === "group:AsClient");
    expect({
      members: diagram.nodes.filter((node) => node.id.startsWith("column:AsClient.")).length,
      standIn: diagram.nodes.find((node) => node.id === "group:AsClient"),
      read,
      drawn: diagram.edges.find((edge) => edge.id === read?.id),
      folded: diagram.drawn.folds.get("group:AsClient")?.members.length,
      merged: [...diagram.drawn.merged.keys()],
    }).toEqual({
      members: 0,
      standIn: expect.objectContaining({ id: "group:AsClient", label: "AsClient", group: "AsClient", level: 2, size: "compact" }),
      read: {
        id: `${DATA_IDS.packet}|group:AsClient|read`, from: DATA_IDS.packet, to: "group:AsClient", type: "read", kind: "sql",
        sites: [expect.objectContaining({ path: "SchemeInstallPacket", line: 13 })],
        properties: { columns: DATA_CLIENT_COLUMNS.join(", ") },
      },
      drawn: expect.objectContaining({ tone: "success", label: "10 columns" }),
      folded: 10,
      merged: [`${DATA_IDS.packet}|group:AsClient|read`],
    });
  });

  it("keeps a read and a write of a collapsed entity apart, each listing the fields it touches", () => {
    const edges = draw(["Policy"]).drawn.visible.edges.filter((edge) => edge.to === "group:Policy");
    expect(edges.map((edge) => [edge.type, edge.kind, edge.sites.map((site) => site.line), edge.properties])).toEqual([
      ["read", "field-ref", [6, 9], { fields: "PolicyStatus, SchemeNumber" }],
      ["write", "mathupdate", [8], { fields: "PolicyStatus" }],
    ]);
  });

  it("marks collapsible groups open or collapsed and counts what a collapsed one holds, leaving the root's group alone", () => {
    const groups = Object.fromEntries(draw(["AsClient", "Policy", PLAN]).groups.map((group) => [group.id, [group.collapsed, group.aside]]));
    expect(groups).toEqual({
      [PLAN]: [undefined, undefined],
      AsClient: [true, "10 columns"],
      Policy: [true, "2 fields"],
      AsPolicy: [false, undefined],
      AsClassGroup: [false, undefined],
      Database: [false, undefined],
    });
  });

  it("never folds the root's group, even when asked to", () => {
    expect(draw([PLAN]).nodes.map((node) => node.id)).toContain(DATA_IDS.install);
  });

  it("merges an edge between two collapsed groups onto both stand-ins, counting the members on both ends", () => {
    const diagram = draw(["Database", "AsClassGroup"]);
    const between = diagram.edges.find((edge) => edge.from === "group:Database" && edge.to === "group:AsClassGroup");
    expect({ between: between?.label, standIns: diagram.nodes.filter((node) => node.id.startsWith("group:")).map((node) => node.id).sort() })
      .toEqual({ between: "2 members", standIns: ["group:AsClassGroup", "group:Database"] });
  });

  it("counts each merged edge as every edge it stands for, so folding adds no +N to the node at its other end", () => {
    const expandOf = (diagram: ReturnType<typeof draw>) => diagram.nodes.find((node) => node.id === DATA_IDS.packet)?.expandCount;
    expect({ open: expandOf(draw([])), folded: expandOf(draw(["AsClient", "Policy", "AsPolicy"])) }).toEqual({ open: undefined, folded: undefined });
  });

  it("draws nothing collapsible when the host offers no collapse", () => {
    expect(draw().groups.every((group) => group.collapsed === undefined)).toBe(true);
  });
});

describe("toDiagram access marks", () => {
  it("marks a node by how the reads and writes into it access it, and leaves the rest unmarked", () => {
    const marks = Object.fromEntries(draw().nodes.map((node) => [node.id, node.mark]));
    expect([DATA_IDS.policyStatus, DATA_IDS.schemeNumber, DATA_IDS.classGroupStatus, DATA_IDS.packet, DATA_IDS.proc].map((id) => marks[id])).toEqual([
      "<readwrite>", "<read>", "<write>", undefined, undefined,
    ]);
  });
});
