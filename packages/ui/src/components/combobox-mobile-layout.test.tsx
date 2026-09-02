import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";
import { calculateComboboxMenuPosition } from "../lib/combobox";

const MOBILE_WIDTH = 390;
const MOBILE_HEIGHT = 844;
const ANCHOR_RECT = {
  width: 288,
  height: 32,
  x: 48,
  y: 100,
  top: 100,
  left: 48,
  right: 336,
  bottom: 132,
  toJSON: () => ({}),
} as DOMRect;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Combobox mobile menu layout", () => {
  it("renders an absolute menu in a fixed viewport layer with 16px insets", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches: query === "(max-width: 639px)",
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    );
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(MOBILE_WIDTH);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(MOBILE_HEIGHT);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      ANCHOR_RECT,
    );

    render(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={[
          { value: "api", label: "api" },
          { value: "worker", label: "worker" },
        ]}
      />,
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveClass("max-sm:text-base");
    fireEvent.focus(input);

    const listbox = screen.getByRole("listbox");
    const viewportLayer = listbox.parentElement;
    expect(viewportLayer).toHaveAttribute(
      "data-slot",
      "combobox-viewport-layer",
    );
    expect(viewportLayer).toHaveStyle({
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
    });
    expect(listbox).toHaveStyle({
      position: "absolute",
      top: "136px",
      left: "16px",
      width: "358px",
      maxWidth: "358px",
      pointerEvents: "auto",
    });
    expect(listbox.style.minWidth).toBe("");
  });

  it("stays below when content fits and uses the larger side when it does not", () => {
    const input = {
      anchor: { top: 600, bottom: 632, left: 48, width: 288 },
      viewportWidth: MOBILE_WIDTH,
      viewportHeight: MOBILE_HEIGHT,
      mobile: true,
    };

    expect(
      calculateComboboxMenuPosition({ ...input, naturalHeight: 120 }),
    ).toEqual({
      strategy: "mobile",
      top: 636,
      left: 16,
      width: 358,
      maxWidth: 358,
      maxHeight: 200,
    });
    expect(
      calculateComboboxMenuPosition({ ...input, naturalHeight: 320 }),
    ).toEqual({
      strategy: "mobile",
      bottom: 248,
      left: 16,
      width: 358,
      maxWidth: 358,
      maxHeight: 588,
    });
  });

  it("reserves the anchor gap when calculating desktop menu height", () => {
    expect(
      calculateComboboxMenuPosition({
        anchor: { top: 8, bottom: 40, left: 20, width: 120 },
        viewportWidth: 400,
        viewportHeight: 100,
        mobile: false,
      }),
    ).toMatchObject({ strategy: "desktop", top: 44, maxHeight: 48 });
  });
});
