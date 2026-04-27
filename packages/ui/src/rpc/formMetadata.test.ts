import { describe, expect, it } from "vitest";
import { packParameterValues } from "./formMetadata";

describe("packParameterValues", () => {
  it("keeps path params named even when they are described as positional", () => {
    expect(
      packParameterValues({ id: "stk-001", events: "3" }, [
        {
          name: "id",
          in: "path",
          description: "Positional argument from command",
          required: true,
        },
        {
          name: "events",
          in: "query",
        },
      ]),
    ).toEqual({
      id: "stk-001",
      events: "3",
    });
  });
});
