import type { Meta, StoryObj } from "@storybook/react-vite";
import { CacheValue } from "./CacheValue";
import { sampleKeyDetail, sampleZsetDetail } from "./cache-browser.fixtures";

const meta = {
  title: "Data/CacheBrowser/CacheValue",
  component: CacheValue,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Type-aware renderer for one cache key's value (`CacheKeyDetail`): a string body, a hash field table, a list, a set, or a scored zset. The default body used by `CacheDetailPanel` when no domain adapter claims the key.",
      },
    },
  },
  argTypes: { detail: { control: false } },
  args: { detail: sampleKeyDetail },
} satisfies Meta<typeof CacheValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hash: Story = {
  render: (args) => (
    <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
  ),
};

export const ScoredSet: Story = {
  args: { detail: sampleZsetDetail },
  render: (args) => (
    <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
  ),
};

export const StringValue: Story = {
  args: {
    detail: {
      key: "session:ab12",
      type: "string",
      ttlSeconds: 900,
      length: 45,
      value: '{"uid":1001,"csrf":"a1b2c3","exp":1750000000}',
    },
  },
  render: (args) => (
    <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
  ),
};
