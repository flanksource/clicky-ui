import { describe, expect, it } from "vitest";
import { classifyToolValue, deriveColumns } from "./shape";
import { fieldMetaFromSchema } from "./schema";

const PAGED = {
  data: [
    { id: "j1", reference: "INV-1", total: 120 },
    { id: "j2", reference: "INV-2", total: 80 },
  ],
  page: { limit: 20, offset: 0, total: 37 },
};

describe("classifyToolValue", () => {
  it("classifies the clicky PagedResult envelope", () => {
    const result = classifyToolValue(PAGED);
    expect(result.shape).toBe("paged");
    if (result.shape !== "paged") throw new Error("expected paged");
    expect(result.page.total).toBe(37);
    expect(result.page.limit).toBe(20);
    expect(result.rows).toHaveLength(2);
  });

  it("classifies a data array with no page envelope as a list", () => {
    const result = classifyToolValue({ data: [{ id: "a" }] });
    expect(result.shape).toBe("list");
  });

  it("classifies a homogeneous object array as a list with rows", () => {
    const result = classifyToolValue([{ id: "a" }, { id: "b" }]);
    if (result.shape !== "list") throw new Error("expected list");
    expect(result.rows).toHaveLength(2);
  });

  it("classifies a scalar array as a list with no rows", () => {
    const result = classifyToolValue(["alpha", "beta"]);
    if (result.shape !== "list") throw new Error("expected list");
    expect(result.rows).toBeNull();
    expect(result.items).toEqual(["alpha", "beta"]);
  });

  it("classifies a single record", () => {
    const result = classifyToolValue({ id: "j1", name: "Opening balance", posted: true });
    expect(result.shape).toBe("record");
  });

  it("classifies an all-numeric record as counts", () => {
    const result = classifyToolValue({ created: 3, updated: 1, skipped: 0 });
    if (result.shape !== "counts") throw new Error("expected counts");
    expect(result.record["created"]).toBe(3);
  });

  it("classifies scalars", () => {
    expect(classifyToolValue("done").shape).toBe("scalar");
    expect(classifyToolValue(42).shape).toBe("scalar");
    expect(classifyToolValue(true).shape).toBe("scalar");
  });

  it("classifies nothing-to-show values as empty", () => {
    expect(classifyToolValue(undefined).shape).toBe("empty");
    expect(classifyToolValue(null).shape).toBe("empty");
    expect(classifyToolValue("  ").shape).toBe("empty");
    expect(classifyToolValue([]).shape).toBe("empty");
    expect(classifyToolValue({}).shape).toBe("empty");
  });
});

describe("deriveColumns", () => {
  it("unions keys across rows and leads with id/code/name", () => {
    const columns = deriveColumns([{ reference: "INV-1", id: "j1" }, { total: 12 }]);
    expect(columns.map((column) => column.key)).toEqual(["id", "reference", "total"]);
  });

  it("caps the column count", () => {
    const wide = [{ a: 1, b: 2, c: 3, d: 4, e: 5 }];
    expect(deriveColumns(wide, { max: 3 })).toHaveLength(3);
  });

  it("marks timestamp-looking columns and right-aligns numeric ones", () => {
    const columns = deriveColumns([{ createdAt: "2026-01-01T00:00:00Z", total: 12 }]);
    expect(columns.find((column) => column.key === "createdAt")?.kind).toBe("timestamp");
    expect(columns.find((column) => column.key === "total")?.align).toBe("right");
  });

  it("labels columns from the item schema when one was published", () => {
    const fields = fieldMetaFromSchema({
      type: "object",
      properties: { reference: { type: "string", title: "Reference no." } },
    });
    const columns = deriveColumns([{ reference: "INV-1" }], { fields });
    expect(columns[0]?.label).toBe("Reference no.");
  });
});
