import { describe, expect, it } from "vitest";
import { frameworkIcon } from "./frameworkIcon";
import { UiBeaker, UiGlobe, UiMarkdown, UiTest } from "../../icons";

describe("frameworkIcon", () => {
  it("maps each known framework to a native Ui* component (never a runtime string)", () => {
    expect(frameworkIcon("go test")).toBe(UiTest);
    expect(frameworkIcon("ginkgo")).toBe(UiTest);
    expect(frameworkIcon("vitest")).toBe(UiBeaker);
    expect(frameworkIcon("playwright")).toBe(UiGlobe);
    expect(frameworkIcon("fixture")).toBe(UiMarkdown);
  });

  it("never returns a string (those would render as an unresolved '?' placeholder)", () => {
    for (const fw of ["go test", "ginkgo", "jest", "vitest", "playwright", "fixture", "task"]) {
      expect(typeof frameworkIcon(fw)).not.toBe("string");
    }
  });

  it("returns null for unknown or missing frameworks", () => {
    expect(frameworkIcon("rspec")).toBeNull();
    expect(frameworkIcon(undefined)).toBeNull();
  });
});
