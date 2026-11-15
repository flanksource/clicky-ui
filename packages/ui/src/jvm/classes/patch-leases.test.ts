import { describe, expect, it } from "vitest";
import { DEFAULT_LEASE_SECONDS, LEASE_OPTIONS, leaseLabel } from "./patch-leases";

describe("leaseLabel", () => {
  it.each([
    [60, "1 minute"],
    [120, "2 minutes"],
    [900, "15 minutes"],
    [90, "90 seconds"],
  ])("%d seconds -> %s", (seconds, expected) => {
    expect(leaseLabel(seconds)).toBe(expected);
  });
});

describe("LEASE_OPTIONS", () => {
  it("labels every option the way leaseLabel does and includes the default", () => {
    expect(LEASE_OPTIONS.map((option) => option.label)).toEqual(LEASE_OPTIONS.map((option) => leaseLabel(option.seconds)));
    expect(LEASE_OPTIONS.map((option) => option.seconds)).toContain(DEFAULT_LEASE_SECONDS);
  });
});
