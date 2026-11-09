import type { Comment } from "@flanksource/clicky-ui/comments";
import { validateFrameMessage } from "@flanksource/page-runtime/host";
import type { AgentSelection } from "@flanksource/page-runtime/schema";
import { object } from "../project";
import type { Directory } from "../providers/directory";
import type { SourceProvider } from "../providers/types";

export type StoredComment = Comment & { selection?: AgentSelection; screenshot?: string };
export const COMMENT_SIDECAR = ".page-comments.json";

export function parseComments(value: unknown): Record<string, StoredComment[]> {
  const data = object(value, COMMENT_SIDECAR);
  if (data.format !== 1) throw new Error("Unsupported comment sidecar format");
  const pages = object(data.pages, "comment pages");
  for (const [page, comments] of Object.entries(pages)) {
    if (!Array.isArray(comments)) throw new Error(`${page}: comments must be an array`);
    for (const value of comments) {
      const comment = object(value, "comment");
      if (typeof comment.id !== "string" || !comment.id || typeof comment.body !== "string" || typeof comment.createdAt !== "string" || !Number.isFinite(Date.parse(comment.createdAt))) throw new Error(`${page}: invalid comment`);
      if (comment.author !== null) { const author = object(comment.author, "comment author"); if (typeof author.name !== "string") throw new Error("Invalid comment author"); }
      if (comment.selection !== undefined) validateFrameMessage({ type: "selection", selection: comment.selection });
      if (comment.screenshot !== undefined && (typeof comment.screenshot !== "string" || !comment.screenshot.startsWith("data:image/png;base64,"))) throw new Error("Invalid comment screenshot");
    }
  }
  return pages as Record<string, StoredComment[]>;
}

export function directoryComments(directory: Directory) {
  async function read(): Promise<Record<string, StoredComment[]>> {
    let file;
    try { file = await directory.getFileHandle(COMMENT_SIDECAR); }
    catch (error) { if (error instanceof DOMException && error.name === "NotFoundError") return {}; throw error; }
    return parseComments(JSON.parse(await (await file.getFile()).text()));
  }
  return {
    async load(page: string): Promise<StoredComment[]> { return (await read())[page] ?? []; },
    async save(options: { page: string; comments: StoredComment[] }) {
      const data = { format: 1, pages: { ...await read(), [options.page]: options.comments } };
      parseComments(data);
      const writer = await (await directory.getFileHandle(COMMENT_SIDECAR, { create: true })).createWritable();
      try { await writer.write(JSON.stringify(data, null, 2)); } finally { await writer.close(); }
    },
  };
}

export async function commentStore(options: { provider: SourceProvider; project: string }) {
  if (options.provider.directory) return directoryComments(options.provider.directory);
  if (!navigator.storage?.getDirectory) throw new Error("Comments require OPFS or a writable source folder");
  const root = await navigator.storage.getDirectory() as unknown as Directory;
  const directory = await root.getDirectoryHandle("page-host-comments", { create: true });
  return directoryComments(await directory.getDirectoryHandle(encodeURIComponent(`${options.provider.id}:${options.project}`), { create: true }));
}
