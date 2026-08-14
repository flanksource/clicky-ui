import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type {
  JsonSchemaObject,
  LookupFetcher,
} from "./json-schema-form-types";

type ReferenceExampleProps = {
  title: string;
  description: string;
  schema: JsonSchemaObject;
  initialValue: Record<string, unknown>;
  /** Serves `x-clicky-lookup` fields; omitted, they degrade to free text. */
  lookupFetcher?: LookupFetcher;
};

function ReferenceExample({
  title,
  description,
  schema,
  initialValue,
  lookupFetcher,
}: ReferenceExampleProps) {
  const [value, setValue] = useState<Record<string, unknown>>(initialValue);

  return (
    <article className="mx-auto max-w-7xl space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <section className="min-w-0 space-y-3 rounded-lg border border-border bg-background p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Rendered form
          </h3>
          <JsonSchemaForm
            schema={schema}
            value={value}
            onChange={setValue}
            idPrefix={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            showPreferencesMenu={false}
            {...(lookupFetcher ? { lookupFetcher } : {})}
          />
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Live value
            </h3>
            <pre className="max-h-64 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        </section>

        <section className="min-w-0 space-y-2 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground">JSON Schema</h3>
          <pre className="max-h-[46rem] overflow-auto whitespace-pre rounded-md bg-background p-3 font-mono text-xs">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </section>
      </div>
    </article>
  );
}

const standardFieldsSchema: JsonSchemaObject = {
  type: "object",
  required: ["name", "quantity"],
  properties: {
    name: {
      type: "string",
      title: "Display name",
      description: "A required plain string field.",
    },
    quantity: {
      type: "integer",
      title: "Quantity",
      minimum: 1,
      maximum: 100,
      multipleOf: 1,
    },
    completion: {
      type: "number",
      title: "Completion",
      format: "percent",
      minimum: 0,
      maximum: 100,
    },
    publishedOn: { type: "string", title: "Published on", format: "date" },
    runAt: { type: "string", title: "Run at", format: "date-time" },
    notes: {
      type: "string",
      title: "Notes",
      format: "textarea",
      description: "Long-form text uses a multiline control.",
    },
    enabled: { type: "boolean", title: "Enabled" },
    resourceId: { type: "string", title: "Resource ID", readOnly: true },
  },
};

const enumPresentationsSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    environment: {
      type: "string",
      title: "Environment",
      enum: ["dev", "staging", "prod"],
      "x-enum-labels": {
        dev: "Development",
        staging: "Staging",
        prod: "Production",
      },
    },
    cadence: {
      type: "string",
      title: "Cadence",
      enum: ["manual", "scheduled"],
      "x-enum-display": "radio",
      "x-enum-labels": { manual: "Manual", scheduled: "Scheduled" },
    },
    database: {
      type: "string",
      title: "Database",
      enum: ["postgres", "mysql"],
      "x-enum-display": "grid",
      "x-enum-labels": { postgres: "PostgreSQL", mysql: "MySQL" },
      "x-enum-icons": { postgres: "postgres", mysql: "mysql" },
      "x-enum-descriptions": {
        postgres: "Feature-rich relational database.",
        mysql: "Widely deployed relational database.",
      },
    },
    strategy: {
      type: "string",
      title: "Deployment strategy",
      enum: ["safe", "fast"],
      "x-enum-display": "segmented",
      "x-enum-labels": { safe: "Safe", fast: "Fast" },
      "x-enum-icons": { safe: "shield", fast: "rocket" },
      "x-enum-descriptions": {
        safe: "Require approval before rollout.",
        fast: "Deploy immediately after checks.",
      },
    },
  },
};

const compositionSchema = {
  type: "object",
  required: ["owner", "destination"],
  properties: {
    owner: { $ref: "#/$defs/person", title: "Owner" },
    destination: {
      type: "string",
      title: "Destination",
      description:
        "An enum branch supplies suggestions while the string branch permits custom values.",
      anyOf: [{ enum: ["production", "staging"] }, { type: "string" }],
    },
  },
  allOf: [
    {
      properties: {
        retries: {
          type: "integer",
          title: "Retries",
          minimum: 0,
          maximum: 10,
          multipleOf: 1,
        },
      },
    },
  ],
  $defs: {
    person: {
      type: "object",
      required: ["email"],
      properties: {
        name: { type: "string", title: "Name" },
        email: { type: "string", title: "Email" },
      },
    },
  },
} as unknown as JsonSchemaObject;

const collectionPresentationsSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    frameworks: {
      type: "array",
      title: "Test frameworks",
      description: "An empty array represents all options.",
      "x-array-display": "filter-pills",
      items: { type: "string", enum: ["go test", "vitest", "playwright"] },
    },
    steps: {
      type: "array",
      title: "Pipeline steps",
      "x-layout": "table",
      items: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", title: "Name" },
          command: { type: "string", title: "Command" },
          required: { type: "boolean", title: "Required" },
        },
      },
    },
    labels: {
      type: "object",
      title: "Labels",
      propertyNames: { enum: ["environment", "team", "tier"] },
      additionalProperties: { type: "string" },
    },
  },
};

