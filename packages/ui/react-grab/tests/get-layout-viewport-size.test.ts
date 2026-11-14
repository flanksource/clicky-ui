import { describe, expect, it } from "vitest";
import { getLayoutViewportSize } from "../src/utils/get-layout-viewport-size.js";

const viewport = { clientWidth: 1585, clientHeight: 857 };
const longDocument = { clientWidth: 1585, clientHeight: 38551 };

describe("getLayoutViewportSize", () => {
  it("reads the viewport from body in quirks mode, where documentElement spans the whole document", () => {
    const doc = { scrollingElement: viewport, documentElement: longDocument } as unknown as Document;
    expect(getLayoutViewportSize(doc)).toEqual({ width: 1585, height: 857 });
  });

  it("reads the viewport from documentElement in standards mode", () => {
    const doc = { scrollingElement: viewport, documentElement: viewport } as unknown as Document;
    expect(getLayoutViewportSize(doc)).toEqual({ width: 1585, height: 857 });
  });

  it("falls back to documentElement when the document has no scrolling element", () => {
    const doc = { scrollingElement: null, documentElement: viewport } as unknown as Document;
    expect(getLayoutViewportSize(doc)).toEqual({ width: 1585, height: 857 });
  });
});
