import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type {
  JsonSchemaFormProps,
  JsonSchemaObject,
  PostExtension,
  PreExtension,
} from "./json-schema-form-types";

// Renders the form as a controlled component and echoes the live value as JSON
// so every story doubles as a working demo of what onChange emits.
function FormHarness({
  schema,
  value: initialValue,
  ...rest
}: Omit<JsonSchemaFormProps, "onChange"> & { onChange?: never }) {
  const [value, setValue] = useState<Record<string, unknown>>(initialValue);
  return (
    <div className="max-w-xl space-y-4">
      <JsonSchemaForm schema={schema} value={value} onChange={setValue} {...rest} />
      <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const scalarSchema: JsonSchemaObject = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", title: "Full name", description: "First and last name." },
    age: { type: "integer", minimum: 0, default: 18 },
    active: { type: "boolean", title: "Active" },
    role: { type: "string", title: "Role", enum: ["admin", "editor", "viewer"] },
    tags: { type: "array", items: { type: "string" }, description: "Press Enter or comma to add." },
  },
};

const meta = {
  title: "Components/JsonSchemaForm",
  component: JsonSchemaForm,
  render: (args) => <FormHarness {...args} />,
  args: {
    schema: scalarSchema,
    value: { name: "Ada Lovelace", age: 36, active: true, role: "editor", tags: ["math", "engine"] },
    readOnly: false,
    inline: false,
  },
  argTypes: {
    schema: { control: "object", table: { category: "Schema" } },
    value: { control: "object", table: { category: "Value" } },
    readOnly: { control: "boolean", table: { category: "Behavior" } },
    hideReadOnlyFields: {
      control: "boolean",
      description: "Omit schema `readOnly: true` fields entirely instead of showing them as value displays.",
      table: { category: "Behavior", defaultValue: { summary: "false" } },
    },
    inline: {
      control: "boolean",
      description:
        "Shorthand for `layout: { mode: 'inline' }` — a two-column label/field layout instead of stacked. Ignored when `layout` is set.",
      table: { category: "Appearance", defaultValue: { summary: "false" } },
    },
    layout: {
      control: "object",
      description:
        "Form-level layout, overrides `inline`. Inline mode caps the label column (`labelMaxWidth`, default `40ch`) and value column (`valueMaxWidth`, default `400px`).",
      table: { category: "Appearance" },
    },
    title: { control: "text", table: { category: "Appearance" } },
    hiddenKeys: { control: "object", table: { category: "Behavior" } },
    onChange: { control: false, table: { category: "Events" } },
    pre: { control: false, table: { category: "Extensions" } },
    post: { control: false, table: { category: "Extensions" } },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "`JsonSchemaForm` turns a JSON-Schema object into an editable form. You give it a",
          "`schema`, the current `value`, and an `onChange` callback; it renders one control per",
          "property and hands you back the next value object on every edit. There is no submit step",
          "and no internal state — it is a controlled component you drive from your own store.",
          "",
          "It is **deliberately domain-agnostic**. The library knows nothing about your app: it infers",
          "a sensible control from each property's schema, resolves `if`/`then` conditionals, and",
          "recurses through arrays and nested objects. Everything beyond that — badges, helper text,",
          "custom-value tolerance, insert buttons, dropping fields — is added by *you* through two",
          "extension hooks (`pre` and `post`), so the same component serves any product.",
          "",
          "### The controlled contract",
          "```tsx",
          "const [value, setValue] = useState<Record<string, unknown>>(initial);",
          "<JsonSchemaForm schema={schema} value={value} onChange={setValue} />;",
          "```",
          "`onChange` always receives a brand-new object (and new nested arrays/objects for deep",
          "edits) — never a mutation of the one you passed in. Validation is **display-only**: a",
          "`Required` / range / unknown-value hint renders under a field but never blocks `onChange`.",
          "",
          "### Control inference",
          "First match wins, top to bottom:",
          "",
          "| Schema | Control |",
          "| --- | --- |",
          "| `enum` (any type) | Combobox (free-text allowed via `allowCustomValue`) |",
          "| `boolean` | checkbox (falls back to text if the value isn't a boolean) |",
          "| `integer` / `number` | numeric text (kept as a string unless it parses cleanly) |",
          "| `array` of plain strings | compact tag input |",
          "| `array` of anything else | per-item recursive list with add / remove / reorder |",
          "| `object` with `additionalProperties` | key/value string-map (+ any known props) |",
          "| `object` with `properties` | **nested sub-form** (recurses) |",
          "| otherwise | text |",
          "",
          "### Recursion",
          "Array items and object/map values are rendered by the *same* pipeline as top-level fields,",
          "to any depth. An array of objects, an object containing an array of objects, a map whose",
          "values are objects — all render structurally, and **your `pre`/`post` extensions apply at",
          "every level**, not just the top.",
          "",
          "### Writing extensions",
          "A **pre-extension** runs after a control is inferred and before it renders. It returns a",
          "transformed `FieldControl` — or `null` to drop the field entirely:",
          "```ts",
          "type FieldControl = {",
          "  key: string;",
          "  kind: 'string'|'number'|'boolean'|'enum'|'array'|'object'|'string-map';",
          "  label: string; required: boolean; value: unknown;",
          "  onChange: (next: unknown) => void;   // mutate the field from an adornment",
          "  options?: { value: string; label: string }[];",
          "  allowCustomValue?: boolean; badge?: string; helper?: string;",
          "  coerceNumber?: boolean; itemSchema?: JsonSchemaProperty;",
          "  objectProperties?: Record<string, JsonSchemaProperty>;",
          "};",
          "",
          "type PreExtension = (",
          "  field: FieldControl,",
          "  ctx: { key: string; prop: JsonSchemaProperty; value: unknown },",
          ") => FieldControl | null;",
          "",
          "// Example: badge + custom-value tolerance for a 'secret' field.",
          "const secretPre: PreExtension = (field) =>",
          "  field.key === 'token'",
          "    ? { ...field, badge: 'Secret', helper: 'Stored encrypted.', allowCustomValue: true }",
          "    : field;",
          "```",
          "A **post-extension** runs at render time. It receives the rendered `label` and `value`",
          "nodes and returns replacements — typically wrapping the value with an adornment that calls",
          "`field.onChange` (carried on the field):",
          "```tsx",
          "type PostExtension = (",
          "  field: FieldControl,",
          "  nodes: { label: ReactNode; value: ReactNode },",
          ") => { label: ReactNode; value: ReactNode };",
          "",
          "const insertTokenPost: PostExtension = (field, nodes) =>",
          "  field.key !== 'token' ? nodes : {",
          "    label: nodes.label,",
          "    value: (",
          "      <div className=\"flex items-center gap-2\">",
          "        <div className=\"min-w-0 flex-1\">{nodes.value}</div>",
          "        <button type=\"button\" onClick={() => field.onChange('{{secrets.api_token}}')}>",
          "          Insert token",
          "        </button>",
          "      </div>",
          "    ),",
          "  };",
          "",
          "<JsonSchemaForm schema={schema} value={value} onChange={setValue}",
          "  pre={[secretPre]} post={[insertTokenPost]} />;",
          "```",
          "Both stacks are arrays applied in order, and both run at every depth — see the",
          "**NestedExtensions** story for an insert button on a string buried inside an object and an",
          "array item.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof JsonSchemaForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A scalar object: a required text field, a numeric field with a default, a boolean, an enum, and a string array. Edit any control and watch the live JSON below update — that JSON is exactly what `onChange` emits.",
      },
    },
  },
};

