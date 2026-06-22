import { describe, expect, it } from "vitest";
import { resolveLookupScope } from "./form-lookup-context";
import type { LookupDescriptor } from "./json-schema-form-types";

const base: LookupDescriptor = { url: "/api/v1/connection", filter: "connection" };

describe("resolveLookupScope", () => {
  it("returns no params when the descriptor has no scope", () => {
    expect(resolveLookupScope(base, { provider: { type: "postgres" } })).toEqual({});
  });

  it("maps the source field value to the joined param", () => {
    const descriptor: LookupDescriptor = {
      ...base,
      scope: {
        param: "types",
        from: "provider.type",
        map: { sql: ["postgres", "mysql", "sql_server", "clickhouse"] },
      },
    };
    expect(resolveLookupScope(descriptor, { provider: { type: "sql" } })).toEqual({
      types: "postgres,mysql,sql_server,clickhouse",
    });
  });

  it("sends the raw source value when no map is given", () => {
    const descriptor: LookupDescriptor = {
      ...base,
      scope: { param: "type", from: "provider.type" },
    };
    expect(resolveLookupScope(descriptor, { provider: { type: "postgres" } })).toEqual({
      type: "postgres",
    });
  });

  it("returns no params when the source field is unset or unmapped", () => {
    const descriptor: LookupDescriptor = {
      ...base,
      scope: { param: "types", from: "provider.type", map: { sql: ["postgres"] } },
    };
    expect(resolveLookupScope(descriptor, {})).toEqual({});
    // a value absent from the map yields no scope (rather than an empty filter)
    expect(resolveLookupScope(descriptor, { provider: { type: "redis" } })).toEqual({});
  });
});
