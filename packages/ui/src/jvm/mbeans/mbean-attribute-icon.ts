import type { PropertiesItem } from "../../data/Properties";
import type { StaticIconComponent } from "../../data/Icon";
import {
  UiArray,
  UiBoolean,
  UiBraces,
  UiCalendarBlank,
  UiJson,
  UiMemoryStick,
  UiNumeric,
  UiString,
  UiTimer,
} from "../../icons";
import type { MBeanAttributeReading } from "../protocol/types";

/** The glyph for an attribute: its display type first, then its Java type. */
export function mbeanAttributeIcon(attribute: MBeanAttributeReading, property: PropertiesItem): StaticIconComponent {
  if (property.type === "bytes") return UiMemoryStick;
  if (property.type === "duration") return UiTimer;
  if (property.type === "date") return UiCalendarBlank;
  if (attribute.type.startsWith("[") || attribute.type.endsWith("[]") || Array.isArray(attribute.value)) return UiArray;
  if (property.type === "json" || /(?:CompositeData|TabularData)/.test(attribute.type)) return UiJson;
  const type = attribute.type.replace(/^java\.lang\./, "").toLowerCase();
  if (property.type === "boolean" || type === "boolean") return UiBoolean;
  if (property.type === "number" || /^(byte|short|int|integer|long|float|double|number)$/.test(type)) return UiNumeric;
  if (["string", "char", "character"].includes(type) || attribute.type === "javax.management.ObjectName") return UiString;
  return UiBraces;
}
