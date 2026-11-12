import { describe, expect, it, vi } from "vitest";
import { agentGlyph } from "@flanksource/clicky-ui/comments";
import { UiRobotAi, UiSliders } from "@flanksource/clicky-ui/icons";
import { agentAssignItems } from "./assign-items";

const session = { id: "s-1", source: "claude", title: "Fix header", model: "claude-opus-5-5", inCmux: false };
const runtime = { spec: { model: "anthropic/claude-sonnet-5-5" } };
const handlers = () => ({ onSession: vi.fn(), onNew: vi.fn(), onAdvanced: vi.fn() });

describe("agentAssignItems", () => {
  it("offers the page's session, a new session with the configured runtime, and Advanced", () => {
    const on = handlers();
    const items = agentAssignItems({ session, runtime, disabled: false, ...on });
    expect(items.map(({ label, icon }) => ({ label, icon }))).toEqual([
      { label: "Fix header", icon: agentGlyph("claude-opus-5-5").icon },
      { label: "New Sonnet 5.5", icon: agentGlyph("anthropic/claude-sonnet-5-5").icon },
      { label: "Advanced…", icon: UiSliders },
    ]);
    items.forEach(item => item.onSelect?.());
    expect([on.onSession.mock.calls.length, on.onNew.mock.calls.length, on.onAdvanced.mock.calls.length]).toEqual([1, 1, 1]);
  });

  it("names gavel's default runtime and omits the session entry while no session is chosen", () => {
    expect(agentAssignItems({ session: undefined, runtime: undefined, disabled: false, ...handlers() }).map(({ label, icon }) => ({ label, icon }))).toEqual([
      { label: "New session (Gavel's default)", icon: UiRobotAi },
      { label: "Advanced…", icon: UiSliders },
    ]);
  });

  it("disables every entry for a thread gavel will not hand off", () => {
    expect(agentAssignItems({ session, runtime, disabled: true, ...handlers() }).map(item => item.disabled)).toEqual([true, true, true]);
  });
});
