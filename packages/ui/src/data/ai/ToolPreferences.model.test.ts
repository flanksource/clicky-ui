import { describe, expect, it } from "vitest";
import { effectiveToolPolicies } from "./ToolPreferences.model";

describe("effectiveToolPolicies", () => {
  it("keeps an explicit Auto rule visible over the catalog default", () => {
    expect(
      effectiveToolPolicies({
        tools: [
          {
            name: "accounts_get",
            label: "Get account",
            defaultPermission: "allow",
          },
        ],
        userRules: [{ name: "accounts_get", policy: "auto" }],
        fallback: "ask",
      }),
    ).toEqual({ accounts_get: "auto" });
  });
});
