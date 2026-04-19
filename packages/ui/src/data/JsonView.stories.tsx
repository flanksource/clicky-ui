import type { Meta, StoryObj } from "@storybook/react-vite";
import { JsonView } from "./JsonView";

const meta: Meta<typeof JsonView> = {
  title: "Data/JsonView",
  component: JsonView,
};

export default meta;
type Story = StoryObj<typeof JsonView>;

export const MixedTypes: Story = {
  args: {
    name: "config",
    data: {
      name: "scraper",
      enabled: true,
      retries: 3,
      tags: ["alpha", "beta"],
      owner: null,
      metadata: {
        created: "2026-01-01",
        stats: { runs: 42, failures: 2 },
      },
    },
  },
};

export const DeepNested: Story = {
  args: {
    data: {
      a: { b: { c: { d: { e: "deep" } } } },
    },
    defaultOpenDepth: 3,
  },
};

export const EmptyContainers: Story = {
  args: { data: { obj: {}, arr: [] } },
};
