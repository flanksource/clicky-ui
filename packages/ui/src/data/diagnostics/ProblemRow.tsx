import { useState, type ReactNode } from "react";
import type { DropdownMenuItem } from "../../overlay/DropdownMenu";
import { Icon } from "../Icon";
import { UiChevronDown, UiChevronRight } from "../../icons";
import { LintSeverityIcon } from "../test-runner/MarkIcons";
import type { LintSeverity } from "../test-runner/marks";
import { ProblemActions } from "./ProblemActions";

export function ProblemRow({
  message,
  severity,
  metadata,
  location,
  actions,
  children,
  expanded: controlled,
  onExpandedChange,
}: {
  message: string;
  severity: LintSeverity;
  metadata: ReactNode;
  location: ReactNode;
  actions: DropdownMenuItem[];
  children: ReactNode;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = controlled ?? localExpanded;
  return (
    <div className="border-b border-border/50" data-problem-row="">
      <div className="flex min-w-0 items-center hover:bg-muted/50">
        <button
          type="button"
          aria-expanded={expanded}
          title={message}
          onClick={() =>
            controlled === undefined
              ? setLocalExpanded(!expanded)
              : onExpandedChange?.(!expanded)
          }
          className="flex min-h-7 min-w-0 flex-1 items-center gap-2 px-2 py-1 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [@media(pointer:coarse)]:min-h-11"
        >
          <Icon
            icon={expanded ? UiChevronDown : UiChevronRight}
            className="shrink-0 text-muted-foreground"
          />
          <LintSeverityIcon severity={severity} />
          <span className="min-w-0 flex-1 truncate">{message}</span>
          <span className="hidden max-w-[30%] truncate text-muted-foreground sm:block">
            {metadata}
          </span>
          <span
            className="max-w-[25%] shrink-0 truncate font-mono text-muted-foreground"
            data-problem-ln=""
          >
            {location}
          </span>
        </button>
        <ProblemActions items={actions} />
      </div>
      {expanded && (
        <div className="space-y-2 px-3 pb-3 pl-8 text-xs">
          <p className="whitespace-pre-wrap break-words">{message}</p>
          <div className="text-muted-foreground sm:hidden">{metadata}</div>
          {children}
        </div>
      )}
    </div>
  );
}
