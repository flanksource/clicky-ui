import { Icon, KeyValueList } from "@flanksource/clicky-ui";
import { MV_KEY, MvBadge, MvChip } from "../chrome";
import { ACCOUNT_CLASS_TONES, ICONS } from "../meta";
import type { AccountChange, Approval } from "../types";
import { IconChip, PreviewCard } from "./shared";

export function AccountPreview({
  approval,
  change,
}: {
  approval: Approval;
  change: AccountChange;
}) {
  return (
    <PreviewCard
      icon="coa"
      eyebrow="The change"
      title="New account"
      actions={<MvChip mono>{approval.targetId}</MvChip>}
    >
      <div className="flex items-start gap-density-2">
        <IconChip icon="coa" className="mt-0.5" />
        <span className="font-mono text-mv-base text-mv-muted">
          {change.code}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-mv-lg font-semibold text-mv-ink">
            {change.name}
          </div>
          <div className="text-mv-base text-mv-muted">{change.description}</div>
        </div>
        <MvBadge
          tone={ACCOUNT_CLASS_TONES[change.cls]}
          dot={false}
          className="uppercase"
        >
          {change.cls}
        </MvBadge>
      </div>

      {/* `.apr-kv` — stacked key over a mono value, hairline-ruled in two columns. */}
      <KeyValueList
        className="grid grid-cols-1 gap-0 divide-y-0 overflow-hidden rounded-mv-md border-mv-hair sm:grid-cols-2"
        rowClassName="block gap-0 border-b border-mv-hair px-density-3 py-[9px] last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:border-r-mv-hair"
        labelClassName={`mb-[3px] ${MV_KEY}`}
        valueClassName="truncate font-mono text-mv-base text-mv-ink-2"
        items={[
          { key: "type", label: "Type", value: change.type },
          { key: "tax", label: "Tax rate", value: change.taxRate },
          { key: "parent", label: "Parent", value: change.parent },
          { key: "currency", label: "Currency", value: change.currency },
          ...change.flags.map(([label, value]) => ({
            key: label,
            label,
            value,
          })),
        ]}
      />

      {change.usedBy.length > 0 && (
        <div className="space-y-density-2 border-t border-mv-hair pt-density-2">
          <div className={`flex items-center gap-1.5 ${MV_KEY}`}>
            <Icon icon={ICONS.rule} className="text-mv-md" />
            Who will post here
          </div>
          {change.usedBy.map((usage) => (
            <div
              key={usage.rule}
              className="flex flex-wrap items-baseline gap-density-2 text-mv-md"
            >
              <span className="font-mono text-mv-base text-mv-ink-2">
                {usage.rule}
              </span>
              <span className="text-mv-muted">{usage.what}</span>
            </div>
          ))}
        </div>
      )}
    </PreviewCard>
  );
}
