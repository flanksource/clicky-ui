import { describe, expect, it } from "vitest";
import { profileBuilderModalClassName } from "./profileBuilderWorkspace";
import { mapTimestampColumn, profileColumnTypeLabel } from "./profileColumnModel";

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
