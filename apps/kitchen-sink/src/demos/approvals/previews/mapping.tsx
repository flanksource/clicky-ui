import { Icon } from "@flanksource/clicky-ui";
import { MV_KEY, MvChip } from "../chrome";
import { ICONS } from "../meta";
import type { MappingChange } from "../types";
import { AcctRef, FlowArrow, PreviewCard } from "./shared";

/** Merivio's `.apr-liverow` track, widened for the trailing txn count. */
const MAP_GRID =
  "grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_minmax(0,1.2fr)_5rem] items-center gap-2.5 px-[18px] py-2.5";

export function MappingPreview({ change }: { change: MappingChange }) {
  return (
    <PreviewCard
      icon="bank_rule"
      eyebrow="The change"
      title="Account mapping update"
      actions={<MvChip>{change.rows.length} mappings</MvChip>}
    >
      <p className="text-mv-md text-mv-muted">
        <span className="font-medium text-mv-ink">{change.source}</span> —{" "}
        {change.reason}
      </p>

      <div className="overflow-x-auto rounded-mv-md border border-mv-border">
        <div className="min-w-[720px]">
          <div
            className={`${MAP_GRID} border-b border-mv-hair bg-mv-surface-2 tracking-[0.09em] ${MV_KEY}`}
          >
            <span>External account</span>
            <span>Currently maps to</span>
            <span />
            <span>Will map to</span>
            <span className="text-right">Txns</span>
          </div>
          {change.rows.map((row) => (
            <div
              key={row.external}
              className={`${MAP_GRID} border-b border-mv-hair text-mv-md last:border-0`}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <Icon
                  icon={ICONS.transfer}
                  className="shrink-0 text-base text-mv-muted-2"
                />
                <span className="truncate text-mv-ink-2">{row.external}</span>
              </span>
              <span className="truncate text-mv-muted line-through">
                {row.from.code} · {row.from.name}
              </span>
              <FlowArrow />
              <AcctRef code={row.to.code} name={row.to.name} />
              <span className="text-right font-mono text-mv-base tabular-nums text-mv-muted">
                {row.txns.toLocaleString("en-US")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PreviewCard>
  );
}
