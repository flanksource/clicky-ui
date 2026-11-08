import { describe, expect, it } from "vitest";
import { encodeHash, decodeHash } from "./hash";
import type { Project } from "../project";

describe("hash source", () => {
  it("keeps a complete large lock below the browser navigation URL limit", async () => {
    const project: Project = { format: 1, name: "Large lock", entry: "page.tsx", files: { "package.json": '{"dependencies":{}}', "page.tsx": "export default () => null;" }, locks: { "page.tsx": { lock: 2, packageOrigin: "https://packages.example", page: "page.tsx", versions: {}, map: { imports: {}, scopes: {} }, integrity: Object.fromEntries(Array.from({ length: 30000 }, (_, index) => [`@acme/library@1.0.0/dist/components/component-${index}.js`, `sha384-${String(index).padStart(64, "0")}`])), remaps: {}, barrels: { modules: [], barrels: {} } } } };
    const hash = await encodeHash(project);
    expect(hash.length).toBeLessThan(2_000_000);
    expect(await decodeHash(hash)).toEqual(project);
  });
  it("round trips Unicode source and the lock without registry state", async () => {
    const project: Project = { format: 1, name: "דו״ח", entry: "page.tsx", files: { "package.json": '{"dependencies":{}}', "page.tsx": 'export default () => <p>שלום 🌍 #&</p>' }, locks: { "page.tsx": { lock: 2, packageOrigin: "https://packages.example", page: "page.tsx", versions: { react: "18.3.1" }, map: { imports: { react: "/npm/react@18.3.1/index.js" }, scopes: {} }, integrity: {}, remaps: {}, barrels: { modules: [], barrels: {} } } } };
    const hash = await encodeHash(project);
    expect(hash).toMatch(/^#page=[\w-]+$/);
    expect(await decodeHash(hash)).toEqual(project);
  });
  it.each(["", "#page=%", "#page=e30"])("rejects invalid payload %s", async (hash) => {
    await expect(decodeHash(hash)).rejects.toThrow();
  });
});
