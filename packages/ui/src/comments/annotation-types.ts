import type { CommentLocator } from "./anchoring/model";
export type CommentScreenshotUnavailableReason =
  | "unsupported"
  | "cancelled"
  | "failed";
export type CommentScreenshotCapture =
  | { status: "captured"; dataUrl: string }
  | { status: "unavailable"; reason: CommentScreenshotUnavailableReason };
export type PatchAnchor = {
  version: number;
  startLine: number;
  endLine: number;
  before: string[];
  lines: string[];
  after: string[];
};
export type AnnotationCapture = {
  kind: "document" | "dom" | "code-range";
  version: 1;
  view: "source" | "form" | "rich";
  revision?: string;
  screenshotUrl?: string;
  source?: string;
  label?: string;
  location?: { state: string; startLine?: number; endLine?: number };
  anchor?: string;
  patch?: PatchAnchor;
  html?: string;
  locators?: CommentLocator[];
};
