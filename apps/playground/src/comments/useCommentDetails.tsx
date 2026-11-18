import { useMemo } from "react";
import { CommentCapture, type Comment, type CommentCaptureContext, type CommentDetailTab } from "@flanksource/clicky-ui/comments";
import { Markdown } from "@flanksource/clicky-ui/data";
import { CommentAgents } from "../agent-runs/CommentAgents";

export function useCommentDetails(options: { threadToMarkdown?: (thread: readonly Comment[]) => string } = {}): readonly CommentDetailTab[] {
  const { threadToMarkdown } = options;
  return useMemo(() => [
    { id: "capture", label: "Capture", render: (thread: readonly (Comment & { element?: CommentCaptureContext })[]) => <CommentCapture capture={thread[0]?.element} expanded /> },
    { id: "agents", label: "Agents", render: thread => <CommentAgents thread={thread} /> },
    ...(threadToMarkdown ? [{ id: "markdown", label: "Markdown", render: (thread: readonly Comment[]) => <Markdown text={threadToMarkdown(thread)} /> }] : []),
  ], [threadToMarkdown]);
}
