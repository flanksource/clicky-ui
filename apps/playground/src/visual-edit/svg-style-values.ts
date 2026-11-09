import { cn } from "@flanksource/clicky-ui";
export const SVG_STYLE_PROPERTIES = ["fill", "stroke", "color", "strokeWidth", "opacity", "fontSize", "fontWeight", "fontFamily"] as const;
export type SvgStyleProperty = typeof SVG_STYLE_PROPERTIES[number];
const PREFIX: Record<SvgStyleProperty, string> = {
  fill: "fill", stroke: "stroke", color: "text", strokeWidth: "stroke", opacity: "opacity", fontSize: "text", fontWeight: "font", fontFamily: "font",
};

export function svgUtility({ property, value }: { property: SvgStyleProperty; value: string }): string {
  return `${PREFIX[property]}-${value}`;
}

export function mergeSvgUtility(classes: unknown, utility: string): string {
  return cn(typeof classes === "string" ? classes : "", utility);
}

const SAMPLE: Record<SvgStyleProperty, string> = {
  fill: "fill-red-500", stroke: "stroke-red-500", color: "text-red-500", strokeWidth: "stroke-2", opacity: "opacity-50", fontSize: "text-sm", fontWeight: "font-bold", fontFamily: "font-sans",
};

export function svgPropertyClasses({ classes, property }: { classes: unknown; property: string }): string[] {
  if (typeof classes !== "string" || !(property in SAMPLE)) return [];
  return classes.split(/\s+/).filter(token => {
    if (!token) return false;
    let depth = 0;
    let colon = -1;
    for (let index = 0; index < token.length; index++) {
      if (token[index] === "[") depth++;
      if (token[index] === "]") depth--;
      if (token[index] === ":" && depth === 0) colon = index;
    }
    const sample = `${token.slice(0, colon + 1)}${SAMPLE[property as SvgStyleProperty]}`;
    return token === sample || cn(token, sample) === sample;
  });
}
