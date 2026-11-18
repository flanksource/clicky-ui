import { createBridge } from "../../../host/bridge.ts";

const frame = document.querySelector<HTMLIFrameElement>("iframe")!;
const output = document.getElementById("capture-result")!;
const error = document.getElementById("capture-error")!;
function report(value: Error) { error.textContent = value.message; }
const bridge = createBridge({
  target: frame.contentWindow!, origin: location.origin, session: "vocabulary-fixture", direction: "host",
  onMessage(envelope) {
    if (envelope.message.type === "status" && envelope.message.state === "ready") document.title = "VOCABULARY-READY";
  },
  onError: report,
});
document.getElementById("capture")!.onclick = () => {
  void bridge.request({ type: "capture-vocabulary" }, { timeoutMs: 60_000 }).then((envelope) => {
    if (envelope.message.type !== "vocabulary-previews") throw new Error(`unexpected capture reply ${envelope.message.type}`);
    output.textContent = JSON.stringify(envelope);
  }).catch(report);
};
window.addEventListener("pagehide", () => bridge.dispose(), { once: true });
