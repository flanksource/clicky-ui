import { validateParentOrigin } from "../src/bookmarklet/bridge-parse";
import { bookmarkletParentOrigin, matchesBookmarkletParent } from "../src/bookmarklet/origin";
import { TODO_MESSAGE_SOURCE } from "../src/comments/gavel-todo";
import { serverOrigin } from "./settings";

const TO_PARENT_TYPES = ["embed-ready", "todo-created", "todo-commented", "cancel"];

/**
 * The todo relay page is web-accessible, so any page can frame it. It only
 * frames the new-todo form of the gavel server the grabber was activated with,
 * and only for the page that is actually framing it (`location.ancestorOrigins`
 * is set by the browser), so a page cannot use it to show another site or to
 * receive another page's todo messages.
 */
export function todoRelayTarget(options: { target: string | null; parentOrigin: string | null; ancestorOrigin: string | undefined; server: string }): { url: URL; parentOrigin: string } {
  if (!options.target) throw new Error("Todo relay requires a target form URL");
  if (!options.parentOrigin) throw new Error("Todo relay requires the origin of the page that frames it");
  if (!options.ancestorOrigin) throw new Error("Todo relay must be framed by a page");
  validateParentOrigin(options.parentOrigin);
  if (!matchesBookmarkletParent({ expected: options.parentOrigin, received: options.ancestorOrigin }))
    throw new Error(`Todo relay belongs to ${options.parentOrigin}, not the framing page ${options.ancestorOrigin}`);
  const url = new URL(options.target);
  if (url.username || url.password || url.origin !== serverOrigin(options.server))
    throw new Error(`Todo relay target ${url.origin} is not the configured gavel server ${options.server}`);
  if (url.pathname !== "/todos/new" || url.searchParams.get("embed") !== "1") throw new Error(`Todo relay target is not the gavel new-todo form: ${url.href}`);
  const sourceUrl = url.searchParams.get("sourceUrl");
  if (sourceUrl && bookmarkletParentOrigin(sourceUrl) !== options.parentOrigin) throw new Error(`Todo relay source URL belongs to ${bookmarkletParentOrigin(sourceUrl)}, not ${options.parentOrigin}`);
  return { url, parentOrigin: options.parentOrigin };
}

/** The relay page URL a host frames to show `target` for the page at `parentOrigin`. */
export function todoRelayUrl(options: { relay: string; target: string; parentOrigin: string }): string {
  const url = new URL(options.relay);
  url.search = new URLSearchParams({ target: options.target, parentOrigin: options.parentOrigin }).toString();
  return url.href;
}

function ours(data: unknown): data is { source: typeof TODO_MESSAGE_SOURCE; type: unknown } {
  return typeof data === "object" && data !== null && (data as { source?: unknown }).source === TODO_MESSAGE_SOURCE;
}

/** The page sends the form one thing: the screenshot to attach. */
export function forwardToFrame(data: unknown): boolean {
  return ours(data) && data.type === "attachment" && (data as { blob?: unknown }).blob instanceof Blob;
}

/** The form reports readiness and how it ended; the page acts on nothing else it says. */
export function forwardToParent(data: unknown): boolean {
  return ours(data) && TO_PARENT_TYPES.includes(String(data.type));
}
