import { useState } from "react";
import { stringify } from "yaml";
import { Button } from "../components/button";
import { useDensityValue, type Density } from "../hooks/use-density";
import { UiChevronRight } from "../icons";
import { cn } from "../lib/utils";
import { JsonSource } from "./json-view/JsonSource";
import type { JsonViewOptions } from "./json-view/types";

export type JsonViewProps = JsonViewOptions &
  (
    | {
        /** Parsed JSON-like value. Strings remain literal values. */
        data: unknown;
        source?: never;
        inputFormat?: never;
      }
    | {
        /** Raw JSON or NDJSON, including input interrupted at EOF. */
        source: string;
        /** Source encoding. This is independent of the YAML/JSON display format. */
        inputFormat?: "json" | "ndjson";
        data?: never;
      }
  );

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
  const hasSource = Object.hasOwn(props, "source");
  if (hasSource === Object.hasOwn(props, "data"))
    throw new Error("JsonView requires exactly one of data or source");
  if (!hasSource && Object.hasOwn(props, "inputFormat"))
    throw new Error("JsonView inputFormat requires source");
  if (hasSource && typeof props.source !== "string")
    throw new Error("JsonView source must be a string");
  const { data, source, inputFormat = "json", ...options } = props;
  return (
    <div
      data-format={format}
      data-density={activeDensity}
      className={cn(
        "font-mono whitespace-pre-wrap break-words",
        DENSITY_CLASSES[activeDensity],
      )}
    >
      {hasSource && source !== undefined ? (
        <JsonSource
          source={source}
          inputFormat={inputFormat}
          renderValue={(value) => (
            <JsonViewNode {...options} data={value} format={format} />
          )}
        />
      ) : (
        <JsonViewNode {...options} data={data} format={format} />
      )}
    </div>
  );
}

type JsonViewNodeProps = Omit<JsonViewOptions, "density"> & {
  data: unknown;
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
