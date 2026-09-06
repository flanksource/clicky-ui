import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { Button } from "./Button";
import {
  collectionLayoutsSchema,
  collectionLayoutsValue,
} from "./json-schema-form-collection-layouts.fixtures";
import {
  propertiesErrorSchema,
  propertiesErrorValue,
  propertiesServerErrors,
} from "./json-schema-form-properties-errors.fixtures";
import type {
  JsonSchemaObject,
  JsonSchemaFormProps,
} from "./json-schema-form-types";
import {
  allPropertiesSchema,
  allPropertiesValues,
  scalarProperties,
  scalarValues,
  choiceProperties,
  choiceValues,
  collectionProperties,
  collectionValues,
  presentationProperties,
  presentationValues,
  propertiesLookupFetcher,
  propertiesPresentation,
} from "./json-schema-form-properties.fixtures";

const schema: JsonSchemaObject = {
  type: "object",
  required: ["name"],
  properties: {
    name: {
      type: "string",
      title: "Name",
      description: "A readable service name.",
    },
    enabled: { type: "boolean", title: "Enabled" },
    connection: {
      type: "object",
      title: "Connection",
      properties: {
        host: { type: "string", title: "Host" },
        retries: { type: "integer", title: "Retries", minimum: 0 },
        credentials: {
          type: "object",
          title: "Credentials",
          properties: {
            username: { type: "string", title: "Username" },
            password: { type: "string", title: "Password", format: "password" },
          },
        },
      },
    },
    environment: {
      type: "string",
      title: "Environment",
      enum: ["development", "staging"],
    },
    tags: { type: "array", title: "Tags", items: { type: "string" } },
    identifier: { type: "string", title: "Identifier", readOnly: true },
  },
};

const meta = {
  title: "Forms/JsonSchemaForm/Properties",
  component: JsonSchemaForm,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Use layout={{ mode: "properties" }} for a property table with indented labels and aligned values. Previews render content only: selected tags and labels, rendered Markdown, collection contents, and extensions (post-extensions receive readOnly: true), without input borders, carets, or resize handles. Click a value to open its schema control. The inline check saves changes through onChange; cancel discards the draft. Sizes XS–XL scale cell padding independently; XL matches the original Medium cell height. Read-only values cannot be edited.',
      },
    },
  },
  args: { schema, layout: { mode: "properties" }, persistPreferences: false },
} satisfies Meta<typeof JsonSchemaForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Editable: Story = {
  render: (args) => {
    const [value, setValue] = useState<Record<string, unknown>>({
      name: "Example service",
      enabled: true,
      connection: {
        host: "localhost",
        retries: 3,
        credentials: { username: "demo", password: "example-password" },
      },
      environment: "development",
      tags: ["api", "internal"],
      identifier: "service-01",
    });
    return (
      <div className="max-w-4xl">
        <JsonSchemaForm {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

function FieldTypesExample(args: JsonSchemaFormProps) {
  const [value, setValue] = useState(args.value);
  return (
    <div className="max-w-5xl space-y-4">
      <p className="text-sm text-muted-foreground">
        Click or Tab to an editable value. Enter saves and opens the next field,
        skipping action buttons. The inline check saves in place; Escape or
        cancel discards the draft. Leaving the editor also discards unsaved
        changes and restores presentation mode. The inline check and cancel
        appear only while the draft differs from the saved value. Open pickers
        handle their own keys first; Shift+Enter inserts a newline. The
        committed value below changes only when saved.
      </p>
      <JsonSchemaForm
        {...args}
        value={value}
        onChange={setValue}
        lookupFetcher={propertiesLookupFetcher}
        pre={[propertiesPresentation]}
      />
      <details className="rounded-md border border-border p-3">
        <summary className="cursor-pointer text-sm font-medium">
          Committed value
        </summary>
        <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs">
          {JSON.stringify(value, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export const AllFieldTypes: Story = {
  render: FieldTypesExample,
  args: { schema: allPropertiesSchema, value: allPropertiesValues },
  parameters: {
    docs: {
      description: {
        story:
          "Every supported control kind, grouped by purpose. Includes enum and array display variants, locally supplied lookup choices, nested objects, typed maps, and display/link controls supplied through a pre-extension.",
      },
    },
  },
};

export const ScalarFields: Story = {
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: scalarProperties,
      required: ["text"],
    },
    value: scalarValues,
  },
};

export const ChoicesAndLookups: Story = {
  render: FieldTypesExample,
  args: {
    schema: { type: "object", properties: choiceProperties },
    value: choiceValues,
  },
};

export const ObjectsAndCollections: Story = {
  render: FieldTypesExample,
  args: {
    schema: { type: "object", properties: collectionProperties },
    value: collectionValues,
  },
};

export const CollectionLayouts: Story = {
  render: FieldTypesExample,
  args: { schema: collectionLayoutsSchema, value: collectionLayoutsValue },
  parameters: {
    docs: {
      description: {
        story:
          "Collection previews reuse the editing layouts: ordered table columns, identity-rich summary rows, card headers and field grids, and compact lists. Maps nest like objects: keys occupy the label column and values remain aligned. Click a map key to rename or remove it; click a value to edit just that entry.",
      },
    },
  },
};

export const NestedMaps: Story = {
  render: FieldTypesExample,
  args: {
    schema: {
      properties: {
        map: collectionProperties.map!,
        typedMap: collectionProperties.typedMap!,
        endpoints: collectionLayoutsSchema.properties!.endpoints!,
      },
    },
    value: { ...collectionValues, endpoints: collectionLayoutsValue.endpoints },
  },
};

export const CollectionSizes: Story = {
  render: (args) => (
    <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <section key={size} className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold uppercase">{size}</h2>
          <FieldTypesExample
            {...args}
            size={size}
            idPrefix={`collection-${size}`}
            showPreferencesMenu={false}
          />
        </section>
      ))}
    </div>
  ),
  args: {
    schema: {
      properties: {
        table: collectionLayoutsSchema.properties!.table!,
        accordion: collectionLayoutsSchema.properties!.accordion!,
      },
    },
    value: collectionLayoutsValue,
  },
};

export const PresentationAndReadOnly: Story = {
  render: FieldTypesExample,
  args: {
    schema: { type: "object", properties: presentationProperties },
    value: presentationValues,
  },
};

export const PreviewSizes: Story = {
  render: (args) => (
    <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <section key={size} className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold uppercase">{size}</h2>
          <SizeExample {...args} size={size} />
        </section>
      ))}
    </div>
  ),
};

