// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/key-matches-code.ts
export const keyMatchesCode = (
  targetKey: string | undefined,
  code: string | undefined,
): boolean => {
  if (!targetKey || !code) return false;
  const normalizedTarget = targetKey.toLowerCase();
  if (code === "Space") {
    return normalizedTarget === "space" || normalizedTarget === " ";
  }
  if (code.startsWith("Key")) {
    return code.slice(3).toLowerCase() === normalizedTarget;
  }
  if (code.startsWith("Digit")) {
    return code.slice(5) === normalizedTarget;
  }
  return false;
};
