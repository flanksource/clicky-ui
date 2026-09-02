import { describe, expect, it } from "vitest";
import { SPEC_RUNTIME_FAMILIES } from "../../runtime/runtime-mode";
import type { RuntimePreset, RuntimeProfile } from "../runtime-profile";
import {
  authoredRuntimeSpec,
  duplicateName,
  mergeRuntimeSpec,
  nextNewName,
  permissionTarget,
  presetsOf,
  referencedBy,
  reorderProfilePresets,
  uniqueName,
} from "./model";

const PRESETS: RuntimePreset[] = [
  {
    id: "defaults",
    name: "Defaults",
    scope: "global",
    spec: { model: "anthropic/claude-sonnet-5", mode: "agent" },
  },
  { id: "plan", name: "Plan", scope: "surface", spec: { mode: "cli" } },
];

const PROFILE: RuntimeProfile = {
  id: "profile",
  name: "Profile",
  spec: {},
  presets: ["surface-a", "global", "user", "surface-b"],
};

describe("runtime profile model", () => {
  it("reorders the selected preset references directly", () => {
    expect(reorderProfilePresets(PROFILE, 0, 3).presets).toEqual([
      "global",
      "user",
      "surface-b",
      "surface-a",
    ]);
    expect(() => reorderProfilePresets(PROFILE, 0, 9)).toThrow(
      "cannot reorder preset from 0 to 9",
    );
  });

  it("resolves preset references by id or case-insensitive name and reports the rest", () => {
    expect(
      presetsOf({ presets: ["defaults", " plan ", "ghost"] }, PRESETS),
    ).toEqual({ found: [PRESETS[0], PRESETS[1]], missing: ["ghost"] });
  });

  it("derives model and mode from found presets before profile overrides", () => {
    expect(
      authoredRuntimeSpec(
        {
          ...PROFILE,
          spec: { model: "openai/gpt-5.6-sol" },
          presets: ["defaults", "ghost", "plan"],
        },
        PRESETS,
      ),
    ).toEqual({ model: "openai/gpt-5.6-sol", mode: "cli" });
    expect(authoredRuntimeSpec(undefined, PRESETS)).toEqual({});
  });

  it("reports references by id or name and generates unique names", () => {
    const byName: RuntimeProfile = { ...PROFILE, id: "p2", name: "Named", presets: ["DEFAULTS"] };
    expect(referencedBy(PRESETS[0]!, [PROFILE, byName])).toEqual(["Named"]);
    expect(
      referencedBy({ id: "surface-a", name: "Surface A" }, [PROFILE, byName]),
    ).toEqual(["Profile"]);
    expect(
      duplicateName("Surface A", ["surface a copy", "SURFACE A COPY 2"]),
    ).toBe("Surface A copy 3");
    expect(nextNewName("New profile", ["new profile", "New profile 2"])).toBe(
      "New profile 3",
    );
  });

  it("requires a non-blank name that no other record already uses", () => {
    const records = [
      { id: "a", name: "Review" },
      { id: "b", name: "Coding" },
    ];
    expect(uniqueName("  ", "a", records)).toBe(false);
    expect(uniqueName("review", "a", records)).toBe(true);
    expect(uniqueName("CODING", "a", records)).toBe(false);
  });

  it("targets the permission catalog only for a known family and mode", () => {
    expect(
      permissionTarget(
        { model: "anthropic/claude-sonnet-5", mode: "cli" },
        SPEC_RUNTIME_FAMILIES,
      ),
    ).toEqual({ provider: "anthropic", mode: "cli" });
    expect(
      permissionTarget({ model: "cli:anthropic/claude-sonnet-5" }, SPEC_RUNTIME_FAMILIES),
    ).toEqual({ provider: "anthropic", mode: "cli" });
    expect(permissionTarget({ mode: "cli" }, SPEC_RUNTIME_FAMILIES)).toBeUndefined();
    expect(
      permissionTarget({ model: "anthropic/claude-sonnet-5" }, SPEC_RUNTIME_FAMILIES),
    ).toBeUndefined();
  });

  it("deep merges objects, replaces arrays and skips undefined overlays", () => {
    const base = {
      model: "anthropic/claude-sonnet-5",
      permissions: { mode: "plan" as const, presets: ["safe"] },
      setup: { envVars: [{ name: "A", value: "1" }], cwd: "/base" },
    };
    const merged = mergeRuntimeSpec(base, {
      model: undefined,
      mode: "cli",
      permissions: { presets: ["fast", "loose"] },
      setup: { cwd: "." },
    });
    expect(merged).toEqual({
      model: "anthropic/claude-sonnet-5",
      mode: "cli",
      permissions: { mode: "plan", presets: ["fast", "loose"] },
      setup: { envVars: [{ name: "A", value: "1" }], cwd: "." },
    });
    expect(base.permissions.presets).toEqual(["safe"]);
    expect(merged.setup?.envVars).not.toBe(base.setup.envVars);
  });
});
