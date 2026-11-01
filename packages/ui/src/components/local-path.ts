export interface LocalPathEntry {
  name: string;
  path: string;
  directory: boolean;
  problem?: string;
}
export interface LocalPathListing {
  path: string;
  parent: string;
  entries: LocalPathEntry[];
}
export type LocalPathLoader = (
  path: string,
  signal: AbortSignal,
) => Promise<LocalPathListing>;

export function isLocalHostname(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
}
