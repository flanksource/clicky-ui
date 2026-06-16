import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CacheBrowser } from "./CacheBrowser";
import { makeCacheFetcher } from "./cache-browser.fixtures";

function Showcase() {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-[560px] rounded-md border border-border">
        <CacheBrowser baseUrl="/api/v1" fetcher={makeCacheFetcher()} />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof CacheBrowser> = {
  title: "Data/CacheBrowser/CacheBrowser",
  component: CacheBrowser,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Generic cache/valkey browser: a lazy prefix tree with server-side search on the left, and on the right the whole-keyspace stats overview (nothing selected), an aggregated subtree overview (prefix selected), or full key detail (key selected). Requires a react-query `QueryClientProvider`. This story injects a synthetic in-memory `fetcher` — no backend.",
      },
    },
  },
  render: () => <Showcase />,
};

export default meta;
type Story = StoryObj<typeof CacheBrowser>;

export const Default: Story = {};
