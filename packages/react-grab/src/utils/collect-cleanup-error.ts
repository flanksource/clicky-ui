// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/collect-cleanup-error.ts
export const collectCleanupError = (cleanup: () => void, cleanupErrors: unknown[]): void => {
  try {
    cleanup();
  } catch (error) {
    cleanupErrors.push(error);
  }
};
