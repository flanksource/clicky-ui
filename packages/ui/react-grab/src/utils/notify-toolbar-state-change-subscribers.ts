// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/notify-toolbar-state-change-subscribers.ts
import { RecoverableError } from "../errors.js";
import type { ToolbarState } from "../types.js";
import { reportRecoverableError } from "./report-recoverable-error.js";

const reportSubscriberError = (error: unknown): void => {
  reportRecoverableError(new RecoverableError("Toolbar state change subscriber failed", error));
};

export const notifyToolbarStateChangeSubscribers = (
  subscribers: ReadonlySet<(state: ToolbarState) => void>,
  state: ToolbarState,
): void => {
  for (const subscriber of subscribers) {
    try {
      void Promise.resolve(subscriber(state)).catch(reportSubscriberError);
    } catch (error) {
      reportSubscriberError(error);
    }
  }
};
