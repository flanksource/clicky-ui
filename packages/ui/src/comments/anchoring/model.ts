export const COMMENT_ELEMENT_HTML_LIMIT = 4096;
export const COMMENT_ELEMENT_HTML_TRUNCATION = "\n<!-- …truncated to 4KB -->";
export const COMMENT_LOCATOR_TEXT_LIMIT = 200;
export const COMMENT_LOCATOR_SELECTOR_LIMIT = 1024;

export type CommentLocatorHeading = { selector: string; text: string };
export type CommentLocator =
  | { kind: "css"; selector: string }
  | { kind: "role"; tag: string; role: string; name: string }
  | { kind: "text"; tag: string; text: string; heading?: CommentLocatorHeading; scope?: string }
  | { kind: "markdown"; path: string[]; tag: string; text: string; line?: number };
