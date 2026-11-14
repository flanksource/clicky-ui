// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/safe-decode-uri-component.ts
export const safeDecodeURIComponent = (input: string): string => {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
};
