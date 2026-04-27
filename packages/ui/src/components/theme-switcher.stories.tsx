import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "./button";

const meta = {
  title: "Theming/ThemeSwitcher",
  component: ThemeSwitcher,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Icon-button picker that toggles between light, dark, and system themes. Writes `data-theme` on `<html>` and persists to `localStorage`. Pair with `ThemeProvider` at the app root.",
      },
    },
  },
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPreview: Story = {
  render: () => (
    <div className="flex flex-col gap-density-4">
      <ThemeSwitcher />
      <div className="rounded-lg border border-border bg-card p-density-4 text-card-foreground">
        <h3 className="text-lg font-semibold">Preview card</h3>
        <p className="mt-density-2 text-sm text-muted-foreground">
          This card uses `bg-card`, `text-card-foreground`, and `border-border` — swap the theme
          above to see it respond.
        </p>
        <div className="mt-density-3 flex flex-wrap gap-density-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>
    </div>
  ),
};

export const ChangesDataAttribute: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("open menu and pick dark", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /theme/i }));
      await userEvent.click(canvas.getByRole("menuitemradio", { name: /dark/i }));
      await expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    await step("open menu and pick light", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /theme/i }));
      await userEvent.click(canvas.getByRole("menuitemradio", { name: /light/i }));
      await expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
  },
};

export const KeyboardSelection: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /theme/i });

    await step("open with Enter, navigate with arrows, select with Enter", async () => {
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{Enter}");
      const value = document.documentElement.getAttribute("data-theme");
      await expect(["light", "dark"]).toContain(value);
    });
  },
};
