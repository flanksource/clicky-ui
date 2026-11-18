import type { BarrelIndex, Fragment } from "../schema.ts";
export type CommonJsSource = { hash: string; target: string };

export type LinkBuild = {
  link: 1;
  library: string;
  version: string;
  fragment: Fragment;
  entries: Record<string, string>;
  modules: Record<string, { resolutions: Record<string, string> }>;
  barrels: BarrelIndex;
  defines: Record<string, string | boolean | number>;
  generated: Record<string, string>;
  pageSources?: Array<Omit<import("./page-sources.ts").PageSourceRoot, "link">>;
  commonjs?: Record<string, CommonJsSource>;
  package?: { dependencies?: Record<string, string>; peerDependencies?: Record<string, string> };
};
export type LinkSource = { kind: "server"; url: string } | { kind: "folder"; session?: string };
export type LibraryLink = { id: string; build: LinkBuild; source: LinkSource };
export type StoredLink = LibraryLink & { directory?: FileSystemDirectoryHandle };
export type LinkCommand =
  | { type: "install"; link: StoredLink }
  | { type: "remove"; id: string }
  | { type: "files"; id: string }
  | { type: "invalidate"; id: string; paths: string[] };
export type LinkReply = { ok: true; files?: Record<string, string> };
export type LinkFrame = { id: string; links: readonly string[]; reload(): void | Promise<void> };
