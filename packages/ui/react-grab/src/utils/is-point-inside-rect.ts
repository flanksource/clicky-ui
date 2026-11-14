// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-point-inside-rect.ts
import type { Rect } from "../types.js";

export const isPointInsideRect = (clientX: number, clientY: number, rect: Rect): boolean =>
  clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
