import { describe, expect, it } from "vitest";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import {
  LANGUAGE_IDS,
  mergeSpec,
  registerGomplateLanguages,
  spec,
} from "./expressions";
import { languageById, LANGUAGES } from "./expressions/playground";

describe("the vendored language support", () => {
  registerGomplateLanguages(monaco, { completions: false, hovers: false });

  it("registers every generated language", () => {
    const registered = new Set(
      monaco.languages.getLanguages().map((language) => language.id),
    );
    for (const id of LANGUAGE_IDS) expect(registered).toContain(id);
  });

  it("tokenizes a namespaced CEL call", () => {
    const [line] = monaco.editor.tokenize(`k8s.cpuAsMillicores("500m")`, "cel");
    expect(
      (line ?? []).map((token) => token.type.replace(/\.cel$/, "")),
    ).toContain("namespace");
  });

  it("ships the generated function catalogue", () => {
    expect(spec.cel.functions.length).toBeGreaterThan(100);
    expect(spec.gotemplate.functions.length).toBeGreaterThan(100);
  });

  it("folds a host function catalogue into the packaged catalogue", () => {
    const merged = mergeSpec(spec, {
      ...spec,
      cel: {
        ...spec.cel,
        namespaces: [...spec.cel.namespaces, "catalog"],
        functions: [
          ...spec.cel.functions,
          { name: "catalog.query", namespace: "catalog" },
        ],
      },
    });
    expect(merged.cel.functions.map((fn) => fn.name)).toContain(
      "catalog.query",
    );
  });
});

describe("the playground language list", () => {
  it("uses a registered editor language", () => {
    for (const language of LANGUAGES) {
      if (language.editorLanguage === "javascript") continue;
      expect(LANGUAGE_IDS).toContain(language.editorLanguage);
    }
  });

  it("falls back for an unknown URL language", () => {
    expect(languageById("klingon").id).toBe(LANGUAGES[0]!.id);
  });

  it("fails when no playground languages are available", () => {
    expect(() => languageById("cel", [])).toThrow(/no playground languages/);
  });
});
