import { describe, expect, it } from "vitest";
import type {
  AISpecRuntimePermissionCatalog,
  AISpecRuntimeValue,
} from "../SpecRuntimeEditor.model";
import {
  buildPermissionCatalog,
  groupPermissionEntries,
  permissionGroupMode,
  permissionGroupModeOptions,
  specPermissionEntries,
  withAddedPermission,
  withMCPMode,
  withPermissionEntries,
} from "./permissions-model";

const CATALOG: AISpecRuntimePermissionCatalog = {
  tools: [
    { id: "Read", label: "Read", group: "Files", defaultMode: "auto" },
    { id: "Write", label: "Write", group: "Files", defaultMode: "ask" },
    { id: "Bash", label: "Bash", group: "Shell", defaultMode: "ask" },
  ],
  mcp: [
    { id: "filesystem", label: "filesystem", group: "MCP" },
    { id: "gavel", label: "gavel", group: "MCP" },
  ],
  plugins: [{ id: "/plugins/captain", label: "captain", group: "Plugins" }],
  skills: [{ id: "$CWD/.skills", label: "$CWD/.skills", group: "Skills" }],
};

const VALUE: AISpecRuntimeValue = {
  permissions: {
    tools: { Read: "allow", Bash: "deny" },
    mcp: { gavel: "disabled", servers: ["filesystem", "gavel"] },
    plugins: { "/plugins/captain": "disabled" },
    skills: { "$CWD/.skills": "enabled" },
  },
};

function entries(value: AISpecRuntimeValue) {
  return specPermissionEntries(value, buildPermissionCatalog(CATALOG, []));
}

describe("permissions-model", () => {
  it("merges catalog defaults with spec policies and legacy skills", () => {
    const all = entries(VALUE);
    const byId = Object.fromEntries(all.map((entry) => [entry.id, entry]));
    expect(byId["Read"]).toMatchObject({
      domain: "tools",
      group: "Files",
      mode: "allow",
    });
    expect(byId["Write"]).toMatchObject({ mode: "ask" });
    expect(byId["Bash"]).toMatchObject({ mode: "deny" });
    expect(byId["filesystem"]).toMatchObject({
      domain: "mcp",
      mode: "enabled",
    });
    expect(byId["gavel"]).toMatchObject({ mode: "disabled" });
    expect(byId["/plugins/captain"]).toMatchObject({ mode: "disabled" });
    expect(byId["$CWD/.skills"]).toMatchObject({ mode: "enabled" });

    const legacy = entries({ memory: { skills: ["/extra/skills"] } });
    expect(legacy.find((entry) => entry.id === "/extra/skills")).toMatchObject({
      domain: "skills",
      mode: "enabled",
    });
  });

  it("groups entries and derives homogeneous group modes", () => {
    const groups = groupPermissionEntries(entries(VALUE));
    const names = groups.map(([name]) => name);
    expect(names).toEqual(["Files", "Shell", "MCP", "Plugins", "Skills"]);

    const files = groups.find(([name]) => name === "Files")?.[1] ?? [];
    expect(permissionGroupMode(files)).toBe("mixed");
    expect(permissionGroupModeOptions(files)).toEqual([
      "auto",
      "ask",
      "allow",
      "deny",
    ]);

    const mcp = groups.find(([name]) => name === "MCP")?.[1] ?? [];
    expect(permissionGroupModeOptions(mcp)).toEqual(["enabled", "disabled"]);
  });

  it("applies entry modes into the right policy maps", () => {
    const all = entries(VALUE);
    const files = all.filter((entry) => entry.group === "Files");
    const next = withPermissionEntries(VALUE, files, "deny");
    expect(next.permissions?.tools).toMatchObject({
      Read: "deny",
      Write: "deny",
      Bash: "deny",
    });

    const gavel = all.find((entry) => entry.id === "gavel");
    const enabled = withPermissionEntries(VALUE, [gavel!], "enabled");
    expect(enabled.permissions?.mcp).toMatchObject({ gavel: "enabled" });
    expect(enabled.permissions?.mcp?.servers).toContain("gavel");
  });

  it("migrates legacy memory.skills when a skill entry is written", () => {
    const value: AISpecRuntimeValue = { memory: { skills: ["/extra/skills"] } };
    const skill = entries(value).find((entry) => entry.id === "/extra/skills");
    const next = withPermissionEntries(value, [skill!], "disabled");
    expect(next.memory?.skills).toEqual([]);
    expect(next.permissions?.skills).toMatchObject({
      "/extra/skills": "disabled",
    });
  });

  it("treats legacy skipSkills as disabled skills and clears it on skill edits", () => {
    const value: AISpecRuntimeValue = { memory: { skipSkills: true } };
    const skill = entries(value).find((entry) => entry.id === "$CWD/.skills");
    expect(skill).toMatchObject({ mode: "disabled" });

    const next = withPermissionEntries(value, [skill!], "enabled");
    expect(next.memory?.skipSkills).toBeUndefined();
    expect(next.permissions?.skills).toMatchObject({
      "$CWD/.skills": "enabled",
    });
  });

  it("tracks the servers allowlist when toggling MCP modes", () => {
    const next = withMCPMode({}, "filesystem", "enabled");
    expect(next).toEqual({
      servers: ["filesystem"],
      filesystem: "enabled",
    });
    const disabled = withMCPMode(next, "filesystem", "disabled");
    expect(disabled.filesystem).toBe("disabled");
    expect(disabled.servers).toContain("filesystem");
  });

  it("adds new permission entries with domain defaults and rejects blanks", () => {
    const added = withAddedPermission(VALUE, "tools", " MultiEdit ");
    expect(added?.permissions?.tools).toMatchObject({ MultiEdit: "auto" });
    const mcp = withAddedPermission(VALUE, "mcp", "ado");
    expect(mcp?.permissions?.mcp).toMatchObject({ ado: "enabled" });
    expect(withAddedPermission(VALUE, "tools", "  ")).toBeUndefined();
  });
});
