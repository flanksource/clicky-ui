// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/get-composed-parent-element.ts
import { isShadowRoot } from "./is-shadow-root.js";
import { isDocumentNode } from "./is-document-node.js";
import { getWindowFrameElement } from "./get-window-frame-element.js";

export const getComposedParentElement = (element: Element): Element | null => {
  if (element.assignedSlot) return element.assignedSlot;
  if (element.parentElement) return element.parentElement;

  const rootNode = element.getRootNode();
  if (isShadowRoot(rootNode)) return rootNode.host;
  if (isDocumentNode(rootNode)) return getWindowFrameElement(rootNode.defaultView);
  return null;
};
