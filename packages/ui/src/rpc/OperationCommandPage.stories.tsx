import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OperationCommandPage } from "./OperationCommandPage";
import { FAKE_CLIENT, anchorLink } from "./rpc-story.fixtures";

function Showcase(args: ComponentProps<typeof OperationCommandPage>) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-3xl rounded-md border border-border p-4">
        <OperationCommandPage {...args} />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof OperationCommandPage> = {
  title: "Clicky-RPC/OperationCommandPage",
  component: OperationCommandPage,
  parameters: {
    docs: {
      description: {
        component:
          "A single operation as a command page: the parameter form (`CommandForm`) over the operation's parameters, plus the rendered `CommandOutput` after running. Resolves the operation from the client by `operationId`. Requires a react-query `QueryClientProvider`; this story supplies one and a synthetic client.",
      },
    },
  },
  render: (args) => <Showcase {...args} />,
};

export default meta;
type Story = StoryObj<typeof OperationCommandPage>;

export const CreateWidget: Story = {
  args: {
    client: FAKE_CLIENT,
    operationId: "widget_create",
    renderLink: anchorLink,
    backHref: "/widgets",
    backLabel: "Back to widgets",
  },
};

export const ListWidgets: Story = {
  args: {
    client: FAKE_CLIENT,
    operationId: "widget_list",
    renderLink: anchorLink,
  },
};
