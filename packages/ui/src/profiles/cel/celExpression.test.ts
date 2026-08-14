import { afterEach, describe, expect, it, vi } from "vitest";

import {
  bindingsFor,
  coverage,
  evaluateCel,
  isClean,
  isIdentifier,
  nextBarren,
  unreachableKeys,
  type CelResult,
} from "./celExpression";
import { configureProfiles, type ProfileSchema } from "../profileApi";

const results = (...entries: Omit<CelResult, "index">[]): CelResult[] =>
  entries.map((entry, index) => ({ index, ...entry }));

const SCHEMA = { type: "object", properties: {} } as unknown as ProfileSchema;

describe("the expression backend", () => {
  afterEach(() => {
    configureProfiles({ schema: SCHEMA });
    vi.unstubAllGlobals();
  });

  it("posts to the configured profile mount when the host supplies no evaluator", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    configureProfiles({ schema: SCHEMA, basePath: "/query/api" });

    await evaluateCel({ cel: "row.a", scope: "row", rows: [{ a: 1 }] });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/query/api/profile/sample/expression");
  });

  // The editor is the same component wherever it renders; the engine behind it
  // is the host's, so a host evaluating expressions somewhere else replaces the
  // call rather than the editor.
  it("hands the request to the host's evaluator instead, when one is configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const celEvaluator = vi.fn().mockResolvedValue({ results: [{ index: 0, value: 1, type: "int" }] });
    configureProfiles({ schema: SCHEMA, celEvaluator });

    const response = await evaluateCel({ cel: "row.a", scope: "row", rows: [{ a: 1 }] });

    expect(celEvaluator).toHaveBeenCalledWith({ cel: "row.a", scope: "row", rows: [{ a: 1 }] });
    expect(response.results).toEqual([{ index: 0, value: 1, type: "int" }]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("coverage", () => {
  it("counts a row the expression read nothing from apart from one that worked", () => {
    const found = coverage(results({ value: 5006, type: "int" }, { value: null, type: "null" }));

    expect(found.ok).toBe(1);
    expect(found.empty).toBe(1);
    expect(found.failed).toBe(0);
  });

  // The engine does not throw on an out-of-range index — it reads as null — so an
  // expression that is wrong about most of the data still returns cleanly.
  it("does not count a null as a success", () => {
    const found = coverage(results({ value: null }, { value: null }, { value: 31, type: "int" }));

    expect(found.ok).toBe(1);
    expect(isClean(found)).toBe(false);
  });

  it("separates an evaluation failure from an empty reading", () => {
    const found = coverage(results({ error: "undeclared reference to 'nope'" }, { value: null }));

    expect(found.failed).toBe(1);
    expect(found.empty).toBe(1);
  });

  it("reports the distinct types produced, so a mixed column is visible", () => {
    const found = coverage(results({ value: 1, type: "int" }, { value: "x", type: "string" }));

    expect(found.types).toEqual(["int", "string"]);
  });

  it("is clean only when every sampled row produced a value", () => {
    expect(isClean(coverage(results({ value: 1, type: "int" }, { value: 2, type: "int" })))).toBe(true);
  });

  it("treats an undefined value as empty, not as a success", () => {
    expect(coverage(results({ type: "null" })).empty).toBe(1);
  });
});

describe("nextBarren", () => {
  const found = coverage(results({ value: 1 }, { value: null }, { value: 3 }, { error: "boom" }));

  it("jumps to the next row that produced nothing", () => {
    expect(nextBarren(found, 0)).toBe(1);
  });

  it("wraps past the last one", () => {
    expect(nextBarren(found, 3)).toBe(1);
  });

  it("has nowhere to go when every row evaluated", () => {
    expect(nextBarren(coverage(results({ value: 1 })), 0)).toBeUndefined();
  });
});

describe("bindingsFor", () => {
  const row = { timestamp: "10:31:02", message: "boom", "@timestamp": 1, "kubernetes.pod": "api" };

  it("binds the row's own identifier keys bare, alongside row and span", () => {
    const names = bindingsFor("row", row).map((binding) => binding.name);

    expect(names).toContain("row");
    expect(names).toContain("span");
    expect(names).toContain("message");
  });

  it("omits a key that is not a valid identifier rather than offering a name that will not compile", () => {
    const names = bindingsFor("row", row).map((binding) => binding.name);

    expect(names).not.toContain("@timestamp");
    expect(names).not.toContain("kubernetes.pod");
    expect(unreachableKeys(row)).toEqual(["@timestamp", "kubernetes.pod"]);
  });

  it("carries the row's value so the palette can show what each name holds", () => {
    expect(bindingsFor("row", row).find((binding) => binding.name === "message")?.value).toBe("boom");
  });

  it("offers the batch bindings, and none of the row's fields, in the batch scope", () => {
    const names = bindingsFor("batch", row).map((binding) => binding.name);

    expect(names).toEqual(["batch", "first", "last", "count", "row"]);
  });

  it("offers prev and index in the boundary scope", () => {
    expect(bindingsFor("boundary", row).map((binding) => binding.name)).toEqual(["row", "prev", "index"]);
  });

  it("still offers the fixed bindings before anything has been sampled", () => {
    expect(bindingsFor("row", undefined).map((binding) => binding.name)).toEqual(["row", "span"]);
  });
});

describe("isIdentifier", () => {
  it("matches the engine's rule for flattening a row key", () => {
    expect(isIdentifier("stack_depth")).toBe(true);
    expect(isIdentifier("_private")).toBe(true);
    expect(isIdentifier("2fast")).toBe(false);
    expect(isIdentifier("@timestamp")).toBe(false);
  });
});
