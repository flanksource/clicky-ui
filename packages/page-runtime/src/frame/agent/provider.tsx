import type { ReactNode } from "react";
import { CommentAnchorBridge, CommentProvider, strictAnchorResolver } from "@flanksource/clicky-ui/comments";
import type { PageAgent } from "./index.ts";

export function PageAgentProvider({ agent, children }: { agent: PageAgent; children: ReactNode }) {
  return (
    <CommentProvider comments={[]} config={{ statuses: [] }} resolveAnchor={strictAnchorResolver}
      onScrollToAnchor={(anchor, options) => { agent.receive({ type: "scroll", anchor, ...options }); return true; }}>
      <CommentAnchorBridge registerAnchor={agent.registerAnchor} focusAnchor={agent.focusAnchor}>
        {children}
      </CommentAnchorBridge>
    </CommentProvider>
  );
}
