import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionApprovalsPanel } from "./SessionInspector.approvals";
import { decisionFields } from "./SessionInspector.approvals-model";
import type { ApprovalRequest } from "./approval-request";
import type { SessionApprovalRequest } from "./SessionViewer.unified";

function row(request: ApprovalRequest): SessionApprovalRequest {
  return {
    id: "approval-9",
    kind: "tool_approval",
    state: "pending",
    tool: request.tool,
    toolCallId: request.toolUseId ?? "call-9",
    request,
  };
}

const PERMISSIONS: ApprovalRequest = {
  tool: "request_permissions",
  toolUseId: "item_9",
  kind: "permissions",
  supportedScopes: ["turn", "session"],
  permissions: { filesystem: { writableRoots: ["/repo/.git"] }, network: { access: "unrestricted" } },
};

describe("SessionApprovalsPanel typed approvals", () => {
  it("keeps the row kind filter: only tool_approval rows are listed, typed or not", () => {
    render(
      <SessionApprovalsPanel
        approvals={undefined}
        requests={[{ ...row(PERMISSIONS), kind: "other" }]}
      />,
    );
    expect(screen.getByText("No approval metadata.")).toBeInTheDocument();
  });

  it("resolves a permissions grant through onResolve with the ticked subset and scope", async () => {
    const onResolve = vi.fn().mockResolvedValue(undefined);
    render(<SessionApprovalsPanel approvals={undefined} requests={[row(PERMISSIONS)]} onResolve={onResolve} />);

    fireEvent.click(screen.getByLabelText("Network access: unrestricted"));
    fireEvent.change(screen.getByLabelText("Approval scope"), { target: { value: "session" } });
    fireEvent.click(screen.getByRole("button", { name: /Allow selected/ }));

    await waitFor(() => expect(onResolve).toHaveBeenCalledTimes(1));
    expect(onResolve).toHaveBeenCalledWith("approval-9", "approve", undefined, {
      scope: "session",
      grants: { filesystem: { writableRoots: ["/repo/.git"] } },
    });
  });

  it("resolves Cancel as a deny carrying interrupt", async () => {
    const onResolve = vi.fn().mockResolvedValue(undefined);
    const command: ApprovalRequest = {
      tool: "Bash",
      toolUseId: "toolu_9",
      kind: "command",
      interruptible: true,
      command: { command: "rm -rf build" },
    };
    render(<SessionApprovalsPanel approvals={undefined} requests={[row(command)]} onResolve={onResolve} />);
    fireEvent.click(screen.getByRole("button", { name: /Cancel/ }));
    await waitFor(() => expect(onResolve).toHaveBeenCalledTimes(1));
    expect(onResolve).toHaveBeenCalledWith("approval-9", "deny", undefined, { interrupt: true });
  });

  it("calls onResolve with exactly three arguments for a plain typed approve", async () => {
    const onResolve = vi.fn().mockResolvedValue(undefined);
    const command: ApprovalRequest = { tool: "Bash", kind: "command", command: { command: "ls" } };
    render(<SessionApprovalsPanel approvals={undefined} requests={[row(command)]} onResolve={onResolve} />);
    fireEvent.click(screen.getByRole("button", { name: /Allow/ }));
    await waitFor(() => expect(onResolve).toHaveBeenCalledTimes(1));
    expect(onResolve).toHaveBeenCalledWith("approval-9", "approve", undefined);
  });

  it("shows the refusal of a typed decision on the row", async () => {
    const onResolve = vi.fn().mockRejectedValue(new Error("scope session is not offered"));
    render(<SessionApprovalsPanel approvals={undefined} requests={[row(PERMISSIONS)]} onResolve={onResolve} />);
    fireEvent.click(screen.getByRole("button", { name: /Allow selected/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("scope session is not offered");
  });

  it("answers an elicitation form with content", async () => {
    const onResolve = vi.fn().mockResolvedValue(undefined);
    const form: ApprovalRequest = {
      tool: "Elicitation",
      kind: "elicitation",
      elicitation: {
        server: "github",
        mode: "form",
        message: "Which repo?",
        schema: { type: "object", properties: { repo: { type: "string", title: "Repository" } }, required: ["repo"] },
      },
    };
    render(<SessionApprovalsPanel approvals={undefined} requests={[row(form)]} onResolve={onResolve} />);
    fireEvent.change(screen.getByLabelText(/Repository/), { target: { value: "flanksource/gavel" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit/ }));
    await waitFor(() => expect(onResolve).toHaveBeenCalledTimes(1));
    expect(onResolve).toHaveBeenCalledWith("approval-9", "approve", undefined, {
      content: { repo: "flanksource/gavel" },
    });
  });

  it("describes a typed request without controls when no onResolve is wired", () => {
    const command: ApprovalRequest = { tool: "Bash", kind: "command", command: { command: "ls -la" }, escalates: true };
    render(<SessionApprovalsPanel approvals={undefined} requests={[row(command)]} />);
    expect(screen.getByText("ls -la")).toBeInTheDocument();
    expect(screen.getByText("Escalates sandbox")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Allow/ })).not.toBeInTheDocument();
  });
});

describe("decisionFields", () => {
  it("returns undefined for a plain decision and only the fields that were set otherwise", () => {
    expect(decisionFields({})).toBeUndefined();
    expect(decisionFields({ interrupt: false })).toBeUndefined();
    expect(decisionFields({ scope: "turn", content: { a: 1 } })).toEqual({ scope: "turn", content: { a: 1 } });
  });
});
