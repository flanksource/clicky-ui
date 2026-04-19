import type { Meta, StoryObj } from "@storybook/react-vite";
import { SplitPane } from "./SplitPane";

const meta: Meta<typeof SplitPane> = {
  title: "Layout/SplitPane",
  component: SplitPane,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof SplitPane>;

const Panel = ({ label, tone }: { label: string; tone: string }) => (
  <div className={`h-[400px] p-density-4 ${tone}`}>
    <p className="text-sm font-medium">{label}</p>
    <p className="mt-2 text-xs text-muted-foreground">Drag the divider to resize.</p>
  </div>
);

export const Default: Story = {
  render: () => (
    <div className="h-[500px]">
      <SplitPane
        left={<Panel label="Left panel" tone="bg-muted" />}
        right={<Panel label="Right panel" tone="bg-background" />}
      />
    </div>
  ),
};

export const CustomSplit: Story = {
  render: () => (
    <div className="h-[500px]">
      <SplitPane
        defaultSplit={30}
        minLeft={15}
        minRight={25}
        left={<Panel label="30% left" tone="bg-muted" />}
        right={<Panel label="70% right" tone="bg-background" />}
      />
    </div>
  ),
};
