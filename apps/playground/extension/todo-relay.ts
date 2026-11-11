import { matchesBookmarkletParent } from "../src/bookmarklet/origin";
import { requestBackground } from "./messages";
import type { Activation } from "./settings";
import { forwardToFrame, forwardToParent, todoRelayTarget } from "./todo-relay-target";

// Framed by the grabber host on the page. Extension frames are exempt from the
// page's frame-src policy, so this page frames the gavel dashboard's embed
// new-todo form and forwards the form's `gavel-react-grab` messages. The form
// treats its direct parent (this page, found through ancestorOrigins) as the
// only peer: it posts `embed-ready` and its outcome to this page's origin and
// accepts the screenshot `attachment` only from this window and origin. So the
// page world never talks to the form: it posts the attachment (a Blob, by
// structured clone) here, and this page posts it on to the form from its own
// origin. Both directions let only those messages through.
async function start() {
  const ancestorOrigin = location.ancestorOrigins[0];
  const activation = await requestBackground<Activation | undefined>({ type: "activation" });
  if (activation?.backend !== "gavel") throw new Error("The grabber was not activated with the gavel backend on this tab");
  const params = new URLSearchParams(location.search);
  const { url, parentOrigin } = todoRelayTarget({ target: params.get("target"), parentOrigin: params.get("parentOrigin"), ancestorOrigin, server: activation.server });
  const frame = document.createElement("iframe");
  frame.title = "Gavel todo";
  frame.src = url.href;
  window.addEventListener("focus", () => frame.focus());
  window.addEventListener("message", event => {
    if (event.source === window.parent && matchesBookmarkletParent({ expected: parentOrigin, received: event.origin })) {
      if (forwardToFrame(event.data)) frame.contentWindow?.postMessage(event.data, url.origin);
    } else if (event.source === frame.contentWindow && event.origin === url.origin) {
      // File documents have opaque origins and require a wildcard target.
      if (forwardToParent(event.data)) window.parent.postMessage(event.data, parentOrigin === "null" ? "*" : parentOrigin);
    }
  });
  document.body.replaceChildren(frame);
}

start().catch((cause: unknown) => {
  const error = document.createElement("p");
  error.setAttribute("role", "alert");
  error.className = "error";
  error.textContent = `Gavel todo relay: ${cause instanceof Error ? cause.message : String(cause)}`;
  document.body.replaceChildren(error);
  throw cause;
});
