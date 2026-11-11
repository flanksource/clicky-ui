import type { StoredComment } from "./comments-store";
import { project as projectNative, type NativeComment } from "../src/comments/gavel-projection";

export {
  bodyFor,
  commentActor,
  contentFor,
  localUser,
  type Action,
  type Actor,
  type Content,
  type NativeComment,
  type Target,
} from "../src/comments/gavel-projection";

/** The playground proxies gavel's attachments under its own comments route. */
export function project(c: NativeComment): StoredComment[] {
  return projectNative(c, { attachmentUrl: (commentId, attachmentId) => `/__playground/comments/${commentId}/attachments/${attachmentId}` });
}
