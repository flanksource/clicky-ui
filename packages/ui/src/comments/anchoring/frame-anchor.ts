const FRAME_PREFIX = "iframe:";
const FRAME_ANCHOR_LIMIT = 4096;
const IGNORED = "[data-page-agent],[data-react-grab],[data-react-grab-ignore]";

type FrameLocation = { selector: string; url: string };
type FramePath = { frame: Element; parent: Element; body: HTMLElement; url: string }[];

export function commentFrameDocument(frame: Element): Document | null {
  if (frame.localName !== "iframe" || frame.closest(IGNORED)) return null;
  return (frame as HTMLIFrameElement).contentDocument;
}

function frameUrl(document: Document): string {
  const url = new URL(document.URL);
  url.username = "";
  url.password = "";
  url.hash = "";
  return url.href;
}

/** The accessible iframe chain from the page root to the selected element. */
export function commentFramePath(target: Element, root: Element): FramePath | null {
  const path: FramePath = [];
  for (let node = target; node.ownerDocument !== root.ownerDocument; ) {
    const document = node.ownerDocument;
    const frame = document.defaultView?.frameElement;
    const body = document.body;
    if (!body?.contains(node) || node.closest(IGNORED) || !frame || commentFrameDocument(frame) !== document) return null;
    const parent = frame.ownerDocument === root.ownerDocument ? root : frame.ownerDocument.body;
    if (!parent?.contains(frame)) return null;
    path.unshift({ frame, parent, body, url: frameUrl(document) });
    node = frame;
  }
  return path.length ? path : null;
}

export function frameAnchor(frames: FrameLocation[], anchor: string): string {
  const encoded = FRAME_PREFIX + JSON.stringify({ frames, anchor });
  if (encoded.length > FRAME_ANCHOR_LIMIT) throw new Error("iframe comment anchor exceeds 4096 characters");
  return encoded;
}

export function isFrameAnchor(anchor: string): boolean {
  return anchor.startsWith(`${FRAME_PREFIX}{`);
}

export function resolveFrameAnchor(root: Element, anchor: string, query: (root: Element, selector: string) => Element | null) {
  if (anchor.length > FRAME_ANCHOR_LIMIT) return null;
  let value: { frames?: unknown; anchor?: unknown } | null;
  try {
    value = JSON.parse(anchor.slice(FRAME_PREFIX.length));
  } catch {
    return null;
  }
  if (!Array.isArray(value?.frames) || !value.frames.length || typeof value.anchor !== "string" || !value.anchor || isFrameAnchor(value.anchor)) return null;
  for (const hop of value.frames) {
    if (typeof hop?.selector !== "string" || typeof hop.url !== "string") return null;
    const frame = query(root, hop.selector);
    const document = frame && commentFrameDocument(frame);
    if (!document?.body || frameUrl(document) !== hop.url) return null;
    root = document.body;
  }
  return { root, anchor: value.anchor };
}
