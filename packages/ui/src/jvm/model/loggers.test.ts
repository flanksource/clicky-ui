import { describe, expect, it } from "vitest";
import { LOGGERS } from "../fixtures/classes";
import type { JvmLogger } from "../protocol/types";
import { JUL_LEVELS, effectiveLevels, filterLoggerRows, loggerDisplayName, loggerRows } from "./loggers";

describe("effectiveLevels", () => {
  it("walks parents until a logger sets a level", () => {
    const levels = effectiveLevels(LOGGERS);
    expect(levels.get("com.example.orders.OrderService")).toEqual({ level: "FINE", from: "com.example.orders" });
    expect(levels.get("com.example")).toEqual({ level: "INFO", from: "" });
    expect(levels.get("org.apache.catalina.core.ContainerBase")).toEqual({ level: "INFO", from: "org.apache.catalina" });
  });

  it("reports a logger's own level as inherited from itself", () => {
    expect(effectiveLevels(LOGGERS).get("com.example.payments")).toEqual({ level: "WARNING", from: "com.example.payments" });
  });

  it("is unresolved when a parent is missing from the listing", () => {
    const orphan: JvmLogger[] = [{ name: "a.b", level: null, parent: "a" }];
    expect(effectiveLevels(orphan).get("a.b")).toBeNull();
  });

  it("is unresolved for a parent cycle instead of looping", () => {
    const cycle: JvmLogger[] = [
      { name: "a", level: null, parent: "b" },
      { name: "b", level: null, parent: "a" },
    ];
    expect(effectiveLevels(cycle).get("a")).toBeNull();
  });

  it("is unresolved when the root itself inherits", () => {
    expect(effectiveLevels([{ name: "", level: null, parent: null }]).get("")).toBeNull();
  });
});

describe("loggerRows", () => {
  it("names the root logger <root> and keeps the raw name for writes", () => {
    const [root] = loggerRows(LOGGERS);
    expect(root).toMatchObject({ name: "", displayName: "<root>", level: "INFO", effective: "INFO", parentName: "–" });
  });

  it("shows inherited levels with the level they resolve to", () => {
    const row = loggerRows(LOGGERS).find((candidate) => candidate.name === "com.example.orders.OrderService");
    expect(row).toMatchObject({ level: null, levelLabel: "(inherit) → FINE", effective: "FINE", parentName: "com.example.orders" });
  });

  it("shows the root as a parent by name", () => {
    const row = loggerRows(LOGGERS).find((candidate) => candidate.name === "com.example");
    expect(row?.parentName).toBe("<root>");
  });

  it("labels an unresolvable inherited level without inventing one", () => {
    const [row] = loggerRows([{ name: "a.b", level: null, parent: "a" }]);
    expect(row).toMatchObject({ effective: null, levelLabel: "(inherit) → unknown" });
  });
});

describe("filterLoggerRows", () => {
  const rows = loggerRows(LOGGERS);

  it("matches the name case-insensitively", () => {
    expect(filterLoggerRows(rows, "ORDERS").map((row) => row.name)).toEqual(["com.example.orders", "com.example.orders.OrderService"]);
  });

  it("matches <root> for the root logger", () => {
    expect(filterLoggerRows(rows, "<root>").map((row) => row.name)).toEqual([""]);
  });

  it("returns everything for a blank filter", () => {
    expect(filterLoggerRows(rows, "  ")).toHaveLength(LOGGERS.length);
  });
});

describe("loggerDisplayName / JUL_LEVELS", () => {
  it("only the empty name is <root>", () => {
    expect(loggerDisplayName("")).toBe("<root>");
    expect(loggerDisplayName("a.b")).toBe("a.b");
  });

  it("lists the java.util.logging levels from most to least restrictive", () => {
    expect(JUL_LEVELS).toEqual(["OFF", "SEVERE", "WARNING", "INFO", "CONFIG", "FINE", "FINER", "FINEST", "ALL"]);
  });
});
