import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptRunEditor } from ".";
import type { AIPromptRunValue } from "./model";

const VALUE: AIPromptRunValue = {
  variables: { company: "Acme" },
  spec: {
    model: "claude-sonnet-4-6",
    id: "anthropic/claude-sonnet-4-6",
    mode: "api",
    prompt: { user: "Review {{company}}", system: "Be precise" },
    messages: [{ role: "user", parts: [{ type: "text", text: "preserve me" }] }],
  },
  chat: true,
};

describe("PromptRunEditor", () => {
  it("edits the canonical prompt run request without dropping untouched spec fields", () => {
    const onChange = vi.fn();
    render(<PromptRunEditor value={VALUE} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("User prompt"), {
      target: { value: "Reconcile {{company}}" },
    });

    expect(onChange).toHaveBeenLastCalledWith({
      ...VALUE,
      spec: {
        ...VALUE.spec,
        prompt: {
          ...VALUE.spec?.prompt,
          user: "Reconcile {{company}}",
        },
      },
    });
  });

  it("creates canonical comparison runtimes inside the shared editor", () => {
    const onChange = vi.fn();
    render(<PromptRunEditor value={VALUE} onChange={onChange} />);

    expect(screen.getByRole("group", { name: "Runtime 1" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add runtime" }));

    expect(onChange).toHaveBeenLastCalledWith({
      ...VALUE,
      spec: VALUE.spec,
      runtimes: [
        {
          model: "claude-sonnet-4-6",
          id: "anthropic/claude-sonnet-4-6",
          mode: "api",
        },
        { mode: "api" },
      ],
    });
  });
});
