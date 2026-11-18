import { expect, it, vi } from "vitest";
import { createRemoteReview } from "./index.ts";
import type { ReviewHostMessage } from "../../review-schema.ts";

it("correlates review state, action errors and unsolicited geometry without host DOM access", async () => {
  const sent: ReviewHostMessage[] = [];
  const onState = vi.fn();
  const adapter = createRemoteReview({ send: (message) => sent.push(message), onState, onAction: vi.fn() });
  const waiting = adapter.setVisibility({ visible: true, showRejected: false });
  const state = { type: "review-state", requestId: sent[0]!.requestId, elements: [], selected: null, visible: true, showRejected: false };
  adapter.receive(state);
  expect(await waiting).toEqual(state);
  adapter.receive({ ...state, requestId: undefined });
  expect(onState).toHaveBeenCalledTimes(2);
  const action = adapter.action({ id: "summary", action: "approved" });
  adapter.receive({ type: "review-error", requestId: sent[1]!.requestId, error: "Review element no longer exists" });
  await expect(action).rejects.toThrow("no longer exists");
  const pending = adapter.list();
  adapter.dispose();
  await expect(pending).rejects.toThrow("disposed");
});
