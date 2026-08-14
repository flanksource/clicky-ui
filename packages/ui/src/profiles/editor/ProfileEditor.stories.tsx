import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ComponentProps } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { ResolvedOperation } from "../../rpc/types";
import type { OperationsApiClient } from "../../rpc/useOperations";
import { ProfileEditor } from "./profileEditor";
import { configureProfiles } from "../profileApi";
import { testProfileSchema } from "./testSchema";

configureProfiles({ schema: testProfileSchema });

const client: OperationsApiClient = {
  async getOpenAPISpec() {
    return {
      openapi: "3.0.0",
      info: { title: "Profile examples", version: "1.0.0" },
      paths: {},
    };
  },
  async executeCommand() {
    return { success: true, exit_code: 0 };
  },
  async submitForm() {
    return { success: true, exit_code: 0, message: "Profile saved" };
  },
};

const action: ResolvedOperation = {
  path: "/api/v1/profiles/{id}",
  method: "put",
  operation: {
    operationId: "profile_update",
    summary: "Update profile",
    responses: { "200": { description: "Updated" } },
  },
};

const initialValue = {
  profile: "service-health",
  namespace: "observability",
  render: "table",
  provider: { type: "sql", options: {} },
  query:
    "SELECT observed_at, service, status, duration_ms FROM service_health ORDER BY observed_at DESC",
  params: [
    {
      name: "service",
      label: "Service",
      type: "string",
      role: "filter",
    },
  ],
  columns: [
    {
      name: "observed_at",
      label: "Observed",
      type: "datetime",
      kind: "timestamp",
    },
    {
      name: "service",
      label: "Service",
      type: "string",
      filter: { kind: "terms", lookup: true },
    },
    {
      name: "status",
      label: "Status",
      type: "string",
      kind: "status",
    },
  ],
};

function ProfileEditorStory(props: ComponentProps<typeof ProfileEditor>) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-full min-h-0 overflow-hidden">
        <ProfileEditor {...props} />
      </div>
    </QueryClientProvider>
  );
}

const meta = {
  title: "Profiles/ProfileEditor",
  component: ProfileEditor,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The route-sized editor for a commons-db query profile. Its section rail, field grid, inspector and preview use the shared Workspace layout. Hosts inject the generated profile schema with `configureProfiles` and provide an `OperationsApiClient` for save and lookup operations; this example supplies both in memory.",
      },
    },
  },
  args: {
    client,
    action,
    surfaceKey: "profile-service-health",
    initialValue,
    onClose: () => undefined,
    onSuccess: () => undefined,
  },
  argTypes: {
    client: { table: { disable: true } },
    action: { table: { disable: true } },
    initialValue: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onSuccess: { table: { disable: true } },
  },
  render: (args) => <ProfileEditorStory {...args} />,
} satisfies Meta<typeof ProfileEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const General: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Profile identity")).toBeVisible();
    await expect(canvas.getByDisplayValue("service-health")).toBeVisible();
  },
};

export const Columns: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /^Columns Fields, labels, expressions/ }),
    );
    await expect(canvas.findByText("3 of 3 included")).resolves.toBeVisible();
    await expect(
      canvas.findByRole("textbox", { name: "Label for observed_at" }),
    ).resolves.toBeVisible();
    await userEvent.selectOptions(
      canvas.getByRole("combobox", { name: "CEL examples" }),
      "row.observed_at / 1000.0",
    );
    await expect(canvas.getByRole("textbox", { name: "CEL expression" })).toHaveValue(
      "row.observed_at / 1000.0",
    );
  },
};
