import { describe, expect, it } from "vitest";
import { celExamplesFor, explainCelError } from "./celExpression";

const OTEL_TAGS = JSON.stringify([
  { key: "host.arch", type: "string", value: "amd64" },
  { key: "host.name", type: "string", value: "activemq-848946d5d6-qg2hd" },
  // The real row carried a JVM command line here; its length is the point —
  // the engine interpolates the whole value into the message it reports.
  { key: "process.command_line", type: "string", value: `/usr/local/openjdk-8/bin/java ${"-Dactivemq.conf=/opt/activemq/conf ".repeat(20)}` },
]);

/** The error the engine actually produced for `row["process.tags"].JSON()`. */
const ARRAY_ERROR = `Unable to unmarshal object ${OTEL_TAGS}: yaml: unmarshal errors:\n  line 1: cannot unmarshal !!seq into map[string]interface {}`;

describe("celExamplesFor", () => {
  const accessor = 'row["process.tags"].JSONArray()';

  it("folds a key/value list into a map rather than indexing a filter", () => {
    const examples = celExamplesFor(accessor, OTEL_TAGS);

    // Indexing an empty filter result is a hard error in CEL; a missing map key
    // is not. The fold is also what gomplate's own reference documents.
    expect(examples.map((example) => example.expression)).toContain(
      `dyn(${accessor}).fold(e, acc, merge(acc, {e.key: e.value}))["host.arch"]`,
    );
    expect(examples.some((example) => example.expression.includes(".filter("))).toBe(false);
  });

  it("names a key from the sample so the example runs as written", () => {
    expect(celExamplesFor(accessor, OTEL_TAGS)[0]).toEqual({
      label: "Read host.arch",
      expression: `dyn(${accessor}).fold(e, acc, merge(acc, {e.key: e.value}))["host.arch"]`,
    });
  });

  // A folded map is a map[ref.Val]ref.Val, which the response cannot encode —
  // the expression compiles and then fails at the wire. Indexing one yields a
  // scalar, so only the standalone map needs encoding.
  it("encodes a folded map, but not a value read out of one", () => {
    const [read, fold] = celExamplesFor(accessor, OTEL_TAGS);

    expect(fold?.expression.endsWith(".toJSON()")).toBe(true);
    expect(read?.expression).not.toContain(".toJSON()");
  });

  // Every binding is declared `any`, so a comprehension range needs dyn().
  it("wraps every comprehension range in dyn()", () => {
    for (const value of [OTEL_TAGS, JSON.stringify([{ name: "a" }])]) {
      for (const { expression } of celExamplesFor(accessor, value)) {
        if (/\.(map|filter|fold)\(/.test(expression)) {
          expect(expression).toContain(`dyn(${accessor})`);
        }
      }
    }
  });

  it("offers list examples for a plain array and object examples for a map", () => {
    const list = celExamplesFor("row.refs", JSON.stringify([{ name: "a" }]));
    expect(list.map((e) => e.label)).toEqual([
      "Take the first entry",
      "Count the entries",
      "Pull name from each",
      "Keep the whole list",
    ]);

    const object = celExamplesFor("row.meta", JSON.stringify({ status: "OPEN" }));
    expect(object.map((e) => e.expression)).toContain("row.meta.status");
  });

  it("falls back to scalar examples, scaling only a number", () => {
    expect(celExamplesFor("row.name", "activemq").map((e) => e.label)).toEqual([
      "Read it",
      "Convert to text",
    ]);
    expect(celExamplesFor("row.duration", 397).map((e) => e.label)).toContain("Scale by 1,000");
  });
});

describe("explainCelError", () => {
  it("names the decoder the value needs, and offers the one-word repair", () => {
    const hint = explainCelError(ARRAY_ERROR, 'row["process.tags"].JSON()');

    expect(hint.message).toContain("JSONArray()");
    expect(hint.fix).toBe('row["process.tags"].JSONArray()');
  });

  it("explains the opposite mistake too", () => {
    const hint = explainCelError(
      "Unable to unmarshal array {...}: yaml: unmarshal errors:\n  line 1: cannot unmarshal !!map into []interface {}",
      "row.meta.JSONArray()",
    );

    expect(hint.message).toContain("JSON()");
    expect(hint.fix).toBe("row.meta.JSON()");
  });

  // The engine interpolates the whole offending value into its message, which
  // is what buried the one sentence that mattered.
  it("keeps both ends of the raw error and elides the value between them", () => {
    const hint = explainCelError(ARRAY_ERROR, 'row["process.tags"].JSON()');

    expect(ARRAY_ERROR.length).toBeGreaterThan(800);
    expect(hint.raw.length).toBeLessThanOrEqual(240);
    // The operation that failed and the failure itself both survive; only the
    // payload between them is dropped.
    expect(hint.raw).toContain("Unable to unmarshal object");
    expect(hint.raw).toContain("!!seq");
    expect(hint.raw).toContain("…");
  });

  it("passes an error it cannot improve on straight through", () => {
    const hint = explainCelError("undeclared reference to 'nope'", "nope");

    expect(hint.message).toBe("undeclared reference to 'nope'");
    expect(hint.fix).toBeUndefined();
  });
});
