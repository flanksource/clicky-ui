// Renders the marks.ts catalogs. Kept apart from them so this file exports
// components only (react/only-export-components).

import { Icon } from "../Icon";
import { cn } from "../../lib/utils";
import {
  LINT_SEVERITIES,
  TEST_OUTCOMES,
  toolMark,
  type LintSeverity,
  type ResultMark,
  type TestOutcome,
  type ToolMark,
} from "./marks";

type MarkIconProps = { className?: string | undefined };

function MarkIcon({ mark, className }: MarkIconProps & { mark: ResultMark | ToolMark }) {
  return (
    <Icon
      icon={mark.icon}
      title={mark.label}
      className={cn(
        "shrink-0",
        mark.className,
        "spin" in mark && mark.spin && "motion-safe:animate-spin",
        className,
      )}
    />
  );
}

export function OutcomeIcon({ outcome, className }: MarkIconProps & { outcome: TestOutcome }) {
  return <MarkIcon mark={TEST_OUTCOMES[outcome]} className={className} />;
}

export function LintSeverityIcon({
  severity,
  className,
}: MarkIconProps & { severity: LintSeverity }) {
  return <MarkIcon mark={LINT_SEVERITIES[severity]} className={className} />;
}

export function ToolIcon({ tool, className }: MarkIconProps & { tool: string | undefined }) {
  const mark = toolMark(tool);
  return mark ? <MarkIcon mark={mark} className={className} /> : null;
}
