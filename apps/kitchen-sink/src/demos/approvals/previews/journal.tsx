import { Icon } from "@flanksource/clicky-ui";
import { MV_KEY, MvBadge, MvChip } from "../chrome";
import { ICONS, money } from "../meta";
import type { Approval, JournalChange, JournalLine } from "../types";
import {
  AcctRef,
  Amount,
  FlowArrow,
  IconChip,
  PreviewCard,
  PreviewTable,
  TD_CLASS,
  TD_NUM_CLASS,
  TH_CLASS,
  TH_NUM_CLASS,
} from "./shared";

/** Merivio's `.apr-node`: one side of the credit → debit flow. */
function FlowNode({ line }: { line: JournalLine }) {
  const credit = line.dir === "credit";
  return (
    <div className="min-w-0 flex-1 space-y-1.5 rounded-mv-md border border-mv-hair bg-mv-surface-2 px-density-3 py-density-2">
      <div className={`flex items-center gap-1.5 ${MV_KEY}`}>
        <Icon icon={ICONS[credit ? "credit" : "debit"]} className="text-mv-md" />
        {credit ? "Credit source" : "Debit target"}
      </div>
      <AcctRef code={line.code} name={line.name} cls={line.cls} />
      <div className="font-mono text-mv-lg font-semibold tabular-nums text-mv-ink">
        {money(Math.abs(line.gross))}
      </div>
    </div>
  );
}

export function JournalPreview({
  approval,
  change,
}: {
  approval: Approval;
  change: JournalChange;
}) {
  const credit = change.lines.find((line) => line.dir === "credit");
  const debit = change.lines.find((line) => line.dir === "debit");

  return (
    <PreviewCard
      icon="journal"
      eyebrow="The change"
      title="Journal preview"
      actions={<MvBadge tone="success">Balanced</MvBadge>}
    >
      <div className="flex items-start gap-density-2">
        <IconChip icon="journal" className="mt-0.5" />
        <div className="min-w-0">
          <div className="text-mv-lg font-semibold text-mv-ink">
            {change.name}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-mv-base text-mv-muted">
            <span className="font-mono">{change.date}</span>
            <span className="text-mv-muted-2">·</span>
            <MvChip>{change.status}</MvChip>
            <span className="text-mv-muted-2">·</span>
            <span>
              posts to <span className="font-mono">{approval.period}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-density-2">
        {credit && <FlowNode line={credit} />}
        <FlowArrow />
        {debit && <FlowNode line={debit} />}
      </div>

      <PreviewTable minWidth={720}>
        <thead>
          <tr>
            <th className={TH_CLASS}>Account</th>
            <th className={TH_CLASS}>Description</th>
            <th className={TH_CLASS}>Direction</th>
            <th className={TH_NUM_CLASS}>Net</th>
            <th className={TH_NUM_CLASS}>Tax</th>
            <th className={TH_NUM_CLASS}>Gross</th>
          </tr>
        </thead>
        <tbody>
          {change.lines.map((line) => (
            <tr key={line.code} className="border-b border-mv-hair last:border-0">
              <td className={TD_CLASS}>
                <AcctRef code={line.code} name={line.name} icon={line.icon} />
              </td>
              <td className={`${TD_CLASS} text-mv-muted`}>{line.desc}</td>
              <td className={TD_CLASS}>
                <span className="flex items-center gap-1 text-mv-base">
                  <Icon icon={ICONS[line.dir]} className="text-mv-md" />
                  {line.dir === "debit" ? "Debit" : "Credit"}
                </span>
              </td>
              <td className={TD_NUM_CLASS}>
                <Amount value={line.net} />
              </td>
              <td className={TD_NUM_CLASS}>
                <Amount value={line.tax} dim />
              </td>
              <td className={TD_NUM_CLASS}>
                <Amount value={line.gross} strong />
              </td>
            </tr>
          ))}
          <tr className="border-t border-mv-border bg-mv-surface-2">
            <td className={`${TD_CLASS} text-mv-sm text-mv-muted`} colSpan={3}>
              Totals · debit {money(change.debit)} = credit{" "}
              {money(change.credit)}
            </td>
            <td className={TD_NUM_CLASS}>
              <Amount value={0} strong />
            </td>
            <td className={TD_NUM_CLASS}>
              <Amount value={0} dim />
            </td>
            <td className={TD_NUM_CLASS}>
              <Amount value={0} strong />
            </td>
          </tr>
        </tbody>
      </PreviewTable>
    </PreviewCard>
  );
}
