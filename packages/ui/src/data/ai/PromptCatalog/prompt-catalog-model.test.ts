import { describe, expect, it } from "vitest";

import {
  catalogFilterOptions,
  defaultEditLayer,
  effectiveLayer,
  entryMatches,
  layersAbove,
  previewText,
  provenanceSummary,
  runtimeSummary,
} from "./prompt-catalog-model";
import type { PromptCatalogEntry, PromptCatalogLayer } from "./types";

const home: PromptCatalogLayer = {
  origin: "user-home",
  path: "/home/dev/.gavel.yaml",
  scope: "scope=global",
  editable: true,
  source: "inline",
  fields: ["model"],
};
const gitRoot: PromptCatalogLayer = {
  origin: "git-root",
  path: "/work/repo/.gavel.yaml",
  editable: false,
  source: "none",
};
const project: PromptCatalogLayer = {
  origin: "target-directory",
  path: "/work/repo/app/.gavel.yaml",
  scope: "project=app",
  editable: true,
  source: "none",
};

function entry(
  overrides: Partial<PromptCatalogEntry> = {},
): PromptCatalogEntry {
  return {
    id: "commit.message",
    title: "Commit message",
    owner: "gavel",
    usedBy: ["gavel commit"],
    source: "inline",
    body: "Write a commit message for {{diff}}.",
    effective: {
      model: "claude-sonnet-4-6",
      backend: "claude-agent",
      modelSource: "operation",
    },
    provenance: {
      model: "user-home",
      body: "prompt default",
      backend: "ai base",
    },
    layers: [home, gitRoot, project],
    ...overrides,
  };
}

describe("prompt catalog model", () => {
  it("picks the highest layer that sets a source as the effective one", () => {
    expect(effectiveLayer(entry())?.origin).toBe("user-home");
    expect(
      effectiveLayer(
        entry({ layers: [home, gitRoot, { ...project, source: "file" }] }),
      )?.origin,
    ).toBe("target-directory");
    expect(effectiveLayer(entry({ layers: [gitRoot] }))).toBeUndefined();
  });

  it("edits the effective layer when writable, else the most specific writable layer", () => {
    expect(defaultEditLayer(entry())?.origin).toBe("user-home");
    const readOnlyHome = { ...home, editable: false, scope: undefined };
    expect(
      defaultEditLayer(entry({ layers: [readOnlyHome, gitRoot, project] }))
        ?.origin,
    ).toBe("target-directory");
    expect(defaultEditLayer(entry({ layers: [gitRoot] }))).toBeUndefined();
  });

  it("lists the overriding layers that shadow a write to a lower layer", () => {
    const shadowed = entry({
      layers: [home, gitRoot, { ...project, source: "file" }],
    });
    expect(layersAbove(shadowed, home).map((layer) => layer.origin)).toEqual([
      "target-directory",
    ]);
    expect(layersAbove(shadowed, project)).toEqual([]);
  });

  it("summarises runtime and provenance for the table", () => {
    expect(runtimeSummary(entry().effective)).toBe(
      "claude-sonnet-4-6 · claude-agent",
    );
    expect(runtimeSummary({ modelSource: "runtime" })).toBe(
      "inherited at run time (runtime)",
    );
    expect(
      runtimeSummary({
        model: "x",
        modelSource: "operation",
        error: "bad selector",
      }),
    ).toBe("bad selector");
    expect(provenanceSummary(entry())).toBe("model ← Home (~/.gavel.yaml)");
    expect(provenanceSummary(entry({ provenance: { model: "ai base" } }))).toBe(
      "",
    );
  });

  it("derives filter options from the entries present", () => {
    const options = catalogFilterOptions([
      entry(),
      entry({
        id: "todos.run",
        owner: "gavel",
        source: "file",
        usedBy: ["gavel todos run"],
        effective: { modelSource: "runtime" },
      }),
    ]);
    expect(options).toEqual({
      owners: ["gavel"],
      sources: ["file", "inline"],
      commands: ["gavel commit", "gavel todos run"],
      models: ["claude-sonnet-4-6"],
    });
  });

  it("filters by query, facets and overridden-only", () => {
    const builtin = entry({
      id: "lint.fix",
      title: "Lint fix",
      source: "builtin",
      usedBy: ["gavel lint --ai-fix"],
      body: "Fix these {{violations}}.",
    });
    expect(entryMatches(entry(), { query: "COMMIT" })).toBe(true);
    expect(entryMatches(builtin, { query: "commit" })).toBe(false);
    expect(entryMatches(builtin, { commands: ["gavel lint --ai-fix"] })).toBe(
      true,
    );
    expect(entryMatches(builtin, { sources: ["inline"] })).toBe(false);
    expect(entryMatches(builtin, { overriddenOnly: true })).toBe(false);
    expect(
      entryMatches(entry(), {
        overriddenOnly: true,
        models: ["claude-sonnet-4-6"],
      }),
    ).toBe(true);
  });

  it("previews the first non-template line of a body, truncated", () => {
    expect(previewText('{{role "system"}}\n\nSummarise the diff.\nMore.')).toBe(
      "Summarise the diff.",
    );
    expect(previewText("x".repeat(200), 10)).toBe("xxxxxxxxx…");
    expect(previewText(undefined)).toBe("");
  });
});
