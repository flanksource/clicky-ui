import type { ReactNode } from "react";
import type { Comment } from "./comment-types";

export type CommentDetailTab = {
  id: string;
  label: string;
  /** Mounted only while selected in the maximized dialog. */
  render: (thread: readonly Comment[]) => ReactNode;
};

export type CommentDetailOptions = {
  previewLines?: number;
  detailTabs?: readonly CommentDetailTab[];
  renderMaximizedActions?: (thread: readonly Comment[]) => ReactNode;
  onMaximizedChange?: (open: boolean) => void;
};
