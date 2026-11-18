import { describe, expect, it } from "vitest";
import { STARTER } from "./starter";
import { previewUpdate } from "./preview-update";

describe("preview source updates", () => {
  it("pushes only the unsaved changed module", () => {
    const project = { ...STARTER, files: { ...STARTER.files, "diagram.tsx": "edited" } };
    expect(previewUpdate({ project, previous: STARTER.files, reopen: false })).toEqual({ type: "sources", files: { "diagram.tsx": "edited" } });
  });
  it("reopens when library defaults change so the resolver sees the manifest", () => {
    const project = { ...STARTER, files: { ...STARTER.files, "package.json": '{"dependencies":{"@flanksource/clicky-ui":"0.3.41"}}' } };
    expect(previewUpdate({ project, previous: STARTER.files, reopen: false })).toEqual({ type: "open", page: project.entry, files: project.files, manifest: { dependencies: { "@flanksource/clicky-ui": "0.3.41" } } });
  });
  it("reopens after resolution failure instead of sending sources to an unopened page", () => {
    expect(previewUpdate({ project: STARTER, previous: { ...STARTER.files, "notes.tsx": "before" }, reopen: true })?.type).toBe("open");
  });
  it("invalidates deleted modules and skips unchanged buffers", () => {
    expect(previewUpdate({ project: STARTER, previous: { ...STARTER.files, "removed.ts": "gone" }, reopen: false })).toEqual({ type: "sources", files: { "removed.ts": null } });
    expect(previewUpdate({ project: STARTER, previous: STARTER.files, reopen: false })).toBeNull();
  });
  it("keeps the session link override when recovering from a page error", () => {
    const sessionLock = { lock: 2 as const, packageOrigin: "https://packages.example", page: STARTER.entry, versions: {}, map: { imports: { react: "/link/checkout/dist/runtime/react.js" }, scopes: {} }, integrity: {}, remaps: {}, barrels: { modules: [], barrels: {} } };
    const result = previewUpdate({ project: STARTER, previous: { ...STARTER.files, "notes.tsx": "before" }, reopen: true, sessionLock });
    expect(result).toMatchObject({ type: "open", lock: sessionLock });
    expect(STARTER.locks).toEqual({});
  });
});
