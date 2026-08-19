import { describe, expect, it } from "vitest";
import { profileBuilderModalClassName, sampleParamSchema } from "./profileBuilderWorkspace";
import { mapTimestampColumn, profileColumnTypeLabel } from "../fields/profileColumnModel";

describe("Build Profile workspace layout", () => {
  it("bounds the modal body and delegates scrolling to its panes", () => {
    expect(profileBuilderModalClassName).toContain("h-[calc(100dvh-2rem)]");
    // The body must shrink and stop owning scroll, and its panes must share the
    // height. Asserted as utilities because a stylesheet shipped alongside the
    // library silently does nothing in a consumer that never imports it.
    expect(profileBuilderModalClassName).toContain(
      "[&>[data-slot=modal-body]]:min-h-0",
    );
    expect(profileBuilderModalClassName).toContain(
      "[&>[data-slot=modal-body]]:overflow-hidden",
    );
    expect(profileBuilderModalClassName).toContain(
      "[&>[data-slot=modal-body]>*]:flex-1",
    );
  });
});

describe("Build Profile timestamp mapping", () => {
  it("marks exactly one sampled column as the timestamp date-range column", () => {
    expect(
      mapTimestampColumn(
        [
          { name: "created_at", type: "string" },
          { name: "updated_at", type: "datetime", kind: "timestamp" },
        ],
        "created_at",
      ),
    ).toEqual([
      { name: "created_at", type: "datetime", kind: "timestamp" },
      { name: "updated_at", type: "datetime" },
    ]);
  });
});

describe("Build Profile structured type labels", () => {
  it("uses readable labels without changing serialized values", () => {
    expect(profileColumnTypeLabel("key_value")).toBe("KeyValue{}");
    expect(profileColumnTypeLabel("key_values")).toBe("[]KeyValue");
    expect(profileColumnTypeLabel("json")).toBe("JSON");
    expect(profileColumnTypeLabel("duration")).toBe("duration");
  });
});

describe("Build Profile sample parameter schemas", () => {
  it("distinguishes date, datetime, and duration inputs", () => {
    expect(
      sampleParamSchema([
        { name: "day", type: "date" },
        { name: "started_at", type: "datetime" },
        { name: "window", type: "duration" },
      ]),
    ).toEqual({
      type: "object",
      properties: {
        day: { title: "day", type: "string", format: "date" },
        started_at: {
          title: "started_at",
          type: "string",
          format: "date-time",
        },
        window: { title: "window", type: "string" },
      },
    });
  });
});
