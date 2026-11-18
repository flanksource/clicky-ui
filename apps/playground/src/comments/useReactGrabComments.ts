import { useEffect, useRef, type RefObject } from "react";
import { commentPlugin, type ContextMenuActionContext } from "@flanksource/clicky-ui/react-grab";

import type { CommentScreenshotCapture } from "../../plugins/comments-model";
import { commentAnchor, commentTarget } from "./dom-anchor";
import { grabberPlugin, registerGrabberPlugin } from "./react-grab-actions";
import { captureScreenshot, screenshotCaptureSupported } from "./screenshot";

type Selection = {
  anchor: string;
  element: Element;
  screenshot?: Promise<CommentScreenshotCapture>;
};

export function useReactGrabComments(options: {
  contentRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  onSelect: (selection: Selection) => void;
  /** "Prompt…": run a saved captain prompt against the element. */
  onPrompt: (selection: Omit<Selection, "screenshot">) => void;
}) {
  const current = useRef(options);
  current.current = options;

  useEffect(() => {
    let unregister: (() => void) | undefined;

    const anchorOf = (element: Element) => {
      const { contentRef, enabled } = current.current;
      const content = contentRef.current;
      return enabled && content ? commentAnchor(element, content) : null;
    };
    const enabled = (context: { element: Element }) =>
      anchorOf(context.element) !== null;
    // The selection is what the anchor names — inside markdown, the whole
    // block — so the pin, the captured HTML and the screenshot all agree.
    const selectionFor = (context: ContextMenuActionContext) => {
      const anchor = anchorOf(context.element);
      const content = current.current.contentRef.current;
      if (anchor === null || !content) {
        throw new Error(
          "React Grab selected an element outside the playground artifact and its titled dialogs",
        );
      }
      context.hideContextMenu();
      context.cleanup();
      return { anchor, element: commentTarget(context.element, content) };
    };
    const plugin = grabberPlugin({
      enabled,
      captureSupported: screenshotCaptureSupported,
      capture: captureScreenshot,
      onComment: (context, { screenshot }) => {
        const selection = selectionFor(context);
        current.current.onSelect({
          ...selection,
          ...(screenshot ? { screenshot: captureScreenshot(selection.element) } : {}),
        });
      },
      extraActions: [
        {
          id: "playground-prompt",
          label: "Prompt…",
          enabled,
          onAction: (context) => current.current.onPrompt(selectionFor(context)),
        },
      ],
    });
    const register = () => {
      const grab = window.__REACT_GRAB__;
      if (!grab || unregister) return;
      unregister = registerGrabberPlugin({ grab, plugin, comment: commentPlugin });
    };

    window.addEventListener("react-grab:init", register);
    register();
    return () => {
      window.removeEventListener("react-grab:init", register);
      unregister?.();
    };
  }, []);
}
