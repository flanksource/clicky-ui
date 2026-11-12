export const RUNTIME_DB = "page-runtime";
const RUNTIME_DB_VERSION = 1;
export const TAILWIND_ROUTE = "/__runtime/tailwind/";
export const tailwindCacheName = (version: string) => `page-runtime-${version}-tailwind`;

/** The classes one module of a page contributes. `module` is the module's request path. */
export type CandidatesRecord = { page: string; module: string; sourceHash: string; candidates: string[] };
/**
 * Metadata for one generated stylesheet, which lives in Cache Storage at `url`. `candidates` are the sorted source
 * classes its `key` was derived from; `domClasses` are classes the page's DOM added afterwards.
 */
export type TailwindRecord = { key: string; libraryKey: string; candidates: string[]; domClasses: string[]; bytes: number; url: string; createdAt: number; lastUsedAt: number };
export type OpenRuntimeDb = { factory?: IDBFactory; onVersionChange?: () => void };

const migrations: Array<(db: IDBDatabase) => void> = [
  (db) => {
    db.createObjectStore("candidates", { keyPath: ["page", "module"] }).createIndex("page", "page");
    db.createObjectStore("tailwind", { keyPath: "key" }).createIndex("libraryKey+lastUsedAt", ["libraryKey", "lastUsedAt"]);
  },
];

/** The single `page-runtime` database, shared by the service worker and the frame. Stores are created by versioned migrations. */
export function openRuntimeDb(options: OpenRuntimeDb = {}): Promise<IDBDatabase> {
  const factory = options.factory ?? (typeof indexedDB === "undefined" ? undefined : indexedDB);
  if (!factory) return Promise.reject(new Error("IndexedDB is unavailable"));
  return new Promise((resolve, reject) => {
    const request = factory.open(RUNTIME_DB, RUNTIME_DB_VERSION);
    request.onupgradeneeded = (event) => { for (const migrate of migrations.slice(event.oldVersion)) migrate(request.result); };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => { db.close(); options.onVersionChange?.(); };
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error(`${RUNTIME_DB} database upgrade is blocked by another open connection; close other tabs of this runtime`));
  });
}

/** One connection per owner, opened on first use. */
export function lazyRuntimeDb(options: OpenRuntimeDb = {}): () => Promise<IDBDatabase> {
  let opened: Promise<IDBDatabase> | undefined;
  return () => opened ??= openRuntimeDb(options);
}

export const result = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export const committed = (tx: IDBTransaction): Promise<void> => new Promise((resolve, reject) => {
  tx.oncomplete = () => resolve();
  tx.onerror = () => reject(tx.error);
  tx.onabort = () => reject(tx.error ?? new Error("page-runtime database transaction aborted"));
});

export async function putCandidates(db: IDBDatabase, record: CandidatesRecord): Promise<void> {
  const tx = db.transaction("candidates", "readwrite");
  tx.objectStore("candidates").put(record);
  await committed(tx);
}

export async function candidatesForPage(db: IDBDatabase, page: string): Promise<CandidatesRecord[]> {
  return result(db.transaction("candidates").objectStore("candidates").index("page").getAll(page));
}
