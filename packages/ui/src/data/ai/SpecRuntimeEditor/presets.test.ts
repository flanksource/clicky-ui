import { describe, expect, it } from "vitest";
import type {
  AISpecRuntimePermissionCatalog,
  AISpecRuntimeValue,
} from "../SpecRuntimeEditor.model";
import {
  buildPermissionCatalog,
  specPermissionEntries,
} from "./permissions-model";
import {
  activeSpecPreset,
  applyPermissionPresetSnapshot,
  applySpecPreset,
  buildPermissionPresetSnapshot,
  savedPresetMatches,
} from "./presets";

const CATALOG: AISpecRuntimePermissionCatalog = {
  tools: [
    { id: "Read", group: "Files" },
    { id: "Edit", group: "Files" },
    { id: "Write", group: "Files" },
    { id: "Glob", group: "Files" },
    { id: "Bash", group: "Shell" },
    { id: "WebSearch", group: "Web" },
    { id: "TodoWrite", group: "Planning" },
  ],
  mcp: [{ id: "filesystem", group: "MCP" }],
  plugins: [{ id: "captain", group: "Plugins" }],
  skills: [{ id: "$CWD/.skills", group: "Skills" }],
};

function entries(value: AISpecRuntimeValue) {
  return specPermissionEntries(value, buildPermissionCatalog(CATALOG, []));
}

describe("presets", () => {
  it("applies the edit preset tool policies with group fallback", () => {
    const next = applySpecPreset({}, "edit", entries({}));
    expect(next.permissions?.tools).toMatchObject({
      Read: "allow",
      Edit: "auto",
      Write: "auto",
      Glob: "auto",
      Bash: "ask",
      WebSearch: "ask",
      TodoWrite: "ask",
    });
    expect(next.permissions?.mcp).toMatchObject({ filesystem: "enabled" });
    expect(next.permissions?.plugins).toMatchObject({ captain: "enabled" });
    expect(next.permissions?.skills).toMatchObject({
      "$CWD/.skills": "enabled",
    });
  });

  it("applies plan and readonly presets", () => {
    const plan = applySpecPreset({}, "plan", entries({}));
    expect(plan.permissions?.tools).toMatchObject({
      Read: "allow",
      Edit: "deny",
      Bash: "deny",
      WebSearch: "ask",
      TodoWrite: "deny",
    });
    expect(plan.permissions?.mcp).toMatchObject({ filesystem: "disabled" });
    expect(plan.permissions?.skills).toMatchObject({
      "$CWD/.skills": "enabled",
    });

    const readonly = applySpecPreset({}, "readonly", entries({}));
    expect(readonly.permissions?.tools).toMatchObject({
      Read: "ask",
      Write: "deny",
      WebSearch: "deny",
      TodoWrite: "deny",
    });
    expect(readonly.permissions?.mcp).toMatchObject({
      filesystem: "disabled",
    });
    expect(readonly.permissions?.plugins).toMatchObject({
      captain: "disabled",
    });
    expect(readonly.permissions?.skills).toMatchObject({
      "$CWD/.skills": "disabled",
    });
  });

  it("round-trips: applying a preset makes it active, manual edits deactivate", () => {
    const applied = applySpecPreset({}, "edit", entries({}));
    expect(activeSpecPreset(applied, entries(applied))).toBe("edit");

    const tweaked: AISpecRuntimeValue = {
      ...applied,
      permissions: {
        ...applied.permissions,
        tools: {
          ...(applied.permissions?.tools as Record<string, string>),
          Bash: "deny",
        },
      },
    };
    expect(activeSpecPreset(tweaked, entries(tweaked))).toBeUndefined();
  });

  it("reports no active preset for an empty spec whose defaults do not match", () => {
    expect(activeSpecPreset({}, entries({}))).toBeUndefined();
  });

  it("captures, reapplies, and matches saved permission snapshots", () => {
    const value: AISpecRuntimeValue = {
      permissions: {
        tools: { Read: "allow", Bash: "deny" },
        mcp: { filesystem: "disabled" },
        skills: { "$CWD/.skills": "disabled" },
      },
      memory: { skipHooks: true, skipSkills: true },
    };
    const snapshot = buildPermissionPresetSnapshot(value, entries(value));
    const applied = applyPermissionPresetSnapshot({}, snapshot);

    expect(applied.permissions?.tools).toMatchObject({
      Read: "allow",
      Bash: "deny",
    });
    expect(applied.permissions?.skills).toMatchObject({
      "$CWD/.skills": "disabled",
    });
    expect(applied.memory).toEqual({ skipHooks: true });
    expect(
      savedPresetMatches(applied, entries(applied), {
        id: "local:test",
        label: "Test",
        snapshot,
        updatedAt: "2026-07-02T00:00:00.000Z",
      }),
    ).toBe(true);
  });

  it("fails loud on an unknown preset id", () => {
    expect(() =>
      applySpecPreset({}, "bogus" as never, entries({})),
    ).toThrowError(/unknown spec runtime preset/);
  });
});
