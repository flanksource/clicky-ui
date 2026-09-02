import { Badge } from "@flanksource/clicky-ui";

import { categoryTokens } from "../_merivio/category-tokens";
import type { RuleRow, RuleState } from "./_rule-run-buttons-data";

/** Control glyphs are 16px, metadata glyphs 14px — both on the 2px icon scale. */
export const ICON_CONTROL = 16;
export const ICON_META = 14;

export function StateBadge({ state }: { state: RuleState }) {
  if (state === "ready") {
    return (
      <Badge variant="soft" tone="success" size="xs" className="gap-1">
        <iconify-icon icon="ph:check-circle-thin" width={ICON_META} height={ICON_META} />
        Active
      </Badge>
    );
  }
  if (state === "attention") {
    return (
      <Badge variant="soft" tone="warning" size="xs" className="gap-1">
        <iconify-icon icon="ph:warning-circle-thin" width={ICON_META} height={ICON_META} />
        Needs review
      </Badge>
    );
  }
  return (
    <Badge variant="outline" size="xs" className="gap-1 text-[var(--mv-muted)]">
      <iconify-icon icon="ph:pause-circle-thin" width={ICON_META} height={ICON_META} />
      Inactive
    </Badge>
  );
}

export function RuleIdentity({ row }: { row: RuleRow }) {
  const category = categoryTokens(row.category);
  return (
    <span className="flex min-w-0 items-center gap-density-2">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-lg border"
        style={{ color: category.accent, backgroundColor: category.soft, borderColor: category.line }}
      >
        <iconify-icon icon={row.iconToken} width="18" height="18" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-[var(--mv-ink)]">
          {row.name}
        </span>
        <span className="flex items-center gap-1 truncate text-[11px] text-[var(--mv-muted)]">
          <span className="size-1.5 rounded-full" style={{ backgroundColor: category.accent }} />
          {row.module} · {category.name}
        </span>
      </span>
    </span>
  );
}

export function TargetBadge({ row }: { row: RuleRow }) {
  return (
    <Badge variant="outline" size="xs" className="gap-1 border-[var(--mv-border)] text-[var(--mv-ink-3)]">
      <iconify-icon
        icon={row.target === "Sub-ledger" ? "ph:stack-thin" : "ph:notebook-thin"}
        width={ICON_META}
        height={ICON_META}
      />
      {row.target}
    </Badge>
  );
}
