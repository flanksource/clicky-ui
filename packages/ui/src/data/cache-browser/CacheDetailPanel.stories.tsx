import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CacheDetailPanel } from "./CacheDetailPanel";
import { createCacheRegistry } from "./adapter";
import { makeCacheClient, leafNode, rootGroupNode } from "./cache-browser.fixtures";
import type { CacheTreeNode } from "./types";

function Showcase({ node }: { node: CacheTreeNode }) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  const client = useMemo(() => makeCacheClient(), []);
  const registry = useMemo(() => createCacheRegistry([]), []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-[460px] w-[560px] overflow-auto rounded-md border border-border">
        <CacheDetailPanel client={client} registry={registry} node={node} />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof CacheDetailPanel> = {
  title: "Data/CacheBrowser/CacheDetailPanel",
  component: CacheDetailPanel,
  parameters: {
    docs: {
      description: {
        component:
          "Right-hand pane of the cache browser: full key detail (metadata + adapter- or type-aware `CacheValue` rendering) for a leaf key, or an aggregated subtree overview for a prefix group, with delete/refresh actions. Reads from a `CacheClient` via react-query; this story injects a synthetic client.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CacheDetailPanel>;

/** A leaf key — shows metadata + the type-aware value body. */
export const LeafKey: Story = {
  render: () => <Showcase node={leafNode} />,
};

/** A prefix group — shows the aggregated subtree overview. */
export const PrefixGroup: Story = {
  render: () => <Showcase node={rootGroupNode} />,
};
