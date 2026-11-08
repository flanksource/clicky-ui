// @vitest-environment node
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, it, vi } from "vitest";
import { productionChanges } from "./production-changes";

it("reports an edited source inside a directory created after the watcher starts", async () => {
  await mkdir(".tmp", { recursive: true });
  const root = await realpath(await mkdtemp(resolve(".tmp/production-changes-")));
  const paths: string[] = [];
  const changes = productionChanges({ roots: [root], changed: path => paths.push(path), packages: { current: () => ({ revision: "a".repeat(64), packages: {} }), subscribe: () => () => {} } });
  try {
    await mkdir(resolve(root, "new-section"));
    const file = resolve(root, "new-section/page.tsx");
    await writeFile(file, 'export default () => <h1>New page</h1>;');
    await vi.waitFor(() => expect(paths).toContain(file), { timeout: 3000 });
    const before = changes.revision();
    await writeFile(file, 'export default () => <h1>Edited page</h1>;');
    await vi.waitFor(() => expect(changes.revision()).not.toBe(before), { timeout: 3000 });
  } finally {
    changes.close();
    await rm(root, { recursive: true, force: true });
  }
});
