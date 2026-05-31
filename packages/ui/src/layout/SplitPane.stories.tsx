import type { Meta, StoryObj } from "@storybook/react-vite";
import { SplitPane } from "./SplitPane";

const meta: Meta<typeof SplitPane> = {
  title: "Layout/SplitPane",
  component: SplitPane,
  args: {
    left: <div className="p-4">Left pane</div>,
    right: <div className="p-4">Right pane</div>,
    defaultSplit: 50,
    minLeft: 20,
    minRight: 20,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Resizable horizontal split layout for explorer/detail views. Drag the separator to change the left pane percentage while respecting minimum pane widths.",
      },
    },
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
