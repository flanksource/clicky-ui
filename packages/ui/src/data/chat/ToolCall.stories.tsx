import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ToolCall } from "./ToolCall";
import { SAMPLE_TOOL_MESSAGES } from "./Chat.fixtures";
import { createToolRenderRegistry } from "./tool-render/registry";
import { toolNameAdapter } from "./tool-render/adapter";
import type { AnyToolPart, DynamicToolUIPart, ToolMeta } from "./types";

// The completed dynamic-tool part from the seeded assistant turn (args → result).
const COMPLETED = SAMPLE_TOOL_MESSAGES[1]?.parts[0] as AnyToolPart;

function toolPart(overrides: Record<string, unknown>): AnyToolPart {
  return { ...COMPLETED, ...overrides } as AnyToolPart;
}

const LIST_INPUT = { namespace: "default", status: "Running", limit: 20 };
const LIST_CALL_ID = "call-pods-list";
const SCALE_CALL_ID = "call-deployments-scale";
const SCALE_APPROVAL_ID = "approval-deployments-scale";
const SCALE_INPUT = {
  deployment: "api",
  namespace: "default",
  dryRun: false,
  targets: [
    { container: "api", replicas: 6 },
    { container: "worker", replicas: 2 },
  ],
};

const meta = {
  title: "Chat/ToolCall",
  component: ToolCall,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, compact input args while collapsed, and the full input → output result while expanded. Input and output are rendered by the tool render registry — heuristically by default, by a standard renderer for known coding-agent tools, or by a host adapter when one claims the call. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls.",
      },
    },
  },
  argTypes: {
    part: { control: false },
    defaultOpen: { control: "boolean" },
    onApprove: { control: false },
  },
  args: { part: COMPLETED, defaultOpen: false, onApprove: fn() },
} satisfies Meta<typeof ToolCall>;

export default meta;
type Story = StoryObj<typeof meta>;

const wrap: Story["render"] = (args) => (
  <div className="max-w-2xl">
    <ToolCall {...args} />
  </div>
);

export const Collapsed: Story = { render: wrap };

export const Expanded: Story = { args: { defaultOpen: true }, render: wrap };

/** The model is still streaming a partial input object. */
export const InputStreaming: Story = {
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "pods_list",
      toolCallId: LIST_CALL_ID,
      state: "input-streaming",
      input: { namespace: "default" },
    } satisfies DynamicToolUIPart,
  },
  parameters: {
    docs: {
      description: {
        story:
          "AI SDK `input-streaming`: the tool input is incomplete and execution has not started.",
      },
    },
  },
  render: wrap,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Pending")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("namespace");
    await expect(canvasElement.textContent).toContain("default");
  },
};

/** Input is complete and the tool is executing. */
export const InputAvailable: Story = {
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "pods_list",
      toolCallId: LIST_CALL_ID,
      state: "input-available",
      input: LIST_INPUT,
    } satisfies DynamicToolUIPart,
  },
  parameters: {
    docs: {
      description: {
        story:
          "AI SDK `input-available`: the complete input is visible while the tool runs.",
      },
    },
  },
  render: wrap,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Running")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("Running");
    await expect(canvasElement.textContent).toContain("20");
  },
};

/** A tool completed successfully with structured output. */
export const OutputAvailable: Story = {
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "pods_list",
      toolCallId: LIST_CALL_ID,
      state: "output-available",
      input: LIST_INPUT,
      output: {
        data: [
          { id: "pod-1", name: "api-7c9", restarts: 0 },
          { id: "pod-2", name: "worker-1f2", restarts: 3 },
        ],
        page: { limit: 20, offset: 0, total: 2 },
      },
    } satisfies DynamicToolUIPart,
  },
  parameters: {
    docs: {
      description: {
        story:
          "AI SDK `output-available`: the final input and structured result are rendered together.",
      },
    },
  },
  render: wrap,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Completed")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("api-7c9");
    await expect(canvasElement.textContent).toContain("worker-1f2");
  },
};

/** A tool reached a terminal error with the attempted input retained. */
export const OutputError: Story = {
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "pods_list",
      toolCallId: LIST_CALL_ID,
      state: "output-error",
      input: LIST_INPUT,
      errorText: "cluster API returned 503: service unavailable",
    } satisfies DynamicToolUIPart,
  },
  parameters: {
    docs: {
      description: {
        story:
          "AI SDK `output-error`: the attempted input stays visible beside the terminal error.",
      },
    },
  },
  render: wrap,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Error")).toBeInTheDocument();
    await expect(
      canvas.getByText("cluster API returned 503: service unavailable"),
    ).toBeInTheDocument();
  },
};

/** A clicky `PagedResult` renders as a table with a row count, not raw JSON. */
export const PagedList: Story = {
  args: {
    defaultOpen: true,
    part: toolPart({
      toolName: "pods_list",
      input: { namespace: "default", status: "Running", limit: 20 },
      output: {
        data: [
          {
            id: "pod-1",
            name: "api-7c9",
            restarts: 0,
            startedAt: "2026-01-14T09:12:00Z",
          },
          {
            id: "pod-2",
            name: "worker-1f2",
            restarts: 3,
            startedAt: "2026-01-15T11:40:00Z",
          },
          {
            id: "pod-3",
            name: "cache-8ab",
            restarts: 1,
            startedAt: "2026-01-16T08:05:00Z",
          },
        ],
        page: { limit: 20, offset: 0, total: 37 },
      },
    }),
  },
  render: wrap,
};

/** A single record renders as a heading + id chip + field list. */
export const EntityRecord: Story = {
  args: {
    defaultOpen: true,
    part: toolPart({
      toolName: "pods_get",
      input: { id: "pod-1041" },
      output: {
        id: "pod-1041",
        name: "api-7c9",
        status: "RUNNING",
        startedAt: "2026-01-31T00:00:00Z",
        containers: 6,
      },
    }),
  },
  render: wrap,
};

