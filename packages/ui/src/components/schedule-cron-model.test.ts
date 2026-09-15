import { describe, expect, it } from "vitest";
import {
  formatStructuredCron,
  parseStructuredCron,
} from "./schedule-cron-model";

describe("structured schedule cron", () => {
  it("parses daily and weekly five-field schedules into time and weekdays", () => {
    expect(parseStructuredCron("30 4 * * *")).toEqual({
      time: "04:30",
      weekdays: [0, 1, 2, 3, 4, 5, 6],
    });
    expect(parseStructuredCron("15 18 * * 1-5")).toEqual({
      time: "18:15",
      weekdays: [1, 2, 3, 4, 5],
    });
    expect(parseStructuredCron("0 2 * * 0,3,6")).toEqual({
      time: "02:00",
      weekdays: [0, 3, 6],
    });
  });

  it("formats a selected time and weekday set as a stable five-field cron", () => {
    expect(formatStructuredCron("06:45", [5, 1, 3])).toBe("45 6 * * 1,3,5");
    expect(formatStructuredCron("00:00", [0, 1, 2, 3, 4, 5, 6])).toBe(
      "0 0 * * *",
    );
  });

  it("leaves descriptor, monthly, stepped, and invalid cron expressions custom", () => {
    expect(parseStructuredCron("@daily")).toBeUndefined();
    expect(parseStructuredCron("0 2 1 * *")).toBeUndefined();
    expect(parseStructuredCron("*/15 2 * * *")).toBeUndefined();
    expect(parseStructuredCron("0 25 * * *")).toBeUndefined();
  });
});
