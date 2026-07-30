import { describe, expect, it } from "vitest";
import { makeSurfaceDefinition } from "./clickyMetadata";

describe("makeSurfaceDefinition", () => {
  it("preserves the backend surface icon in the domain definition", () => {
    expect(
      makeSurfaceDefinition({
        key: "widgets",
        entity: "widget",
        title: "Widgets",
        description: "All widgets.",
        icon: "database",
      }),
    ).toEqual({
      key: "widgets",
      title: "Widgets",
      description: "All widgets.",
      icon: "database",
    });
  });
});
