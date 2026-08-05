import { describe, expect, it } from "vitest";
import { anchorRadius, spotlightClipPath, spotlightRect } from "./tour-geometry";

const viewport = { width: 1000, height: 800 };

function rect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("spotlightRect", () => {
  it("grows the anchor by the padding on every side", () => {
    const result = spotlightRect({ anchor: rect(100, 200, 300, 40), padding: 8, viewport });

    expect(result).toMatchObject({ x: 92, y: 192, width: 316, height: 56 });
  });

  it("clamps to the viewport so a partly off-screen anchor keeps a valid cutout", () => {
    const result = spotlightRect({ anchor: rect(-40, 780, 200, 60), padding: 10, viewport });

    expect(result.x).toBe(0);
    expect(result.y).toBe(770);
    expect(result.y + result.height).toBe(viewport.height);
  });

  it("caps the radius at half the shorter side so the path cannot fold in on itself", () => {
    const result = spotlightRect({
      anchor: rect(100, 100, 40, 20),
      padding: 0,
      radius: 999,
      viewport,
    });

    expect(result.radius).toBe(10);
  });

  it("keeps a requested radius that fits", () => {
    const result = spotlightRect({
      anchor: rect(100, 100, 200, 100),
      padding: 4,
      radius: 6,
      viewport,
    });

    expect(result.radius).toBe(6);
  });
});

describe("anchorRadius", () => {
  // The longhand is set directly because jsdom does not expand the
  // `border-radius` shorthand; a real browser's computed style always resolves
  // longhands, which is what the production read relies on.
  function anchorWithRadius(radius: string): HTMLElement {
    const element = document.createElement("div");
    document.body.appendChild(element);
    element.style.borderTopLeftRadius = radius;
    return element;
  }

  it("resolves a percentage radius against the element width, as the browser paints it", () => {
    const element = anchorWithRadius("50%");
    element.getBoundingClientRect = () => rect(0, 0, 80, 80);

    expect(anchorRadius(element)).toBe(40);
    element.remove();
  });

  it("reads a pixel radius directly", () => {
    const element = anchorWithRadius("12px");

    expect(anchorRadius(element)).toBe(12);
    element.remove();
  });

  it("is zero for a square anchor", () => {
    const element = anchorWithRadius("");

    expect(anchorRadius(element)).toBe(0);
    element.remove();
  });
});

describe("spotlightClipPath", () => {
  it("emits an evenodd path with the viewport rect and a rounded hole", () => {
    const cutout = spotlightRect({ anchor: rect(100, 100, 200, 50), padding: 0, radius: 8, viewport });
    const path = spotlightClipPath({ viewport, cutout });

    expect(path).toMatch(/^path\(evenodd, "M0,0 H1000 V800 H0 Z /);
    expect(path).toContain("A8,8");
  });

  it("emits a square hole when the radius is zero", () => {
    const cutout = spotlightRect({ anchor: rect(10, 10, 40, 40), padding: 0, viewport });

    expect(spotlightClipPath({ viewport, cutout })).toContain("M10,10 H50 V50 H10 Z");
  });

  it("dims the whole viewport rather than emitting an invalid path for a zero-size anchor", () => {
    const cutout = spotlightRect({ anchor: rect(50, 50, 0, 0), padding: 0, viewport });

    // A browser drops an invalid clip-path entirely, which would leave an uncut
    // opaque sheet over the app — worse than simply having no hole.
    expect(spotlightClipPath({ viewport, cutout })).toBe('path(evenodd, "M0,0 H1000 V800 H0 Z")');
  });

  it("dims the whole viewport when there is no anchor at all", () => {
    expect(spotlightClipPath({ viewport, cutout: null })).toBe(
      'path(evenodd, "M0,0 H1000 V800 H0 Z")',
    );
  });
});
