// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/lerp.ts
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};
