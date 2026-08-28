import { describe, expect, it } from "vitest";

import type {
  InvalidPromptSpecDetail,
  ValidPromptSpecDetail,
} from "../PromptPicker/types";
import {
  buildSavePayload,
  defaultFilePath,
  draftFor,
  draftRaw,
  isConflictError,
  isDraftDirty,
  isPromptPageDirty,
  pageTabs,
  parseVariables,
  seedVariables,
} from "./prompt-page-model";
import type { PromptCatalogEntry, PromptCatalogLayer } from "./types";

const valid: ValidPromptSpecDetail = {
  id: "commit.message",
  source: "inline",
  raw: "---\nmodel: claude-x\n---\nWrite {{diff}}.\n",
  spec: { model: "claude-x" },
  body: "Write {{diff}}.",
};

const invalid: InvalidPromptSpecDetail = {
  id: "commit.message",
  source: "file",
  path: "bad.prompt",
  raw: "---\nmodel: [broken\n---\nbody\n",
  parseError: "yaml: line 2: did not find expected ',' or ']'",
};

const layer: PromptCatalogLayer = {
  origin: "target-directory",
  path: "/work/app/.gavel.yaml",
  scope: "project=app",
  editable: true,
  source: "none",
};

const entry: PromptCatalogEntry = {
  id: "commit.message",
  title: "Commit message",
  owner: "gavel",
  source: "builtin",
  variables: ["diff", "hint"],
  effective: { modelSource: "runtime" },
  layers: [layer],
};

describe("prompt page model", () => {
  it("seeds a structured draft from a parsed detail and a raw draft from a broken one", () => {
    expect(draftFor(valid)).toEqual({
      mode: "structured",
      raw: valid.raw,
      value: { model: "claude-x", prompt: { user: "Write {{diff}}." } },
    });
    expect(draftFor(invalid)).toEqual({
      mode: "raw",
      raw: invalid.raw,
      value: undefined,
    });
    expect(draftFor(valid, "raw").mode).toBe("raw");
  });

  it("tracks dirtiness per representation", () => {
    const draft = draftFor(valid);
    expect(isDraftDirty(draft, valid)).toBe(false);
    expect(
      isDraftDirty(
        { ...draft, value: { ...draft.value, model: "other" } },
        valid,
      ),
    ).toBe(true);
    expect(
      isDraftDirty({ mode: "raw", raw: valid.raw, value: undefined }, valid),
    ).toBe(false);
    expect(
      isDraftDirty({ mode: "raw", raw: "changed", value: undefined }, valid),
    ).toBe(true);
  });

  it("tracks the document, save destination, and active file path as one pending change", () => {
    const draft = draftFor(valid);
    const initialPath = defaultFilePath(entry, layer, valid);

    expect(
      isPromptPageDirty({
        draft,
        detail: valid,
        source: "inline",
        path: initialPath,
        entry,
        layer,
      }),
    ).toBe(false);
    expect(
      isPromptPageDirty({
        draft,
        detail: valid,
        source: "file",
        path: initialPath,
        entry,
        layer,
      }),
    ).toBe(true);
    expect(
      isPromptPageDirty({
        draft,
        detail: valid,
        source: "file",
        path: "other.prompt",
        entry,
        layer,
      }),
    ).toBe(true);
    expect(
      isPromptPageDirty({
        draft: { ...draft, value: { ...draft.value, model: "other" } },
        detail: valid,
        source: "inline",
        path: initialPath,
        entry,
        layer,
      }),
    ).toBe(true);
  });

  it("composes a structured draft back into a .prompt document for preview and diff", () => {
    const draft = draftFor(valid);
    expect(draftRaw(draft)).toBe("---\nmodel: claude-x\n---\nWrite {{diff}}.");
    expect(draftRaw({ mode: "raw", raw: "verbatim", value: undefined })).toBe(
      "verbatim",
    );
    expect(
      draftRaw({
        mode: "structured",
        raw: "",
        value: { prompt: { user: "only body" } },
      }),
    ).toBe("only body");
  });

  it("builds the save payload for both representations with the loaded raw as base", () => {
    expect(buildSavePayload(draftFor(valid), valid, "inline", "")).toEqual({
      source: "inline",
      path: undefined,
      spec: { model: "claude-x" },
      body: "Write {{diff}}.",
      baseRaw: valid.raw,
    });
    expect(
      buildSavePayload(
        { mode: "raw", raw: "fixed", value: undefined },
        invalid,
        "file",
        "bad.prompt",
      ),
    ).toEqual({
      source: "file",
      path: "bad.prompt",
      raw: "fixed",
      baseRaw: invalid.raw,
    });
  });

  it("derives the file path from the detail, the layer, then a conventional default", () => {
    expect(defaultFilePath(entry, layer, invalid)).toBe("bad.prompt");
    expect(
      defaultFilePath(
        entry,
        { ...layer, filePath: "/work/app/p.prompt" },
        valid,
      ),
    ).toBe("/work/app/p.prompt");
    expect(defaultFilePath(entry, layer, valid)).toBe(
      ".gavel/prompts/commit-message.prompt",
    );
  });

  it("recognises the backend's conflict rejection", () => {
    expect(
      isConflictError(
        "prompt commit.message changed since it was loaded (version a, now b); reload before saving",
      ),
    ).toBe(true);
    expect(isConflictError("invalid prompt: yaml parse error")).toBe(false);
  });

  it("seeds and parses preview variables", () => {
    expect(JSON.parse(seedVariables(entry))).toEqual({ diff: "", hint: "" });
    expect(parseVariables("")).toEqual({ variables: {} });
    expect(parseVariables('{"diff": "x"}')).toEqual({
      variables: { diff: "x" },
    });
    expect(parseVariables("[1]")).toEqual({
      error: "variables must be a JSON object",
    });
    expect("error" in parseVariables("{nope")).toBe(true);
  });

  it("lists tabs by capability and appends host tabs with counts", () => {
    expect(
      pageTabs({ canPreview: false, canDiff: false }).map((tab) => tab.id),
    ).toEqual(["prompt"]);
    expect(
      pageTabs({
        canPreview: true,
        canDiff: true,
        extraTabs: [{ id: "runs", label: "Runs", content: null, count: 3 }],
      }),
    ).toEqual([
      { id: "prompt", label: "Prompt" },
      { id: "preview", label: "Preview" },
      { id: "diff", label: "Diff vs default" },
      { id: "runs", label: "Runs", count: 3 },
    ]);
  });
});
