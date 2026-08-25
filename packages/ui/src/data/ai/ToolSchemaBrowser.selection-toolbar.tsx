import { useState } from "react";
import { Button } from "../../components/button";
import {
  SegmentedControl,
  type SegmentedOption,
} from "../../components/SegmentedControl";
import type { ListMenuSelection } from "../../components/use-list-menu-selection";
import type { PermissionRule } from "../chat/tool-policy";
import type { ToolPolicy } from "../chat/types";

const POLICY_OPTIONS: SegmentedOption<ToolPolicy>[] = [
  { id: "auto", label: "Auto" },
  { id: "ask", label: "Ask" },
  { id: "deny", label: "Off" },
  { id: "allow", label: "On" },
];

export function ToolSelectionStrategyToolbar({
  selection,
  onRule,
}: {
  selection: ListMenuSelection;
  onRule: (rule: PermissionRule) => void;
}) {
  const [policy, setPolicy] = useState<ToolPolicy>("ask");
  return (
    <div className="grid shrink-0 gap-1.5 border-b border-border bg-muted px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">
          {selection.count} selected
        </span>
        <span className="text-[10px] text-muted-foreground">
          Saves one grouped permission strategy
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <SegmentedControl
          aria-label="Selected tools policy"
          value={policy}
          options={POLICY_OPTIONS}
          onChange={setPolicy}
          size="sm"
          className="min-w-0 flex-1 justify-stretch"
        />
        <Button
          type="button"
          size="sm"
          onClick={() => {
            onRule({
              name: [...selection.selectedKeys].sort(),
              policy,
            });
            selection.clear();
          }}
        >
          Save strategy
        </Button>
      </div>
    </div>
  );
}
