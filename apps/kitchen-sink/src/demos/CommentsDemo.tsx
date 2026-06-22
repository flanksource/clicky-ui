import { useRef, useState } from "react";
import {
  applyCommentFilters,
  Button,
  CommentFilterBar,
  CommentProgress,
  CommentProvider,
  CommentSidePanel,
  CommentThread,
  dottedAnchorResolver,
  emptyCommentFilters,
  GroupedComments,
  useCommentContext,
  type Comment,
  type CommentCallbacks,
  type CommentConfig,
  type CommentFilters,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const CONFIG: CommentConfig = {
  statuses: [
    { value: "open", label: "Open", tone: "info", unresolved: true },
    {
      value: "in_progress",
      label: "In progress",
      tone: "warning",
      unresolved: true,
    },
    { value: "resolved", label: "Resolved", tone: "success" },
    { value: "wont_fix", label: "Won't fix", tone: "neutral" },
  ],
  facets: [
    {
      key: "area",
      label: "Area",
      options: [
        { value: "ui", label: "UI", tone: "info", short: "UI" },
        { value: "api", label: "API", tone: "success", short: "API" },
        { value: "infra", label: "Infra", tone: "warning", short: "INF" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      options: [
        { value: "low", label: "Low", tone: "neutral" },
        { value: "high", label: "High", tone: "danger" },
      ],
    },
  ],
  mentionables: [
    { id: "u-ada", name: "Ada Lovelace", kind: "user" },
    { id: "u-bo", name: "Bo Diaz", kind: "user" },
    { id: "a-claude", name: "claude", kind: "agent" },
    { id: "a-gemini", name: "gemini", kind: "agent" },
  ],
  checklistStatusCycle: ["open", "in_progress", "done"],
};

const ME = { id: "u-ada", name: "Ada Lovelace", kind: "user" as const };

const INITIAL: Comment[] = [
  {
    id: "c1",
    anchor: "summary",
    body: "The **headline number** looks off — can we double-check the source? @gemini",
    createdAt: "2026-06-20T09:00:00.000Z",
    author: { id: "u-bo", name: "Bo Diaz", kind: "user" },
    status: "open",
    facets: { area: "api", priority: "high" },
    checklist: [
      { label: "Re-run the aggregation", status: "in_progress" },
      { label: "Confirm with data team", status: "open" },
    ],
    refs: [{ label: "Tickets", items: ["OPS-412"] }],
  },
  {
    id: "c1r1",
    parentId: "c1",
    body: "Verified: the variance is a `currency` conversion, not a data error.",
    createdAt: "2026-06-20T09:20:00.000Z",
    author: { id: "a-gemini", name: "gemini", kind: "agent" },
  },
  {
    id: "c2",
    anchor: "details.row.3",
    body: "Nit: align this column to the right.",
    createdAt: "2026-06-21T14:30:00.000Z",
    author: ME,
    status: "resolved",
    facets: { area: "ui", priority: "low" },
  },
  {
    id: "c3",
    anchor: null,
    body: "Overall in great shape. Ready once the open item is closed.",
    createdAt: "2026-06-21T15:05:00.000Z",
    author: { id: "u-bo", name: "Bo Diaz", kind: "user" },
    status: "open",
    facets: { area: "infra" },
  },
];

function useStore() {
  const [comments, setComments] = useState<Comment[]>(INITIAL);
  const idRef = useRef(0);
  const nextId = () => `gen-${(idRef.current += 1)}`;
  const callbacks: CommentCallbacks = {
    onCreate: ({ body, anchor, facets }) =>
      setComments((p) => [
        ...p,
        {
          id: nextId(),
          body,
          createdAt: new Date().toISOString(),
          author: ME,
          status: "open",
          anchor: anchor ?? null,
          ...(facets ? { facets } : {}),
        },
      ]),
    onReply: ({ parentId, body }) =>
      setComments((p) => [
        ...p,
        {
          id: nextId(),
          body,
          createdAt: new Date().toISOString(),
          author: ME,
          parentId,
        },
      ]),
    onUpdateStatus: (id, status) =>
      setComments((p) => p.map((c) => (c.id === id ? { ...c, status } : c))),
    onDelete: (id) =>
      setComments((p) => p.filter((c) => c.id !== id && c.parentId !== id)),
    onChecklistToggle: (id, index, next) =>
      setComments((p) =>
        p.map((c) =>
          c.id === id && c.checklist
            ? {
                ...c,
                checklist: c.checklist.map((it, i) =>
                  i === index ? { ...it, status: next } : it,
                ),
              }
            : c,
        ),
      ),
  };
  return { comments, callbacks };
}

function RailFocusBar() {
  const ctx = useCommentContext();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => ctx.focusAnchor("summary")}
      >
        Focus “Summary”
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => ctx.focusAnchor("details.row.3")}
      >
        Focus “Details”
      </Button>
      <Button size="sm" variant="ghost" onClick={ctx.openCommentList}>
        Toggle all comments
      </Button>
    </div>
  );
}

export function CommentsDemo() {
  const thread = useStore();
  const rail = useStore();
  const [filters, setFilters] = useState<CommentFilters>(emptyCommentFilters());
  const visible = applyCommentFilters(thread.comments, filters, CONFIG);

  return (
    <div className="space-y-8">
      <DemoSection
        id="comments-thread"
        title="Thread, composer & @-mentions"
        description="Filter, progress, and a controlled thread. Type @ in the composer to mention a user or agent."
      >
        <div className="max-w-xl space-y-3">
          <CommentFilterBar
            config={CONFIG}
            filters={filters}
            onChange={setFilters}
          />
          <CommentProgress comments={thread.comments} config={CONFIG} />
          <CommentThread comments={visible} config={CONFIG} {...thread.callbacks} />
        </div>
      </DemoSection>

      <DemoSection
        id="comments-rail"
        title="Document-anchored side panel"
        description="A CommentProvider derives per-anchor counts; the rail focuses one anchor or shows the full feed."
      >
        <CommentProvider
          comments={rail.comments}
          config={CONFIG}
          resolveAnchor={dottedAnchorResolver}
          {...rail.callbacks}
        >
          <div className="flex gap-6">
            <div className="flex-1 space-y-3">
              <RailFocusBar />
              <p className="text-sm text-muted-foreground">
                Anchors here are <code>summary</code> and{" "}
                <code>details.row.3</code>.
              </p>
            </div>
            <CommentSidePanel
              anchorLabels={{
                summary: "Summary",
                "details.row.3": "Details · Row 3",
              }}
            />
          </div>
        </CommentProvider>
      </DemoSection>

      <DemoSection
        id="comments-grouped"
        title="Grouped by facet"
        description="GroupedComments buckets roots by any configured facet into collapsible sections."
      >
        <div className="max-w-xl">
          <GroupedComments
            comments={thread.comments}
            config={CONFIG}
            groupBy="area"
            {...thread.callbacks}
          />
        </div>
      </DemoSection>
    </div>
  );
}
