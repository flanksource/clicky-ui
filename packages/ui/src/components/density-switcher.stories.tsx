import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "@storybook/test";
import { DensitySwitcher } from "./density-switcher";
import { Button } from "./button";

const meta = {
  title: "Theming/DensitySwitcher",
  component: DensitySwitcher,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Toggle control density between `compact`, `comfortable`, and `spacious`. Writes `data-density` on `<html>` and drives the `--control-height`, `--control-padding-x`, `--spacing-unit` and `--font-size-base` tokens.",
      },
    },
  },
} satisfies Meta<typeof DensitySwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPreview: Story = {
  render: () => (
    <div className="flex flex-col gap-density-4">
      <DensitySwitcher />
      <div className="flex flex-wrap items-center gap-density-2 rounded-lg border border-border p-density-3">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <span className="text-density-base text-muted-foreground">
          Body text at density-base font size
        </span>
      </div>
      <div className="grid grid-cols-3 gap-density-2 text-xs">
        <div className="rounded border border-border p-density-2">
          <div className="font-mono text-muted-foreground">--spacing-unit</div>
          <div className="mt-density-1 h-density-4 rounded bg-primary" />
        </div>
        <div className="rounded border border-border p-density-2">
          <div className="font-mono text-muted-foreground">--control-height</div>
          <div className="mt-density-1 h-control-h rounded bg-secondary" />
        </div>
        <div className="rounded border border-border p-density-2">
          <div className="font-mono text-muted-foreground">--control-padding-x</div>
          <div className="mt-density-1 inline-block rounded bg-accent px-control-px py-density-1">
            x
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ChangesDataAttribute: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("click compact sets data-density=compact", async () => {
      await userEvent.click(canvas.getByRole("radio", { name: /compact/i }));
      await expect(document.documentElement.getAttribute("data-density")).toBe("compact");
    });

    await step("click spacious sets data-density=spacious", async () => {
      await userEvent.click(canvas.getByRole("radio", { name: /spacious/i }));
      await expect(document.documentElement.getAttribute("data-density")).toBe("spacious");
    });
  },
};
