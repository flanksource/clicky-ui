import { describe, expect, it } from "vitest";
import { commentDefaultDelivery } from "./default-delivery";
import type { CommentAgentSettings } from "./gavel-delivery";

type Resolved = CommentAgentSettings["agent"];

const resolved = (overrides: Partial<Resolved["agent"]>, provenance: Resolved["provenance"] = {}, session?: string) => ({
  rule: { agent: overrides, provenance, found: true } satisfies Resolved,
  ...(session ? { session } : {}),
});

describe("commentDefaultDelivery", () => {
  it("is unknown until the rule has loaded", () => {
    expect(commentDefaultDelivery({ rule: undefined })).toBeUndefined();
  });

  it.each([{ enabled: false }, {}])("is null when auto-run is not enabled and no session takes the threads (%o)", (agent) => {
    expect(commentDefaultDelivery(resolved(agent))).toBeNull();
  });

  it("names the model and the layer that enabled the rule", () => {
    const delivery = commentDefaultDelivery(resolved({ enabled: true, prompt: "editor-comments", spec: { model: "claude-opus-5-5" } }, { enabled: { layer: "project" } }));
    expect(delivery).toEqual({
      label: "claude-opus-5-5",
      layer: "project",
      description: "New comments here are delivered to claude-opus-5-5 by the comment agent rule in project. Pick a target to send this one elsewhere.",
    });
  });

  it("falls back to the rule's prompt, then the default run prompt, and notes that assignment follows", () => {
    expect(commentDefaultDelivery(resolved({ enabled: true, prompt: "triage", assign: true }))).toEqual({
      label: "triage",
      description: "New comments here are delivered to triage by the comment agent rule, which also assigns the thread to it. Pick a target to send this one elsewhere.",
    });
    expect(commentDefaultDelivery(resolved({ enabled: true }))?.label).toBe("editor-comments");
  });

  describe("with a live session routing every new thread", () => {
    const description = "New comments here are delivered to the live session claude-site-1, which `gavel edit --session` routes every new human thread to ahead of any comment agent rule. Pick a target to send this one elsewhere.";

    it("names the session, and no rule layer, over an enabled rule", () => {
      expect(commentDefaultDelivery(resolved({ enabled: true, prompt: "triage" }, { enabled: { layer: "project" } }, "claude-site-1"))).toEqual({ label: "claude-site-1", description });
    });

    it("still names the session when no rule is enabled", () => {
      expect(commentDefaultDelivery(resolved({}, {}, "claude-site-1"))).toEqual({ label: "claude-site-1", description });
    });
  });
});
