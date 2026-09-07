import { render, screen, fireEvent, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SessionApprovalsPanel,
  pendingApprovalRequests,
} from "./SessionInspector.approvals";
import type { SessionApprovalRequest } from "./SessionViewer.unified";

afterEach(() => {
  vi.useRealTimers();
});

function pendingRequest(
  overrides: Partial<SessionApprovalRequest> = {},
): SessionApprovalRequest {
  return {
    id: "approval-1",
    promptRunId: "run-1",
    toolCallId: "call-1",
    kind: "tool_approval",
    state: "pending",
    tool: "Write",
    input: { file_path: "/repo/README.md", content: "hello" },
    requestedBy: "agent-1",
    createdAt: "2026-09-07T12:00:00.000Z",
    expiresAt: "2026-09-07T12:15:00.000Z",
    ...overrides,
  };
}

describe("pendingApprovalRequests", () => {
  it("keeps only pending tool_approval requests", () => {
    const requests: SessionApprovalRequest[] = [
      pendingRequest({ id: "a" }),
      pendingRequest({ id: "b", state: "approved" }),
      pendingRequest({ id: "c", kind: "other" }),
    ];
    expect(pendingApprovalRequests(requests).map((r) => r.id)).toEqual(["a"]);
  });

  it("returns an empty array for undefined input", () => {
    expect(pendingApprovalRequests(undefined)).toEqual([]);
  });
});

describe("SessionApprovalsPanel", () => {
  it("shows an empty state when there is nothing to report", () => {
    render(<SessionApprovalsPanel approvals={undefined} requests={undefined} />);
    expect(screen.getByText("No approval metadata.")).toBeInTheDocument();
  });

  it("renders a pending request with tool name, age, and time remaining", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-07T12:05:00.000Z"));

    render(
      <SessionApprovalsPanel
        approvals={undefined}
        requests={[pendingRequest()]}
      />,
    );

    expect(screen.getByText("Write")).toBeInTheDocument();
    expect(screen.getByText(/5m ago/)).toBeInTheDocument();
    expect(screen.getByText(/10m left/)).toBeInTheDocument();
    expect(screen.getByText("Requested by agent-1")).toBeInTheDocument();
  });

  it("marks an expired request instead of a negative countdown", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-07T13:00:00.000Z"));

    render(
      <SessionApprovalsPanel
        approvals={undefined}
        requests={[pendingRequest()]}
      />,
    );

    expect(screen.getByText("expired")).toBeInTheDocument();
  });

  it("still renders the resolved summary and denials list", () => {
    render(
      <SessionApprovalsPanel
        approvals={{
          approved: 2,
          denied: 1,
          denials: [{ tool: "Bash", reason: "Needs manual review" }],
        }}
        requests={[]}
      />,
    );

    expect(screen.getByText("Needs manual review")).toBeInTheDocument();
  });

  it("invokes onResolve with the approval id and approve action", async () => {
    const onResolve = vi.fn().mockResolvedValue(undefined);
    render(
      <SessionApprovalsPanel
        approvals={undefined}
        requests={[pendingRequest()]}
        onResolve={onResolve}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onResolve).toHaveBeenCalledWith("approval-1", "approve", undefined);
  });

  it("invokes onResolve with the deny action", () => {
    const onResolve = vi.fn().mockResolvedValue(undefined);
    render(
      <SessionApprovalsPanel
        approvals={undefined}
        requests={[pendingRequest()]}
        onResolve={onResolve}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Deny" }));
    expect(onResolve).toHaveBeenCalledWith("approval-1", "deny", undefined);
  });

  it("surfaces a rejected onResolve as a visible refusal message", async () => {
    const onResolve = vi
      .fn()
      .mockRejectedValue(new Error("prompt run is not waiting"));
    render(
      <SessionApprovalsPanel
        approvals={undefined}
        requests={[pendingRequest()]}
        onResolve={onResolve}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("prompt run is not waiting");
  });

  it("renders one row per pending request when several are outstanding", () => {
    render(
      <SessionApprovalsPanel
        approvals={undefined}
        requests={[
          pendingRequest({ id: "a", tool: "Write" }),
          pendingRequest({ id: "b", tool: "Bash", toolCallId: "call-2" }),
        ]}
      />,
    );

    expect(screen.getAllByRole("button", { name: "Approve" })).toHaveLength(2);
    expect(within(screen.getByText("Awaiting approval (2)").closest("section")!).getByText("Bash")).toBeInTheDocument();
  });
});
