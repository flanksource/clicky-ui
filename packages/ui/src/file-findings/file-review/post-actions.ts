import { captureScreenshot, screenshotCaptureSupported, type ScreenshotTarget } from "../../comments/annotation-screenshot";
import type { CommentCallbacks, CommentCreateAction, CommentCreateInput } from "../../comments/comment-types";

/** The built-in plain Post, offered only when screenshots make the composer show labelled variants and the host has none. */
export const POST_ACTION = "post";
/** The built-in variant that attaches a capture of the anchored region; its id never reaches the host. */
export const SCREENSHOT_ACTION = "screenshot";

/** The variants a composer shows: the host's, plus "Post with screenshot" when `screenshot` is on and the browser can capture a tab. */
export function composerActions({
  host,
  screenshot,
}: {
  host: readonly CommentCreateAction[] | undefined;
  screenshot: boolean;
}): readonly CommentCreateAction[] | undefined {
  if (!screenshot || !screenshotCaptureSupported()) return host;
  if (host?.some((action) => action.id === SCREENSHOT_ACTION)) throw new Error(`FileReview: the create action id "${SCREENSHOT_ACTION}" is reserved for "Post with screenshot"`);
  return [...(host ?? [{ id: POST_ACTION, label: "Post comment" }]), { id: SCREENSHOT_ACTION, label: "Post with screenshot" }];
}

/** Posts `input`; the screenshot variant first captures `region()` and sends it as `input.screenshot`. */
export async function createComment({
  onCreate,
  input,
  action,
  hostActions,
  region,
}: {
  onCreate: NonNullable<CommentCallbacks["onCreate"]>;
  input: CommentCreateInput;
  action: string | undefined;
  hostActions: readonly CommentCreateAction[] | undefined;
  region: () => Element | ScreenshotTarget;
}): Promise<void> {
  if (action === SCREENSHOT_ACTION) return onCreate({ ...input, screenshot: await captureScreenshot(region()) });
  if (action === undefined || (action === POST_ACTION && !hostActions?.length)) return onCreate(input);
  return onCreate(input, action);
}
