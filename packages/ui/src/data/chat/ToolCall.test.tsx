import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolCall } from "./ToolCall";
import { createToolRenderRegistry } from "./tool-render/registry";
import { toolNameAdapter } from "./tool-render/adapter";
import type { DynamicToolUIPart, ToolMeta } from "./types";

function dynamicPart(
  overrides: Partial<DynamicToolUIPart> = {},
): DynamicToolUIPart {
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

  it("shows compact input args while collapsed and reveals the full call when expanded", () => {
    const { container } = render(<ToolCall part={dynamicPart()} />);
    const args = container.querySelector('[data-slot="tool-call-args"]');
    expect(args).toHaveTextContent("namespace: default");
    expect(screen.getByText("namespace")).toHaveClass(
      "text-muted-foreground/60",
    );
    expect(container.textContent).not.toContain("count");

    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByTestId("tool-call-args")).toBeNull();
    expect(container.textContent).toContain("namespace");
    expect(container.textContent).toContain("default");
    expect(container.textContent).toContain("count");
  });

  it("renders error text for an output-error part", () => {
    render(
      <ToolCall
        defaultOpen
        part={dynamicPart({
          state: "output-error",
          errorText: "boom",
          output: undefined,
        })}
      />,
    );
    expect(screen.getByText("boom")).toBeInTheDocument();
  });

  it("allows hosts to render recognized tool outputs", () => {
    render(
      <ToolCall
        defaultOpen
        part={dynamicPart({
          toolName: "xero_formula_patch",
          output: { clientAction: { type: "formula.replace" } },
        })}
        renderToolResult={({ toolName, output }) => (
          <button type="button">
            {toolName}:
            {(output as { clientAction: { type: string } }).clientAction.type}
          </button>
        )}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "xero_formula_patch:formula.replace",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("clientAction")).toBeNull();
  });

  it("derives the name from a typed tool-<name> part", () => {
    render(
      <ToolCall
        part={
          {
            type: "tool-getPod",
            toolCallId: "c2",
            state: "input-available",
            input: {},
          } as never
        }
      />,
    );
    expect(screen.getByText("getPod")).toBeInTheDocument();
  });
});

