import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Message } from "./Message";
import type { AnyToolPart, UIMessage } from "./types";

const nestedParts: AnyToolPart[] = [
  {
    type: "dynamic-tool",
    toolCallId: "agent-root",
    toolName: "Agent",
    input: {},
    state: "output-available",
    output: "Started",
  },
  {
    type: "dynamic-tool",
    toolCallId: "agent-child",
    toolName: "Agent",
    input: {},
    state: "output-available",
    output: "Started",
    toolMetadata: { parentToolCallId: "agent-root" },
  },
  {
    type: "dynamic-tool",
    toolCallId: "leaf",
    toolName: "updateRecord",
    input: { id: "record-1" },
    state: "approval-requested",
    approval: { id: "leaf-approval" },
    toolMetadata: { parentToolCallId: "agent-child" },
  },
];

describe("Message nested tools", () => {
  it("opens all ancestors and approves a deeply nested call once", async () => {
    const onApprove = vi.fn();
    const message: UIMessage = {
      id: "nested",
      role: "assistant",
      parts: nestedParts,
    };
    render(<Message message={message} onApprove={onApprove} />);
    expect(screen.getAllByText("Agent")).toHaveLength(2);
    expect(screen.getAllByText("updateRecord")).toHaveLength(1);
    expect(screen.getByText("record-1")).toBeInTheDocument();
    for (const name of screen.getAllByText("Agent"))
      expect(name.closest("button")).toHaveAttribute("aria-expanded", "true");
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Approve" })),
    );
    expect(onApprove).toHaveBeenCalledExactlyOnceWith("leaf-approval", true);
  });

  it("opens previously collapsed ancestors when a descendant requests approval", () => {
    const { rerender } = render(
      <Message
        message={{
          id: "nested",
          role: "assistant",
          parts: nestedParts.slice(0, 2),
        }}
        onApprove={() => undefined}
      />,
    );
    expect(screen.getByText("Agent").closest("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    rerender(
      <Message
        message={{ id: "nested", role: "assistant", parts: nestedParts }}
        onApprove={() => undefined}
      />,
    );
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getAllByText("Agent")).toHaveLength(2);
  });

  it("keeps orphaned tool calls at the top level", () => {
    render(
      <Message
        message={{
          id: "orphan",
          role: "assistant",
          parts: nestedParts.slice(2),
        }}
        onApprove={() => undefined}
      />,
    );
    expect(screen.getByText("updateRecord")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });
});

describe("Message fork provenance", () => {
  it("renders a fork seed as a collapsed provenance chip instead of a user bubble", () => {
    render(
      <Message
        message={{
          id: "fork-seed",
          role: "user",
          parts: [
            {
              type: "data-fork-seed",
              data: { forkedFrom: "source-1", title: "Source chat" },
            },
            {
              type: "text",
              text: '<captain-fork source-session="source-1">\nUSER:\nQuestion\n</captain-fork>',
            },
          ],
        }}
      />,
    );

    const chip = screen.getByText("Forked from Source chat").closest("details");
    expect(chip).not.toHaveAttribute("open");
    expect(screen.queryByText("Question")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Forked from Source chat"));
    expect(chip).toHaveAttribute("open");
  });
});
