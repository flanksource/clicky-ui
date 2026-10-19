import type { ApprovalKind, ApprovalRequest } from "./approval-request";
import type { SessionEvent } from "./SessionViewer.model";

export interface SessionPendingTool {
  tool: string;
  input?: Record<string, unknown>;
  toolCallId?: string;
  approvalId?: string;
  sessionId?: string;
  /** What kind of approval this is. Absent means an untyped tool approval, which
   *  renders as Allow / Reject. */
  kind?: ApprovalKind;
  /** The typed approval request; drives the per-kind controls. */
  request?: ApprovalRequest;
}

export function mergePendingTools(
  events: SessionEvent[],
  pendingTools: readonly SessionPendingTool[],
): SessionEvent[] {
  const merged = [...events];
  for (const [index, pending] of pendingTools.entries()) {
    const matches = merged.filter(
      (event) =>
        event.kind === "tool" &&
        ((pending.toolCallId && event.toolCallId === pending.toolCallId) ||
          (pending.approvalId && event.approvalId === pending.approvalId) ||
          (pending.sessionId &&
            event.sessionId === pending.sessionId &&
            event.tool === pending.tool)),
    );
    const match = matches.length === 1 ? matches[0] : undefined;
    if (match) {
      Object.assign(match, {
        pending: true,
        toolInput: pending.input ?? match.toolInput,
        toolCallId: pending.toolCallId ?? match.toolCallId,
        approvalId: pending.approvalId ?? match.approvalId,
        sessionId: pending.sessionId ?? match.sessionId,
        ...approvalFields(pending),
      });
    } else {
      merged.push({
        id: `pending-${
          pending.approvalId ?? pending.toolCallId ?? `${pending.tool}-${index}`
        }`,
        kind: "tool",
        tool: pending.tool,
        ...(pending.input ? { toolInput: pending.input } : {}),
        ...(pending.toolCallId ? { toolCallId: pending.toolCallId } : {}),
        ...(pending.approvalId ? { approvalId: pending.approvalId } : {}),
        ...(pending.sessionId ? { sessionId: pending.sessionId } : {}),
        ...approvalFields(pending),
        pending: true,
      });
    }
  }
  return merged;
}

function approvalFields(
  pending: SessionPendingTool,
): Pick<SessionEvent, "approvalKind" | "approvalRequest"> {
  const kind = pending.kind ?? pending.request?.kind;
  return {
    ...(kind ? { approvalKind: kind } : {}),
    ...(pending.request ? { approvalRequest: pending.request } : {}),
  };
}
