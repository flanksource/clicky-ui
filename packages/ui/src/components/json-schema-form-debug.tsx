import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { FieldDebugBadge, type FieldDebugInfo } from "./json-schema-form-debug-badge";

// Debug mode (the display-options menu's Debug) renders the fields the form
// would hide, dimmed and outlined, and gives every field a badge whose hover
// card says where it comes from: its key and instance path, the control it
// resolved to, why it is hidden, and the schema keywords that source its
// value, options and state.

export type { FieldDebugInfo };

// withFieldDebug decorates a field's label/value nodes: the badge beside the
// label (or atop the value when the field has no label), and the value marked
// `data-debug-field` / `data-debug-hidden` and dimmed when the form would hide it.
export function withFieldDebug(nodes: { label: ReactNode; value: ReactNode }, info: FieldDebugInfo): { label: ReactNode; value: ReactNode } {
  const hidden = info.hiddenReason !== undefined;
  const badge = <FieldDebugBadge {...info} />;
  const value = (
    <div
      data-debug-field={info.fieldKey}
      {...(hidden ? { "data-debug-hidden": info.hiddenReason } : {})}
      className={cn("min-w-0", hidden && "rounded-md opacity-60 outline-dashed outline-1 outline-offset-2 outline-muted-foreground/60")}
    >
      {nodes.label === null ? badge : null}
      {nodes.value}
    </div>
  );
  if (nodes.label === null) return { label: null, value };
  return {
    label: (
      <span className={cn("inline-flex min-w-0 items-center gap-1", hidden && "opacity-60")}>
        {nodes.label}
        {badge}
      </span>
    ),
    value,
  };
}
