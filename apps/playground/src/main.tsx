import { createRoot } from "react-dom/client";
import { ErrorWrapper, setFallbackIconProvider } from "@flanksource/clicky-ui";
import { clickyIconProvider } from "@flanksource/clicky-ui/icons";
import { App } from "./App";
import "@flanksource/clicky-ui/styles.css";
import "./styles.css";

// Schema-driven surfaces carry icons as runtime strings (x-enum-icons, x-icon,
// <Icon name="...">), which no import can resolve. Registering this package's
// own generated set is what turns those names into glyphs instead of `?`.
setFallbackIconProvider(clickyIconProvider());

// react-rnd (used by ChatWindow's draggable frame) reads `process.env` in its
// drag logger; the browser has no `process`, so provide a minimal shim.
(globalThis as { process?: { env: Record<string, string> } }).process ??= {
  env: {},
};

// Hover any element and press ⌘C to copy it — plus its React component stack and
// source location — as context for a coding agent. Dev only; do not remove the
// guard, it is what keeps react-grab out of the production bundle.
if (import.meta.env.DEV) {
  void import("react-grab");
}

const root = document.getElementById("app");
if (!root) throw new Error("#app root not found");
createRoot(root).render(
  <ErrorWrapper>
    <App />
  </ErrorWrapper>,
);
