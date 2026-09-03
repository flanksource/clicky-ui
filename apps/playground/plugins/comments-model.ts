export const COMMENT_ELEMENT_HTML_LIMIT = 4096;
export const COMMENT_ELEMENT_HTML_TRUNCATION = "\n<!-- …truncated to 4KB -->";

export const COMMENT_SCREENSHOT_UNAVAILABLE_REASONS = [
  "unsupported",
  "cancelled",
  "failed",
] as const;

export type CommentScreenshotUnavailableReason =
  (typeof COMMENT_SCREENSHOT_UNAVAILABLE_REASONS)[number];

export type CommentScreenshot =
  | { status: "captured"; filename: "screenshot.png"; url: string }
  | {
      status: "unavailable";
      reason: CommentScreenshotUnavailableReason;
    };

export type CommentScreenshotCapture =
  | { status: "captured"; dataUrl: string }
  | {
      status: "unavailable";
      reason: CommentScreenshotUnavailableReason;
    };

export type CommentElementContext = {
  componentName?: string;
  source: string;
  html: string;
  /** Optional only so comments created before screenshot capture remain readable. */
  screenshot?: CommentScreenshot;
};

export type CommentElementCaptureContext = Omit<
  CommentElementContext,
  "screenshot"
> & {
  screenshot: CommentScreenshotCapture;
};
