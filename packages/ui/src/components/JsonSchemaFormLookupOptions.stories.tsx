import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Icon } from "../data/Icon";
import { UiHardDrive, UiNetwork } from "../icons";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { FieldOption, JsonSchemaObject, LookupFetcher } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    table: {
      type: "string",
      title: "Table",
      description: "Options come from a query: the server sends each row's icon, description, tone and badges.",
      "x-clicky-lookup": { url: "/api/v1/lookup/t0/table", filter: "query" },
    },
  },
};

const OPTIONS: FieldOption[] = [
  {
    value: "orders",
    label: "orders",
    description: "public.orders · 1.2M rows",
    icon: <Icon icon={UiHardDrive} />,
    tone: "violet",
    badges: [{ label: "partitioned", tone: "violet" }, { label: "svc", icon: <Icon icon={UiNetwork} />, tone: "teal" }],
  },
  { value: "customers", label: "customers", description: "public.customers", icon: <Icon icon={UiHardDrive} />, tone: "sky" },
  { value: "audit_log", label: "audit_log", badges: [{ label: "append-only", tone: "amber" }] },
];

const lookupFetcher: LookupFetcher = async ({ query }) =>
  OPTIONS.filter((option) => `${option.label} ${option.description ?? ""}`.includes(query));

function Field() {
  const [value, setValue] = useState<Record<string, unknown>>({});
  return (
    <div className="max-w-xl">
      <JsonSchemaForm schema={schema} value={value} onChange={setValue} lookupFetcher={lookupFetcher} showPreferencesMenu={false} />
    </div>
  );
}

const meta = {
  title: "Components/JsonSchemaForm/Lookup options",
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          "An `x-clicky-lookup` field draws each option the server returned with its leading icon (tinted by `tone`), a one-line searchable description and right-aligned badges. A bare option is just its label.",
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The option menu with icons, descriptions and badges; opened by the play function. */
export const IconsDescriptionsAndBadges: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("combobox"));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText("partitioned")).toBeInTheDocument();
    await expect(body.getByText("public.orders · 1.2M rows")).toBeInTheDocument();
  },
};
