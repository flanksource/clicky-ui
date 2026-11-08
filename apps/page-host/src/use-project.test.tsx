// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useProject } from "./use-project";
import { STARTER } from "./starter";
import { encodeHash, decodeHash } from "./providers/hash";
import type { PageLock } from "@flanksource/page-runtime/schema";

it("preserves an edit when a lock arrives in the same render batch and saves that source", async () => {
  history.replaceState(null, "", await encodeHash(STARTER));
  let host!: ReturnType<typeof useProject>;
  function Host() { host = useProject(); return null; }
  const element = document.createElement("div"); document.body.append(element);
  const root = createRoot(element);
  const source = 'export default () => <h1>שלום 🌍</h1>;';
  const lock: PageLock = { lock: 2, packageOrigin: "https://packages.example", page: STARTER.entry, versions: {}, map: { imports: {}, scopes: {} }, integrity: {}, remaps: {}, barrels: { modules: [], barrels: {} } };
  try {
    await act(async () => root.render(createElement(Host)));
    await vi.waitFor(async () => { await act(async () => {}); expect(host.project).not.toBeNull(); });
    await act(() => { host.edit({ path: STARTER.entry, source }); host.recordLock(lock); });
    expect(host.project?.files[STARTER.entry]).toBe(source);
    await act(() => host.share());
    expect((await decodeHash(location.hash)).files[STARTER.entry]).toBe(source);
  } finally { await act(() => root.unmount()); element.remove(); history.replaceState(null, "", "/"); }
});
