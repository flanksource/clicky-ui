import { describe, expect, it } from "vitest";
// @ts-expect-error -- plain JS oxlint plugin, no type declarations
import { isIconifyName } from "./no-iconify-names.js";

describe("isIconifyName", () => {
  it.each([
    "lucide:maximize-2",
    "ph:cpu-fill",
    "mdi:home",
    "heroicons:arrow-up",
    "tabler:x",
  ])("flags iconify-style name %s", (name) => {
    expect(isIconifyName(name)).toBe(true);
  });

  it.each([
    "UiFullscreen", // imported component reference, no prefix
    "maximize-2", // bare icon name without collection prefix
    "https://example.com/icon", // URL with scheme but path segments
    "12:30", // time string starts with a digit
    "Lucide:Maximize", // uppercase is not an iconify collection name
    "lucide:", // missing icon name after colon
    ":cpu", // missing collection prefix
    "a:b:c", // extra colon
    "",
  ])("does not flag %s", (name) => {
    expect(isIconifyName(name)).toBe(false);
  });

  it("ignores non-string values", () => {
    expect(isIconifyName(undefined)).toBe(false);
    expect(isIconifyName(42)).toBe(false);
    expect(isIconifyName(null)).toBe(false);
  });
});
