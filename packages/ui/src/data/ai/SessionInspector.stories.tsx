import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SessionInspector } from "./SessionInspector";
import type { SessionCollectionInput } from "./SessionInspector.collection";
import { INSPECTOR_SESSION, SAMPLE_SESSION } from "./SessionViewer.fixtures";
import {
  CLAUDE_COMPLETE_SESSION,
  CLAUDE_SESSION_EXAMPLE,
  CODEX_COMPLETE_SESSION,
  CODEX_SESSION_EXAMPLE,
} from "./examples/sessions";

const meta = {
  title: "AI/SessionInspector",
  component: SessionInspector,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Inspects one or more AI coding-agent sessions across a selectable hierarchy, transcript, changed files, plan, approvals, costs, metadata, and raw payload. Unified captain sessions populate every panel; legacy transcript arrays remain available in the Transcript tab.",
      },
    },
  },
  argTypes: {
    defaultTab: {
      control: "select",
      options: [
        "transcript",
        "files",
        "plan",
        "approvals",
        "costs",
        "metadata",
        "raw",
      ],
    },
    session: { table: { disable: true } },
    transcriptProps: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  render: (args) => (
    <div className="h-screen min-h-[640px]">
      <SessionInspector {...args} />
    </div>
  ),
} satisfies Meta<typeof SessionInspector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { session: INSPECTOR_SESSION },
};

export const RecentCodex: Story = {
  args: { session: CODEX_SESSION_EXAMPLE },
};

export const RecentClaude: Story = {
  args: { session: CLAUDE_SESSION_EXAMPLE },
};

// Complete, un-anonymized coverage transcripts — every turn / tool / state /
// part / event type in one session per provider.
export const CompleteClaude: Story = {
  args: { session: CLAUDE_COMPLETE_SESSION },
};

export const CompleteCodex: Story = {
  args: { session: CODEX_COMPLETE_SESSION },
};

export const Plan: Story = {
  args: { session: INSPECTOR_SESSION, defaultTab: "plan" },
};

export const Costs: Story = {
  args: { session: INSPECTOR_SESSION, defaultTab: "costs" },
};

export const Completed: Story = {
  args: {
    session: {
      ...INSPECTOR_SESSION,
      live: { ...INSPECTOR_SESSION.live!, active: false, status: "completed" },
    },
  },
};

export const Mobile: Story = {
  args: { session: INSPECTOR_SESSION },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};

export const LegacyTranscript: Story = {
  args: { session: SAMPLE_SESSION },
};

const PARALLEL_SESSION = {
  ...INSPECTOR_SESSION,
  id: "session-parallel",
  provider: "openai",
  model: "gpt-5",
  reasoningEffort: "medium",
  messages: INSPECTOR_SESSION.messages
    ?.map((message) => ({
      ...message,
      id: `parallel-${message.id}`,
      provenance: {
        ...message.provenance,
        sessionId: "session-parallel",
      },
    }))
    .concat({
      id: "parallel-only-message",
      role: "assistant",
      parts: [{ type: "text", text: "Parallel model response" }],
      provenance: {
        sessionId: "session-parallel",
        timestamp: "2026-07-15T12:00:00Z",
      },
    }),
};

const SESSION_COLLECTION: SessionCollectionInput = {
  kind: "session-collection",
  id: "parallel-comparison",
  currentSessionId: INSPECTOR_SESSION.id,
  sessions: [
    {
      id: INSPECTOR_SESSION.id,
      label: "Claude primary",
      mode: "plan",
      summary: {
        provider: "anthropic",
        backend: "claude-agent",
        model: "claude-sonnet-5",
        effort: "high",
        mode: "plan",
        status: "planning",
        pid: 4242,
        durationMs: 90_000,
        updatedAt: "2026-07-16T06:35:00Z",
      },
      session: INSPECTOR_SESSION,
    },
    {
      id: PARALLEL_SESSION.id,
      label: "GPT parallel",
      mode: "api",
      summary: {
        provider: "openai",
        backend: "responses",
        model: "gpt-5",
        effort: "medium",
        mode: "api",
        status: "completed",
        durationMs: 63_000,
        updatedAt: "2026-07-16T06:34:00Z",
      },
      session: PARALLEL_SESSION,
    },
  ],
};

