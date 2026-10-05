import { describe, expect, it } from "vitest";
import { parseJsonSource } from "./parse-source";

describe("parseJsonSource", () => {
  it.each([
    null,
    false,
    0,
    "literal",
    [],
    {},
    { nested: [true, null, { count: 2 }] },
  ])("parses complete JSON %j without changing its value", (value) => {
    expect(parseJsonSource(JSON.stringify(value))).toEqual({
      status: "complete",
      value,
    });
  });

  it.each([
    ['{"name":"api","enabled":true,', { name: "api", enabled: true }],
    ['{"nested":{"count":2,"pending":"cut', { nested: { count: 2 } }],
    ['[1, false, {"name":"api","pending":', [1, false, { name: "api" }]],
    ['{"ready":[],"pending"', { ready: [] }],
    ['{"ready":1,"pending":tru', { ready: 1 }],
    ['{"ready":1,"pending":1e+', { ready: 1 }],
    ['{"ready":1,"pending":-', { ready: 1 }],
    ['{"ready":1,"pending":0.', { ready: 1 }],
    ['{"ready":1,"pending":"escape\\', { ready: 1 }],
    ['{"ready":1,"pending":"unicode\\u12', { ready: 1 }],
    ['{"ready":1,"pending":"escaped quote\\"tail', { ready: 1 }],
    [
      '{"__proto__":{"polluted":true},',
      JSON.parse('{"__proto__":{"polluted":true}}'),
    ],
  ])(
    "retains completed values from the cut-off document %s",
    (source, value) => {
      expect(parseJsonSource(source as string)).toMatchObject({
        status: "incomplete",
        value,
      });
      expect(parseJsonSource(source as string).diagnostic).toEqual({
        message: expect.any(String),
        line: 1,
        column: expect.any(Number),
      });
    },
  );

  it.each(["", "   ", "{", "[", '"cut', "tru", '{"pending":{'])(
    "does not invent a value for %j",
    (source) => {
      const result = parseJsonSource(source);
      expect(result.status).toBe("incomplete");
      expect(result).not.toHaveProperty("value");
    },
  );

  it.each([
    '{"name":wrong}',
    '{"a":1 "b":2}',
    '{"a":1,}',
    "[1,]",
    '{"a":01}',
    '{"a":1.e',
    '{"a":tru ',
    '{"a":"bad\\q',
    '{"a":"bad\\uZZ',
    '{"a":"bad\n',
    '{"a":"bad\t',
    '{"a":/* comment */ 1}',
    '{"a":1}// comment',
    '{"a":1} {"b":2}',
    "[1,,",
    '{"a":1,"a" 2',
  ])("rejects malformed JSON without repairing it: %s", (source) => {
    const result = parseJsonSource(source);
    expect(result.status).toBe("invalid");
    expect(result).not.toHaveProperty("value");
  });

  it("locates a syntax error by line and column", () => {
    expect(parseJsonSource('{\n  "name": wrong\n}')).toMatchObject({
      status: "invalid",
      diagnostic: { line: 2, column: 11 },
    });
  });

  it("preserves NDJSON record order, scalar records, blank lines, and CRLF", () => {
    expect(
      parseJsonSource('\r\n{"name":"api"}\r\n\r\nfalse\r\nnull\r\n', "ndjson"),
    ).toEqual({
      status: "complete",
      value: [{ name: "api" }, false, null],
    });
  });

  it("separates the incomplete final NDJSON record from completed records", () => {
    expect(
      parseJsonSource(
        '{"name":"api"}\n\n{"name":"worker","pending":"cut',
        "ndjson",
      ),
    ).toMatchObject({
      status: "incomplete",
      value: [{ name: "api" }],
      partialRecord: { line: 3, value: { name: "worker" } },
      diagnostic: { line: 3 },
    });
  });

  it("does not invent a final NDJSON scalar record", () => {
    const result = parseJsonSource('{"name":"api"}\ntru', "ndjson");
    expect(result).toMatchObject({
      status: "incomplete",
      value: [{ name: "api" }],
    });
    expect(result).not.toHaveProperty("partialRecord");
  });

  it("halts at an invalid earlier NDJSON line without skipping to later records", () => {
    expect(
      parseJsonSource(
        '{"name":"api"}\n{"pending":tru\n{"name":"later"}',
        "ndjson",
      ),
    ).toMatchObject({
      status: "invalid",
      value: [{ name: "api" }],
      diagnostic: { line: 2 },
    });
  });

  it("does not interpret multiline JSON as NDJSON", () => {
    expect(parseJsonSource('{\n"name":"api"\n}', "ndjson").status).toBe(
      "invalid",
    );
  });

  it("reports an empty NDJSON stream as no completed records", () => {
    expect(parseJsonSource("\n  \r\n", "ndjson")).toEqual({
      status: "complete",
      value: [],
    });
  });

  it.each([
    '{"name":"api","enabled":true,"owner":null,"ratio":-2.5e+3}',
    '{"nested":[{"empty":{}},[false,0,"quote\\\"slash\\\\"]]}',
    '{"unicode":"\\u1234","escapes":"\\n\\t\\b\\f\\r\\/"}',
  ])(
    "recognizes every cut of a valid document as complete or incomplete: %s",
    (source) => {
      for (let length = 0; length <= source.length; length++) {
        expect(
          parseJsonSource(source.slice(0, length)).status,
          `Cut at ${length}`,
        ).not.toBe("invalid");
      }
    },
  );
});
