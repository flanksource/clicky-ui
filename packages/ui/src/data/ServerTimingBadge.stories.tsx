import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ServerTimingBadge } from "./ServerTimingBadge";
import type { ServerTimingMetric } from "./server-timing";

const metrics: ServerTimingMetric[] = [
  { name: "total", duration: 120.5, counters: {} },
  { name: "command", duration: 95.2, counters: {} },
  { name: "format", duration: 4.1, counters: {} },
  {
    name: "sql",
    duration: 18.6,
    description: "queries=2 rows_returned=501",
    counters: { queries: 2, rows_returned: 501 },
  },
  {
    name: "redis",
    duration: 1.2,
    description: "ops=3 hits=2 misses=1 errors=0",
    counters: { ops: 3, hits: 2, misses: 1, errors: 0 },
  },
];

const meta = {
  title: "Data/ServerTimingBadge",
  component: ServerTimingBadge,
  tags: ["autodocs"],
  args: { metrics },
  parameters: {
    docs: {
      description: {
        component:
          "Compact Server-Timing badge with a hover and focus breakdown of request phases and diagnostic counters.",
      },
    },
  },
} satisfies Meta<typeof ServerTimingBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Show server timing",
    });
    await userEvent.hover(trigger);
    await expect(
      within(document.body).getByText(/501 rows returned/),
    ).toBeVisible();
  },
};

export const NoBackendActivity: Story = {
  args: {
    metrics: [
      { name: "total", duration: 8.2, counters: {} },
      {
        name: "sql",
        duration: 0,
        description: "queries=0 rows_returned=0",
        counters: { queries: 0, rows_returned: 0 },
      },
      {
        name: "redis",
        duration: 0,
        description: "ops=0 hits=0 misses=0 errors=0",
        counters: { ops: 0, hits: 0, misses: 0, errors: 0 },
      },
    ],
  },
};

/** A client-side load reported in the same shape: `title` renames the card, and phases are work summed over requests. */
export const PageLoad: Story = {
  args: {
    title: "Page load",
    metrics: [
      { name: "total", duration: 963, counters: {} },
      { name: "fetch", duration: 412.6, counters: { requests: 5 } },
      { name: "integrity", duration: 3.1, counters: { files: 5 } },
      { name: "compile", duration: 295.4, counters: { modules: 4 } },
      { name: "rewrite", duration: 61.8, counters: { modules: 9 } },
      { name: "tailwind", duration: 48.2, counters: { builds: 1 } },
    ],
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Show page load" });
    await userEvent.hover(trigger);
    await expect(within(document.body).getByText("4 modules")).toBeVisible();
  },
};

/** `footer` adds content under the breakdown, such as a link to the full build log. */
export const WithFooter: Story = {
  args: {
    title: "Page load",
    metrics: [
      { name: "total", duration: 963, counters: {} },
      { name: "compile", duration: 295.4, counters: { modules: 4 } },
    ],
    footer: <button type="button" className="text-xs text-primary underline">Build log…</button>,
  },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Show page load" }));
    await expect(within(document.body).getByRole("button", { name: "Build log…" })).toBeVisible();
  },
};

export const MultiSecond: Story = {
  args: {
    metrics: [
      { name: "total", duration: 12035.3, counters: {} },
      { name: "command", duration: 12020.1, counters: {} },
      { name: "format", duration: 15.2, counters: {} },
    ],
  },
};
