import { useEffect, useState } from "react";

export function useSvgPreviewCss(classes: unknown): { pending: boolean; error: Error | null } {
  const [state, setState] = useState<{ pending: boolean; error: Error | null }>({ pending: false, error: null });
  useEffect(() => {
    if (typeof classes !== "string" || classes.trim() === "") { setState({ pending: false, error: null }); return; }
    const controller = new AbortController();
    setState({ pending: true, error: null });
    void fetch(`/__playground/svg-preview?classes=${encodeURIComponent(classes)}`, { signal: controller.signal })
      .then(async response => {
        const css = await response.text();
        if (!response.ok) throw new Error(css);
        if (controller.signal.aborted) return;
        let style = document.querySelector<HTMLStyleElement>("style[data-svg-preview-css]");
        if (!style) {
          style = document.createElement("style");
          style.dataset.svgPreviewCss = "";
          document.head.append(style);
        }
        style.textContent = css;
        window.dispatchEvent(new Event("playground-svg-preview-css"));
        setState({ pending: false, error: null });
      }).catch((error: Error) => {
        if (!controller.signal.aborted) setState({ pending: false, error });
      });
    return () => controller.abort();
  }, [classes]);
  return state;
}
