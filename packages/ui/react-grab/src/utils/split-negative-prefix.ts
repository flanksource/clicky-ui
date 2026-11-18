// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/split-negative-prefix.ts
// Canonical Tailwind negatives are written with a leading dash (`-m-4`,
// `-mt-[8px]`). Only numeric/length utilities carry a sign — colors and
// enums have no negative form — so the parser strips a single leading
// `-`, works on the unsigned spelling, and the caller re-applies the
// sign to the magnitude.
export const splitNegativePrefix = (query: string): { isNegative: boolean; base: string } => {
  const isNegative = query.startsWith("-");
  return { isNegative, base: isNegative ? query.slice(1) : query };
};
