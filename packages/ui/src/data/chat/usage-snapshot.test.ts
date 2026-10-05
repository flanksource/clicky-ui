import { describe, expect, it } from "vitest";
import type { ChatMessageMetadata } from "./types";
import {
  usageSnapshotFromMetadata,
  usageSnapshotFromSession,
} from "./usage-snapshot";

const options = {
  modelLabel: "Claude Opus 5",
  messageCount: 4,
};

describe("usageSnapshotFromMetadata", () => {
  // Real figures from thread 6f58a8f6: the turn that finished cost $0.73, while
  // the conversation had spent $7.36 across nine model calls. Reporting the
  // turn as though it were the total understated spend by 10x.
  it("reports the conversation total, not the turn that just finished", () => {
    const metadata: ChatMessageMetadata = {
      cost: 0.73239,
      threadCostUsd: 7.358646,
    };

    expect(usageSnapshotFromMetadata(metadata, options).cost).toBe(7.358646);
  });

  it("falls back to the turn cost when the backend reports no thread total", () => {
    const metadata: ChatMessageMetadata = { cost: 0.73239 };

    expect(usageSnapshotFromMetadata(metadata, options).cost).toBe(0.73239);
  });

  it("prefers a thread total of zero over a stale turn cost", () => {
    // A backend that explicitly reports zero spend is not the same as one that
    // reports nothing, so ?? must not treat 0 as absent.
    const metadata: ChatMessageMetadata = { cost: 0.5, threadCostUsd: 0 };

    expect(usageSnapshotFromMetadata(metadata, options).cost).toBe(0);
  });

  it("preserves the provider context snapshot independently of cumulative billing", () => {
    const metadata: ChatMessageMetadata = {
      context: { usedTokens: 89_595, windowTokens: 258_400, freePercent: 69 },
      usage: { inputTokens: 660_747, totalTokens: 663_270 },
    };

    const snapshot = usageSnapshotFromMetadata(metadata, options);

    expect(snapshot.usedTokens).toBe(89_595);
    expect(snapshot.maxTokens).toBe(258_400);
    expect(snapshot.freePercent).toBe(69);
  });

  it("leaves missing provider context unavailable despite billing usage and catalog capacity", () => {
    const snapshot = usageSnapshotFromMetadata({ usage: { totalTokens: 663_270 } }, options);
    expect(snapshot.usedTokens).toBeUndefined();
    expect(snapshot.maxTokens).toBeUndefined();
    expect(snapshot.freePercent).toBeUndefined();
  });

  it("preserves explicit zero occupancy", () => {
    const snapshot = usageSnapshotFromMetadata({ context: { usedTokens: 0, windowTokens: 258_400, freePercent: 100 } }, options);
    expect(snapshot.usedTokens).toBe(0);
    expect(snapshot.freePercent).toBe(100);
  });

  it("carries the per-turn breakdown through for the last-turn tables", () => {
    const metadata: ChatMessageMetadata = {
      costBreakdown: {
        inputUsd: 0.64069,
        outputUsd: 0.0917,
        totalUsd: 0.73239,
      },
      usage: { inputTokens: 128138, outputTokens: 3668 },
    };

    const snapshot = usageSnapshotFromMetadata(metadata, options);

    expect(snapshot.costBreakdown?.inputUsd).toBe(0.64069);
    expect(snapshot.usage?.inputTokens).toBe(128138);
  });

  it("omits cost entirely when no figure is available, so the UI shows '-'", () => {
    expect(usageSnapshotFromMetadata({}, options).cost).toBeUndefined();
  });
});

describe("usageSnapshotFromSession", () => {
  it("hydrates context occupancy and cumulative accounting from the session aggregate", () => {
    const snapshot = usageSnapshotFromSession({
      id: "captain-session-1",
      providerSessionId: "provider-session-1",
      messages: [
        {
          id: "user-1",
          role: "user",
          parts: [{ type: "text", text: "Inspect" }],
        },
      ],
      context: {
        usedTokens: 128_138,
        windowTokens: 1_000_000,
        freePercent: 87,
      },
      usage: {
        inputTokens: 120_000,
        outputTokens: 8_138,
        cacheReadTokens: 6_000,
      },
      cost: {
        model: "claude-opus-5",
        inputCost: 0.64,
        outputCost: 0.09,
        providerCostUSD: 7.35,
      },
      backend: "claude-agent",
      executionMode: "agent",
      model: "claude-opus-5",
    });

    expect(snapshot).toEqual({
      usedTokens: 128_138,
      maxTokens: 1_000_000,
      freePercent: 87,
      messageCount: 1,
      cost: 7.35,
      usage: {
        inputTokens: 120_000,
        outputTokens: 8_138,
        cacheReadTokens: 6_000,
      },
      backend: "claude-agent",
      executionMode: "agent",
      model: "claude-opus-5",
      captainSessionId: "captain-session-1",
      providerSessionId: "provider-session-1",
      threadId: "captain-session-1",
    });
  });
});
