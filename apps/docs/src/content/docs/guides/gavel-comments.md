---
title: Gavel comments
description: Talk to gavel's /api/v1/comments service with one typed client and React hooks for live threads, agents and @-mentions.
---

`@flanksource/clicky-ui/comments/gavel` is the one client for gavel's comments service. It takes the address gavel is served from, so the gavel editor, the Chrome extension and the playground share it instead of each carrying a copy. Everything in it is props-only: no routing and no fetching of its own beyond the `fetch` you hand it.

```tsx
import {
  createGavelCommentsClient,
  projectScope,
  useCommentMentionables,
  useGavelAgents,
  useGavelComments,
} from "@flanksource/clicky-ui/comments/gavel";
```

## Run it against a local gavel

```sh
gavel serve --addr localhost
```

`gavel serve` listens on port 9092. Comments live in the scope of a gavel project, named `gavel://project/<name>`; `projectScope` builds that string with the escaping gavel compares against. A comment's target is a URI under the scope, for example a file in the project.

```tsx
import { useMemo } from "react";
import { createGavelCommentsClient, projectScope, useGavelComments } from "@flanksource/clicky-ui/comments/gavel";

const scope = projectScope("my-project");
const target = `${scope}/files/docs/README.md`;

export function Threads() {
  const client = useMemo(() => createGavelCommentsClient({ baseUrl: "http://localhost:9092", scope }), []);
  const { comments, loading, error } = useGavelComments({ client, filter: { target } });
  if (error) return <p role="alert">{error}</p>;
  if (loading) return <p>Loading…</p>;
  return <ul>{comments.map((comment) => <li key={comment.id}>{comment.body}</li>)}</ul>;
}
```

`useGavelComments` projects gavel's native threads into the shape the comment components take (`Comment`-compatible), so its `comments` can be passed straight to `CommentThreadList`, `CommentCard` and friends. The default projection (`projectNative`) reads any thread gavel holds, so editor, CLI and agent comments, which carry no `content`, work with the example above: it takes the anchor and quote from the target's selector. A host whose comments carry the playground's own metadata opts in with `project: (comment) => project(comment, { attachmentUrl: client.attachmentUrl })`, which fails loudly on a thread without it.

## The client

`createGavelCommentsClient({ baseUrl, scope, fetch })` speaks gavel's native comment shape and covers the whole REST surface. A refusal from gavel is thrown as a `GavelError` carrying the HTTP status and the endpoint; an unreachable gavel names the base URL. Nothing falls back silently.

| Area | Methods |
| --- | --- |
| Read | `list(filter)` (every page), `get(id)` |
| Write | `create({ request, screenshot? })`, `update`, `reply`, `editReply`, `deleteReply`, `status` (resolve, reopen, close, acknowledge), `assign`, `retarget`, `remove`, `act`, `batch` |
| Proposals | `applyProposal` (apply or stage), `rejectProposal`, `requestRevision`, `proposalDiff` |
| Delivery | `deliver`, `deliverBatch`, `previewDelivery`, `agentSessions`, `commentAgent`, `saveCommentAgent` |
| Addressing and read state | `mentionables(target)`, `markRead(target)` |
| Live | `streamEvents({ after, signal, onOpen, onEvent })` |

Every write carries the version the thread was last seen at; a stale version is a `409`.

## Live updates and optimistic writes

`useGavelComments` follows gavel's `/events` stream from a stored cursor, reloads when an event arrives, and reopens the stream after it closes. A failed stream is reported through `error` ("Live updates stopped: ...") rather than looking like an empty thread list.

`create({ preview, request })` shows `preview` at once as a sending comment and swaps it for gavel's stored thread when the create returns. A refused create stays in the list as failed, with gavel's error, until `discard(id)` rolls it back. A reload that started before the post finished is dropped so a saved comment does not flicker away, and is run again once posting settles, so an event that arrived mid-post is not lost; only the newest of concurrent reloads applies. A screenshot travels inside the create request as a base64 attachment, so gavel stores it before routing the thread and an agent receives it with the thread.

## Agents and edits

`useGavelAgents({ client, target, run })` reads the comment agent rule gavel resolves for a target, with the settings layer each field came from (`agent.provenance`), and saves it at `ownLayer`: the project's `.gavel.yaml` when it has one (gavel refuses the database layer beside a settings file), otherwise its database layer. Every save is a JSON merge patch (RFC 7386) of only the fields it changes, which gavel applies under its lock, so what the CLI or a settings file set on the entry survives: `setEnabled(false)` patches `{ enabled: false }`, `setEdits` patches `{ edits }`, and turning auto-run on adds only the prompt and group the entry does not already set. A field set to `null` is removed so it inherits again. Auto-run (`enabled`) and `edits` (`direct` or `propose`) are independent: `setEdits` never turns auto-run on or off. The resolved `session` is the live session `gavel edit --session` routes every new thread to, ahead of the rule; `commentDefaultDelivery({ rule: agents.agent, session: agents.session })` words the composer line for it. Hand-offs can carry `edits` themselves: `DeliverTarget` types it on both the session and the run kind.

`useAgentSessions(client)` lists the sessions a thread can be delivered to, and `useAdoptRunSession` picks up the session gavel records on a thread after a delivery.

## The inbox

`useGavelInbox({ sources })` is the data for `CommentInbox`: it lists every source's threads through its client (each row carries the `anchor` the server resolved for a patch-anchored thread, which is where the inbox gets its deep links), reloads on any scope's events, and offers `markRead({ scope, uri })`. `CommentInbox` itself stays presentational: pass it `listings`, `error` and your handlers.

```tsx
const sources = useMemo(() => [{ project: "my-project", client }], [client]);
const { listings, error, markRead } = useGavelInbox({ sources });
return <CommentInbox listings={listings} error={error} actions={{ onMarkRead: markRead }} filters={filters} onFiltersChange={setFilters} onOpen={open} baseUrl="http://localhost:9092" />;
```

## Mentions

`useCommentMentionables({ client, target })` lists what a comment can be addressed to with `@name`: the target's comment agent, the runtime families and the sessions in its scope. Gavel emits `agent` and `user` kinds; any other kind is refused. Feed `mentionables` to the composer. Gavel parses the `@` token itself when the comment is created or replied to.

## Grabber helpers

The live-event cursor is remembered per server and scope (`gavel.events.<baseUrl>.<scope>`) and a stored value that is not a sequence number fails loudly. The entry also carries the page-capture helpers the extension and the playground share: `captureElementContext`, `copyContextMarkdown`, the gavel todo formatting, clipboard and screenshot helpers, and `grabberPlugin` / `sidebarButtonPlugin` for React Grab. `grabberPlugin` takes an `idPrefix` so each host registers its own plugin name and action ids, and a `notify` (`useToast().toast`) through which a failed Copy screenshot is shown to the user.
