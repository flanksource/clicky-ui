import { expect, it } from "vitest";
import { commentAgentFor } from "./gavel-delivery";

it("derives the settings agent from a run target, carrying only what the run sets", () => {
  expect(commentAgentFor({ kind: "run", prompt: "p" })).toEqual({ enabled: true, prompt: "p" });
  expect(commentAgentFor({ kind: "run", prompt: "p", groupKey: "g", runOptions: { instructions: "be brief", variables: { a: 1 } } })).toEqual({ enabled: true, prompt: "p", group: "g", instructions: "be brief", variables: { a: 1 } });
  expect(commentAgentFor({ kind: "run", prompt: "p", runOptions: { presets: ["fast"], spec: { model: "codex-example" } } })).toEqual({ enabled: true, prompt: "p", presets: ["fast"], spec: { model: "codex-example" } });
});

it("leaves the delivery's own edits policy out of the rule: edits is chosen on the rule, not derived from a run", () => {
  expect(commentAgentFor({ kind: "run", prompt: "p", edits: "propose" })).not.toHaveProperty("edits");
});
