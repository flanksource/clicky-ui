import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { ApprovalRequest } from "./approval-request";
import { SessionApprovalsPanel } from "./SessionInspector.approvals";
import { SessionViewer, type SessionPendingTool } from "./SessionViewer";

// Requests below are shaped like the ones captain builds for each approval kind
// (docs/plans/unified-approval-callback-examples.md): mined from Claude
// transcripts, Codex approval requests and captain_turn_requests, except
// permissions, network-restricted commands and elicitation, which are derived
// from the Codex app-server schema because no history contains them.

function pending(request: ApprovalRequest): SessionPendingTool {
  return {
    tool: request.tool,
    ...(request.toolUseId ? { toolCallId: request.toolUseId } : {}),
    approvalId: `approval-${request.kind}`,
    kind: request.kind,
    request,
    ...(request.input ? { input: request.input } : {}),
  };
}

const CLAUDE_BASH_ESCAPE: ApprovalRequest = {
  tool: "Bash",
  input: { command: "gavel pr status 85 2>&1 | tail -60", dangerouslyDisableSandbox: true },
  toolUseId: "toolu_01Bash",
  kind: "command",
  escalates: true,
  interruptible: true,
  supportedScopes: ["request"],
  command: { command: "gavel pr status 85 2>&1 | tail -60", unsandboxed: true },
};

const CODEX_REBASE: ApprovalRequest = {
  tool: "exec_command",
  toolUseId: "appr_rebase",
  kind: "command",
  reason: "May I continue the active rebase, which must update Git metadata in the parent repository's .git directory outside this worktree?",
  escalates: true,
  interruptible: true,
  supportedScopes: ["request", "session"],
  command: {
    command: "GIT_EDITOR=true git rebase --continue",
    cwd: "/repo/.shell/worktrees/gavel-pr-110-fix",
    proposedPolicy: ["git", "rebase"],
  },
};

const CODEX_PATCH: ApprovalRequest = {
  tool: "apply_patch",
  toolUseId: "item_patch",
  kind: "filesystem",
  escalates: true,
  interruptible: true,
  supportedScopes: ["request", "session"],
  filesystem: {
    operation: "patch",
    paths: ["/repo/facet/src/components/ListTable.tsx"],
    changes: [{ path: "/repo/facet/src/components/ListTable.tsx", kind: "delete" }],
  },
};

const CLAUDE_EDIT: ApprovalRequest = {
  tool: "Edit",
  toolUseId: "toolu_01Edit",
  kind: "filesystem",
  interruptible: true,
  supportedScopes: ["request"],
  filesystem: { operation: "edit", paths: ["/repo/pkg/api/permission_capabilities.go"] },
};

const CODEX_NETWORK: ApprovalRequest = {
  tool: "exec_command",
  toolUseId: "appr_network",
  kind: "network",
  escalates: true,
  interruptible: true,
  supportedScopes: ["request", "session"],
  network: {
    host: "api.github.com",
    protocol: "https",
    command: "./.bin/gavel serve flanksource/gavel --addr 127.0.0.1 --port 9092 --status",
  },
};

const CODEX_PERMISSIONS: ApprovalRequest = {
  tool: "request_permissions",
  toolUseId: "item_permissions",
  kind: "permissions",
  reason: "Rebase must update Git metadata in the parent repository's .git directory",
  escalates: true,
  interruptible: false,
  supportedScopes: ["turn", "session"],
  permissions: {
    filesystem: { writableRoots: ["/repo/gavel/.git"] },
    network: { access: "unrestricted" },
  },
};

const CODEX_QUESTION: ApprovalRequest = {
  tool: "AskUserQuestion",
  toolUseId: "item_question",
  kind: "question",
  interruptible: false,
  questions: [
    {
      id: "data_model",
      context: "Data Model",
      text: "How should the new rate-table model relate to the existing `forex_rates` table?",
      options: ["Generic Plus Bridge (Recommended)", "Replace Forex", "Forex Separate"],
      optionDescriptions: { "Replace Forex": "Migrate forex rows into the generic table and drop forex_rates." },
    },
    { id: "rate_inputs", context: "Rate Inputs", text: "What should be the primary v1 source for generated rate tables?" },
  ],
};

const MCP_FORM: ApprovalRequest = {
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
      properties: {
        repo: { type: "string", title: "Repository", enum: ["flanksource/captain", "flanksource/gavel"] },
        labels: { type: "string", title: "Labels" },
      },
      required: ["repo"],
    },
  },
};

const MCP_URL: ApprovalRequest = {
  tool: "Elicitation",
  toolUseId: "elicit:2",
  kind: "elicitation",
  interruptible: true,
  elicitation: {
    server: "linear",
    mode: "url",
    message: "Authorize access to your workspace",
    url: "https://linear.example/oauth/authorize?state=el_1",
    elicitationId: "el_1",
  },
};

const CONNECTOR_TOOL: ApprovalRequest = {
  tool: "mcp__playwright__browser_tabs",
  input: { action: "close", index: 0 },
  toolUseId: "toolu_tabs",
  kind: "tool",
  interruptible: true,
};

