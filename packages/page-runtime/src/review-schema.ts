import type { AgentSelection } from "./schema.ts";

export type ReviewAction = "mark" | "approved" | "rejected" | "revision_requested" | "delete" | "export";
export type ReviewElement = { id: string; selection: AgentSelection; domId?: string };
export type ReviewContent = { html: string; svg?: string };
export type ReviewHostMessage =
  | { type: "review-remove"; requestId: string; id: string; removed: boolean }
  | { type: "review-list"; requestId: string }
  | { type: "review-select"; requestId: string; id: string | null }
  | { type: "review-visibility"; requestId: string; visible: boolean; showRejected: boolean }
  | { type: "review-action"; requestId: string; id: string; action: ReviewAction };
export type ReviewState = { type: "review-state"; requestId?: string; elements: ReviewElement[]; selected: string | null; visible: boolean; showRejected: boolean };
export type ReviewActionRequest = { type: "review-action-request"; requestId: string; element: ReviewElement } & (
  | { action: "delete"; containedAnchors: string[]; content?: never }
  | { action: Exclude<ReviewAction, "delete">; content?: ReviewContent; containedAnchors?: never }
);
export type ReviewFrameMessage = ReviewState | ReviewActionRequest | { type: "review-error"; requestId: string; error: string };