const clickyExtensionsSchema: JsonSchemaObject = {
  type: "object",
  "x-columns": 12,
  "x-order": ["endpoint", "timeout", "budget", "mode"],
  properties: {
    endpoint: {
      type: "string",
      title: "Endpoint",
      "x-col-span": 8,
      "x-input-prefix-icon": "globe",
      "x-help": {
        section: "Connectivity",
        body: "Use a host reachable from the selected runtime.",
      },
    },
    timeout: {
      type: "integer",
      title: "Timeout",
      minimum: 0,
      multipleOf: 1,
      "x-col-span": 4,
      "x-input-suffix": "ms",
    },
    budget: {
      type: "integer",
      title: "Token budget",
      minimum: 0,
      maximum: 64000,
      multipleOf: 1000,
      "x-number-display": "slider",
      "x-col-span": 12,
    },
    mode: {
      type: "string",
      title: "Mode",
      enum: ["plan", "run"],
      "x-enum-display": "segmented",
      "x-enum-labels": { plan: "Plan", run: "Run" },
      "x-enum-icons": { plan: "list-dashes", run: "play" },
      "x-enum-descriptions": {
        plan: "Inspect and propose changes.",
        run: "Apply and verify changes.",
      },
      "x-col-span": 12,
    },
  },
};

// `then` is the JSON Schema conditional keyword, not a Promise thenable.
/* eslint-disable unicorn/no-thenable */
const discriminatorSchema: JsonSchemaObject = {
  type: "object",
  "x-discriminator": "type",
  required: ["type", "name"],
  properties: {
    type: {
      type: "string",
      title: "Connection type",
      enum: ["postgres", "mysql"],
      "x-enum-display": "grid",
      "x-enum-labels": { postgres: "PostgreSQL", mysql: "MySQL" },
      "x-enum-icons": { postgres: "postgres", mysql: "mysql" },
    },
    name: { type: "string", title: "Connection name" },
  },
  allOf: [
    {
      if: { properties: { type: { const: "postgres" } }, required: ["type"] },
      then: {
        properties: {
          host: { type: "string", title: "Host" },
          sslMode: {
            type: "string",
            title: "SSL mode",
            enum: ["disable", "prefer", "require"],
          },
        },
        required: ["host"],
      },
    },
    {
      if: { properties: { type: { const: "mysql" } }, required: ["type"] },
      then: {
        properties: {
          socket: { type: "string", title: "Unix socket" },
          charset: {
            type: "string",
            title: "Character set",
            default: "utf8mb4",
          },
        },
      },
    },
  ],
};
/* eslint-enable unicorn/no-thenable */

const meta = {
  title: "Components/JsonSchemaForm/Schema Reference",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Runnable JSON Schema reference examples. Every story pairs the exact schema with its rendered `JsonSchemaForm` and live controlled value, so the schema-to-control mapping is visible without opening the source file.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StandardFieldsAndFormats: Story = {
  render: () => (
    <ReferenceExample
      title="Standard fields and formats"
      description="Required fields, descriptions, numeric constraints, date and date-time formats, percent and textarea controls, booleans, and per-field readOnly behavior."
      schema={standardFieldsSchema}
      initialValue={{
        name: "Release candidate",
        quantity: 3,
        completion: 75,
        publishedOn: "2026-07-11",
        runAt: "2026-07-11T18:30",
        notes: "Promote after smoke tests pass.",
        enabled: true,
        resourceId: "release-2026-07-11",
      }}
    />
  ),
};

export const EnumPresentations: Story = {
  render: () => (
    <ReferenceExample
      title="Enum presentations"
      description="The same standard enum data rendered as a combobox, radio group, icon grid, and descriptive segmented control using Clicky UI presentation hints."
      schema={enumPresentationsSchema}
      initialValue={{
        environment: "prod",
        cadence: "scheduled",
        database: "postgres",
        strategy: "safe",
      }}
    />
  ),
};

export const CompositionAndLocalReferences: Story = {
  render: () => (
    <ReferenceExample
      title="Composition, unions, and local references"
      description="Local #/$defs references are rehydrated, unconditional allOf members contribute fields, and an enum inside anyOf provides suggestions while retaining a free-text branch."
      schema={compositionSchema}
      initialValue={{
        owner: { name: "Ada Lovelace", email: "ada@example.com" },
        destination: "production",
        retries: 2,
      }}
    />
  ),
};

export const CollectionPresentations: Story = {
  render: () => (
    <ReferenceExample
      title="Collection presentations"
      description="Enum arrays can render as filter pills, arrays of objects can render as compact tables, and propertyNames.enum constrains editable map keys."
      schema={collectionPresentationsSchema}
      initialValue={{
        frameworks: ["go test", "vitest"],
        steps: [
          { name: "Unit tests", command: "pnpm test", required: true },
          { name: "Build", command: "pnpm build", required: true },
        ],
        labels: { environment: "production", team: "platform" },
      }}
    />
  ),
};

export const ClickyLayoutAndControlExtensions: Story = {
  render: () => (
    <ReferenceExample
      title="Clicky layout and control extensions"
      description="A 12-column grid with explicit order and spans, input adornments, generated helper text, a bounded number slider, and a descriptive segmented enum."
      schema={clickyExtensionsSchema}
      initialValue={{
        endpoint: "api.example.com",
        timeout: 5000,
        budget: 16000,
        mode: "plan",
      }}
    />
  ),
};

export const DiscriminatorFlow: Story = {
  render: () => (
    <ReferenceExample
      title="Discriminator flow"
      description="x-discriminator creates a two-phase picker. Selecting a connection type collapses the picker and reveals the matching if/then branch."
      schema={discriminatorSchema}
      initialValue={{}}
    />
  ),
};

// Option labels that encode a hierarchy in their own names — the case a flat
// dropdown of 50 entries reads badly. `hierarchy.delimiters` says which
// characters separate levels; everything else stays an ordinary label
// character, so `remote-debugger` is one segment rather than two.
const HIERARCHY_OPTIONS = [
  "http",
  "jms",
  "jms.all",
  "jms.incoming",
  "jms.incoming.disbursements",
  "logs.api",
  "logs.cycle",
  "remote-debugger.jdbc",
];

const hierarchicalLookupFetcher: LookupFetcher = async ({ query }) =>
  HIERARCHY_OPTIONS.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()),
  ).map((name) => ({ value: name, label: name }));

const hierarchicalLookupSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    dest: {
      type: "string",
      title: "Destination",
      description: "Single select: committing closes the picker.",
      "x-clicky-lookup": {
        url: "/api/v1/profiles",
        filter: "profile",
        hierarchy: { delimiters: "./" },
      },
    },
    imports: {
      type: "array",
      title: "Imports",
      description: "Multi select: committed values stay as chips.",
      items: { type: "string" },
      "x-clicky-lookup": {
        url: "/api/v1/profiles",
        filter: "profile",
        multi: true,
        hierarchy: { delimiters: "./" },
      },
    },
  },
};

export const HierarchicalLookups: Story = {
  render: () => (
    <ReferenceExample
      title="Hierarchical lookups"
      description="An x-clicky-lookup whose descriptor declares `hierarchy` browses its options as a tree instead of a flat list. The committed value is always the option's own value — the split is presentation only."
      schema={hierarchicalLookupSchema}
      initialValue={{ imports: ["jms"] }}
      lookupFetcher={hierarchicalLookupFetcher}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: /Select/ }));

    // The panel is portaled to the body, so it is queried from the document.
    const panel = await within(document.body).findByRole("tree");

    // A node that is both a folder and a leaf keeps its caret, so its children
    // stay reachable without committing it.
    const jms = within(panel).getByText("jms").closest('[role="treeitem"]')!;
    await userEvent.click(
      within(jms as HTMLElement).getAllByRole("button", { name: /Expand/ })[0]!,
    );
    await userEvent.click(within(panel).getByText("incoming"));

    // The dotted name is committed whole — "jms/incoming" is only the tree key.
    await expect(
      canvas.getByRole("button", { name: /jms\.incoming/ }),
    ).toBeInTheDocument();
  },
};

// The same multi lookup WITHOUT `hierarchy`: a flat option list, so it takes the
// tags combobox — the control an enum-item array uses, with the option set
// fetched instead of declared.
const flatLookupSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    imports: {
      type: "array",
      title: "Imports",
      description: "Multi select: every committed value stays as a pill.",
      items: { type: "string" },
      "x-clicky-lookup": {
        url: "/api/v1/profiles",
        filter: "profile",
        multi: true,
      },
    },
  },
};

export const MultiValueLookup: Story = {
  render: () => (
    <ReferenceExample
      title="Multi-value lookup"
      description="An x-clicky-lookup with `multi: true` on an array field commits a list, so it renders as one tags combobox: the head set loads when the menu opens and typing searches the server (debounced). Add `hierarchy` to browse the same options as a tree instead — see Hierarchical lookups."
      schema={flatLookupSchema}
      initialValue={{ imports: ["jms"] }}
      lookupFetcher={hierarchicalLookupFetcher}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The committed value renders before any option has been fetched.
    await expect(canvas.getByText("jms")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("combobox"));
    const body = within(document.body);
    await userEvent.click(await body.findByRole("option", { name: "logs.api" }));
    await expect(
      canvas.getByRole("button", { name: "Remove logs.api" }),
    ).toBeInTheDocument();
  },
};
