// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/get-bounds-center.ts
import type { OverlayBounds } from "../types.js";

interface BoundsCenter {
  x: number;
  y: number;
}

export const getBoundsCenter = (bounds: OverlayBounds): BoundsCenter => ({
  x: bounds.x + bounds.width / 2,
  y: bounds.y + bounds.height / 2,
});
