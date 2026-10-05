import type { Density } from "../../hooks/use-density";

export type JsonViewOptions = {
  /** Property name displayed before the value. */
  name?: string;
  /** Current nesting depth; callers usually leave this unset. */
  depth?: number;
  /** Depth that starts expanded by default. */
  defaultOpenDepth?: number;
  /** YAML is the default; JSON retains braces and quoted strings. */
  format?: "yaml" | "json";
  /** Override the inherited application density for this viewer. */
  density?: Density;
};
