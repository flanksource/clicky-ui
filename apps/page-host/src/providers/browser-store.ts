import { parseProject, type Project } from "../project";

async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("page-host", 1);
    request.onupgradeneeded = () => { request.result.createObjectStore("projects"); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("page-host browser state upgrade is blocked by another tab"));
  });
}

export async function browserProject(options: { key: string; project?: Project }): Promise<Project | null> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction("projects", options.project ? "readwrite" : "readonly");
      const store = transaction.objectStore("projects");
      const request = options.project ? store.put(parseProject(options.project), options.key) : store.get(options.key);
      transaction.oncomplete = () => {
        try { resolve(options.project ?? (request.result === undefined ? null : parseProject(request.result))); }
        catch (error) { reject(error); }
      };
      transaction.onabort = () => reject(transaction.error ?? new Error("browser state transaction aborted"));
      transaction.onerror = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
