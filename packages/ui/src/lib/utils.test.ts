import { describe, expect, it } from "vitest";
import { cn } from "./utils";

// These lock the design-token <-> tailwind-merge wiring in `cn`. Without the
// extendTailwindMerge config, plain tailwind-merge treats `control-h`/`control-px`/
// `density-*` as unknown classes and keeps both the component base and the
// consumer override, so the base (e.g. Button's fixed `h-control-h`) wins and the
// override is silently dropped — that's the bug these guard against.
describe("cn — design-token overrides", () => {
  it.each([
    // [inputs, the class that must remain, the class that must be dropped]
    [["h-control-h", "h-auto"], "h-auto", "h-control-h"],
    [["px-control-px", "px-3"], "px-3", "px-control-px"],
    [["py-density-2", "py-1"], "py-1", "py-density-2"],
    [["gap-density-2", "gap-4"], "gap-4", "gap-density-2"],
    [["p-density-3", "p-0"], "p-0", "p-density-3"],
    [["mt-density-1", "mt-4"], "mt-4", "mt-density-1"],
    [["text-density-base", "text-sm"], "text-sm", "text-density-base"],
  ])("override %j keeps %s, drops %s", (inputs, kept, dropped) => {
    const result = cn(...(inputs as string[])).split(" ");
    expect(result).toContain(kept);
    expect(result).not.toContain(dropped);
  });

  it("does not merge tokens across different scales", () => {
    // height and width are independent groups — both must survive.
    const result = cn("h-control-h", "w-4").split(" ");
    expect(result).toContain("h-control-h");
    expect(result).toContain("w-4");
  });

  it("respects override order (later wins, base first)", () => {
    expect(cn("h-auto", "h-control-h")).toBe("h-control-h");
  });
});
