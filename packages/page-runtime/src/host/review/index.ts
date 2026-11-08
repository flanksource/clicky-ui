import type { ReviewAction, ReviewActionRequest, ReviewHostMessage, ReviewState } from "../../review-schema.ts";
import { validateReviewFrameMessage, validateReviewHostMessage } from "./validation.ts";

export type RemoteReviewOptions = { send(message: ReviewHostMessage): void; onState(state: ReviewState): void; onAction(action: ReviewActionRequest): void; timeoutMs?: number };

export function createRemoteReview(options: RemoteReviewOptions) {
  const pending = new Map<string, { resolve(value: ReviewState | ReviewActionRequest): void; reject(error: Error): void; timer: ReturnType<typeof setTimeout> }>();
  let disposed = false;
  function request(message: ReviewHostMessage): Promise<ReviewState | ReviewActionRequest> {
    if (disposed) return Promise.reject(new Error("Remote review is disposed"));
    validateReviewHostMessage(message);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(message.requestId); reject(new Error(`Review request ${message.requestId} timed out`)); }, options.timeoutMs ?? 15000);
      pending.set(message.requestId, { resolve, reject, timer });
      try { options.send(message); } catch (error) { clearTimeout(timer); pending.delete(message.requestId); reject(error); }
    });
  }
  return {
    list: () => request({ type: "review-list", requestId: crypto.randomUUID() }),
    select: (id: string | null) => request({ type: "review-select", requestId: crypto.randomUUID(), id }),
    setVisibility: (settings: { visible: boolean; showRejected: boolean }) => request({ type: "review-visibility", requestId: crypto.randomUUID(), ...settings }),
    action: (settings: { id: string; action: ReviewAction }) => request({ type: "review-action", requestId: crypto.randomUUID(), ...settings }),
    receive(value: unknown): void {
      if (disposed) throw new Error("Remote review is disposed");
      const message = validateReviewFrameMessage(value);
      const waiting = message.requestId ? pending.get(message.requestId) : undefined;
      if (message.requestId && waiting) { pending.delete(message.requestId); clearTimeout(waiting.timer); }
      if (message.type === "review-error") {
        const error = new Error(message.error);
        if (!waiting) throw error;
        waiting.reject(error); return;
      }
      if (message.type === "review-state") options.onState(message); else options.onAction(message);
      waiting?.resolve(message);
    },
    dispose(): void { disposed = true; for (const value of pending.values()) { clearTimeout(value.timer); value.reject(new Error("Remote review disposed")); } pending.clear(); },
  };
}

export { validateReviewFrameMessage, validateReviewHostMessage } from "./validation.ts";
export type { ReviewAction, ReviewElement, ReviewHostMessage, ReviewFrameMessage, ReviewState, ReviewActionRequest } from "../../review-schema.ts";
