import { describe, expect, it } from "vitest";
import { developerOverrides } from "./links";

describe("reference host developer profile", () => {
  it.each([undefined, "default"])("denies overrides in profile %s", (profile) => expect(developerOverrides(profile)).toBe(false));
  it("enables overrides only for the developer profile", () => expect(developerOverrides("developer")).toBe(true));
  it("rejects an unknown profile", () => expect(() => developerOverrides("developre")).toThrow("Unknown page-host profile"));
});
