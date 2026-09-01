import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import type { JsonSchemaObject } from "../../components/json-schema-form-types";
import type { DataTableServerColumn } from "../data-table-server-filters";
import { QueryBrowser } from "./QueryBrowser";
import {
  QueryBrowserExecutionError,
  type QueryBrowserRequest,
  type QueryBrowserResult,
} from "./QueryBrowser.types";

const rows: Record<string, unknown>[] = [
  {
    observed_at: "2026-08-11T08:14:32Z",
    service: "Checkout API",
    status: "healthy",
    region: "eu-west",
    duration_ms: 84,
  },
  {
    observed_at: "2026-08-11T08:14:21Z",
    service: "Ledger Worker",
    status: "degraded",
    region: "us-east",
    duration_ms: 413,
  },
  {
    observed_at: "2026-08-11T08:13:58Z",
    service: "Identity API",
    status: "healthy",
    region: "eu-west",
    duration_ms: 126,
  },
  {
    observed_at: "2026-08-11T08:13:44Z",
    service: "Reporting API",
    status: "failed",
    region: "ap-south",
    duration_ms: 1305,
  },
  {
    observed_at: "2026-08-11T08:13:12Z",
    service: "Checkout API",
    status: "healthy",
    region: "us-east",
    duration_ms: 91,
  },
  {
    observed_at: "2026-08-11T08:12:47Z",
    service: "Ledger Worker",
    status: "healthy",
    region: "eu-west",
    duration_ms: 204,
  },
];

const columns: DataTableServerColumn[] = [
  { name: "observed_at", label: "Observed", kind: "timestamp" },
  {
    name: "service",
    label: "Service",
    filterKey: "service",
    filter: {
      kind: "terms",
      options: ["Checkout API", "Ledger Worker", "Identity API", "Reporting API"].map(
        (value) => ({ value }),
      ),
    },
  },
  {
    name: "status",
    label: "Status",
    kind: "status",
    filterKey: "status",
    filter: {
      kind: "terms",
      options: ["healthy", "degraded", "failed"].map((value) => ({ value })),
    },
  },
  { name: "region", label: "Region" },
  { name: "duration_ms", label: "Duration (ms)" },
];

const optionsSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    database: {
      type: "string",
      title: "Database",
      enum: ["operations", "analytics"],
    },
    readOnly: { type: "boolean", title: "Read only" },
  },
};

async function executeSampleQuery(
  request: QueryBrowserRequest,
): Promise<QueryBrowserResult> {
  const filtered = rows.filter((row) =>
    Object.entries(request.filters ?? {}).every(([key, encoded]) => {
      const value = String(row[key] ?? "");
      const tokens = encoded.split(",").filter(Boolean);
      const included = tokens.filter((token) => !token.startsWith("!"));
      const excluded = tokens.filter((token) => token.startsWith("!")).map((token) => token.slice(1));
      return (included.length === 0 || included.includes(value)) && !excluded.includes(value);
    }),
  );
  const limit = request.pagination?.limit ?? 4;
  const offset = request.pagination?.offset ?? 0;
  const page = filtered.slice(offset, offset + limit);

  return {
    rows: page,
    columns,
    durationMs: 18,
    pagination: {
      mode: "offset",
      limit,
      offset,
      hasMore: offset + limit < filtered.length,
      total: filtered.length,
      totalRelation: "eq",
      consistency: "snapshot",
    },
    diagnostics: {
      provider: "postgresql",
      request: {
        query: request.query,
        options: request.options,
        details: { transaction: "read-only", plan: "Index Scan" },
      },
      response: {
        durationMs: 18,
        returnedRows: page.length,
        contentType: "application/json",
        preview: JSON.stringify(page),
      },
    },
  };
}

const meta = {
  title: "Data/QueryBrowser",
  component: QueryBrowser,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required.",
      },
    },
  },
  argTypes: {
    execute: { table: { disable: true } },
    lookupFilterValues: { table: { disable: true } },
    renderResults: { table: { disable: true } },
    navigator: { table: { disable: true } },
  },
  render: (args) => (
    <div className="h-full p-density-4">
      <QueryBrowser {...args} className="h-full min-h-0" />
    </div>
  ),
} satisfies Meta<typeof QueryBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SqlResults: Story = {
  args: {
    id: "storybook-query-browser-sql",
    title: "Service health",
    language: "sql",
    queryLabel: "PostgreSQL query",
    initialQuery:
      "SELECT observed_at, service, status, region, duration_ms\nFROM service_health\nORDER BY observed_at DESC",
    optionsSchema,
    initialOptions: { database: "operations", readOnly: true },
    completion: {
      kind: "sql",
      dialect: "postgresql",
      defaultSchema: "public",
      schemas: [
        {
          name: "public",
          relations: [
            {
              name: "service_health",
              columns: columns.map((column) => ({ name: column.name })),
            },
          ],
        },
      ],
    },
    execute: executeSampleQuery,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Run" }));
    await expect(canvas.findByText("Checkout API")).resolves.toBeVisible();
    await expect(canvas.findByText("Page 1 of 2")).resolves.toBeVisible();
  },
};

export const ProviderError: Story = {
  args: {
    id: "storybook-query-browser-error",
    title: "Broken query",
    language: "sql",
    initialQuery: "SELECT missing_column FROM service_health",
    execute: async () => {
      throw new QueryBrowserExecutionError("query execution failed", {
        provider: "postgresql",
        request: { query: "SELECT missing_column FROM service_health" },
        response: { details: { code: "42703" } },
        error: "column missing_column does not exist",
      });
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Run" }));
    await expect(canvas.findByText("query execution failed")).resolves.toBeVisible();
  },
};
