// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/report-recoverable-error.ts
import type { RecoverableError } from "../errors.js";

export const reportRecoverableError = (error: RecoverableError): void => {
  console.warn("[react-grab]", error);
};
