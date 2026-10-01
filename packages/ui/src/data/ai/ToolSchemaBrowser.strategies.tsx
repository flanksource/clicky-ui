import { useState } from "react";
import { UiChevronDown, UiChevronRight } from "../../icons";
import { Icon } from "../Icon";
import type { PermissionPolicy } from "../chat/tool-policy";
import type { ToolMeta } from "../chat/types";
import { PermissionStrategiesEditor } from "./runtime-profiles/PermissionStrategiesEditor";

/** The saved rule list, always present but collapsed to a count until opened. */
export function ToolPermissionStrategies({
  rules,
  tools,
  onRulesChange,
}: {
  rules: PermissionPolicy;
  tools: ToolMeta[];
  onRulesChange: (rules: PermissionPolicy) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="shrink-0 rounded-md border border-border bg-background">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs font-medium hover:bg-muted"
      >
        <Icon
          icon={open ? UiChevronDown : UiChevronRight}
          className="size-3 text-muted-foreground"
        />
        <span className="flex-1">Permission strategies</span>
        <span
          aria-label={`${rules.length} saved strategies`}
          className="rounded bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground"
        >
          {rules.length}
        </span>
      </button>
      {open && (
        <div className="max-h-[40vh] overflow-y-auto border-t border-border p-2">
          <PermissionStrategiesEditor
            value={rules}
            tools={tools}
            onChange={onRulesChange}
          />
        </div>
      )}
    </div>
  );
}
