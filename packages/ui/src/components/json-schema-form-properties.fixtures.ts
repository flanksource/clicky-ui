import type {
  JsonSchemaObject,
  JsonSchemaProperty,
  LookupFetcher,
  PreExtension,
} from "./json-schema-form-types";

export const scalarProperties: Record<string, JsonSchemaProperty> = {
  text: {
    type: "string",
    title: "Text",
    description: "A required single-line value.",
  },
  password: { type: "string", title: "Password", format: "password" },
  textarea: { type: "string", title: "Textarea", format: "textarea" },
  markdown: {
    type: "string",
    title: "Markdown",
    format: "md",
    "x-md-editor": {
      tables: true,
      diffMode: { viewMode: "rich-text", viewModes: ["rich-text", "source"] },
    },
  },
  integer: { type: "integer", title: "Integer", minimum: 0, multipleOf: 1 },
  number: { type: "number", title: "Decimal", multipleOf: 0.25 },
  percent: {
    type: "number",
    title: "Percent",
    format: "percent",
    minimum: 0,
    maximum: 100,
  },
  slider: {
    type: "number",
    title: "Slider",
    minimum: 0,
    maximum: 100,
    "x-number-display": "slider",
  },
  boolean: { type: "boolean", title: "Boolean" },
  date: { type: "string", title: "Date", format: "date" },
  dateTime: { type: "string", title: "Date and time", format: "date-time" },
  nullable: {
    type: ["string", "null"],
    title: "Nullable text",
    description: "Starts empty; click to enter a value.",
  },
};

export const scalarValues = {
  text: "Example service",
  password: "example-password",
  textarea: "First line\nSecond line",
  markdown:
    "## Release notes\n\nA **small** update with a [reference](https://example.com).\n\n- Preview changes\n- Save or cancel",
  integer: 3,
  number: 1.25,
  percent: 75,
  slider: 40,
  boolean: true,
  date: "2026-09-05",
  dateTime: "2026-09-05T10:30:00Z",
  nullable: null,
};

const enumProperty: JsonSchemaProperty = {
  type: "string",
  enum: ["small", "medium", "large"],
};
const lookup = { url: "/example/options", filter: "name" };

export const choiceProperties: Record<string, JsonSchemaProperty> = {
  combobox: { ...enumProperty, title: "Enum combobox" },
  radio: { ...enumProperty, title: "Enum radio", "x-enum-display": "radio" },
  grid: { ...enumProperty, title: "Enum grid", "x-enum-display": "grid" },
  segmented: {
    ...enumProperty,
    title: "Enum segments",
    "x-enum-display": "segmented",
    "x-enum-descriptions": {
      small: "A single worker",
      medium: "A small team",
      large: "A full department",
    },
  },
  union: {
    title: "Union enum",
    anyOf: [{ type: "string", enum: ["auto", "manual"] }, { type: "string" }],
  },
  lookup: { type: "string", title: "Lookup", "x-clicky-lookup": lookup },
  multiLookup: {
    type: "array",
    title: "Multiple lookup",
    items: { type: "string" },
    "x-clicky-lookup": { ...lookup, multi: true },
  },
  treeLookup: {
    type: "string",
    title: "Tree lookup",
    "x-clicky-lookup": { ...lookup, hierarchy: { delimiters: "/" } },
  },
};

export const choiceValues = {
  combobox: "medium",
  radio: "small",
  grid: "large",
  segmented: "medium",
  union: "auto",
  lookup: "engineering/api",
  multiLookup: ["engineering/api"],
  treeLookup: "engineering/ui",
};

export const propertiesLookupFetcher: LookupFetcher = async ({
  descriptor,
  query,
}) => {
  if (descriptor.url !== lookup.url)
    throw new Error(`Unexpected example lookup: ${descriptor.url}`);
  return ["engineering/api", "engineering/ui", "operations/support"]
    .filter((value) => value.toLowerCase().includes(query.toLowerCase()))
    .map((value) => ({ value, label: value }));
};

const objectItem: JsonSchemaProperty = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", title: "Name" },
    enabled: { type: "boolean", title: "Enabled" },
  },
};
const objectArray: JsonSchemaProperty = {
  type: "array",
  items: objectItem,
  "x-item": { title: ["name"], noun: "service" },
};

