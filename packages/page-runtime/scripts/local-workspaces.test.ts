import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import { findLocalWorkspaces } from "./local-workspaces.ts";

const cleanup: string[] = [];
afterEach(() => { for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true }); });

/** A parent directory of sibling checkouts; `layout` maps each relative package directory to its package name. */
function siblings(layout: Record<string, string>): { parent: string; workspaceRoot: string } {
  mkdirSync(resolve(".tmp"), { recursive: true });
  const parent = mkdtempSync(resolve(".tmp/local-workspaces-")); cleanup.push(parent);
  for (const [dir, name] of Object.entries(layout)) { mkdirSync(join(parent, dir), { recursive: true }); writeFileSync(join(parent, dir, "package.json"), JSON.stringify({ name })); }
  return { parent, workspaceRoot: join(parent, "clicky-ui") };
}

it("finds requested packages at a sibling's root and under its packages/, ignoring this workspace and dangling links", () => {
  const { parent, workspaceRoot } = siblings({ "clicky-ui": "@acme/self", facet: "@acme/facet", tools: "tools", "tools/packages/grab": "@acme/grab", other: "@acme/unrequested" });
  symlinkSync(join(parent, "missing"), join(parent, ".tmp"));
  expect(findLocalWorkspaces({ workspaceRoot, names: ["@acme/facet", "@acme/grab", "@acme/self", "@acme/absent"] })).toEqual(new Map([["@acme/facet", join(parent, "facet")], ["@acme/grab", join(parent, "tools/packages/grab")]]));
});

it("prefers the checkout named after the package when worktrees also declare it", () => {
  const { parent, workspaceRoot } = siblings({ "clicky-ui": "@acme/self", facet: "@acme/facet", "facet-feature-branch": "@acme/facet" });
  expect(findLocalWorkspaces({ workspaceRoot, names: ["@acme/facet"] })).toEqual(new Map([["@acme/facet", join(parent, "facet")]]));
});

it("fails when several checkouts declare a package and none is named after it", () => {
  const { workspaceRoot } = siblings({ "clicky-ui": "@acme/self", "facet-a": "@acme/facet", "facet-b": "@acme/facet" });
  expect(() => findLocalWorkspaces({ workspaceRoot, names: ["@acme/facet"] })).toThrow(/@acme\/facet: several local checkouts declare it.*keep one named facet/);
});
