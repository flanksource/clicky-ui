import { useRef, useState } from "react";
import { UiCheck, UiCircleOutline, UiClose } from "../icons";
import type {
  Comment,
  CommentAuthor,
  CommentCallbacks,
  CommentConfig,
} from "./comment-types";

// Sample data and a demo store used only by stories and the kitchen-sink demo.
// Not part of the public API (not re-exported from the barrel).

export const ME: CommentAuthor = {
  id: "u-ada",
  name: "Ada Lovelace",
  kind: "user",
};

export const sampleConfig: CommentConfig = {
  statuses: [
    {
      value: "open",
      label: "Open",
      tone: "info",
      icon: UiCircleOutline,
      unresolved: true,
    },
    {
      value: "in_progress",
      label: "In progress",
      tone: "warning",
      unresolved: true,
    },
    { value: "resolved", label: "Resolved", tone: "success", icon: UiCheck },
    { value: "wont_fix", label: "Won't fix", tone: "neutral", icon: UiClose },
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

export const sampleComments: Comment[] = [
  {
    id: "c1",
    anchor: "summary",
    body: "The **headline number** looks off versus last quarter — can we double-check the source?",
    createdAt: "2026-06-20T09:00:00.000Z",
    author: { id: "u-bo", name: "Bo Diaz", kind: "user" },
    status: "open",
    facets: { area: "api", priority: "high" },
    checklist: [
      { label: "Re-run the aggregation", status: "in_progress" },
      { label: "Confirm with data team", status: "open" },
    ],
    refs: [{ label: "Tickets", items: ["OPS-412", "OPS-419"] }],
  },
  {
    id: "c1r1",
    parentId: "c1",
    body: "Good catch — I think it's a rounding change. @gemini can you verify the rollup?",
    createdAt: "2026-06-20T09:12:00.000Z",
    author: ME,
  },
  {
    id: "c1r2",
    parentId: "c1",
    body: "Verified: the variance is a `currency` conversion, not a data error.",
    createdAt: "2026-06-20T09:20:00.000Z",
    author: { id: "a-gemini", name: "gemini", kind: "agent" },
  },
  {
    id: "c2",
    anchor: "details.row.3",
    body: "Nit: align this column to the right for readability.",
    createdAt: "2026-06-21T14:30:00.000Z",
    author: ME,
    status: "resolved",
    facets: { area: "ui", priority: "low" },
  },
  {
    id: "c3",
    anchor: null,
    body: "Overall this is in great shape. Ready for review once the open item is closed.",
    createdAt: "2026-06-21T15:05:00.000Z",
    author: { id: "u-bo", name: "Bo Diaz", kind: "user" },
    status: "open",
    facets: { area: "infra" },
  },
];

/** Stateful in-memory store wiring the controlled callbacks for demos/stories. */
export function useDemoCommentStore(initial: Comment[] = sampleComments) {
  const [comments, setComments] = useState<Comment[]>(initial);
  const idRef = useRef(0);
  const nextId = () => `gen-${(idRef.current += 1)}`;
  const nowIso = () => new Date().toISOString();

  const callbacks: CommentCallbacks = {
    onCreate: ({ body, anchor, facets }) =>
      setComments((prev) => [
        ...prev,
        {
          id: nextId(),
          body,
          createdAt: nowIso(),
          author: ME,
          status: "open",
          anchor: anchor ?? null,
          ...(facets ? { facets } : {}),
        },
      ]),
    onReply: ({ parentId, body }) =>
      setComments((prev) => [
        ...prev,
        { id: nextId(), body, createdAt: nowIso(), author: ME, parentId },
      ]),
    onUpdateStatus: (id, status) =>
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c)),
      ),
    onDelete: (id) =>
      setComments((prev) =>
        prev.filter((c) => c.id !== id && c.parentId !== id),
      ),
    onChecklistToggle: (id, index, next) =>
      setComments((prev) =>
        prev.map((c) =>
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

  return { comments, callbacks, setComments };
}
