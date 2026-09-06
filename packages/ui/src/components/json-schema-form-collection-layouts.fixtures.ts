import type {
  JsonSchemaObject,
  JsonSchemaProperty,
} from "./json-schema-form-types";

const service: JsonSchemaProperty = {
  type: "object",
  "x-columns": 2,
  "x-order": ["name", "environment", "endpoint", "tags"],
  properties: {
    name: { type: "string", title: "Name" },
    environment: {
      type: "string",
      title: "Environment",
      enum: ["development", "staging"],
    },
    endpoint: { type: "string", title: "Endpoint" },
    tags: { type: "array", title: "Tags", items: { type: "string" } },
  },
};

const services: JsonSchemaProperty = {
  type: "array",
  items: service,
  "x-item": {
    title: ["name"],
    badge: "environment",
    summary: ["endpoint"],
    noun: "service",
    nounPlural: "services",
  },
};

export const collectionLayoutsSchema: JsonSchemaObject = {
  properties: {
    table: { ...services, title: "Table", "x-layout": "table" },
    accordion: {
      ...services,
      title: "Summary rows",
      "x-array-display": "accordion",
    },
    cards: { ...services, title: "Cards", "x-array-display": "cards" },
    stacked: {
      ...services,
      title: "Stacked items",
      "x-array-display": "stacked",
    },
    list: {
      type: "array",
      title: "Compact list",
      "x-array-display": "list",
      items: { type: "string" },
    },
    map: {
      type: "object",
      title: "Parameters",
      additionalProperties: { type: "string" },
    },
    endpoints: {
      type: "object",
      title: "Endpoint groups",
      propertyNames: {
        title: "Role",
        enum: ["primary", "secondary"],
        "x-enum-labels": {
          primary: "Primary endpoint",
          secondary: "Secondary endpoint",
        },
      },
      additionalProperties: {
        type: "object",
        "x-layout": "stack",
        "x-columns": 2,
        properties: {
          host: { type: "string", title: "Host" },
          port: { type: "integer", title: "Port" },
        },
      },
    },
  },
};

const serviceValues = [
  {
    name: "Gateway",
    environment: "staging",
    endpoint: "https://gateway.example.com",
    tags: ["public", "api"],
  },
  {
    name: "Worker",
    environment: "development",
    endpoint: "https://worker.example.com",
    tags: ["internal"],
  },
];

export const collectionLayoutsValue = {
  table: serviceValues,
  accordion: serviceValues,
  cards: serviceValues,
  stacked: serviceValues,
  list: ["Validate configuration", "Preview changes", "Apply and verify"],
  map: { owner: "platform", region: "local" },
  endpoints: {
    primary: { host: "gateway.example.com", port: 443 },
    secondary: { host: "worker.example.com", port: 8443 },
  },
};
