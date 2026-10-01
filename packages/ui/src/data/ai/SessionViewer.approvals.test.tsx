import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionViewer, type SessionPendingTool } from "./SessionViewer";
import type { ApprovalRequest } from "./approval-request";

function renderPending(pending: SessionPendingTool) {
  const onDecision = vi.fn();
  render(
    <SessionViewer
      showHeader={false}
      session={[]}
      pendingTools={[pending]}
      onPendingToolDecision={onDecision}
    />,
  );
  return onDecision;
}

function lastDecision(onDecision: ReturnType<typeof vi.fn>): Record<string, unknown> {
  const decision = onDecision.mock.lastCall?.[0];
  expect(decision).toBeDefined();
  const { event: _event, ...fields } = decision as Record<string, unknown>;
  return fields;
}

function typed(request: ApprovalRequest, extra: Partial<SessionPendingTool> = {}): SessionPendingTool {
  return {
    tool: request.tool,
    toolCallId: request.toolUseId ?? "call-1",
    approvalId: "approval-1",
    kind: request.kind,
    request,
    ...(request.input ? { input: request.input } : {}),
    ...extra,
  };
}

const COMMAND: ApprovalRequest = {
  tool: "exec_command",
  toolUseId: "appr_1",
  kind: "command",
  reason: "May I continue the active rebase in the parent .git directory?",
  escalates: true,
  interruptible: true,
  supportedScopes: ["request", "session"],
  command: {
    command: "GIT_EDITOR=true git rebase --continue",
    cwd: "/repo/.shell/worktrees/gavel-pr-110",
    proposedPolicy: ["git", "rebase"],
  },
};

