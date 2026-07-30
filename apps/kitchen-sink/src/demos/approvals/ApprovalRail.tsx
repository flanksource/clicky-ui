import {
  Button,
  CommentCard,
  CommentComposer,
  Icon,
  Panel,
  UiChatDots,
  type Comment,
  type CommentConfig,
  type CommentCreateInput,
} from "@flanksource/clicky-ui";
import {
  MV_BODY,
  MV_BTN_DANGER,
  MV_BTN_GHOST,
  MV_BTN_PRIMARY,
  MV_CARD,
  MV_HEAD,
  MvBadge,
  MvKbd,
  MvMark,
  MvSecTitle,
} from "./chrome";
import { CHECK_TONES, ICONS, approveLabel } from "./meta";
import type { Approval, ApprovalCheck, ApprovalState } from "./types";

/**
 * Category / severity as generic comment facets — the library owns the chips,
 * the demo only declares the vocabulary.
 */
export const COMMENT_CONFIG: CommentConfig = {
  statuses: [
    { value: "open", label: "Open", tone: "info", unresolved: true },
    { value: "resolved", label: "Resolved", tone: "success" },
  ],
  facets: [
    {
      key: "category",
      label: "Category",
      options: [
        { value: "question", label: "Question", short: "Q" },
        { value: "evidence", label: "Evidence", short: "EV" },
        {
          value: "rule_defect",
          label: "Rule defect",
          short: "RD",
          tone: "warning",
        },
        { value: "tax_position", label: "Tax position", short: "TP" },
      ],
    },
    {
      key: "severity",
      label: "Severity",
      options: [
        { value: "info", label: "Info", tone: "neutral" },
        { value: "warning", label: "Warning", tone: "warning" },
        { value: "blocker", label: "Blocker", tone: "danger" },
      ],
    },
  ],
};

