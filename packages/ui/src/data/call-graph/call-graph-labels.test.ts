import { describe, expect, it } from "vitest";
import { edgeLabel, edgeTitle, excludedTally, groupCaption, memberAccess, memberChips, omittedParts, propertyLines, truncate, type PillOptions } from "./call-graph-labels";
import type { CallGraphEdge, CallGraphSite } from "./types";

const LONG_GUARD = "a.very.long.condition(value) == expected";

function edge(type: CallGraphEdge["type"], sites: CallGraphSite[], properties?: Record<string, string>): CallGraphEdge {
  return { id: `a|b|${type}`, from: "a", to: "b", type, sites, ...(properties ? { properties } : {}) };
}

const at = (line: number, guards?: string[]): CallGraphSite => ({ path: "x.go", line, column: 3, ...(guards ? { guards } : {}) });

describe("omittedParts", () => {
  it("says what the response left out, totalling the excluded nodes and leaving out what is zero", () => {
    expect([
      omittedParts({ beyond_depth: 9 }),
      omittedParts({ node_limit: true, beyond_depth: 2, unresolved: 1, unreadable_source: ["a.go"], excluded: { fmt: 3, builtin: 4 } }),
      omittedParts({ excluded: { "gorm.io/gorm": 1 } }),
      omittedParts({}),
    ]).toEqual([
      ["9 beyond depth"],
      ["node limit reached", "2 beyond depth", "1 unresolved", "1 unreadable file", "7 excluded"],
      ["1 excluded"],
      [],
    ]);
  });

  it("tallies the excluded nodes per group, most first, then by name", () => {
    expect(excludedTally({ excluded: { strings: 2, fmt: 5, "gorm.io/gorm": 2 } })).toEqual([
      { group: "fmt", count: 5 },
      { group: "gorm.io/gorm", count: 2 },
      { group: "strings", count: 2 },
    ]);
  });
});

describe("groupCaption", () => {
  it.each([
    ["fmt", "fmt"],
    ["gorm.io/gorm", "gorm.io/gorm"],
    ["github.com/flanksource/uir/query", "uir/query"],
    ["golang.org/x/sync/errgroup", "sync/errgroup"],
    ["Plan GL", "Plan GL"],
  ])("shortens %j to its last two segments: %j", (path, caption) => {
    expect(groupCaption(path)).toBe(caption);
  });
});

describe("truncate", () => {
  it.each([
    ["x > 0", 8, "x > 0"],
    ["exactly8", 8, "exactly8"],
    [LONG_GUARD, 16, "a.very.long.con…"],
    ["trailing space cut", 10, "trailing…"],
  ])("cuts %j to at most %i characters", (text, max, expected) => {
    expect(truncate(text, max)).toBe(expected);
  });
});

