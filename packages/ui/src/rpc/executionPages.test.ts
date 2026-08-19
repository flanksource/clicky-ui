import { describe, expect, it } from "vitest";

import { mergeExecutionPages } from "./executionPages";
import type { ClickyNode, ClickyRow } from "../data/Clicky";
import type { ExecutionResponse } from "./types";

function row(name: string): ClickyRow {
  return { cells: { name: { kind: "text", text: name, plain: name } } };
}

function tableNode(names: string[]): ClickyNode {
  return {
    kind: "table",
    columns: [{ name: "name", label: "Name" }],
    rows: names.map(row),
  };
}

/** A page as the executor hands it over: the document in `parsed`, its bytes in
 *  `stdout`, and the paging facts the headers carried. */
function page(
  node: ClickyNode,
  overrides: Partial<ExecutionResponse> = {},
): ExecutionResponse {
  const document = { version: 1 as const, node };
  return {
    success: true,
    exit_code: 0,
    contentType: "application/json",
    parsed: document,
    stdout: JSON.stringify(document),
    ...overrides,
  };
}

function mergedRowNames(response: ExecutionResponse | null): string[] {
  const node = (response?.parsed as { node: ClickyNode } | undefined)?.node;
  const table = node?.kind === "table" ? node : node?.fields?.[0]?.value;
  return (table?.rows ?? []).map((item) => item.cells.name?.plain ?? "");
}

describe("mergeExecutionPages", () => {
  it("returns the single page untouched so a one-page walk is byte-identical", () => {
    const only = page(tableNode(["a"]));
    expect(mergeExecutionPages([only])).toBe(only);
  });

  it("has nothing to render for an empty walk", () => {
    expect(mergeExecutionPages([])).toBeNull();
  });

  it("appends every page's rows in walk order", () => {
    const merged = mergeExecutionPages([
      page(tableNode(["a", "b"])),
      page(tableNode(["c", "d"])),
      page(tableNode(["e"])),
    ]);

    expect(mergedRowNames(merged)).toEqual(["a", "b", "c", "d", "e"]);
    // The bytes have to agree with the object: CommandOutput prefers `parsed`
    // but the Raw view reads `stdout`, and a disagreement shows one page in one
    // tab and five in the other.
    expect(JSON.parse(merged?.stdout ?? "null")).toEqual(merged?.parsed);
  });

  it("finds the table wherever the document nests it", () => {
    const wrap = (names: string[]): ClickyNode => ({
      kind: "map",
      fields: [{ name: "Data", value: tableNode(names) }],
    });

    expect(mergedRowNames(mergeExecutionPages([page(wrap(["a"])), page(wrap(["b"]))]))).toEqual([
      "a",
      "b",
    ]);
  });

  it("reports the newest page's paging facts and the walk's opening request", () => {
    const merged = mergeExecutionPages([
      page(tableNode(["a"]), {
        requestUrl: "/api/v1/events?limit=2",
        pagination: { total: 5, limit: 2, hasMore: true, nextCursor: "after-2" },
      }),
      page(tableNode(["b"]), {
        requestUrl: "/api/v1/events?limit=2&cursor=after-2",
        pagination: { total: 5, limit: 2, hasMore: false },
      }),
    ]);

    expect(merged?.pagination).toEqual({ total: 5, limit: 2, hasMore: false });
    // A download re-requests this URL, and the walk's identity is the request
    // that named the query without naming a position inside it.
    expect(merged?.requestUrl).toBe("/api/v1/events?limit=2");
  });

  // Silently dropping the page would delete rows the reader already scrolled
  // past, which is worse than the surface saying it cannot stack these two.
  it("refuses to merge a page that carries no table", () => {
    expect(() =>
      mergeExecutionPages([
        page(tableNode(["a"])),
        page({ kind: "text", text: "no rows", plain: "no rows" }),
      ]),
    ).toThrow(/table/i);
  });

  // A non-tabular walk has nothing to accumulate into; the newest document is
  // the whole of what there is to show.
  it("shows the newest page when the walk is not tabular at all", () => {
    const last = page({ kind: "text", text: "second", plain: "second" });
    expect(
      mergeExecutionPages([page({ kind: "text", text: "first", plain: "first" }), last]),
    ).toBe(last);
  });
});
