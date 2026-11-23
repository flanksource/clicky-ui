import type { NativeListItem, ThreadAnchor } from "./client";
import type { Actor } from "./gavel-projection";

/*
 * The cross-target inbox's pure model: gavel's native listing rows placed by
 * where they live (file, page or image), filtered, grouped by target and
 * queued for review. It reads rows exactly as the comments API returns them,
 * so editor, CLI, extension and playground comments all work; none of it needs
 * playground metadata.
 */

export type InboxTargetKind = "file" | "page" | "image";

/** A native listing row; a patch-anchored one carries where the server places it today (`anchor`). */
export type InboxThread = NativeListItem;

/** One scope's listing: its threads. */
export type InboxListing = {
  scope: string;
  /** The project's name, as shown and filtered. */
  project: string;
  threads: readonly InboxThread[];
};

/** A normalized box on an image; each value is a fraction of the image's width or height. */
export type InboxRegion = { x: number; y: number; w: number; h: number };

/** A thread with where it lives. This is what `onOpen` and every action callback receives. */
export type InboxItem = {
  thread: InboxThread;
  scope: string;
  project: string;
  kind: InboxTargetKind;
  /** The target URI, the key threads are grouped under. */
  uri: string;
  /** The file's path within its project, or the page's URL. */
  label: string;
  /** The view the thread was written in (`source`, `preview`, ...), when it named one. */
  view?: string;
  /** The thread's anchor as the server resolved it; absent for a thread whose selector carries no patch. */
  anchor?: ThreadAnchor;
  /** The resolved first line, for a deep link. Absent when the anchor has no location. */
  line?: number;
  endLine?: number;
  /** The box an image thread is written on. */
  region?: InboxRegion;
  /** The newest of the thread's creation, update and replies. */
  activity: string;
};

export type InboxGroup = {
  key: string;
  scope: string;
  project: string;
  kind: InboxTargetKind;
  uri: string;
  label: string;
  activity: string;
  unread: boolean;
  items: InboxItem[];
};

/** Controlled filter state; an empty string or `false` is "no filter". */
export type InboxFilters = {
  q: string;
  status: string;
  phase: string;
  author: string;
  project: string;
  kind: string;
  unread: boolean;
  /** Only resolved threads, awaiting a human's close or reopen. */
  review: boolean;
};

export const EMPTY_INBOX_FILTERS: InboxFilters = { q: "", status: "", phase: "", author: "", project: "", kind: "", unread: false, review: false };

export type InboxOption = { value: string; label: string };

export const INBOX_STATUS_OPTIONS: InboxOption[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const INBOX_PHASE_OPTIONS: InboxOption[] = [
  { value: "active", label: "Active" },
  { value: "awaiting_outcome", label: "Awaiting outcome" },
  { value: "final", label: "Final" },
];

export const INBOX_KIND_OPTIONS: InboxOption[] = [
  { value: "file", label: "Files" },
  { value: "page", label: "Pages" },
  { value: "image", label: "Images" },
];

const IMAGE_FILE = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i;

type Selector = { kind: string; view?: string; patch?: { startLine?: number }; region?: InboxRegion };

function selectorOf(thread: InboxThread): Selector | undefined {
  const selector = thread.target.selector;
  if (selector === undefined || selector === null) return undefined;
  if (typeof selector !== "object" || typeof (selector as { kind?: unknown }).kind !== "string")
    throw new Error(`Comment ${thread.id} has a selector that is not an object with a kind: ${JSON.stringify(selector)}`);
  return selector as Selector;
}

function placeOf(thread: InboxThread, scope: string, selector: Selector | undefined): { kind: InboxTargetKind; label: string } {
  const { uri } = thread.target;
  const files = `${scope}/files/`;
  const pages = `${scope}/pages/`;
  if (uri.startsWith(files)) {
    const path = uri.slice(files.length);
    return { kind: selector?.kind === "region" || IMAGE_FILE.test(path) ? "image" : "file", label: path };
  }
  const label = uri.startsWith(pages) ? decodeURIComponent(uri.slice(pages.length)) : (thread.target.label ?? uri);
  return { kind: selector?.kind === "region" ? "image" : "page", label };
}

/** A thread's latest activity: its newest reply, its last update, or its creation. */
function activityOf(thread: InboxThread): string {
  const times = [thread.createdAt, thread.updatedAt, ...(thread.messages ?? []).map((message) => message.createdAt)];
  return times.reduce((latest, at) => (Date.parse(at) > Date.parse(latest) ? at : latest));
}

export function inboxItems(listings: readonly InboxListing[]): InboxItem[] {
  return listings.flatMap(({ scope, project, threads }) =>
    threads.map((thread): InboxItem => {
      const selector = selectorOf(thread);
      const { anchor } = thread;
      return {
        thread,
        scope,
        project,
        uri: thread.target.uri,
        ...placeOf(thread, scope, selector),
        ...(selector?.view ? { view: selector.view } : {}),
        ...(anchor ? { anchor } : {}),
        ...(anchor?.startLine ? { line: anchor.startLine } : {}),
        ...(anchor?.endLine ? { endLine: anchor.endLine } : {}),
        ...(selector?.kind === "region" && selector.region ? { region: selector.region } : {}),
        activity: activityOf(thread),
      };
    }),
  );
}

const authorLabel = (author: Actor) => author.label ?? author.id;

function matchesSearch({ thread, label }: InboxItem, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const texts = [thread.bodyMarkdown, label, authorLabel(thread.author), ...(thread.messages ?? []).map((message) => message.bodyMarkdown)];
  return texts.some((text) => text.toLowerCase().includes(needle));
}

export function filterInbox(items: readonly InboxItem[], filters: InboxFilters): InboxItem[] {
  return items.filter(
    (item) =>
      (!filters.status || item.thread.status === filters.status) &&
      (!filters.phase || item.thread.phase === filters.phase) &&
      (!filters.author || item.thread.author.id === filters.author) &&
      (!filters.project || item.project === filters.project) &&
      (!filters.kind || item.kind === filters.kind) &&
      (!filters.unread || item.thread.unread) &&
      (!filters.review || item.thread.status === "resolved") &&
      matchesSearch(item, filters.q),
  );
}

const newestFirst = (a: { activity: string }, b: { activity: string }) => Date.parse(b.activity) - Date.parse(a.activity);

/** Threads grouped by target, each group's threads and the groups themselves newest activity first. */
export function groupInbox(items: readonly InboxItem[]): InboxGroup[] {
  const groups = new Map<string, InboxGroup>();
  for (const item of [...items].sort(newestFirst)) {
    const key = `${item.scope}\n${item.uri}`;
    const group = groups.get(key);
    if (group) {
      group.items.push(item);
      group.unread ||= item.thread.unread;
    } else
      groups.set(key, { key, scope: item.scope, project: item.project, kind: item.kind, uri: item.uri, label: item.label, activity: item.activity, unread: item.thread.unread, items: [item] });
  }
  return [...groups.values()];
}

/** The authors present in `items`, as filter options ordered by label. */
export function inboxAuthorOptions(items: readonly InboxItem[]): InboxOption[] {
  const byId = new Map(items.map(({ thread }) => [thread.author.id, authorLabel(thread.author)]));
  return [...byId].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
}

/** Every project, including ones with no threads, so a project filter is never missing the one a reader wants. */
export function inboxProjectOptions(listings: readonly InboxListing[]): InboxOption[] {
  return listings.map(({ project }) => ({ value: project, label: project }));
}
