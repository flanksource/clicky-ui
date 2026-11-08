import { startPageAgent } from "../index.ts";
import { createRemoteReview } from "../../../host/review/index.ts";
import { validateAgentSelection } from "../../../host/message-values.ts";

const root = document.getElementById("root")!;
root.insertAdjacentHTML("beforeend", '<p id="outside">Outside the review root</p>');
const external = location.protocol === "file:";
const events: unknown[] = [];
const failure = (error: unknown) => { document.getElementById("error")!.textContent = String(error); };
const remote = createRemoteReview({ send: (message) => agent.receive(message), onState: () => undefined, onAction: () => undefined });
const agent = startPageAgent({ root, page: "reports/revenue.tsx", ...(external ? { sourceContext: { mode: "external-document" as const, url: location.href } } : {}), send(message) {
  if (message.type.startsWith("review-")) remote.receive(message);
  if (message.type === "selection") validateAgentSelection(message.selection);
  events.push(message); document.getElementById("events")!.textContent = JSON.stringify(events);
}, error: failure });

for (const [id, action] of Object.entries({
  show: () => remote.setVisibility({ visible: true, showRejected: false }),
  hide: () => remote.setVisibility({ visible: false, showRejected: false }),
  rejected: () => remote.setVisibility({ visible: true, showRejected: true }),
  select: () => remote.select("summary"),
  approve: () => remote.action({ id: "summary", action: "approved" }),
  export: () => remote.action({ id: "summary", action: "export" }),
  delete: () => remote.action({ id: "summary", action: "delete" }),
  pins: () => {
    agent.registerAnchor("registered-feedback", document.getElementById("target"));
    agent.receive({ type: "pins", anchors: [
      { anchor: '[data-review-id="summary"]', count: 1, locators: [] },
      { anchor: "#target", count: 2, locators: [] },
      { anchor: "#old-target", count: 1, locators: [{ kind: "css", selector: "#target" }] },
      { anchor: "registered-feedback", count: 1, locators: [] },
      { anchor: "#outside", count: 1, locators: [] },
      { anchor: "#orphaned", count: 1, locators: [] },
      { anchor: "__document__", count: 1, locators: [] },
    ] });
  },
  "move-target": () => root.append(document.getElementById("target")!),
  move: () => { document.getElementById("summary")!.style.transform = "translateY(50px)"; },
  remove: () => { document.getElementById("summary")!.remove(); },
  pick: () => agent.receive({ type: "pick" }),
  dispose: () => { agent.dispose(); remote.dispose(); },
})) document.getElementById(id)!.onclick = () => { void Promise.resolve().then(async () => { await action(); }).catch(failure); };
document.title = "REVIEW-READY";
