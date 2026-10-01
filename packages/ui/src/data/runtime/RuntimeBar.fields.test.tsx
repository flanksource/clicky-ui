import { describe, expect, it, vi } from "vitest";
import { UiBrain } from "../../icons";
import { effortField } from "./RuntimeBar.fields";

describe("effort field", () => {
  it.each([undefined, "medium", "high"])(
    "uses a neutral category icon with effort %s",
    (value) => {
      const field = effortField({
        value,
        offered: ["medium", "high"],
        supported: ["medium", "high"],
        onChange: vi.fn(),
      });

      expect(field.icon).toBe(UiBrain);
      expect(field.iconClassName).toBe("text-muted-foreground");
    },
  );
});
