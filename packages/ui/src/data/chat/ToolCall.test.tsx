import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolCall } from "./ToolCall";
import type { DynamicToolUIPart } from "./types";

function dynamicPart(overrides: Partial<DynamicToolUIPart> = {}): DynamicToolUIPart {
  return {
    type: "dynamic-tool",
    toolName: "listPods",
    toolCallId: "call_1",
    state: "output-available",
    input: { namespace: "default" },
    output: { count: 2 },
    ...overrides,
  } as DynamicToolUIPart;
}

describe("ToolCall", () => {
  it("shows the dynamic tool name in the collapsed header", () => {
    render(<ToolCall part={dynamicPart()} />);
    expect(screen.getByText("listPods")).toBeInTheDocument();
  });

  it("hides input and output until expanded, then reveals both", () => {
    const { container } = render(<ToolCall part={dynamicPart()} />);
    expect(container.textContent).not.toContain("namespace");

    fireEvent.click(screen.getByRole("button"));
    // CodeBlock renders JSON as a tree, so assert on the serialized text content
    // (keys + values) rather than a single contiguous text node.
    expect(container.textContent).toContain("namespace");
    expect(container.textContent).toContain("default");
    expect(container.textContent).toContain("count");
  });

  it("renders error text for an output-error part", () => {
    render(
      <ToolCall
        defaultOpen
        part={dynamicPart({ state: "output-error", errorText: "boom", output: undefined })}
      />,
    );
    expect(screen.getByText("boom")).toBeInTheDocument();
  });

  it("allows hosts to render recognized tool outputs", () => {
    render(
      <ToolCall
        defaultOpen
        part={dynamicPart({ toolName: "xero_formula_patch", output: { clientAction: { type: "formula.replace" } } })}
        renderToolResult={({ toolName, output }) => (
          <button type="button">{toolName}:{(output as { clientAction: { type: string } }).clientAction.type}</button>
        )}
      />,
    );

    expect(screen.getByRole("button", { name: "xero_formula_patch:formula.replace" })).toBeInTheDocument();
    expect(screen.queryByText("clientAction")).toBeNull();
  });

  it("derives the name from a typed tool-<name> part", () => {
    render(
      <ToolCall
        part={{
          type: "tool-getPod",
          toolCallId: "c2",
          state: "input-available",
          input: {},
        } as never}
      />,
    );
    expect(screen.getByText("getPod")).toBeInTheDocument();
  });
});