export const collectionProperties: Record<string, JsonSchemaProperty> = {
  strings: { type: "array", title: "String tags", items: { type: "string" } },
  integers: {
    type: "array",
    title: "Integer tags",
    items: { type: "integer" },
  },
  numbers: { type: "array", title: "Decimal tags", items: { type: "number" } },
  choices: { type: "array", title: "Enum tags", items: enumProperty },
  pills: {
    type: "array",
    title: "Filter pills",
    items: enumProperty,
    "x-array-display": "filter-pills",
  },
  list: {
    type: "array",
    title: "Compact list",
    items: { type: "string" },
    "x-array-display": "list",
  },
  booleans: {
    type: "array",
    title: "Boolean array",
    items: { type: "boolean" },
  },
  accordion: {
    ...objectArray,
    title: "Object accordion",
    "x-array-display": "accordion",
  },
  cards: { ...objectArray, title: "Object cards", "x-array-display": "cards" },
  stacked: {
    ...objectArray,
    title: "Stacked objects",
    "x-array-display": "stacked",
  },
  table: { ...objectArray, title: "Object table", "x-layout": "table" },
  map: {
    type: "object",
    title: "String map",
    additionalProperties: { type: "string" },
  },
  typedMap: {
    type: "object",
    title: "Typed map",
    additionalProperties: { type: "number" },
  },
  keyPicker: {
    type: "object",
    title: "Map key picker",
    propertyNames: { enum: ["primary", "secondary"] },
    additionalProperties: { type: "string" },
  },
  nested: {
    type: "object",
    title: "Nested object",
    properties: {
      host: { type: "string", title: "Host" },
      credentials: {
        type: "object",
        title: "Credentials",
        properties: { username: { type: "string", title: "Username" } },
      },
    },
  },
};

export const collectionValues = {
  strings: ["api", "internal"],
  integers: [2, 4],
  numbers: [1.25, 2.5],
  choices: ["small", "large"],
  pills: ["small"],
  list: ["Check configuration", "Verify output"],
  booleans: [true, false],
  accordion: [{ name: "API", enabled: true }],
  cards: [{ name: "Worker", enabled: true }],
  stacked: [{ name: "Scheduler", enabled: false }],
  table: [{ name: "Gateway", enabled: true }],
  map: { owner: "platform", region: "local" },
  typedMap: { retries: 3, timeout: 30 },
  keyPicker: { primary: "localhost" },
  nested: { host: "localhost", credentials: { username: "demo" } },
};

export const presentationProperties: Record<string, JsonSchemaProperty> = {
  heading: { title: "Display heading", "x-example-display": "heading" },
  info: {
    title: "Display text",
    description: "Static display fields and links do not enter edit mode.",
    "x-example-display": "text",
  },
  divider: { title: "Divider", "x-example-display": "divider" },
  spacer: { title: "Spacer", "x-example-display": "spacer" },
  link: { type: "string", title: "Reference link", "x-example-link": true },
  readOnly: { type: "string", title: "Read-only text", readOnly: true },
  readOnlyNumber: { type: "number", title: "Read-only number", readOnly: true },
  readOnlyDate: {
    type: "string",
    title: "Read-only date",
    format: "date",
    readOnly: true,
  },
  readOnlyPassword: {
    type: "string",
    title: "Read-only password",
    format: "password",
    readOnly: true,
  },
};

export const presentationValues = {
  link: "https://example.com",
  readOnly: "service-01",
  readOnlyNumber: 42,
  readOnlyDate: "2026-09-05",
  readOnlyPassword: "example-secret",
};

export const propertiesPresentation: PreExtension = (field) => {
  const display = field.schema["x-example-display"];
  if (
    display === "heading" ||
    display === "text" ||
    display === "divider" ||
    display === "spacer"
  ) {
    return { ...field, kind: "display", displayVariant: display };
  }
  return field.schema["x-example-link"] === true
    ? { ...field, kind: "link" }
    : field;
};

export const allPropertiesSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    scalars: {
      type: "object",
      title: "Scalar fields",
      properties: scalarProperties,
      required: ["text"],
    },
    choices: {
      type: "object",
      title: "Choices and lookups",
      properties: choiceProperties,
    },
    collections: {
      type: "object",
      title: "Objects and collections",
      properties: collectionProperties,
    },
    presentation: {
      type: "object",
      title: "Presentation and read-only fields",
      properties: presentationProperties,
    },
  },
};

export const allPropertiesValues = {
  scalars: scalarValues,
  choices: choiceValues,
  collections: collectionValues,
  presentation: presentationValues,
};
