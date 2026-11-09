import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it, vi } from "vitest";
import { candidatesForPage, openRuntimeDb, putCandidates, RUNTIME_DB, type CandidatesRecord } from "./db.ts";

const record = (page: string, module: string, candidates: string[]): CandidatesRecord => ({ page, module, sourceHash: `hash-${module}`, candidates });

describe("runtime database", () => {
  it("creates the candidates and tailwind stores with the indexes the runtime queries", async () => {
    const db = await openRuntimeDb({ factory: new IDBFactory() });
    const tx = db.transaction(["candidates", "tailwind"]);
    expect({
      name: db.name,
      candidates: { keyPath: tx.objectStore("candidates").keyPath, indexes: [...tx.objectStore("candidates").indexNames] },
      tailwind: { keyPath: tx.objectStore("tailwind").keyPath, indexes: [...tx.objectStore("tailwind").indexNames] },
      libraryIndex: tx.objectStore("tailwind").index("libraryKey+lastUsedAt").keyPath,
    }).toEqual({
      name: RUNTIME_DB,
      candidates: { keyPath: ["page", "module"], indexes: ["page"] },
      tailwind: { keyPath: "key", indexes: ["libraryKey+lastUsedAt"] },
      libraryIndex: ["libraryKey", "lastUsedAt"],
    });
    db.close();
  });

  it("returns a page's candidates through the page index and replaces a module's record in place", async () => {
    const db = await openRuntimeDb({ factory: new IDBFactory() });
    await putCandidates(db, record("a.tsx", "/src/a.tsx", ["flex", "p-4"]));
    await putCandidates(db, record("a.tsx", "/src/lib.ts", ["grid"]));
    await putCandidates(db, record("b.tsx", "/src/b.tsx", ["hidden"]));
    await putCandidates(db, record("a.tsx", "/src/a.tsx", ["flex", "p-8"]));
    const found = await candidatesForPage(db, "a.tsx");
    expect(found.map((item) => [item.module, item.candidates]).sort()).toEqual([["/src/a.tsx", ["flex", "p-8"]], ["/src/lib.ts", ["grid"]]]);
    expect(await candidatesForPage(db, "missing.tsx")).toEqual([]);
    db.close();
  });

  it("closes the connection and reports a version change from another tab", async () => {
    const factory = new IDBFactory();
    const onVersionChange = vi.fn();
    const db = await openRuntimeDb({ factory, onVersionChange });
    const upgrade = factory.open(RUNTIME_DB, 99);
    await new Promise<void>((resolve) => { upgrade.onsuccess = () => { upgrade.result.close(); resolve(); }; });
    expect(onVersionChange).toHaveBeenCalledTimes(1);
    expect(() => db.transaction("candidates")).toThrow();
  });

  it("fails loudly when IndexedDB is unavailable", async () => {
    vi.stubGlobal("indexedDB", undefined);
    try { await expect(openRuntimeDb()).rejects.toThrow("IndexedDB is unavailable"); }
    finally { vi.unstubAllGlobals(); }
  });
});
