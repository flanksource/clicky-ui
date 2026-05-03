import { describe, expect, it } from "vitest";
import { normalizeStatus } from "./status-mapping";

describe("normalizeStatus", () => {
  it("collapses error variants to error", () => {
    for (const value of ["error", "ERR", "FAILED", "fatal", "panic", "down", "unhealthy"]) {
      expect(normalizeStatus(value)).toBe("error");
    }
  });

  it("collapses warning variants to warning", () => {
    for (const value of ["warn", "Warning", "DEGRADED", "stale"]) {
      expect(normalizeStatus(value)).toBe("warning");
    }
  });

  it("collapses ok variants to success", () => {
    for (const value of ["ok", "OK", "healthy", "running", "ready"]) {
      expect(normalizeStatus(value)).toBe("success");
    }
  });

  it("treats info/debug/trace as success bucket", () => {
    expect(normalizeStatus("info")).toBe("success");
    expect(normalizeStatus("debug")).toBe("success");
  });

  it("returns null for unknown tokens", () => {
    expect(normalizeStatus("mystery")).toBe(null);
    expect(normalizeStatus("")).toBe(null);
    expect(normalizeStatus(null)).toBe(null);
    expect(normalizeStatus(undefined)).toBe(null);
  });

  it("maps booleans", () => {
    expect(normalizeStatus(true)).toBe("success");
    expect(normalizeStatus(false)).toBe("error");
  });
});
