import { describe, expect, it } from "vitest";

import { OBJECT_ARRAY_ROUTES, OBJECT_ARRAY_SCHEMA } from "./object-array-data";

describe("object array pattern", () => {
  it("extracts variant B's accordion and identity-rich item summaries", () => {
    expect(OBJECT_ARRAY_SCHEMA.properties?.routes).toMatchObject({
      type: "array",
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
    });
  });

  it("ships enough realistic rows to demonstrate collapsed-list scanning", () => {
    expect(OBJECT_ARRAY_ROUTES.map(({ path, method, upstream }) => ({ path, method, upstream }))).toEqual([
      { path: "/api/v1/users", method: "GET", upstream: "users-svc:8080" },
      { path: "/api/v1/events", method: "POST", upstream: "events-svc:8080" },
      { path: "/healthz", method: "GET", upstream: "gateway:8081" },
    ]);
  });
});
