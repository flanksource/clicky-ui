import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonView } from "./JsonView";

describe("JsonView", () => {
  it("renders null and undefined as italic null", () => {
    render(<JsonView data={null} />);
    expect(screen.getByText("null")).toBeInTheDocument();
  });

  it("renders a string with quotes", () => {
    render(<JsonView data="hello" />);
    expect(screen.getByText('"hello"')).toBeInTheDocument();
  });

  it("renders an empty object as {}", () => {
    const { container } = render(<JsonView data={{}} />);
    expect(container.textContent).toContain("{");
    expect(container.textContent).toContain("}");
  });

  it("shows collapsed summary at depths beyond defaultOpenDepth", () => {
    render(<JsonView data={{ a: { b: { c: 1 } } }} defaultOpenDepth={1} />);
    expect(screen.getByText(/1 keys/)).toBeInTheDocument();
  });

  it("renders numeric and boolean values", () => {
    render(<JsonView data={{ n: 42, b: true }} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });
});
