import { useState } from "react";
import { KeyValueList } from "../KeyValueList";
import { Icon } from "../Icon";
import { UiClock } from "../../icons";
import { ToolCall } from "../chat/ToolCall";
import type { AnyToolPart } from "../chat/types";
import { durationLabel, formatDate } from "./SessionInspector.model";
import { EmptyState, SimpleList, kv } from "./SessionInspector.panel-parts";
import type {
  SessionApprovalRequest,
  SessionApprovalStats,
} from "./SessionViewer.unified";

/** Approve or deny one pending approval. */
export type ApprovalResolveAction = "approve" | "deny";

/** Resolves one `session.requests[]` row. Rejecting surfaces the server's
 *  refusal text inline on that row (e.g. the prompt run is no longer
 *  `waiting`) instead of leaving the Approve/Deny buttons silently inert. */
export type ApprovalResolveHandler = (
  approvalId: string,
  action: ApprovalResolveAction,
  message?: string,
) => void | Promise<void>;

/** The subset of `session.requests[]` this panel surfaces: outstanding tool
 *  approvals, regardless of which surface (in-process chat or an external
 *  broker) created the request. */
export function pendingApprovalRequests(
  requests: SessionApprovalRequest[] | undefined,
): SessionApprovalRequest[] {
  return (requests ?? []).filter(
    (request) => request.state === "pending" && request.kind === "tool_approval",
  );
}

/** Renders every pending tool approval directly from `session.requests[]`
 *  (never from transcript parts — an approval brokered outside this session's
 *  own chat has no transcript part) plus the resolved approve/deny/denial
 *  summary the panel previously showed alone. */
export function SessionApprovalsPanel({
  approvals,
  requests,
  onResolve,
}: {
  approvals: SessionApprovalStats | undefined;
  requests?: SessionApprovalRequest[] | undefined;
  onResolve?: ApprovalResolveHandler;
}) {
  const pending = pendingApprovalRequests(requests);
  const hasResolvedSummary = Boolean(
    approvals &&
      (approvals.approved ||
        approvals.denied ||
        approvals.cancelled ||
        approvals.expired ||
        approvals.denials?.length),
  );

  if (!pending.length && !hasResolvedSummary) {
    return <EmptyState>No approval metadata.</EmptyState>;
  }

  return (
    <div className="space-y-density-4">
      {pending.length ? (
        <PendingApprovalsList
          requests={pending}
          {...(onResolve ? { onResolve } : {})}
        />
      ) : null}
      {hasResolvedSummary ? (
        <ResolvedApprovalsSummary approvals={approvals!} />
      ) : null}
    </div>
  );
}

function ResolvedApprovalsSummary({
  approvals,
}: {
  approvals: SessionApprovalStats;
}) {
  return (
    <div className="space-y-density-4">
      <KeyValueList
        items={[
          kv("Approved", approvals.approved ?? 0),
          kv("Denied", approvals.denied ?? 0),
          kv("Cancelled", approvals.cancelled ?? 0),
          kv("Expired", approvals.expired ?? 0),
        ]}
      />
      {approvals.denials?.length ? (
        <SimpleList
          title="Denials"
          rows={approvals.denials.map((denial, index) => ({
            key: denial.toolUseId || `${denial.tool}-${index}`,
            title: [denial.tool, denial.toolUseId].filter(Boolean).join(" "),
            detail: denial.reason,
          }))}
        />
      ) : null}
    </div>
  );
}

function PendingApprovalsList({
  requests,
  onResolve,
}: {
  requests: SessionApprovalRequest[];
  onResolve?: ApprovalResolveHandler;
}) {
  return (
    <section>
      <h3 className="mb-density-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">
        <Icon icon={UiClock} className="size-3.5" />
        Awaiting approval ({requests.length})
      </h3>
      <ul className="space-y-density-2">
        {requests.map((request) => (
          <li key={request.id}>
            <PendingApprovalRow
              request={request}
              {...(onResolve ? { onResolve } : {})}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PendingApprovalRow({
  request,
  onResolve,
}: {
  request: SessionApprovalRequest;
  onResolve?: ApprovalResolveHandler;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const part: AnyToolPart = {
    type: "dynamic-tool",
    toolName: request.tool,
    toolCallId: request.toolCallId || request.id,
    state: "approval-requested",
    input: request.input,
    approval: { id: request.id },
  };

  const handleApprove = (
    approvalId: string,
    approved: boolean,
    reason?: string,
  ) => {
    if (!onResolve) return;
    setError(undefined);
    setBusy(true);
    void Promise.resolve(onResolve(approvalId, approved ? "approve" : "deny", reason))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setBusy(false));
  };

  return (
    <div className="rounded-md border border-amber-300/60 bg-amber-50/40 p-density-3 dark:border-amber-800/60 dark:bg-amber-950/20">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>
          {request.requestedBy
            ? `Requested by ${request.requestedBy}`
            : "Requested"}
        </span>
        <span className="flex gap-density-3">
          {request.createdAt ? (
            <span title={formatDate(request.createdAt)}>
              {ageLabel(request.createdAt)} ago
            </span>
          ) : null}
          {request.expiresAt ? (
            <span title={formatDate(request.expiresAt)}>
              {remainingLabel(request.expiresAt)}
            </span>
          ) : null}
        </span>
      </div>
      <ToolCall
        part={part}
        defaultOpen
        onApprove={busy ? undefined : handleApprove}
      />
      {busy ? (
        <p className="mt-1.5 pl-4 text-xs text-muted-foreground">
          Submitting…
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1.5 pl-4 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ageLabel(createdAt: string): string {
  return durationLabel(createdAt) || "0s";
}

function remainingLabel(expiresAt: string): string {
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return "";
  const now = Date.now();
  if (expiry <= now) return "expired";
  const label = durationLabel(new Date(now).toISOString(), expiresAt);
  return label ? `${label} left` : "";
}
