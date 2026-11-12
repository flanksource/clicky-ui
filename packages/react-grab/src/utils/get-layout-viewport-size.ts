// The scrolling element (html in standards mode, body in quirks mode) reports the
// layout viewport. In quirks mode documentElement.clientHeight is the whole
// document's height instead, which made the fixed overlay canvas document-sized.
export const getLayoutViewportSize = (doc: Document): { width: number; height: number } => {
  const viewport = doc.scrollingElement ?? doc.documentElement;
  return { width: viewport.clientWidth, height: viewport.clientHeight };
};
