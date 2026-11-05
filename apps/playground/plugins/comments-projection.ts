import type { StoredAuthor, StoredComment } from "./comments-store";

export type Actor = { kind: string; id: string; label?: string };
export type Target = {
  uri: string;
  scopeUri: string;
  kind: string;
  label?: string;
};
type NativeMessage = {
  id: string;
  bodyMarkdown: string;
  author: Actor;
  createdAt: string;
  content?: Content;
};
export type Content = { playground: Partial<StoredComment> & { page: string } };
export type NativeComment = {
  id: string;
  bodyMarkdown: string;
  author: Actor;
  target: Target;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  content: Content;
  messages?: NativeMessage[];
  attachments?: { id: string; name: string }[];
  outcome?: { at: string; actor: Actor };
};
export type Action = {
  id: string;
  expectedVersion: number;
  action: string;
  bodyMarkdown?: string;
  messageId?: string;
  content?: Content;
  target?: Target;
  assignee?: Actor | null;
};
export function commentActor(author: StoredAuthor): Actor {
  return {
    kind: author.kind ?? "user",
    id: author.id ?? `${author.kind ?? "user"}:${author.name}`,
    label: author.name,
  };
}
export const localUser: StoredAuthor = { name: "You", kind: "user" };
export const bodyFor = (comment: StoredComment) =>
  comment.body.trim()
    ? comment.body
    : comment.reviewDecision === "approved"
      ? "Approved"
      : comment.rating === "positive"
        ? "Positive feedback"
        : "Negative feedback";
export function contentFor(page: string, comment: StoredComment): Content {
  const {
    id: _id,
    version: _version,
    rootId: _rootId,
    createdAt: _created,
    updatedAt: _updated,
    status: _status,
    parentId: _parent,
    ...fields
  } = comment;
  return { playground: { ...fields, page } };
}
function authorFor(actor: Actor): StoredAuthor {
  return {
    id: actor.id,
    name: actor.label ?? actor.id,
    kind: actor.kind === "agent" ? "agent" : "user",
  };
}
export function project(c: NativeComment): StoredComment[] {
  if (!c.content?.playground?.page)
    throw new Error(`Comment ${c.id} is missing playground metadata`);
  const { page: _page, ...fields } = c.content.playground;
  const capture = c.attachments?.find((a) => a.name === "screenshot.png");
  const root: StoredComment = {
    ...fields,
    id: c.id,
    version: c.version,
    body: fields.body === "" ? "" : c.bodyMarkdown,
    author: fields.author ?? authorFor(c.author),
    status: c.status,
    createdAt: new Date(c.createdAt).toISOString(),
    ...(c.updatedAt !== c.createdAt
      ? { updatedAt: new Date(c.updatedAt).toISOString() }
      : {}),
    ...(c.outcome
      ? {
          closedAt: new Date(c.outcome.at).toISOString(),
          closedBy: fields.closedBy ?? authorFor(c.outcome.actor),
        }
      : {}),
    ...(capture && fields.element
      ? {
          element: {
            ...fields.element,
            screenshot: {
              status: "captured",
              filename: "screenshot.png",
              url: `/__playground/comments/${c.id}/attachments/${capture.id}`,
            },
          },
        }
      : {}),
  };
  return [
    root,
    ...(c.messages ?? []).map((m) => ({
      ...m.content?.playground,
      id: m.id,
      rootId: c.id,
      version: c.version,
      body: m.bodyMarkdown,
      author: m.content?.playground.author ?? authorFor(m.author),
      createdAt: new Date(m.createdAt).toISOString(),
      parentId: c.id,
      anchor: root.anchor ?? null,
    })),
  ];
}
