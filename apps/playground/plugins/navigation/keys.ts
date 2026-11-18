/** A request the endpoint refuses: bad vocabulary, unknown node key, bad `active` slug. */
export class NavigationRequestError extends Error {
  readonly status = 400;
}

const encodePart = (part: string) => part.replaceAll("%", "%25").replaceAll(":", "%3A");
function decodePart(part: string): string {
  try {
    return decodeURIComponent(part);
  } catch {
    throw new NavigationRequestError(`Invalid navigation key part: ${part}`);
  }
}

export const pageFolderKey = (folder: string) => `page:${folder}`;
export const pageKey = (slug: string) => `page-item:${slug}`;
export const documentKey = (id: string) => `doc:${id}`;
export const repositoryKey = ({ repositoryId, folder, path }: { repositoryId: string; folder: string; path: string }) =>
  `repo:${repositoryId}:${encodePart(folder)}:${encodePart(path)}`;

export type NodeKey =
  | { kind: "root" }
  | { kind: "page-folder"; folder: string }
  | { kind: "repository"; repositoryId: string; folder: string; path: string }
  | { kind: "external" };

const LEAF_PREFIXES = ["page-item:", "doc:", "external:"];

/** Keys that can be expanded. Leaf keys and unknown shapes are request errors. */
export function parseNodeKey(key: string): NodeKey {
  if (key === "") return { kind: "root" };
  if (key === "external") return { kind: "external" };
  if (key.startsWith("page:") && key.length > "page:".length) return { kind: "page-folder", folder: key.slice("page:".length) };
  if (key.startsWith("repo:")) {
    const match = /^repo:([\da-f-]{36}):([^:]*):([^:]*)$/.exec(key);
    if (!match?.[1] || !match[2] || !match[3]) throw new NavigationRequestError(`Invalid repository navigation key: ${key}`);
    return { kind: "repository", repositoryId: match[1], folder: decodePart(match[2]), path: decodePart(match[3]) };
  }
  if (LEAF_PREFIXES.some((prefix) => key.startsWith(prefix))) throw new NavigationRequestError(`Navigation node ${key} has no children`);
  throw new NavigationRequestError(`Unknown navigation node: ${key}`);
}
