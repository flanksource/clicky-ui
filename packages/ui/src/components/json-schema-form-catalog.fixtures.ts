import type {
  JsonSchemaObject,
  JsonSchemaProperty,
} from "./json-schema-form-types";
import {
  allPropertiesSchema,
  allPropertiesValues,
  scalarProperties,
  scalarValues,
  choiceProperties,
  choiceValues,
} from "./json-schema-form-properties.fixtures";

const nullableProperties = Object.fromEntries(
  Object.entries({ ...scalarProperties, ...choiceProperties })
    .filter(([, property]) => !property.readOnly)
    .map(([key, property]) => [
      key,
      { title: property.title, anyOf: [property, { type: "null" }] },
    ]),
) as Record<string, JsonSchemaProperty>;

export const fieldCatalogSchema: JsonSchemaObject = {
  ...allPropertiesSchema,
  properties: {
    ...allPropertiesSchema.properties,
    additional: {
      type: "object",
      title: "Additional controls and states",
      properties: {
        color: { type: ["string", "null"], title: "Color", format: "color" },
        stepper: {
          type: ["number", "null"],
          title: "Decimal stepper",
          multipleOf: 0.25,
          minimum: 0,
          "x-number-display": "stepper",
        },
        json: { title: "JSON", format: "json" },
        dateOrText: {
          title: "Date or text",
          anyOf: [
            { type: "string", title: "Date", format: "date" },
            { type: "string", title: "Text" },
            { type: "null" },
          ],
        },
        patternMap: {
          type: "object",
          title: "Pattern map",
          patternProperties: { "^count": { type: "integer" } },
          additionalProperties: { type: "string" },
        },
        disabled: { type: "string", title: "Disabled", "x-disabled": true },
        secret: {
          type: "string",
          title: "Write only",
          writeOnly: true,
          format: "password",
        },
        required: { type: "string", title: "Required empty field" },
        hover: {
          type: "string",
          title: "Hover help",
          description: "Help available on focus and hover.",
          "x-help-display": "hover",
        },
      },
      required: ["required"],
    },
    nullable: {
      type: "object",
      title: "Nullable controls",
      properties: nullableProperties,
    },
    nullableCollections: {
      type: "object",
      title: "Nullable collections",
      properties: {
        object: {
          title: "Nullable object",
          anyOf: [
            {
              type: "object",
              properties: { name: { type: "string", title: "Name" } },
            },
            { type: "null" },
          ],
        },
        array: {
          title: "Nullable array",
          type: ["array", "null"],
          items: { type: "string" },
        },
        json: {
          title: "Nullable JSON",
          type: ["object", "null"],
          format: "json",
        },
      },
    },
  },
};

export const fieldCatalogValues = {
  ...allPropertiesValues,
  additional: {
    color: "#336699",
    stepper: 1.25,
    json: { enabled: true, values: [0, false, null] },
    dateOrText: "2026-11-07",
    patternMap: { countWorkers: 3, region: "local" },
    disabled: "Locked",
    secret: "example",
    required: "",
    hover: "Example",
  },
  nullable: { ...scalarValues, ...choiceValues, boolean: false, integer: 0 },
  nullableCollections: {
    object: { name: "Example" },
    array: ["api"],
    json: { enabled: true },
  },
};
