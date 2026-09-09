import type { SessionApprovalRequest } from "./SessionViewer.unified";

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

/** The subset of `session.requests[]` the approvals panel surfaces: outstanding
 *  tool approvals, regardless of which surface (in-process chat or an external
 *  broker) created the request.
 *
 *  It lives here rather than beside the panel because it is a selector, not a
 *  component, and a module that exports both loses fast refresh for everything
 *  in it. Its other caller — the SessionInspector tab badge — only ever wanted
 *  the count anyway. */
export function pendingApprovalRequests(
  requests: SessionApprovalRequest[] | undefined,
): SessionApprovalRequest[] {
  return (requests ?? []).filter(
    (request) => request.state === "pending" && request.kind === "tool_approval",
  );
}
