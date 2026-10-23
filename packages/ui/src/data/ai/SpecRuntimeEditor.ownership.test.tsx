import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpecRuntimeEditor } from "./SpecRuntimeEditor";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";
import { promptRuntimeValueToPayload } from "./PromptPicker/prompt-runtime";

const VALUE: AISpecRuntimeValue = {
  mode: "agent",
  model: "claude-sonnet",
  effort: "high",
  budget: { cost: 5, timeout: "2h", maxTokens: 12000, maxTurns: 8 },
  permissions: { mode: "auto" },
  setup: { checkout: { worktree: { mode: "new", path: "/work/task" } } },
  workflow: { commits: [{ on: "turn" }] },
};

describe("runtime setting ownership", () => {
  it("only allows a preset to specify a session ID", () => {
    const onChange = vi.fn();
    const props = {
      value: { sessionId: "existing-session" },
      onChange,
      sections: ["model"] as const,
    };
    const { rerender } = render(<SpecRuntimeEditor {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Advanced/ }));
    expect(screen.queryByLabelText("Session ID")).not.toBeInTheDocument();
    rerender(<SpecRuntimeEditor {...props} variant="preset" />);
    fireEvent.change(screen.getByLabelText("Session ID"), {
      target: { value: "chosen-session" },
    });
    expect(onChange).toHaveBeenLastCalledWith({ sessionId: "chosen-session" });
  });
  it("keeps primary runtime settings and token/turn limits out of the detailed editor", () => {
    render(
      <SpecRuntimeEditor
        value={VALUE}
        onChange={vi.fn()}
        sections={["model", "permissions", "workspace", "commit"]}
        showHeader={false}
      />,
    );

    for (const label of [
      "Model",
      "Max cost (USD)",
      "Timeout",
      "Max tokens",
      "Max turns",
      "Permission mode",
      "Worktree mode",
      "Worktree path",
      "Commit",
    ]) {
      expect(
        screen.queryByLabelText(label, {
          selector: "input,select,textarea,button",
        }),
      ).not.toBeInTheDocument();
    }
    expect(
      screen.queryByRole("group", { name: "Runtime" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Commit message")).toBeInTheDocument();
  });

  it("preserves stored limits and runtime fields when changing detailed settings", () => {
    const onChange = vi.fn();
    render(
      <SpecRuntimeEditor
        value={VALUE}
        onChange={onChange}
        sections={["commit"]}
      />,
    );
    fireEvent.change(screen.getByLabelText("Commit message"), {
      target: { value: "Apply task changes" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      ...VALUE,
      workflow: { commits: [{ on: "turn", message: "Apply task changes" }] },
    });
  });

  it("serializes explicit Never and stored limits without converting them to inheritance", () => {
    expect(
      promptRuntimeValueToPayload({
        budget: VALUE.budget,
        workflow: { commits: [] },
        prompt: { user: "Implement {{body}}", system: "Follow conventions" },
      }),
    ).toEqual({
      body: "Implement {{body}}",
      spec: {
        budget: VALUE.budget,
        workflow: { commits: [] },
        prompt: { system: "Follow conventions" },
      },
    });
  });
});
