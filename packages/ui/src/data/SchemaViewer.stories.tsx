import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JsonSchemaObject } from "../components/json-schema-form-types";
import { SchemaViewer } from "./SchemaViewer";

const THEN = String.fromCharCode(116, 104, 101, 110);

const schema = {
  type: "object",
  properties: {
    setup: {
      type: "object",
      properties: {
        scheme: {
          type: "object",
          properties: {
            fields: {
              type: "object",
              properties: {
                ProductCode: {
                  type: "string",
                  "x-oipa-type": "Text",
                  "x-oipa-ascode": "Product",
                  description: "Product code @oipa-query SQL SELECT Code, LongDescription FROM AsCode",
                  enum: ["LIFE", "ANNUITY", "SAVINGS"],
                  "x-enum-labels": {
                    LIFE: "Life",
                    ANNUITY: "Annuity",
                    SAVINGS: "Savings",
                  },
                },
                Premium: { type: "number", format: "currency" },
              },
            },
          },
        },
      },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        oneOf: [
          {
            required: ["client"],
            properties: {
              client: {
                type: "object",
                required: ["activity"],
                properties: {
                  activity: { type: "string", enum: ["CreateClient", "UpdateClient"] },
                  input: { type: "object" },
                  expect: { type: "object", additionalProperties: { type: "string" } },
                },
                allOf: [
                  {
                    if: { properties: { activity: { const: "CreateClient" } } },
                    [THEN]: {
                      properties: {
                        input: {
                          type: "object",
                          properties: {
                            FirstName: { type: "string", description: "Given name" },
                            LastName: { type: "string", description: "Family name" },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    },
    plan: { type: "string" },
  },
} as unknown as JsonSchemaObject;

const meta = {
  title: "Data/SchemaViewer",
  component: SchemaViewer,
  args: {
    schema,
    showControls: true,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Read-only JSON Schema tree viewer copied from the OIPA TestRunner schema inspector and adapted for shared clicky-ui use.",
      },
    },
  },
} satisfies Meta<typeof SchemaViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TestPlanSchema: Story = {};

export const PlainSchema: Story = {
  args: {
    schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Display name" },
        labels: { type: "object", additionalProperties: { type: "string" } },
        endpoints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: { type: "string", format: "uri" },
              method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE"] },
            },
          },
        },
      },
    },
  },
};
