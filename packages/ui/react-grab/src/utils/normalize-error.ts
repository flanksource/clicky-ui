// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/normalize-error.ts
export const normalizeErrorMessage = (error: unknown, fallback = "Unknown error"): string =>
  error instanceof Error && error.message ? error.message : fallback;

export const normalizeError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));
