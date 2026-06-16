import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagList } from "./TagList";
import { normalizeTags } from "./tag-utils";

const TAGS = normalizeTags([
  "env=production",
  "team=payments",
  "region=us-east-1",
  "tier=critical",
  "owner=ada",
]);

const meta = {
  title: "Data/Cells/TagList",
  component: TagList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Renders normalized `key=value` tags as compact badges for table cells. By default it shows `maxVisible` inline and collapses the rest into a `+N` hover popover; `wrap` lays them out across lines instead. Hovering a badge reveals include/exclude/copy actions (wired via `TagActionsProvider`). Build the input with `normalizeTags`.",
      },
    },
  },
  argTypes: {
    maxVisible: { control: { type: "number", min: 1, max: 6 } },
    actions: { control: "inline-radio", options: ["hover", "inline"] },
    compact: { control: "boolean" },
    wrap: { control: "boolean" },
    tags: { control: false },
  },
  args: { tags: TAGS, maxVisible: 3, actions: "hover", wrap: false },
} satisfies Meta<typeof TagList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <TagList {...args} />
    </div>
  ),
};

export const Wrapped: Story = {
  args: { wrap: true },
  render: (args) => (
    <div className="w-80">
      <TagList {...args} />
    </div>
  ),
};

export const Compact: Story = {
  args: { compact: true },
  render: (args) => (
    <div className="w-80">
      <TagList {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: { tags: [] },
};
