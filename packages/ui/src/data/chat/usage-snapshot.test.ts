import { describe, expect, it } from "vitest";
import type { ChatMessageMetadata } from "./types";
import { usageSnapshotFromMetadata } from "./usage-snapshot";

const options = { contextWindow: 1_000_000, modelLabel: "Claude Opus 5", messageCount: 4 };

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

  it("keeps context occupancy from contextTokens", () => {
    const metadata: ChatMessageMetadata = {
      contextTokens: 128138,
      usage: { totalTokens: 131806 },
    };

    const snapshot = usageSnapshotFromMetadata(metadata, options);

    expect(snapshot.usedTokens).toBe(128138);
    expect(snapshot.maxTokens).toBe(1_000_000);
  });

  it("carries the per-turn breakdown through for the last-turn tables", () => {
    const metadata: ChatMessageMetadata = {
      costBreakdown: { inputUsd: 0.64069, outputUsd: 0.0917, totalUsd: 0.73239 },
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
