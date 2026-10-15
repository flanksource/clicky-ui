import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { terminalEvents } from "./fixtures";
import { TerminalCastPlayer } from "./TerminalCastPlayer";

const DOWNLOADED_CAST = [
  '{"version":2,"width":60,"height":6,"duration":1.5,"command":"/bin/sh -c echo hi","_gavel":{"exit_code":3,"snapshots":[[1500,"hi\\nhi\\nbye"]],"final":"hi\\nhi\\nbye","truncated":true}}',
  '[0.01,"o","hi\\r\\n"]',
  '[0.75,"o","\\u001b[32mhi\\u001b[0m\\r\\n"]',
  '[1.2,"o","bye\\r\\n"]',
].join("\n");

const meta: Meta<typeof TerminalCastPlayer> = {
  title: "Data/Traces/TerminalCastPlayer",
  component: TerminalCastPlayer,
  parameters: {
    docs: {
      description: {
        component:
          "Replays a `terminal` trace: play/pause, a scrubber, 1x/2x/4x speed and jump-to-end, honouring resizes, with the exit code as a badge. The screen is settled from the raw output (carriage returns, cursor moves, erase, colour) and drawn with AnsiHtml. A downloaded asciinema v2 `.cast` renders the same through `castText`; a recorded snapshot is offered as the Settled screen view.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TerminalCastPlayer>;

export const Events: Story = {
  render: () => <TerminalCastPlayer events={terminalEvents} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("exit 0")).toBeInTheDocument();
  },
};

export const DownloadedCast: Story = {
  render: () => <TerminalCastPlayer castText={DOWNLOADED_CAST} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("exit 3")).toBeInTheDocument();
    await expect(canvas.getByText("output truncated")).toBeInTheDocument();
  },
};

export const AutoPlay: Story = {
  render: () => <TerminalCastPlayer events={terminalEvents} autoPlay />,
};

export const Empty: Story = {
  render: () => <TerminalCastPlayer events={[]} />,
};
