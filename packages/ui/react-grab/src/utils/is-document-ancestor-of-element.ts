// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-document-ancestor-of-element.ts
import { getWindowFrameElement } from "./get-window-frame-element.js";

export const isDocumentAncestorOfElement = (
  ancestorDocument: Document,
  element: Element,
): boolean => {
  let currentDocument: Document | null = element.ownerDocument;
  while (currentDocument) {
    if (currentDocument === ancestorDocument) return true;
    const parentFrameElement = getWindowFrameElement(currentDocument.defaultView);
    currentDocument = parentFrameElement?.ownerDocument ?? null;
  }
  return false;
};
