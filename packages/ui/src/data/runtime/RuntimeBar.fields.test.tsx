import { describe, expect, it, vi } from "vitest";
import {
  UiBatteryChargingVertical,
  UiBatteryVerticalHigh,
  UiBatteryVerticalMedium,
  UiBrain,
} from "../../icons";
import { effortField } from "./RuntimeBar.fields";

describe("effort field", () => {
  it.each([
    { value: undefined, icon: UiBrain, color: "text-muted-foreground" },
    { value: "future", icon: UiBrain, color: "text-muted-foreground" },
    {
      value: "medium",
      icon: UiBatteryVerticalMedium,
      color: "text-amber-700 [[data-theme=dark]_&]:text-amber-400",
    },
    {
      value: "high",
      icon: UiBatteryVerticalHigh,
      color: "text-orange-700 [[data-theme=dark]_&]:text-orange-400",
    },
    {
      value: "adaptive",
      icon: UiBatteryChargingVertical,
      color: "text-indigo-700 [[data-theme=dark]_&]:text-indigo-400",
    },
  ])(
    "uses the selected effort icon and color with effort $value",
    ({ value, icon, color }) => {
      const field = effortField({
        value,
        offered: ["medium", "high"],
        supported: ["medium", "high"],
        onChange: vi.fn(),
      });

      expect(field.icon).toBe(icon);
      expect(field.iconClassName).toBe(color);
    },
  );
});
