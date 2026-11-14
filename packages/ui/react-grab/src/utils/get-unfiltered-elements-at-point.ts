// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/get-unfiltered-elements-at-point.ts
import { getDeepElementsAtPoint } from "./get-deep-elements-at-point.js";
import { resumePointerEventsFreeze, suspendPointerEventsFreeze } from "./pointer-events-freeze.js";

export const getUnfilteredElementsAtPoint = (clientX: number, clientY: number): Element[] => {
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return [];
  suspendPointerEventsFreeze();
  try {
    return getDeepElementsAtPoint(clientX, clientY);
  } finally {
    resumePointerEventsFreeze();
  }
};
