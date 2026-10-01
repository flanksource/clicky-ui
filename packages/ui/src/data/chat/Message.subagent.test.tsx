import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Message } from "./Message";
import type { DynamicToolUIPart, UIMessage } from "./types";

const AGENT_CALL = "agent-1";

function toolPart(
  toolCallId: string,
  toolName: string,
  state: DynamicToolUIPart["state"],
  parentToolCallId?: string,
): DynamicToolUIPart {
  return {
    type: "dynamic-tool",
    toolName,
    toolCallId,
    state,
    input: {},
    ...(state === "output-available" ? { output: "ok" } : {}),
    ...(state === "output-error" ? { errorText: "failed" } : {}),
    ...(parentToolCallId ? { toolMetadata: { parentToolCallId } } : {}),
  } as DynamicToolUIPart;
}

function assistant(parts: UIMessage["parts"]): UIMessage {
  return { id: "m-1", role: "assistant", parts } as UIMessage;
}

describe("Message subagent tool calls", () => {
  it("nests a subagent's calls under the Agent call that spawned it", () => {
    const { container } = render(
      <Message
        message={assistant([
          toolPart(AGENT_CALL, "Agent", "output-available"),
          toolPart("sub-1", "Bash", "output-available", AGENT_CALL),
          toolPart("sub-2", "Read", "input-available", AGENT_CALL),
          toolPart("top-2", "Grep", "output-available"),
        ])}
      />,
    );

    const headers = () =>
      Array.from(container.querySelectorAll("button[aria-expanded]")).map(
        (button) => button.querySelector(".font-mono")?.textContent,
      );
    // Collapsed, only the top-level calls show; the Agent header counts its
    // subagent's calls and how many are still running.
    expect(headers()).toEqual(["Agent", "Grep"]);
    expect(screen.getByText("2 calls · 1 running")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Agent"));
    const nested = container.querySelector('[data-slot="tool-call-subcalls"]');
    expect(nested).not.toBeNull();
    expect(
      Array.from(nested!.querySelectorAll(".font-mono")).map((el) => el.textContent),
    ).toEqual(["Bash", "Read"]);
    expect(within(nested as HTMLElement).queryByText("Grep")).toBeNull();
  });

  it("keeps a subagent call top-level when its parent is not in the message", () => {
    const { container } = render(
      <Message message={assistant([toolPart("sub-1", "Bash", "output-available", "agent-elsewhere")])} />,
    );
    expect(container.querySelector('[data-slot="tool-call-subcalls"]')).toBeNull();
    expect(screen.getByText("Bash")).toBeInTheDocument();
  });
});
