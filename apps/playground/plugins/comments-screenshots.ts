import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import type { ServerResponse } from "node:http";
import { join } from "node:path";

import {
  COMMENT_SCREENSHOT_UNAVAILABLE_REASONS,
  type CommentScreenshot,
  type CommentScreenshotCapture,
  type CommentScreenshotUnavailableReason,
} from "./comments-model";
import type { StoredComment } from "./comments-store";

export const COMMENT_SCREENSHOTS_ROUTE = "/__playground/comments/screenshots";
const MAX_SCREENSHOT_BYTES = 32 * 1024 * 1024;
const PNG_PREFIX = "data:image/png;base64,";
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const SCREENSHOT_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.png$/i;

function screenshotPath(dir: string, id: string): string {
  return join(dir, "screenshots", `${id}.png`);
}

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
  dir: string,
  id: string,
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

  const file = screenshotPath(dir, id);
  const temporary = `${file}.${randomUUID()}.write.tmp`;
  mkdirSync(join(dir, "screenshots"), { recursive: true });
  try {
    writeFileSync(temporary, png, { flag: "wx" });
    renameSync(temporary, file);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
  return {
    status: "captured",
    filename: "screenshot.png",
    url: `${COMMENT_SCREENSHOTS_ROUTE}/${id}.png`,
  };
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

export function discardScreenshot(
  dir: string,
  id: string,
  screenshot: CommentScreenshot,
): void {
  if (screenshot.status !== "captured") return;
  const file = screenshotPath(dir, id);
  if (existsSync(file)) unlinkSync(file);
}

export function serveScreenshot(
  dir: string,
  pathname: string,
  res: ServerResponse,
): boolean {
  const name = pathname.split("/").filter(Boolean).at(-1) ?? "";
  if (!SCREENSHOT_NAME.test(name)) return false;
  const file = join(dir, "screenshots", name);
  if (!existsSync(file)) return false;
  const png = readFileSync(file);
  res.statusCode = 200;
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", png.byteLength);
  res.setHeader("Cache-Control", "no-store");
  res.end(png);
  return true;
}

export function stageScreenshotRemoval(
  dir: string,
  comments: readonly StoredComment[],
): { commit: () => void; rollback: () => void } {
  const moved: Array<{ file: string; backup: string }> = [];
  try {
    for (const comment of comments) {
      if (comment.element?.screenshot?.status !== "captured") continue;
      const file = screenshotPath(dir, comment.id);
      if (!existsSync(file)) {
        throw new Error(
          `captured screenshot for comment "${comment.id}" is missing`,
        );
      }
      const backup = `${file}.${randomUUID()}.delete.tmp`;
      renameSync(file, backup);
      moved.push({ file, backup });
    }
  } catch (cause) {
    moved
      .slice()
      .reverse()
      .forEach(({ file, backup }) => renameSync(backup, file));
    throw cause;
  }
  return {
    commit: () => moved.forEach(({ backup }) => unlinkSync(backup)),
    rollback: () =>
      moved
        .slice()
        .reverse()
        .forEach(({ file, backup }) => renameSync(backup, file)),
  };
}
