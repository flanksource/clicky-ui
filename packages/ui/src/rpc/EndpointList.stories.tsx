import type { Meta, StoryObj } from "@storybook/react-vite";
import { EndpointList } from "./EndpointList";
import { SAMPLE_OPERATIONS, WIDGET_DEFINITION, anchorLink } from "./rpc-story.fixtures";

const meta = {
  title: "Clicky-RPC/EndpointList",
  component: EndpointList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Lists a domain's operations as method-badged rows linking to each command page. Router-agnostic: pass `renderLink` (a react-router `Link`, a plain `<a>`, …) and optionally `getCommandHref`. Shows the definition's empty state when there are no operations.",
      },
    },
  },
  argTypes: { operations: { control: false }, renderLink: { control: false }, definition: { control: false } },
  args: {
    operations: SAMPLE_OPERATIONS,
    definition: WIDGET_DEFINITION,
    renderLink: anchorLink,
  },
} satisfies Meta<typeof EndpointList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <EndpointList {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: { operations: [] },
  render: (args) => (
    <div className="max-w-2xl">
      <EndpointList {...args} />
    </div>
  ),
};
