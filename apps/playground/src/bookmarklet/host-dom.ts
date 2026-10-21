import { describeElement, resolveAnchor } from "../comments/dom-anchor";
import type { AnchorState } from "./model";

export function mountHost(frameUrl: string, focus: (anchor: string) => void) {
  const root = document.createElement("div");
  root.id = "playground-grabber";
  root.setAttribute("data-react-grab-ignore", "");
  const shadow = root.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; position: fixed; inset: 0; pointer-events: none; z-index: 2147483646; }
    iframe { position: absolute; inset: 0 0 0 auto; width: min(400px, 100vw); height: 100%; border: 0; background: white; box-shadow: 0 0 16px #0003; pointer-events: auto; }
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
  shadow.append(style, pins, highlight, frame);
  document.documentElement.append(root);
  let anchors: string[] = [];
  let selected: string | null = null;
  let lastState = "";
  let pending = 0;
  let onAnchors: (state: AnchorState[]) => void = () => {};

  function recompute() {
    pending = 0;
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
      pin.addEventListener("click", () => focus(anchor));
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
  return {
    root,
    frame,
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
      observer.disconnect();
      resize.disconnect();
      cancelAnimationFrame(pending);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      root.remove();
    },
  };
}
