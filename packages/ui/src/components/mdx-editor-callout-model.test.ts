import { describe, expect, it } from "vitest";
import { CALLOUT_TONES, CALLOUT_VARIANTS } from "../data/callout-tones";
import {
  CALLOUT_ATTRIBUTE_OPTIONS,
  CALLOUT_ATTRIBUTES,
  CALLOUT_JSX_PROPS,
  readCalloutAttributes,
} from "./mdx-editor-callout-model";

const attribute = (name: string, value: unknown) => ({ type: "mdxJsxAttribute", name, value });

describe("the callout's attribute vocabulary", () => {
  // Without a prop entry the editor drops the attribute on save, silently
  // downgrading every callout that used it.
  it("declares one descriptor prop per attribute", () => {
    expect(CALLOUT_JSX_PROPS.map(({ name }) => name)).toEqual([...CALLOUT_ATTRIBUTES]);
  });

  it("offers the renderer's own vocabulary for the enumerated attributes", () => {
    expect(CALLOUT_ATTRIBUTE_OPTIONS.variant).toEqual(CALLOUT_VARIANTS);
    expect(CALLOUT_ATTRIBUTE_OPTIONS.icon).toEqual(CALLOUT_TONES);
  });

  it("reads the corpus's own attribute set off a node", () => {
    expect(
      readCalloutAttributes([
        attribute("variant", "important"),
        attribute("title", "v2.0 changes awaiting sign-off"),
        attribute("label", "Open question"),
        attribute("badge", "§4"),
        attribute("source", "Policy Owner"),
        attribute("emphasis", "true"),
        attribute("tier", "Internal"),
      ]),
    ).toEqual({
      variant: "important",
      title: "v2.0 changes awaiting sign-off",
      label: "Open question",
      badge: "§4",
      source: "Policy Owner",
      emphasis: "true",
    });
  });
});
