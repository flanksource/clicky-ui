import { describeElement, resolveComment } from "@flanksource/clicky-ui/comments";
import type { AgentAnchorState, AgentFrameMessage, AgentPin, AgentRect } from "../../schema.ts";
import { isPageElement } from "./owner.ts";

export function elementRect(element: Element): AgentRect {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
}

export function mountAgentOverlay(options: { root: Element; send: (message: AgentFrameMessage) => void; registered: Map<string, Element> }) {
  const host = document.createElement("div");
  host.setAttribute("data-page-agent", "");
  host.setAttribute("data-react-grab-ignore", "");
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `:host{all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483646}
    button{position:absolute;pointer-events:auto;min-width:22px;height:22px;padding:0 4px;border:1px solid white;border-radius:12px;color:white;background:#2563eb;font:600 12px system-ui;cursor:pointer;transform:translate(-50%,-50%)}
    .highlight{position:absolute;border:2px solid #2563eb;background:#2563eb18;box-sizing:border-box;pointer-events:none}`;
  const pins = document.createElement("div");
  const highlight = document.createElement("div");
  highlight.className = "highlight";
  highlight.hidden = true;
  shadow.append(style, pins, highlight);
  document.documentElement.append(host);
  let saved: AgentPin[] = [];
  let selected: string | null = null;
  let pending = 0;
  let last = "";

  function resolve(pin: AgentPin) {
    const registered = options.registered.get(pin.anchor);
    const match = registered?.isConnected ? { element: registered, matchedBy: "anchor" as const, conflict: false } : resolveComment(options.root, pin.anchor, pin.locators);
    return match && isPageElement({ element: match.element, root: options.root }) ? match : null;
  }
  function target(anchor: string): Element | null {
    if (anchor === "__document__") return options.root;
    return resolve(saved.find((pin) => pin.anchor === anchor) ?? { anchor, count: 1, locators: [] })?.element ?? null;
  }
  function drawPin(pin: AgentPin, index: number): AgentAnchorState {
    const match = resolve(pin);
    if (!match) return { anchor: pin.anchor, state: "orphaned", label: pin.anchor, rect: null };
    const box = elementRect(match.element);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1);
    button.title = `${describeElement(match.element)} (${pin.count})`;
    button.setAttribute("aria-label", `Open ${pin.count} comments on ${describeElement(match.element)}`);
    button.setAttribute("aria-pressed", String(selected === pin.anchor));
    button.style.left = `${box.left + box.width}px`;
    button.style.top = `${box.top}px`;
    button.addEventListener("click", () => options.send({ type: "focus", anchor: pin.anchor }));
    pins.append(button);
    return { anchor: pin.anchor, state: match.matchedBy === "anchor" && !match.conflict ? "found" : "moved", label: describeElement(match.element), rect: box };
  }
  function recompute() {
    pending = 0;
    pins.replaceChildren();
    const states = saved.map(drawPin);
    const element = selected ? target(selected) : null;
    highlight.hidden = !element;
    if (element) for (const [key, value] of Object.entries(elementRect(element))) highlight.style.setProperty(key, `${value}px`);
    const geometry = { type: "geometry" as const, scrollX: window.scrollX, scrollY: window.scrollY, width: window.innerWidth, height: window.innerHeight };
    const state = JSON.stringify([states, geometry]);
    if (state !== last) { last = state; options.send({ type: "anchors", anchors: states }); options.send(geometry); }
  }
  function schedule() { if (!pending) pending = requestAnimationFrame(recompute); }
  const observer = new MutationObserver(schedule);
  observer.observe(options.root, { subtree: true, childList: true, characterData: true, attributes: true });
  observer.observe(options.root.ownerDocument.body, { subtree: true, childList: true, characterData: true, attributes: true });
  const resize = new ResizeObserver(schedule);
  resize.observe(options.root);
  window.addEventListener("scroll", schedule, true);
  window.addEventListener("resize", schedule);
  schedule();
  return {
    host, target, schedule,
    containedAnchors(node: Element): string[] {
      return [...new Set(saved.filter((pin) => {
        const element = target(pin.anchor);
        return element !== null && node.contains(element);
      }).map((pin) => pin.anchor))];
    },
    update(anchors: AgentPin[], focus?: string | null) { saved = anchors; if (focus !== undefined) selected = focus; last = ""; schedule(); },
    highlight(anchor: string | null) { selected = anchor; schedule(); },
    dispose() {
      observer.disconnect(); resize.disconnect(); cancelAnimationFrame(pending);
      window.removeEventListener("scroll", schedule, true); window.removeEventListener("resize", schedule); host.remove();
    },
  };
}
