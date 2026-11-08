/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DENSITY_TOKENS, PLACEMENT_SHAPES } from "@flanksource/facet";
import { findDemoEntry } from "../demo-catalog";
import { FacetDiagramStyleDemo } from "./FacetDiagramStyleDemo";

afterEach(cleanup);

const headerPadding = (id: string) =>
  document.querySelector<HTMLElement>(`#${id} > div`)?.style.padding;

describe("facet diagram style demo", () => {
  it("is registered in the demo catalog", () => {
    expect(findDemoEntry("facet-diagram-style")?.component).toBe(FacetDiagramStyleDemo);
  });

  it("re-pads inheriting boxes when the density changes, but not the compact override", () => {
    render(<FacetDiagramStyleDemo />);
    fireEvent.click(within(screen.getByRole("radiogroup", { name: "Diagram density" })).getByRole("radio", { name: "spacious" }));

    expect([headerPadding("demo-inherit"), headerPadding("demo-compact")]).toEqual([
      DENSITY_TOKENS.spacious.header,
      DENSITY_TOKENS.compact.header,
    ]);
  });

  it("reshapes the group and members for the selected placement", () => {
    render(<FacetDiagramStyleDemo />);
    fireEvent.change(screen.getByRole("combobox", { name: "Diagram placement" }), { target: { value: "planes" } });

    const group = document.querySelector("#demo-group");
    expect({
      container: group?.getAttribute("data-container-style"),
      orientation: group?.getAttribute("data-orientation"),
      box: group?.querySelector("[data-box-style]")?.getAttribute("data-box-style"),
    }).toEqual({
      container: PLACEMENT_SHAPES.planes.container,
      orientation: PLACEMENT_SHAPES.planes.orientation,
      box: PLACEMENT_SHAPES.planes.box,
    });
  });

  it("recolours inheriting headers when the theme changes", () => {
    render(<FacetDiagramStyleDemo />);
    const before = document.querySelector<HTMLElement>("#demo-inherit > div")?.style.backgroundColor;
    fireEvent.change(screen.getByRole("combobox", { name: "Diagram theme" }), { target: { value: "night" } });

    expect(document.querySelector<HTMLElement>("#demo-inherit > div")?.style.backgroundColor).not.toBe(before);
  });
});
