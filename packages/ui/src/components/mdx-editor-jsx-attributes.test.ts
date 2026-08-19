import { describe, expect, it } from "vitest";
import { readJsxAttributes, writeJsxAttribute } from "./mdx-editor-jsx-attributes";

const attribute = (name: string, value: unknown) => ({ type: "mdxJsxAttribute", name, value });
const NAMES = ["variant", "badge", "label", "emphasis"] as const;

describe("readJsxAttributes", () => {
  it("reads every named string attribute", () => {
    expect(
      readJsxAttributes(
        [attribute("variant", "caution"), attribute("badge", "BCR-08"), attribute("label", "Gap")],
        NAMES,
      ),
    ).toEqual({ variant: "caution", badge: "BCR-08", label: "Gap" });
  });

  // `<CalloutBox emphasis>` is valid JSX and means true; mdast gives it a null
  // value, which must not read as "no emphasis".
  it("reads a bare attribute as true", () => {
    expect(readJsxAttributes([attribute("emphasis", null)], NAMES)).toEqual({ emphasis: "true" });
  });

  it("ignores an attribute the block does not declare", () => {
    expect(readJsxAttributes([attribute("onClick", "boom")], NAMES)).toEqual({});
  });

  // An expression attribute (`variant={x}`) carries an object, not a string.
  // Reading it as a value would hand the renderer something it must throw on.
  it("ignores an expression attribute", () => {
    expect(readJsxAttributes([{ type: "mdxJsxExpressionAttribute", value: "{...rest}" }], NAMES)).toEqual({});
  });
});

describe("writeJsxAttribute", () => {
  it("replaces a value in place of appending a duplicate", () => {
    expect(writeJsxAttribute([attribute("variant", "note")], "variant", "warning")).toEqual([
      attribute("variant", "warning"),
    ]);
  });

  it("keeps the attributes it was not asked to change", () => {
    expect(writeJsxAttribute([attribute("badge", "N14")], "label", "Gap")).toEqual([
      attribute("badge", "N14"),
      attribute("label", "Gap"),
    ]);
  });

  // Clearing the control must remove the attribute: `variant=""` is not a tone,
  // and the renderer throws on one it does not recognise.
  it("removes the attribute when the value is cleared", () => {
    expect(writeJsxAttribute([attribute("variant", "note")], "variant", "")).toEqual([]);
  });

  it("leaves an expression attribute untouched", () => {
    const spread = { type: "mdxJsxExpressionAttribute", value: "{...rest}" };
    expect(writeJsxAttribute([spread], "label", "Gap")).toEqual([spread, attribute("label", "Gap")]);
  });
});
