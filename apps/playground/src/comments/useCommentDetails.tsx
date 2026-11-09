import { useMemo } from "react";
import type { Comment, CommentDetailTab } from "@flanksource/clicky-ui/comments";
import { Markdown } from "@flanksource/clicky-ui/data";
import { CommentAgents } from "../agent-runs/CommentAgents";
import { CommentCapture } from "./CommentCapture";

export function useCommentDetails(options: { threadToMarkdown?: (thread: readonly Comment[]) => string } = {}): readonly CommentDetailTab[] {
  const { threadToMarkdown } = options;
  return useMemo(() => [
    { id: "capture", label: "Capture", render: thread => <CommentCapture comment={thread[0]!} /> },
    { id: "agents", label: "Agents", render: thread => <CommentAgents thread={thread} /> },
    ...(threadToMarkdown ? [{ id: "markdown", label: "Markdown", render: (thread: readonly Comment[]) => <Markdown text={threadToMarkdown(thread)} /> }] : []),
  ], [threadToMarkdown]);
}
