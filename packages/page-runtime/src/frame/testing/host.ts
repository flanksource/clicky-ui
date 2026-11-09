import { createBridge } from "../../host/bridge.ts";
import type { FrameMessage, HostMessage, RuntimeError } from "../../schema.ts";
import { createRemoteReview } from "../../host/review/index.ts";

type CaseConfig = { origin: string; open: Extract<HostMessage, { type: "open" }>; name: string };
const config = await (await fetch(`/case.json${location.search}`)).json() as CaseConfig;
const frame = document.createElement("iframe"); frame.sandbox.add("allow-scripts", "allow-same-origin", "allow-modals"); document.body.append(frame);
const states: string[] = [];
const errors: RuntimeError[] = [];
const started = performance.now();
const result = document.createElement("pre"); result.id = "result"; document.body.append(result);
const session = crypto.randomUUID();
const agentEvents: FrameMessage[] = [];
const activityEvents: FrameMessage[] = [];
const activityOutput = document.createElement("pre"); activityOutput.id = "activity"; activityOutput.hidden = true; document.body.append(activityOutput);
const reload = document.createElement("button"); reload.id = "reload"; reload.textContent = "Reload page"; reload.onclick = () => bridge.send({ type: "reload" }); document.body.append(reload);
let opened = false;
const bridge = createBridge({ target: frame.contentWindow!, origin: config.origin, session, direction: "host", onMessage: (envelope) => { void receive(envelope.message as FrameMessage); }, onError: (error) => { result.textContent = JSON.stringify({ failure: error.message }); document.title = "CASE-DONE"; } });
const review = createRemoteReview({ send: (message) => bridge.send(message), onState: () => undefined, onAction: () => undefined });
async function receive(message: FrameMessage) {
  if (message.type.startsWith("review-")) review.receive(message);
  if (message.type === "activity") { activityEvents.push(message); activityOutput.textContent = JSON.stringify(activityEvents); }
  agentEvents.push(message);
  const events = document.getElementById("events");
  if (events) events.textContent = JSON.stringify(agentEvents);
  if (message.type === "status") {
    states.push(message.state);
    if (message.state === "connecting" || (message.state === "booting" && !opened)) { opened = true; bridge.send(config.open); return; }
    if (message.state === "booting") { bridge.send({ type: "theme", theme: "dark", density: "compact" }); bridge.send({ type: "data", data: "Report" }); }
    if (message.state === "ready") {
      // A rejected export is the case result; otherwise the host would wait for CASE-DONE until the test times out.
      try {
        const snapshot = await bridge.request({ type: "export", format: "html" });
        result.textContent = JSON.stringify({ states, errors, elapsed: performance.now() - started, snapshot: snapshot.message });
      } catch (error) { result.textContent = JSON.stringify({ states, errors, failure: String(error) }); }
      document.title = "CASE-DONE";
    }
  }
  if (message.type === "error") {
    errors.push(message.error); result.textContent = JSON.stringify({ states, errors }); document.title = "CASE-DONE";
  }
}
if (config.name === "agent" || config.name === "review") {
  const button = document.createElement("button"); button.id = "pick"; button.textContent = "Pick";
  button.onclick = () => bridge.send({ type: "pick" }); document.body.append(button);
  const events = document.createElement("pre"); events.id = "events"; document.body.append(events);
}
if (config.name === "review") {
  for (const [id, action] of Object.entries({
    "review-show": () => review.setVisibility({ visible: true, showRejected: false }),
    "review-list": () => review.list(),
    "review-select": () => review.select("summary"),
    "review-export": () => review.action({ id: "summary", action: "export" }),
  })) {
    const button = document.createElement("button"); button.id = id; button.textContent = id;
    button.onclick = () => { void action().catch((error: unknown) => { result.textContent = JSON.stringify({ failure: String(error) }); }); };
    document.body.append(button);
  }
}
frame.src = `${config.origin}/frame/${config.open.page}?case=${encodeURIComponent(config.name)}#${new URLSearchParams({ host: location.origin, session })}`;