export const MultiSession: Story = {
  args: { session: SESSION_COLLECTION },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await step("starts with only the current session selected", async () => {
      const toolbar = canvas.getByRole("toolbar", {
        name: "Session content controls",
      });
      await expect(toolbar).toHaveClass("justify-start");
      await expect(
        within(toolbar).getByRole("button", {
          name: "Select session content: 1 of 2 sessions",
        }),
      ).toBeInTheDocument();
      await expect(
        canvas.queryByRole("tab", { name: "Turns" }),
      ).not.toBeInTheDocument();
      await expect(
        canvas.queryByRole("tab", { name: "Agents" }),
      ).not.toBeInTheDocument();
      await expect(
        canvas.queryByText("Parallel model response"),
      ).not.toBeInTheDocument();
    });

    await step(
      "composes a parallel session into transcript and costs",
      async () => {
        await userEvent.click(
          canvas.getByRole("button", {
            name: "Select session content: 1 of 2 sessions",
          }),
        );
        await expect(page.getByText("planning")).toBeInTheDocument();
        await expect(page.getByText("pid 4242")).toBeInTheDocument();
        await expect(page.getByText("1.5 min")).toBeInTheDocument();
        await expect(
          page.getByRole("img", { name: "Plan mode" }),
        ).toBeInTheDocument();
        for (const effort of page.getAllByRole("img", {
          name: "High effort",
        })) {
          await expect(effort).toHaveClass("text-orange-600");
        }
        await userEvent.click(
          page.getByRole("checkbox", { name: "Include GPT parallel" }),
        );
        await expect(
          canvas.getByText("Parallel model response"),
        ).toBeInTheDocument();
        await userEvent.click(canvas.getByRole("tab", { name: "Costs $0.06" }));
        await expect(canvas.getAllByText("$0.06").length).toBeGreaterThan(0);
        await expect(
          within(
            canvas.getByRole("toolbar", { name: "Session content controls" }),
          ).getByRole("button", {
            name: "Select session content: 2 of 2 sessions",
          }),
        ).toBeInTheDocument();
      },
    );
  },
};

export const AllTabs: Story = {
  args: { session: INSPECTOR_SESSION },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await step("shows the transcript", async () => {
      await expect(canvas.getByText("done")).toBeInTheDocument();
      await expect(canvas.getAllByTitle("Turn turn-1")).toHaveLength(2);
    });

    await step("shows turn and agent hierarchy with file details", async () => {
      await userEvent.click(
        canvas.getByRole("button", {
          name: "Select session content: 1 of 1 session",
        }),
      );
      await expect(page.getByText("Review parity")).toBeInTheDocument();

      await userEvent.click(canvas.getByRole("tab", { name: "Files 2" }));
      await expect(
        canvas.getByRole("treeitem", { name: "pkg/session/session.go" }),
      ).toBeInTheDocument();
      await expect(
        canvas.getByRole("treeitem", {
          name: "pkg/cli/webapp/src/SessionBrowser.tsx",
        }),
      ).toBeInTheDocument();
    });

    await step("shows plan, approval, and cost details", async () => {
      await userEvent.click(canvas.getByRole("tab", { name: "Plan" }));
      await expect(
        canvas.getByText("Implement parity panels"),
      ).toBeInTheDocument();

      await userEvent.click(canvas.getByRole("tab", { name: "Approvals 3" }));
      await expect(canvas.getByText("Needs manual review")).toBeInTheDocument();

      await userEvent.click(canvas.getByRole("tab", { name: "Costs $0.03" }));
      await expect(canvas.getAllByText("$0.03").length).toBeGreaterThan(0);
    });

    await step("shows metadata and the raw payload", async () => {
      await userEvent.click(canvas.getByRole("tab", { name: "Metadata" }));
      await expect(
        canvas.getByText("/repo/.claude/session.jsonl"),
      ).toBeInTheDocument();
      await expect(canvas.getAllByText("anthropic").length).toBeGreaterThan(0);

      await userEvent.click(canvas.getByRole("tab", { name: "Raw" }));
      await expect(canvasElement.textContent).toContain('"session-parity"');
    });
  },
};
