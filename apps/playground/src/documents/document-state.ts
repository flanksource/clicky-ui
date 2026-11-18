import type { DocumentFile } from "./types";
export type DocumentBuffer = {
  base: DocumentFile;
  disk: DocumentFile;
  draft: string;
  conflict: boolean;
};
export function reconcileDocument(
  current: DocumentBuffer | null,
  incoming: DocumentFile,
): DocumentBuffer {
  if (
    !current ||
    current.draft === current.base.source ||
    current.draft === incoming.source
  )
    return {
      base: incoming,
      disk: incoming,
      draft: incoming.source,
      conflict: false,
    };
  return {
    ...current,
    disk: incoming,
    conflict: incoming.revision !== current.base.revision,
  };
}
