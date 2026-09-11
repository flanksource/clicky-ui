import { describe, expect, it } from "vitest";
import { celExamplesFor } from "./celExamples";
import { explainCelError } from "./celExpression";

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

  // Object.keys of a string is its character indices, which offered
  // `.map(e, e.0)` — an expression that does not compile.
  it("indexes a map key CEL cannot name, rather than dotting it", () => {
    expect(celExamplesFor("row.meta", { "@id": "x" }).slice(0, 2)).toEqual([
      { label: "Read @id", expression: 'row.meta["@id"]' },
      { label: "Default @id when missing", expression: '"@id" in row.meta ? row.meta["@id"] : ""' },
    ]);
  });

  it("offers no field to pull from a list of scalars", () => {
    expect(celExamplesFor("row.groups", ["OM Super", "Web Service"]).map((e) => e.label)).toEqual([
      "Take the first entry",
      "Count the entries",
      "Keep the whole list",
    ]);
  });
});

// A filter or an authorization matcher selects rows, so the engine refuses an
// expression that returns anything but a bool: every example has to be a test.
describe("celExamplesFor a predicate", () => {
  const predicate = { predicate: true };

  it.each([
    [
      "a list of scalars, by membership and emptiness",
      "groups",
      ["OM Super", "Web Service"],
      [
        { label: "Contains OM Super", expression: '"OM Super" in groups' },
        { label: "Is not empty", expression: "size(groups) > 0" },
        { label: "Is empty", expression: "size(groups) == 0" },
      ],
    ],
    [
      "a string, by equality",
      "user",
      "admin",
      [
        { label: "Is admin", expression: 'user == "admin"' },
        { label: "Is not admin", expression: 'user != "admin"' },
      ],
    ],
    [
      "a number, by equality",
      "row.duration",
      397,
      [
        { label: "Is 397", expression: "row.duration == 397" },
        { label: "Is not 397", expression: "row.duration != 397" },
      ],
    ],
    [
      "a bool, as itself",
      "row.enabled",
      true,
      [
        { label: "Is true", expression: "row.enabled" },
        { label: "Is false", expression: "!row.enabled" },
      ],
    ],
    [
      "a map, by the presence of a key",
      "row.meta",
      { status: "OPEN" },
      [
        { label: "Has status", expression: "has(row.meta.status)" },
        { label: "Is not empty", expression: "size(row.meta) > 0" },
      ],
    ],
    [
      "a map, by the presence of a key it has to quote",
      "row.meta",
      { "@id": "x" },
      [
        { label: "Has @id", expression: '"@id" in row.meta' },
        { label: "Is not empty", expression: "size(row.meta) > 0" },
      ],
    ],
  ])("tests %s", (_label, accessor, value, expected) => {
    expect(celExamplesFor(accessor, value, predicate)).toEqual(expected);
  });

  it("tests a list of objects by a field of any entry, ranging over dyn()", () => {
    expect(celExamplesFor("row.refs", [{ name: "a" }], predicate)[0]).toEqual({
      label: "Any entry with name a",
      expression: 'dyn(row.refs).exists(e, e.name == "a")',
    });
  });

  it("tests a key/value list by the value of a key in the sample", () => {
    expect(celExamplesFor('row["process.tags"].JSONArray()', OTEL_TAGS, predicate)[0]).toEqual({
      label: "host.arch is amd64",
      expression: `dyn(row["process.tags"].JSONArray()).fold(e, acc, merge(acc, {e.key: e.value}))["host.arch"] == "amd64"`,
    });
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
