import { describe, expect, it } from "vitest";
import {
  addExcludePattern,
  callGraphGroupFacts,
  excludeGroup,
  excludePatternError,
  formatExclude,
  includeGroup,
  matchesExclude,
  parseExclude,
  removeExcludePattern,
  setExternalHidden,
  type ExcludeMatcher,
} from "./call-graph-exclude";
import type { CallGraph, CallGraphGroupFact } from "./types";

// uir's Go index knows two keywords of its own; a host passes them in a matcher that falls back to the generic one.
const goMatcher: ExcludeMatcher = (pattern, group) => {
  if (pattern === "std") return group.external === true && group.name !== "builtin" && !group.name.split("/")[0]!.includes(".");
  if (pattern === "builtin") return group.name === "builtin";
  return matchesExclude(pattern, group);
};

const DEFAULTS = ["std", "builtin", "gorm.io/..."];
const group = (name: string, external: boolean, excluded: boolean, nodes = 1): CallGraphGroupFact => ({ name, external, excluded, nodes });
const QUERY = group("github.com/flanksource/uir/query", false, false, 20);
const FMT = group("fmt", true, true, 5);
const STRINGS = group("strings", true, true, 3);
const BUILTIN = group("builtin", true, true, 4);
const GORM = group("gorm.io/gorm", true, true, 4);
const GORM_CLAUSE = group("gorm.io/gorm/clause", true, true, 1);
const UUID = group("github.com/google/uuid", true, false, 2);
const GROUPS = [QUERY, FMT, BUILTIN, GORM, STRINGS, UUID, GORM_CLAUSE];

describe("exclude text", () => {
  it.each([
    ["", undefined],
    ["none", []],
    ["std,builtin,gorm.io/...", DEFAULTS],
  ])("reads %j from a URL as %j, empty meaning the host's defaults", (text, patterns) => {
    expect(parseExclude(text)).toEqual(patterns);
  });

  it("writes the defaults as empty and no patterns as none", () => {
    expect([formatExclude(undefined), formatExclude([]), formatExclude(DEFAULTS)]).toEqual(["", "none", "std,builtin,gorm.io/..."]);
  });
});

describe("matchesExclude", () => {
  it("matches exact names, /... trees and the external keyword", () => {
    const matches = (pattern: string) => GROUPS.filter((entry) => matchesExclude(pattern, entry)).map((entry) => entry.name);
    expect({ external: matches("external"), tree: matches("gorm.io/..."), exact: matches("gorm.io/gorm"), keyword: matches("std") }).toEqual({
      external: ["fmt", "builtin", "gorm.io/gorm", "strings", "github.com/google/uuid", "gorm.io/gorm/clause"],
      tree: ["gorm.io/gorm", "gorm.io/gorm/clause"],
      exact: ["gorm.io/gorm"],
      keyword: [],
    });
  });

  it("leaves a group with no external flag out of the external keyword", () => {
    expect(matchesExclude("external", { name: "Plan GL", nodes: 3, excluded: false })).toBe(false);
  });
});

describe("excludeGroup", () => {
  it("adds the exact name after the patterns in force", () => {
    expect([excludeGroup(DEFAULTS, UUID.name), excludeGroup([], UUID.name)]).toEqual([[...DEFAULTS, UUID.name], [UUID.name]]);
  });
});

describe("includeGroup", () => {
  it("drops an exact name that excludes the group", () => {
    expect(includeGroup([...DEFAULTS, UUID.name], { ...UUID, excluded: true }, GROUPS, goMatcher)).toEqual(DEFAULTS);
  });

  it("replaces a host keyword with the exact names of the other groups it covered", () => {
    expect(includeGroup(DEFAULTS, FMT, GROUPS, goMatcher)).toEqual(["builtin", "gorm.io/...", "strings"]);
  });

  it("replaces a /... pattern with the exact names of the other groups below it", () => {
    expect(includeGroup(DEFAULTS, GORM, GROUPS, goMatcher)).toEqual(["std", "builtin", "gorm.io/gorm/clause"]);
  });

  it("drops every pattern that covers the group, leaving out names another remaining pattern still covers", () => {
    expect(includeGroup(["external", "std", "builtin"], FMT, GROUPS, goMatcher)).toEqual(["builtin", "gorm.io/gorm", "strings", "github.com/google/uuid", "gorm.io/gorm/clause"]);
  });

  it("leaves no patterns when the last one goes", () => {
    expect(formatExclude(includeGroup(["builtin"], BUILTIN, GROUPS, goMatcher))).toBe("none");
  });

  it("fails when no pattern covers a group the host reported excluded", () => {
    expect(() => includeGroup(["builtin"], FMT, GROUPS, goMatcher)).toThrow("Group fmt is reported excluded, but none of builtin matches it");
  });

  it("fails for a group that is not excluded", () => {
    expect(() => includeGroup(DEFAULTS, QUERY, GROUPS)).toThrow("Group github.com/flanksource/uir/query is not excluded");
  });
});

describe("setExternalHidden", () => {
  it("adds and removes the external keyword, never doubling it", () => {
    expect([
      setExternalHidden(DEFAULTS, true),
      setExternalHidden([], true),
      setExternalHidden([...DEFAULTS, "external"], true),
      setExternalHidden([...DEFAULTS, "external"], false),
    ]).toEqual([[...DEFAULTS, "external"], ["external"], [...DEFAULTS, "external"], DEFAULTS]);
  });
});

describe("free-text patterns", () => {
  it.each([
    ["", "Enter a name or a name ending in /..."],
    ["a,b", "One pattern at a time: a,b has a comma or a space"],
    ["github.com/x y", "One pattern at a time: github.com/x y has a comma or a space"],
    ["gorm.io/...", "gorm.io/... is already excluded"],
    ["none", "Use Show all to exclude nothing"],
    ["github.com/google/...", undefined],
  ])("checks %j before it is added: %j", (pattern, error) => {
    expect(excludePatternError(DEFAULTS, pattern)).toBe(error);
  });

  it("adds a pattern after the others and removes one", () => {
    expect([addExcludePattern([], "github.com/google/..."), removeExcludePattern(DEFAULTS, "builtin")]).toEqual([["github.com/google/..."], ["std", "gorm.io/..."]]);
  });
});

describe("callGraphGroupFacts", () => {
  it("counts the drawn and excluded nodes per group, and marks a group with none drawn excluded", () => {
    const graph: CallGraph = {
      roots: ["t"],
      nodes: [
        { id: "t", identifier: {}, kind: "transaction", label: "Install", group: "plan", depth: 0, in: 0, out: 2 },
        { id: "f", identifier: {}, kind: "function", label: "Round", group: "product", depth: 1, in: 1, out: 0 },
        { id: "g", identifier: {}, kind: "function", label: "Rate", group: "plan", depth: 1, in: 1, out: 0 },
      ],
      edges: [],
      groups: [{ id: "plan", label: "Plan GL" }, { id: "product", label: "product" }],
      omitted: { excluded: { product: 2, company: 4 } },
    };
    expect(callGraphGroupFacts(graph)).toEqual([
      { name: "plan", label: "Plan GL", nodes: 2, excluded: false },
      { name: "product", nodes: 3, excluded: false },
      { name: "company", nodes: 4, excluded: true },
    ]);
  });
});