/** An all-numeric result renders as count tiles — the usual shape of a write. */
export const Counts: Story = {
  args: {
    defaultOpen: true,
    part: toolPart({
      toolName: "manifests_apply",
      input: { namespace: "default", cluster: "prod-1", dryRun: false },
      output: { created: 12, updated: 3, skipped: 41, errors: 0 },
    }),
  },
  render: wrap,
};

/** A pending write force-opens its input and exposes both decisions. */
export const ApprovalRequested: Story = {
  args: {
    onApprove: fn(),
    part: {
      type: "dynamic-tool",
      toolName: "deployments_scale",
      toolCallId: SCALE_CALL_ID,
      state: "approval-requested",
      approval: { id: SCALE_APPROVAL_ID },
      input: SCALE_INPUT,
    } satisfies DynamicToolUIPart,
  },
  parameters: {
    docs: {
      description: {
        story:
          "AI SDK `approval-requested`: the proposed input is force-opened before the user approves or denies it.",
      },
    },
  },
  render: wrap,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByLabelText("Awaiting approval"),
    ).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("deployment");
    await userEvent.click(canvas.getByRole("button", { name: "Approve" }));
    await userEvent.click(canvas.getByRole("button", { name: "Deny" }));
    await expect(args.onApprove).toHaveBeenNthCalledWith(
      1,
      SCALE_APPROVAL_ID,
      true,
    );
    await expect(args.onApprove).toHaveBeenNthCalledWith(
      2,
      SCALE_APPROVAL_ID,
      false,
    );
  },
};

/** The user approved the input and execution is resuming. */
export const ApprovalApproved: Story = {
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "deployments_scale",
      toolCallId: SCALE_CALL_ID,
      state: "approval-responded",
      approval: { id: SCALE_APPROVAL_ID, approved: true },
      input: SCALE_INPUT,
    } satisfies DynamicToolUIPart,
  },
  parameters: {
    docs: {
      description: {
        story:
          "AI SDK `approval-responded`: Captain has recorded approval and the tool is resuming.",
      },
    },
  },
  render: wrap,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Responded")).toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "Approve" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "Deny" }),
    ).not.toBeInTheDocument();
  },
};

/** The user denied the proposed input, terminating the call without output. */
export const ApprovalDenied: Story = {
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "deployments_scale",
      toolCallId: SCALE_CALL_ID,
      state: "output-denied",
      approval: {
        id: SCALE_APPROVAL_ID,
        approved: false,
        reason: "Scale the staging deployment first.",
      },
      input: SCALE_INPUT,
    } satisfies DynamicToolUIPart,
  },
  parameters: {
    docs: {
      description: {
        story:
          "AI SDK `output-denied`: the request and denial envelope remain visible as terminal history.",
      },
    },
  },
  render: wrap,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Denied")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("deployment");
    await expect(
      canvas.queryByRole("button", { name: "Approve" }),
    ).not.toBeInTheDocument();
  },
};

/** An approved write completed and carries both approval and output. */
export const ApprovalCompleted: Story = {
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "deployments_scale",
      toolCallId: SCALE_CALL_ID,
      state: "output-available",
      approval: { id: SCALE_APPROVAL_ID, approved: true },
      input: SCALE_INPUT,
      output: { updated: 2, replicas: 8, errors: 0 },
    } satisfies DynamicToolUIPart,
  },
  parameters: {
    docs: {
      description: {
        story:
          "AI SDK `output-available` after approval: the accepted input and terminal result stay correlated.",
      },
    },
  },
  render: wrap,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Completed")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("updated");
    await expect(canvasElement.textContent).toContain("replicas");
    await expect(
      canvas.queryByRole("button", { name: "Approve" }),
    ).not.toBeInTheDocument();
  },
};

const SCALE_TOOL: ToolMeta = {
  name: "deployments_scale",
  label: "Scale deployment",
  entity: "deployments",
  inputSchema: {
    type: "object",
    properties: {
      deployment: { type: "string", title: "Deployment" },
      namespace: { type: "string", title: "Namespace" },
      dryRun: { type: "boolean", title: "Dry run" },
      targets: { type: "array", title: "Scale targets" },
    },
  },
};

/** With a catalog entry, params are labelled from the tool's published schema. */
export const SchemaLabelledParams: Story = {
  args: { ...ApprovalRequested.args, tool: SCALE_TOOL } as Story["args"],
  render: wrap,
};

const hostRegistry = createToolRenderRegistry([
  toolNameAdapter("demo:manifests_apply", "manifests_apply", {
    renderSummary: (ctx) =>
      `applied ${String((ctx.output as { created: number }).created)}`,
    renderOutput: (ctx) => (
      <div className="rounded-md border border-emerald-600/40 bg-emerald-500/10 p-density-2 text-sm">
        Created {String((ctx.output as { created: number }).created)} resources.
      </div>
    ),
  }),
]);

/** A host adapter claims one tool; every other call keeps the built-ins. */
export const WithHostAdapter: Story = {
  args: { ...Counts.args, registry: hostRegistry } as Story["args"],
  render: wrap,
};

/** The transport double-encodes results as `{output: "<json>"}`; the renderer
 *  unwraps that before anything else sees it. */
export const TransportEnvelope: Story = {
  args: {
    defaultOpen: true,
    part: toolPart({
      toolName: "nodes_get",
      input: { id: "node-9" },
      output: {
        output: JSON.stringify({
          id: "node-9",
          name: "ip-10-0-1-9",
          status: "READY",
        }),
      },
    }),
  },
  render: wrap,
};
