// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/are-arrays-shallow-equal.ts
export const areArraysShallowEqual = <T>(
  firstValues: readonly T[],
  secondValues: readonly T[],
): boolean =>
  firstValues.length === secondValues.length &&
  firstValues.every((value, valueIndex) => value === secondValues[valueIndex]);
