import { Button, Icon } from "@flanksource/clicky-ui";
import { MV_BTN_GHOST, MV_KEY, MvBadge } from "../chrome";
import { ICONS } from "../meta";
import type { Approval, LiveState } from "../types";
import { AccountPreview } from "./account";
import { JournalPreview } from "./journal";
import { MappingPreview } from "./mapping";
import { AcctRef, Amount, FlowArrow, PreviewCard } from "./shared";
import { TransactionPreview } from "./transaction";
import { UpstreamPreview } from "./upstream";

/** Renders whichever preview the approval's `kind` selects. */
export function ChangePreview({ approval }: { approval: Approval }) {
  switch (approval.kind) {
    case "journal":
      return <JournalPreview approval={approval} change={approval.change} />;
    case "transaction":
      return <TransactionPreview approval={approval} change={approval.change} />;
    case "account":
      return <AccountPreview approval={approval} change={approval.change} />;
    case "mapping":
      return <MappingPreview change={approval.change} />;
    case "upstream":
      return <UpstreamPreview approval={approval} change={approval.change} />;
  }
}

/** Merivio's `.apr-livehead` / `.apr-liverow` track: name, before, arrow, after. */
const LIVE_GRID =
  "grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5 px-[18px] py-2.5";

/**
 * The before/after comparison, hidden behind an explicit "check" so the demo
 * never implies a stale preview was re-read from the ledger.
 */
export function LiveStatePanel({
  live,
  checked,
  onCheck,
}: {
  live: LiveState;
  checked: boolean;
  onCheck: () => void;
}) {
  const [account, before, after] = live.cols;

  return (
    <PreviewCard
      icon="reconcile"
      eyebrow="Live state"
      title="What it looks like now"
      actions={
        checked ? (
          <MvBadge tone="success">Verified · just now</MvBadge>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className={`rounded-mv-md ${MV_BTN_GHOST}`}
            onClick={onCheck}
          >
            <Icon icon={ICONS.revaluation} />
            Check live state
          </Button>
        )
      }
    >
      {checked ? (
        <div className="overflow-x-auto rounded-mv-md border border-mv-border">
          <div className="min-w-[560px]">
            <div
              className={`${LIVE_GRID} border-b border-mv-hair bg-mv-surface-2 tracking-[0.09em] ${MV_KEY}`}
            >
              <span>{account}</span>
              <span>{before}</span>
              <span />
              <span>{after}</span>
            </div>
            {live.rows.map((row) => (
              <div
                key={row.code}
                className={`${LIVE_GRID} border-b border-mv-hair text-mv-md last:border-0`}
              >
                <AcctRef code={row.code} name={row.name} cls={row.cls} />
                {row.nowText !== undefined ? (
                  <span className="truncate text-mv-muted">{row.nowText}</span>
                ) : (
                  <Amount value={row.now ?? 0} dim={row.now === 0} />
                )}
                <FlowArrow />
                {row.afterText !== undefined ? (
                  <span className="truncate font-medium text-mv-ink">
                    {row.afterText}
                  </span>
                ) : (
                  <Amount value={row.after ?? 0} strong />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="max-w-[620px] text-mv-md text-mv-muted">{live.note}</p>
      )}
    </PreviewCard>
  );
}
