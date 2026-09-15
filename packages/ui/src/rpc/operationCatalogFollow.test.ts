import { describe, expect, it } from "vitest";
import type { ClickyDocument, ClickyRow } from "../data/Clicky";
import type {
  ClickyParameterRole,
  ExecutionResponse,
  OpenAPIParameter,
  ResolvedOperation,
} from "./types";
import {
  deriveLogTailTarget,
  findSessionStartOperation,
  followRowIdentity,
  followRowOrder,
  followSessionParams,
  mergeFollowRowsIntoResponse,
  partitionFollowRows,
} from "./operationCatalogFollow";

const LIST_PATH = "/api/v1/profile/profile-trace-results-jvm-trace";

function param(name: string, role?: ClickyParameterRole): OpenAPIParameter {
  return {
    name,
    in: "query",
    schema: { type: "string" },
    ...(role ? { "x-clicky": { role } } : {}),
  };
}

// A presented ClickyRow, the shape commons-db's typed presenter now sends as
// `clickyRow` on every follow event — the same shape `node.rows[n]` carries
// in the list's own document.
function clickyRow(cells: Record<string, { plain?: string; filterValue?: unknown }>): ClickyRow {
  return {
    cells: Object.fromEntries(
      Object.entries(cells).map(([name, value]) => [name, { kind: "text" as const, ...value }]),
    ),
  };
}

describe("followSessionParams", () => {
  const listParameters: OpenAPIParameter[] = [
    param("stream", "filter"),
    param("status", "filter"),
    param("q", "search"),
    param("limit", "limit"),
    param("offset", "offset"),
    param("cursor", "cursor"),
    param("sort", "sort"),
    param("order", "order"),
  ];

  it("keeps scoping parameters (locked values, filters, search) with a value", () => {
    expect(
      followSessionParams(listParameters, { stream: "abc123", status: "open", q: "needle" }),
    ).toEqual({ stream: "abc123", status: "open", q: "needle" });
  });

  it("drops paging/sort/cursor roles even when they carry a value", () => {
    expect(
      followSessionParams(listParameters, {
        stream: "abc123",
        limit: "50",
        offset: "100",
        cursor: "opaque",
        sort: "seq",
        order: "asc",
      }),
    ).toEqual({ stream: "abc123" });
  });

  it("omits a scoping parameter that carries no value", () => {
    expect(followSessionParams(listParameters, { status: "" })).toEqual({});
  });
});

describe("findSessionStartOperation", () => {
  const listEndpoint: ResolvedOperation = {
    path: LIST_PATH,
    method: "get",
    operation: {},
  };
  const sessionOperation: ResolvedOperation = {
    path: `${LIST_PATH}/sessions`,
    method: "post",
    operation: { operationId: "start-profile-trace-results-jvm-trace-session" },
  };

  it("finds the POST <listPath>/sessions operation", () => {
    expect(
      findSessionStartOperation([listEndpoint, sessionOperation], listEndpoint),
    ).toBe(sessionOperation);
  });

  it("matches the method case-insensitively", () => {
    const upper: ResolvedOperation = { ...sessionOperation, method: "POST" };
    expect(findSessionStartOperation([listEndpoint, upper], listEndpoint)).toBe(upper);
  });

  it("returns undefined when no matching operation is advertised", () => {
    expect(findSessionStartOperation([listEndpoint], listEndpoint)).toBeUndefined();
  });

  it("returns undefined when there is no list endpoint to follow", () => {
    expect(findSessionStartOperation([listEndpoint, sessionOperation], undefined)).toBeUndefined();
  });

  it("does not match a sessions path under a different profile", () => {
    const otherSessions: ResolvedOperation = {
      path: "/api/v1/profile/profile-trace-results-sql-xevent/sessions",
      method: "post",
      operation: {},
    };
    expect(findSessionStartOperation([listEndpoint, otherSessions], listEndpoint)).toBeUndefined();
  });
});

describe("deriveLogTailTarget", () => {
  it("splits a profile path into basePath and profile name", () => {
    expect(deriveLogTailTarget(LIST_PATH)).toEqual({
      basePath: "/api/v1",
      profile: "profile-trace-results-jvm-trace",
    });
  });

  it("returns undefined for a path with no /profile/ segment", () => {
    expect(deriveLogTailTarget("/api/v1/widgets")).toBeUndefined();
  });

  it("returns undefined when the profile segment is empty", () => {
    expect(deriveLogTailTarget("/api/v1/profile/")).toBeUndefined();
  });
});

