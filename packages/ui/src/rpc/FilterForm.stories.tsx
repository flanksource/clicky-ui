import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fn } from "storybook/test";
import { FilterForm } from "./FilterForm";
import { FAKE_CLIENT } from "./rpc-story.fixtures";
import type { OpenAPIParameter } from "./types";

const PARAMETERS: OpenAPIParameter[] = [
  { name: "q", in: "query", schema: { type: "string" }, description: "Search query" },
  { name: "kind", in: "query", schema: { type: "string", enum: ["big", "small"] }, description: "Widget kind" },
  { name: "limit", in: "query", schema: { type: "integer", default: 50 }, description: "Max rows" },
];

function Showcase(args: ComponentProps<typeof FilterForm>) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-md">
        <FilterForm {...args} />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof FilterForm> = {
  title: "Clicky-RPC/FilterForm",
  component: FilterForm,
  parameters: {
    docs: {
      description: {
        component:
          "Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client.",
      },
    },
  },
  render: (args) => <Showcase {...args} />,
};

export default meta;
type Story = StoryObj<typeof FilterForm>;

export const Default: Story = {
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn(),
  },
};

export const AutoSubmit: Story = {
  args: { ...Default.args, autoSubmit: true },
};
