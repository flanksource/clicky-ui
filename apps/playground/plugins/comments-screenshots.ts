import {
  COMMENT_SCREENSHOT_UNAVAILABLE_REASONS,
  type CommentScreenshot,
  type CommentScreenshotCapture,
  type CommentScreenshotUnavailableReason,
} from "./comments-model";

const MAX_SCREENSHOT_BYTES = 32 * 1024 * 1024;
const PNG_PREFIX = "data:image/png;base64,";
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function assertUnavailableReason(
  input: unknown,
): CommentScreenshotUnavailableReason {
  if (
    typeof input !== "string" ||
    !COMMENT_SCREENSHOT_UNAVAILABLE_REASONS.includes(input as never)
  ) {
    throw new Error(
      `screenshot unavailable reason must be one of ${COMMENT_SCREENSHOT_UNAVAILABLE_REASONS.join(", ")}`,
    );
  }
  return input as CommentScreenshotUnavailableReason;
}

export function assertScreenshotCapture(
  input: unknown,
): CommentScreenshotCapture {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("comment screenshot capture must be an object");
  }
  const candidate = input as Record<string, unknown>;
  if (candidate["status"] === "unavailable") {
    if (
      Object.keys(candidate).some((key) => !["status", "reason"].includes(key))
    ) {
      throw new Error("unavailable comment screenshot has unexpected fields");
    }
    return {
      status: "unavailable",
      reason: assertUnavailableReason(candidate["reason"]),
    };
  }
  if (
    candidate["status"] !== "captured" ||
    typeof candidate["dataUrl"] !== "string"
  ) {
    throw new Error(
      'comment screenshot capture must be "captured" with dataUrl or "unavailable" with reason',
    );
  }
  if (
    Object.keys(candidate).some((key) => !["status", "dataUrl"].includes(key))
  ) {
    throw new Error("captured comment screenshot has unexpected fields");
  }
  return { status: "captured", dataUrl: candidate["dataUrl"] };
}

export function persistScreenshot(
  input: CommentScreenshotCapture,
): CommentScreenshot {
  if (input.status === "unavailable") return input;
  if (!input.dataUrl.startsWith(PNG_PREFIX)) {
    throw new Error("comment screenshot must be a base64 PNG data URL");
  }
  const png = Buffer.from(input.dataUrl.slice(PNG_PREFIX.length), "base64");
  if (png.byteLength === 0 || png.byteLength > MAX_SCREENSHOT_BYTES) {
    throw new Error(
      `comment screenshot must be between 1 byte and ${MAX_SCREENSHOT_BYTES} bytes`,
    );
  }
  if (!png.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error("comment screenshot data does not contain a PNG image");
  }

  return { status: "captured", filename: "screenshot.png", url: input.dataUrl };
}

export function assertStoredScreenshot(input: unknown): CommentScreenshot {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("comment screenshot must be an object");
  }
  const candidate = input as Record<string, unknown>;
  if (candidate["status"] === "unavailable") {
    if (
      Object.keys(candidate).some((key) => !["status", "reason"].includes(key))
    ) {
      throw new Error("unavailable comment screenshot has unexpected fields");
    }
    return {
      status: "unavailable",
      reason: assertUnavailableReason(candidate["reason"]),
    };
  }
  if (
    candidate["status"] !== "captured" ||
    candidate["filename"] !== "screenshot.png" ||
    typeof candidate["url"] !== "string" ||
    candidate["url"] === ""
  ) {
    throw new Error("captured comment screenshot requires filename and url");
  }
  if (
    Object.keys(candidate).some(
      (key) => !["status", "filename", "url"].includes(key),
    )
  ) {
    throw new Error("captured comment screenshot has unexpected fields");
  }
  return input as CommentScreenshot;
}
