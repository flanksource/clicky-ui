import { MvBadge, MvChip } from "../chrome";
import { money } from "../meta";
import type { Approval, UpstreamChange } from "../types";
import { Amount, DocFact, DocGrid, PreviewCard } from "./shared";

export function UpstreamPreview({
  approval,
  change,
}: {
  approval: Approval;
  change: UpstreamChange;
}) {
  const [method = "POST", path = change.endpoint] = change.endpoint.split(" ");

  return (
    <PreviewCard
      icon="posting"
      eyebrow="The change"
      title={`Upstream write · ${change.system}`}
      actions={<MvBadge tone="info">{change.mode}</MvBadge>}
    >
      <div className="flex flex-wrap items-center gap-density-2 rounded-mv-md border border-mv-hair bg-mv-surface-2 px-density-3 py-density-2">
        <MvBadge tone="warning" dot={false} className="font-mono">
          {method}
        </MvBadge>
        <span className="min-w-0 truncate font-mono text-mv-md text-mv-ink-2">
          {path}
        </span>
        <span className="text-mv-muted-2">·</span>
        <span className="text-mv-base text-mv-muted">{change.tenant}</span>
      </div>

      <DocGrid>
        <DocFact
          label="Documents"
          value={
            <span className="font-mono">{change.docs.length + change.more}</span>
          }
        />
        <DocFact
          label="Batch value"
          value={
            <span className="font-mono">
              {approval.amount === null ? "—" : money(approval.amount)}
            </span>
          }
        />
        <DocFact
          label="Retries"
          value={<span className="font-mono">{change.retries}</span>}
        />
        <DocFact
          label="Last attempt"
          value={<span className="font-mono">{change.lastAttempt}</span>}
        />
      </DocGrid>

      <div className="overflow-x-auto rounded-mv-md border border-mv-border">
        <div className="min-w-[640px]">
          {change.docs.map((doc) => (
            <div
              key={doc.ref}
              className="grid grid-cols-[10rem_minmax(0,1fr)_8rem_6rem] items-center gap-2.5 border-b border-mv-hair px-[18px] py-2.5 text-mv-md last:border-0"
            >
              <span className="font-mono text-mv-base text-mv-ink-2">
                {doc.ref}
              </span>
              <span className="truncate text-mv-muted">{doc.narr}</span>
              <span className="text-right">
                <Amount value={doc.amount} />
              </span>
              <span className="text-right">
                <MvBadge tone={doc.status === "ready" ? "success" : "warning"}>
                  {doc.status === "ready" ? "Ready" : "Waiting"}
                </MvBadge>
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-mv-base text-mv-muted">
        + {change.more} more documents in batch{" "}
        <MvChip mono>{approval.sourceRecords[1]}</MvChip>
      </p>
    </PreviewCard>
  );
}
