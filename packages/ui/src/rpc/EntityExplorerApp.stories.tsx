import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EntityExplorerApp } from "./EntityExplorerApp";
import { RouterProvider } from "./RouterProvider";
import { useMemoryRouter } from "./router";
import { FAKE_CLIENT } from "./rpc-story.fixtures";
import { ThemeProvider } from "../hooks/theme-provider";

function Showcase({ initialPath = "/widgets" }: { initialPath?: string }) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  // In-memory router so surface links and row-detail links navigate inside the story.
  const router = useMemoryRouter(initialPath);
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <RouterProvider adapter={router}>
          <div className="h-[640px] overflow-auto rounded-md border border-border p-4">
            <EntityExplorerApp client={FAKE_CLIENT} showApiExplorer={false} />
          </div>
        </RouterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const meta: Meta<typeof EntityExplorerApp> = {
  title: "Clicky-RPC/EntityExplorerApp",
  component: EntityExplorerApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The full metadata-driven entity explorer: a surface sidebar, a Clicky table list view and action dialogs, all derived from an `OpenAPISpec` with `x-clicky` surface metadata. Requires a react-query `QueryClientProvider` and a `RouterProvider`; this story supplies both plus a synthetic client and an in-memory router.",
      },
    },
  },
  render: () => <Showcase />,
};

export default meta;
type Story = StoryObj<typeof EntityExplorerApp>;

export const Default: Story = {};

/** Lands on the Orders surface — status text, priority badges, monospace totals,
 *  channel tag chips and a placed time-range filter; click an order # to open its
 *  detail page. */
export const Orders: Story = {
  render: () => <Showcase initialPath="/orders" />,
};

/** Lands on the Services surface in the Platform group — health status, version
 *  badges, label chips and an "unhealthy only" boolean filter. */
export const Services: Story = {
  render: () => <Showcase initialPath="/services" />,
};
