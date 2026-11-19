import { describe, expect, it } from "vitest";
import { parseDelimited } from "./delimited";

describe("parseDelimited", () => {
  it.each([
    ["quoted fields holding the delimiter, a newline and an escaped quote", 'a,b\n"x, y","line\nbreak"\n"say ""hi""",', ",", [["a", "b"], ["x, y", "line\nbreak"], ['say "hi"', ""]]],
    ["CRLF line endings without a trailing empty row", "a,b\r\n1,2\r\n", ",", [["a", "b"], ["1", "2"]]],
    ["tab-separated values", "a\tb\n1\t2", "\t", [["a", "b"], ["1", "2"]]],
  ])("parses %s", (_case, text, delimiter, rows) => {
    expect(parseDelimited(text, delimiter)).toEqual(rows);
  });

  it("throws on an unterminated quote instead of swallowing the rest of the text", () => {
    expect(() => parseDelimited('a,"b\nc,d')).toThrow("unterminated");
  });
});