export const Empty: Story = {
  args: { value: {} },
  parameters: {
    docs: {
      description: {
        story:
          "The same schema with an empty value. The required `name` field shows its `Required` hint immediately; nothing is pre-filled because the form never invents values you didn't pass.",
      },
    },
  },
};

export const Inline: Story = {
  args: { inline: true, title: "Profile" },
  parameters: {
    docs: {
      description: {
        story:
          "`inline` switches each field to a compact two-column label/control layout, and `title` renders a heading above the form. Use this for dense property panels. The label column caps at `40ch` and the value column at `400px` by default.",
      },
    },
  },
};

export const InlineCustomWidths: Story = {
  args: {
    title: "Profile",
    layout: { mode: "inline", labelMaxWidth: "8rem", valueMaxWidth: "240px" },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pass an explicit `layout` to override the inline width caps — here a narrower `8rem` label column and a `240px` value column. `layout` takes precedence over the `inline` shorthand.",
      },
    },
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  parameters: {
    docs: {
      description: {
        story:
          "`readOnly` disables every control at every depth — including add/remove/reorder on arrays and Add-field on maps — while still rendering the current values for inspection.",
      },
    },
  },
};

const readOnlyFieldSchema: JsonSchemaObject = {
  type: "object",
  required: ["FirstName"],
  properties: {
    ClientGUID: { type: "string", title: "Client GUID", readOnly: true },
    SystemDate: { type: "string", format: "date-time", title: "System date", readOnly: true },
    FirstName: { type: "string", title: "First name" },
    Role: { type: "string", title: "Role", enum: ["admin", "editor", "viewer"] },
  },
};

