// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/get-window-frame-element.ts
export const getWindowFrameElement = (targetWindow: Window | null): Element | null => {
  if (!targetWindow) return null;
  try {
    return targetWindow.frameElement;
  } catch {
    return null;
  }
};
