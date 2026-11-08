import type { AgentRect, FolderManifest } from "@flanksource/page-runtime/schema";
import type { HostViewportRect } from "../comments/screenshot";
import type { LibraryLink } from "@flanksource/page-runtime/host/link";

export type CompatibilityIssue = { blocking: boolean; reason: string; fix: string; file: string; line: number; column?: number; class?: string; specifier?: string; sourceUrl?: string };
export type BrowserProject = { entryFile: string; sourceHash: string; manifest: FolderManifest; pageDependencies: Record<string, string>; defaults: { profile: Record<string, string>; workspace: Record<string, string>; policies: { profile?: import("@flanksource/page-runtime/schema").DependencyPolicy; workspace?: import("@flanksource/page-runtime/schema").DependencyPolicy }; packageNames: string[] }; issues: CompatibilityIssue[]; requiredPackages: string[]; configuration: { aliases: Record<string, string>; libraryImports: string[]; sourceRoots: { directory: string; url: string }[] } } & (
  | { compatible: false; issues: CompatibilityIssue[] }
  | { compatible: true; page: string; files: Record<string, string>; aliases: Record<string, string>; links: LibraryLink[]; hashes: Record<string, string> });

export function changedSources({ before, after }: { before: Record<string, string>; after: Record<string, string> }): Record<string, string | null> {
  return Object.fromEntries([
    ...Object.entries(after).filter(([path, code]) => before[path] !== code),
    ...Object.keys(before).filter(path => !Object.hasOwn(after, path)).map(path => [path, null]),
  ]);
}

export function hostRect({ frame, rect }: { frame: { left: number; top: number }; rect: AgentRect }): HostViewportRect {
  return { x: frame.left + rect.left, y: frame.top + rect.top, width: rect.width, height: rect.height };
}

export function reviewToolbarLeft(options: { frame: { left: number; width: number }; right: number; width: number }): number {
  return Math.max(options.frame.left, Math.min(options.right - options.width, options.frame.left + options.frame.width - options.width));
}
