import { DOCUMENT_ANCHOR, type Comment } from "../comment-types";
import type { CommentElementContext } from "./comments-model";
import { buildBody, todoBodyWithScreenshot } from "./gavel-todo";

/** A comment as gavel's projection stores it: the generic comment plus the element it was left on. */
export type TodoThreadComment = Comment & { element?: CommentElementContext | undefined };

export type ThreadTodo = {
  title: string;
  /** Markdown carrying the root, its anchor and element context, the replies and the screenshot reference. */
  body: string;
  /** The page the thread was left on, for the todo form's `sourceUrl`. */
  sourceUrl: string;
};

const TITLE_LIMIT = 100;

function firstLine(text: string): string {
  return text.split("\n").map((line) => line.trim()).find(Boolean) ?? "";
}

function titleOf(root: TodoThreadComment): string {
  const line = firstLine(root.body);
  if (line) return line.length > TITLE_LIMIT ? `${line.slice(0, TITLE_LIMIT - 1)}…` : line;
  if (root.element?.componentName) return root.element.componentName;
  return root.anchor && root.anchor !== DOCUMENT_ANCHOR ? `Comment on ${root.anchor}` : "Comment on this page";
}

function quote(text: string): string {
  return text.trim().split("\n").map((line) => (line ? `> ${line}` : ">")).join("\n");
}

function repliesSection(replies: readonly TodoThreadComment[]): string {
  if (replies.length === 0) return "";
  const messages = replies.map((reply) => `**${reply.author?.name ?? "Unknown"}** · ${reply.createdAt}\n${quote(reply.body)}`);
  return `## Replies\n\n${messages.join("\n\n")}`;
}

/**
 * The todo a thread becomes: a title from the root's first line, and a
 * Markdown body with the root, its anchor, the element context captured with
 * it (component, page, source stack, HTML), every reply in order and a
 * reference to the captured screenshot. `thread` is the root followed by its
 * replies, as `onCreateTodo` receives it; `pageUrl` is the page the host is
 * showing, used when the capture did not record one. Gavel's `buildTodoUrl`
 * turns the result into the dashboard's embed form.
 */
export function buildThreadTodo(options: { thread: readonly TodoThreadComment[]; pageUrl: string }): ThreadTodo {
  const [root, ...replies] = options.thread;
  if (!root) throw new Error("Cannot create a todo: the thread has no root comment");
  if (root.parentId) throw new Error(`Cannot create a todo: the first comment of a thread must be its root, got reply ${root.id}`);
  const { element } = root;
  const anchor = root.anchor && root.anchor !== DOCUMENT_ANCHOR ? `**Anchor:** \`${root.anchor}\`` : "";
  const context = element ? buildBody({ componentName: element.componentName ?? "", pageUrl: element.pageUrl ?? options.pageUrl, selector: "", source: element.source, html: element.html }) : "";
  const sections = [root.body.trim(), [anchor, context].filter(Boolean).join("\n"), repliesSection(replies)].filter(Boolean);
  const body = sections.join("\n\n");
  const screenshot = element?.screenshot;
  return {
    title: titleOf(root),
    body:
      screenshot?.status === "captured"
        ? todoBodyWithScreenshot(body, { url: screenshot.url, filename: screenshot.filename })
        : screenshot?.status === "unavailable"
          ? `${body}\n\nScreenshot unavailable (${screenshot.reason})`
          : body,
    sourceUrl: element?.pageUrl ?? options.pageUrl,
  };
}
