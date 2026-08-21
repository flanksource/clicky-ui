import type { JsonSchemaObject, JsonSchemaProperty } from "@flanksource/clicky-ui";

export type ObjectArrayRoute = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  upstream: string;
  timeout: number;
  retries: number;
  auth: boolean;
  rewrite: string;
  notes: string;
};

const ROUTE_ITEM: JsonSchemaProperty = {
  type: "object",
  required: ["path", "upstream"],
  properties: {
    path: {
      type: "string",
      title: "Path",
      description: "Request path this route matches, e.g. /api/v1/users.",
    },
    method: {
      type: "string",
      title: "Method",
      description: "HTTP method the route is bound to.",
      enum: ["GET", "POST", "PUT", "DELETE"],
      "x-enum-tones": { GET: "teal", POST: "violet", PUT: "amber", DELETE: "rose" },
      "x-enum-display": "combobox",
    },
    upstream: {
      type: "string",
      title: "Upstream",
      description: "Host and port the request is proxied to.",
    },
    timeout: {
      type: "integer",
      title: "Timeout",
      minimum: 0,
      description: "Seconds before the upstream call is abandoned.",
    },
    retries: {
      type: "integer",
      title: "Retries",
      minimum: 0,
      description: "How many times a failed call is retried.",
    },
    auth: {
      type: "boolean",
      title: "Requires auth",
      description: "Reject the request when no valid token is presented.",
    },
    rewrite: {
      type: "string",
      title: "Rewrite",
      description: "Path template applied before proxying.",
      "x-col-span": "full",
    },
    notes: {
      type: "string",
      title: "Notes",
      description: "Free-form note kept with the route.",
      "x-col-span": "full",
    },
  },
};

export const OBJECT_ARRAY_SCHEMA: JsonSchemaObject = {
  type: "object",
  properties: {
    routes: {
      type: "array",
      title: "Routes",
      description: "Routes this gateway serves.",
      items: ROUTE_ITEM,
      "x-array-display": "accordion",
      "x-item": {
        title: ["path"],
        fallback: "New route",
        summary: [{ property: "upstream" }],
        glyph: "method",
        badge: "method",
        flag: "auth",
        noun: "route",
        nounPlural: "routes",
      },
    },
  },
};

export const OBJECT_ARRAY_ROUTES: ObjectArrayRoute[] = [
  {
    path: "/api/v1/users",
    method: "GET",
    upstream: "users-svc:8080",
    timeout: 30,
    retries: 2,
    auth: true,
    rewrite: "/v1/users",
    notes: "Read path; safe to retry.",
  },
  {
    path: "/api/v1/events",
    method: "POST",
    upstream: "events-svc:8080",
    timeout: 10,
    retries: 0,
    auth: true,
    rewrite: "",
    notes: "Writes are not retried.",
  },
  {
    path: "/healthz",
    method: "GET",
    upstream: "gateway:8081",
    timeout: 2,
    retries: 0,
    auth: false,
    rewrite: "",
    notes: "",
  },
];
