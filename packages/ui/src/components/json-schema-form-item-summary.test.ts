import { describe, expect, it } from "vitest";
import {
  addItemLabel,
  emptyItemsCopy,
  itemCountLabel,
  itemSummaryFor,
  noItemsLabel,
  resolveItemSpec,
} from "./json-schema-form-item-summary";
import type { ArrayItemSpec, JsonSchemaProperty } from "./json-schema-form-types";

const PARAM_ITEM: JsonSchemaProperty = {
  type: "object",
  title: "Parameter",
  properties: {
    name: { type: "string", title: "Name" },
    label: { type: "string", title: "Label" },
    field: { type: "string", title: "Field" },
    required: { type: "boolean", title: "Required" },
    options: { type: "array", title: "Options", items: { type: "string" } },
    type: {
      type: "string",
      title: "Type",
      enum: ["string", "list"],
      "x-enum-labels": { list: "List (multi-select)" },
      "x-enum-icons": { string: "cursor-text", list: "list-dashes" },
      "x-enum-tones": { string: "slate", list: "indigo" },
    },
    role: {
      type: "string",
      title: "Role",
      enum: ["filter", "limit"],
      "x-enum-labels": { filter: "filters" },
      "x-enum-icons": { filter: "filter" },
    },
  },
};

const PARAMS_ARRAY: JsonSchemaProperty = {
  type: "array",
  title: "Params",
  items: PARAM_ITEM,
  description: "Named inputs the profile accepts.",
  "x-item": {
    title: ["label", "name"],
    summary: [{ property: "name", pattern: "{{.params.{}}}" }, { property: "field" }],
    glyph: "type",
    badge: "role",
    flag: "required",
    noun: "parameter",
    nounPlural: "parameters",
  },
};

const SERVICE = {
  name: "service",
  label: "Service",
  field: "process.serviceName",
  type: "list",
  role: "filter",
  required: true,
};

function summarize(item: unknown, index = 0, array = PARAMS_ARRAY) {
  return itemSummaryFor({
    item,
    index,
    spec: resolveItemSpec(array, array.items),
    itemSchema: array.items,
  });
}

describe("resolveItemSpec", () => {
  it("falls back to conventional title keys when the schema is silent", () => {
    const spec = resolveItemSpec({ type: "array" }, PARAM_ITEM);
    expect(spec.title).toEqual(["title", "name", "label", "id", "key"]);
  });

  it("keeps today's 'Add item' label when no noun is declared", () => {
    // Every existing form must render byte-identically without `x-item`.
    expect(addItemLabel(resolveItemSpec({ type: "array" }, { type: "object" }))).toBe("Add item");
  });

  it("takes the add-row noun from the item title before falling back", () => {
    // `items.title` is a display title, so it arrives capitalised; a schema that
    // wants sentence case says so with an explicit noun.
    expect(addItemLabel(resolveItemSpec({ type: "array" }, PARAM_ITEM))).toBe("Add Parameter");
    expect(addItemLabel(resolveItemSpec(PARAMS_ARRAY, PARAM_ITEM))).toBe("Add parameter");
  });

  it("auto-detects the glyph property as the first icon-carrying enum", () => {
    // `type` comes before `role` in the item's properties and carries icons.
    expect(resolveItemSpec({ type: "array" }, PARAM_ITEM).glyph).toBe("type");
  });

  it("finds no glyph when no enum declares icons", () => {
    const spec = resolveItemSpec(
      { type: "array" },
      { type: "object", properties: { kind: { type: "string", enum: ["a"] } } },
    );
    expect(spec.glyph).toBeUndefined();
  });

  it("drops malformed summary parts rather than rendering them", () => {
    const spec = resolveItemSpec(
      { type: "array", "x-item": { summary: ["name", { pattern: "{}" }, 7, ""] } as ArrayItemSpec },
      PARAM_ITEM,
    );
    expect(spec.summary).toEqual(["name"]);
  });
});

