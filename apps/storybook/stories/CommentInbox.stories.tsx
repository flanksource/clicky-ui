import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommentInbox } from "../../../packages/ui/src/comments/gavel/CommentInbox";
import { EMPTY_INBOX_FILTERS, type InboxFilters, type InboxItem, type InboxListing, type InboxThread } from "../../../packages/ui/src/comments/gavel/inbox-model";

const DEMO = "gavel://project/demo";
const DOCS = "gavel://project/docs";
const ada = { kind: "user", id: "user:ada", label: "Ada" };
const claude = { kind: "agent", id: "agent:claude", label: "Claude" };

function thread(id: string, uri: string, scopeUri: string, overrides: Partial<InboxThread> & { selector: unknown }): InboxThread {
  const { selector, ...rest } = overrides;
  return {
    id,
    bodyMarkdown: id,
    author: ada,
    status: "open",
    phase: "active",
    version: 2,
    createdAt: "2026-11-10T09:00:00Z",
    updatedAt: "2026-11-10T09:00:00Z",
    readVersion: 2,
    unread: false,
    target: { uri, scopeUri, kind: "file", selector },
    ...rest,
  };
}

const intro = `${DEMO}/files/guide/intro.md`;
const pricing = `${DEMO}/pages/${encodeURIComponent("https://example.com/pricing")}`;
const logo = `${DEMO}/files/assets/logo.png`;

/** Editor, extension and CLI threads: a file at a resolved line, a stale file anchor, a web page, an image region and a second project. */
const MIXED: InboxListing[] = [
  {
    scope: DEMO,
    project: "demo",
    threads: [
      thread("intro-line", intro, DEMO, {
        bodyMarkdown: "This paragraph repeats the install step.",
        selector: { kind: "code-range", version: 1, view: "source", patch: { startLine: 9, endLine: 10 } },
        anchor: { state: "matched", startLine: 14, endLine: 15 },
        unread: true,
        updatedAt: "2026-11-14T09:00:00Z",
        messages: [{ id: "m1", bodyMarkdown: "Reworded; see the proposal.", author: claude, createdAt: "2026-11-14T09:00:00Z" }],
      }),
      thread("intro-stale", intro, DEMO, {
        bodyMarkdown: "Link to the changelog.",
        selector: { kind: "code-range", version: 1, view: "preview", patch: { startLine: 40, endLine: 40 } },
        anchor: { state: "outdated" },
        updatedAt: "2026-11-12T09:00:00Z",
      }),
      thread("pricing-cta", pricing, DEMO, {
        bodyMarkdown: "The call to action is below the fold on mobile.",
        selector: { kind: "dom", version: 1, anchor: "e:[]" },
        updatedAt: "2026-11-13T09:00:00Z",
      }),
      thread("logo-blur", logo, DEMO, {
        bodyMarkdown: "The logo is blurry at this size.",
        selector: { kind: "region", version: 1, region: { x: 0.12, y: 0.2, w: 0.3, h: 0.25 } },
        status: "resolved",
        phase: "awaiting_outcome",
        author: claude,
        messages: [{ id: "m2", bodyMarkdown: "Re-exported at 2x.", author: claude, createdAt: "2026-11-11T09:00:00Z" }],
      }),
    ],
  },
  {
    scope: DOCS,
    project: "docs",
    threads: [
      thread("readme-done", `${DOCS}/files/README.md`, DOCS, {
        bodyMarkdown: "Add a badge for the build status.",
        selector: { kind: "document", version: 1, view: "preview" },
        status: "resolved",
        phase: "awaiting_outcome",
        author: { kind: "user", id: "user:bo", label: "Bo" },
      }),
    ],
  },
];

const meta = {
  title: "Comments/CommentInbox",
  component: CommentInbox,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: { listings: MIXED, filters: EMPTY_INBOX_FILTERS, onFiltersChange: () => undefined, onOpen: () => undefined, baseUrl: "http://127.0.0.1:9092" },
} satisfies Meta<typeof CommentInbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ listings, initial = EMPTY_INBOX_FILTERS, withActions = false }: { listings: InboxListing[] | undefined; initial?: InboxFilters; withActions?: boolean }) {
  const [filters, setFilters] = useState(initial);
  const [log, setLog] = useState<string[]>([]);
  const note = (entry: string) => setLog((current) => [entry, ...current].slice(0, 6));
  const open = (item: InboxItem) => note(`onOpen ${item.kind} ${item.label}${item.line ? `:${item.line}` : ""} (${item.anchor?.state ?? "no anchor"})`);
  return (
    <div className="flex h-[640px] flex-col">
      <div className="min-h-0 flex-1">
        <CommentInbox
          listings={listings}
          filters={filters}
          onFiltersChange={setFilters}
          onOpen={open}
          baseUrl="http://127.0.0.1:9092"
          {...(withActions
            ? {
                actions: {
                  onClose: (item: InboxItem) => note(`close ${item.thread.id}`),
                  onMarkRead: (target: { scope: string; uri: string }) => note(`mark read ${target.uri}`),
                  onReply: (item: InboxItem, body: string) => note(`reply ${item.thread.id}: ${body}`),
                },
              }
            : {})}
        />
      </div>
      <ul className="border-t border-border p-2 font-mono text-xs text-muted-foreground" aria-label="Host callbacks">
        {log.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
        <li>filters: {JSON.stringify(filters)}</li>
      </ul>
    </div>
  );
}

/** Files, a web page and an image across two projects, grouped by target. Open a file link: the host receives the resolved line (14), not the stored one (9). */
export const MixedTargets: Story = { render: () => <Controlled listings={MIXED} withActions /> };

/** The same inbox with the unread and Target filters held in controlled state, as a host would keep them in the URL. */
export const FilteredUnreadFiles: Story = { render: () => <Controlled listings={MIXED} initial={{ ...EMPTY_INBOX_FILTERS, unread: true, kind: "file" }} /> };

/** Nothing matches: the result says so and every filter control stays on screen. */
export const NoMatches: Story = { render: () => <Controlled listings={MIXED} initial={{ ...EMPTY_INBOX_FILTERS, status: "closed", q: "nothing like this" }} /> };

/** The "Needs review" filter narrows the inbox to the two resolved threads; expand one to close it. */
export const NeedsReview: Story = { render: () => <Controlled listings={MIXED} initial={{ ...EMPTY_INBOX_FILTERS, review: true }} withActions /> };

export const Loading: Story = { render: () => <Controlled listings={undefined} /> };

export const NoThreadsYet: Story = { render: () => <Controlled listings={[{ scope: DEMO, project: "demo", threads: [] }]} /> };
