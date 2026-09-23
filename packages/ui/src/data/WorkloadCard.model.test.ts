import { describe, expect, it } from "vitest";
import { workloadStatusTone, workloadTypeLabel } from "./WorkloadCard.model";

describe("workloadStatusTone", () => {
  it.each([
    ["healthy", "success"],
    ["warning", "warning"],
    ["unhealthy", "danger"],
    ["Healthy", "success"],
    ["unknown", "neutral"],
    ["degraded", "neutral"],
    ["", "neutral"],
  ] as const)("maps health %j to %s", (health, tone) => {
    expect(workloadStatusTone({ health })).toBe(tone);
  });

  it("is neutral without a status or health", () => {
    expect(workloadStatusTone(undefined)).toBe("neutral");
    expect(workloadStatusTone({})).toBe("neutral");
  });

  it("lets an explicit tone override health", () => {
    expect(workloadStatusTone({ health: "healthy", tone: "danger" })).toBe(
      "danger",
    );
    expect(workloadStatusTone({ tone: "info" })).toBe("info");
  });

  it("ignores label and code text", () => {
    // Substring matching would read "NotReady" as ready and "Broken" as ok.
    expect(workloadStatusTone({ label: "NotReady" })).toBe("neutral");
    expect(workloadStatusTone({ code: "Broken" })).toBe("neutral");
    expect(workloadStatusTone({ label: "Running", code: "Ready" })).toBe(
      "neutral",
    );
    expect(
      workloadStatusTone({ health: "unhealthy", label: "Ready", code: "OK" }),
    ).toBe("danger");
  });
});

describe("workloadTypeLabel", () => {
  it("prefers the free-form type over the kind label", () => {
    expect(workloadTypeLabel({ kind: "pod", type: "Sidecar" })).toBe("Sidecar");
    expect(workloadTypeLabel({ kind: "statefulset" })).toBe("StatefulSet");
    expect(workloadTypeLabel({})).toBeUndefined();
  });
});