export const PerFieldReadOnly: Story = {
  args: {
    schema: readOnlyFieldSchema,
    value: {
      ClientGUID: "8f3c-7a21-44de",
      SystemDate: "2026-04-15T12:00:00Z",
      FirstName: "Ada",
      Role: "editor",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fields whose schema declares `readOnly: true` render as static value displays (no input), while the rest stay editable. Dates are formatted human-readably; an empty read-only value shows an em-dash.",
      },
    },
  },
};

export const HideReadOnlyFields: Story = {
  args: {
    schema: readOnlyFieldSchema,
    value: {
      ClientGUID: "8f3c-7a21-44de",
      SystemDate: "2026-04-15T12:00:00Z",
      FirstName: "Ada",
      Role: "editor",
    },
    hideReadOnlyFields: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`hideReadOnlyFields` drops every `readOnly: true` field at every depth, leaving only the editable surface.",
      },
    },
  },
};

export const Validation: Story = {
  args: {
    value: { name: "", age: -5, role: "superuser", tags: [] },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Display-only hints: empty required field, a number below `minimum`, and an enum value outside the option set. None of them block editing.",
      },
    },
  },
};

const stringMapSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    labels: {
      type: "object",
      title: "Labels",
      additionalProperties: { type: "string" },
      properties: { env: { type: "string", enum: ["dev", "staging", "prod"] } },
    },
  },
};

export const StringMap: Story = {
  args: {
    schema: stringMapSchema,
    value: { labels: { env: "prod", team: "platform" } },
  },
  parameters: {
    docs: {
      description: {
        story:
          "An object with `additionalProperties` renders as editable key/value rows. Known properties (e.g. `env`) get their schema-derived control; extra keys are free-form. Use **Add field** to append a row.",
      },
    },
  },
};

// `then` here is the JSON Schema 2020-12 conditional keyword, not a Promise
// thenable, so unicorn/no-thenable is a false positive on these schema literals.
/* eslint-disable unicorn/no-thenable */
const conditionalSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    notify: { type: "string", title: "Notify via", enum: ["none", "email", "webhook"] },
  },
  allOf: [
    {
      if: { properties: { notify: { const: "email" } }, required: ["notify"] },
      then: { required: ["address"], properties: { address: { type: "string", title: "Email address" } } },
    },
    {
      if: { properties: { notify: { const: "webhook" } }, required: ["notify"] },
      then: {
        required: ["url"],
        properties: {
          url: { type: "string", title: "Webhook URL" },
          headers: { type: "object", title: "Headers", additionalProperties: { type: "string" } },
        },
      },
    },
  ],
};
/* eslint-enable unicorn/no-thenable */

export const Conditional: Story = {
  args: {
    schema: conditionalSchema,
    value: { notify: "email", address: "ops@example.com" },
    title: "Notification",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`if`/`then` clauses reveal extra fields based on the current value. Switch **Notify via** between `email` and `webhook` to see the dependent fields change.",
      },
    },
  },
};

const badgePre: PreExtension = (field) =>
  field.key === "token" ? { ...field, badge: "Secret", helper: "Stored encrypted." } : field;

const insertTokenPost: PostExtension = (field, nodes) => {
  if (field.key !== "token") return nodes;
  return {
    label: nodes.label,
    value: (
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">{nodes.value}</div>
        <button
          type="button"
          className="shrink-0 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
          onClick={() => field.onChange("{{secrets.api_token}}")}
        >
          Insert token
        </button>
      </div>
    ),
  };
};

export const Extensions: Story = {
  args: {
    schema: {
      type: "object",
      properties: {
        endpoint: { type: "string", title: "Endpoint" },
        token: { type: "string", title: "API token" },
      },
    },
    value: { endpoint: "https://api.example.com", token: "" },
    title: "Connection",
    pre: [badgePre],
    post: [insertTokenPost],
  },
  parameters: {
    docs: {
      description: {
        story:
          "A `pre` extension stamps a `Secret` badge and helper text onto the `token` field; a `post` extension adds an **Insert token** button beside its value that mutates the field through `onChange`.",
      },
    },
  },
};

export const Hidden: Story = {
  args: {
    hiddenKeys: ["age", "tags"],
    title: "Trimmed",
  },
  parameters: {
    docs: {
      description: {
        story: "`hiddenKeys` omits properties from rendering without removing them from the value.",
      },
    },
  },
};

const arrayOfObjectsSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    servers: {
      type: "array",
      title: "Servers",
      items: {
        type: "object",
        properties: {
          name: { type: "string", title: "Name" },
          port: { type: "integer", title: "Port", minimum: 0 },
          tls: { type: "boolean", title: "TLS" },
        },
        required: ["name"],
      },
    },
  },
};

