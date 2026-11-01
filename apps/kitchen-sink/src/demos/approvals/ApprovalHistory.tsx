import {
  CodeBlock,
  KeyValueList,
  Section,
  Timeline,
  type TimelineItem,
} from "@flanksource/clicky-ui";
import {
  MV_BODY,
  MV_CARD,
  MV_HEAD,
  MV_KEY,
  MvCount,
  MvSecTitle,
} from "./chrome";
import { ENTITY, ICONS, ORG } from "./meta";
import type { Approval } from "./types";

export function ApprovalProvenance({ approval }: { approval: Approval }) {
  return (
    <Section
      className={MV_CARD}
      headerClassName={`${MV_HEAD} [&>button>svg]:text-mv-muted`}
      bodyClassName="px-0 py-0"
      defaultOpen={false}
      icon={ICONS.rule}
      title={<MvSecTitle eyebrow="Provenance" title="Where this came from" />}
      summary={
        <span className="font-mono text-mv-sm text-mv-muted-2">
          {approval.sourceRecords.join(" · ")}
        </span>
      }
    >
      {/* `.apr-kv` — a two-column grid of stacked key/value cells, ruled
          by hairlines rather than the library's stacked dl rows. */}
      <KeyValueList
        className="grid grid-cols-1 gap-0 divide-y-0 rounded-none border-0 sm:grid-cols-2"
        rowClassName="block gap-0 border-b border-mv-hair px-[18px] py-[9px] sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:border-r-mv-hair"
        labelClassName={`mb-[3px] ${MV_KEY}`}
        valueClassName="truncate font-mono text-mv-base text-mv-ink-2"
        items={[
          {
            key: "org",
            label: "Organisation",
            value: <span className="font-sans">Merivio Holdings (ZA)</span>,
          },
          {
            key: "entity",
            label: "Entity",
            value: <span className="font-sans">Merivio Trading (Pty) Ltd</span>,
          },
          { key: "org-id", label: "Org id", value: ORG },
          { key: "entity-id", label: "Entity id", value: ENTITY },
          { key: "rule", label: "Rule", value: approval.id },
          { key: "rule-id", label: "Rule id", value: approval.ruleId },
          {
            key: "target",
            label: "Target",
            value: `${approval.targetType} · ${approval.targetId}`,
          },
          {
            key: "version",
            label: "Rule version",
            value: `v${approval.ruleVersion} · created ${approval.created.slice(0, 10)}`,
          },
          {
            key: "idempotency",
            label: "Idempotency key",
            value: approval.idempotency,
          },
        ]}
      />
    </Section>
  );
}

export function ApprovalHistory({
  approval,
  events,
}: {
  approval: Approval;
  events: TimelineItem[];
}) {
  return (
    <Section
      className={MV_CARD}
      headerClassName={`${MV_HEAD} [&>button>svg]:text-mv-muted`}
      icon={ICONS.accrual}
      defaultOpen={false}
      title={<MvSecTitle eyebrow="Timeline" title="Request history" />}
      summary={<MvCount>{events.length} events</MvCount>}
      bodyClassName={`${MV_BODY} space-y-density-3`}
    >
      <Timeline items={events} />
      {Object.entries(approval.payloads).length > 0 && (
        <div className="space-y-density-2 border-t border-mv-hair pt-density-3">
          {Object.entries(approval.payloads).map(([label, body]) => (
            <Section key={label} title={label} defaultOpen={false}>
              <CodeBlock language="json" source={body} copyable />
            </Section>
          ))}
        </div>
      )}
    </Section>
  );
}
