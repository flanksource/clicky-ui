import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CacheTree } from "./CacheTree";
import { createCacheRegistry } from "./adapter";
import { makeCacheClient } from "./cache-browser.fixtures";
import type { CacheTreeNode } from "./types";

function Showcase() {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  const client = useMemo(() => makeCacheClient(), []);
  const registry = useMemo(() => createCacheRegistry([]), []);
  const [selected, setSelected] = useState<CacheTreeNode | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-[460px] w-80 overflow-auto rounded-md border border-border">
        <CacheTree client={client} registry={registry} selected={selected} onSelect={setSelected} />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof CacheTree> = {
  title: "Data/CacheBrowser/CacheTree",
  component: CacheTree,
  parameters: {
    docs: {
      description: {
        component:
          "Lazy key tree over the cache `tree` endpoint: prefix groups expand on demand, and a server-side substring search swaps the tree for a flat result list while active. Reads from a `CacheClient` via react-query; this story injects a synthetic client. Expand `user:` / `session:` to load their keys.",
      },
    },
  },
  render: () => <Showcase />,
};

export default meta;
type Story = StoryObj<typeof CacheTree>;

export const Default: Story = {};