export const ArrayOfObjects: Story = {
  args: {
    schema: arrayOfObjectsSchema,
    value: { servers: [{ name: "api", port: 8080, tls: true }, { name: "worker", port: 0, tls: false }] },
    title: "Cluster",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When an array's items are objects, each item renders as its own sub-form (labelled *Item N*) with add / remove / reorder controls. Required and range hints apply per item. Plain string arrays still use the compact tag input — see **ScalarArrayTags**.",
      },
    },
  },
};

const nestedObjectSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    name: { type: "string", title: "Service name" },
    db: {
      type: "object",
      title: "Database",
      properties: {
        host: { type: "string", title: "Host" },
        port: { type: "integer", title: "Port" },
        creds: {
          type: "object",
          title: "Credentials",
          properties: { user: { type: "string", title: "User" }, password: { type: "string", title: "Password" } },
          required: ["user"],
        },
      },
      required: ["host"],
    },
  },
};

export const NestedObject: Story = {
  args: {
    schema: nestedObjectSchema,
    value: { name: "billing", db: { host: "db.internal", port: 5432, creds: { user: "svc", password: "" } } },
    title: "Service",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Objects with `properties` recurse into nested sub-forms — here two levels deep (`db` → `creds`). Each level keeps its own labels and required markers, and edits rebuild the full object immutably.",
      },
    },
  },
};

const deepSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    services: {
      type: "array",
      title: "Services",
      items: {
        type: "object",
        properties: {
          name: { type: "string", title: "Name" },
          env: {
            type: "object",
            title: "Env",
            additionalProperties: { type: "string" },
          },
          ports: { type: "array", title: "Ports", items: { type: "integer" } },
        },
        required: ["name"],
      },
    },
  },
};

export const DeepRecursion: Story = {
  args: {
    schema: deepSchema,
    value: {
      services: [
        { name: "web", env: { LOG_LEVEL: "info" }, ports: [80, 443] },
        { name: "cache", env: {}, ports: [6379] },
      ],
    },
    title: "Compose",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Array → object → (map + number array). The renderer follows the schema all the way down: editing a port two levels deep, adding an env key, or reordering a service all round-trip through the live JSON below.",
      },
    },
  },
};

// A post-extension that targets a field by its leaf key wherever it appears —
// top-level, inside a nested object, or inside an array item — proving pre/post
// thread through recursion.
const insertHostPost: PostExtension = (field, nodes) => {
  if (field.key !== "host") return nodes;
  return {
    label: nodes.label,
    value: (
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">{nodes.value}</div>
        <button
          type="button"
          className="shrink-0 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
          onClick={() => field.onChange("{{discovered.host}}")}
        >
          Insert host
        </button>
      </div>
    ),
  };
};

const hostBadgePre: PreExtension = (field) =>
  field.key === "host" ? { ...field, badge: "Discovered" } : field;

const nestedExtSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    primary: {
      type: "object",
      title: "Primary",
      properties: { host: { type: "string", title: "Host" } },
    },
    replicas: {
      type: "array",
      title: "Replicas",
      items: { type: "object", properties: { host: { type: "string", title: "Host" } } },
    },
  },
};

export const NestedExtensions: Story = {
  args: {
    schema: nestedExtSchema,
    value: { primary: { host: "" }, replicas: [{ host: "" }] },
    title: "Topology",
    pre: [hostBadgePre],
    post: [insertHostPost],
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `pre` badge and `post` **Insert host** button target every field whose key is `host` — and they appear on the nested `primary.host` AND on each array item's `host`, because extensions run at every depth. Clicking an insert button mutates exactly that nested field via its own `onChange`.",
      },
    },
  },
};

export const ScalarArrayTags: Story = {
  args: {
    schema: { type: "object", properties: { tags: { type: "array", title: "Tags", items: { type: "string" } } } },
    value: { tags: ["math", "engine"] },
    title: "Labels",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Plain string arrays keep the compact tag editor: type and press Enter or comma to add, Backspace on an empty input to remove the last. This fast-path is chosen only when the item schema is a bare string.",
      },
    },
  },
};

export const EnumArray: Story = {
  args: {
    schema: {
      type: "object",
      properties: {
        roles: { type: "array", title: "Roles", items: { type: "string", enum: ["admin", "editor", "viewer"] } },
      },
    },
    value: { roles: ["admin", "viewer"] },
    title: "Access",
  },
  parameters: {
    docs: {
      description: {
        story:
          "An array whose items carry an `enum` is NOT a tag list — each item gets its own Combobox so values stay constrained to (and discoverable from) the option set, with the usual add / remove / reorder controls.",
      },
    },
  },
};
