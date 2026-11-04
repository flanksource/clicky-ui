import { useMemo } from "react";
import type { CommentDetailTab } from "@flanksource/clicky-ui/comments";
import { CommentAgents } from "../agent-runs/CommentAgents";
import { CommentCapture } from "./CommentCapture";

export function useCommentDetails(): readonly CommentDetailTab[] {
  return useMemo(() => [
    { id: "capture", label: "Capture", render: thread => <CommentCapture comment={thread[0]!} /> },
    { id: "agents", label: "Agents", render: thread => <CommentAgents thread={thread} /> },
  ], []);
}
