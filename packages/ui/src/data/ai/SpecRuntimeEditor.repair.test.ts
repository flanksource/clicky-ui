import { describe, expect, it } from "vitest";
import { buildAISpecRuntimePayload, SPEC_SCHEMA_STRICTNESS } from "./SpecRuntimeEditor.model";

describe("schema repair compatibility", () => {
  it.each(["repair", "retry"] as const)("normalizes %s to repair", (schemaStrictness) => {
    expect(buildAISpecRuntimePayload({ prompt: { schemaStrictness } })).toEqual({
      spec: { prompt: { schemaStrictness: "repair" } },
    });
  });

  it("offers the canonical repair choice", () => {
    expect(SPEC_SCHEMA_STRICTNESS).toEqual(["warning", "error", "repair"]);
  });
});
