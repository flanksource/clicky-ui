import { describe, expect, it } from "vitest";
import type { ToolMeta } from "./types";
import {
  appendToolPolicy,
  matchItems,
  matchesTool,
  normalizeToolPolicyRules,
  resolveToolPolicy,
  toolPolicyFromPreferences,
} from "./tool-policy";
import { withUserRule } from "../ai/ToolPreferences.model";

const tool = (overrides: Partial<ToolMeta> = {}): ToolMeta => ({
  name: "providerGetContact",
  label: "Get Xero contact",
  group: "provider.xero.read",
  parent: "Xero Contacts",
  entity: "contact",
  method: "GET",
  verb: "get",
  scope: "single",
  ...overrides,
});

// The matcher is a port of Go's commons/collections.MatchItems. These cases are
// the ones where a plausible re-implementation diverges, and a divergence shows
// up as the popover promising a policy the request does not produce.
describe("matchItems", () => {
  it("matches an exact item, case-insensitively", () => {
    expect(matchItems("provider.xero.read", "PROVIDER.XERO.READ")).toBe(true);
    expect(matchItems("provider.xero.read", "provider.xero.write")).toBe(false);
  });

  it("wildcards a prefix, a suffix and a substring", () => {
    expect(matchItems("provider.xero.read", "provider.*")).toBe(true);
    expect(matchItems("accounting.metadata.write", "*.write")).toBe(true);
    expect(matchItems("provider.xero.read", "*xero*")).toBe(true);
    expect(matchItems("admin.read", "provider.*")).toBe(false);
  });

  it("matches everything on a bare star and on an empty list", () => {
    expect(matchItems("anything", "*")).toBe(true);
    expect(matchItems("anything", [])).toBe(true);
    expect(matchItems("anything", undefined)).toBe(true);
  });

  it("splits comma-separated alternatives inside one pattern", () => {
    expect(matchItems("rules.write", "admin.*, rules.write")).toBe(true);
    expect(matchItems("templates.read", "admin.*, rules.write")).toBe(false);
  });

  it("lets an exclusion win over a positive match written before it", () => {
    expect(matchItems("provider.xero.read", ["provider.*", "!*.read"])).toBe(
      false,
    );
    expect(matchItems("provider.xero.write", ["provider.*", "!*.read"])).toBe(
      true,
    );
  });

  it("admits an item that an exclusion-only list does not exclude", () => {
    expect(matchItems("admin.read", ["!provider.*"])).toBe(true);
    expect(matchItems("provider.xero.read", ["!provider.*"])).toBe(false);
  });
});

describe("matchesTool", () => {
  it("requires every declared facet and any one pattern within a facet", () => {
    expect(
      matchesTool({ group: "provider.*", verb: ["list", "get"] }, tool()),
    ).toBe(true);
    // The group matches but the verb does not, and facets are ANDed.
    expect(matchesTool({ group: "provider.*", verb: "create" }, tool())).toBe(
      false,
    );
  });

  it("does not select a tool that carries none of the facet's data", () => {
    expect(matchesTool({ verb: "list" }, tool({ verb: undefined }))).toBe(false);
  });

  it("requires a declared hint to be declared on the tool too", () => {
    const declared = tool({ annotations: { readOnlyHint: true } });
    expect(matchesTool({ readOnly: true }, declared)).toBe(true);
    // Silence is not a claim: a tool that never said whether it is read-only
    // must not inherit a rule that asked for read-only tools.
    expect(matchesTool({ readOnly: true }, tool())).toBe(false);
    expect(matchesTool({ readOnly: false }, tool())).toBe(false);
  });
});

