// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-position-inside-bounds.ts
import type { OverlayBounds, Position } from "../types.js";

export const isPositionInsideBounds = (position: Position, bounds: OverlayBounds) =>
  position.x >= bounds.x &&
  position.x <= bounds.x + bounds.width &&
  position.y >= bounds.y &&
  position.y <= bounds.y + bounds.height;
