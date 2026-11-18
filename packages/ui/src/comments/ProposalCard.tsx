import { useId, useRef, useState } from "react";
import { Button } from "../components/button";
import { SplitButton } from "../components/SplitButton";
import { Badge, type BadgeTone } from "../data/Badge";
import { Icon } from "../data/Icon";
import { ActionError } from "../data/diagnostics/ActionError";
import {
  formatRelativeTime,
  parseTimestamp,
} from "../data/cells/timestamp-format";
import { DiffStat } from "../data/git/DiffStat";
import { GitDiffPanel } from "../data/git/GitChangeList";
import type { GitDiffPayload } from "../data/git/types";
import { UiChevronDown, UiChevronRight, UiGitCommit } from "../icons";
import { cn } from "../lib/utils";
import { CommentAuthorName } from "./CommentAuthor";
import type {
  CommentProposal,
  CommentProposalCallbacks,
  CommentProposalState,
} from "./comment-types";

export type ProposalCardProps = {
  /** The reply that carries the proposal; passed back through every callback. */
  commentId: string;
  proposal: CommentProposal;
  /** Without decision callbacks the card is read-only; without `loadProposalDiff` it has no diff. */
  callbacks?: CommentProposalCallbacks;
  className?: string;
};

const STATE_CHIP: Record<
  CommentProposalState,
  { label: string; tone: BadgeTone }
> = {
  proposed: { label: "Proposed", tone: "info" },
  applied: { label: "Applied", tone: "success" },
  staged: { label: "Staged", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  revision_requested: { label: "Revision requested", tone: "warning" },
  superseded: { label: "Superseded", tone: "neutral" },
};

type Busy = "apply" | "stage" | "reject" | "revise";
type Form = "reject" | "revise";
type DiffState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; payload: GitDiffPayload }
  | { status: "error"; message: string };

const TEXTAREA_CLASS =
  "min-h-16 w-full resize-y rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary/40 disabled:opacity-50 [@media(pointer:coarse)]:text-base";

function ProposalDecision({ proposal }: { proposal: CommentProposal }) {
  const { state, decidedBy, decidedAt, feedback } = proposal;
  if (state === "proposed") return null;
  const at = parseTimestamp(decidedAt);
  const verb = state === "revision_requested" ? "Revisions requested" : STATE_CHIP[state].label;
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      {state === "superseded" ? (
        <p>Replaced by a newer proposal.</p>
      ) : (
        <p>
          {verb}
          {decidedBy && (
            <>
              {" by "}
              <span className="font-medium text-foreground">
                <CommentAuthorName author={decidedBy} />
              </span>
            </>
          )}
          {at && (
            <>
              {" "}
              <span title={at.toLocaleString()}>{formatRelativeTime(at)}</span>
            </>
          )}
        </p>
      )}
      {feedback && (
        <blockquote className="whitespace-pre-wrap border-l-2 border-border pl-2 text-foreground">
          {feedback}
        </blockquote>
      )}
    </div>
  );
}

function useProposalDiff(
  commentId: string,
  load: CommentProposalCallbacks["loadProposalDiff"],
) {
  const [expanded, setExpanded] = useState(false);
  const [diff, setDiff] = useState<DiffState>({ status: "idle" });

  function toggle() {
    const opening = !expanded;
    setExpanded(opening);
    if (!opening || !load || diff.status === "loading" || diff.status === "ready")
      return;
    setDiff({ status: "loading" });
    load(commentId).then(
      (payload) => setDiff({ status: "ready", payload }),
      (error: unknown) =>
        setDiff({
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        }),
    );
  }

  return { expanded, diff, toggle };
}

/**
 * An agent's proposed patch on a reply: state, changed files, a lazily loaded
 * diff, and — while still `proposed` — Apply / Stage / Reject / Ask for
 * revisions. Props-only: every decision and the diff fetch go through
 * `callbacks`, and a failed decision is shown here, not swallowed.
 */
