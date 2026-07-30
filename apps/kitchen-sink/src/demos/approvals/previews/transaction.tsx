import { Icon } from "@flanksource/clicky-ui";
import { MV_KEY, MvChip } from "../chrome";
import { ICONS, money } from "../meta";
import type { Approval, TransactionChange } from "../types";
import {
  AcctRef,
  Amount,
  DocFact,
  DocGrid,
  IconChip,
  PreviewCard,
  PreviewTable,
  TD_CLASS,
  TD_NUM_CLASS,
  TH_CLASS,
  TH_NUM_CLASS,
} from "./shared";

export function TransactionPreview({
  approval,
  change,
}: {
  approval: Approval;
  change: TransactionChange;
}) {
  return (
    <PreviewCard
      icon={approval.icon}
      eyebrow="The change"
      title={`${change.docType} preview`}
      actions={<MvChip>{change.status}</MvChip>}
    >
      <div className="flex items-start gap-density-2">
        <IconChip icon={approval.icon} className="mt-0.5" />
        <div className="min-w-0">
          <div className="text-mv-lg font-semibold text-mv-ink">
            {change.number} · {change.contact}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-mv-base text-mv-muted">
            <span className="inline-flex items-center gap-1">
              <Icon icon={ICONS.contact} className="text-mv-md" />
              <span className="font-mono">{change.contactRef}</span>
            </span>
            <span className="text-mv-muted-2">·</span>
            <span>{change.terms}</span>
            <span className="text-mv-muted-2">·</span>
            <span>
              {change.lines.length} line{change.lines.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <DocGrid>
        <DocFact
          label="Document"
          value={<span className="font-mono">{change.number}</span>}
        />
        <DocFact
          label="Issued"
          value={<span className="font-mono">{change.date}</span>}
        />
        <DocFact
          label="Due"
          value={<span className="font-mono">{change.due}</span>}
        />
        <DocFact label="Contact" value={change.contact} />
      </DocGrid>

      <PreviewTable minWidth={780}>
        <thead>
          <tr>
            <th className={TH_CLASS}>Account</th>
            <th className={TH_CLASS}>Description</th>
            <th className={TH_NUM_CLASS}>Qty</th>
            <th className={TH_NUM_CLASS}>Unit</th>
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
              <td className={`${TD_NUM_CLASS} font-mono text-mv-muted`}>
                {line.qty}
              </td>
              <td className={TD_NUM_CLASS}>
                <Amount value={line.unit} />
              </td>
              <td className={TD_NUM_CLASS}>
                <Amount value={line.tax} dim />
              </td>
              <td className={TD_NUM_CLASS}>
                <Amount value={line.gross} strong />
              </td>
            </tr>
          ))}
        </tbody>
      </PreviewTable>

      <div className="flex flex-wrap justify-end gap-density-4">
        <TotalCell label="Net" value={money(change.totals.net)} />
        <TotalCell label="Tax" value={money(change.totals.tax)} />
        <TotalCell
          label={`Gross · ${approval.currency}`}
          value={money(change.totals.gross)}
          grand
        />
      </div>
    </PreviewCard>
  );
}

function TotalCell({
  label,
  value,
  grand,
}: {
  label: string;
  value: string;
  grand?: boolean;
}) {
  return (
    <div className="space-y-1 text-right">
      <div className={MV_KEY}>{label}</div>
      <div
        className={
          grand
            ? "font-mono text-mv-title font-semibold tabular-nums text-mv-ink"
            : "font-mono text-mv-lg tabular-nums text-mv-ink-2"
        }
      >
        {value}
      </div>
    </div>
  );
}
