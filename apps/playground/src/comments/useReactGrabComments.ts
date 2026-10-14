import { useEffect, useRef, type RefObject } from "react";
import { commentPlugin, type ContextMenuActionContext } from "react-grab";

import type { CommentScreenshotCapture } from "../../plugins/comments-model";
import { writeClipboard } from "./clipboard";
import { copyContextMarkdown } from "./copy-context";
import { commentAnchor } from "./dom-anchor";
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

    const anchorOf = (element: Element) => {
      const { contentRef, enabled } = current.current;
      const content = contentRef.current;
      return enabled && content ? commentAnchor(element, content) : null;
    };
    const enabled = (context: { element: Element }) =>
      anchorOf(context.element) !== null;
    const select = (
      context: ContextMenuActionContext,
      withScreenshot: boolean,
    ) => {
      const anchor = anchorOf(context.element);
      if (anchor === null) {
        throw new Error(
          "React Grab selected an element outside the playground artifact and its titled dialogs",
        );
      }
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
    // copyScreenshot puts the element's PNG and its copy context on the
    // clipboard as one item. Everything starts synchronously, inside the
    // action's gesture, which both getDisplayMedia and the clipboard require.
    const copyScreenshot = (context: ContextMenuActionContext) => {
      const text = copyContextMarkdown([context.element]);
      context.hideContextMenu();
      context.cleanup();
      const image = captureScreenshot(context.element).then((capture) => {
        if (capture.status !== "captured") {
          throw new Error(`screenshot ${capture.reason}`);
        }
        return fetch(capture.dataUrl).then((response) => response.blob());
      });
      writeClipboard(text, image).catch((error: unknown) => {
        console.error("[playground] Copy screenshot failed:", error);
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
        hooks: {
          transformCopyContent: (_content, elements) =>
            copyContextMarkdown(elements),
        },
        actions: [
          {
            id: "playground-copy-screenshot",
            label: "Copy screenshot",
            onAction: copyScreenshot,
          },
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
