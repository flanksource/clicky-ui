import { describeElement, resolveAnchor } from "../comments/dom-anchor";
import type { AnchorState } from "./model";
import { mountSidebarResize } from "./host-resize";
import { draftPosition } from "./draft-position";

export function mountHost(frameUrl: string, focus: (anchor: string) => void, onWidth: (width: number) => void, onPresentation: (floating: boolean) => void) {
  const root = document.createElement("div");
  root.id = "playground-grabber";
  root.setAttribute("data-react-grab-ignore", "");
  const shadow = root.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; position: fixed; inset: 0; pointer-events: none; z-index: 2147483646; }
    iframe { position: absolute; inset: 0 0 0 auto; width: min(400px, 100vw); height: 100%; border: 0; background: white; box-shadow: 0 0 16px #0003; pointer-events: auto; }
    .resize { position: absolute; top: 0; height: 100%; width: 5px; background: #8886; cursor: col-resize; pointer-events: auto; touch-action: none; }
    .resize:hover, .resize:focus-visible { background: #2563eb; outline: 2px solid white; }
    .resize[hidden], iframe[hidden] ~ .resize { display: none; }
    .fab { position: absolute; right: 20px; bottom: 20px; width: 48px; height: 48px; border: 2px solid white; border-radius: 50%; background: #2563eb; color: white; font: 600 24px system-ui; cursor: pointer; pointer-events: auto; box-shadow: 0 2px 12px #0004; }
    .fab[hidden] { display: none; }
    :host([data-mode=draft]) .resize { display: none; }
    :host([data-mode=draft]) iframe { inset: auto; border-radius: 10px; }
    .pin { position: absolute; pointer-events: auto; min-width: 22px; height: 22px; padding: 0 4px; border: 1px solid #fff; border-radius: 12px; color: white; background: #2563eb; font: 600 12px system-ui; cursor: pointer; transform: translate(-50%, -50%); }
    .highlight { position: absolute; border: 2px solid #2563eb; background: #2563eb18; box-sizing: border-box; pointer-events: none; }
    .error { position: absolute; top: 12px; left: 12px; max-width: 480px; padding: 12px; background: #fff; color: #991b1b; border: 1px solid currentColor; font: 14px system-ui; pointer-events: auto; }
  `;
  const frame = document.createElement("iframe");
  frame.title = "Playground comments";
  frame.src = frameUrl;
  const pins = document.createElement("div");
  const highlight = document.createElement("div");
  highlight.className = "highlight";
  highlight.hidden = true;
  const sizing = mountSidebarResize(frame, onWidth);
  const fab = document.createElement("button");
  fab.className = "fab";
  fab.type = "button";
  fab.textContent = "+";
  fab.setAttribute("aria-label", "Restore playground comments");
  fab.title = "Restore playground comments";
  fab.hidden = true;
  let mode: "rail" | "draft" = "rail";
  let minimized = false;
  let previousMinimized = false;
  let draftAnchor: string | null = null;
  let draftHeight = 260;
  let draftBox = { left: 8, top: 8, bottom: 8 };
  const restore = () => { minimized = false; frame.hidden = false; fab.hidden = true; frame.focus(); };
  fab.addEventListener("click", restore);
  shadow.append(style, pins, highlight, frame, sizing.handle, fab);
  document.documentElement.append(root);
  let anchors: string[] = [];
  let selected: string | null = null;
  let lastState = "";
  let pending = 0;
  let onAnchors: (state: AnchorState[]) => void = () => {};

  function recompute() {
    pending = 0;
    if (mode === "draft") {
      const target = draftAnchor ? resolveAnchor(document.body, draftAnchor) : null;
      if (target) draftBox = target.getBoundingClientRect();
      const position = draftPosition(draftBox, { width: window.innerWidth, height: window.innerHeight }, draftHeight);
      for (const [key, value] of Object.entries(position)) frame.style.setProperty(key, `${value}px`);
    }
    pins.replaceChildren();
    const states = anchors.map((anchor, index): AnchorState => {
      const element = resolveAnchor(document.body, anchor);
      if (!element) return { anchor, available: false, label: anchor };
      const box = element.getBoundingClientRect();
      const pin = document.createElement("button");
      pin.className = "pin";
      pin.textContent = String(index + 1);
      pin.title = describeElement(element);
      pin.style.left = `${box.right}px`;
      pin.style.top = `${box.top}px`;
      pin.addEventListener("click", () => { showRail(); focus(anchor); });
      pins.append(pin);
      return {
        anchor,
        available: true,
        top: box.top,
        label: describeElement(element),
      };
    });
    const element = selected ? resolveAnchor(document.body, selected) : null;
    highlight.hidden = !element;
    if (element) {
      const box = element.getBoundingClientRect();
      Object.assign(highlight.style, {
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
      });
    }
    if (JSON.stringify(states) !== lastState) {
      lastState = JSON.stringify(states);
      onAnchors(states);
    }
  }
  const schedule = () => {
    if (!pending) pending = requestAnimationFrame(recompute);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
  });
  const resize = new ResizeObserver(schedule);
  resize.observe(document.body);
  window.addEventListener("scroll", schedule, true);
  window.addEventListener("resize", schedule);
  function railLayout() {
    mode = "rail";
    root.setAttribute("data-mode", mode);
    frame.style.removeProperty("left");
    frame.style.removeProperty("top");
    frame.style.removeProperty("height");
    sizing.layout(preferredWidth, maximized);
    onPresentation(false);
  }
  function showRail() {
    railLayout();
    restore();
  }
  const resume = () => { frame.hidden = minimized; fab.hidden = !minimized; };
  function closeDraft(posted: boolean) {
    railLayout();
    if (posted || !previousMinimized) restore();
    else { minimized = true; resume(); }
  }
  let preferredWidth = 400;
  let maximized = false;
  return {
    root,
    frame,
    restore,
    showRail,
    minimize() { minimized = true; frame.hidden = true; fab.hidden = false; fab.focus(); },
    resume,
    /** A new URL drops any floating draft but never reopens a minimized sidebar. */
    pageChanged() {
      if (mode === "draft") closeDraft(false);
      else resume();
    },
    draft(active: boolean, anchor?: string, posted = false) {
      if (active) {
        if (!anchor) throw new Error("Floating comment requires an anchor");
        if (mode !== "draft") previousMinimized = minimized;
        draftAnchor = anchor;
        mode = "draft";
        root.setAttribute("data-mode", mode);
        restore();
        onPresentation(true);
        schedule();
      } else closeDraft(posted);
    },
    draftSize(height: number) { draftHeight = height; schedule(); },
    layout(width: number, detail: boolean) {
      preferredWidth = width;
      maximized = detail;
      if (mode === "rail") sizing.layout(width, detail);
      else schedule();
    },
    update(next: string[], callback: typeof onAnchors) {
      anchors = next;
      onAnchors = callback;
      lastState = "";
      schedule();
    },
    highlight(anchor: string | null) {
      selected = anchor;
      schedule();
    },
    error(message: string) {
      let error = shadow.querySelector<HTMLDivElement>(".error");
      if (!error) {
        error = document.createElement("div");
        error.className = "error";
        error.setAttribute("role", "alert");
        shadow.append(error);
      }
      error.textContent = message;
    },
    close() {
      sizing.close();
      observer.disconnect();
      resize.disconnect();
      cancelAnimationFrame(pending);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      root.remove();
    },
  };
}
