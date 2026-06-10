import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { IconMenuPicker, type IconMenuOption } from "./icon-menu-picker";
import { UiDesktop, UiMoon, UiSun } from "../icons";

type Theme = "light" | "dark" | "system";

const THEME_OPTIONS: IconMenuOption<Theme>[] = [
  { value: "light", icon: UiSun, label: "light" },
  { value: "dark", icon: UiMoon, label: "dark" },
  { value: "system", icon: UiDesktop, label: "system" },
];

function ControlledPicker(props: {
  showLabel?: boolean;
  footer?: React.ReactNode;
  triggerClassName?: string;
}) {
  const [value, setValue] = useState<Theme>("system");
  return (
    <IconMenuPicker<Theme>
      value={value}
      onChange={setValue}
      options={THEME_OPTIONS}
      ariaLabel="Theme"
      {...props}
    />
  );
}

const meta = {
  title: "Components/IconMenuPicker",
  component: IconMenuPicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An icon-triggered radio menu used by the theme and density switchers. The menu is rendered in a portal above all other content and uses Floating UI's `flip`/`shift` so it stays fully on-screen no matter where the trigger sits.",
      },
    },
  },
} satisfies Meta<typeof IconMenuPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ControlledPicker />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-56">
      <ControlledPicker showLabel footer={<span>resolves to dark</span>} />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => <ControlledPicker />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("opens the menu in a portal, above the canvas", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Theme" }));
      const menu = await body.findByRole("menu", { name: "Theme" });
      // The menu is portaled to document.body, not nested under the trigger.
      await expect(canvasElement.contains(menu)).toBe(false);
      await expect(document.body.contains(menu)).toBe(true);
    });

    await step("selecting an option updates the trigger and closes", async () => {
      await userEvent.click(body.getByRole("menuitemradio", { name: /light/ }));
      await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
      await expect(canvas.getByRole("button", { name: "Theme" })).toHaveAttribute(
        "title",
        "Theme: light",
      );
    });
  },
};

// Pin the trigger to each viewport corner/edge and assert the opened menu stays
// fully within the viewport — proof that flip (vertical) and shift (horizontal)
// keep it on-screen. Runs in a real browser via the Storybook test runner.
const CORNERS: Record<string, string> = {
  TopLeft: "top-1 left-1",
  TopRight: "top-1 right-1",
  BottomLeft: "bottom-1 left-1",
  BottomRight: "bottom-1 right-1",
  BottomCenter: "bottom-1 left-1/2 -translate-x-1/2",
};

function makeEdgeStory(position: string): Story {
  return {
    render: () => (
      <div className="fixed inset-0">
        <div className={`absolute ${position}`}>
          <ControlledPicker />
        </div>
      </div>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const body = within(document.body);
      await userEvent.click(canvas.getByRole("button", { name: "Theme" }));
      const menu = await body.findByRole("menu", { name: "Theme" });
      const rect = menu.getBoundingClientRect();
      const margin = 1; // sub-pixel tolerance
      await expect(rect.left).toBeGreaterThanOrEqual(-margin);
      await expect(rect.top).toBeGreaterThanOrEqual(-margin);
      await expect(rect.right).toBeLessThanOrEqual(window.innerWidth + margin);
      await expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight + margin);
    },
  };
}

export const EdgeTopLeft = makeEdgeStory(CORNERS.TopLeft);
export const EdgeTopRight = makeEdgeStory(CORNERS.TopRight);
export const EdgeBottomLeft = makeEdgeStory(CORNERS.BottomLeft);
export const EdgeBottomRight = makeEdgeStory(CORNERS.BottomRight);
export const EdgeBottomCenter = makeEdgeStory(CORNERS.BottomCenter);

export const InsideScrollContainer: Story = {
  render: () => (
    <div className="h-40 w-64 overflow-hidden rounded border border-border p-3">
      <p className="mb-2 text-sm text-muted-foreground">
        The picker lives in an overflow-hidden box; the menu still escapes it.
      </p>
      <ControlledPicker />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Theme" }));
    const menu = await body.findByRole("menu", { name: "Theme" });
    // Portaled out of the clipping container, so it renders on document.body.
    await expect(document.body.contains(menu)).toBe(true);
    await expect(canvasElement.contains(menu)).toBe(false);
  },
};
