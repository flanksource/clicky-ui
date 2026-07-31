export type ToolApprovalDecision = {
  approvalApi: string;
  threadId: string;
  approvalId: string;
  approved: boolean;
  reason?: string;
};

type ApprovalFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export async function postToolApproval(
  decision: ToolApprovalDecision,
  fetcher: ApprovalFetch = fetch,
): Promise<void> {
  if (!decision.threadId.trim()) {
    throw new Error("A thread id is required to resolve this tool approval.");
  }
  const base = decision.approvalApi.replace(/\/+$/, "");
  const endpoint = `${base}/${encodeURIComponent(decision.threadId)}/approvals/${encodeURIComponent(decision.approvalId)}`;
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      decision.reason
        ? { approved: decision.approved, reason: decision.reason }
        : { approved: decision.approved },
    ),
  });
  if (!response.ok) {
    throw new Error(`Tool approval failed with status ${response.status}.`);
  }
}
