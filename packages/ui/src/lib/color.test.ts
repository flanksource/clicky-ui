import { afterEach, describe, expect, it, vi } from "vitest";
import { isTailwindColorClass, resolveCssColor } from "./color";

describe("isTailwindColorClass", () => {
  it.each(["bg-emerald-500", "text-rose-500", "border-blue-300", "fill-sky-400", "stroke-amber-600"])(
    "treats %s as a Tailwind color class",
    (cls) => {
      expect(isTailwindColorClass(cls)).toBe(true);
    },
  );

  it.each(["#10b981", "rgb(16 185 129)", "rgba(0,0,0,0.5)", "var(--chart-3)", "hsl(160 84% 39%)", "currentColor"])(
    "treats %s as a CSS color value",
    (value) => {
      expect(isTailwindColorClass(value)).toBe(false);
    },
  );
});

describe("resolveCssColor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes CSS color values through unchanged", () => {
    expect(resolveCssColor("#10b981")).toBe("#10b981");
    expect(resolveCssColor("var(--chart-3)")).toBe("var(--chart-3)");
  });

  it("resolves a bg- class from the probe's computed backgroundColor", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      color: "rgb(0, 0, 0)",
      backgroundColor: "rgb(16, 185, 129)",
    } as CSSStyleDeclaration);
    expect(resolveCssColor("bg-emerald-500")).toBe("rgb(16, 185, 129)");
  });

  it("resolves a text- class from the probe's computed color", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      color: "rgb(244, 63, 94)",
      backgroundColor: "rgba(0, 0, 0, 0)",
    } as CSSStyleDeclaration);
    expect(resolveCssColor("text-rose-500")).toBe("rgb(244, 63, 94)");
  });

  it("falls back to the class string when the computed value is transparent (unknown class)", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      color: "rgba(0, 0, 0, 0)",
      backgroundColor: "rgba(0, 0, 0, 0)",
    } as CSSStyleDeclaration);
    expect(resolveCssColor("bg-not-a-real-class-xyz")).toBe("bg-not-a-real-class-xyz");
  });

  it("memoizes resolution so the probe is built only once per class", () => {
    const spy = vi.spyOn(window, "getComputedStyle").mockReturnValue({
      color: "rgb(0, 0, 0)",
      backgroundColor: "rgb(59, 130, 246)",
    } as CSSStyleDeclaration);
    resolveCssColor("bg-blue-500");
    resolveCssColor("bg-blue-500");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  // Regression: the probe must not pin an inline backgroundColor before reading
  // it — an inline value outranks the class, so getComputedStyle would return
  // the inline color and every bg-* class would resolve to transparent (the
  // chart then fell back to grayscale). Assert the measured property is left to
  // the class by inspecting the element handed to getComputedStyle.
  it("does not set an inline color on the probe it measures", () => {
    let probe: Element | undefined;
    vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element) => {
      probe = el;
      return { color: "rgb(0, 0, 0)", backgroundColor: "rgb(14, 165, 233)" } as CSSStyleDeclaration;
    });
    resolveCssColor("bg-sky-500");
    expect(probe).toBeDefined();
    expect((probe as HTMLElement).style.backgroundColor).toBe("");
    expect((probe as HTMLElement).style.color).toBe("");
  });
});

// recharts' stroke/fill props require a real CSS color value, never a Tailwind
// class. These assert the resolution contract at that boundary: a series color
// expressed as a Tailwind class becomes a usable CSS value, while CSS values
// (the palette default) pass straight through.
describe("resolveCssColor → recharts stroke/fill value", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const CSS_COLOR = /^(#|rgb\(|rgba\(|hsl\(|var\()/;

  it("yields a CSS color value (not a Tailwind class) for a class-colored series", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      color: "rgb(0, 0, 0)",
      backgroundColor: "rgb(16, 185, 129)",
    } as CSSStyleDeclaration);
    const stroke = resolveCssColor("bg-emerald-500");
    expect(stroke).toBe("rgb(16, 185, 129)");
    expect(isTailwindColorClass(stroke)).toBe(false);
    expect(stroke).toMatch(CSS_COLOR);
  });

  it("passes a palette CSS value through to recharts unchanged", () => {
    const palette = "var(--chart-1, #3b82f6)";
    const stroke = resolveCssColor(palette);
    expect(stroke).toBe(palette);
    expect(stroke).toMatch(CSS_COLOR);
  });
});
