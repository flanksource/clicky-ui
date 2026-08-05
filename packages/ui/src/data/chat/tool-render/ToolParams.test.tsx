import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolParams } from "./ToolParams";
import type { ChatToolInputSchema } from "../types";

const SCHEMA: ChatToolInputSchema = {
  type: "object",
  properties: {
    clusterId: { type: "string", title: "Cluster" },
    severity: { type: "string", enum: ["P1"], "x-enum-labels": { P1: "Critical" } },
  },
};

describe("ToolParams", () => {
  it("labels each param with its raw API key", () => {
    render(<ToolParams input={{ namespace: "default", limit: 20 }} />);
    expect(screen.getByText("namespace")).toBeInTheDocument();
    expect(screen.getByText("default")).toBeInTheDocument();
    expect(screen.getByText("limit")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("uses the schema title as the label when the catalog published one", () => {
    render(<ToolParams input={{ clusterId: "prod-1" }} schema={SCHEMA} />);
    expect(screen.getByText("Cluster")).toBeInTheDocument();
    expect(screen.queryByText("clusterId")).toBeNull();
  });

  it("renders an enum value with its published label beside the raw value", () => {
    render(<ToolParams input={{ severity: "P1" }} schema={SCHEMA} />);
    expect(screen.getByText("Critical", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("(P1)")).toBeInTheDocument();
  });

  it("shows the empty message for no params and for an all-empty input", () => {
    const { rerender } = render(<ToolParams input={{}} />);
    expect(screen.getByText("No parameters")).toBeInTheDocument();

    rerender(<ToolParams input={undefined} />);
    expect(screen.getByText("No parameters")).toBeInTheDocument();

    rerender(<ToolParams input={{ note: "", other: null }} emptyMessage="Nothing to approve" />);
    expect(screen.getByText("Nothing to approve")).toBeInTheDocument();
  });

  it("renders a source-ish param as a code block rather than inline text", () => {
    const markdown = "# Heading\n\nbody";
    const { container } = render(<ToolParams input={{ markdown }} />);
    const pre = container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toContain("# Heading");
  });

  it("renders a boolean as a glyph, not the literal value", () => {
    const { container } = render(<ToolParams input={{ dryRun: true }} />);
    expect(screen.getByLabelText("true")).toBeInTheDocument();
    expect(container.textContent).not.toContain("true");
  });

  it("renders a scalar array as chips and an object as a collapsed tree", () => {
    render(<ToolParams input={{ codes: ["100", "200"], filter: { status: "OPEN" } }} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    // The nested object collapses: its key is visible, its value is not.
    expect(screen.queryByText("OPEN")).toBeNull();
  });
});
