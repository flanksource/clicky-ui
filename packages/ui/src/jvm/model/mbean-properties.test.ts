import { describe, expect, it } from "vitest";
import { mbeanAttributeProperty } from "./mbean-properties";

const attribute = { type: "java.lang.Object", readable: true, writable: false };

describe("mbeanAttributeProperty", () => {
  it.each([
    ["java.lang:type=OperatingSystem", "TotalPhysicalMemorySize", 1048576, "bytes", undefined],
    ["java.nio:name=direct,type=BufferPool", "MemoryUsed", 1024, "bytes", undefined],
    ["acme:type=Cache", "EvictedBytes", 1024, "bytes", undefined],
    ["java.lang:name=G1 Young Generation,type=GarbageCollector", "CollectionTime", 1500, "duration", "ms"],
    ["java.lang:type=Runtime", "Uptime", 90000, "duration", "ms"],
    ["java.lang:type=Compilation", "TotalCompilationTime", 900, "duration", "ms"],
    ["java.lang:type=Runtime", "StartTime", 1704067200000, "date", undefined],
    ["java.lang:type=Memory", "HeapMemoryUsage", { used: 1024 }, "json", undefined],
    ["acme:type=Cache", "Config", '{"enabled":false}', "json", undefined],
    ["acme:type=Cache", "Verbose", false, "boolean", undefined],
    ["acme:type=Cache", "Count", 0, "number", undefined],
    ["acme:type=Cache", "CollectionTime", 15, "number", undefined],
    ["acme:type=Cache", "State", "ready", undefined, undefined],
    ["acme:type=Cache", "Missing", null, undefined, undefined],
  ])("types %s %s as %s", (objectName, name, value, type, unit) => {
    expect(mbeanAttributeProperty(objectName, { ...attribute, name, value })).toEqual({
      key: name,
      value,
      ...(type ? { type } : {}),
      ...(unit ? { unit } : {}),
    });
  });

  it("distinguishes write-only, unread and readable-null attributes", () => {
    expect(mbeanAttributeProperty("acme:type=Cache", { ...attribute, name: "Secret", readable: false, writable: true, value: null })).toEqual({
      key: "Secret",
      value: "Write only",
    });
    expect(mbeanAttributeProperty("acme:type=Cache", { ...attribute, name: "Flaky" })).toEqual({ key: "Flaky", value: "Unavailable" });
    expect(mbeanAttributeProperty("acme:type=Cache", { ...attribute, name: "Empty", value: null })).toEqual({ key: "Empty", value: null });
  });
});
