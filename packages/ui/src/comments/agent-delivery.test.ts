import { describe, expect, it } from "vitest";
import { UiRobotAi } from "../icons";
import { providerIcon } from "../data/chat/provider-icons";
import { agentDeliveryStage, agentGlyph } from "./agent-delivery";
import type { CommentAgentRun } from "./comment-types";

const REQUESTED = "2026-11-12T08:00:00.000Z";
const REPLIED = "2026-11-12T08:01:00.000Z";
const run = (patch: Partial<CommentAgentRun>): CommentAgentRun => ({ requestedAt: REQUESTED, state: "sent", ...patch });

describe("agentDeliveryStage", () => {
  it.each([
    { name: "queued until the session takes the thread", run: run({ state: "queued" }), stage: "queued" },
    { name: "sent once delivered into the session", run: run({ state: "sent" }), stage: "sent" },
    { name: "replied once the agent writes in the thread", run: run({ state: "sent", repliedAt: REPLIED }), stage: "replied" },
    { name: "replied when the agent marked it done", run: run({ state: "done" }), stage: "replied" },
    { name: "failed when the hand-off failed, even after a reply", run: run({ state: "error", error: "session gone", repliedAt: REPLIED }), stage: "failed" },
  ])("is $stage: $name", ({ run: value, stage }) => {
    expect(agentDeliveryStage(value)).toBe(stage);
  });
});

describe("agentGlyph", () => {
  it("draws the model's provider", () => {
    expect(agentGlyph("claude-opus-5-5").icon).toBe(providerIcon("anthropic"));
  });

  it("falls back to the robot for a name no provider is known for", () => {
    expect(agentGlyph("Gavel agent")).toEqual({ icon: UiRobotAi });
  });
});
