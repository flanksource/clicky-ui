import type { DesignEdit, JsonValue } from "@flanksource/page-runtime/schema";

export function designEdit(options: { baseline: Record<string, JsonValue>; values: Record<string, JsonValue>; svg: boolean }): DesignEdit {
  const changes = Object.entries(options.values).filter(([name, value]) => options.baseline[name] !== value);
  if (!changes.length) throw new Error("Change a style value before saving");
  if (!options.svg) {
    if (changes.length !== 1) throw new Error("Save one Facet property at a time");
    const [name, value] = changes[0]!;
    if (typeof value !== "string") throw new Error(`${name} must be text`);
    if (name === "variant" || name === "role") return { kind: "style", prop: name, value };
    const from = options.baseline[name];
    if (typeof from !== "string") throw new Error(`${name} has no authored text value`);
    return { kind: "text", prop: name, from, to: value };
  }
  return { kind: "attributes", ...(changes.some(([name]) => name === "children") && typeof options.baseline.children === "string" ? { textFrom: options.baseline.children } : {}), values: Object.fromEntries(changes.map(([name, value]) => {
    if (value !== null && typeof value !== "string" && typeof value !== "number") throw new Error(`Cannot write ${name} as an SVG attribute`);
    return [name, value];
  })) };
}
