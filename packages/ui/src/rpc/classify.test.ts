import { describe, expect, it } from "vitest";
import {
  filterOperationsByDomain,
  findDetailEndpoint,
  findDetailEndpointForList,
  findListEndpoint,
  normalizeRows,
  parseJsonBody,
} from "./classify";
import type { ResolvedOperation } from "./types";

function op(
  path: string,
  method: string,
  overrides: Partial<ResolvedOperation["operation"]> = {},
): ResolvedOperation {
  return {
    path,
    method,
    operation: { responses: {}, ...overrides },
  };
}

describe("findListEndpoint", () => {
  it("returns the GET with operationId `<entity>_list` matching an entity", () => {
    const ops = [
      op("/policy", "get", { operationId: "policy_get" }),
      op("/policy", "get", { operationId: "policy_list" }),
      op("/activity", "get", { operationId: "activity_list" }),
    ];
    expect(findListEndpoint(ops, ["policy"])?.operation.operationId).toBe("policy_list");
  });

  it("returns undefined when no matching list op exists", () => {
    const ops = [op("/policy", "get", { operationId: "policy_get" })];
    expect(findListEndpoint(ops, ["policy"])).toBeUndefined();
  });

  it("returns undefined for an empty entity list", () => {
    const ops = [op("/p", "get", { operationId: "p_list" })];
    expect(findListEndpoint(ops, [])).toBeUndefined();
  });
});

describe("findDetailEndpoint", () => {
  it("returns the first GET with a path parameter", () => {
    const ops = [
      op("/policy", "get"),
      op("/policy/{id}", "get", {
        parameters: [{ name: "id", in: "path" }],
      }),
    ];
    expect(findDetailEndpoint(ops)?.path).toBe("/policy/{id}");
  });

  it("recognises positional args", () => {
    const ops = [
      op("/activity", "get", {
        parameters: [{ name: "args", in: "query" }],
      }),
    ];
    expect(findDetailEndpoint(ops)).toBeDefined();
  });
});

describe("findDetailEndpointForList", () => {
  it("prefers the detail route that belongs to the resolved list path", () => {
    const list = op("/api/v1/widgets", "get", {
      operationId: "widget_list",
      tags: ["widget"],
    });
    const ops = [
      op("/api/v1/admin/widgets/{id}", "get", {
        operationId: "admin_widget_get",
        tags: ["widget"],
        parameters: [{ name: "id", in: "path" }],
      }),
      list,
      op("/api/v1/widgets/{id}", "get", {
        operationId: "widget_get",
        tags: ["widget"],
        parameters: [{ name: "id", in: "path" }],
      }),
    ];

    expect(findDetailEndpointForList(ops, list)?.operation.operationId).toBe("widget_get");
  });
});

describe("parseJsonBody", () => {
  it("parses stdout JSON", () => {
    expect(
      parseJsonBody({ success: true, exit_code: 0, stdout: '{"a":1}' }),
    ).toEqual({ a: 1 });
  });

  it("returns null on empty or invalid JSON", () => {
    expect(parseJsonBody({ success: true, exit_code: 0, stdout: "" })).toBeNull();
    expect(parseJsonBody({ success: true, exit_code: 0, stdout: "not json" })).toBeNull();
    expect(parseJsonBody(undefined)).toBeNull();
  });
});

describe("normalizeRows", () => {
  it("returns arrays directly", () => {
    expect(normalizeRows([{ a: 1 }])).toEqual([{ a: 1 }]);
  });

  it("extracts the first array-valued field from an object", () => {
    expect(normalizeRows({ items: [{ a: 1 }], count: 1 })).toEqual([{ a: 1 }]);
  });

  it("returns empty array for unrecognised shapes", () => {
    expect(normalizeRows(null)).toEqual([]);
    expect(normalizeRows({ a: 1 })).toEqual([]);
  });
});

describe("filterOperationsByDomain", () => {
  it("matches on tag intersection", () => {
    const ops = [
      op("/a", "get", { tags: ["policy"] }),
      op("/b", "get", { tags: ["activity"] }),
      op("/c", "get", { tags: ["user"] }),
    ];
    expect(filterOperationsByDomain(ops, ["policy", "activity"]).map((o) => o.path)).toEqual([
      "/a",
      "/b",
    ]);
  });

  it("returns empty array when entities is empty", () => {
    expect(filterOperationsByDomain([op("/a", "get", { tags: ["policy"] })], [])).toEqual([]);
  });
});