describe("resolveToolPolicy", () => {
  it("returns the last matching rule, not the first", () => {
    expect(
      resolveToolPolicy(
        [
          { group: "provider.*", policy: "deny" },
          { name: "providerGetContact", policy: "allow" },
        ],
        tool(),
      ),
    ).toBe("allow");
  });

  it("returns undefined when no rule selects the tool", () => {
    expect(
      resolveToolPolicy([{ group: "admin.*", policy: "deny" }], tool()),
    ).toBeUndefined();
  });

  it("keeps the surface's rules under the user's when appended", () => {
    const surface = [{ group: "provider.*", policy: "deny" as const }];
    const user = [{ group: "provider.xero.read", policy: "ask" as const }];
    expect(resolveToolPolicy(appendToolPolicy(surface, user), tool())).toBe(
      "ask",
    );
  });
});

describe("toolPolicyFromPreferences", () => {
  it("emits every group rule before every name rule, keys sorted", () => {
    expect(
      toolPolicyFromPreferences({
        "provider.xero.read": "ask",
        "admin.read": "deny",
      }),
    ).toEqual([
      { group: "admin.read", policy: "deny" },
      { group: "provider.xero.read", policy: "ask" },
      { name: "admin.read", policy: "deny" },
      { name: "provider.xero.read", policy: "ask" },
    ]);
  });

  it("accepts the legacy on/off spellings and drops unparseable ones", () => {
    expect(
      toolPolicyFromPreferences({ listPods: "on", nope: "sideways" }),
    ).toEqual([
      { group: "listPods", policy: "allow" },
      { name: "listPods", policy: "allow" },
    ]);
  });

  it("is empty for no preferences", () => {
    expect(toolPolicyFromPreferences(undefined)).toEqual([]);
    expect(toolPolicyFromPreferences({})).toEqual([]);
  });
});

describe("withUserRule", () => {
  it("keeps a per-tool rule after the group rule whatever the click order", () => {
    const afterTool = withUserRule([], {
      name: "providerGetContact",
      policy: "allow",
    });
    const afterGroup = withUserRule(afterTool, {
      group: "provider.xero.read",
      policy: "deny",
    });

    expect(afterGroup).toEqual([
      { group: "provider.xero.read", policy: "deny" },
      { name: "providerGetContact", policy: "allow" },
    ]);
    // The tool rule is last, so it still wins — clicking the group header must
    // not silently override a choice the user made about one tool.
    expect(resolveToolPolicy(afterGroup, tool())).toBe("allow");
  });

  it("orders a parent rule between the group and the tool", () => {
    const rules = [
      { name: "providerGetContact", policy: "allow" as const },
      { group: "provider.xero.read", policy: "deny" as const },
    ].reduce(withUserRule, [] as ReturnType<typeof withUserRule>);
    const withParent = withUserRule(rules, {
      group: "provider.xero.read",
      parent: "Xero Contacts",
      policy: "ask",
    });

    expect(withParent.map((rule) => rule.policy)).toEqual([
      "deny",
      "ask",
      "allow",
    ]);
  });

  it("replaces an earlier rule for the same subject instead of appending", () => {
    const once = withUserRule([], { group: "admin.*", policy: "deny" });
    const twice = withUserRule(once, { group: "admin.*", policy: "ask" });

    expect(twice).toEqual([{ group: "admin.*", policy: "ask" }]);
  });
});

describe("normalizeToolPolicyRules", () => {
  it("keeps well-formed rules and normalizes scalar patterns to lists", () => {
    expect(
      normalizeToolPolicyRules([
        { group: "provider.*", policy: "off" },
        { name: ["a", "b"], readOnly: true, policy: "allow" },
      ]),
    ).toEqual([
      { group: ["provider.*"], policy: "deny" },
      { name: ["a", "b"], readOnly: true, policy: "allow" },
    ]);
  });

  it("drops a rule with no facet, which would otherwise match every tool", () => {
    expect(normalizeToolPolicyRules([{ policy: "deny" }])).toEqual([]);
  });

  it("drops a rule with no recognisable policy", () => {
    expect(
      normalizeToolPolicyRules([{ group: "admin.*", policy: "sideways" }]),
    ).toEqual([]);
  });

  it("is empty for anything that is not a list", () => {
    expect(normalizeToolPolicyRules({ group: "admin.*" })).toEqual([]);
    expect(normalizeToolPolicyRules(undefined)).toEqual([]);
  });
});