const PLAN_EXIT: ApprovalRequest = {
  tool: "ExitPlanMode",
  toolUseId: "toolu_plan",
  kind: "plan",
  interruptible: true,
  supportedScopes: ["request"],
  input: {
    plan: "## Phase 1: plan approvals\n\n- Add `ApprovalKindPlan` with the plan as its payload\n- Map Claude's `ExitPlanMode` and the cmux plan dialog\n\n## Phase 2: consumers\n\n- Render the plan and offer **Approve plan** / **Keep planning**",
    planFilePath: "/repo/.claude/plans/unified-approval-callback.md",
  },
  plan: {
    content:
      "## Phase 1: plan approvals\n\n- Add `ApprovalKindPlan` with the plan as its payload\n- Map Claude's `ExitPlanMode` and the cmux plan dialog\n\n## Phase 2: consumers\n\n- Render the plan and offer **Approve plan** / **Keep planning**",
    path: "/repo/.claude/plans/unified-approval-callback.md",
  },
};

const meta = {
  title: "AI/SessionViewer/Approvals",
  component: SessionViewer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Pending approvals rendered by kind. A `SessionPendingTool` with a typed `request` shows what is being asked for (command, paths, host, grants, form) and only the actions that request allows: Cancel when `interruptible`, a scope choice for each entry of `supportedScopes`, per-entry subset selection for permission grants, and a JSON-schema form for form-mode elicitation. A pending tool with no `kind`/`request` renders as before.",
      },
    },
  },
  argTypes: { session: { table: { disable: true } } },
  args: { session: [], showHeader: false, onPendingToolDecision: fn() },
  render: (args) => (
    <div className="max-w-2xl">
      <SessionViewer {...args} />
    </div>
  ),
} satisfies Meta<typeof SessionViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UntypedTool: Story = {
  args: { pendingTools: [{ tool: "Bash", toolCallId: "toolu_old", input: { command: "npm test" } }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Allow" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText("Approval scope")).not.toBeInTheDocument();
  },
};

export const ToolWithCancel: Story = {
  args: { pendingTools: [pending(CONNECTOR_TOOL)] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onPendingToolDecision).toHaveBeenCalledWith(
      expect.objectContaining({ allow: false, interrupt: true }),
    );
  },
};

export const CommandSandboxEscape: Story = {
  args: { pendingTools: [pending(CLAUDE_BASH_ESCAPE)] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Unsandboxed")).toBeInTheDocument();
    await expect(canvas.getByText("Escalates sandbox")).toBeInTheDocument();
    await expect(canvas.queryByLabelText("Approval scope")).not.toBeInTheDocument();
  },
};

export const CommandWithSessionScope: Story = {
  args: { pendingTools: [pending(CODEX_REBASE)] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("Approval scope"), "session");
    await userEvent.click(canvas.getByRole("button", { name: "Allow" }));
    await expect(args.onPendingToolDecision).toHaveBeenCalledWith(
      expect.objectContaining({ allow: true, scope: "session" }),
    );
  },
};

export const FilesystemPatch: Story = {
  args: { pendingTools: [pending(CODEX_PATCH)] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("patch")).toBeInTheDocument();
    await expect(canvas.getByText("delete")).toBeInTheDocument();
  },
};

export const FilesystemEdit: Story = {
  args: { pendingTools: [pending(CLAUDE_EDIT)] },
};

export const NetworkAccess: Story = {
  args: { pendingTools: [pending(CODEX_NETWORK)] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("api.github.com")).toBeInTheDocument();
  },
};

export const PermissionsSubset: Story = {
  args: { pendingTools: [pending(CODEX_PERMISSIONS)] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("Network access: unrestricted"));
    await userEvent.selectOptions(canvas.getByLabelText("Approval scope"), "turn");
    await userEvent.click(canvas.getByRole("button", { name: "Allow selected" }));
    await expect(args.onPendingToolDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        allow: true,
        scope: "turn",
        grants: { filesystem: { writableRoots: ["/repo/gavel/.git"] } },
      }),
    );
  },
};

export const Question: Story = {
  args: { pendingTools: [pending(CODEX_QUESTION)] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Send answer" })).toBeDisabled();
    await expect(canvas.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
  },
};

export const ElicitationForm: Story = {
  args: { pendingTools: [pending(MCP_FORM)] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Submit" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Decline" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  },
};

export const ElicitationUrl: Story = {
  args: { pendingTools: [pending(MCP_URL)] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "https://linear.example/oauth/authorize?state=el_1");
    await userEvent.click(canvas.getByRole("button", { name: "Done" }));
    await expect(args.onPendingToolDecision).toHaveBeenCalledWith(expect.objectContaining({ allow: true }));
  },
};

/** ExitPlanMode outside a plan-only run: the plan, then Approve plan, Keep
 *  planning, or Send feedback (a deny whose message the agent plans against). */
export const PlanApproval: Story = {
  args: { pendingTools: [pending(PLAN_EXIT)] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Plan feedback" }), "Split phase 2");
    await userEvent.click(canvas.getByRole("button", { name: /Send feedback/ }));
    await expect(args.onPendingToolDecision).toHaveBeenCalledWith(
      expect.objectContaining({ allow: false, message: "Split phase 2" }),
    );
  },
};

/** The Inspector's Approvals tab draws the same per-kind controls from
 *  `session.requests[].request`, and resolves through `onResolve`. */
export const InspectorApprovalsTab: Story = {
  render: () => (
    <div className="max-w-2xl">
      <SessionApprovalsPanel
        approvals={undefined}
        onResolve={fn()}
        requests={[
          { id: "a1", kind: "tool_approval", state: "pending", tool: "request_permissions", request: CODEX_PERMISSIONS },
          { id: "a2", kind: "tool_approval", state: "pending", tool: "Elicitation", request: MCP_FORM },
        ]}
      />
    </div>
  ),
};
