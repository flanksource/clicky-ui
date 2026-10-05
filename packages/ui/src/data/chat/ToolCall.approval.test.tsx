import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolCall } from "./ToolCall";
import type { AnyToolPart } from "./types";

const part: AnyToolPart = {
  type: "dynamic-tool",
  toolName: "updateRecord",
  toolCallId: "call-update",
  input: { id: "record-1" },
  state: "approval-requested",
  approval: { id: "approval-update" },
};

describe("ToolCall approval failures", () => {
  it.each([
    { decision: "Approve", approved: true, failure: "throw" },
    { decision: "Deny", approved: false, failure: "throw" },
    { decision: "Approve", approved: true, failure: "reject" },
    { decision: "Deny", approved: false, failure: "reject" },
  ])(
    "allows retry after $decision callbacks $failure",
    async ({ decision, approved, failure }) => {
      const onApprove = vi
        .fn<() => void | Promise<void>>()
        .mockImplementationOnce(() => {
          if (failure === "throw") throw new Error("Decision unavailable");
          return Promise.reject(new Error("Decision unavailable"));
        })
        .mockResolvedValueOnce(undefined);
      render(<ToolCall part={part} onApprove={onApprove} />);
      fireEvent.click(screen.getByRole("button", { name: decision }));
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Decision unavailable",
      );
      expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Deny" })).toBeEnabled();
      expect(
        screen.getByRole("button", { name: decision }),
      ).not.toHaveAttribute("aria-busy", "true");
      fireEvent.click(screen.getByRole("button", { name: decision }));
      await waitFor(() =>
        expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
      );
      expect(onApprove).toHaveBeenNthCalledWith(2, "approval-update", approved);
    },
  );
});
