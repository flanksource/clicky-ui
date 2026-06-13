import { render } from "preact";
import { App } from "./App";
import "@flanksource/clicky-ui/styles.css";
import "./styles.css";

// react-rnd (used by ChatWindow's draggable frame) reads `process.env` in its
// drag logger; the browser has no `process`, so provide a minimal shim.
(globalThis as { process?: { env: Record<string, string> } }).process ??= { env: {} };

const root = document.getElementById("app");
if (!root) throw new Error("#app root not found");
render(<App />, root);
