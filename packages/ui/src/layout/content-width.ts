export type ContentWidth = "contained" | "full";

const CONTAINED_CONTENT_CLASS =
  "mx-auto w-full max-w-7xl @8xl/app-content:max-w-8xl @9xl/app-content:max-w-9xl";

export function contentWidthClassName(contentWidth: ContentWidth) {
  return contentWidth === "full" ? "w-full" : CONTAINED_CONTENT_CLASS;
}