export function ProposalCard({
  commentId,
  proposal,
  callbacks = {},
  className,
}: ProposalCardProps) {
  const { onApplyProposal, onRejectProposal, onRequestRevision, loadProposalDiff } = callbacks;
  const { expanded, diff, toggle } = useProposalDiff(commentId, loadProposalDiff);
  const [form, setForm] = useState<Form | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<Busy | null>(null);
  const [error, setError] = useState<{ error: unknown; title: string } | null>(null);
  const busyRef = useRef(false);
  const formId = useId();

  const chip = STATE_CHIP[proposal.state];
  const additions = proposal.files.reduce((sum, file) => sum + file.additions, 0);
  const deletions = proposal.files.reduce((sum, file) => sum + file.deletions, 0);
  const actionable =
    proposal.state === "proposed" &&
    Boolean(onApplyProposal || onRejectProposal || onRequestRevision);

  async function run(kind: Busy, failure: string, action: () => void | Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(kind);
    setError(null);
    try {
      await action();
      setForm(null);
      setText("");
    } catch (cause) {
      setError({ error: cause, title: failure });
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  }

  function openForm(next: Form) {
    setError(null);
    setText("");
    setForm(form === next ? null : next);
  }

  const reason = text.trim();

  return (
    <div
      data-testid="proposal-card"
      data-proposal-state={proposal.state}
      aria-busy={busy !== null}
      className={cn("space-y-2 rounded-md border border-border bg-card p-2.5 text-xs", className)}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Icon icon={UiGitCommit} className="size-3.5 text-muted-foreground" />
        <span className="font-semibold text-foreground">Proposed change</span>
        <code className="font-mono text-[10px] text-muted-foreground" title={proposal.commit}>
          {proposal.commit.slice(0, 7)}
        </code>
        <Badge variant="soft" tone={chip.tone} size="xs">
          {chip.label}
        </Badge>
        <DiffStat
          files={proposal.files.length}
          additions={additions}
          deletions={deletions}
          className="ml-auto text-[11px]"
        />
      </div>

      <ul className="space-y-0.5">
        {proposal.files.map((file) => (
          <li key={file.path} className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-mono text-[11px] text-foreground" title={file.path}>
              {file.path}
            </span>
            <DiffStat additions={file.additions} deletions={file.deletions} className="text-[11px]" />
          </li>
        ))}
      </ul>

      {loadProposalDiff && (
        <div className="overflow-hidden rounded-md border border-border">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={toggle}
            className="flex w-full items-center gap-1 px-2 py-1 text-left font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon icon={expanded ? UiChevronDown : UiChevronRight} className="size-3.5" />
            {expanded ? "Hide diff" : "Show diff"}
          </button>
          {expanded && (
            <GitDiffPanel
              loading={diff.status === "loading" || diff.status === "idle"}
              payload={diff.status === "ready" ? diff.payload : null}
              error={diff.status === "error" ? diff.message : ""}
              maxHeightClassName="max-h-80"
            />
          )}
        </div>
      )}

      <ProposalDecision proposal={proposal} />

      {actionable && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {onApplyProposal && (
              <SplitButton
                size="sm"
                label="Apply"
                title="More ways to apply"
                loading={busy === "apply" || busy === "stage"}
                disabled={busy !== null}
                onClick={() => void run("apply", "Couldn't apply proposal", () => onApplyProposal(commentId, "apply"))}
                items={[
                  {
                    label: "Stage",
                    onSelect: () => void run("stage", "Couldn't stage proposal", () => onApplyProposal(commentId, "stage")),
                  },
                ]}
              />
            )}
            {onRejectProposal && (
              <Button size="sm" variant="outline" disabled={busy !== null} aria-expanded={form === "reject"} onClick={() => openForm("reject")}>
                Reject
              </Button>
            )}
            {onRequestRevision && (
              <Button size="sm" variant="outline" disabled={busy !== null} aria-expanded={form === "revise"} onClick={() => openForm("revise")}>
                Ask for revisions
              </Button>
            )}
          </div>

          {form === "reject" && onRejectProposal && (
            <div className="space-y-1.5">
              <label htmlFor={formId} className="block font-medium text-foreground">
                Reason (optional)
              </label>
              <textarea id={formId} className={TEXTAREA_CLASS} value={text} disabled={busy !== null} onChange={(e) => setText(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" loading={busy === "reject"} disabled={busy !== null} onClick={() => void run("reject", "Couldn't reject proposal", () => onRejectProposal(commentId, reason || undefined))}>
                  Reject proposal
                </Button>
                <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => setForm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {form === "revise" && onRequestRevision && (
            <div className="space-y-1.5">
              <label htmlFor={formId} className="block font-medium text-foreground">
                Revision feedback
              </label>
              <textarea id={formId} className={TEXTAREA_CLASS} value={text} disabled={busy !== null} placeholder="What should change?" onChange={(e) => setText(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" loading={busy === "revise"} disabled={busy !== null || !reason} onClick={() => void run("revise", "Couldn't request revisions", () => onRequestRevision(commentId, reason))}>
                  Send feedback
                </Button>
                <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => setForm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <ActionError
          error={error.error}
          title={error.title}
          context={[["Comment", commentId], ["Proposal", proposal.commit]]}
        />
      )}
    </div>
  );
}
