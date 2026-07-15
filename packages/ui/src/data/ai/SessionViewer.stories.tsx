import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SessionViewer } from "./SessionViewer";
import { SAMPLE_SESSION } from "./SessionViewer.fixtures";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

const meta = {
  title: "AI/SessionViewer",
  component: SessionViewer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Renders a recorded AI coding-agent session (the captain `pkg/ai/history` JSON schema — Claude Code / Codex transcripts) as a vertical action log. Each entry sits on a tone-colored disc from the Flanksource \"Agent Action Icons\" set — file reads, edits, shell runs, sub-agent tasks, skills and MCP calls each read at a glance. Tool calls expand to their input and response; assistant prose and reasoning render inline. Pass parsed `SessionEntry[]` or raw log text (JSON array or JSONL) via `session`.",
      },
    },
  },
  argTypes: {
    defaultExpanded: { control: "boolean" },
    showThinking: { control: "boolean" },
    showHeader: { control: "boolean" },
    showMenu: { control: "boolean" },
    defaultDensity: { control: "inline-radio", options: [undefined, "compact", "comfortable", "spacious"] },
    session: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  render: (args) => (
    <div className="max-w-2xl">
      <SessionViewer {...args} />
    </div>
  ),
} satisfies Meta<typeof SessionViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

const QUESTION_SESSION = {
  id: "question-session",
  source: "codex",
  provider: "codex",
  model: "gpt-5-codex",
  messages: [
    {
      id: "q-user",
      role: "user",
      parts: [{ type: "text", text: "Generate the migration and ask before touching production settings." }],
    },
    {
      id: "q-ask",
      role: "assistant",
      parts: [{
        type: "dynamic-tool",
        toolName: "AskUserQuestion",
        state: "approval-requested",
        input: {
          questions: [
            {
              id: "scope",
              header: "Scope",
              question: "Which deployment scope should this migration target?",
              options: [
                { label: "Project", description: "Only the current workspace and test database." },
                { label: "Global", description: "Every configured workspace that uses this template." },
              ],
            },
            {
              id: "checks",
              header: "Checks",
              question: "Which verification steps should run before applying it?",
              multiSelect: true,
              options: ["Typecheck", "Unit tests", "Preview SQL"],
            },
          ],
        },
        approval: { id: "approval-question-1" },
      }],
      provenance: {
        timestamp: "2026-07-09T09:00:00Z",
        cwd: "/repo",
        model: "gpt-5-codex",
        source: "codex",
      },
    },
    {
      id: "q-answer",
      role: "assistant",
      parts: [{
        type: "dynamic-tool",
        toolName: "AskUserQuestion",
        state: "output-available",
        input: {
          questions: [{
            id: "scope",
            header: "Scope",
            question: "Which deployment scope should this migration target?",
            options: [
              { label: "Project", description: "Only the current workspace and test database." },
              { label: "Global", description: "Every configured workspace that uses this template." },
            ],
          }],
        },
        output: "Scope: Project\nAdditional details: Run typecheck and preview SQL before applying.",
        approval: { id: "approval-question-1", approved: true },
      }],
      provenance: {
        timestamp: "2026-07-09T09:01:15Z",
        cwd: "/repo",
        model: "gpt-5-codex",
        source: "codex",
      },
    },
  ],
  turns: [{ id: "turn-1", index: 1, messageIds: ["q-user", "q-ask", "q-answer"] }],
  approvals: { approved: 1 },
} satisfies UnifiedSessionInput;

