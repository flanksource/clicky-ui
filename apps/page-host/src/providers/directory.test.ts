import { describe, expect, it } from "vitest";
import { directoryProvider, type Directory } from "./directory";
import { STARTER } from "../starter";
import { directoryComments } from "../comments/store";

function memoryDirectory(name: string): { directory: Directory; files: Map<string, string> } {
  const files = new Map<string, string>();
  const directories = new Map<string, Directory>();
  const directory: Directory = {
    kind: "directory", name,
    async *values() {
      for (const [name, text] of files) yield { kind: "file" as const, name, getFile: async () => new File([text], name) };
      yield* directories.values();
    },
    async getDirectoryHandle(name, options) {
      if (!directories.has(name)) {
        if (!options?.create) throw new DOMException(`missing ${name}`, "NotFoundError");
        directories.set(name, memoryDirectory(name).directory);
      }
      return directories.get(name)!;
    },
    async getFileHandle(name, options) {
      if (!files.has(name) && !options?.create) throw new DOMException(`missing ${name}`, "NotFoundError");
      return {
        getFile: async () => new File([files.get(name)!], name),
        createWritable: async () => ({ write: async (text) => { files.set(name, text); }, close: async () => {} }),
      };
    },
  };
  return { directory, files };
}

describe("directory sources", () => {
  it("round trips nested text files, selected page and locks", async () => {
    const { directory } = memoryDirectory("Reports");
    const provider = directoryProvider({ directory, id: "folder", label: "Reports" });
    const project = { ...structuredClone(STARTER), entry: "reports/q3.tsx", files: { ...STARTER.files, "reports/q3.tsx": "export default () => <h1>Q3</h1>" } };
    await provider.save(project);
    expect(await provider.read()).toEqual(project);
  });
  it("writes lock metadata without saving edited buffers", async () => {
    const { directory, files } = memoryDirectory("Reports");
    const provider = directoryProvider({ directory, id: "opfs", label: "Reports" });
    await provider.save(STARTER);
    const lock = { lock: 2 as const, packageOrigin: "https://packages.example", page: STARTER.entry, versions: {}, map: { imports: {}, scopes: {} }, integrity: {}, remaps: {}, barrels: { modules: [], barrels: {} } };
    await provider.saveLocks({ [STARTER.entry]: lock });
    expect(files.get(STARTER.entry)).toBe(STARTER.files[STARTER.entry]);
    expect((await provider.read())?.locks).toEqual({ [STARTER.entry]: lock });
  });
  it("reads plain source folders and excludes dependency directories", async () => {
    const { directory, files } = memoryDirectory("Reports");
    files.set("package.json", STARTER.files["package.json"]!);
    files.set("report.tsx", "export default () => <h1>Report</h1>");
    files.set("binary.png", "not text");
    const deps = await directory.getDirectoryHandle("node_modules", { create: true });
    const writer = await (await deps.getFileHandle("dependency.tsx", { create: true })).createWritable();
    await writer.write("excluded");
    await writer.close();
    expect(await directoryProvider({ directory, id: "folder", label: "Reports" }).read()).toEqual({
      format: 1, name: "Reports", entry: "report.tsx", files: { "package.json": STARTER.files["package.json"], "report.tsx": "export default () => <h1>Report</h1>" }, locks: {},
    });
  });
  it("reports empty directories and fails on corrupt sidecars", async () => {
    const { directory, files } = memoryDirectory("Reports");
    const provider = directoryProvider({ directory, id: "opfs", label: "Reports" });
    expect(await provider.read()).toBeNull();
    await provider.save(STARTER);
    files.set(".page-runtime.json", "{");
    await expect(provider.read()).rejects.toThrow();
  });
  it("keeps comment sidecars beside source without exposing them as page files or overwriting another page", async () => {
    const { directory, files } = memoryDirectory("Reports");
    const provider = directoryProvider({ directory, id: "folder", label: "Reports" });
    await provider.save(STARTER);
    const comments = directoryComments(directory);
    const first = { id: "review-1", body: "Review this heading", createdAt: "2026-11-06T12:00:00Z", author: { name: "Local reviewer" } };
    const second = { ...first, id: "review-2", body: "Review the note" };
    await comments.save({ page: STARTER.entry, comments: [first] });
    await comments.save({ page: "notes.tsx", comments: [second] });
    await provider.save(STARTER);
    expect(await provider.read()).toEqual(STARTER);
    expect([await comments.load(STARTER.entry), await comments.load("notes.tsx")]).toEqual([[first], [second]]);
    files.set(".page-comments.json", '{"format":1,"pages":{"notes.tsx":[{"id":"bad"}]}}');
    await expect(comments.load("notes.tsx")).rejects.toThrow("invalid comment");
  });
});
