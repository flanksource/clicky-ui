import { describe, expect, it } from "vitest";
import { EVALUATION_GRAPH } from "../fixtures/classes";
import {
  BUILT_IN_EXPRESSION_PRESETS,
  EXPRESSION_HISTORY_LIMIT,
  evaluationGraph,
  evaluationRawText,
  ognlExpressionForNode,
  pushExpressionHistory,
} from "./expressions";

describe("pushExpressionHistory", () => {
  it("puts the newest expression first and moves a repeat to the front instead of duplicating it", () => {
    expect(pushExpressionHistory(["b", "a"], "a")).toEqual(["a", "b"]);
    expect(pushExpressionHistory(["b"], "a")).toEqual(["a", "b"]);
  });

  it("keeps at most the limit, dropping the oldest", () => {
    const full = Array.from({ length: EXPRESSION_HISTORY_LIMIT }, (_, index) => `expr-${index}`);
    const next = pushExpressionHistory(full, "fresh");
    expect(next).toHaveLength(EXPRESSION_HISTORY_LIMIT);
    expect(next[0]).toBe("fresh");
    expect(next).not.toContain(`expr-${EXPRESSION_HISTORY_LIMIT - 1}`);
  });

  it("does not mutate its input and refuses a blank expression", () => {
    const history = ["a"];
    pushExpressionHistory(history, "b");
    expect(history).toEqual(["a"]);
    expect(() => pushExpressionHistory(history, "  \n")).toThrow(/blank/);
  });
});

describe("ognlExpressionForNode", () => {
  it.each([
    ["@java.lang.Runtime@getRuntime()", ".availableProcessors", "(@java.lang.Runtime@getRuntime()).availableProcessors"],
    ["#root", '["items"][0]', '(#root)["items"][0]'],
    ["#root", undefined, "#root"],
    ["#root", "", "#root"],
  ])("drills %s by path %s", (expression, path, expected) => {
    expect(ognlExpressionForNode(expression, path === undefined ? {} : { path })).toBe(expected);
  });
});

describe("evaluationGraph", () => {
  it("accepts a graph in ObjectGraphNode shape and returns it unchanged", () => {
    expect(evaluationGraph(EVALUATION_GRAPH)).toBe(EVALUATION_GRAPH);
  });

  it("is undefined when the evaluation has no graph", () => {
    expect(evaluationGraph(undefined)).toBeUndefined();
  });

  it.each([
    ["a string", "oops"],
    ["a node without an id", { label: "x" }],
    ["a node without a label", { id: "x" }],
    ["a nested child that is malformed", { id: "r", label: "r", children: [{ id: "c" }] }],
    ["children that is not an array", { id: "r", label: "r", children: "none" }],
  ])("rejects %s with an error naming the node", (_name, graph) => {
    expect(() => evaluationGraph(graph)).toThrow(/object graph/i);
  });
});

describe("evaluationRawText", () => {
  it("prints the plain value as indented JSON", () => {
    expect(evaluationRawText({ value: { a: 1 } })).toBe('{\n  "a": 1\n}');
  });

  it("falls back to the graph when there is no plain value", () => {
    expect(evaluationRawText({ graph: { id: "r", label: "r" } })).toBe('{\n  "id": "r",\n  "label": "r"\n}');
  });

  it("prints a null value as null rather than as no result", () => {
    expect(evaluationRawText({ value: null })).toBe("null");
  });

  it("is empty when the evaluation produced neither", () => {
    expect(evaluationRawText({ stdout: "hi" })).toBe("");
  });
});

describe("built-in presets", () => {
  it("are generic OGNL expressions with unique labels", () => {
    expect(BUILT_IN_EXPRESSION_PRESETS.map((preset) => [preset.label, preset.expression, preset.language])).toEqual([
      ["System properties", "@java.lang.System@getProperties()", "ognl"],
      ["Runtime", "@java.lang.Runtime@getRuntime()", "ognl"],
      ["Threads", "@java.lang.Thread@getAllStackTraces().keySet()", "ognl"],
    ]);
  });
});
