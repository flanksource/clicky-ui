import type { ContextMenuAction, ContextMenuActionContext, Plugin, ReactGrabAPI } from "@flanksource/clicky-ui/react-grab";

import type { ToastOptions } from "../../overlay/toast-context";
import type { CommentScreenshotCapture } from "../annotation-types";
import { writeClipboard } from "./clipboard";
import { copyContextMarkdown } from "./copy-context";
import type { ScreenshotTarget } from "./screenshot-viewport";

/** The name the grabber plugin registers under, so a host can unregister it. */
export function grabberPluginName(idPrefix: string): string {
  return `${idPrefix}-comments`;
}

/** The name the sidebar toggle plugin registers under. */
export function sidebarPluginName(idPrefix: string): string {
  return `${idPrefix}-sidebar`;
}

/** What the gavel backend does with a grabbed element; the plugin offers it in place of the playground's own Copy screenshot and copy text. */
export type GavelTodoActions = {
  /** "Add to gavel todo". */
  addTodo: (context: ContextMenuActionContext) => void;
  /** "Screenshot to gavel todo". */
  screenshotTodo: (context: ContextMenuActionContext) => void;
  /** "Copy screenshot" (the todo body with the uploaded image) or, without `body`, "Screenshot only" (just the image URL). */
  copyScreenshot: (context: ContextMenuActionContext, options: { body: boolean }) => void;
  /** The text a plain copy produces. */
  copyContent: (content: string, elements: Element[]) => Promise<string>;
  onOpenFile: (filePath: string, lineNumber?: number) => boolean;
  setup: NonNullable<Plugin["setup"]>;
};

export type GrabberPluginOptions = {
  /** Prefixes the plugin name and the ids of the screenshot and todo actions (`<idPrefix>-comments`, `<idPrefix>-copy-screenshot`, ...), so each host registers its own. */
  idPrefix: string;
  /** False hides the comment actions for elements that cannot be commented on. */
  enabled: (context: { element: Element }) => boolean;
  /** "Comment" and "Comment with screenshot". Closing the context menu is the callee's job. */
  onComment: (context: ContextMenuActionContext, options: { screenshot: boolean }) => void;
  captureSupported: () => boolean;
  capture: (target: Element | ScreenshotTarget) => Promise<CommentScreenshotCapture>;
  /**
   * How the user is told an action failed after its menu closed, such as Copy
   * screenshot: the host's toast (`useToast().toast`). A failure is never only logged.
   */
  notify: (notice: ToastOptions & { message: string; tone: "danger" }) => unknown;
  /** The gavel backend's behavior: adds the todo actions and decides what Copy screenshot and a plain copy do. */
  gavel?: GavelTodoActions;
  /** Host-specific actions placed after the shared ones. */
  extraActions?: ContextMenuAction[];
};

/**
 * The react-grab plugin shared by the playground and the grabber host: Copy
 * screenshot, Comment and Comment with screenshot, and copy-context text as what
 * a plain copy produces. With the gavel backend, Copy screenshot copies the todo
 * body and an uploaded image link instead, and the todo actions come first.
 */
export function grabberPlugin(options: GrabberPluginOptions): Plugin {
  const { idPrefix, enabled, onComment, captureSupported, capture, notify, gavel } = options;
  // copyScreenshot puts the element's PNG and its copy context on the
  // clipboard as one item. Everything starts synchronously, inside the
  // action's gesture, which both screen capture and the clipboard require.
  const copyScreenshot = (context: ContextMenuActionContext) => {
    const text = copyContextMarkdown([context.element]);
    context.hideContextMenu();
    context.cleanup();
    const image = capture(context.element).then((result) => {
      if (result.status !== "captured") throw new Error(`screenshot ${result.reason}`);
      return fetch(result.dataUrl).then((response) => response.blob());
    });
    writeClipboard(text, image).catch((error: unknown) => {
      notify({ tone: "danger", message: `Copy screenshot failed: ${error instanceof Error ? error.message : String(error)}` });
    });
  };
  return {
    name: grabberPluginName(idPrefix),
    hooks: {
      transformCopyContent: gavel ? gavel.copyContent : (_content, elements) => copyContextMarkdown(elements),
      ...(gavel ? { onOpenFile: gavel.onOpenFile } : {}),
    },
    ...(gavel ? { setup: gavel.setup } : {}),
    actions: [
      ...(gavel
        ? [
            { id: `${idPrefix}-todo`, label: "Add to gavel todo", shortcut: "T", onAction: gavel.addTodo },
            { id: `${idPrefix}-screenshot`, label: "Screenshot to gavel todo", shortcut: "S", enabled: captureSupported, onAction: gavel.screenshotTodo },
          ]
        : []),
      {
        id: `${idPrefix}-copy-screenshot`,
        label: "Copy screenshot",
        enabled: captureSupported,
        onAction: gavel ? (context) => gavel.copyScreenshot(context, { body: true }) : copyScreenshot,
      },
      ...(gavel ? [{ id: `${idPrefix}-screenshot-only`, label: "Screenshot only", enabled: captureSupported, onAction: (context: ContextMenuActionContext) => gavel.copyScreenshot(context, { body: false }) }] : []),
      { id: "comment", label: "Comment", enabled, onAction: (context) => onComment(context, { screenshot: false }) },
      {
        id: `${idPrefix}-comment-screenshot`,
        label: "Comment with screenshot",
        enabled: (context) => captureSupported() && enabled(context),
        onAction: (context) => onComment(context, { screenshot: true }),
      },
      ...(options.extraActions ?? []),
    ],
  };
}

/**
 * A toolbar button that opens and closes the comments sidebar. react-grab reads
 * a button's label and pressed state when it renders it, so the host registers
 * this plugin again whenever `open` changes.
 */
export function sidebarButtonPlugin(options: { idPrefix: string; icon: string; open: boolean; toggle: () => void }): Plugin {
  return {
    name: sidebarPluginName(options.idPrefix),
    toolbarButtons: [
      {
        id: sidebarPluginName(options.idPrefix),
        label: options.open ? "Close comments sidebar" : "Open comments sidebar",
        icon: options.icon,
        pressed: () => options.open,
        onClick: options.toggle,
      },
    ],
  };
}

/**
 * Registers the grabber plugin on `grab` in place of its built-in `comment`
 * plugin (whose action id it reuses) and makes Comment the toolbar's default
 * action. The returned function undoes exactly that, putting the built-in
 * plugin and the previous default action back.
 */
export function registerGrabberPlugin(options: { grab: ReactGrabAPI; plugin: Plugin; comment: Plugin }): () => void {
  const { grab, plugin, comment } = options;
  const hadComment = grab.getPlugins().includes(comment.name);
  const previousDefaultAction = grab.getToolbarState()?.defaultAction;
  if (hadComment) grab.unregisterPlugin(comment.name);
  grab.registerPlugin(plugin);
  grab.setToolbarState({ defaultAction: "comment" });
  return () => {
    grab.unregisterPlugin(plugin.name);
    if (hadComment) grab.registerPlugin(comment);
    grab.setToolbarState({ defaultAction: previousDefaultAction ?? "copy" });
  };
}
