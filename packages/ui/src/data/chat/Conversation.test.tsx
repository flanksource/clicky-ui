import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Conversation } from "./Conversation";
import type { UIMessage } from "./types";

const USER_MESSAGE: UIMessage = {
  id: "u1",
  role: "user",
  parts: [{ type: "text", text: "hello" }],
};

describe("Conversation", () => {
  it("shows a waiting indicator while awaiting the response stream", () => {
    render(<Conversation messages={[USER_MESSAGE]} status="submitted" />);

    expect(screen.getByText("Waiting for response...")).toBeInTheDocument();
  });

  it("keeps showing the waiting indicator until streaming content is visible", () => {
    render(
      <Conversation
        messages={[
          USER_MESSAGE,
          { id: "a1", role: "assistant", parts: [{ type: "step-start" }] } as UIMessage,
        ]}
        status="streaming"
      />,
    );

    expect(screen.getByText("Waiting for response...")).toBeInTheDocument();
  });

  it("shows request errors from the chat transport", () => {
    render(
      <Conversation
        messages={[USER_MESSAGE]}
        status="error"
        error={new Error("no AI provider configured")}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("no AI provider configured");
  });

  it("copies a diagnostic report with session, model, page and error detail", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(
      <Conversation
        messages={[USER_MESSAGE]}
        status="error"
        error={new Error('No tool invocation found for tool call ID "abc".')}
        sessionId="thread-42"
        model="anthropic/claude-sonnet-5"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy error details" }));

    expect(writeText).toHaveBeenCalledOnce();
    const report = writeText.mock.calls[0]![0] as string;
    expect(report).toContain('Error: No tool invocation found for tool call ID "abc".');
    expect(report).toContain("Session: thread-42");
    expect(report).toContain("Model: anthropic/claude-sonnet-5");
    expect(report).toContain("Page: http://localhost");
  });

  it("can dismiss the visible error", () => {
    const onClearError = vi.fn();
    render(
      <Conversation
        messages={[USER_MESSAGE]}
        status="error"
        error={new Error("provider overloaded")}
        onClearError={onClearError}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClearError).toHaveBeenCalledOnce();
  });
});
