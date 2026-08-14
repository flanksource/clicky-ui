import { describe, expect, it } from "vitest";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { LANGUAGE_IDS, mergeSpec, registerGomplateLanguages, spec } from "../src/index.ts";
import { languageById, LANGUAGES } from "../src/playground.ts";

/**
 * The vendored tree carries its own extensive suite in gomplate; this checks
 * that what was copied here still works once wired to this package's entries —
 * the failure mode a vendoring introduces is a broken copy, not broken logic.
 */
describe("the vendored language support", () => {
  registerGomplateLanguages(monaco, { completions: false, hovers: false });

  it("registers every generated language", () => {
    const registered = new Set(monaco.languages.getLanguages().map((l) => l.id));
    for (const id of LANGUAGE_IDS) expect(registered).toContain(id);
  });

  it("tokenizes a namespaced CEL call", () => {
    const [line] = monaco.editor.tokenize(`k8s.cpuAsMillicores("500m")`, "cel");
    expect((line ?? []).map((token) => token.type.replace(/\.cel$/, ""))).toContain("namespace");
  });

  it("ships a catalogue big enough to be the real one", () => {
    expect(spec.cel.functions.length).toBeGreaterThan(100);
    expect(spec.gotemplate.functions.length).toBeGreaterThan(100);
  });

  it("folds a host's catalogue in", () => {
    const merged = mergeSpec(spec, {
      ...spec,
      cel: {
        ...spec.cel,
        namespaces: [...spec.cel.namespaces, "catalog"],
        functions: [...spec.cel.functions, { name: "catalog.query", namespace: "catalog" }],
      },
    });
    expect(merged.cel.functions.map((fn) => fn.name)).toContain("catalog.query");
  });
});

describe("the playground's language list", () => {
  it("names an editor language this package registers", () => {
    for (const language of LANGUAGES) {
      if (language.editorLanguage === "javascript") continue; // Monaco's own
      expect(LANGUAGE_IDS).toContain(language.editorLanguage);
    }
  });

  it("falls back rather than throwing on an id it does not know", () => {
    // The id arrives from a URL or a bookmark, so an unknown one must not take
    // the page down with it.
    expect(languageById("klingon").id).toBe(LANGUAGES[0]!.id);
  });

  it("throws only when offered nothing at all", () => {
    expect(() => languageById("cel", [])).toThrow(/no playground languages/);
  });
});
