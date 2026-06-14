import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Timeline, type TimelineItem } from "./Timeline";
import { Badge } from "./Badge";
import {
  UiCheck,
  UiClose,
  UiComment,
  UiGitPr,
  UiWarningTriangle,
} from "../icons";

const meta = {
  title: "Data/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Vertical activity feed (the Gavel PR `TimelineCard`): tone-colored icon discs joined by a rail, an actor/action/time line, and an optional threaded body bubble.",
      },
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS: TimelineItem[] = [
  { id: 1, icon: UiGitPr, tone: "neutral", actor: "adityathebe", action: "opened this pull request", timestamp: "3d ago" },
  { id: 2, icon: UiCheck, tone: "success", actor: "moshloop", action: "approved these changes", timestamp: "1d ago" },
  {
    id: 3,
    icon: UiComment,
    tone: "info",
    actor: "yashmehrotra",
    action: "commented on internal/sse/reconnect.go:42",
    timestamp: "1d ago",
    bodyHeader: (
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-primary">internal/sse/reconnect.go:42</span>
        <Badge tone="warning" size="xs">
          Unresolved
        </Badge>
      </div>
    ),
    body: "Debounce the SSE reconnect — on flaky networks this hammers the controller.",
  },
  { id: 4, icon: UiWarningTriangle, tone: "warning", actor: "flankbot", action: "detected merge conflicts with main", timestamp: "5d ago" },
  { id: 5, icon: UiClose, tone: "danger", actor: "flankbot", action: 'check "e2e" failed — reconnect timeout', timestamp: "1d ago" },
];

export const Default: Story = {
  args: { items: ITEMS },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Timeline {...args} />
    </div>
  ),
};

export const RendersAllEvents: Story = {
  args: { items: ITEMS },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Timeline {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("every event row is rendered", async () => {
      const rows = canvasElement.querySelectorAll("li");
      await expect(rows.length).toBe(ITEMS.length);
    });
    await step("threaded comment body is shown", async () => {
      await expect(
        canvas.getByText(/Debounce the SSE reconnect/),
      ).toBeInTheDocument();
    });
  },
};
