import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OperationEntityPage } from "./OperationEntityPage";
import { FAKE_CLIENT, WIDGET_DEFINITION, anchorLink } from "./rpc-story.fixtures";

function Showcase(args: ComponentProps<typeof OperationEntityPage>) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-[560px] overflow-auto rounded-md border border-border p-4">
        <OperationEntityPage {...args} />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof OperationEntityPage> = {
  title: "Clicky-RPC/OperationEntityPage",
  component: OperationEntityPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A domain's entity page: the list view (filters + Clicky table) for a surface, drilling into per-entity detail. Resolves list/detail operations from the client for the given `surfaceKey`/entities. Requires a react-query `QueryClientProvider`; this story supplies one and a synthetic client.",
      },
    },
  },
  render: (args) => <Showcase {...args} />,
};

export default meta;
type Story = StoryObj<typeof OperationEntityPage>;

export const Default: Story = {
  args: {
    // OperationEntityPage is an entity *detail* page — it needs the id of the
    // entity to resolve the get-by-id endpoint and load its detail.
    id: "wgt_42",
    client: FAKE_CLIENT,
    definition: WIDGET_DEFINITION,
    entities: ["widget"],
    surfaceKey: "widgets",
    renderLink: anchorLink,
    backHref: "/widgets",
    backLabel: "Back to widgets",
  },
};
