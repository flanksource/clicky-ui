import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { StatStrip } from "./StatStrip";
import { UiClock, UiWarningTriangle } from "../icons";

const meta = {
  title: "Data/StatStrip",
  component: StatStrip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A row of headline figures for the top of a list or detail page. Purely presentational — the caller supplies already-formatted values. Cell separators come from a 1px grid gap over the container background, so they stay correct however the grid wraps; below `md` the strip falls back to two columns.",
      },
    },
  },
  args: {
    items: [
      { label: "Open requests", value: "7", sub: "Awaiting a decision" },
      { label: "Ready", value: "5", sub: "All pre-flight checks clear", tone: "success" },
      { label: "Held", value: "2", sub: "Blocked or needs review", tone: "warning" },
      { label: "Value awaiting", value: "2,412,905", sub: "ZAR · excludes chart changes" },
    ],
  },
} satisfies Meta<typeof StatStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcons: Story = {
  args: {
    items: [
      { label: "Oldest request", value: "9d", sub: "za-itr14-tax-position", icon: UiClock, tone: "danger" },
      { label: "Blocked", value: "1", sub: "Missing tax rate", icon: UiWarningTriangle, tone: "warning" },
    ],
  },
};

export const Actionable: Story = {
  args: {
    items: [
      { label: "Open requests", value: "7", sub: "Awaiting a decision", href: "#open" },
      { label: "Rejected", value: "1", sub: "Last 30 days", href: "#rejected" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: /Open requests/ })).toHaveAttribute(
      "href",
      "#open",
    );
  },
};
