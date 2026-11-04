import { useState } from "react";
import { Button, CommentAuthorAvatar, Timestamp, type Comment } from "@flanksource/clicky-ui";
import { AgentIdentity } from "@flanksource/clicky-ui/chat";
import { SessionInspector } from "@flanksource/clicky-ui/ai";
import type { PageComment } from "../comments/useComments";
import { useAgentRuns } from "./AgentRunsProvider";
import { agentSessionSrc } from "./agent-runs-api";
import { commentAgentSessions } from "./comment-agents";
import { RuntimeIdentity } from "./RuntimeIdentity";

export function CommentAgents({ thread }: { thread: readonly Comment[] }) {
  const { data, error } = useAgentRuns();
  const [selected, setSelected] = useState<string>();
  const sessions = commentAgentSessions(thread, data);
  const inspected = sessions.find(entry => entry.id === selected);
  const people = thread.flatMap(comment => [
    ...(comment.author?.kind === "agent" ? [{ author: comment.author, role: "Author" }] : []),
    ...(comment.assignee ? [{ author: comment.assignee, role: "Assignee" }] : []),
    ...(comment.acknowledgedBy ? [{ author: comment.acknowledgedBy, role: "Acknowledged" }] : []),
  ]);
  return <section className="space-y-3 text-xs" aria-label="Thread and page agents">
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {people.length > 0 && <ul className="space-y-2">{people.map(({ author, role }, index) => <li key={`${role}:${index}`} className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground">{role}</span>
      {author.kind === "agent" ? <AgentIdentity label={author.name} model={author.name} {...(author.sessionId ? { identityId: author.sessionId } : {})} /> : <><CommentAuthorAvatar author={author} bare /><span>{author.name}</span></>}
      {author.via && <span>via {author.via}</span>}
      {author.cost !== undefined && <span>${author.cost.toFixed(4)} reported cost</span>}
      {author.sessionId && <code className="break-all">{author.sessionId}</code>}
    </li>)}</ul>}
    {(thread as readonly PageComment[]).map(comment => <div key={comment.id} className="space-y-1">
      {comment.agentRun && <div>{comment.agentRun.state} · requested <Timestamp value={comment.agentRun.requestedAt} format="relative" />
        {comment.agentRun.target && <p>{comment.agentRun.target.label}{comment.agentRun.target.channel ? ` via ${comment.agentRun.target.channel}` : ""}</p>}
        {comment.agentRun.error && <p role="alert" className="whitespace-pre-wrap text-destructive">{comment.agentRun.error}</p>}
      </div>}
      {comment.promptRun && <details><summary>Prompt: {comment.promptRun.promptName}</summary><pre className="overflow-auto whitespace-pre-wrap">{JSON.stringify(comment.promptRun, null, 2)}</pre></details>}
    </div>)}
    {!data && !error && <p role="status">Loading page sessions…</p>}
    {data && sessions.length === 0 && <p className="text-muted-foreground">No agent sessions are linked to this thread or page.</p>}
    <ul className="space-y-2">{sessions.map(entry => <li key={entry.id} className="rounded-md border border-border p-2">
      <button type="button" className="flex w-full flex-wrap items-center gap-2 text-left" aria-pressed={selected === entry.id} onClick={() => setSelected(entry.id)}>
        {entry.session ? <RuntimeIdentity runtime={entry.session.runtime} /> : <AgentIdentity label={entry.label ?? "Historical session"} />}
        <span className="text-muted-foreground">{entry.associations.join(" · ")}</span>
        {entry.session && <span>{entry.session.state} · <Timestamp value={entry.session.startedAt} format="relative" />{entry.session.endedAt && <> · ended <Timestamp value={entry.session.endedAt} format="relative" /></>}</span>}
        <code className="w-full break-all text-muted-foreground">{entry.id}</code>
      </button>
      {entry.session?.error && <p role="alert" className="text-destructive">{entry.session.error}</p>}
      {!entry.session && <p className="mt-1 text-muted-foreground">Historical or external session. Select to load its retained Captain context.</p>}
    </li>)}</ul>
    {inspected && <div className="space-y-2">
      <div className="flex items-center justify-between"><code>{inspected.id}</code><Button size="sm" variant="ghost" onClick={() => setSelected(undefined)}>Close session</Button></div>
      <div className="h-[60vh] min-h-0 overflow-hidden rounded-md border border-border"><SessionInspector key={inspected.id} src={agentSessionSrc(inspected.id)} follow={inspected.session?.state === "running"} layout="compact" /></div>
    </div>}
  </section>;
}
