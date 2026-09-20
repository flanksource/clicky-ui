import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

// jsdom lays nothing out, so the geometry the menu is placed against is stubbed:
// a short viewport, the "…" trigger's box, and a menu whose natural height —
// every column, density, View and Export — is taller than the viewport, but
// which shrinks to any max-height it is given, as a scrolling panel does.
const VIEWPORT = { width: 1280, height: 577 };
const PADDING = 8;
const MENU_WIDTH = 256;
const MENU_NATURAL_HEIGHT = 570;

type Box = { top: number; left: number; width: number; height: number };

const columns: DataTableColumn<Record<string, unknown>>[] = Array.from({ length: 16 }, (_, index) => ({
  key: `c${index}`,
  label: `Column ${index}`,
}));
const rows = [Object.fromEntries(columns.map((column) => [column.key, "value"]))];

function domRect({ top, left, width, height }: Box): DOMRect {
  return {
    x: left,
    y: top,
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;
}

function menuHeight(element: HTMLElement): number {
  const cap = Number.parseFloat(element.style.maxHeight);
  return Number.isNaN(cap) ? MENU_NATURAL_HEIGHT : Math.min(MENU_NATURAL_HEIGHT, cap);
}

function stubLayout(trigger: Box) {
  const html = document.documentElement;
  Object.defineProperty(html, "clientWidth", { configurable: true, value: VIEWPORT.width });
  Object.defineProperty(html, "clientHeight", { configurable: true, value: VIEWPORT.height });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: VIEWPORT.width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: VIEWPORT.height });

  const originalRect = HTMLElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return this.getAttribute("aria-label") === "Open column menu" ? domRect(trigger) : originalRect.call(this);
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.getAttribute("role") === "menu" ? menuHeight(this) : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.getAttribute("role") === "menu" ? MENU_WIDTH : 0;
  });
}

async function openMenuBox(): Promise<Box> {
  render(
    <DataTable data={rows} columns={columns} menuActions={[{ id: "export", label: "Export…", onSelect: vi.fn() }]} />,
  );
  fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
  const menu = screen.getByRole("menu", { name: /column menu/i });
  // Placing it measures it, and capping its height is the last step of that.
  await waitFor(() => expect(menu.style.maxHeight).not.toBe(""));
  return {
    top: Number.parseFloat(menu.style.top),
    left: Number.parseFloat(menu.style.left),
    width: MENU_WIDTH,
    height: menuHeight(menu),
  };
}

describe("DataTable column menu position", () => {
  const html = document.documentElement;
  const original = {
    clientWidth: Object.getOwnPropertyDescriptor(html, "clientWidth"),
    clientHeight: Object.getOwnPropertyDescriptor(html, "clientHeight"),
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    for (const key of ["clientWidth", "clientHeight"] as const) {
      const descriptor = original[key];
      if (descriptor) Object.defineProperty(html, key, descriptor);
      else delete (html as unknown as Record<string, unknown>)[key];
    }
    Object.defineProperty(window, "innerWidth", { configurable: true, value: original.innerWidth });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: original.innerHeight });
  });

  it("keeps a menu taller than the space below its trigger wholly on screen, so its last action is reachable", async () => {
    stubLayout({ top: 460, left: 1200, width: 32, height: 32 });

    const box = await openMenuBox();

    expect(box.top).toBeGreaterThanOrEqual(PADDING);
    expect(box.top + box.height).toBeLessThanOrEqual(VIEWPORT.height - PADDING);
  });

  it("opens below the trigger, right-aligned to it, capped to the space below", async () => {
    stubLayout({ top: 100, left: 1200, width: 32, height: 32 });

    const box = await openMenuBox();

    expect(box).toEqual({
      top: 100 + 32 + 6,
      left: 1200 + 32 - MENU_WIDTH,
      width: MENU_WIDTH,
      height: VIEWPORT.height - PADDING - (100 + 32 + 6),
    });
  });
});
