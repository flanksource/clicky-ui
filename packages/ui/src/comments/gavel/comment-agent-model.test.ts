import { describe, expect, it } from "vitest";
import { agentFieldValue, draftOfAgent, inheritPatch, layerLabelOf, ownLayerLabel, ownLayerOf, provenanceChipOf, runSettingsPatch, sessionBadgeOf, sessionContextPercent, type CommentAgentLayers } from "./comment-agent-model";

const layers: CommentAgentLayers["layers"] = [
  { kind: "user", file: ".gavel.yaml", location: "/home/example/.gavel.yaml", config: {} },
  { kind: "project", location: "db", config: {} },
  { kind: "path", path: "docs", file: ".gavel.team.yaml", location: "/work/site/docs/.gavel.team.yaml", config: {} },
];
const settings: CommentAgentLayers = { positions: [], provenance: {}, layers };

describe("layerLabelOf", () => {
  it("names a file layer by its location and a database layer by its position", () => {
    expect(layers.map(layerLabelOf)).toEqual(["/home/example/.gavel.yaml", "db:project:", "/work/site/docs/.gavel.team.yaml"]);
  });
});

describe("provenanceChipOf", () => {
  it("names the file a value came from, or the database, and says when it came from the page's own entry", () => {
    const provenance = { enabled: { layer: "/home/example/.gavel.yaml" }, edits: { layer: "db:project:", page: "docs/README.md" }, prompt: { layer: "/work/site/docs/.gavel.team.yaml" } };
    expect((["enabled", "edits", "prompt"] as const).map((field) => provenanceChipOf({ settings, provenance, field }))).toEqual([
      { label: ".gavel.yaml", title: "/home/example/.gavel.yaml", set: true },
      { label: "DB (page)", title: "db:project: · docs/README.md", set: true },
      { label: ".gavel.team.yaml", title: "/work/site/docs/.gavel.team.yaml", set: true },
    ]);
  });

  it("says a field no layer sets takes gavel's default", () => {
    expect(provenanceChipOf({ settings, provenance: {}, field: "assign" })).toEqual({ label: "default", title: "No settings layer sets this field, so gavel's built-in default applies", set: false });
  });

  it("fails loudly when a value names a layer that is not in the chain, which is a gavel contract break", () => {
    expect(() => provenanceChipOf({ settings, provenance: { enabled: { layer: "/elsewhere/.gavel.yaml" } }, field: "enabled" })).toThrow(/enabled.*\/elsewhere\/\.gavel\.yaml.*not one of/);
  });
});

describe("ownLayerLabel", () => {
  it("finds the label of the layer a save targets, so only its own values offer to inherit", () => {
    expect(ownLayerLabel(settings, { kind: "project" })).toBe("db:project:");
    expect(ownLayerLabel(settings, { kind: "path", path: "docs", file: ".gavel.team.yaml" })).toBe("/work/site/docs/.gavel.team.yaml");
    expect(ownLayerLabel(settings, { kind: "path", path: "other" })).toBeUndefined();
  });
});

describe("ownLayerOf", () => {
  const position = (overrides: Partial<CommentAgentLayers["positions"][number]>): CommentAgentLayers["positions"][number] => ({ kind: "project", dir: "/work/site", files: [], db: true, ...overrides });
  const chain = (...positions: CommentAgentLayers["positions"]): CommentAgentLayers => ({ positions, layers: [], provenance: {} });

  it("saves to the project's database layer when the project has no settings file", () => {
    expect(ownLayerOf(chain(position({})))).toEqual({ kind: "project" });
  });

  it("saves to the project's .gavel.yaml when it has one, because gavel refuses the database layer beside a file", () => {
    expect(ownLayerOf(chain(position({ files: [".gavel.yaml", ".gavel.team.yaml"], db: false })))).toEqual({ kind: "project", file: ".gavel.yaml" });
  });

  it("ignores the other positions of the chain", () => {
    const user = position({ kind: "user", dir: "/home/example", files: [".gavel.yaml"], db: false });
    expect(ownLayerOf(chain(user, position({})))).toEqual({ kind: "project" });
  });

  it.each([
    { name: "no project position in the chain", positions: [position({ kind: "user" })], error: /no project position/ },
    { name: "a project position with neither a file nor a database layer", positions: [position({ db: false })], error: /cannot be saved/ },
  ])("fails loudly with $name rather than saving somewhere else", ({ positions, error }) => {
    expect(() => ownLayerOf(chain(...positions))).toThrow(error);
  });

  it("names the file-backed layer by its location, so only its own values offer to inherit", () => {
    const fileLayers: CommentAgentLayers["layers"] = [{ kind: "project", file: ".gavel.yaml", location: "/work/site/.gavel.yaml", config: {} }];
    expect(ownLayerLabel({ positions: [], layers: fileLayers, provenance: {} }, { kind: "project", file: ".gavel.yaml" })).toBe("/work/site/.gavel.yaml");
  });
});