describe("followRowIdentity", () => {
  it("prefers the conventional id columns", () => {
    const row = clickyRow({ _id: { plain: "a1" }, seq: { plain: "3", filterValue: 3 } });
    expect(followRowIdentity(row)).toBe("a1");
  });

  it("falls back to a seq column when there is no id column", () => {
    const row = clickyRow({
      seq: { plain: "7", filterValue: 7 },
      status: { plain: "open" },
    });
    expect(followRowIdentity(row)).toBe("seq:7");
  });

  it("returns undefined when neither an id nor a seq column is present", () => {
    const row = clickyRow({ status: { plain: "open" } });
    expect(followRowIdentity(row)).toBeUndefined();
  });
});

describe("followRowOrder", () => {
  it("keeps the newest row first for descending or unset sort", () => {
    expect(followRowOrder("desc")).toBe("newest-first");
    expect(followRowOrder(undefined)).toBe("newest-first");
  });

  it("appends at the tail for ascending sort", () => {
    expect(followRowOrder("asc")).toBe("oldest-first");
  });
});

describe("partitionFollowRows", () => {
  it("keeps only the rows that carried a presented ClickyRow", () => {
    const a1 = clickyRow({ _id: { plain: "a1" } });
    const partition = partitionFollowRows(
      [{ _id: "a1" }, { _id: "a2" }],
      [a1, undefined],
    );
    expect(partition.rows).toEqual([a1]);
    expect(partition.missingClickyRow).toBe(true);
  });

  it("reports no missing row when every entry carried one", () => {
    const a1 = clickyRow({ _id: { plain: "a1" } });
    const a2 = clickyRow({ _id: { plain: "a2" } });
    const partition = partitionFollowRows([{ _id: "a1" }, { _id: "a2" }], [a1, a2]);
    expect(partition.rows).toEqual([a1, a2]);
    expect(partition.missingClickyRow).toBe(false);
  });

  it("is vacuously clean on no rows", () => {
    expect(partitionFollowRows([], [])).toEqual({ rows: [], missingClickyRow: false });
  });
});

function tableResponse(rows: ClickyRow[]): ExecutionResponse {
  const document: ClickyDocument = {
    version: 1,
    node: { kind: "table", columns: [{ name: "_id" }, { name: "seq" }], rows },
  };
  return {
    success: true,
    exit_code: 0,
    parsed: document,
    stdout: JSON.stringify(document),
  };
}

const rowA1 = clickyRow({ _id: { plain: "a1" }, seq: { plain: "1", filterValue: 1 } });
const rowA2 = clickyRow({ _id: { plain: "a2" }, seq: { plain: "2", filterValue: 2 } });
const rowA3 = clickyRow({ _id: { plain: "a3" }, seq: { plain: "3", filterValue: 3 } });

describe("mergeFollowRowsIntoResponse", () => {
  it("folds fresh presented rows in newest-first order, de-duplicated against the page", () => {
    const result = mergeFollowRowsIntoResponse(tableResponse([rowA1]), [rowA1, rowA2], "newest-first");
    expect(result).toBeDefined();
    expect(result?.addedCount).toBe(1);
    const merged = result!.response.parsed as ClickyDocument;
    expect((merged.node.rows ?? []).map((row) => row.cells._id?.plain)).toEqual(["a2", "a1"]);
  });

  it("appends fresh presented rows at the tail in oldest-first order", () => {
    const result = mergeFollowRowsIntoResponse(tableResponse([rowA1]), [rowA2, rowA3], "oldest-first");
    const merged = result!.response.parsed as ClickyDocument;
    expect((merged.node.rows ?? []).map((row) => row.cells._id?.plain)).toEqual([
      "a1",
      "a2",
      "a3",
    ]);
  });

  it("returns undefined when every live row is already on the page", () => {
    const result = mergeFollowRowsIntoResponse(tableResponse([rowA1, rowA2]), [rowA1, rowA2]);
    expect(result).toBeUndefined();
  });

  it("returns undefined when there is no response or no live rows yet", () => {
    expect(mergeFollowRowsIntoResponse(null, [rowA1])).toBeUndefined();
    expect(mergeFollowRowsIntoResponse(tableResponse([rowA1]), [])).toBeUndefined();
  });

  it("throws when the response carries no table to merge into", () => {
    const notATable: ExecutionResponse = {
      success: true,
      exit_code: 0,
      parsed: { version: 1, node: { kind: "text", plain: "no table here" } },
      stdout: "",
    };
    expect(() => mergeFollowRowsIntoResponse(notATable, [rowA1])).toThrow(/carries no table/);
  });

  it("never mutates the rows already on the page", () => {
    const base = tableResponse([rowA1, rowA3]);
    mergeFollowRowsIntoResponse(base, [rowA2]);
    const originalDocument = base.parsed as ClickyDocument;
    expect((originalDocument.node.rows ?? []).map((row) => row.cells._id?.plain)).toEqual([
      "a1",
      "a3",
    ]);
  });
});
