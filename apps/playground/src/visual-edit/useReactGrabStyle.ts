import { useEffect, useRef, type RefObject } from "react";
import type { Plugin } from "@flanksource/react-grab";
import { editableTargetOf, type EditableRoot } from "./editable-dom";

const STYLE_ACTION = {
  label: "Style",
  shortcut: "S",
  shortcutModifier: false,
  showInToolbarMenu: true,
} as const;

/**
 * React Grab's own "edit" plugin: just the "Style" menu item, which opens its CSS panel. Its plugin is
 * not exported, so this restores it when the hook goes away.
 */
const reactGrabStylePlugin: Plugin = {
  name: "edit",
  actions: [{ id: "edit", ...STYLE_ACTION, onAction: (context) => requireEditMode(context.enterEditMode)() }],
};

function requireEditMode(enterEditMode: (() => void) | undefined): () => void {
  if (!enterEditMode) throw new Error("React Grab gave the Style action no enterEditMode; its CSS panel is unavailable");
  return enterEditMode;
}

/**
 * Replaces React Grab's "Style" menu item. On an SVG element Design mode can edit, it opens the
 * playground's style panel; on anything else it still opens React Grab's own CSS panel.
 */
export function useReactGrabStyle(options: {
  contentRef: RefObject<HTMLElement | null>;
  onSelectTarget: (target: EditableRoot) => void;
  onBeforeCssEdit: () => boolean;
}) {
  const current = useRef(options);
  current.current = options;

  useEffect(() => {
    let registered = false;
    let hadEditPlugin = false;

    const register = () => {
      const grab = window.__REACT_GRAB__;
      if (!grab || registered) return;
      hadEditPlugin = grab.getPlugins().includes("edit");
      if (hadEditPlugin) grab.unregisterPlugin("edit");
      grab.registerPlugin({
        name: "playground-style",
        actions: [
          {
            id: "edit",
            ...STYLE_ACTION,
            onAction: (context) => {
              const { contentRef, onSelectTarget, onBeforeCssEdit } = current.current;
              const content = contentRef.current;
              const target = content ? editableTargetOf(context.element, content) : null;
              if (!target) {
                if (!onBeforeCssEdit()) {
                  context.hideContextMenu();
                  context.cleanup();
                  return;
                }
                requireEditMode(context.enterEditMode)();
                return;
              }
              context.hideContextMenu();
              context.cleanup();
              onSelectTarget(target);
            },
          },
        ],
      });
      registered = true;
    };

    window.addEventListener("react-grab:init", register);
    register();
    return () => {
      window.removeEventListener("react-grab:init", register);
      if (!registered) return;
      const grab = window.__REACT_GRAB__;
      if (!grab) return;
      grab.unregisterPlugin("playground-style");
      if (hadEditPlugin) grab.registerPlugin(reactGrabStylePlugin);
    };
  }, []);
}
