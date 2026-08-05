import { describe, expect, it } from "vitest";
import { fieldMetaFromSchema, listItemsSchema, orderFieldKeys } from "./schema";
import type { ChatToolInputSchema } from "../types";

const INPUT_SCHEMA: ChatToolInputSchema = {
  type: "object",
  required: ["nodeName"],
  "x-order": ["nodeName", "date"],
  properties: {
    date: { type: "string", format: "date-time", title: "Start time" },
    nodeName: { type: "string", description: "Scheduling node" },
    status: { type: "string", enum: ["pending", "running"], "x-enum-labels": { pending: "Pending" } },
  },
};

describe("fieldMetaFromSchema", () => {
  it("returns an empty map with no schema", () => {
    expect(fieldMetaFromSchema(undefined)).toEqual({});
  });

  it("uses the schema title as the label and the raw key otherwise", () => {
    const fields = fieldMetaFromSchema(INPUT_SCHEMA);
    expect(fields["date"]?.label).toBe("Start time");
    expect(fields["nodeName"]?.label).toBe("nodeName");
  });

  it("carries required, format, description and enum labels", () => {
    const fields = fieldMetaFromSchema(INPUT_SCHEMA);
    expect(fields["nodeName"]?.required).toBe(true);
    expect(fields["date"]?.required).toBe(false);
    expect(fields["date"]?.format).toBe("date-time");
    expect(fields["nodeName"]?.description).toBe("Scheduling node");
    expect(fields["status"]?.enumLabels).toEqual({ pending: "Pending" });
  });
});

describe("orderFieldKeys", () => {
  it("orders by x-order first, then schema property order", () => {
    const fields = fieldMetaFromSchema(INPUT_SCHEMA);
    expect(orderFieldKeys(["status", "date", "nodeName"], fields)).toEqual([
      "nodeName",
      "date",
      "status",
    ]);
  });

  it("keeps keys the schema does not declare after the known ones", () => {
    const fields = fieldMetaFromSchema(INPUT_SCHEMA);
    expect(orderFieldKeys(["extra", "date"], fields)).toEqual(["date", "extra"]);
  });
});

describe("listItemsSchema", () => {
  it("reads the paged envelope's data items", () => {
    const schema: ChatToolInputSchema = {
      type: "object",
      properties: {
        data: { type: "array", items: { type: "object", properties: { id: { type: "string" } } } },
        page: { type: "object" },
      },
    };
    expect(listItemsSchema(schema)?.properties?.["id"]?.type).toBe("string");
  });

  it("reads a bare array schema's items", () => {
    expect(listItemsSchema({ items: { type: "string" } })?.type).toBe("string");
  });

  it("returns undefined when there is no list", () => {
    expect(listItemsSchema(undefined)).toBeUndefined();
    expect(listItemsSchema({ type: "object", properties: { id: { type: "string" } } })).toBeUndefined();
  });
});
