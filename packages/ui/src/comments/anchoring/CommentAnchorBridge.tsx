import { useContext, useMemo, type ReactNode } from "react";
import { CommentContext, CommentAnchorActionsContext, type CommentAnchorActions } from "../comment-context";

export function CommentAnchorBridge(props: {
  children: ReactNode;
  registerAnchor: CommentAnchorActions["registerAnchor"];
  focusAnchor: CommentAnchorActions["focusAnchor"];
}) {
  const context = useContext(CommentContext);
  if (!context) throw new Error("CommentAnchorBridge requires CommentProvider");
  const actions = useMemo<CommentAnchorActions>(() => ({
    registerAnchor: (anchor, element) => { context.registerAnchor(anchor, element); props.registerAnchor(anchor, element); },
    focusAnchor: props.focusAnchor,
    scrollToAnchor: context.scrollToAnchor,
    contentRef: context.contentRef,
  }), [context.registerAnchor, context.scrollToAnchor, context.contentRef, props.registerAnchor, props.focusAnchor]);
  return (
    <CommentAnchorActionsContext.Provider value={actions}>
      <CommentContext.Provider value={{ ...context, ...actions }}>{props.children}</CommentContext.Provider>
    </CommentAnchorActionsContext.Provider>
  );
}
