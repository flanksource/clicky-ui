import { describe, expect, it } from "vitest";
import { serializeContext, parseContextPrefix, type ChatContextItem } from "./context";

const items: ChatContextItem[] = [
  { id: "a", type: "record", label: "Order 42", fields: { status: "open", total: "1.2k" } },
  { id: "b", type: "doc", label: "Q3 report" },
];

describe("serializeContext", () => {
  it("returns an empty string when nothing is attached", () => {
    expect(serializeContext([])).toBe("");
  });

  it("emits a Context block with field details and a trailing blank line", () => {
    expect(serializeContext(items)).toBe(
      "Context:\n[record] Order 42 (status: open, total: 1.2k)\n[doc] Q3 report\n\n",
    );
  });
});

describe("parseContextPrefix", () => {
  it("leaves a plain message untouched", () => {
    const out = parseContextPrefix("what is the balance?");
    expect(out.items).toEqual([]);
    expect(out.question).toBe("what is the balance?");
  });

  it("round-trips type, label and fields back out of a serialized prefix", () => {
    const text = serializeContext(items) + "summarize these";
    const out = parseContextPrefix(text);
    expect(out.question).toBe("summarize these");
    expect(out.items.map((i) => ({ type: i.type, label: i.label, fields: i.fields }))).toEqual([
      { type: "record", label: "Order 42", fields: { status: "open", total: "1.2k" } },
      { type: "doc", label: "Q3 report", fields: {} },
    ]);
  });
});
