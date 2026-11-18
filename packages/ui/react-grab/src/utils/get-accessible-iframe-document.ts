// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/get-accessible-iframe-document.ts
export const getAccessibleIframeDocument = (iframeElement: HTMLIFrameElement): Document | null => {
  try {
    return iframeElement.contentDocument;
  } catch {
    return null;
  }
};
