import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonView } from "./JsonView";

describe("JsonView source input", () => {
  it("renders raw JSON as YAML by default", () => {
    const { container } = render(
      <JsonView source={'{"name":"api","ports":[8080]}'} />,
    );
    expect(container.firstChild).toHaveAttribute("data-format", "yaml");
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(container.textContent).toContain("- 8080");
  });

  it("preserves string-valued data without automatically parsing it", () => {
    const source = '{"name":"api"}';
    render(<JsonView data={source} />);
    expect(screen.getByText(`'${source}'`)).toBeInTheDocument();
    expect(screen.queryByText("name")).not.toBeInTheDocument();
  });

  it("warns about incomplete input while retaining completed values and the exact source", () => {
    const source = '{\n  "name":"api", "pending":"cut';
    const { container } = render(<JsonView source={source} />);
    expect(screen.getByRole("status")).toHaveTextContent("Incomplete JSON");
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.queryByText("pending")).not.toBeInTheDocument();
    const disclosure = screen.getByRole("button", { name: /Original source/ });
    expect(disclosure).toContainElement(screen.getByRole("status"));
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(disclosure);
    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region")).toHaveTextContent(
      "Showing completed values only.",
    );
    expect(container.querySelector("pre")?.textContent).toBe(source);
  });

  it("shows invalid input diagnostics without rendering repaired data", () => {
    render(<JsonView source={'{\n  "name":wrong\n}'} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid JSON");
    expect(screen.getByRole("alert")).toHaveTextContent("Line 2, column 10");
    expect(
      screen.getByRole("button", { name: /Original source/ }),
    ).toContainElement(screen.getByRole("alert"));
    expect(screen.queryByText("name")).not.toBeInTheDocument();
  });

  it("gives each original-source disclosure its own panel", () => {
    render(
      <>
        <JsonView source={'{"name":"api"}'} />
        <JsonView source={'{"name":"worker"}'} />
      </>,
    );
    const disclosures = screen.getAllByRole("button", {
      name: "Original source",
    });
    expect(
      new Set(disclosures.map((button) => button.getAttribute("aria-controls")))
        .size,
    ).toBe(2);
    for (const disclosure of disclosures) {
      fireEvent.click(disclosure);
      const panelId = disclosure.getAttribute("aria-controls");
      if (!panelId) throw new Error("Source disclosure has no panel ID");
      expect(document.getElementById(panelId)).toHaveAttribute(
        "aria-labelledby",
        disclosure.id,
      );
    }
  });

  it("states when incomplete input has no recoverable values", () => {
    render(<JsonView source={'{"name":"cut'} />);
    expect(
      screen.getByText("No completed values received."),
    ).toBeInTheDocument();
    expect(screen.queryByText("null")).not.toBeInTheDocument();
  });

  it("clears the incomplete warning and exposes the finished value when source changes", () => {
    const { rerender } = render(
      <JsonView source={'{"name":"api","enabled":tru'} />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<JsonView source={'{"name":"api","enabled":true}'} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("keeps the final incomplete NDJSON record separate from completed records", () => {
    render(
      <JsonView
        source={'{"name":"api"}\n{"name":"worker","pending":"cut'}
        inputFormat="ndjson"
        defaultOpenDepth={3}
      />,
    );
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.getByText("worker")).toBeInTheDocument();
    expect(screen.getByText("Line 2 (incomplete record)")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Incomplete NDJSON");
    expect(
      screen.getByRole("button", { name: /Original source/ }),
    ).toContainElement(screen.getByRole("status"));
  });

  it("retains earlier NDJSON records under an explicit error", () => {
    render(
      <JsonView
        source={'{"name":"api"}\ninvalid\n{"name":"later"}'}
        inputFormat="ndjson"
        defaultOpenDepth={3}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Line 2");
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.queryByText("later")).not.toBeInTheDocument();
  });
});
