import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CodeBlock,
  Icon,
  KeyValueList,
  Panel,
  Section,
  Timeline,
  UiArrowLeft,
  UiArrowRight,
  cn,
  type BadgeTone,
  type Comment,
  type CommentCreateInput,
  type TimelineItem,
} from "@flanksource/clicky-ui";
import { ApprovalRail } from "./ApprovalRail";
import {
  MV_BODY,
  MV_BTN_DANGER,
  MV_BTN_GHOST,
  MV_BTN_PRIMARY,
  MV_CARD,
  MV_HEAD,
  MV_KEY,
  MvBadge,
  MvChip,
  MvCount,
  MvMark,
  MvSecTitle,
} from "./chrome";
import {
  DIRECTION_META,
  ENTITY,
  ICONS,
  ICON_TONES,
  KIND_META,
  ORG,
  money,
  readinessTone,
  ruleName,
  shortId,
} from "./meta";
import { ChangePreview, LiveStatePanel } from "./previews";
import type { Approval, ApprovalCheck, ApprovalState } from "./types";

const STATE_TONE: Record<ApprovalState, BadgeTone> = {
  proposed: "info",
  approved: "success",
  rejected: "danger",
};

const STATE_LABEL: Record<ApprovalState, string> = {
  proposed: "Proposed",
  approved: "Approved",
  rejected: "Rejected",
};