describe("inheritPatch", () => {
  it("removes the field from the entry with a null, which a merge patch sends and an undefined would lose", () => {
    expect(JSON.stringify(inheritPatch("prompt"))).toBe('{"prompt":null}');
  });
});

describe("runSettingsPatch", () => {
  const agent = { enabled: true, prompt: "review", presets: ["fast"], spec: { model: "codex-example" }, variables: { ticket: "T-1" }, instructions: "be brief" };

  it("is empty while the draft is what the agent already is", () => {
    expect(runSettingsPatch(agent, draftOfAgent(agent))).toEqual({});
  });

  it("carries only the fields the draft changed", () => {
    expect(runSettingsPatch(agent, { ...draftOfAgent(agent), prompt: "triage", instructions: "be thorough" })).toEqual({ prompt: "triage", instructions: "be thorough" });
  });

  it("names a field the draft emptied as null, so the merge patch removes it and the field inherits again", () => {
    const patch = runSettingsPatch(agent, { ...draftOfAgent(agent), presets: [], spec: {}, variables: {}, instructions: "  " });
    expect(patch).toEqual({ presets: null, spec: null, variables: null, instructions: null });
    expect(JSON.parse(JSON.stringify(patch))).toEqual({ presets: null, spec: null, variables: null, instructions: null });
  });

  it("shows the default prompt for an agent that names none, and does not write it back unchanged", () => {
    expect(draftOfAgent({}).prompt).toBe("editor-comments");
    expect(runSettingsPatch({}, draftOfAgent({}))).toEqual({});
  });
});

describe("session display", () => {
  const base = { id: "s-1", source: "claude", title: "Docs", inCmux: true };

  it("says an ended managed session resumes, where a live one shows its status", () => {
    expect(sessionBadgeOf({ ...base, status: "ended", resumable: true })).toBe("resumes");
    expect(sessionBadgeOf({ ...base, status: "active" })).toBe("active");
    expect(sessionBadgeOf(base)).toBe("running");
  });

  it("flags a live session gavel cannot reach through cmux", () => {
    expect(sessionBadgeOf({ ...base, inCmux: false, status: "active" })).toBe("not in cmux");
  });

  it("reports how full a session's context window is, as a rounded percentage", () => {
    expect(sessionContextPercent({ ...base, context: { usedTokens: 50_000, windowTokens: 200_000 } })).toBe(25);
    expect(sessionContextPercent(base)).toBeUndefined();
  });
});

describe("agentFieldValue", () => {
  it("summarises each field as the text the picker shows beside its chip", () => {
    const agent = { enabled: true, assign: false, edits: "propose" as const, prompt: "review", presets: ["fast", "cheap"], spec: { model: "codex-example" }, variables: { a: 1 }, instructions: "be brief", group: "g-1" };
    expect((["enabled", "assign", "edits", "prompt", "presets", "spec", "variables", "instructions", "group"] as const).map((field) => agentFieldValue(agent, field))).toEqual(["on", "no", "propose", "review", "fast, cheap", "codex-example", '{"a":1}', "be brief", "g-1"]);
  });

  it("shows the defaults gavel applies to a field nothing sets", () => {
    expect((["enabled", "edits", "prompt", "presets", "spec", "variables", "instructions", "group"] as const).map((field) => agentFieldValue({}, field))).toEqual(["off", "direct", "editor-comments", "", "", "", "", ""]);
  });
});
