import type { JsonSchemaObject, JsonSchemaProperty } from "../components/json-schema-form-types";
import type { ConnectionDashboardItem } from "../connections/connectionDashboardModel";

/**
 * A trimmed copy of the discriminated connection schema commons-db serves on
 * `GET {apiBase}/connection` with `Accept: application/schema+json`: a type
 * picker that selects one `$defs` branch per connection type, with the
 * Kubernetes widget hints (`k8s-*-selector`) the query app resolves through its
 * own form extensions and other hosts leave as plain inputs.
 */
const namespaceField: JsonSchemaProperty = {
  title: "Namespace",
  type: "string",
  "x-clicky-component": "k8s-namespace-selector",
  "x-clicky-order": 1,
};

function connectionBranch(
  type: string,
  urlHint: string,
): JsonSchemaObject {
  return {
    title: `Connection: ${type}`,
    type: "object",
    required: ["name", "type", "url"],
    properties: {
      name: { title: "Name", type: "string", "x-clicky-order": 0 },
      namespace: namespaceField,
      type: { title: "Type", type: "string", const: type },
      url: {
        title: "URL",
        description: urlHint,
        type: "string",
        "x-clicky-component": "k8s-url-selector",
        "x-clicky-default-source": "value",
        "x-clicky-order": 2,
      },
      username: {
        title: "Username",
        type: "string",
        "x-clicky-component": "k8s-secret-selector",
        "x-clicky-default-source": "value",
        "x-clicky-order": 4,
      },
      password: {
        title: "Password",
        type: "string",
        format: "password",
        "x-clicky-component": "k8s-secret-selector",
        "x-clicky-default-source": "secret",
        "x-clicky-order": 5,
      },
    },
  };
}

const branches = {
  postgres: connectionBranch("postgres", "postgres://host:5432/db"),
  redis: connectionBranch("redis", "redis://host:6379/0"),
};

export const connectionSchemaFixture: JsonSchemaObject = {
  type: "object",
  required: ["name", "type"],
  "x-discriminator": "type",
  properties: {
    name: { title: "Name", type: "string", "x-clicky-order": 0 },
    namespace: namespaceField,
    type: {
      title: "Type",
      type: "string",
      enum: Object.keys(branches),
      "x-enum-display": "combobox",
      "x-enum-icons": { postgres: "postgres", redis: "redis" },
    },
  },
  allOf: Object.entries(branches).map(([type, branch]) => ({
    if: { properties: { type: { const: type } }, required: ["type"] },
    then: branch,
  })),
};

export const connectionDashboardFixture: ConnectionDashboardItem[] = [
  {
    id: "warehouse-id",
    name: "warehouse",
    namespace: "analytics",
    type: "postgres",
    endpoint: { scheme: "postgres", host: "warehouse.analytics:5432", path: "/orders" },
    secretCount: 1,
    inlineCredential: false,
    insecureTLS: false,
    profileCount: 3,
    updatedAt: "2026-10-01T09:00:00Z",
  },
  {
    id: "cache-id",
    name: "cache",
    namespace: "",
    type: "redis",
    endpoint: { scheme: "redis", host: "cache:6379" },
    secretCount: 0,
    inlineCredential: true,
    insecureTLS: false,
    profileCount: 0,
    updatedAt: "2026-10-10T09:00:00Z",
  },
];

export const cacheConnectionFixture = {
  id: "cache-id",
  name: "cache",
  namespace: "",
  type: "redis",
  url: "redis://cache:6379/0",
  password: "••••",
};
