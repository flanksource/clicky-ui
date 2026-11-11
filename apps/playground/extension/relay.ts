import { matchesBookmarkletParent } from "../src/bookmarklet/origin";
import { requestBackground } from "./messages";
import { relayTarget, type Activation } from "./settings";

// Framed by the grabber host on the page. Extension frames are exempt from the
// page's frame-src policy, so this page frames the playground panel and
// forwards the host<->panel messages unchanged; both ends still validate them.
async function start() {
  const ancestorOrigin = location.ancestorOrigins[0];
  const activation = await requestBackground<Activation | undefined>({ type: "activation" });
  if (activation?.backend !== "playground") throw new Error("The grabber was not activated with the playground backend on this tab");
  const { url, parentOrigin } = relayTarget({ target: new URLSearchParams(location.search).get("target"), ancestorOrigin, playground: activation.server, relayOrigin: location.origin });
  const frame = document.createElement("iframe");
  frame.title = "Playground comments";
  frame.src = url.href;
  document.body.replaceChildren(frame);
  window.addEventListener("focus", () => frame.focus());
  window.addEventListener("message", event => {
    if (event.source === window.parent && matchesBookmarkletParent({ expected: parentOrigin, received: event.origin }))
      frame.contentWindow?.postMessage(event.data, url.origin);
    else if (event.source === frame.contentWindow && event.origin === url.origin)
      // File documents have opaque origins and require a wildcard target.
      window.parent.postMessage(event.data, parentOrigin === "null" ? "*" : parentOrigin);
  });
}

start().catch((cause: unknown) => {
  const error = document.createElement("p");
  error.setAttribute("role", "alert");
  error.className = "error";
  error.textContent = `Playground grabber relay: ${cause instanceof Error ? cause.message : String(cause)}`;
  document.body.replaceChildren(error);
  throw cause;
});