function DecisionPanel({
  approval,
  decision,
  onDecide,
  checks,
}: {
  approval: Approval;
  decision: ApprovalState | "pending";
  onDecide: (state: ApprovalState | "pending") => void;
  checks: ApprovalCheck[];
}) {
  const openChecks = checks.filter((check) => check.tone !== "ok").length;
  const blocked = checks.some((check) => check.tone === "bad");

  if (decision !== "pending") {
    const approved = decision === "approved";
    return (
      <Panel
        className={MV_CARD}
        headerClassName={MV_HEAD}
        bodyClassName="px-4 pb-4 pt-[14px]"
        icon={ICONS.awaiting}
        title={<MvSecTitle eyebrow="Decision" />}
      >
        <div className="space-y-density-3">
          {/* `.apr-result` — the outcome wash, no border, colour carries it. */}
          <div
            className={
              approved
                ? "flex items-start gap-density-2 rounded-mv-md bg-mv-accent-soft px-[13px] py-3 text-mv-base text-mv-accent"
                : "flex items-start gap-density-2 rounded-mv-md bg-mv-negative-soft px-[13px] py-3 text-mv-base text-mv-negative"
            }
          >
            <Icon
              icon={approved ? ICONS.paid : ICONS.reversal}
              className="mt-0.5 shrink-0 text-base"
            />
            <span>
              <b className="block font-semibold">
                {approved ? "Approved" : "Rejected"}
              </b>
              {approval.resolvedBy
                ? `${approval.resolvedBy} · ${approval.resolvedAt}`
                : approved
                  ? "Queued. Idempotency key recorded — a repeat evaluation is a no-op."
                  : "Nothing was applied. Leave a reason so the rule owner can amend."}
            </span>
          </div>
          {/* Only a decision taken in this session can be taken back; a
              fixture-resolved request has no local override to drop. */}
          {approval.resolvedBy === undefined && (
            <Button
              size="sm"
              variant="outline"
              className={`w-full rounded-mv-md ${MV_BTN_GHOST}`}
              onClick={() => onDecide("pending")}
            >
              Undo
            </Button>
          )}
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      className={MV_CARD}
      headerClassName={MV_HEAD}
      bodyClassName="px-4 pb-4 pt-[14px]"
      icon={ICONS.awaiting}
      title={<MvSecTitle eyebrow="Decision" />}
    >
      <div className="space-y-density-2">
        <Button
          className={`h-auto w-full rounded-mv-md py-2.5 text-mv-lg ${MV_BTN_PRIMARY}`}
          onClick={() => onDecide("approved")}
        >
          <Icon icon={ICONS.paid} />
          {approveLabel(approval)}
          <MvKbd>A</MvKbd>
        </Button>
        <Button
          variant="outline"
          className={`h-auto w-full rounded-mv-md py-2.5 text-mv-lg ${MV_BTN_DANGER}`}
          onClick={() => onDecide("rejected")}
        >
          <Icon icon={ICONS.reversal} />
          Reject
          <MvKbd>R</MvKbd>
        </Button>
        <p className="pt-density-1 text-mv-sm leading-5 text-mv-muted">
          Policy <b className="font-medium text-mv-ink-2">{approval.module}</b>{" "}
          requires approval before{" "}
          {approval.direction === "outbound"
            ? `the write reaches ${approval.connector}`
            : "anything is posted"}
          . <b className="font-medium text-mv-ink-2">No named approvers</b> — any
          operator with the{" "}
          <span className="font-mono text-mv-xs">ledger.approve</span> scope may
          act.
        </p>
        {blocked ? (
          <p className="text-mv-sm leading-5 text-mv-negative">
            A pre-flight check failed. Approving anyway will post a change the
            ledger flagged.
          </p>
        ) : openChecks > 0 ? (
          <p className="text-mv-sm leading-5 text-mv-warm">
            {openChecks} check{openChecks > 1 ? "s" : ""} still open.
          </p>
        ) : null}
      </div>
    </Panel>
  );
}

function PreflightPanel({ checks }: { checks: ApprovalCheck[] }) {
  const clear = checks.filter((check) => check.tone === "ok").length;
  return (
    <Panel
      className={MV_CARD}
      headerClassName={MV_HEAD}
      icon={ICONS.trial_balance}
      title={<MvSecTitle eyebrow="Pre-flight" />}
      padded={false}
      actions={
        <MvBadge tone={clear === checks.length ? "success" : "warning"}>
          {clear}/{checks.length} clear
        </MvBadge>
      }
    >
      {/* `.apr-check` rows — cleared checks recede rather than disappear. */}
      <div className="divide-y divide-mv-hair">
        {checks.map((check) => (
          <div
            key={check.title}
            className={
              check.tone === "ok"
                ? "flex items-start gap-density-2 px-[18px] py-2.5 opacity-70"
                : "flex items-start gap-density-2 px-[18px] py-2.5"
            }
          >
            <MvMark
              icon={ICONS[check.icon]}
              tone={CHECK_TONES[check.tone]}
              className="mt-0.5 size-5 rounded-[5px] text-[13px]"
            />
            <span className="min-w-0">
              <div className="text-mv-base font-medium text-mv-ink">
                {check.title}
              </div>
              <div className="text-mv-sm leading-5 text-mv-muted">
                {check.detail}
              </div>
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CommentsPanel({
  comments,
  onComment,
}: {
  comments: Comment[];
  onComment: (input: CommentCreateInput) => void;
}) {
  return (
    <Panel
      className={MV_CARD}
      headerClassName={MV_HEAD}
      icon={UiChatDots}
      title={<MvSecTitle eyebrow="Comments" />}
      count={comments.length}
      bodyClassName={`${MV_BODY} space-y-density-3`}
    >
      {comments.length === 0 ? (
        <div className="flex items-center gap-density-2 rounded-mv-md border border-dashed border-mv-border px-density-3 py-density-3 text-mv-base text-mv-muted">
          <Icon icon={UiChatDots} className="text-base" />
          No comments on this request.
        </div>
      ) : (
        <div className="space-y-density-2">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              config={COMMENT_CONFIG}
              compact
              defaultExpanded
            />
          ))}
        </div>
      )}
      <CommentComposer
        config={COMMENT_CONFIG}
        placeholder="Note what you checked, or what the rule owner must fix…"
        onCreate={onComment}
      />
    </Panel>
  );
}

export type ApprovalRailProps = {
  approval: Approval;
  decision: ApprovalState | "pending";
  onDecide: (state: ApprovalState | "pending") => void;
  /** Checks after the live-state override is folded in. */
  checks: ApprovalCheck[];
  comments: Comment[];
  onComment: (input: CommentCreateInput) => void;
};

/**
 * The decision rail: what you can do, what the ledger checked, and what
 * anyone said about it. Sticky beside the detail body on wide viewports,
 * stacked underneath below `lg`.
 */
export function ApprovalRail({
  approval,
  decision,
  onDecide,
  checks,
  comments,
  onComment,
}: ApprovalRailProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 self-start lg:sticky lg:top-[60px] lg:w-[344px]">
      <DecisionPanel
        approval={approval}
        decision={decision}
        onDecide={onDecide}
        checks={checks}
      />
      <PreflightPanel checks={checks} />
      <CommentsPanel comments={comments} onComment={onComment} />
    </aside>
  );
}
