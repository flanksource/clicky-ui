import type { Meta, StoryObj } from "@storybook/react-vite";
import { DropdownMenu } from "./DropdownMenu";
import { Button } from "../components/button";
import { UiDownload, UiJson, UiMarkdown, UiMenu } from "../icons";

const meta: Meta<typeof DropdownMenu> = {
  title: "Overlay/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    docs: {
      description: {
        component:
          "Click-triggered dropdown menu. Closes on outside click or Escape. Provide declarative `items` or a `children` render-prop for custom content; the trigger defaults to a Button but accepts any node via `trigger`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Items: Story = {
  args: {
    label: "Download",
    icon: UiDownload,
    items: [
      { label: "JSON", icon: UiJson, onSelect: () => {} },
      { label: "Markdown", icon: UiMarkdown, onSelect: () => {} },
    ],
  },
};

export const AlignLeft: Story = {
  args: {
    label: "Actions",
    align: "left",
    items: [
      { label: "Rename", onSelect: () => {} },
      { label: "Duplicate", onSelect: () => {} },
      { label: "Delete", onSelect: () => {}, disabled: true },
    ],
  },
};

export const CustomTrigger: Story = {
  args: {
    trigger: (
      <Button variant="ghost" size="icon" aria-label="Open menu">
        <UiMenu />
      </Button>
    ),
    items: [
      { label: "Profile", onSelect: () => {} },
      { label: "Settings", onSelect: () => {} },
    ],
  },
};

export const CustomContent: Story = {
  args: {
    label: "Filters",
    children: (closeMenu) => (
      <div className="px-3 py-2 text-xs">
        <p className="mb-2 text-muted-foreground">Custom content goes here.</p>
        <Button size="sm" onClick={closeMenu}>
          Apply
        </Button>
      </div>
    ),
  },
};
