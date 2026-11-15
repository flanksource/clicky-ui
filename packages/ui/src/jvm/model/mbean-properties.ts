import type { PropertiesItem } from "../../data/Properties";
import type { MBeanAttributeReading } from "../protocol/types";

const OPERATING_SYSTEM_BYTES = new Set([
  "FreeMemorySize",
  "TotalMemorySize",
  "FreePhysicalMemorySize",
  "TotalPhysicalMemorySize",
  "CommittedVirtualMemorySize",
  "FreeSwapSpaceSize",
  "TotalSwapSpaceSize",
]);

function hasType(objectName: string, type: string): boolean {
  return new RegExp(`[:,]type=${type}(?:,|$)`).test(objectName);
}

function isBytes(objectName: string, name: string): boolean {
  return (
    name.endsWith("Bytes") ||
    (objectName === "java.lang:type=OperatingSystem" && OPERATING_SYSTEM_BYTES.has(name)) ||
    (objectName.startsWith("java.nio:") && hasType(objectName, "BufferPool") && ["MemoryUsed", "TotalCapacity"].includes(name))
  );
}

function isMillisDuration(objectName: string, name: string): boolean {
  return (
    (objectName === "java.lang:type=Runtime" && name === "Uptime") ||
    (objectName.startsWith("java.lang:") && hasType(objectName, "GarbageCollector") && name === "CollectionTime") ||
    (objectName === "java.lang:type=Compilation" && name === "TotalCompilationTime")
  );
}

/**
 * A `Properties` row for an MBean attribute, typed from the standard
 * java.lang / java.nio platform MBeans so bytes, durations and dates format.
 */
export function mbeanAttributeProperty(objectName: string, attribute: MBeanAttributeReading): PropertiesItem {
  const { name, readable } = attribute;
  if (!readable) return { key: name, value: "Write only" };
  if (!("value" in attribute)) return { key: name, value: "Unavailable" };
  const { value } = attribute;
  const item: PropertiesItem = { key: name, value };
  if (value == null) return item;
  if (typeof value === "object" || (typeof value === "string" && /^\s*[[{]/.test(value))) return { ...item, type: "json" };
  if (typeof value === "boolean") return { ...item, type: "boolean" };
  if (typeof value !== "number") return item;
  if (isBytes(objectName, name)) return { ...item, type: "bytes" };
  if (isMillisDuration(objectName, name)) return { ...item, type: "duration", unit: "ms" };
  if (objectName === "java.lang:type=Runtime" && name === "StartTime") return { ...item, type: "date" };
  return { ...item, type: "number" };
}