describe("itemSummaryFor", () => {
  it("titles the row from the first non-empty candidate", () => {
    expect(summarize(SERVICE).title).toBe("Service");
    expect(summarize({ ...SERVICE, label: "  " }).title).toBe("service");
  });

  it("falls back to the item's position when nothing identifies it", () => {
    expect(summarize({}, 2).title).toBe("Item 3");
  });

  it("uses the schema's own fallback copy when it supplies one", () => {
    const array: JsonSchemaProperty = {
      ...PARAMS_ARRAY,
      "x-item": { ...PARAMS_ARRAY["x-item"], fallback: "Untitled parameter" },
    };
    expect(summarize({}, 0, array).title).toBe("Untitled parameter");
  });

  it("substitutes the value into the pattern's single {}", () => {
    expect(summarize(SERVICE).summary).toBe("{{.params.service}}  ·  process.serviceName");
  });

  it("renders a pattern with no placeholder as a literal", () => {
    const array: JsonSchemaProperty = {
      ...PARAMS_ARRAY,
      "x-item": { summary: [{ property: "name", pattern: "bound" }] },
    };
    expect(summarize(SERVICE, 0, array).summary).toBe("bound");
  });

  it("drops a part whose property is empty instead of leaving a separator", () => {
    expect(summarize({ name: "since" }).summary).toBe("{{.params.since}}");
    expect(summarize({ field: "svc" }).summary).toBe("svc");
    expect(summarize({}).summary).toBeUndefined();
  });

  it("joins an array-valued property into one line", () => {
    const array: JsonSchemaProperty = { ...PARAMS_ARRAY, "x-item": { summary: ["options"] } };
    expect(summarize({ options: ["a", "b"] }, 0, array).summary).toBe("a, b");
  });

  it("colours and labels the glyph from the enum's own metadata", () => {
    expect(summarize(SERVICE).glyph).toEqual({
      icon: "list-dashes",
      tone: "indigo",
      label: "List (multi-select)",
    });
  });

  it("shows the raw code when the enum declares no label for it", () => {
    expect(summarize({ ...SERVICE, type: "string" }).glyph?.label).toBe("string");
  });

  it("falls back to a neutral tone for a value the schema never coloured", () => {
    expect(summarize({ ...SERVICE, type: "mystery" }).glyph).toEqual({ tone: "neutral", label: "mystery" });
  });

  it("reads the badge label from x-enum-labels, without the code suffix", () => {
    // A chip has room for one of label/code; the option list's "Label (code)"
    // form would be noise here.
    expect(summarize(SERVICE).badge).toEqual({ icon: "filter", label: "filters" });
    expect(summarize({ ...SERVICE, role: "limit" }).badge).toEqual({ label: "limit" });
  });

  it("omits the badge entirely when the property is unset", () => {
    expect(summarize({ ...SERVICE, role: undefined }).badge).toBeUndefined();
  });

  it("flags the row only when the boolean is actually true", () => {
    expect(summarize(SERVICE).flagged).toBe(true);
    for (const required of [false, undefined, "true", 1]) {
      expect(summarize({ ...SERVICE, required }).flagged).toBeUndefined();
    }
  });

  it("survives an item that is not an object at all", () => {
    for (const junk of [null, undefined, 7, "text", ["a"]]) {
      expect(summarize(junk, 0).title).toBe("Item 1");
    }
  });
});

describe("empty and count copy", () => {
  const spec = resolveItemSpec(PARAMS_ARRAY, PARAM_ITEM);

  it("pluralises the count line", () => {
    expect(itemCountLabel(spec, 0)).toBe("0 parameters");
    expect(itemCountLabel(spec, 1)).toBe("1 parameter");
    expect(itemCountLabel(spec, 4)).toBe("4 parameters");
    expect(noItemsLabel(spec)).toBe("No parameters yet");
  });

  it("takes the zero-item copy from the array's own description for free", () => {
    expect(emptyItemsCopy(spec, PARAMS_ARRAY)).toBe("Named inputs the profile accepts.");
  });

  it("prefers explicit empty copy over the description", () => {
    const array: JsonSchemaProperty = {
      ...PARAMS_ARRAY,
      "x-item": { ...PARAMS_ARRAY["x-item"], empty: "A parameter makes a query reusable." },
    };
    expect(emptyItemsCopy(resolveItemSpec(array, PARAM_ITEM), array)).toBe(
      "A parameter makes a query reusable.",
    );
  });

  it("has no copy to show when the schema documents nothing", () => {
    expect(emptyItemsCopy(resolveItemSpec({ type: "array" }, PARAM_ITEM), { type: "array" })).toBeUndefined();
  });
});
