import { describe, expect, it } from "vitest";
import type { AIPromptRunValue } from "../PromptRunEditor/model";
import type { RuntimePreset, RuntimeProfile } from "../runtime-profile";
import {
  afterSave,
  detachedValue,
  editDraft,
  inheritedRuntime,
  isDraftDirty,
  pickerStateFor,
  saveAsNewDraft,
  selectProfile,
} from "./RuntimeProfilePicker.model";

const PRESETS: RuntimePreset[] = [
  {
    id: "defaults",
    name: "Defaults",
    scope: "global",
    spec: { model: "anthropic/claude-sonnet-5", mode: "agent" },
  },
];

const REVIEW: RuntimeProfile = {
  id: "review-profile",
  name: "Plan and review",
  spec: { permissions: { mode: "plan" }, setup: { cwd: "/profile" } },
  presets: ["defaults"],
};

const VALUE: AIPromptRunValue = {
  variables: { company: "Acme" },
  spec: { model: "openai/gpt-5.5", prompt: { user: "Review" } },
};

describe("runtime profile picker model", () => {
  it("selects a profile by setting only runtimeProfile", () => {
    const next = selectProfile(VALUE, REVIEW);
    expect(next).toEqual({ ...VALUE, runtimeProfile: "review-profile" });
    expect(next.spec).toBe(VALUE.spec);
  });

  it("removes the runtimeProfile key when None is selected", () => {
    const next = selectProfile({ ...VALUE, runtimeProfile: "review-profile" }, undefined);
    expect("runtimeProfile" in next).toBe(false);
    expect(next).toEqual(VALUE);
  });

  it("seeds a draft from the profile referenced by id or name", () => {
    const byName = pickerStateFor({ ...VALUE, runtimeProfile: "plan AND review" }, [REVIEW]);
    expect(byName).toEqual({
      selectedRef: "plan AND review",
      draft: REVIEW,
      layer: "run",
    });
    expect(byName.draft).not.toBe(REVIEW);
    expect(pickerStateFor(VALUE, [REVIEW]).draft).toBeUndefined();
  });

  it("tracks draft edits independent of key order", () => {
    const state = pickerStateFor({ ...VALUE, runtimeProfile: "review-profile" }, [REVIEW]);
    expect(isDraftDirty(state, [REVIEW])).toBe(false);
    const reordered = editDraft(state, {
      presets: ["defaults"],
      spec: { setup: { cwd: "/profile" }, permissions: { mode: "plan" } },
      name: "Plan and review",
      id: "review-profile",
    });
    expect(isDraftDirty(reordered, [REVIEW])).toBe(false);
    const edited = editDraft(state, { ...REVIEW, spec: { ...REVIEW.spec, model: "x" } });
    expect(isDraftDirty(edited, [REVIEW])).toBe(true);
    expect(isDraftDirty(state, [])).toBe(true);
  });

  it("moves the selection to a newly created profile after saving", () => {
    const value = { ...VALUE, runtimeProfile: "review-profile" };
    const state = pickerStateFor(value, [REVIEW]);
    const created = { ...REVIEW, id: "review-copy", name: "Plan and review copy" };
    const moved = afterSave(value, state, created);
    expect(moved.value.runtimeProfile).toBe("review-copy");
    expect(moved.state).toEqual({ selectedRef: "review-copy", draft: created, layer: "run" });

    const same = afterSave(value, state, { ...REVIEW, name: "Renamed" });
    expect(same.value).toBe(value);
    expect(same.state.draft?.name).toBe("Renamed");
  });

  it("detaches by folding the resolved spec under the request spec", () => {
    const value = { ...VALUE, runtimeProfile: "review-profile" };
    const detached = detachedValue(value, {
      model: "anthropic/claude-sonnet-5",
      mode: "agent",
      permissions: { mode: "plan" },
      setup: { cwd: "/profile", envVars: [{ name: "A", value: "1" }] },
    });
    expect("runtimeProfile" in detached).toBe(false);
    expect(detached.spec).toEqual({
      model: "openai/gpt-5.5",
      mode: "agent",
      prompt: { user: "Review" },
      permissions: { mode: "plan" },
      setup: { cwd: "/profile", envVars: [{ name: "A", value: "1" }] },
    });
    expect(detached.variables).toBe(VALUE.variables);
  });

  it("prefers the last resolution over authored presets for inherited runtime", () => {
    expect(inheritedRuntime({ draft: REVIEW, presets: PRESETS })).toEqual({
      model: "anthropic/claude-sonnet-5",
      mode: "agent",
    });
    expect(
      inheritedRuntime({
        draft: REVIEW,
        presets: PRESETS,
        resolution: { spec: { model: "openai/gpt-5.5" }, constraints: {}, trace: [] },
      }),
    ).toEqual({ model: "openai/gpt-5.5", mode: "agent" });
    expect(inheritedRuntime({ draft: undefined, presets: PRESETS })).toEqual({});
  });

  it("creates a save-as-new draft with a fresh id and unique copy name", () => {
    const copy = saveAsNewDraft(REVIEW, [REVIEW, { ...REVIEW, id: "c", name: "Plan and review copy" }], "new-id");
    expect(copy).toEqual({ ...REVIEW, id: "new-id", name: "Plan and review copy 2" });
    expect(copy.spec).not.toBe(REVIEW.spec);
  });
});
