import { describe, expect, it, vi } from "vitest";
import { applyPostExtensions } from "./json-schema-form-extensions";
import type {
  FieldControl,
  PostExtension,
  PostExtensionContext,
} from "./json-schema-form-types";

const field: FieldControl = {
  key: "value",
  kind: "string",
  label: "Value",
  required: false,
  schema: { type: "string" },
  value: "",
  onChange: vi.fn(),
};

describe("applyPostExtensions", () => {
  it("composes custom field nodes in declaration order with the shared root context", () => {
    const rootValue = { provider: "opensearch" };
    const onRootChange = vi.fn();
    const seen: Array<PostExtensionContext | undefined> = [];
    const suffix = (name: string): PostExtension => (_field, nodes, ctx) => {
      seen.push(ctx);
      return {
        label: `${String(nodes.label)}:${name}`,
        value: `${String(nodes.value)}:${name}`,
      };
    };

    expect(
      applyPostExtensions(
        field,
        { label: "label", value: "value" },
        [suffix("first"), suffix("second")],
        { rootValue, onRootChange },
      ),
    ).toEqual({ label: "label:first:second", value: "value:first:second" });
    expect(seen).toEqual([
      { rootValue, onRootChange },
      { rootValue, onRootChange },
    ]);
  });
});
