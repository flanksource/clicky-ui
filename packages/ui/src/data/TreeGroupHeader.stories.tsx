import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TreeGroupHeader } from "./TreeGroupHeader";

const meta: Meta<typeof TreeGroupHeader> = {
  title: "Data/TreeGroupHeader",
  component: TreeGroupHeader,
};

export default meta;
type Story = StoryObj<typeof TreeGroupHeader>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="border border-border rounded-md">
        <TreeGroupHeader
          icon="codicon:symbol-class"
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
