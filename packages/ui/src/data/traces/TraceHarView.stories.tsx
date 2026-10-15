import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { httpExchangeRows } from "./fixtures";
import { TraceHarView } from "./TraceHarView";

const meta: Meta<typeof TraceHarView> = {
  title: "Data/Traces/TraceHarView",
  component: TraceHarView,
  parameters: {
    docs: {
      description: {
        component:
          "`http` / `http_proxy` trace records rendered by the shared HarPanel. JSON bodies the store parsed into structure are shown as JSON, a transport error renders as ERR, and a tunnelled CONNECT shows the bytes that crossed it where a body would be.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TraceHarView>;

export const Exchanges: Story = {
  render: () => (
    <div className="h-[480px] rounded-md border border-border">
      <TraceHarView rows={httpExchangeRows} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("registry.example.com:443")).toBeInTheDocument();
    await expect(canvas.getByText("ERR")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  render: () => <TraceHarView rows={[]} />,
};
