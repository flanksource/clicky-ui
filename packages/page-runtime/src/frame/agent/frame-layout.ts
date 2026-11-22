import { commentFrameDocument } from "@flanksource/clicky-ui/comments/anchoring";

export function observeCommentFrames(root: Element, schedule: () => void) {
  const observed = new Map<Document, () => void>();
  const loaded = (event: Event) => {
    if ((event.target as Element | null)?.localName === "iframe") schedule();
  };
  root.addEventListener("load", loaded, true);

  function observe(document: Document, frame: Element) {
    const window = document.defaultView!;
    const mutations = new MutationObserver(schedule);
    const size = new ResizeObserver(schedule);
    mutations.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
    size.observe(frame);
    size.observe(document.documentElement);
    document.addEventListener("load", loaded, true);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    window.addEventListener("popstate", schedule);
    observed.set(document, () => {
      mutations.disconnect();
      size.disconnect();
      document.removeEventListener("load", loaded, true);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("popstate", schedule);
    });
  }

  return {
    refresh() {
      const current = new Set<Document>();
      const pending = [...root.querySelectorAll("iframe")];
      for (const frame of pending) {
        const document = commentFrameDocument(frame);
        if (!document?.body || !document.defaultView || current.has(document)) continue;
        current.add(document);
        if (!observed.has(document)) observe(document, frame);
        pending.push(...document.body.querySelectorAll("iframe"));
      }
      for (const [document, dispose] of observed) {
        if (current.has(document)) continue;
        dispose();
        observed.delete(document);
      }
    },
    dispose() {
      root.removeEventListener("load", loaded, true);
      for (const dispose of observed.values()) dispose();
      observed.clear();
    },
  };
}
