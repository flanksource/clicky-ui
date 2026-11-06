// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/clamp-to-range.ts
export const clampToRange = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max));
