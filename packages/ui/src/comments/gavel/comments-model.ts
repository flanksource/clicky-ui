import type { CommentScreenshotCapture, CommentScreenshotUnavailableReason } from "../annotation-types";
import type { CommentLocator } from "../anchoring/model";

export const COMMENT_SCREENSHOT_UNAVAILABLE_REASONS = [
  "unsupported",
  "cancelled",
  "failed",
] as const satisfies readonly CommentScreenshotUnavailableReason[];

export type CommentScreenshot =
  | { status: "captured"; filename: "screenshot.png"; url: string }
  | {
      status: "unavailable";
      reason: CommentScreenshotUnavailableReason;
    };

export type CommentElementContext = {
  pageUrl?: string;
  componentName?: string;
  source: string;
  html: string;
  /** Absent on comments left before locators were captured. */
  locators?: CommentLocator[];
  /** Present when screenshot capture was requested. */
  screenshot?: CommentScreenshot;
};

export type CommentElementCaptureContext = Omit<
  CommentElementContext,
  "screenshot"
> & {
  screenshot?: CommentScreenshotCapture;
};
