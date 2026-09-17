import { useEffect, useRef, type RefObject } from "react";
import { commentPlugin, type ContextMenuActionContext } from "react-grab";

import type { CommentScreenshotCapture } from "../../plugins/comments-model";
import { cssPath } from "./dom-anchor";
import { captureScreenshot } from "./screenshot";

type Selection = {
  anchor: string;
  element: Element;
  screenshot?: Promise<CommentScreenshotCapture>;
};

export function useReactGrabComments(options: {
  contentRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  onSelect: (selection: Selection) => void;
}) {
  const current = useRef(options);
  current.current = options;

  useEffect(() => {
    let registered = false;
    let hadCommentPlugin = false;
    let previousDefaultAction: string | undefined;

    const enabled = (context: { element: Element }) => {
      const { contentRef, enabled } = current.current;
      return enabled && Boolean(contentRef.current?.contains(context.element));
    };
    const select = (
      context: ContextMenuActionContext,
      withScreenshot: boolean,
    ) => {
      const root = current.current.contentRef.current;
      if (!root || !enabled(context)) {
        throw new Error(
          "React Grab selected an element outside the playground artifact",
        );
      }
      const anchor = cssPath(context.element, root);
      context.hideContextMenu();
      context.cleanup();
      current.current.onSelect({
        anchor,
        element: context.element,
        ...(withScreenshot
          ? { screenshot: captureScreenshot(context.element) }
          : {}),
      });
    };
    const register = () => {
      const grab = window.__REACT_GRAB__;
      if (!grab || registered) return;
      hadCommentPlugin = grab.getPlugins().includes("comment");
      previousDefaultAction = grab.getToolbarState()?.defaultAction;
      if (hadCommentPlugin) grab.unregisterPlugin("comment");
      grab.registerPlugin({
        name: "playground-comments",
        actions: [
          {
            id: "playground-comment",
            label: "Comment",
            enabled,
            onAction: (context) => select(context, false),
          },
          {
            id: "playground-comment-screenshot",
            label: "Comment with screenshot",
            enabled,
            onAction: (context) => select(context, true),
          },
        ],
      });
      grab.setToolbarState({ defaultAction: "playground-comment" });
      registered = true;
    };

    window.addEventListener("react-grab:init", register);
    register();
    return () => {
      window.removeEventListener("react-grab:init", register);
      if (!registered) return;
      const grab = window.__REACT_GRAB__;
      if (!grab) return;
      grab.unregisterPlugin("playground-comments");
      if (hadCommentPlugin) grab.registerPlugin(commentPlugin);
      grab.setToolbarState({ defaultAction: previousDefaultAction ?? "copy" });
    };
  }, []);
}
