import { describe, expect, it } from "vitest";
import { strategySummary } from "./permission-strategies";

describe("strategySummary", () => {
  it.each([
    [{ name: "accounts_get", policy: "deny" }, "Tool name is accounts_get"],
    [
      { name: ["accounts_get", "contacts_list"], policy: "deny" },
      "Tool name in accounts_get, contacts_list",
    ],
    [
      { group: "xero.read", parent: "Contacts", policy: "ask" },
      "Group is xero.read · Parent is Contacts",
    ],
    [
      { group: "xero.*", destructive: false, policy: "ask" },
      "Group is xero.* · Destructive is No",
    ],
    [{ name: "*", policy: "allow" }, "All tools"],
    [{ readOnly: true, policy: "allow" }, "Read-only tools"],
  ] as const)("describes %o as %s", (rule, expected) => {
    expect(strategySummary(rule)).toBe(expected);
  });
});
