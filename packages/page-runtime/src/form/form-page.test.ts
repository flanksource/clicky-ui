import { describe, expect, it } from "vitest";
import { validateHostMessage } from "../host/validation.ts";
import type { FolderManifest, SourceProvider } from "../schema.ts";
import { FORM_ENTRY, formPageOpen } from "./form-page.ts";

const manifest: FolderManifest = { dependencies: { "@flanksource/clicky-ui": "^0.3.57" } };
const inline = "import { defineFormExtension } from '@flanksource/clicky-ui/components'; export default defineFormExtension({ name: 'inline' });";

describe("formPageOpen", () => {
  it("places inline sources under __form and imports them from the generated entry in order", () => {
    const open = formPageOpen({ manifest, extensions: [{ tsx: inline, name: "first" }, { tsx: `${inline}\n// second` }] });
    expect(open.page).toBe(FORM_ENTRY);
    expect(Object.keys(open.files).sort()).toEqual(["__form/entry.tsx", "__form/ext-0.tsx", "__form/ext-1.tsx"]);
    expect(open.files["__form/ext-0.tsx"]).toBe(inline);
    expect(open.files["__form/ext-1.tsx"]).toBe(`${inline}\n// second`);
    const entry = open.files[FORM_ENTRY]!;
    expect(entry).toContain('import extension0 from "./ext-0.tsx";');
    expect(entry).toContain('import extension1 from "./ext-1.tsx";');
    expect(entry).toContain('import { JsonSchemaForm } from "@flanksource/clicky-ui/components";');
    expect(entry).toContain('[extension0, "first"], [extension1, "inline-1"]');
  });

  it("keeps a ref as a path relative to the project root, served by the host files", () => {
    const open = formPageOpen({ manifest, files: { "form/extension.tsx": inline }, extensions: [{ ref: "form/extension.tsx" }] });
    expect(open.files["form/extension.tsx"]).toBe(inline);
    expect(open.files[FORM_ENTRY]).toContain('import extension0 from "../form/extension.tsx";');
    expect(open.files[FORM_ENTRY]).toContain('[extension0, "form/extension.tsx"]');
    expect(Object.keys(open.files).some((path) => path.startsWith("__form/ext-"))).toBe(false);
  });

  it("lets the source provider serve a ref that is not in the files and forwards provider and policy", () => {
    const sourceProvider: SourceProvider = { url: "https://sources.example/forms", paths: ["extensions/team.tsx"] };
    const policy = { dependencies: "strict" as const, allow: ["@flanksource/*"] };
    const open = formPageOpen({ manifest, sourceProvider, policy, extensions: [{ ref: "extensions/team.tsx" }] });
    expect(open).toMatchObject({ sourceProvider, policy });
    expect(open.files).not.toHaveProperty("extensions/team.tsx");
    // The worker roots provider paths in the page's directory, so the entry reaches them as siblings.
    expect(open.files[FORM_ENTRY]).toContain('import extension0 from "./extensions/team.tsx";');
  });

  describe("schema-declared sources", () => {
    const declared = { type: "object", "x-clicky-extensions": [{ ref: "form/declared.tsx" }, { tsx: "export default { name: 'declared-inline' }", name: "declared-inline" }] };

    it("appends them after the host sources with stable indices into the combined file names", () => {
      const open = formPageOpen({ manifest, schema: declared, files: { "form/declared.tsx": inline }, extensions: [{ tsx: "export default { name: 'host' }", name: "host" }] });
      expect(Object.keys(open.files).sort()).toEqual(["__form/entry.tsx", "__form/ext-0.tsx", "__form/ext-2.tsx", "form/declared.tsx"]);
      expect(open.files["__form/ext-0.tsx"]).toBe("export default { name: 'host' }");
      expect(open.files["__form/ext-2.tsx"]).toBe("export default { name: 'declared-inline' }");
      const entry = open.files[FORM_ENTRY]!;
      expect(entry).toContain('[extension0, "host"]');
      expect(entry).toContain('import declared0 from "../form/declared.tsx";');
      expect(entry).toContain('import declared1 from "./ext-2.tsx";');
      expect(entry).toContain('[declared0, "form/declared.tsx"], [declared1, "declared-inline"]');
    });

    it("lets the source provider serve a schema ref", () => {
      const sourceProvider: SourceProvider = { url: "https://sources.example/forms", paths: ["form/declared.tsx"] };
      expect(formPageOpen({ manifest, schema: { "x-clicky-extensions": [{ ref: "form/declared.tsx" }] }, sourceProvider, extensions: [] }).files[FORM_ENTRY]).toContain('import declared0 from "./form/declared.tsx";');
    });

    it("throws for a schema ref nothing can serve, naming the schema", () => {
      expect(() => formPageOpen({ manifest, schema: declared, extensions: [] })).toThrow(/schema x-clicky-extensions\[0\].*form\/declared\.tsx.*files.*sourceProvider/);
    });

    it("applies the same validation to schema sources as to host sources", () => {
      expect(() => formPageOpen({ manifest, schema: { "x-clicky-extensions": [{ tsx: " " }] }, extensions: [] })).toThrow(/schema x-clicky-extensions\[0\].*empty/);
      expect(() => formPageOpen({ manifest, schema: { "x-clicky-extensions": [{ ref: "../escape.tsx" }] }, extensions: [] })).toThrow(/invalid source path/);
    });

    it.each([
      ["not an array", { "x-clicky-extensions": { ref: "a.tsx" } }],
      ["an entry with neither tsx nor ref", { "x-clicky-extensions": [{ name: "x" }] }],
      ["an entry with both tsx and ref", { "x-clicky-extensions": [{ ref: "a.tsx", tsx: "x" }] }],
      ["a non-string ref", { "x-clicky-extensions": [{ ref: 1 }] }],
    ])("rejects a malformed keyword: %s", (_name, schema) => {
      expect(() => formPageOpen({ manifest, schema: schema as never, extensions: [] })).toThrow(/x-clicky-extensions/);
    });

    it("is unchanged for a schema without the keyword, or no schema", () => {
      const baseline = formPageOpen({ manifest, extensions: [{ tsx: inline }] });
      expect(formPageOpen({ manifest, schema: { type: "object" }, extensions: [{ tsx: inline }] })).toEqual(baseline);
      expect(formPageOpen({ manifest, schema: null, extensions: [{ tsx: inline }] })).toEqual(baseline);
    });
  });

  it("omits optional open fields it was not given", () => {
    expect(Object.keys(formPageOpen({ manifest, extensions: [] })).sort()).toEqual(["files", "manifest", "page"]);
  });

  it("throws at build time for a ref that neither the files nor the source provider can serve", () => {
    const sourceProvider: SourceProvider = { url: "https://sources.example/forms", paths: ["other.tsx"] };
    expect(() => formPageOpen({ manifest, extensions: [{ ref: "missing.tsx" }] })).toThrow(/missing\.tsx.*files.*sourceProvider/);
    expect(() => formPageOpen({ manifest, sourceProvider, files: { "x.tsx": inline }, extensions: [{ ref: "missing.tsx" }] })).toThrow(/missing\.tsx/);
  });

  it.each([
    ["../escape.tsx", /invalid source path/],
    ["/abs.tsx", /invalid source path/],
    ["data.json", /JavaScript\/TypeScript/],
  ])("rejects the unusable ref %s", (ref, reason) => {
    expect(() => formPageOpen({ manifest, files: { [ref]: "x" }, extensions: [{ ref }] })).toThrow(reason);
  });

  it("rejects an empty inline source and a source that shadows a generated file", () => {
    expect(() => formPageOpen({ manifest, extensions: [{ tsx: "  " }] })).toThrow(/extension 0.*empty/);
    expect(() => formPageOpen({ manifest, files: { [FORM_ENTRY]: "x" }, extensions: [] })).toThrow(/reserved/);
    expect(() => formPageOpen({ manifest, files: { "__form/ext-0.tsx": "x" }, extensions: [] })).toThrow(/reserved/);
  });

  it("requires clicky-ui in the manifest because the entry imports it", () => {
    expect(() => formPageOpen({ manifest: { dependencies: {} }, extensions: [] })).toThrow(/@flanksource\/clicky-ui/);
  });

  it("produces a message the host bridge accepts", () => {
    const open = formPageOpen({ manifest, files: { "extension.tsx": inline }, extensions: [{ ref: "extension.tsx" }, { tsx: inline }] });
    expect(validateHostMessage({ type: "open", ...open })).toMatchObject({ type: "open", page: FORM_ENTRY });
  });
});
