import { useLayoutEffect, useRef } from "react";
import { useCommentContext } from "@flanksource/clicky-ui";
import type { AgentAnchorState, AgentSelection } from "@flanksource/page-runtime/schema";

function Anchor({ anchor, rect }: { anchor: string; rect: NonNullable<AgentAnchorState["rect"]> }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { registerAnchor } = useCommentContext();
  useLayoutEffect(() => { registerAnchor(anchor, ref.current); return () => registerAnchor(anchor, null); }, [anchor, registerAnchor]);
  return <span ref={ref} aria-hidden="true" className="pointer-events-none absolute" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }} />;
}

export function FrameAnchors({ anchors, selection }: { anchors: AgentAnchorState[]; selection: AgentSelection | null }) {
  const states = anchors.filter(anchor => anchor.rect !== null);
  if (selection && !states.some(anchor => anchor.anchor === selection.anchor)) states.push({ anchor: selection.anchor, rect: selection.rect, state: "found", label: selection.label });
  return <>{states.map(anchor => <Anchor key={anchor.anchor} anchor={anchor.anchor} rect={anchor.rect!} />)}</>;
}