const APPROVAL_STATUS_SESSION = {
  id: "approval-status-session",
  source: "codex",
  provider: "codex",
  model: "gpt-5-codex",
  messages: [
    {
      id: "a-user",
      role: "user",
      parts: [{ type: "text", text: "Run the checks, but wait for approval before network or filesystem changes." }],
    },
    {
      id: "a-pending",
      role: "assistant",
      parts: [{
        type: "dynamic-tool",
        toolName: "Bash",
        state: "approval-requested",
        input: { command: "pnpm test -- --runInBand" },
        approval: { id: "approval-bash-1" },
      }],
      provenance: { timestamp: "2026-07-09T09:05:00Z", cwd: "/repo", model: "gpt-5-codex", source: "codex" },
    },
    {
      id: "a-approved",
      role: "assistant",
      parts: [{
        type: "dynamic-tool",
        toolName: "Bash",
        state: "output-available",
        input: { command: "pnpm test -- --runInBand" },
        output: "Tests: 42 passed",
        approval: { id: "approval-bash-1", approved: true },
      }],
      provenance: { timestamp: "2026-07-09T09:06:00Z", cwd: "/repo", model: "gpt-5-codex", source: "codex" },
    },
    {
      id: "a-denied",
      role: "assistant",
      parts: [{
        type: "dynamic-tool",
        toolName: "WebFetch",
        state: "approval-responded",
        input: { url: "https://prod.example.com/config" },
        approval: { id: "approval-web-1", approved: false, reason: "Use staging credentials first." },
      }],
      provenance: { timestamp: "2026-07-09T09:07:00Z", cwd: "/repo", model: "gpt-5-codex", source: "codex" },
    },
  ],
  turns: [{ id: "turn-1", index: 1, messageIds: ["a-user", "a-pending", "a-approved", "a-denied"] }],
  approvals: {
    approved: 1,
    denied: 1,
    denials: [{ toolUseId: "approval-web-1", tool: "WebFetch", reason: "Use staging credentials first." }],
  },
} satisfies UnifiedSessionInput;

export const Default: Story = {
  args: { session: SAMPLE_SESSION },
};

export const Expanded: Story = {
  args: { session: SAMPLE_SESSION, defaultExpanded: true },
};

export const WithoutReasoning: Story = {
  args: { session: SAMPLE_SESSION, showThinking: false },
};

export const CompactDensity: Story = {
  args: { session: SAMPLE_SESSION, defaultDensity: "compact" },
};

export const AskUserQuestion: Story = {
  args: {
    session: QUESTION_SESSION,
    defaultExpanded: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("renders the question text and options", async () => {
      await expect(canvas.getAllByText("Ask user")[0]).toBeInTheDocument();
      await expect(canvas.getByText("Which deployment scope should this migration target?")).toBeInTheDocument();
      await expect(canvas.getByText("Project")).toBeInTheDocument();
      await expect(canvas.getByText("Only the current workspace and test database.")).toBeInTheDocument();
      await expect(canvas.getByText("Preview SQL")).toBeInTheDocument();
    });

    await step("renders approval state and the eventual answer", async () => {
      await expect(canvas.getByText("Awaiting approval")).toBeInTheDocument();
      await expect(canvas.getByText("Approved")).toBeInTheDocument();
      await expect(canvasElement.querySelector("ol")?.textContent).toContain("Scope: Project");
      await expect(canvasElement.querySelector("ol")?.textContent).toContain("Run typecheck and preview SQL before applying.");
    });
  },
};

export const PendingQuestionControls: Story = {
  args: {
    session: [],
    showHeader: false,
    pendingTools: [{
      tool: "AskUserQuestion",
      toolCallId: "ask-pending-1",
      input: (QUESTION_SESSION.messages[1].parts[0] as { input: Record<string, unknown> }).input,
    }],
    onPendingToolDecision: async () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Send answer" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    await expect(canvas.getAllByRole("radio")).toHaveLength(2);
    await expect(canvas.getAllByRole("checkbox")).toHaveLength(3);
  },
};

export const ApprovalStatuses: Story = {
  args: {
    session: APPROVAL_STATUS_SESSION,
    defaultExpanded: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("shows pending, approved and denied tool rows", async () => {
      await expect(canvas.getByText("Awaiting approval")).toBeInTheDocument();
      await expect(canvas.getByText("Approved")).toBeInTheDocument();
      await expect(canvas.getByText("Denied: Use staging credentials first.")).toBeInTheDocument();
    });

    await step("keeps the underlying request visible", async () => {
      await expect(canvasElement.querySelector("ol")?.textContent).toContain("pnpm test -- --runInBand");
      await expect(canvas.getByText("https://prod.example.com/config")).toBeInTheDocument();
    });
  },
};

