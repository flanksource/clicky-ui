import type { MBeanAttributeReading, MBeanAttributeValue, MBeanInfo } from "../protocol/types";

/** `info.attributes` with the values that were read; attributes that failed to read carry no `value`. */
export function mergeMBeanReadings(info: MBeanInfo, values: MBeanAttributeValue[] | undefined): MBeanAttributeReading[] {
  if (!values) return info.attributes;
  const byName = new Map(values.map((entry) => [entry.name, entry.value]));
  return info.attributes.map((attribute) => (byName.has(attribute.name) ? { ...attribute, value: byName.get(attribute.name) } : attribute));
}
