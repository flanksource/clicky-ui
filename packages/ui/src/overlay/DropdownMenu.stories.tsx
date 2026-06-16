import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { DropdownMenu } from "./DropdownMenu";
import { Modal } from "./Modal";
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

export const OpensModal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A button inside the menu opens a Modal. Because the Modal portals to `document.body`, it renders centered over the whole viewport instead of being clipped to the dropdown's box — and the menu stays open behind it (closing the menu would otherwise unmount the Modal it renders).",
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <DropdownMenu label="Actions">
        {() => (
          <div className="px-1 py-1">
            <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
              View log
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} title="Log output" size="lg">
              <pre className="whitespace-pre-wrap text-xs">
                {[
                  "[12:00:01] starting build…",
                  "[12:00:03] compiling 248 modules",
                  "[12:00:07] bundle written to dist/",
                  "[12:00:07] done in 6.2s",
                ].join("\n")}
              </pre>
            </Modal>
          </div>
        )}
      </DropdownMenu>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("opens a Modal from a button inside the menu", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
      await body.findByRole("menu");
      await userEvent.click(body.getByRole("button", { name: "View log" }));
    });

    await step("the Modal escapes the dropdown's box", async () => {
      const menu = body.getByRole("menu");
      const dialog = await body.findByRole("dialog");
      // Portaled out of the menu's DOM subtree, and overflows the menu's box
      // rather than being clipped to it.
      await expect(menu.contains(dialog)).toBe(false);
      const menuRect = menu.getBoundingClientRect();
      const dialogRect = dialog.getBoundingClientRect();
      await expect(dialogRect.width).toBeGreaterThan(menuRect.width);
      await expect(dialogRect.right).toBeGreaterThan(menuRect.right);
    });

    await step("the menu stays open behind the Modal", async () => {
      // Closing the menu would unmount the Modal it renders, so it must persist.
      await expect(body.queryByRole("menu")).not.toBeNull();
    });
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
