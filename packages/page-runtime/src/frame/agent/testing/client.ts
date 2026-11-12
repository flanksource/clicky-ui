import "../../../frame/devtools-hook.ts";
import { createElement, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { useCommentAnchorActionsOptional } from "@flanksource/clicky-ui/comments";
import { startPageAgent } from "../index.ts";
import { PageAgentProvider } from "../provider.tsx";
import type { AgentFrameMessage, AgentSelection } from "../../../schema.ts";
import Callsite from "./callsite.tsx";
import ModalPage from "./modal.tsx";
import { StatCard } from "./library.ts";
import { exportHtml } from "../../export.ts";
import { createBridge } from "../../../host/bridge.ts";
import VocabularyPage from "./vocabulary.tsx";

const root = document.getElementById("root")!;
const events: AgentFrameMessage[] = [];
let selected: AgentSelection | undefined;
const external = location.search.includes("external");
const vocabulary = location.search.includes("vocabulary");
const agent = startPageAgent({ root, page: "report.tsx", ...(external ? { sourceContext: { mode: "external-document" as const, url: location.href } } : {}), send(message) {
  events.push(message);
  if (message.type === "selection") selected = message.selection;
  document.getElementById("events")!.textContent = JSON.stringify(events);
}, error(error) { document.getElementById("error")!.textContent = error.message; } });

function Registered() {
  const actions = useCommentAnchorActionsOptional();
  useLayoutEffect(() => {
    const element = document.getElementById("registered")!;
    actions!.registerAnchor("revenue.total", element);
    return () => actions!.registerAnchor("revenue.total", null);
  }, [actions]);
  return createElement("p", { id: "registered", "data-source": "report.tsx:15:3" }, "Registered total");
}
function Page() {
  return createElement("main", { "data-source": "report.tsx:8:3", id: "owner" },
    createElement(StatCard), createElement(Registered));
}
const vocabularyBridge = vocabulary ? createBridge({
  target: window.parent, origin: location.origin, session: "vocabulary-fixture", direction: "frame",
  onMessage(envelope) {
    if (envelope.message.type !== "capture-vocabulary") throw new Error(`unexpected vocabulary message ${envelope.message.type}`);
    const re = envelope.id;
    if (!re) throw new Error("vocabulary capture requires a request id");
    void agent.captureVocabulary({ ready: document.title === "VOCABULARY-READY" }).then((message) => {
      vocabularyBridge!.send(message, { re });
    });
  },
  onError(error) { document.getElementById("error")!.textContent = error.message; },
}) : undefined;
function vocabularyReady() {
  const shadow = document.querySelector("[data-page-agent]")!.shadowRoot!;
  const marker = document.createElement("div");
  marker.setAttribute("data-vocabulary-preview", "overlay-only");
  shadow.append(marker);
  requestAnimationFrame(() => {
    document.title = "VOCABULARY-READY";
    vocabularyBridge!.send({ type: "status", state: "ready" });
  });
}
if (external) root.innerHTML = '<main id="owner"><h2 id="target">Ordinary HTML report</h2></main>';
else if (vocabulary) createRoot(root).render(createElement(PageAgentProvider, { agent, children: createElement(VocabularyPage, { onReady: vocabularyReady }) }));
else createRoot(root).render(createElement(PageAgentProvider, { agent, children: createElement(location.search.includes("callsite") ? Callsite : location.search.includes("modal") ? ModalPage : Page) }));
document.getElementById("pick")!.onclick = () => agent.receive({ type: "pick" });
document.getElementById("pins")!.onclick = () => {
  if (!selected) throw new Error("fixture requires a selection");
  agent.receive({ type: "pins", anchors: [{ anchor: selected.anchor, count: 2, locators: selected.element.locators }] });
};
document.getElementById("move")!.onclick = () => { document.getElementById("owner")!.id = "relocated"; };
document.getElementById("remove")!.onclick = () => { document.getElementById("relocated")!.remove(); };
document.getElementById("modal-move")!.onclick = () => { document.querySelector<HTMLElement>('[role="dialog"] h2')!.style.transform = "translateY(30px)"; };
document.getElementById("modal-remove")!.onclick = () => { document.querySelector('[role="dialog"]')!.remove(); };
document.getElementById("registered-pin")!.onclick = () => agent.receive({ type: "pins", anchors: [{ anchor: "revenue.total", count: 1, locators: [] }] });
document.getElementById("highlight")!.onclick = () => agent.receive({ type: "highlight", anchor: "revenue.total" });
document.getElementById("scroll")!.onclick = () => agent.receive({ type: "scroll", anchor: "revenue.total", behavior: "instant", block: "start" });
document.getElementById("page")!.onclick = () => agent.receive({ type: "page" });
document.getElementById("export")!.onclick = () => { void exportHtml().then((html) => { document.getElementById("snapshot")!.textContent = html; }); };
document.getElementById("dispose")!.onclick = () => agent.dispose();
document.getElementById("inspect")!.onclick = () => {
  const overlay = document.querySelector("[data-page-agent]");
  const pin = overlay?.shadowRoot?.querySelector("button");
  const highlight = overlay?.shadowRoot?.querySelector<HTMLElement>(".highlight");
  const rect = pin?.getBoundingClientRect();
  document.getElementById("inspection")!.textContent = JSON.stringify({
    pins: overlay?.shadowRoot?.querySelectorAll("button").length ?? 0,
    pinColor: pin ? getComputedStyle(pin).backgroundColor : null,
    lightPins: root.querySelectorAll("button").length,
    overlayInRoot: root.contains(overlay),
    highlighted: highlight ? !highlight.hidden : false,
    position: rect ? { left: rect.left + rect.width / 2, top: rect.top + rect.height / 2 } : null,
    overlay: Boolean(overlay),
  });
};
document.getElementById("focus-pin")!.onclick = () => {
  const pin = document.querySelector("[data-page-agent]")?.shadowRoot?.querySelector("button");
  if (!pin) throw new Error("fixture requires a pin");
  pin.click();
};
document.title = "AGENT-READY";
