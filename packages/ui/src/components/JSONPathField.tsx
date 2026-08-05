import { useMemo } from "react";
import { UiListTree } from "../icons";
import { IconButton } from "./IconButton";
import { InputField, type InputFieldInputProps } from "./InputField";
import { TreePickerField } from "./TreePickerField";

const MAX_DEPTH = 12;
const MAX_OBJECT_PROPERTIES = 100;
const SIMPLE_PROPERTY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export interface JSONPathNode {
  key: string;
  path: string;
  value: unknown;
  kind: "array" | "object" | "scalar";
  summary: string;
  children?: JSONPathNode[];
}

export type JSONPathFieldProps = Omit<InputFieldInputProps, "onChange" | "suffix" | "value"> & {
  json?: unknown;
  value: string;
  onChange: (path: string) => void;
  isSelectable?: (node: JSONPathNode) => boolean;
  getPath?: (node: JSONPathNode) => string;
  pickerLabel?: string;
};

export function JSONPathField({
  json,
  value,
  onChange,
  isSelectable,
  getPath,
  pickerLabel,
  disabled,
  className,
  "aria-label": ariaLabel,
  ...inputProps
}: JSONPathFieldProps) {
  const roots = useMemo(() => json === undefined ? [] : [buildJSONPathNode(json, "$", 0)], [json]);
  const browseLabel = pickerLabel ?? `Browse ${ariaLabel ?? "JSONPath"} JSON paths`;
  const pickerDisabled = Boolean(disabled) || json === undefined;

  return (
    <TreePickerField<JSONPathNode>
      className="w-full"
      roots={roots}
      getKey={(node) => node.key}
      getChildren={(node) => node.children}
      getSearchText={(node) => `${node.path} ${node.summary}`}
      defaultOpen={(_node, depth) => depth < 2}
      {...(isSelectable ? { isSelectable } : {})}
      disabled={pickerDisabled}
      onSelect={(node) => onChange(getPath?.(node) ?? node.path)}
      renderRow={({ node }) => (
        <span className="flex min-w-0 flex-1 items-center gap-density-2 font-mono text-xs">
          <span className="shrink-0 text-primary">{node.path}</span>
          <span className="truncate text-muted-foreground" title={node.summary}>{node.summary}</span>
        </span>
      )}
      renderTrigger={({ open, triggerRef, toggle }) => (
        <InputField
          {...inputProps}
          {...(disabled !== undefined ? { disabled } : {})}
          aria-label={ariaLabel}
          className={className}
          value={value}
          onChange={onChange}
          suffix={(
            <IconButton
              ref={triggerRef}
              icon={UiListTree}
              label={browseLabel}
              disabled={pickerDisabled}
              aria-haspopup="tree"
              aria-expanded={open}
              onClick={toggle}
            />
          )}
        />
      )}
    />
  );
}

function buildJSONPathNode(value: unknown, path: string, depth: number): JSONPathNode {
  const kind = Array.isArray(value) ? "array" : value !== null && typeof value === "object" ? "object" : "scalar";
  const node: JSONPathNode = { key: path, path, value, kind, summary: summarizeJSON(value) };
  if (kind === "scalar" || depth >= MAX_DEPTH) return node;
  const entries = Array.isArray(value)
    ? value.length > 0 ? [[0, value[0]] as const] : []
    : Object.entries(value as Record<string, unknown>).slice(0, MAX_OBJECT_PROPERTIES);
  node.children = entries.map(([key, child]) => buildJSONPathNode(child, appendJSONPath(path, key), depth + 1));
  return node;
}

function appendJSONPath(path: string, key: string | number): string {
  if (typeof key === "number") return `${path}[${key}]`;
  return SIMPLE_PROPERTY.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
}

function summarizeJSON(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length} item${value.length === 1 ? "" : "s"}]`;
  if (value !== null && typeof value === "object") {
    const count = Object.keys(value).length;
    return `{${count} ${count === 1 ? "property" : "properties"}}`;
  }
  if (typeof value === "string") return JSON.stringify(value.length > 80 ? `${value.slice(0, 77)}…` : value);
  return String(value);
}
