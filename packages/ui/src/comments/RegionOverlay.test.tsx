import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { regionAnchor } from "./anchoring/region-anchor";
import { RegionOverlay } from "./RegionOverlay";

const IMAGE = { width: 400, height: 200 };

function overlay(props: Partial<React.ComponentProps<typeof RegionOverlay>> = {}) {
  const view = render(
    <RegionOverlay regions={[]} {...props}>
      <img alt="Checkout screenshot" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
    </RegionOverlay>,
  );
  const surface = view.container.querySelector<HTMLElement>("[data-region-surface]")!;
  surface.getBoundingClientRect = () => ({ left: 10, top: 20, width: IMAGE.width, height: IMAGE.height, right: 410, bottom: 220, x: 10, y: 20, toJSON: () => ({}) }) as DOMRect;
  return { ...view, surface };
}

// jsdom ships no PointerEvent, so fireEvent.pointer* carries no coordinates.
const pointer = (type: "pointerdown" | "pointermove" | "pointerup", target: Element, at: { clientX: number; clientY: number }) =>
  fireEvent(target, new MouseEvent(type, { bubbles: true, button: 0, ...at }));

const drag = (surface: HTMLElement, from: [number, number], to: [number, number]) => {
  pointer("pointerdown", surface, { clientX: 10 + from[0], clientY: 20 + from[1] });
  pointer("pointermove", surface, { clientX: 10 + to[0], clientY: 20 + to[1] });
  pointer("pointerup", surface, { clientX: 10 + to[0], clientY: 20 + to[1] });
};

describe("RegionOverlay", () => {
  it("draws each existing region over the image as percentages of it, so it follows the image's scale", () => {
    const { container } = overlay({
      regions: [
        { id: "t1", region: { x: 0.25, y: 0.1, w: 0.5, h: 0.4 }, label: "Total" },
        { id: "t2", region: { x: 0, y: 0.5, w: 1, h: 0.5 } },
      ],
    });
    const boxes = [...container.querySelectorAll<HTMLElement>("[data-region]")].map((box) => ({
      id: box.dataset.region,
      left: box.style.left,
      top: box.style.top,
      width: box.style.width,
      height: box.style.height,
    }));
    expect(boxes).toEqual([
      { id: "t1", left: "25%", top: "10%", width: "50%", height: "40%" },
      { id: "t2", left: "0%", top: "50%", width: "100%", height: "50%" },
    ]);
    expect(screen.getByRole("button", { name: "Total" })).toBeTruthy();
  });

  it("selects a region by clicking it, and marks the active one", () => {
    const onSelect = vi.fn();
    const { container } = overlay({ regions: [{ id: "t1", region: { x: 0.1, y: 0.1, w: 0.2, h: 0.2 }, label: "Total" }], activeId: "t1", onSelect });
    fireEvent.click(screen.getByRole("button", { name: "Total" }));
    expect({ selected: onSelect.mock.calls, active: container.querySelector("[data-region]")!.getAttribute("aria-current") }).toEqual({ selected: [["t1"]], active: "true" });
  });

  it("reports the dragged rectangle as a normalized region when drawing, and encodes as an anchor", () => {
    const onDraw = vi.fn();
    const { surface } = overlay({ drawing: true, onDraw });
    drag(surface, [100, 20], [300, 120]);
    expect(onDraw).toHaveBeenCalledTimes(1);
    const region = onDraw.mock.calls[0]![0];
    expect({ region, anchor: regionAnchor(region) }).toEqual({
      region: { x: 0.25, y: 0.1, w: 0.5, h: 0.5 },
      anchor: 'region:{"x":0.25,"y":0.1,"w":0.5,"h":0.5}',
    });
  });

  it("shows the rectangle being dragged and ignores a click that draws no area", () => {
    const onDraw = vi.fn();
    const { surface, container } = overlay({ drawing: true, onDraw });
    pointer("pointerdown", surface, { clientX: 110, clientY: 40 });
    pointer("pointermove", surface, { clientX: 210, clientY: 90 });
    const draft = container.querySelector<HTMLElement>("[data-region-draft]");
    expect({ width: draft?.style.width, height: draft?.style.height }).toEqual({ width: "25%", height: "25%" });
    pointer("pointerup", surface, { clientX: 210, clientY: 90 });
    drag(surface, [50, 50], [50, 50]);
    expect({ onDraw: onDraw.mock.calls.length, draftGone: container.querySelector("[data-region-draft]") === null }).toEqual({ onDraw: 1, draftGone: true });
  });

  it("draws a drag that runs to the right and bottom edge as a region gavel accepts, never one with x + w above 1", () => {
    const onDraw = vi.fn();
    const { surface } = overlay({ drawing: true, onDraw });
    drag(surface, [150, 100], [IMAGE.width + 30, IMAGE.height + 30]);
    const region = onDraw.mock.calls[0]![0];
    expect({ region, right: region.x + region.w, bottom: region.y + region.h, anchor: regionAnchor(region) }).toEqual({
      region: { x: 0.375, y: 0.5, w: 0.625, h: 0.5 },
      right: 1,
      bottom: 1,
      anchor: 'region:{"x":0.375,"y":0.5,"w":0.625,"h":0.5}',
    });
  });

  it("colours regions with the theme's warning tokens, not a hand-rolled palette", () => {
    const { container } = overlay({ regions: [{ id: "t1", region: { x: 0.1, y: 0.1, w: 0.2, h: 0.2 } }] });
    expect(container.innerHTML).not.toMatch(/amber|yellow|orange/);
    expect(container.querySelector("[data-region]")!.className).toMatch(/border-warning/);
  });

  it("draws nothing unless drawing is on", () => {
    const onDraw = vi.fn();
    const { surface } = overlay({ onDraw });
    drag(surface, [100, 20], [300, 120]);
    expect(onDraw).not.toHaveBeenCalled();
  });

  it("refuses to draw without an onDraw handler", () => {
    expect(() => overlay({ drawing: true })).toThrow(/onDraw/);
  });
});
