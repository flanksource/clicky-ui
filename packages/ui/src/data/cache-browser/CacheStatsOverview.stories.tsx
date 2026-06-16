import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CacheStatsOverview } from "./CacheStatsOverview";
import { makeCacheClient } from "./cache-browser.fixtures";

function Showcase() {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-2xl">
        <CacheStatsOverview client={makeCacheClient()} />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof CacheStatsOverview> = {
  title: "Data/CacheBrowser/CacheStatsOverview",
  component: CacheStatsOverview,
  parameters: {
    docs: {
      description: {
        component:
          "Whole-keyspace overview shown when nothing is selected in the cache browser: server stats (memory gauge, hit rate, uptime, version) plus a keys-per-prefix breakdown of the top tree level. Reads from a `CacheClient` via react-query; this story injects a synthetic client.",
      },
    },
  },
  render: () => <Showcase />,
};

export default meta;
type Story = StoryObj<typeof CacheStatsOverview>;

export const Default: Story = {};