describe("ToolCall tool-render registry", () => {
  const registry = createToolRenderRegistry([
    toolNameAdapter("host:pods", "listPods", {
      renderOutput: (ctx) => (
        <span>
          host output {String((ctx.output as { count: number }).count)}
        </span>
      ),
    }),
  ]);

  it("prefers a matching adapter over the built-in output rendering", () => {
    render(<ToolCall defaultOpen part={dynamicPart()} registry={registry} />);
    expect(screen.getByText("host output 2")).toBeInTheDocument();
  });

  it("still renders the built-in input params when the adapter only claims the output", () => {
    const { container } = render(
      <ToolCall defaultOpen part={dynamicPart()} registry={registry} />,
    );
    expect(container.textContent).toContain("namespace");
    expect(container.textContent).toContain("default");
  });

  it("lets renderToolResult win over a matching adapter", () => {
    render(
      <ToolCall
        defaultOpen
        part={dynamicPart()}
        registry={registry}
        renderToolResult={() => <span>host prop</span>}
      />,
    );
    expect(screen.getByText("host prop")).toBeInTheDocument();
    expect(screen.queryByText("host output 2")).toBeNull();
  });

  it("unwraps the transport envelope before handing the output to renderToolResult", () => {
    const renderToolResult = vi.fn(() => <span>ok</span>);
    render(
      <ToolCall
        defaultOpen
        part={dynamicPart({
          output: {
            output: JSON.stringify({
              clientAction: { type: "formula.replace" },
            }),
          },
        })}
        renderToolResult={renderToolResult}
      />,
    );
    expect(renderToolResult).toHaveBeenCalledWith(
      expect.objectContaining({
        toolName: "listPods",
        output: { clientAction: { type: "formula.replace" } },
      }),
    );
  });

  it("shows the input params while a write awaits approval, without expanding", () => {
    const part = dynamicPart({
      state: "approval-requested",
      toolName: "deletePod",
      input: { podId: "pod-1", force: true },
      output: undefined,
    });
    const { container } = render(<ToolCall part={part} onApprove={() => {}} />);
    const details = container.querySelector('[data-slot="tool-call-details"]');
    expect(details).toHaveTextContent("podId");
    expect(details).toHaveTextContent("pod-1");
    expect(details).toHaveTextContent("force");
  });

  it("labels params from the catalog's input schema", () => {
    const tool: ToolMeta = {
      name: "listPods",
      label: "List pods",
      inputSchema: {
        type: "object",
        properties: {
          namespace: { type: "string", title: "Namespace filter" },
        },
      },
    };
    render(<ToolCall defaultOpen part={dynamicPart()} tool={tool} />);
    expect(screen.getByText("Namespace filter")).toBeInTheDocument();
  });

  it("renders every non-empty input as a compact collapsed arg", () => {
    render(
      <ToolCall
        part={dynamicPart({
          input: {
            namespace: "default",
            limit: 20,
            filters: { status: "Running" },
            empty: "",
          },
        })}
      />,
    );
    const args = screen.getByTestId("tool-call-args");
    expect(args).toHaveTextContent("namespace: default");
    expect(args).toHaveTextContent("limit: 20");
    expect(args).toHaveTextContent('filters: {"status":"Running"}');
    expect(args).not.toHaveTextContent("empty");
  });

  it("bounds long collapsed arg values", () => {
    render(
      <ToolCall part={dynamicPart({ input: { patch: "a".repeat(140) } })} />,
    );
    const args = screen.getByTestId("tool-call-args");
    expect(args).toHaveTextContent(`patch: ${"a".repeat(120)}…`);
    expect(args).not.toHaveTextContent("a".repeat(121));
  });

  it("renders shell commands and their output as standard code blocks", () => {
    const { container } = render(
      <ToolCall
        defaultOpen
        part={dynamicPart({
          toolName: "Bash",
          input: { command: "pnpm test", timeout: 120_000 },
          output: "3 tests passed\nexit 0",
        })}
      />,
    );
    const renderer = container.querySelector(
      '[data-slot="tool-render-shell-input"]',
    );
    expect(renderer).toHaveTextContent("pnpm test");
    expect(
      container.querySelectorAll('[data-slot^="tool-render-shell-"] pre'),
    ).toHaveLength(2);
    expect(renderer).toHaveTextContent("timeout");
  });

  it("renders known file edits as a language-aware diff", () => {
    const { container } = render(
      <ToolCall
        defaultOpen
        part={dynamicPart({
          toolName: "Edit",
          input: {
            file_path: "src/config.ts",
            old_string: "export const enabled = false;",
            new_string: "export const enabled = true;",
          },
          output: "Updated src/config.ts",
        })}
      />,
    );
    const renderer = container.querySelector(
      '[data-slot="tool-render-file-edit"]',
    );
    expect(renderer).toHaveTextContent("src/config.ts");
    expect(
      renderer?.querySelector('[data-diff-line="remove"]'),
    ).toHaveTextContent("export const enabled = false;");
    expect(renderer?.querySelector('[data-diff-line="add"]')).toHaveTextContent(
      "export const enabled = true;",
    );
  });

  it("renders known file-read output as source code", () => {
    const { container } = render(
      <ToolCall
        defaultOpen
        part={dynamicPart({
          toolName: "Read",
          input: { file_path: "src/config.ts" },
          output: "export const enabled = true;",
        })}
      />,
    );
    const renderer = container.querySelector(
      '[data-slot="tool-render-file-read"]',
    );
    expect(renderer?.querySelector("pre")).toHaveTextContent(
      "export const enabled = true;",
    );
  });

  it("renders known search output as line-oriented text", () => {
    const { container } = render(
      <ToolCall
        defaultOpen
        part={dynamicPart({
          toolName: "Grep",
          input: { pattern: "ToolCall", path: "src" },
          output: "src/ToolCall.tsx:12\nsrc/ToolCall.test.tsx:8",
        })}
      />,
    );
    const renderer = container.querySelector(
      '[data-slot="tool-render-text-output"]',
    );
    expect(renderer?.querySelector("pre")).toHaveTextContent(
      "src/ToolCall.tsx:12",
    );
  });

  it("renders todo and plan inputs as structured rows", () => {
    const { container } = render(
      <ToolCall
        defaultOpen
        part={dynamicPart({
          toolName: "update_plan",
          input: {
            explanation: "Implementation plan",
            plan: [
              { step: "Trace the renderer", status: "completed" },
              { step: "Add known tools", status: "in_progress" },
            ],
          },
          output: "Plan updated",
        })}
      />,
    );
    const renderer = container.querySelector('[data-slot="tool-render-plan"]');
    expect(renderer).toHaveTextContent("Trace the renderer");
    expect(renderer).toHaveTextContent("Add known tools");
    expect(renderer).toHaveTextContent("Implementation plan");
  });

  it("renders known user-question inputs as question cards", () => {
    const { container } = render(
      <ToolCall
        defaultOpen
        part={dynamicPart({
          toolName: "AskUserQuestion",
          input: {
            questions: [
              {
                header: "Scope",
                question: "Which environment?",
                options: [
                  { label: "Local", description: "Use local fixtures" },
                  { label: "Staging" },
                ],
              },
            ],
          },
          output: "Local",
        })}
      />,
    );
    const renderer = container.querySelector(
      '[data-slot="tool-render-question"]',
    );
    expect(renderer).toHaveTextContent("Scope");
    expect(renderer).toHaveTextContent("Which environment?");
    expect(renderer).toHaveTextContent("Local");
    expect(renderer).toHaveTextContent("Use local fixtures");
  });
});
