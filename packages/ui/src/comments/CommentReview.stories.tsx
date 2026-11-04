import { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommentProvider } from "./CommentProvider";
import { useCommentContext } from "./comment-context";
import { CommentSidePanel } from "./CommentSidePanel";
import { CommentRail } from "./CommentRail";
import { CommentDraftPopover } from "./CommentDraftPopover";
import { DEFAULT_COMMENT_STATUSES, type Comment } from "./comment-types";
import { AgentIdentity } from "../data/chat/AgentIdentity";
import { Button } from "../components/button";

const config = { statuses: DEFAULT_COMMENT_STATUSES };
const initial: Comment[] = [{ id: "example-root", anchor: "example-target", createdAt: "2026-11-04", status: "open", author: { kind: "agent", name: "claude-opus-5-5" }, body: "Review the navigation and retain the selected document.\n\nThis second paragraph describes the selection. The comment preview should remain compact while the complete thread is available in its detail dialog.\n\n[Open reference](#example-target)" }];

export function CommentReviewExample() {
  const [comments, setComments] = useState(initial);
  return <CommentProvider comments={comments} config={config} initialRailMode="all" onReply={input => {
    setComments(current => [...current, { ...input, id: `reply-${current.length}`, createdAt: new Date().toISOString(), author: { name: "Ada" } }]);
  }}><ReviewSurface /></CommentProvider>;
}

function ReviewSurface() {
  const ctx = useCommentContext();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState(false);
  const register = ctx.registerAnchor;
  const attach = useCallback((element: HTMLElement | null) => { register("example-target", element); setTarget(element); }, [register]);
  return <div className="flex h-[720px] min-h-0 max-w-full flex-col md:flex-row">
    <div ref={ctx.contentRef} data-example-scroll="" className="min-h-0 min-w-0 flex-1 overflow-auto p-6">
      <h2 className="text-lg font-semibold">Document review</h2>
      <p className="mt-3 text-sm text-muted-foreground">Scroll before and after opening a comment. Resize the rail to reflow the preview.</p>
      <div className="h-80" />
      <section id="example-target" ref={attach} className="rounded-md border border-border p-4">
        <h3 className="font-semibold">Navigation selection</h3>
        <Button onClick={() => setDraft(true)}>Comment on selection</Button>
      </section>
      <div className="h-[1000px]" />
    </div>
    <CommentRail><div className="p-3"><CommentSidePanel className="w-full" compact previewLines={3} focusedAlignment="anchor"
      detailTabs={[
        { id: "capture", label: "Capture", render: () => <p>Captured navigation selection and source context.</p> },
        { id: "agents", label: "Agents", render: () => <AgentIdentity model="claude-opus-5-5" effort="high" /> },
      ]} threadToMarkdown={thread => thread.map(comment => comment.body).join("\n\n")} /></div></CommentRail>
    {draft && target && <CommentDraftPopover reference={target} label="Navigation selection" anchor="example-target" config={config} onDiscard={() => setDraft(false)} onCreate={() => setDraft(false)} />}
  </div>;
}

const meta = { title: "Comments/Review details", component: CommentReviewExample, parameters: { layout: "fullscreen" } } satisfies Meta<typeof CommentReviewExample>;
export default meta;
export const ResizableDetails: StoryObj<typeof meta> = {};
