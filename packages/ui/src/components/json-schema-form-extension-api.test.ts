import { describe, expect, it } from "vitest";
import {
  RESERVED_FIELD_LAYOUTS,
  RESERVED_FORMATS,
  RESERVED_FORM_LAYOUTS,
  defineFormExtension,
  mergeFormExtensions,
  rowLayoutEngine,
  type FormExtension,
  type LayoutEngine,
} from "./json-schema-form-extension-api";
import type { PostExtension, PreExtension } from "./json-schema-form-types";

const renderer = () => null;
const handler = async () => [];
const engine: LayoutEngine = { Grid: () => null, Row: () => null };

const pre = (name: string): PreExtension => (field) => ({ ...field, label: `${field.label}:${name}` });
const post = (name: string): PostExtension => (_field, nodes) => ({
  label: `${String(nodes.label)}:${name}`,
  value: nodes.value,
});

describe("defineFormExtension", () => {
  it("returns the extension it was given", () => {
    const ext: FormExtension = { name: "identity" };
    expect(defineFormExtension(ext)).toBe(ext);
  });
});

describe("mergeFormExtensions", () => {
  it("concatenates pre and post hooks in extension order", () => {
    const first = pre("a");
    const second = pre("b");
    const firstPost = post("a");
    const secondPost = post("b");
    const merged = mergeFormExtensions([
      { name: "a", pre: [first], post: [firstPost] },
      { name: "b", pre: [second], post: [secondPost] },
    ]);
    expect(merged.pre).toEqual([first, second]);
    expect(merged.post).toEqual([firstPost, secondPost]);
  });

  it("indexes formats, lookups, layouts and slots across extensions", () => {
    const Title = () => null;
    const merged = mergeFormExtensions([
      { name: "a", formats: { color: renderer }, lookups: { "ext:one": handler } },
      { name: "b", formats: { stepper: renderer }, layouts: { cards: engine }, slots: { Title } },
    ]);
    expect([...merged.formats.keys()]).toEqual(["color", "stepper"]);
    expect(merged.formats.get("stepper")).toEqual({ extension: "b", render: renderer });
    expect([...merged.lookups.keys()]).toEqual(["ext:one"]);
    expect(merged.layouts.get("cards")).toBe(engine);
    expect(merged.slots.Title).toBe(Title);
  });

  it("is empty for no extensions", () => {
    const merged = mergeFormExtensions([]);
    expect(merged.pre).toEqual([]);
    expect(merged.post).toEqual([]);
    expect(merged.formats.size + merged.lookups.size + merged.layouts.size).toBe(0);
    expect(merged.slots).toEqual({});
  });

  it.each([
    ["format", { formats: { color: renderer } }],
    ["lookup", { lookups: { color: handler } }],
    ["layout", { layouts: { color: engine } }],
    ["slot", { slots: { Title: () => null } }],
  ] as const)("throws naming both extensions when two register the same %s", (kind, registration) => {
    expect(() =>
      mergeFormExtensions([
        { name: "first", ...registration },
        { name: "second", ...registration },
      ]),
    ).toThrow(new RegExp(`"second".*${kind}.*"first"`));
  });

  it.each(RESERVED_FORMATS)("throws when an extension registers the reserved format %s", (format) => {
    expect(() => mergeFormExtensions([{ name: "x", formats: { [format]: renderer } }])).toThrow(
      new RegExp(`reserved format "${format}"`),
    );
  });

  it.each([...new Set([...RESERVED_FORM_LAYOUTS, ...RESERVED_FIELD_LAYOUTS])])(
    "throws when an extension registers the reserved layout %s",
    (layout) => {
      expect(() => mergeFormExtensions([{ name: "x", layouts: { [layout]: engine } }])).toThrow(
        new RegExp(`reserved layout "${layout}"`),
      );
    },
  );

  it("throws on a slot name the form does not have", () => {
    const bogus = { name: "x", slots: { Footer: () => null } } as unknown as FormExtension;
    expect(() => mergeFormExtensions([bogus])).toThrow(/unknown slot "Footer"/);
  });

  it("throws on an extension without a name", () => {
    expect(() => mergeFormExtensions([{} as FormExtension])).toThrow(/must have a name/);
  });
});

describe("rowLayoutEngine", () => {
  const layouts = new Map([["cards", engine]]);

  it("is undefined when neither the field nor the form uses a registered layout", () => {
    expect(rowLayoutEngine({ fieldKey: "a", fieldLayout: "table", formMode: "stacked", layouts })).toBeUndefined();
  });

  it("returns the form-level engine for a registered form mode", () => {
    expect(rowLayoutEngine({ fieldKey: "a", fieldLayout: undefined, formMode: "cards", layouts })).toBe(engine);
  });

  it("prefers a field-level engine over the form-level one", () => {
    const chips: LayoutEngine = { Grid: () => null, Row: () => null };
    const both = new Map([["cards", engine], ["chips", chips]]);
    expect(rowLayoutEngine({ fieldKey: "a", fieldLayout: "chips", formMode: "cards", layouts: both })).toBe(chips);
  });

  it("throws for an unregistered field layout, naming the field", () => {
    expect(() => rowLayoutEngine({ fieldKey: "tags", fieldLayout: "chips", formMode: "stacked", layouts })).toThrow(
      /layout "chips" on field "tags".*not registered/,
    );
  });

  it("throws for an unregistered form layout", () => {
    expect(() => rowLayoutEngine({ fieldKey: "a", fieldLayout: undefined, formMode: "masonry", layouts })).toThrow(
      /form layout "masonry".*not registered/,
    );
  });
});
