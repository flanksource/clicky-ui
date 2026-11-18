import type { Comment } from "@flanksource/clicky-ui/comments";
import type { AgentSession, AgentSessionsView, SessionAgentTarget } from "./agent-runs-api";
import type { PageComment } from "../comments/useComments";

export type CommentAgentSession = { id: string; associations: string[]; session?: AgentSession; label?: string };

/** `pageTarget` is the session the browser chose for the thread's page, which is kept in localStorage rather than in `data`. */
export function commentAgentSessions(thread: readonly Comment[], data: AgentSessionsView | null, pageTarget?: SessionAgentTarget): CommentAgentSession[] {
  const found = new Map<string, CommentAgentSession>();
  const add = (id: string | undefined, association: string, label?: string) => {
    if (!id) return;
    const existing = found.get(id);
    if (existing) {
      if (!existing.associations.includes(association)) existing.associations.push(association);
    } else {
      const session = data?.sessions.find(entry => entry.sessionId === id);
      found.set(id, { id, associations: [association], ...(session ? { session } : {}), ...(label ? { label } : {}) });
    }
  };
  for (const comment of thread as readonly PageComment[]) {
    add(comment.author?.sessionId, "Author", comment.author?.name);
    add(comment.assignee?.sessionId, "Assignee", comment.assignee?.name);
    add(comment.acknowledgedBy?.sessionId, "Acknowledged", comment.acknowledgedBy?.name);
    add(comment.agentRun?.sessionId, "Thread hand-off", comment.agentRun?.target?.label);
    add(comment.promptRun?.sessionId, "Prompt run", comment.promptRun?.promptName);
  }
  const page = (thread[0] as PageComment | undefined)?.page;
  if (page) {
    if (pageTarget) add(pageTarget.sessionId, "Page target", pageTarget.label);
    for (const session of data?.sessions ?? []) {
      if (session.page === page) add(session.sessionId, "Page session");
      else if (session.page === null && session.purpose !== "target" && data?.settings.grouping === "shared") add(session.sessionId, "Shared session");
    }
  }
  return [...found.values()];
}
