export const COMMENT_ELEMENT_HTML_LIMIT = 2048;
export const COMMENT_ELEMENT_HTML_TRUNCATION = "\n<!-- …truncated to 2KB -->";

export type CommentElementContext = {
  componentName?: string;
  source: string;
  html: string;
};
