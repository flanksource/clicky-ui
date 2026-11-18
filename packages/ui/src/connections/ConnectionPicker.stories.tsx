import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import type { FieldOption, JsonSchemaObject, LookupFetcher } from "../components/json-schema-form-types";
import { Icon } from "../data/Icon";
import { UiHardDrive, UiNetwork } from "../icons";
import { connectionSchemaFixture } from "../test/connections.test-utils";
import { ConnectionPicker } from "./ConnectionPicker";

const API_BASE = "/api/v1";
const disk = <Icon icon={UiHardDrive} />;

/** The rows a connection lookup returns: type icon, endpoint description, trait badges and the type as the group. */
const FLEET: FieldOption[] = [
  { value: "connection://pg/main", label: "main", group: "Postgres", icon: disk, description: "db.internal:5432 · app", badges: [{ label: "svc", icon: <Icon icon={UiNetwork} />, tone: "teal" }] },
  { value: "connection://cache/sessions", label: "sessions", group: "Redis", icon: disk, description: "valkey.cache.svc:6379", badges: [{ label: "svc", icon: <Icon icon={UiNetwork} />, tone: "teal" }] },
  { value: "connection://pg/warehouse", label: "warehouse", group: "Postgres", icon: disk, description: "warehouse.analytics:5432 · orders", badges: [{ label: "proxy", tone: "violet" }] },
  { value: "connection://ledger", label: "ledger", group: "SQL Server", icon: disk, description: "ledger.finance:1433", badges: [{ label: "via main", tone: "indigo" }] },
];

function Controlled({ options, ...props }: { options: FieldOption[] } & Partial<Parameters<typeof ConnectionPicker>[0]>) {
  const [value, setValue] = useState("");
  return (
    <div className="max-w-md space-y-2">
      <ConnectionPicker options={options} value={value} onChange={setValue} {...props} />
      <p className="text-xs text-muted-foreground">{value ? <code>{value}</code> : "Nothing selected."}</p>
    </div>
  );
}

const meta = {
  title: "Connections/ConnectionPicker",
  component: Controlled,
  args: { options: FLEET },
  parameters: {
    docs: {
      description: {
        component:
          "Picks one connection from the options a lookup returned, by its `connection://` ref. Icon, endpoint and badges arrive on each option; the picker holds no connection model. An untyped picker lists rows under a type header, a typed one (`types` with one entry) pins that type's icon and lists only matching rows. The \"New … connection…\" footer appears only when `onCreate` is given.",
      },
    },
  },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UntypedGroupedByType: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole("combobox"));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText("SQL Server")).toBeInTheDocument();
    await expect(body.queryByRole("button", { name: /New .*connection/ })).toBeNull();
  },
};

export const TypedWithCreateFooter: Story = {
  args: {
    options: FLEET.filter((option) => option.group === "Postgres"),
    types: ["postgres"],
    onCreate: () => {},
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole("combobox"));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("button", { name: "New Postgres connection…" })).toBeInTheDocument();
  },
};

/** The commons-db connections service, in memory: the schema and a create that echoes the draft back. */
const fakeConnectionsApi: typeof fetch = async (input, init) => {
  const method = (init?.method ?? "GET").toUpperCase();
  const url = String(input);
  const json = (body: unknown, type = "application/json") =>
    new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": type } });
  if (method === "GET" && url === `${API_BASE}/connection`) return json(connectionSchemaFixture, "application/schema+json");
  if (method === "GET" && url.startsWith(`${API_BASE}/connections/contexts`)) return json({ currentContext: "kind-dev", contexts: ["kind-dev"] });
  if (method === "GET" && url.startsWith(`${API_BASE}/connections/namespaces`)) return json(["analytics", "default"]);
  if (method === "GET" && url.startsWith(`${API_BASE}/connections/secrets`)) return json([{ name: "db-credentials", keys: ["username", "password"] }]);
  if (method === "POST" && url === `${API_BASE}/connection`) return json({ id: "new-1", ...JSON.parse(String(init?.body)) });
  return new Response(`no fake route for ${method} ${url}`, { status: 404 });
};

const withFakeConnectionsApi: Decorator = (Story) => {
  const original = useRef<typeof globalThis.fetch | undefined>(undefined);
  if (globalThis.fetch !== fakeConnectionsApi) {
    original.current = globalThis.fetch;
    globalThis.fetch = fakeConnectionsApi;
  }
  useEffect(
    () => () => {
      if (original.current) globalThis.fetch = original.current;
    },
    [],
  );
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

const formSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    db: {
      type: "string",
      title: "Database",
      format: "connection",
      "x-connection-types": ["postgres"],
      "x-clicky-lookup": { url: "/api/v1/lookup/t0/db", filter: "connection" },
    },
  },
};

const formLookup: LookupFetcher = async () => FLEET.filter((option) => option.group === "Postgres");

function FormField({ connectionApiBase }: { connectionApiBase?: string }) {
  const [value, setValue] = useState<Record<string, unknown>>({});
  return (
    <div className="max-w-xl space-y-2">
      <JsonSchemaForm
        schema={formSchema}
        value={value}
        onChange={setValue}
        lookupFetcher={formLookup}
        showPreferencesMenu={false}
        {...(connectionApiBase ? { connectionApiBase } : {})}
      />
      <p className="text-xs text-muted-foreground">{typeof value.db === "string" ? <code>{value.db}</code> : "Nothing selected."}</p>
    </div>
  );
}

/**
 * A `format: "connection"` field in JsonSchemaForm. Given a `connectionApiBase`
 * the picker's footer opens the create dialog; saving POSTs to the service and
 * selects the created `connection://` ref.
 */
export const InAFormWithInlineCreate: Story = {
  decorators: [withFakeConnectionsApi],
  render: () => <FormField connectionApiBase={API_BASE} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole("combobox"));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("button", { name: "New Postgres connection…" }));
    await expect(await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: /New Postgres connection/ })).toBeInTheDocument();
  },
};

export const InAFormWithoutCreate: Story = {
  render: () => <FormField />,
};
