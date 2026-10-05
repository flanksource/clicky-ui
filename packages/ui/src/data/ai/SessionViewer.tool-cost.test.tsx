import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionViewer } from "./SessionViewer";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

const SESSION: UnifiedSessionInput = {
  messages: [{
    id: "tool-batch",
    role: "assistant",
    parts: [{
      type: "dynamic-tool",
      toolName: "Read",
      toolCallId: "read-example",
      input: { file_path: "example.go" },
      estimatedCost: {
        sharedCalls: 2,
        cost: {
          inputTokens: 1000, outputTokens: 20, reasoningTokens: 5,
          cacheReadTokens: 8000, cacheWriteTokens: 200, totalTokens: 9225,
          inputCost: 0.002, outputCost: 0.0002, reasoningCost: 0.00005,
          cacheReadCost: 0.0008, cacheWriteCost: 0.0004,
        },
      },
    }, {
      type: "dynamic-tool", toolName: "Grep", toolCallId: "unpriced",
      input: { pattern: "example" },
    }],
  }],
};

describe("Estimated tool cost display", () => {
  it("opts in to an inline cost and shows the breakdown only in the expanded detail footer", () => {
    const { container } = render(<SessionViewer session={SESSION} />);
    expect(screen.queryByLabelText("Estimated tool cost")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    const toggle = screen.getByRole("menuitemcheckbox", { name: "Show estimated tool cost" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);

    const estimate = screen.getByLabelText("Estimated tool cost");
    expect(estimate).toHaveTextContent(/^~\$0\.0035\+8k$/);
    const cacheDelta = within(estimate).getByLabelText("Cache read delta: 8,000 tokens");
    expect(cacheDelta).toHaveAttribute("title", "Cache read delta: 8,000 tokens");
    expect(cacheDelta.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(estimate.closest('[data-tool-header]')).not.toBeNull();
    expect(container.querySelector("button button")).toBeNull();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Estimated tool cost details")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /example.go/ }));
    const breakdown = screen.getByLabelText("Estimated tool cost details");
    expect(breakdown.parentElement?.lastElementChild).toBe(breakdown);
    for (const label of [
      "Input: 1,000 tokens", "Output: 20 tokens", "Reasoning: 5 tokens",
      "Cache read: 8,000 tokens", "Cache write: 200 tokens",
    ]) {
      const bucket = within(breakdown).getByLabelText(label);
      expect(bucket).toHaveAttribute("title", label);
      expect(bucket.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    }
    const currency = within(breakdown).getByLabelText("Estimated cost: $0.0035 USD");
    expect(currency).toHaveTextContent("USD");
    expect(currency.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(estimate).toHaveAttribute("title", expect.stringContaining("2 tool calls"));
    expect(screen.getByLabelText("Estimate unavailable")).toHaveTextContent("—");
    expect(container.querySelector('li[data-event-kind="assistant"] [aria-label="Estimated tool cost"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /example.go/ }));
    expect(screen.queryByLabelText("Estimated tool cost details")).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.queryByLabelText("Estimated tool cost")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Estimate unavailable")).not.toBeInTheDocument();
  });

  it("keeps estimates on collapsed and expanded Wait rows", () => {
    render(<SessionViewer session={{ messages: [{
      id: "waits", role: "assistant", parts: ["one", "two"].map((id) => ({
        type: "dynamic-tool", toolName: "Wait", toolCallId: id,
        input: { cell_id: id }, output: "Finished",
        estimatedCost: { sharedCalls: 1, cost: { inputTokens: 10, outputTokens: 1, cacheReadTokens: 500, inputCost: 0.001 } },
      })),
    }] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Show estimated tool cost" }));
    expect(screen.getByLabelText("Estimated tool cost")).toHaveTextContent("~$0.0020");
    expect(within(screen.getByLabelText("Estimated tool cost")).getByLabelText("Cache read delta: 1,000 tokens")).toHaveTextContent("+1k");
    expect(screen.getByLabelText("Estimated tool cost").closest('[data-tool-header]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expand Wait × 2" }));
    const rows = screen.getAllByLabelText("Estimated tool cost");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByText("~$0.0010")).toBeInTheDocument();
    expect(rows.map((row) => within(row).getByLabelText("Cache read delta: 500 tokens").textContent)).toEqual(["+500", "+500"]);
    expect(screen.getByLabelText("Estimated tool cost details")).toHaveTextContent("~$0.0020");
  });

  it.each([undefined, "Finished"])("shows a command cost footer when expanded with output %s", (output) => {
    render(<SessionViewer session={{ messages: [{ id: "command", role: "assistant", parts: [{
      type: "dynamic-tool", toolName: "Bash", input: { command: "pwd" },
      ...(output !== undefined ? { output } : {}),
      estimatedCost: { sharedCalls: 1, cost: { inputTokens: 10, outputTokens: 1, inputCost: 0.001 } },
    }] }] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Show estimated tool cost" }));
    expect(screen.queryByLabelText(/Cache read delta:/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Estimated tool cost details")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Toggle response" }));
    const footer = screen.getByLabelText("Estimated tool cost details");
    expect(footer).toHaveTextContent("~$0.0010");
    expect(footer.parentElement?.lastElementChild).toBe(footer);
  });
});
