import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SessionViewer } from "./SessionViewer";
import { SAMPLE_SESSION } from "./SessionViewer.fixtures";

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
        .find((li) => li.textContent?.includes("Read file"))
        ?.querySelector("span.rounded-full") as HTMLElement;
      const lightBg = getComputedStyle(readDisc).backgroundColor;

      await userEvent.click(menu.getByRole("menuitemradio", { name: "Dark" }));
      await expect(canvasElement.querySelector('[data-theme="dark"]')).toBeTruthy();
      await expect(getComputedStyle(readDisc).backgroundColor).not.toBe(lightBg);
    });

    await step("hiding the Explore category removes its rows", async () => {
      const list = canvasElement.querySelector("ol") as HTMLElement;
      await expect(within(list).getByText("Read file")).toBeInTheDocument();
      await userEvent.click(menu.getByRole("menuitemcheckbox", { name: "Explore" }));
      await expect(within(list).queryByText("Read file")).not.toBeInTheDocument();
      await expect(within(list).getByText("Run command")).toBeInTheDocument();
    });
  },
};

export const InteractsWithActions: Story = {
  args: { session: SAMPLE_SESSION },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("agent actions render with their labels", async () => {
      await expect(canvas.getByText("Read file")).toBeInTheDocument();
      await expect(canvas.getByText("Run command")).toBeInTheDocument();
      await expect(canvas.getByText("iconify: search icons")).toBeInTheDocument();
    });

    await step("expanding a tool call reveals its response", async () => {
      await expect(canvas.queryByText(/Tests: 8 passed/)).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("button", { name: /Run command/ }));
      await expect(canvas.getByText(/Tests: 8 passed/)).toBeInTheDocument();
    });

    await step("the terminal API error is surfaced", async () => {
      await expect(canvas.getByText("rate_limit (HTTP 429)")).toBeInTheDocument();
    });
  },
};
