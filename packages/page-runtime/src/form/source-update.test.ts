import { describe, expect, it } from "vitest";
import type { FolderManifest, SourceProvider } from "../schema.ts";
import { formPageOpen, type FormExtensionSource } from "./form-page.ts";
import { formSourceUpdate } from "./source-update.ts";

const manifest: FolderManifest = { dependencies: { "@flanksource/clicky-ui": "^0.3.57" } };
const data = { schema: { type: "object" }, value: { name: "api" }, props: {} };
const build = (extensions: FormExtensionSource[], more: { manifest?: FolderManifest; files?: Record<string, string>; sourceProvider?: SourceProvider } = {}) => formPageOpen({ manifest, extensions, ...more });

describe("formSourceUpdate", () => {
  it("returns null when nothing changed", () => {
    expect(formSourceUpdate({ before: build([{ tsx: "a" }]), after: build([{ tsx: "a" }]), data })).toBeNull();
  });

  it("sends only the changed files, with the current data, so the live frame is not remounted", () => {
    const before = build([{ tsx: "a" }], { files: { "keep.tsx": "k", "gone.tsx": "g" } });
    const after = build([{ tsx: "b" }], { files: { "keep.tsx": "k", "new.tsx": "n" } });
    expect(formSourceUpdate({ before, after, data })).toEqual({ type: "sources", data, files: { "__form/ext-0.tsx": "b", "gone.tsx": null, "new.tsx": "n" } });
  });

  it("includes the regenerated entry when the extension list changes", () => {
    const update = formSourceUpdate({ before: build([{ tsx: "a" }]), after: build([{ tsx: "a" }, { tsx: "b" }]), data });
    expect(update).toMatchObject({ type: "sources", files: { "__form/ext-1.tsx": "b", "__form/entry.tsx": expect.stringContaining("extension1") } });
    expect(update).not.toMatchObject({ files: { "__form/ext-0.tsx": expect.anything() } });
  });

  it.each([
    ["manifest", { manifest: { dependencies: { "@flanksource/clicky-ui": "^0.3.58" } } }],
    ["source provider", { sourceProvider: { url: "https://sources.example/forms", paths: [] } }],
  ])("reopens the page when the %s changes, because sources cannot change them", (_name, change) => {
    const before = build([]);
    const after = build([], change);
    expect(formSourceUpdate({ before, after, data })).toEqual({ type: "open", ...after });
  });
});