describe("edgeLabel", () => {
  const options: PillOptions = { guardLabel: "innermost", truncateAt: 24 };
  const label = (type: CallGraphEdge["type"], sites: CallGraphSite[], overrides: Partial<PillOptions> = {}) => edgeLabel(edge(type, sites), { ...options, ...overrides });

  it("gives an unguarded single-site edge no pill text, dispatch or not", () => {
    expect([label("call", [at(1)]), label("dispatch", [at(1)])]).toEqual([undefined, undefined]);
  });

  it("shows only the site count when one site of several is unguarded", () => {
    expect(label("call", [at(1), at(2, ["err != nil"])])).toBe("×2");
  });

  it("shows the guard every site shares, cut to length, and the site count", () => {
    expect([
      label("call", [at(1, ["x > 0"])]),
      label("call", [at(1, [LONG_GUARD])]),
      label("call", [at(1, ["ok", "err != nil"]), at(2, ["err != nil"])]),
    ]).toEqual(["x > 0", "a.very.long.condition(v…", "err != nil ×2"]);
  });

  it("counts the distinct conditions when the sites' guards differ, rather than show one of them", () => {
    const sites = [at(1, ["ok", "err != nil"]), at(2, ["err != nil"]), at(3, ["ready"])];
    expect([label("call", sites), label("call", sites, { guardLabel: "outermost" })]).toEqual(["2 conditions ×3", "3 conditions ×3"]);
  });

  it("shows how many guards nest at a site on request", () => {
    expect([
      label("call", [at(1, ["a"])], { guardLabel: "count" }),
      label("call", [at(1, ["a"]), at(2, ["a", "b"])], { guardLabel: "count" }),
    ]).toEqual(["1 guard", "1–2 guards ×2"]);
  });

  it("leaves the guard out of the pill on request, keeping only the site count", () => {
    expect([
      label("call", [at(1, ["x > 0"])], { guardLabel: "none" }),
      label("call", [at(1, ["x > 0"]), at(2, ["x > 0"])], { guardLabel: "none" }),
    ]).toEqual([undefined, "×2"]);
  });

  it.each(["dispatch", "read", "write"] as const)("cuts a %s guard three characters short of a call's, the room its icon takes", (type) => {
    expect(label(type, [at(1, [LONG_GUARD])])).toBe("a.very.long.conditio…");
  });
});

describe("edgeTitle", () => {
  it("lists each distinct guard chain once, outermost first, joined with ∧", () => {
    const sites = [at(1, ["ok", "err != nil"]), at(2), at(3, ["err != nil"]), at(4, ["ok", "err != nil"])];
    expect(edgeTitle(edge("call", sites))).toBe("ok ∧ err != nil\nerr != nil");
  });

  it("follows the guards with the edge's properties in key order", () => {
    expect(edgeTitle(edge("dispatch", [at(1, ["IsGroup"])], { plans: "GL, CL", noPlan: "false" }))).toBe("IsGroup\nnoPlan: false\nplans: GL, CL");
  });

  it("has nothing to say about an edge with no guarded site and no properties", () => {
    expect([edgeTitle(edge("call", [at(1)])), edgeTitle(edge("call", [at(1)], {}))]).toEqual([undefined, undefined]);
  });
});

describe("memberChips", () => {
  it("splits a collapsed edge's columns and fields into members, and leaves them out of its other properties", () => {
    expect([
      memberChips({ columns: "PLANGUID, STATUSCODE", fields: "SchemeNumber", kind: "dynamic" }),
      memberChips({ plans: "GL" }),
      memberChips(undefined),
    ]).toEqual([
      { columns: ["PLANGUID", "STATUSCODE"], fields: ["SchemeNumber"], rest: { kind: "dynamic" } },
      { columns: [], fields: [], rest: { plans: "GL" } },
      { columns: [], fields: [], rest: {} },
    ]);
  });
});

describe("memberAccess", () => {
  const touch = (type: CallGraphEdge["type"], properties: Record<string, string>): CallGraphEdge => ({ ...edge(type, [at(1)]), properties });

  it("lists each column and field the reads and writes touch once, in first-seen order, marking those both read and written", () => {
    expect(memberAccess([
      touch("read", { columns: "PLANGUID, STATUSCODE", plans: "GL" }),
      touch("write", { columns: "STATUSCODE, AMOUNT" }),
      touch("read", { fields: "PolicyStatus" }),
      touch("call", { columns: "IGNORED" }),
    ])).toEqual([
      { name: "PLANGUID", kind: "column", access: "read" },
      { name: "STATUSCODE", kind: "column", access: "both" },
      { name: "AMOUNT", kind: "column", access: "write" },
      { name: "PolicyStatus", kind: "field", access: "read" },
    ]);
  });
});

describe("propertyLines", () => {
  it("writes each property as key: value, in key order", () => {
    expect([propertyLines({ plans: "GL, CL", kind: "dynamic" }), propertyLines(undefined)]).toEqual([["kind: dynamic", "plans: GL, CL"], []]);
  });
});