/** A self-contained dark override: paints `data-theme="dark"` on its own root
 *  (which also carries the background) regardless of the surrounding page theme. */
export const DarkThemed: Story = {
  args: {
    session: SAMPLE_SESSION,
    defaultTheme: "dark",
    className: "max-w-2xl rounded-md bg-background p-4",
  },
  render: (args) => <SessionViewer {...args} />,
};

export const MenuFiltersAndAlignment: Story = {
  args: { session: SAMPLE_SESSION },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    // The 3-dot menu portals to document.body, so query it from there.
    const menu = within(document.body);

    await step("user prompts are right-aligned", async () => {
      const userRow = canvasElement.querySelector('[data-event-kind="user"]');
      await expect(userRow).toBeTruthy();
      await expect(userRow).toHaveClass("justify-end");
    });

    await step("the 3-dot menu overrides density and theme", async () => {
      await expect(canvasElement.querySelector("[data-density]")).toBeNull();
      await userEvent.click(canvas.getByRole("button", { name: "Session options" }));
      await userEvent.click(menu.getByRole("menuitemradio", { name: "Compact" }));
      await expect(canvasElement.querySelector('[data-density="compact"]')).toBeTruthy();

      // The Read row's tone disc must actually repaint dark (not just flip the
      // data-theme attribute) — guards the `dark:`-vs-`[data-theme]` regression.
      const rows = [...canvasElement.querySelectorAll("ol > li")];
      const readDisc = rows
        .find((li) => li.textContent?.includes("Timeline.tsx"))
        ?.querySelector("span.rounded-full") as HTMLElement;
      const lightBg = getComputedStyle(readDisc).backgroundColor;

      await userEvent.click(menu.getByRole("menuitemradio", { name: "Dark" }));
      await expect(canvasElement.querySelector('[data-theme="dark"]')).toBeTruthy();
      await expect(getComputedStyle(readDisc).backgroundColor).not.toBe(lightBg);
    });

    await step("hiding the Explore category removes its rows", async () => {
      const list = canvasElement.querySelector("ol") as HTMLElement;
      await expect(within(list).getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument();
      await userEvent.click(menu.getByRole("menuitemcheckbox", { name: "Explore" }));
      await expect(
        within(list).queryByText("packages/ui/src/data/Timeline.tsx"),
      ).not.toBeInTheDocument();
      // The shell row survives; its command is shiki-highlighted (split across
      // token spans), so match on textContent rather than a single element.
      await expect(list.textContent).toContain(
        "pnpm --filter @flanksource/clicky-ui test SessionViewer",
      );
    });
  },
};

export const InteractsWithActions: Story = {
  args: { session: SAMPLE_SESSION },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("agent actions render inline without label prefixes", async () => {
      await expect(canvas.getByText("iconify: search icons")).toBeInTheDocument();
      // File rows show the cwd-relative path, shell rows the bare command.
      await expect(canvas.queryByText("Read file")).not.toBeInTheDocument();
      await expect(canvas.getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument();
      await expect(canvas.queryByText("Run command")).not.toBeInTheDocument();
      // The command is shiki-highlighted into token spans — assert on textContent.
      await expect(canvasElement.querySelector("ol")?.textContent).toContain(
        "pnpm --filter @flanksource/clicky-ui test SessionViewer",
      );
    });

    await step("expanding a shell call reveals its response", async () => {
      await expect(canvas.queryByText(/Tests: 8 passed/)).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("button", { name: "Toggle response" }));
      await expect(canvas.getByText(/Tests: 8 passed/)).toBeInTheDocument();
    });

    await step("the terminal API error is surfaced", async () => {
      await expect(canvas.getByText("rate_limit (HTTP 429)")).toBeInTheDocument();
    });
  },
};
