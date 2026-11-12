// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/get-parent-react-grab-api.ts
import type { ReactGrabAPI } from "../types.js";

export const getParentReactGrabApi = (): ReactGrabAPI | null => {
  if (typeof window === "undefined" || window.parent === window) return null;

  try {
    return window.parent.__REACT_GRAB__ ?? null;
  } catch {
    return null;
  }
};
