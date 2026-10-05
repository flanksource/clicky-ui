import { useState } from "react";
import { stringify } from "yaml";
import { Button } from "../components/button";
import { useDensityValue, type Density } from "../hooks/use-density";
import { UiChevronRight } from "../icons";
import { cn } from "../lib/utils";

export type JsonViewProps = {
  /** JSON-like value to render. */
  data: unknown;
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

const DENSITY_CLASSES: Record<Density, string> = {
  compact:
    "text-xs leading-4 [--json-view-indent:0.75rem] [--json-view-row-space:0px]",
  comfortable:
    "text-sm leading-5 [--json-view-indent:1rem] [--json-view-row-space:1px]",
  spacious:
    "text-base leading-6 [--json-view-indent:1.25rem] [--json-view-row-space:2px]",
};

export function JsonView({
  density,
  format = "yaml",
  ...props
}: JsonViewProps) {
  const inheritedDensity = useDensityValue();
  const activeDensity = density ?? inheritedDensity;
  return (
    <div
      data-format={format}
      data-density={activeDensity}
      className={cn(
        "font-mono whitespace-pre-wrap break-words",
        DENSITY_CLASSES[activeDensity],
      )}
    >
      <JsonViewNode {...props} format={format} />
    </div>
  );
}

type JsonViewNodeProps = Omit<JsonViewProps, "density"> & {
  format: "yaml" | "json";
  sequenceItem?: boolean;
};

function JsonViewNode({
  data,
  name,
  depth = 0,
  defaultOpenDepth = 2,
  format,
  sequenceItem = false,
}: JsonViewNodeProps) {
  const [open, setOpen] = useState(depth < defaultOpenDepth);
  const isArray = Array.isArray(data);
  const entries =
    data !== null && typeof data === "object" ? Object.entries(data) : [];
  const prefix = (
    <>
      {sequenceItem && <span className="text-muted-foreground">- </span>}
      {name !== undefined && (
        <>
          <span className="text-purple-600 [[data-theme=dark]_&]:text-purple-400">
            {format === "yaml" ? yamlString(name) : name}
          </span>
          <span className="text-muted-foreground">: </span>
        </>
      )}
    </>
  );
  if (entries.length === 0) {
    return (
      <div className="py-[var(--json-view-row-space)]">
        {prefix}
        <JsonViewScalar data={data} format={format} />
      </div>
    );
  }
  const [openB, closeB] = isArray ? ["[", "]"] : ["{", "}"];
  const summary = `${entries.length} ${isArray ? (entries.length === 1 ? "item" : "items") : entries.length === 1 ? "key" : "keys"}`;
  return (
    <div>
      <Button
        variant="ghost"
        type="button"
        aria-expanded={open}
        aria-label={`${open ? "Collapse" : "Expand"} ${name ?? "value"}`}
        className="h-auto max-w-full justify-start gap-0 rounded px-0 py-[var(--json-view-row-space)] text-left font-normal text-[length:inherit] leading-[inherit] whitespace-pre-wrap [&_svg]:size-[0.75em]"
        onClick={() => setOpen(!open)}
      >
        <UiChevronRight
          aria-hidden="true"
          className={cn(
            "mr-1 shrink-0 text-muted-foreground",
            open && "rotate-90",
          )}
        />
        <span>
          {prefix}
          <span className="text-muted-foreground">
            {format === "json"
              ? open
                ? openB
                : `${openB} ${summary} ${closeB}`
              : !open || (name === undefined && !sequenceItem)
                ? summary
                : null}
          </span>
        </span>
      </Button>
      {open && (
        <>
          <div className="border-l border-border pl-[var(--json-view-indent)]">
            {entries.map(([key, val]) => (
              <JsonViewNode
                key={key}
                data={val}
                {...(!isArray ? { name: key } : {})}
                sequenceItem={isArray && format === "yaml"}
                depth={depth + 1}
                defaultOpenDepth={defaultOpenDepth}
                format={format}
              />
            ))}
          </div>
          {format === "json" && (
            <div className="text-muted-foreground py-[var(--json-view-row-space)]">
              {closeB}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function JsonViewScalar({
  data,
  format,
}: Pick<JsonViewProps, "data" | "format">) {
  if (data === null || data === undefined)
    return <span className="text-muted-foreground italic">null</span>;
  if (typeof data === "string") {
    return (
      <span className="text-green-700 [[data-theme=dark]_&]:text-green-400">
        {format === "yaml" ? yamlString(data) : JSON.stringify(data)}
      </span>
    );
  }
  if (typeof data === "number" || typeof data === "boolean") {
    return (
      <span className="text-blue-700 [[data-theme=dark]_&]:text-blue-400">
        {String(data)}
      </span>
    );
  }
  return (
    <span className="text-muted-foreground">
      {typeof data === "object"
        ? Array.isArray(data)
          ? "[]"
          : "{}"
        : String(data)}
    </span>
  );
}

function yamlString(value: string): string {
  return stringify(value, {
    lineWidth: 0,
    defaultStringType: value.includes("\n") ? "QUOTE_DOUBLE" : "PLAIN",
  }).trimEnd();
}