export const WithErrors: Story = {
  render: ErrorExample,
  parameters: {
    docs: {
      description: {
        story:
          "Required and minimum-value hints alongside host-supplied errors on nested fields, Markdown, array items, and the form itself. Filter by internal or localhost: errors on hidden fields remain in the summary. Save commits a value; server errors remain until the host clears them.",
      },
    },
  },
};

export const ErrorSizes: Story = {
  render: (args) => (
    <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <section key={size} className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold uppercase">{size}</h2>
          <ErrorExample {...args} size={size} idPrefix={`errors-${size}`} />
        </section>
      ))}
    </div>
  ),
};

export const FilteringValues: Story = {
  render: FieldTypesExample,
  args: {
    schema: allPropertiesSchema,
    value: allPropertiesValues,
    showFilter: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Search service, internal, localhost, false, or 75. Searches keys, titles, committed scalar values, tags, and nested values without changing the form data. A nested match retains its containing group. Password contents are not searchable; Clear filter restores the complete form.",
      },
    },
  },
};

function ErrorExample(args: JsonSchemaFormProps) {
  const [value, setValue] =
    useState<Record<string, unknown>>(propertiesErrorValue);
  const [errors, setErrors] = useState(propertiesServerErrors);
  return (
    <div className="max-w-4xl space-y-3">
      <p className="text-xs text-muted-foreground">
        Fix Name and Retries with the inline check. Server errors remain until
        cleared below. Search “internal” to see hidden-field errors in the
        summary.
      </p>
      <JsonSchemaForm
        {...args}
        schema={propertiesErrorSchema}
        value={value}
        onChange={setValue}
        errors={errors}
        showFilter
      />
      <Button
        size="sm"
        onClick={() => setErrors(errors.length ? [] : propertiesServerErrors)}
      >
        {errors.length ? "Clear server errors" : "Restore server errors"}
      </Button>
    </div>
  );
}

function SizeExample(args: JsonSchemaFormProps) {
  const [value, setValue] = useState<Record<string, unknown>>({
    name: "Example service",
    tags: ["api", "internal"],
    percent: 75,
    markdown: "**Release notes**\n\n- Preview changes\n- Save or cancel",
  });
  return (
    <JsonSchemaForm
      {...args}
      idPrefix={`properties-${args.size}`}
      value={value}
      onChange={setValue}
      showPreferencesMenu={false}
      schema={{
        properties: {
          name: { type: "string", title: "Name" },
          tags: { type: "array", title: "Tags", items: { type: "string" } },
          percent: scalarProperties.percent!,
          markdown: scalarProperties.markdown!,
        },
      }}
      pre={[
        (field) =>
          field.key === "percent"
            ? {
                ...field,
                prefix: (
                  <span className="text-xs text-muted-foreground">Quota</span>
                ),
              }
            : field,
      ]}
      post={[
        (field, nodes) =>
          field.key === "name"
            ? {
                ...nodes,
                value: (
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0 flex-1">{nodes.value}</div>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      Verified
                    </span>
                  </div>
                ),
              }
            : nodes,
      ]}
    />
  );
}
