import { describe, expect, it } from "vitest";
import {
  AGENT_RUNTIME_ICONS,
  APPROVAL_ICONS,
  EFFORT_ICONS,
  PERMISSION_MODE_ICONS,
  WORKFLOW_PHASES,
  effortIcon,
  type AgentActionMeta,
} from "./agent-action-icons";
import { SPEC_PERMISSION_MODES } from "./SpecRuntimeEditor.model";
import type { SessionTone } from "./SessionViewer.model";

// The tones every disc/badge is painted with (mirrors DISC_TONE in
// SessionViewer.rows.tsx). A tone outside this set would render with no color.
const VALID_TONES: ReadonlySet<SessionTone> = new Set([
  "sky",
  "amber",
  "violet",
  "emerald",
  "teal",
  "orange",
  "rose",
  "indigo",
  "fuchsia",
  "pink",
  "slate",
]);

function assertWellFormed(name: string, meta: AgentActionMeta) {
  it(`${name} resolves a glyph, a paintable tone and a label`, () => {
    expect(typeof meta.icon).toBe("function");
    expect(VALID_TONES.has(meta.tone)).toBe(true);
    expect(meta.label.length).toBeGreaterThan(0);
  });
}

describe("agent action icon maps are well-formed", () => {
  for (const [key, meta] of Object.entries(WORKFLOW_PHASES)) assertWellFormed(`phase ${key}`, meta);
  for (const [key, meta] of Object.entries(EFFORT_ICONS)) assertWellFormed(`effort ${key}`, meta);
  for (const [key, meta] of Object.entries(APPROVAL_ICONS)) assertWellFormed(`approval ${key}`, meta);
  for (const [key, meta] of Object.entries(AGENT_RUNTIME_ICONS)) assertWellFormed(`runtime ${key}`, meta);
  for (const [key, meta] of Object.entries(PERMISSION_MODE_ICONS)) assertWellFormed(`mode ${key}`, meta);
});

describe("PERMISSION_MODE_ICONS is total over the permission-mode union", () => {
  it("covers every SpecPermissionMode with no extras", () => {
    expect(new Set(Object.keys(PERMISSION_MODE_ICONS))).toEqual(new Set(SPEC_PERMISSION_MODES));
  });
});

describe("effortIcon", () => {
  it("resolves every named effort level", () => {
    expect(effortIcon("minimal")).toBe(EFFORT_ICONS.minimal);
    expect(effortIcon("xhigh")).toBe(EFFORT_ICONS.xhigh);
    expect(effortIcon("max")).toBe(EFFORT_ICONS.max);
    expect(effortIcon("ultra")).toBe(EFFORT_ICONS.ultra);
    expect(effortIcon("Adaptive")).toBe(EFFORT_ICONS.adaptive);
  });

  it("rejects unknown effort values", () => {
    expect(effortIcon("ultra-plus")).toBeUndefined();
    expect(effortIcon("nonsense")).toBeUndefined();
  });
});

describe("the plan → run → verify triad reads blue → green → teal", () => {
  it("assigns the workflow tones the design specifies", () => {
    expect(WORKFLOW_PHASES.plan.tone).toBe("sky");
    expect(WORKFLOW_PHASES.run.tone).toBe("emerald");
    expect(WORKFLOW_PHASES.verify.tone).toBe("teal");
  });
});
