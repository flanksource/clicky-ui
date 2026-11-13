import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAnchorBoxes } from "./hooks";

vi.mock("./geometry", () => ({ measureAnchors: ({ anchors }: { anchors: string[] }) => new Map(anchors.map((anchor) => [anchor, [{ top: 0, left: 0, width: 20, height: 10 }]])) }));

describe("review anchor measurements", () => {
  it("drops removed findings immediately while retaining valid hidden-document measurements", () => {
    const element = document.createElement("div");
    const origin = { current: element };
    const markdown = { current: element };
    const { result, rerender } = renderHook(({ anchors, visible }) => useAnchorBoxes({ origin, markdown, anchors, visible, mode: "text" }), { initialProps: { anchors: ["line:3", "line:5"], visible: true } });
    expect([...result.current.boxes.keys()]).toEqual(["line:3", "line:5"]);
    rerender({ anchors: ["line:5"], visible: false });
    expect([...result.current.boxes.keys()]).toEqual(["line:5"]);
  });
});
