import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DensityContext, type Density } from "../hooks/use-density";
import { JsonView } from "./JsonView";

describe("JsonView", () => {
  it("renders null and undefined as italic null", () => {
    render(<JsonView data={null} />);
    expect(screen.getByText("null")).toBeInTheDocument();
  });

  it("renders a string with quotes", () => {
    render(<JsonView data="hello" format="json" />);
    expect(screen.getByText('"hello"')).toBeInTheDocument();
  });

  it("renders an empty object as {}", () => {
    const { container } = render(<JsonView data={{}} />);
    expect(container.textContent).toContain("{");
    expect(container.textContent).toContain("}");
  });

  it("shows collapsed summary at depths beyond defaultOpenDepth", () => {
    render(<JsonView data={{ a: { b: { c: 1 } } }} defaultOpenDepth={1} />);
    expect(
      within(screen.getByRole("button", { name: "Expand a" })).getByText(
        /1 key/,
      ),
    ).toBeInTheDocument();
  });

  it("uses singular grammar for a collapsed one-item array", () => {
    render(<JsonView data={{ values: ["only"] }} defaultOpenDepth={1} />);
    expect(screen.getByText(/1 item/)).toBeInTheDocument();
    expect(screen.queryByText(/1 items/)).not.toBeInTheDocument();
  });

  it("renders numeric and boolean values", () => {
    render(<JsonView data={{ n: 42, b: true }} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("defaults to YAML with plain strings and sequence markers", () => {
    const { container } = render(
      <JsonView data={{ service: "api", tags: ["alpha", "beta"] }} />,
    );
    expect(container.firstChild).toHaveAttribute("data-format", "yaml");
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(container.textContent).toContain("- alpha");
    expect(container.textContent).toContain("- beta");
    expect(container.textContent).not.toContain("{");
  });

  it.each([
    ["true", '"true"'],
    ["null", '"null"'],
    ["42", '"42"'],
    ["", '""'],
    ["a: b", '"a: b"'],
    ["first\nsecond", '"first\\nsecond"'],
  ])(
    "preserves the YAML string %j without changing its type",
    (data, expected) => {
      render(<JsonView data={data} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    },
  );

  it.each(["yaml", "json"] as const)(
    "keeps names on empty containers and nulls in %s",
    (format) => {
      const { container } = render(
        <JsonView format={format} data={{ obj: {}, arr: [], owner: null }} />,
      );
      expect(container.textContent).toContain("obj: {}");
      expect(container.textContent).toContain("arr: []");
      expect(container.textContent).toContain("owner: null");
    },
  );

  it("renders nested sequence containers with dashes instead of index keys", () => {
    const { container } = render(
      <JsonView data={[{ name: "api" }, ["nested"]]} />,
    );
    expect(container.textContent).toContain("- name: api");
    expect(container.textContent).toContain("- - nested");
    expect(container.textContent).not.toContain("0:");
  });

  it.each(["yaml", "json"] as const)(
    "expands and collapses %s collections using an accessible control",
    (format) => {
      render(
        <JsonView
          format={format}
          data={{ nested: { value: "visible" } }}
          defaultOpenDepth={1}
        />,
      );
      const toggle = screen.getByRole("button", { name: "Expand nested" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.getByText(format === "yaml" ? "visible" : '"visible"'),
      ).toBeInTheDocument();
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(
        screen.queryByText(format === "yaml" ? "visible" : '"visible"'),
      ).not.toBeInTheDocument();
    },
  );

  it.each(["compact", "comfortable", "spacious"] as const)(
    "inherits %s density and allows an instance override",
    (density: Density) => {
      const { container, rerender } = render(
        <DensityContext.Provider value={{ density, setDensity: () => {} }}>
          <JsonView data={{ nested: { value: true } }} />
        </DensityContext.Provider>,
      );
      expect(container.firstChild).toHaveAttribute("data-density", density);
      rerender(
        <DensityContext.Provider value={{ density, setDensity: () => {} }}>
          <JsonView data={{ nested: { value: true } }} density="compact" />
        </DensityContext.Provider>,
      );
      expect(container.firstChild).toHaveAttribute("data-density", "compact");
    },
  );
});
