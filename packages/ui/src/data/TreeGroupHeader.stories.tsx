import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TreeGroupHeader } from "./TreeGroupHeader";
import { UiClass } from "@flanksource/icons/ui";

const meta: Meta<typeof TreeGroupHeader> = {
  title: "Data/TreeGroupHeader",
  component: TreeGroupHeader,
  args: {
    title: "Services",
    open: true,
    count: 4,
    onToggle: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Clickable grouped-tree header with chevron state, optional icon, and trailing count. Use it for collapsible buckets around Tree content.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TreeGroupHeader>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="border border-border rounded-md">
        <TreeGroupHeader
          icon={UiClass}
          title="Pod"
          count={12}
          open={open}
          onToggle={() => setOpen((o) => !o)}
        />
        {open && (
          <div className="p-density-3 text-xs text-muted-foreground">
            (children rendered here — use &lt;Tree&gt; or &lt;TreeNode&gt;)
          </div>
        )}
      </div>
    );
  },
};
