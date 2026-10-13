import { formatUnit } from "../lib/format";
import { JsonView } from "./JsonView";
import type { PropertiesDensity, PropertiesItem } from "./Properties";

export function PropertyValue({ item, density }: { item: PropertiesItem; density: PropertiesDensity }) {
  const { value, type, unit } = item;
  if (value === null || value === undefined) {
    return <span className="font-mono italic text-muted-foreground">null</span>;
  }
  if (type === "json" || (type === undefined && typeof value === "object")) {
    return typeof value === "string"
      ? <JsonView source={value} format="json" density={density} />
      : <JsonView data={value} format="json" density={density} />;
  }
  if (type === "bytes" || type === "duration" || type === "number" || unit !== undefined) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`Property ${item.key}: expected a finite numeric value for ${type ?? unit}`);
    }
    const displayUnit = unit ?? (type === "bytes" ? "bytes" : type === "duration" ? "ms" : undefined);
    const formatted = displayUnit === "bytes" && value < 0
      ? `-${formatUnit(Math.abs(value), displayUnit)}` : formatUnit(value, displayUnit);
    return <span className="font-mono" title={String(value)}>{formatted}</span>;
  }
  if (type === "date") {
    if (typeof value !== "number" && typeof value !== "string" && !(value instanceof Date)) {
      throw new Error(`Property ${item.key}: expected a date or timestamp`);
    }
    return <time dateTime={new Date(value).toISOString()} title={String(value)}>{new Date(value).toISOString()}</time>;
  }
  if (type === "boolean" && typeof value !== "boolean") {
    throw new Error(`Property ${item.key}: expected a boolean`);
  }
  return <span className="whitespace-pre-wrap break-words font-mono">{String(value)}</span>;
}
