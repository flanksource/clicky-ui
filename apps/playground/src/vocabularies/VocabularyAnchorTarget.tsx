import { useEffect, type RefObject } from "react";
import { useCommentContext } from "@flanksource/clicky-ui";
import { useBrowserSession } from "../browser-mode/session";

export function VocabularyAnchorTarget({ page, contentRef }: { page: string | undefined; contentRef: RefObject<HTMLDivElement | null> }) {
  const { registerAnchor, scrollToAnchor } = useCommentContext();
  const browser = useBrowserSession();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const anchor = params.get("anchor");
    if (!page || params.get("page") !== page || !anchor?.startsWith("vocabulary:")) return;
    if (browser) {
      const scroll = () => {
        const session = browser.getSnapshot();
        if (session.ready) session.bridge?.send({ type: "scroll", anchor, behavior: "smooth", block: "center" });
      };
      scroll();
      return browser.subscribe(scroll);
    }
    const root = contentRef.current;
    if (!root) return;
    let scrolled = false;
    const scroll = () => {
      const element = [...root.querySelectorAll("[data-comment-anchor]")].find(element => element.getAttribute("data-comment-anchor") === anchor);
      if (!element || scrolled) return;
      registerAnchor(anchor, element);
      scrolled = scrollToAnchor(anchor, { behavior: "smooth", block: "center" });
    };
    const observer = new MutationObserver(scroll);
    observer.observe(root, { childList: true, subtree: true });
    scroll();
    return () => { observer.disconnect(); registerAnchor(anchor, null); };
  }, [page, browser, contentRef, registerAnchor, scrollToAnchor]);
  return null;
}