describe("old-shape pending tools (phase 4 compatibility)", () => {
  it("renders an untyped pending Bash tool as Allow / Reject with no typed controls", async () => {
    const onDecision = renderPending({ tool: "Bash", input: { command: "npm test" } });

    expect(screen.getByRole("button", { name: /Allow/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Reject$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reject with comment/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Cancel/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Approval scope")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Allow/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: true });
  });

  it("keeps the {allow, message} rejection decision of an untyped tool", async () => {
    const onDecision = renderPending({ tool: "Bash", input: { command: "npm test" } });
    fireEvent.change(screen.getByLabelText("Decision comment"), { target: { value: "use pnpm" } });
    fireEvent.click(screen.getByRole("button", { name: /Reject with comment/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: false, message: "use pnpm" });
  });

  it("keeps the {allow, answers} decision of an untyped question", async () => {
    const onDecision = renderPending({
      tool: "AskUserQuestion",
      toolCallId: "ask-1",
      input: { questions: [{ id: "scope", question: "Which scope?", options: [{ label: "Project", value: "project" }] }] },
    });
    fireEvent.click(screen.getByRole("radio", { name: /Project/ }));
    fireEvent.click(screen.getByRole("button", { name: /Send answer/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: true, answers: { scope: "project" } });
    expect(screen.queryByRole("button", { name: /Cancel/ })).not.toBeInTheDocument();
  });

  it("treats a typed request with kind tool like an untyped tool when it offers nothing extra", async () => {
    const onDecision = renderPending(
      typed({ tool: "Monitor", kind: "tool", toolUseId: "toolu_1", input: { command: "sleep 1" } }),
    );
    expect(screen.queryByRole("button", { name: /Cancel/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Approval scope")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Allow/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: true });
  });
});

describe("tool kind", () => {
  it("offers Cancel only when the request is interruptible, as deny plus interrupt", async () => {
    const onDecision = renderPending(
      typed({ tool: "mcp__playwright__browser_tabs", kind: "tool", toolUseId: "t1", interruptible: true, input: { action: "close" } }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Cancel/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: false, interrupt: true });
  });
});

describe("command kind", () => {
  it("shows the command, cwd and reason and flags an escalation", () => {
    renderPending(typed(COMMAND));
    expect(screen.getByText("GIT_EDITOR=true git rebase --continue")).toBeInTheDocument();
    expect(screen.getByText("/repo/.shell/worktrees/gavel-pr-110")).toBeInTheDocument();
    expect(screen.getByText(/May I continue the active rebase/)).toBeInTheDocument();
    expect(screen.getByText("Escalates sandbox")).toBeInTheDocument();
    expect(screen.getByText(/git rebase/, { selector: "[data-approval-proposed-policy]" })).toBeInTheDocument();
  });

  it("flags an unsandboxed command and a stdin write", () => {
    renderPending(
      typed({
        ...COMMAND,
        command: { unsandboxed: true, stdin: { terminal: "17473", chars: "n\n" } },
      }),
    );
    expect(screen.getByText("Unsandboxed")).toBeInTheDocument();
    expect(screen.getByText(/17473/)).toBeInTheDocument();
  });

  it("does not flag an escalation the request does not carry", () => {
    renderPending(typed({ ...COMMAND, escalates: false }));
    expect(screen.queryByText("Escalates sandbox")).not.toBeInTheDocument();
  });

  it("approves with no scope by default", async () => {
    const onDecision = renderPending(typed(COMMAND));
    fireEvent.click(screen.getByRole("button", { name: /Allow/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: true });
  });

  it("offers only the scopes the request supports and sends the chosen one", async () => {
    const onDecision = renderPending(typed(COMMAND));
    const select = screen.getByLabelText("Approval scope");
    const options = within(select).getAllByRole("option").map((option) => option.textContent);
    expect(options).toEqual(["This request", "This session"]);
    fireEvent.change(select, { target: { value: "session" } });
    fireEvent.click(screen.getByRole("button", { name: /Allow/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: true, scope: "session" });
  });

  it("sends Cancel as deny plus interrupt with the rejection comment", async () => {
    const onDecision = renderPending(typed(COMMAND));
    fireEvent.change(screen.getByLabelText("Decision comment"), { target: { value: "no network from this run" } });
    fireEvent.click(screen.getByRole("button", { name: /Cancel/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: false, interrupt: true, message: "no network from this run" });
  });

  it("hides Cancel and the scope choice when the request offers neither", () => {
    renderPending(typed({ ...COMMAND, interruptible: false, supportedScopes: ["request"] }));
    expect(screen.queryByRole("button", { name: /Cancel/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Approval scope")).not.toBeInTheDocument();
  });

  it("sends a plain deny without interrupt", async () => {
    const onDecision = renderPending(typed(COMMAND));
    fireEvent.click(screen.getByRole("button", { name: /^Reject$/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: false });
  });
});

describe("filesystem kind", () => {
  const FILESYSTEM: ApprovalRequest = {
    tool: "apply_patch",
    toolUseId: "item_1",
    kind: "filesystem",
    escalates: true,
    interruptible: true,
    supportedScopes: ["request", "session"],
    filesystem: {
      operation: "patch",
      paths: ["/repo/facet/src/ListTable.tsx"],
      changes: [{ path: "/repo/facet/src/ListTable.tsx", kind: "delete" }],
    },
  };

  it("shows the operation, paths and per-file change kinds", () => {
    renderPending(typed(FILESYSTEM));
    expect(screen.getByText("patch")).toBeInTheDocument();
    expect(screen.getAllByText("/repo/facet/src/ListTable.tsx").length).toBeGreaterThan(0);
    expect(screen.getByText("delete")).toBeInTheDocument();
    expect(screen.getByText("Escalates sandbox")).toBeInTheDocument();
  });

  it("approves for the session", async () => {
    const onDecision = renderPending(typed(FILESYSTEM));
    fireEvent.change(screen.getByLabelText("Approval scope"), { target: { value: "session" } });
    fireEvent.click(screen.getByRole("button", { name: /Allow/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: true, scope: "session" });
  });
});

describe("network kind", () => {
  it("shows host and protocol, and the command that needs the access", () => {
    renderPending(
      typed({
        tool: "exec_command",
        toolUseId: "appr_2",
        kind: "network",
        interruptible: true,
        supportedScopes: ["request", "session"],
        network: { host: "api.github.com", protocol: "https", command: "gavel serve --status" },
      }),
    );
    expect(screen.getByText("api.github.com")).toBeInTheDocument();
    expect(screen.getByText("https")).toBeInTheDocument();
    expect(screen.getByText("gavel serve --status")).toBeInTheDocument();
  });
});

describe("permissions kind", () => {
  const PERMISSIONS: ApprovalRequest = {
    tool: "request_permissions",
    toolUseId: "item_2",
    kind: "permissions",
    reason: "Rebase must update Git metadata",
    escalates: true,
    interruptible: false,
    supportedScopes: ["turn", "session"],
    permissions: {
      filesystem: { writableRoots: ["/repo/gavel/.git"], readableRoots: ["/repo/shared"] },
      network: { access: "unrestricted", allowedDomains: ["api.github.com"] },
    },
  };

  it("lists each requested grant as a selected entry", () => {
    renderPending(typed(PERMISSIONS));
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes.map((box) => (box as HTMLInputElement).checked)).toEqual([true, true, true, true]);
    expect(screen.getByLabelText("Write /repo/gavel/.git")).toBeInTheDocument();
    expect(screen.getByLabelText("Read /repo/shared")).toBeInTheDocument();
    expect(screen.getByLabelText("Network access: unrestricted")).toBeInTheDocument();
    expect(screen.getByLabelText("Network domain api.github.com")).toBeInTheDocument();
  });

  it("grants everything requested when nothing is unticked", async () => {
    const onDecision = renderPending(typed(PERMISSIONS));
    fireEvent.click(screen.getByRole("button", { name: /Allow/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({
      allow: true,
      grants: {
        filesystem: { writableRoots: ["/repo/gavel/.git"], readableRoots: ["/repo/shared"] },
        network: { access: "unrestricted", allowedDomains: ["api.github.com"] },
      },
    });
  });

  it("sends only the ticked subset, with the chosen scope", async () => {
    const onDecision = renderPending(typed(PERMISSIONS));
    fireEvent.click(screen.getByLabelText("Network access: unrestricted"));
    fireEvent.click(screen.getByLabelText("Network domain api.github.com"));
    fireEvent.click(screen.getByLabelText("Read /repo/shared"));
    fireEvent.change(screen.getByLabelText("Approval scope"), { target: { value: "turn" } });
    fireEvent.click(screen.getByRole("button", { name: /Allow/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({
      allow: true,
      scope: "turn",
      grants: { filesystem: { writableRoots: ["/repo/gavel/.git"] } },
    });
  });

  it("cannot approve with every entry unticked", () => {
    renderPending(typed(PERMISSIONS));
    for (const box of screen.getAllByRole("checkbox")) fireEvent.click(box);
    expect(screen.getByRole("button", { name: /Allow/ })).toBeDisabled();
  });

  it("offers no Cancel when the request is not interruptible", () => {
    renderPending(typed(PERMISSIONS));
    expect(screen.queryByRole("button", { name: /Cancel/ })).not.toBeInTheDocument();
  });

  it("denies without grants", async () => {
    const onDecision = renderPending(typed(PERMISSIONS));
    fireEvent.click(screen.getByRole("button", { name: /^Reject$/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: false });
  });
});

describe("question kind", () => {
  const QUESTION: ApprovalRequest = {
    tool: "AskUserQuestion",
    toolUseId: "item_3",
    kind: "question",
    interruptible: true,
    questions: [
      { id: "data_model", text: "How should the model relate?", options: ["Generic Plus Bridge", "Replace Forex"], optionDescriptions: { "Replace Forex": "Drop the old table" } },
      { text: "Anything else?" },
    ],
  };

  it("renders the typed questions and answers them keyed by id, or by text when there is no id", async () => {
    const onDecision = renderPending(typed(QUESTION));
    expect(screen.getAllByText("Drop the old table").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("radio", { name: /Replace Forex/ }));
    fireEvent.change(screen.getByLabelText("Anything else? answer"), { target: { value: "no" } });
    fireEvent.click(screen.getByRole("button", { name: /Send answer/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({
      allow: true,
      answers: { data_model: "Replace Forex", "Anything else?": "no" },
    });
  });

  it("offers Cancel on an interruptible question", async () => {
    const onDecision = renderPending(typed(QUESTION));
    fireEvent.click(screen.getByRole("button", { name: /Cancel/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: false, interrupt: true });
  });
});

describe("elicitation kind", () => {
  const FORM: ApprovalRequest = {
    tool: "Elicitation",
    toolUseId: "elicit:1",
    kind: "elicitation",
    interruptible: true,
    elicitation: {
      server: "github",
      mode: "form",
      message: "Which repository should the issue be filed in?",
      schema: {
        type: "object",
        properties: { repo: { type: "string", title: "Repository" }, labels: { type: "string", title: "Labels" } },
        required: ["repo"],
      },
    },
  };

  it("renders the server, message and a JSON-schema form", () => {
    renderPending(typed(FORM));
    expect(screen.getByText("github")).toBeInTheDocument();
    expect(screen.getByText("Which repository should the issue be filed in?")).toBeInTheDocument();
    expect(screen.getByLabelText(/Repository/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Labels/)).toBeInTheDocument();
  });

  it("submits the entered content, and holds Submit until required fields are filled", async () => {
    const onDecision = renderPending(typed(FORM));
    expect(screen.getByRole("button", { name: /Submit/ })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Repository/), { target: { value: "flanksource/captain" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: true, content: { repo: "flanksource/captain" } });
  });

  it("declines without content and cancels with interrupt", async () => {
    const onDecision = renderPending(typed(FORM));
    fireEvent.click(screen.getByRole("button", { name: /Decline/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: false });
    fireEvent.click(screen.getByRole("button", { name: /Cancel/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(2));
    expect(lastDecision(onDecision)).toEqual({ allow: false, interrupt: true });
  });

  const URL_MODE: ApprovalRequest = {
    tool: "Elicitation",
    toolUseId: "elicit:2",
    kind: "elicitation",
    interruptible: true,
    elicitation: {
      server: "linear",
      mode: "url",
      message: "Authorize access to your workspace",
      url: "https://linear.example/oauth/authorize?state=1",
      elicitationId: "el_1",
    },
  };

  it("links to the url and answers Done (allow), Decline (deny) and Cancel (deny + interrupt) with no content", async () => {
    const onDecision = renderPending(typed(URL_MODE));
    const link = screen.getByRole("link", { name: /linear\.example/ });
    expect(link).toHaveAttribute("href", "https://linear.example/oauth/authorize?state=1");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Done/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1));
    expect(lastDecision(onDecision)).toEqual({ allow: true });

    fireEvent.click(screen.getByRole("button", { name: /Decline/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(2));
    expect(lastDecision(onDecision)).toEqual({ allow: false });

    fireEvent.click(screen.getByRole("button", { name: /Cancel/ }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(3));
    expect(lastDecision(onDecision)).toEqual({ allow: false, interrupt: true });
  });

  it("does not link a url that is not http(s)", () => {
    renderPending(
      typed({
        ...URL_MODE,
        elicitation: { ...URL_MODE.elicitation!, url: "javascript:alert(1)" },
      }),
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/javascript:alert\(1\)/)).toBeInTheDocument();
  });
});

describe("plan kind", () => {
  const PLAN: ApprovalRequest = {
    tool: "ExitPlanMode",
    toolUseId: "toolu_plan",
    kind: "plan",
    interruptible: true,
    supportedScopes: ["request"],
    input: { plan: "## Phase 1\n\n- Add the plan kind", planFilePath: "/repo/.claude/plans/unified.md" },
    plan: { content: "## Phase 1\n\n- Add the plan kind", path: "/repo/.claude/plans/unified.md" },
  };

  it("renders the plan as markdown with its file", async () => {
    renderPending(typed(PLAN));
    expect(await screen.findByRole("heading", { name: "Phase 1" })).toBeInTheDocument();
    expect(screen.getByText("Add the plan kind")).toBeInTheDocument();
    expect(screen.getByText("/repo/.claude/plans/unified.md")).toBeInTheDocument();
  });

  it("approves the plan as written", async () => {
    const onDecision = renderPending(typed(PLAN));
    fireEvent.click(screen.getByRole("button", { name: /Approve plan/ }));
    await waitFor(() => expect(lastDecision(onDecision)).toEqual({ allow: true }));
  });

  it("keeps planning with the feedback as the message", async () => {
    const onDecision = renderPending(typed(PLAN));
    fireEvent.change(screen.getByRole("textbox", { name: "Plan feedback" }), { target: { value: "Split phase 2" } });
    fireEvent.click(screen.getByRole("button", { name: /Send feedback/ }));
    await waitFor(() => expect(lastDecision(onDecision)).toEqual({ allow: false, message: "Split phase 2" }));
  });

  it("keeps planning without feedback, and cancels with interrupt", async () => {
    const onDecision = renderPending(typed(PLAN));
    fireEvent.click(screen.getByRole("button", { name: /Keep planning/ }));
    await waitFor(() => expect(lastDecision(onDecision)).toEqual({ allow: false }));
    fireEvent.click(screen.getByRole("button", { name: /Cancel/ }));
    await waitFor(() => expect(lastDecision(onDecision)).toEqual({ allow: false, interrupt: true }));
  });

  it("reports a plan request that carries no plan", () => {
    const { plan: _plan, ...withoutPlan } = PLAN;
    renderPending(typed(withoutPlan));
    expect(screen.getByRole("alert")).toHaveTextContent("missing its plan payload");
    expect(screen.queryByRole("button", { name: /Approve plan/ })).not.toBeInTheDocument();
  });
});

describe("errors on typed approvals", () => {
  it("keeps a rejected typed decision on the row", async () => {
    const onDecision = vi.fn().mockRejectedValue(new Error("scope session is not offered"));
    render(
      <SessionViewer showHeader={false} session={[]} pendingTools={[typed(COMMAND)]} onPendingToolDecision={onDecision} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Allow/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("scope session is not offered");
  });
});
