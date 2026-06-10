import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
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

export const Interaction: Story = {
  args: {
    label: "Actions",
    items: [
      { label: "Edit", onSelect: fn() },
      { label: "Duplicate", onSelect: fn() },
      { label: "Delete", onSelect: fn() },
    ],
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("opens the menu in a portal above the canvas", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
      const menu = await body.findByRole("menu");
      await expect(canvasElement.contains(menu)).toBe(false);
      await expect(document.body.contains(menu)).toBe(true);
    });

    await step("selecting an item fires its handler and closes", async () => {
      await userEvent.click(body.getByRole("menuitem", { name: "Edit" }));
      await expect(args.items?.[0]?.onSelect).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
    });
  },
};

// Pin the trigger to each viewport corner and assert the opened menu stays
// within the viewport — proof flip (vertical) + shift (horizontal) keep it
// on-screen. These run in a real browser via the Storybook test runner.
function makeEdgeStory(position: string): Story {
  return {
    args: {
      label: "Actions",
      items: [
        { label: "Edit", onSelect: fn() },
        { label: "Duplicate", onSelect: fn() },
        { label: "Delete", onSelect: fn() },
      ],
    },
    decorators: [
      (Story) => (
        <div className="fixed inset-0">
          <div className={`absolute ${position}`}>
            <Story />
          </div>
        </div>
      ),
    ],
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const body = within(document.body);
      await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
      const menu = await body.findByRole("menu");
      const rect = menu.getBoundingClientRect();
      const margin = 1; // sub-pixel tolerance
      await expect(rect.left).toBeGreaterThanOrEqual(-margin);
      await expect(rect.top).toBeGreaterThanOrEqual(-margin);
      await expect(rect.right).toBeLessThanOrEqual(window.innerWidth + margin);
      await expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight + margin);
    },
  };
}

export const EdgeTopLeft = makeEdgeStory("top-1 left-1");
export const EdgeTopRight = makeEdgeStory("top-1 right-1");
export const EdgeBottomLeft = makeEdgeStory("bottom-1 left-1");
export const EdgeBottomRight = makeEdgeStory("bottom-1 right-1");