/** Merivio's `.apr-fact`: a tinted glyph, a label and a value with a unit. */
function Fact({
  icon,
  label,
  value,
  unit,
  mono,
  small,
}: {
  icon: keyof typeof ICONS;
  label: string;
  value: string;
  unit?: string;
  mono?: boolean;
  /** Merivio's `.apr-fv-sm`, for values too long to sit at the headline size. */
  small?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1.5 px-[18px] pb-[13px] pt-[11px]">
      <div className={`flex items-center gap-1.5 tracking-[0.1em] ${MV_KEY}`}>
        <Icon icon={ICONS[icon]} className="text-mv-md" />
        {label}
      </div>
      <div
        className={cn(
          "truncate font-semibold text-mv-ink",
          mono && "font-mono",
          small ? "text-mv-lg" : "text-mv-title",
        )}
      >
        {value}
        {unit !== undefined && (
          <span className="pl-1.5 font-sans text-mv-xs font-normal text-mv-muted">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Once the live state has been re-read, the "not verified" check turns into a
 * cleared one — the same substitution Merivio makes.
 */
function applyLiveCheck(
  checks: ApprovalCheck[],
  checked: boolean,
): ApprovalCheck[] {
  if (!checked) return checks;
  return checks.map((check) =>
    check.title === "Live state not verified"
      ? {
          tone: "ok",
          icon: "paid",
          title: "Live state verified",
          detail: "Re-read just now — the ledger matches the preview basis.",
        }
      : check,
  );
}

function timelineItems(
  approval: Approval,
  decidedNow: ApprovalState | null,
): TimelineItem[] {
  const items: TimelineItem[] = approval.timeline.map((event, index) => ({
    id: index,
    icon: ICONS[event.icon],
    tone: ICON_TONES[event.icon],
    actor: event.who,
    action: event.what,
    timestamp: event.at,
  }));
  if (decidedNow === "approved") {
    items.push({
      id: "decision",
      icon: ICONS.paid,
      tone: "success",
      actor: "Ruan B.",
      action: `approved the change. ${
        approval.direction === "outbound"
          ? `Queued for write to ${approval.connector}.`
          : "Queued to post."
      }`,
      timestamp: "just now",
    });
  }
  if (decidedNow === "rejected") {
    items.push({
      id: "decision",
      icon: ICONS.reversal,
      tone: "danger",
      actor: "Ruan B.",
      action: "rejected the change. Nothing applied.",
      timestamp: "just now",
    });
  }
  return items;
}

export type ApprovalDetailProps = {
  /** The approval with its effective (possibly just-decided) state. */
  approval: Approval;
  /** The open queue the prev/next arrows step through. */
  queue: Approval[];
  onBack: () => void;
  onNavigate: (id: string) => void;
  /** `null` undoes a decision made in this session. */
  onDecide: (id: string, state: ApprovalState | null) => void;
};

export function ApprovalDetail({
  approval,
  queue,
  onBack,
  onNavigate,
  onDecide,
}: ApprovalDetailProps) {
  const [liveChecked, setLiveChecked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  const decision: ApprovalState | "pending" =
    approval.state === "proposed" ? "pending" : approval.state;
  /** A fixture-resolved approval carries `resolvedBy`; a fresh decision doesn't. */
  const decidedNow =
    approval.resolvedBy === undefined && approval.state !== "proposed"
      ? approval.state
      : null;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        ["TEXTAREA", "INPUT", "SELECT"].includes(target.tagName ?? "")
      )
        return;
      if (event.key === "a" || event.key === "A")
        onDecide(approval.id, "approved");
      if (event.key === "r" || event.key === "R")
        onDecide(approval.id, "rejected");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [approval.id, onDecide]);

  const checks = useMemo(
    () => applyLiveCheck(approval.checks, liveChecked),
    [approval.checks, liveChecked],
  );
  const events = useMemo(
    () => timelineItems(approval, decidedNow),
    [approval, decidedNow],
  );

  const index = queue.findIndex((item) => item.id === approval.id);
  const previous = index > 0 ? queue[index - 1] : undefined;
  const next =
    index >= 0 && index < queue.length - 1 ? queue[index + 1] : undefined;
  const kind = KIND_META[approval.kind];
  const direction = DIRECTION_META[approval.direction];

  function addComment(input: CommentCreateInput) {
    setComments((current) => [
      ...current,
      {
        id: `c${current.length + 1}`,
        body: input.body,
        createdAt: new Date().toISOString(),
        author: { name: "Ruan B.", kind: "user" },
        status: "open",
        ...(input.facets ? { facets: input.facets } : {}),
      },
    ]);
  }

  return (
    <div className="flex min-w-0 flex-col gap-density-4">
      {/* `.apr-bar` — the paper-coloured rail that stays put while the page
          scrolls. `-mx-6` cancels the page gutter so it bleeds edge to edge. */}
      <div className="sticky top-0 z-20 -mx-6 flex flex-wrap items-center justify-between gap-density-2 border-b border-mv-hair bg-mv-paper px-6 py-[9px]">
        <div className="flex min-w-0 items-center gap-density-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-mv-md font-medium text-mv-ink-2 hover:text-mv-ink"
          >
            <Icon icon={UiArrowLeft} className="text-base text-mv-muted" />
            Approval requests
          </button>
          <span className="truncate border-l border-mv-border pl-3 font-mono text-mv-base text-mv-muted">
            {shortId(approval.id)}
          </span>
        </div>
        <div className="flex items-center gap-density-2">
          {index >= 0 && (
            <>
              <MvCount>
                {index + 1} of {queue.length} open
              </MvCount>
              <span className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className={`size-7 rounded-mv-sm ${MV_BTN_GHOST} disabled:opacity-40`}
                  title="Previous"
                  aria-label="Previous open request"
                  disabled={previous === undefined}
                  onClick={() => previous && onNavigate(previous.id)}
                >
                  <Icon icon={UiArrowLeft} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className={`size-7 rounded-mv-sm ${MV_BTN_GHOST} disabled:opacity-40`}
                  title="Next"
                  aria-label="Next open request"
                  disabled={next === undefined}
                  onClick={() => next && onNavigate(next.id)}
                >
                  <Icon icon={UiArrowRight} />
                </Button>
              </span>
            </>
          )}
          {decision === "pending" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className={`rounded-mv-md ${MV_BTN_DANGER}`}
                onClick={() => onDecide(approval.id, "rejected")}
              >
                <Icon icon={ICONS.reversal} />
                Reject
              </Button>
              <Button
                size="sm"
                className={`rounded-mv-md ${MV_BTN_PRIMARY}`}
                onClick={() => onDecide(approval.id, "approved")}
              >
                <Icon icon={ICONS.paid} />
                Approve
              </Button>
            </>
          ) : (
            <MvBadge tone={STATE_TONE[approval.state]}>
              {STATE_LABEL[approval.state]}
            </MvBadge>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-start gap-density-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-density-4">
          <Panel className={MV_CARD} padded={false}>
            <div className="flex items-start gap-density-3 px-[18px] pb-[15px] pt-4">
              <MvMark
                size="lg"
                icon={ICONS[approval.icon]}
                tone={ICON_TONES[approval.icon]}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <h1 className="flex flex-wrap items-center gap-density-2 text-mv-title font-semibold text-mv-ink">
                  {approval.title}
                  <MvBadge tone={STATE_TONE[approval.state]}>
                    {STATE_LABEL[approval.state]}
                  </MvBadge>
                  <MvBadge tone={readinessTone(approval.readiness)}>
                    {approval.readiness}
                  </MvBadge>
                </h1>
                <div className="flex flex-wrap items-center gap-density-2 text-mv-base text-mv-muted">
                  <span className="flex items-center gap-1.5">
                    <Icon icon={ICONS[kind.icon]} className="text-base" />
                    {kind.label}
                  </span>
                  <span className="text-mv-muted-2">·</span>
                  <span className="flex items-center gap-1.5">
                    <Icon icon={direction.icon} className="text-base" />
                    {direction.label}
                  </span>
                  <span className="text-mv-muted-2">·</span>
                  <span>{approval.connector}</span>
                  <span className="text-mv-muted-2">·</span>
                  <MvChip mono>{approval.module}</MvChip>
                </div>
              </div>
            </div>
            {/* `.apr-facts` — the tinted band of headline figures under the head. */}
            <div className="grid grid-cols-1 divide-y divide-mv-hair border-t border-mv-hair bg-mv-surface-2 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
              {approval.amount === null ? (
                <Fact
                  icon="coa"
                  label="Scope"
                  value={`${approval.targetType} · ${approval.targetId}`}
                  small
                />
              ) : (
                <Fact
                  icon="currency"
                  label="Amount"
                  value={money(approval.amount)}
                  unit={approval.currency}
                  mono
                />
              )}
              <Fact
                icon="contact"
                label="Requested by"
                value={approval.requestedBy}
                unit={`${approval.age} ago`}
                small
              />
              <Fact
                icon="rule"
                label="Raised by rule"
                value={ruleName(approval.id)}
                unit={`v${approval.ruleVersion}`}
                mono
                small
              />
              <Fact
                icon="awaiting"
                label="Resume policy"
                value={approval.policy}
                small
              />
            </div>
          </Panel>

          <ChangePreview approval={approval} />

          {approval.live && (
            <LiveStatePanel
              live={approval.live}
              checked={liveChecked}
              onCheck={() => setLiveChecked(true)}
            />
          )}

          <Section
            className={MV_CARD}
            headerClassName={`${MV_HEAD} [&>button>svg]:text-mv-muted`}
            bodyClassName="px-0 py-0"
            defaultOpen={false}
            icon={ICONS.rule}
            title={
              <MvSecTitle eyebrow="Provenance" title="Where this came from" />
            }
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
                  value: (
                    <span className="font-sans">Merivio Holdings (ZA)</span>
                  ),
                },
                {
                  key: "entity",
                  label: "Entity",
                  value: (
                    <span className="font-sans">Merivio Trading (Pty) Ltd</span>
                  ),
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
        </div>

        <ApprovalRail
          approval={approval}
          decision={decision}
          onDecide={(state) =>
            onDecide(approval.id, state === "pending" ? null : state)
          }
          checks={checks}
          comments={comments}
          onComment={addComment}
        />
      </div>
    </div>
  );
}
